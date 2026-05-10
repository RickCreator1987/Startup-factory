/**
 * Example: DeFi Protocol Integration
 * Demonstrates how to integrate the SDK with a DeFi protocol
 * @package @solana-zk-kyc/sdk
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { createSDK } from '../src/index';

/**
 * DeFi Protocol using the SDK
 */
class DeFiProtocol {
  private sdk: ReturnType<typeof createSDK>;
  private whitelistedUsers: Set<string> = new Set();

  constructor(sdk: ReturnType<typeof createSDK>) {
    this.sdk = sdk;
  }

  /**
   * User registration flow with KYC
   */
  async registerUser(
    walletAddress: string,
    userData: {
      fullName: string;
      email: string;
      dateOfBirth: string;
      nationality: string;
      countryOfResidence: string;
    }
  ): Promise<RegistrationResult> {
    // Check if already registered
    if (this.whitelistedUsers.has(walletAddress)) {
      return {
        success: true,
        message: 'User already registered',
        tier: 'EXISTING_USER',
      };
    }

    // Verify identity
    const verification = await this.sdk.verifyIdentity({
      provider: 'persona',
      walletAddress,
      tier: 'ENHANCED',
      requirements: {
        requireIdentityDocs: true,
        requireSelfie: true,
        requireAddressProof: true,
        minimumAge: 18,
      },
      metadata: userData,
    });

    if (verification.status !== 'VERIFIED') {
      return {
        success: false,
        message: 'Identity verification failed',
        error: verification.errorMessage,
      };
    }

    // Check compliance status
    const compliance = await this.sdk.checkCompliance(new PublicKey(walletAddress));

    if (!compliance.isCompliant) {
      return {
        success: false,
        message: 'User does not meet compliance requirements',
      };
    }

    // Add to whitelist
    this.whitelistedUsers.add(walletAddress);

    return {
      success: true,
      message: 'Registration successful',
      tier: compliance.level,
      expiresAt: compliance.expiresAt,
    };
  }

  /**
   * Check if user can access protocol
   */
  async checkAccess(walletAddress: string): Promise<AccessCheckResult> {
    const compliance = await this.sdk.checkCompliance(new PublicKey(walletAddress));

    return {
      hasAccess: compliance.isCompliant,
      complianceLevel: compliance.level,
      verificationStatus: compliance.verificationStatus,
      expiresAt: compliance.expiresAt,
    };
  }

  /**
   * Grant tiered access based on compliance level
   */
  async getTieredAccess(walletAddress: string): Promise<TieredAccess> {
    const compliance = await this.sdk.checkCompliance(new PublicKey(walletAddress));

    const tiers: Record<string, TierConfig> = {
      BASIC: {
        canTrade: true,
        canBorrow: false,
        canStake: false,
        maxTransaction: 1000,
      },
      ENHANCED: {
        canTrade: true,
        canBorrow: true,
        canStake: true,
        maxTransaction: 100000,
      },
      ACCREDITED_INVESTOR: {
        canTrade: true,
        canBorrow: true,
        canStake: true,
        maxTransaction: Infinity,
      },
    };

    return {
      tier: compliance.level,
      config: tiers[compliance.level] || tiers.BASIC,
    };
  }
}

/**
 * Registration result
 */
interface RegistrationResult {
  success: boolean;
  message: string;
  tier?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * Access check result
 */
interface AccessCheckResult {
  hasAccess: boolean;
  complianceLevel: string;
  verificationStatus: string;
  expiresAt: number;
}

/**
 * Tier configuration
 */
interface TierConfig {
  canTrade: boolean;
  canBorrow: boolean;
  canStake: boolean;
  maxTransaction: number;
}

/**
 * Tiered access result
 */
interface TieredAccess {
  tier: string;
  config: TierConfig;
}

/**
 * Example usage
 */
async function main() {
  const sdk = createSDK({
    connection: new Connection('https://api.devnet.solana.com'),
    walletAdapter: {
      publicKey: new PublicKey('ExampleWallet11111111111111111111111111'),
      connected: true,
      name: 'Example',
      connect: async () => {},
      disconnect: async () => {},
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
      signMessage: async (msg) => new Uint8Array(64),
      on: () => {},
      off: () => {},
    } as any,
    oraclePublicKey: new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V'),
    trustedOracles: [new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V')],
    enableMLRiskAssessment: true,
  });

  await sdk.initialize();

  const protocol = new DeFiProtocol(sdk);

  // Register a new user
  const result = await protocol.registerUser(
    'UserWallet1111111111111111111111111111',
    {
      fullName: 'Alice Johnson',
      email: 'alice@example.com',
      dateOfBirth: '1990-05-15',
      nationality: 'US',
      countryOfResidence: 'US',
    }
  );

  console.log('Registration result:', result);

  // Check access
  const access = await protocol.checkAccess('UserWallet1111111111111111111111111111');
  console.log('Access check:', access);

  // Get tiered access
  const tierAccess = await protocol.getTieredAccess('UserWallet1111111111111111111111111111');
  console.log('Tiered access:', tierAccess);
}

main().catch(console.error);
