/**
 * Main SDK Class - Solana ZK-KYC Compliance SDK
 * @package @solana-zk-kyc/sdk
 */

import type {
  Connection,
  PublicKey,
} from '@solana/web3.js';

import type {
  SDKConfig,
  VerificationParams,
  VerificationResult,
  ComplianceResult,
  ComplianceLevel,
  SupportedLanguage,
  ReportParams,
  VerificationStatus,
} from './types/index';

import type { VerifiableCredential } from './types/identity';

import type { ZKProofData } from './types/blockchain';

import type { ComplianceReport, RiskAssessment } from './types/compliance';

import { IdentityManager } from './core/identity/manager';

import { createEncryptionUtils } from './core/encryption/crypto';

import { createRiskEngine } from './core/risk/engine';

import { ZKProofGenerator } from './core/zk/proofs';

import { AnchorProgramClient } from './blockchain/anchor/program';

import { createKYCProvider, type KYCProvider } from './providers/kyc/base';

import { createComplianceReporter, type OrganizationInfo } from './providers/compliance/reporter';

import { createTemplateRegistry, TemplateRegistry, type TemplateUserData } from './templates/registry';

import { translations, type TranslationKey } from './utils/i18n';

/**
 * Main SDK Class
 */
export class SolanaZKYCSDK {
  private config: SDKConfig;
  private connection: Connection;
  private identityManager: IdentityManager;
  private riskEngine: ReturnType<typeof createRiskEngine>;
  private zkProofGenerator: ZKProofGenerator;
  private anchorClient: AnchorProgramClient | null = null;
  private kycProvider: KYCProvider | null = null;
  private complianceReporter: ReturnType<typeof createComplianceReporter> | null = null;
  private templateRegistry: TemplateRegistry;
  private currentLanguage: SupportedLanguage;
  private initialized: boolean = false;

  /**
   * Create SDK instance
   * @param config - SDK configuration
   */
  constructor(config: SDKConfig) {
    this.config = config;
    this.connection = config.connection;
    this.currentLanguage = config.defaultLanguage || 'en';

    // Initialize core modules
    this.identityManager = new IdentityManager();
    this.riskEngine = createRiskEngine();
    this.zkProofGenerator = new ZKProofGenerator(config.merkleTreeDepth || 20);
    this.templateRegistry = createTemplateRegistry();

    // Initialize encryption if key provided
    if (config.encryptionKey) {
      const encryption = createEncryptionUtils(config.encryptionKey);
    }
  }

  /**
   * Initialize the SDK
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize Anchor client
    this.anchorClient = new AnchorProgramClient(
      this.connection,
      this.config.oraclePublicKey,
      this.config.oraclePublicKey
    );

    // Initialize KYC provider if configured
    if (this.config.identityProvider) {
      this.kycProvider = createKYCProvider(
        this.config.identityProvider.provider,
        {
          apiKey: this.config.identityProvider.apiKey,
          baseUrl: this.config.identityProvider.baseUrl,
        }
      );
    }

    // Initialize compliance reporter if auto-reporting enabled
    if (this.config.enableAutoReporting) {
      const orgInfo: OrganizationInfo = {
        name: 'SDK Organization',
        taxId: '00-0000000',
        contact: 'compliance@example.com',
      };
      this.complianceReporter = createComplianceReporter(
        orgInfo,
        this.config.encryptionKey
      );
    }

    this.initialized = true;
  }

  /**
   * Verify user identity
   * @param params - Verification parameters
   * @returns Verification result
   */
  public async verifyIdentity(params: VerificationParams): Promise<VerificationResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const {
      provider,
      walletAddress,
      tier,
      requirements,
      metadata,
    } = params;

    // Create user data from params
    const userData = this.createUserDataFromParams(params);

    // Initialize KYC session
    let session;
    if (this.kycProvider) {
      session = await this.kycProvider.initiateVerification(userData);
    } else {
      // Mock session for demo
      session = {
        sessionId: `mock_${Date.now()}`,
        userId: walletAddress,
        walletAddress,
        provider: provider || 'mock',
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Evaluate template if specified
    const templateData: TemplateUserData = {
      walletAddress,
      dateOfBirth: userData.dateOfBirth,
      countryOfResidence: userData.countryOfResidence,
      nationality: userData.nationality,
    };

    // Check risk if enabled
    let riskScore: number | undefined;
    if (this.config.enableMLRiskAssessment) {
      const riskAssessment = await this.riskEngine.assessRisk(walletAddress);
      riskScore = riskAssessment.riskScore;
      templateData.riskScore = riskScore;
    }

    // Generate DID for the user
    const did = `did:solana:${walletAddress}`;
    const didDocument = this.identityManager.createDID(walletAddress);

    // Mock verification completion (in production, wait for provider callback)
    const verificationResult: VerificationResult = {
      status: 'VERIFIED',
      verificationId: session.sessionId,
      complianceLevel: tier,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      credential: undefined,
    };

    // Issue verifiable credential
    const oracleDID = `did:solana:${this.config.oraclePublicKey.toString()}`;
    const credential = this.identityManager.issueCredential(
      oracleDID,
      did,
      [
        { key: 'complianceLevel', value: tier },
        { key: 'verifiedAt', value: new Date().toISOString(), type: 'string' },
        { key: 'riskScore', value: riskScore?.toString() || '0', type: 'number' },
      ]
    );

    verificationResult.credential = credential;

    // Generate ZK proof
    try {
      const proofData = await this.zkProofGenerator.generateProof(credential, walletAddress);
      verificationResult.proofData = proofData;

      // Submit proof to blockchain if client available
      if (this.anchorClient) {
        const walletPublicKey = new PublicKey(walletAddress);
        await this.anchorClient.registerCompliance(
          walletPublicKey,
          proofData,
          tier
        );
      }
    } catch (error) {
      console.warn('ZK proof generation failed, verification still valid:', error);
    }

    // Log audit event
    if (this.complianceReporter) {
      this.complianceReporter.logAuditEvent({
        eventType: 'VERIFICATION_COMPLETE',
        walletAddress,
        data: {
          status: verificationResult.status,
          complianceLevel: tier,
          verificationId: session.sessionId,
          riskScore,
        },
      });
    }

    return verificationResult;
  }

  /**
   * Get verification status for a wallet
   * @param wallet - Wallet public key
   * @returns Compliance result
   */
  public async getVerificationStatus(wallet: PublicKey): Promise<ComplianceResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.anchorClient) {
      return {
        isCompliant: false,
        level: 'BASIC',
        verificationStatus: 'PENDING',
        lastVerified: 0,
        expiresAt: 0,
      };
    }

    const entry = await this.anchorClient.checkComplianceStatus(wallet);

    if (!entry) {
      return {
        isCompliant: false,
        level: 'BASIC',
        verificationStatus: 'PENDING',
        lastVerified: 0,
        expiresAt: 0,
      };
    }

    const now = Date.now();
    const isExpired = entry.expiresAt < now;

    return {
      isCompliant: !isExpired && entry.status === 'VERIFIED',
      level: entry.complianceLevel as ComplianceLevel,
      verificationStatus: entry.status as VerificationStatus,
      lastVerified: entry.verifiedAt,
      expiresAt: entry.expiresAt,
      riskScore: entry.riskScore,
    };
  }

  /**
   * Generate ZK proof for a credential
   * @param credential - Verifiable credential
   * @returns ZK proof data
   */
  public async generateZKProof(
    credential: VerifiableCredential,
    walletAddress: string
  ): Promise<ZKProofData> {
    return this.zkProofGenerator.generateProof(credential, walletAddress);
  }

  /**
   * Submit proof to blockchain
   * @param proof - ZK proof data
   * @returns Transaction signature
   */
  public async submitProof(proof: ZKProofData): Promise<string> {
    if (!this.anchorClient) {
      throw new Error('Anchor client not initialized');
    }

    const wallet = proof.publicSignals[1] ? new PublicKey(proof.publicSignals[1]) : new PublicKey(this.config.oraclePublicKey);

    return this.anchorClient.submitProof(wallet, proof);
  }

  /**
   * Check compliance for a wallet
   * @param wallet - Wallet public key
   * @returns Compliance result
   */
  public async checkCompliance(wallet: PublicKey): Promise<ComplianceResult> {
    return this.getVerificationStatus(wallet);
  }

  /**
   * Generate compliance report
   * @param params - Report parameters
   * @returns Compliance report
   */
  public async generateReport(params: ReportParams): Promise<ComplianceReport> {
    if (!this.complianceReporter) {
      throw new Error('Compliance reporting not enabled');
    }

    return this.complianceReporter.generateReport(params);
  }

  /**
   * Assess risk for a wallet
   * @param walletAddress - Wallet address
   * @returns Risk assessment
   */
  public async assessRisk(walletAddress: string): Promise<RiskAssessment> {
    return this.riskEngine.assessRisk(walletAddress);
  }

  /**
   * Evaluate compliance template
   * @param templateId - Template ID
   * @param userData - User data
   * @returns Template evaluation result
   */
  public evaluateTemplate(
    templateId: string,
    userData: TemplateUserData
  ): import('./templates/registry').TemplateEvaluation {
    return this.templateRegistry.evaluateTemplate(templateId, userData);
  }

  /**
   * Set language for internationalization
   * @param lang - Language code
   */
  public setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(translations) as SupportedLanguage[];
  }

  /**
   * Get translation for a key
   * @param key - Translation key
   * @param params - Interpolation parameters
   * @returns Translated string
   */
  public t(key: TranslationKey, params?: Record<string, string>): string {
    const translation = translations[this.currentLanguage]?.[key]
      || translations.en[key]
      || key;

    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(new RegExp(`{${k}}`, 'g'), v),
        translation
      );
    }

    return translation;
  }

  /**
   * Get template registry
   */
  public getTemplateRegistry(): TemplateRegistry {
    return this.templateRegistry;
  }

  /**
   * Get identity manager
   */
  public getIdentityManager(): IdentityManager {
    return this.identityManager;
  }

  /**
   * Get risk engine
   */
  public getRiskEngine(): ReturnType<typeof createRiskEngine> {
    return this.riskEngine;
  }

  /**
   * Create user data from verification params
   */
  private createUserDataFromParams(params: VerificationParams): import('./types/identity').UserData {
    return {
      fullName: params.metadata?.fullName as string || 'Unknown',
      dateOfBirth: params.metadata?.dateOfBirth as string || '1990-01-01',
      nationality: params.metadata?.nationality as string || 'US',
      countryOfResidence: params.metadata?.countryOfResidence as string || 'US',
      email: params.metadata?.email as string | undefined,
      walletAddress: params.walletAddress,
    };
  }

  /**
   * Check if initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get SDK version
   */
  public getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Create SDK instance
 */
export function createSDK(config: SDKConfig): SolanaZKYCSDK {
  return new SolanaZKYCSDK(config);
}

/**
 * Default export
 */
export default SolanaZKYCSDK;
