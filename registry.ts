/**
 * Trust Templates - Modular compliance templates
 * @package @solana-zk-kyc/sdk
 */

import type {
  ComplianceTemplate,
  ComplianceRule,
  TemplateEvaluation,
  FailedRule,
} from '../../types/compliance';
import type { ComplianceLevel, VerificationRequirements } from '../../types/index';

/**
 * Template Registry - Manages compliance templates
 */
export class TemplateRegistry {
  private templates: Map<string, ComplianceTemplate> = new Map();

  /**
   * Initialize with default templates
   */
  constructor() {
    this.registerDefaultTemplates();
  }

  /**
   * Register default templates
   */
  private registerDefaultTemplates(): void {
    this.registerTemplate(createUSAccreditedTemplate());
    this.registerTemplate(createGlobalBasicTemplate());
    this.registerTemplate(createDeFiStandardTemplate());
    this.registerTemplate(createNFTMarketplaceTemplate());
    this.registerTemplate(createExchangeStandardTemplate());
  }

  /**
   * Register a template
   */
  public registerTemplate(template: ComplianceTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get template by ID
   */
  public getTemplate(templateId: string): ComplianceTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all templates
   */
  public getAllTemplates(): ComplianceTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Evaluate template against user data
   */
  public evaluateTemplate(
    templateId: string,
    userData: TemplateUserData
  ): TemplateEvaluation {
    const template = this.getTemplate(templateId);
    if (!template) {
      return {
        passed: false,
        failedRules: [{
          ruleId: 'template_not_found',
          ruleName: 'Template Not Found',
          reason: `Template ${templateId} not found`,
          severity: 'ERROR',
        }],
        passedRules: [],
        score: 0,
        timestamp: Date.now(),
      };
    }

    return this.evaluate(template, userData);
  }

  /**
   * Evaluate template against user data
   */
  private evaluate(
    template: ComplianceTemplate,
    userData: TemplateUserData
  ): TemplateEvaluation {
    const passedRules: string[] = [];
    const failedRules: FailedRule[] = [];
    let score = 100;

    for (const rule of template.rules) {
      if (!rule.enabled) {
        continue;
      }

      const result = this.evaluateRule(rule, userData);

      if (result.passed) {
        passedRules.push(rule.id);
      } else {
        failedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          reason: result.reason,
          severity: result.severity,
        });
        score -= result.penalty;
      }
    }

    return {
      passed: failedRules.length === 0,
      failedRules,
      passedRules,
      score: Math.max(0, score),
      timestamp: Date.now(),
    };
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(
    rule: ComplianceRule,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    switch (rule.type) {
      case 'AGE_VERIFICATION':
        return this.evaluateAgeRule(rule.config, userData);
      case 'COUNTRY_RESTRICTION':
        return this.evaluateCountryRule(rule.config, userData);
      case 'DOCUMENT_VERIFICATION':
        return this.evaluateDocumentRule(rule.config, userData);
      case 'ACCREDITATION_CHECK':
        return this.evaluateAccreditationRule(rule.config, userData);
      case 'AML_SCREENING':
        return this.evaluateAMLClearance(rule.config, userData);
      case 'RISK_THRESHOLD':
        return this.evaluateRiskThreshold(rule.config, userData);
      case 'WHITELIST':
        return this.evaluateWhitelist(rule.config, userData);
      case 'BLACKLIST':
        return this.evaluateBlacklist(rule.config, userData);
      default:
        return { passed: true, reason: 'Unknown rule type', severity: 'WARNING', penalty: 0 };
    }
  }

  /**
   * Evaluate age rule
   */
  private evaluateAgeRule(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    if (!config.minimumAge || !userData.dateOfBirth) {
      return { passed: true, reason: 'No age check required', severity: 'WARNING', penalty: 0 };
    }

    const age = this.calculateAge(userData.dateOfBirth);

    if (age < config.minimumAge) {
      return {
        passed: false,
        reason: `Age ${age} is below minimum required ${config.minimumAge}`,
        severity: 'ERROR',
        penalty: 100,
      };
    }

    return { passed: true, reason: 'Age verified', severity: 'WARNING', penalty: 0 };
  }

  /**
   * Evaluate country restriction rule
   */
  private evaluateCountryRule(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    const country = userData.countryOfResidence;

    if (!country) {
      return {
        passed: false,
        reason: 'Country of residence not provided',
        severity: 'ERROR',
        penalty: 50,
      };
    }

    // Check restricted countries
    if (config.restrictedCountries?.includes(country)) {
      return {
        passed: false,
        reason: `Country ${country} is restricted`,
        severity: 'ERROR',
        penalty: 100,
      };
    }

    // Check required countries
    if (config.requiredCountries && config.requiredCountries.length > 0) {
      if (!config.requiredCountries.includes(country)) {
        return {
          passed: false,
          reason: `Country ${country} is not in allowed list`,
          severity: 'ERROR',
          penalty: 100,
        };
      }
    }

    return { passed: true, reason: 'Country verified', severity: 'WARNING', penalty: 0 };
  }

  /**
   * Evaluate document verification rule
   */
  private evaluateDocumentRule(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    if (!config.requiredDocuments || config.requiredDocuments.length === 0) {
      return { passed: true, reason: 'No document check required', severity: 'WARNING', penalty: 0 };
    }

    const hasDocuments = userData.documentsVerified || false;

    if (!hasDocuments) {
      return {
        passed: false,
        reason: 'Required documents not verified',
        severity: 'ERROR',
        penalty: 80,
      };
    }

    return { passed: true, reason: 'Documents verified', severity: 'WARNING', penalty: 0 };
  }

  /**
   * Evaluate accreditation rule
   */
  private evaluateAccreditationRule(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    if (!config.requireAccreditation) {
      return { passed: true, reason: 'No accreditation check required', severity: 'WARNING', penalty: 0 };
    }

    const isAccredited = userData.isAccreditedInvestor || false;

    if (!isAccredited) {
      return {
        passed: false,
        reason: 'User is not an accredited investor',
        severity: 'ERROR',
        penalty: 100,
      };
    }

    return { passed: true, reason: 'Accreditation verified', severity: 'WARNING', penalty: 0 };
  }

  /**
   * Evaluate AML clearance
   */
  private evaluateAMLClearance(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    if (!config.requireAMLScreening) {
      return { passed: true, reason: 'No AML check required', severity: 'WARNING', penalty: 0 };
    }

    const cleared = userData.amlCleared || false;

    if (!cleared) {
      return {
        passed: false,
        reason: 'AML screening not completed or failed',
        severity: 'ERROR',
        penalty: 100,
      };
    }

    return { passed: true, reason: 'AML cleared', severity: 'WARNING', penalty: 0 };
  }

  /**
   * Evaluate risk threshold
   */
  private evaluateRiskThreshold(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    if (!config.maxRiskScore) {
      return { passed: true, reason: 'No risk check required', severity: 'WARNING', penalty: 0 };
    }

    const riskScore = userData.riskScore ?? 0;

    if (riskScore > config.maxRiskScore) {
      return {
        passed: false,
        reason: `Risk score ${riskScore} exceeds maximum ${config.maxRiskScore}`,
        severity: 'ERROR',
        penalty: Math.min(100, riskScore),
      };
    }

    return { passed: true, reason: 'Risk within threshold', severity: 'WARNING', penalty: 0 };
  }

  /**
   * Evaluate whitelist
   */
  private evaluateWhitelist(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    if (!config.whitelist || config.whitelist.length === 0) {
      return { passed: true, reason: 'No whitelist', severity: 'WARNING', penalty: 0 };
    }

    const walletAddress = userData.walletAddress;

    if (config.whitelist.includes(walletAddress)) {
      return { passed: true, reason: 'On whitelist', severity: 'WARNING', penalty: 0 };
    }

    return {
      passed: false,
      reason: 'Not on whitelist',
      severity: 'ERROR',
      penalty: 100,
    };
  }

  /**
   * Evaluate blacklist
   */
  private evaluateBlacklist(
    config: import('../../types/compliance').RuleConfig,
    userData: TemplateUserData
  ): RuleEvaluationResult {
    if (!config.blacklist || config.blacklist.length === 0) {
      return { passed: true, reason: 'No blacklist', severity: 'WARNING', penalty: 0 };
    }

    const walletAddress = userData.walletAddress;

    if (config.blacklist.includes(walletAddress)) {
      return {
        passed: false,
        reason: 'On blacklist',
        severity: 'ERROR',
        penalty: 100,
      };
    }

    return { passed: true, reason: 'Not on blacklist', severity: 'WARNING', penalty: 0 };
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Create custom template
   */
  public createCustomTemplate(
    id: string,
    name: string,
    description: string,
    rules: ComplianceRule[]
  ): ComplianceTemplate {
    const template: ComplianceTemplate = {
      id,
      name,
      description,
      rules,
      defaultLevel: 'BASIC',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.registerTemplate(template);
    return template;
  }

  /**
   * Remove template
   */
  public removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }
}

/**
 * Template user data
 */
export interface TemplateUserData {
  /** Wallet address */
  walletAddress: string;
  /** Date of birth (ISO 8601) */
  dateOfBirth?: string;
  /** Country of residence (ISO 3166-1 alpha-2) */
  countryOfResidence?: string;
  /** Nationality */
  nationality?: string;
  /** Documents verified */
  documentsVerified?: boolean;
  /** Is accredited investor */
  isAccreditedInvestor?: boolean;
  /** AML cleared */
  amlCleared?: boolean;
  /** Risk score */
  riskScore?: number;
}

/**
 * Rule evaluation result
 */
export interface RuleEvaluationResult {
  passed: boolean;
  reason: string;
  severity: 'ERROR' | 'WARNING';
  penalty: number;
}

// Default Template Factories

function createUSAccreditedTemplate(): ComplianceTemplate {
  return {
    id: 'US_ACCREDITED',
    name: 'US Accredited Investor',
    description: 'Template for US accredited investor verification',
    rules: [
      {
        id: 'age_21',
        name: 'Minimum Age 21',
        description: 'User must be at least 21 years old',
        type: 'AGE_VERIFICATION',
        config: { minimumAge: 21 },
        enabled: true,
        priority: 1,
      },
      {
        id: 'accreditation',
        name: 'Accredited Investor Status',
        description: 'User must provide accredited investor documentation',
        type: 'ACCREDITATION_CHECK',
        config: { requireAccreditation: true },
        enabled: true,
        priority: 2,
      },
      {
        id: 'aml_screening',
        name: 'AML Screening',
        description: 'User must pass AML screening',
        type: 'AML_SCREENING',
        config: { requireAMLScreening: true },
        enabled: true,
        priority: 3,
      },
    ],
    defaultLevel: 'ACCREDITED_INVESTOR',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createGlobalBasicTemplate(): ComplianceTemplate {
  return {
    id: 'GLOBAL_BASIC',
    name: 'Global Basic KYC',
    description: 'Basic KYC template for global compliance',
    rules: [
      {
        id: 'age_18',
        name: 'Minimum Age 18',
        description: 'User must be at least 18 years old',
        type: 'AGE_VERIFICATION',
        config: { minimumAge: 18 },
        enabled: true,
        priority: 1,
      },
      {
        id: 'country_check',
        name: 'Country Restriction',
        description: 'Check against restricted countries',
        type: 'COUNTRY_RESTRICTION',
        config: {
          restrictedCountries: ['KP', 'IR', 'SY'],
        },
        enabled: true,
        priority: 2,
      },
      {
        id: 'document_verification',
        name: 'Document Verification',
        description: 'Government ID verification required',
        type: 'DOCUMENT_VERIFICATION',
        config: { requiredDocuments: ['PASSPORT', 'DRIVERS_LICENSE'] },
        enabled: true,
        priority: 3,
      },
    ],
    defaultLevel: 'BASIC',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createDeFiStandardTemplate(): ComplianceTemplate {
  return {
    id: 'DEFI_STANDARD',
    name: 'DeFi Standard',
    description: 'Standard compliance template for DeFi protocols',
    rules: [
      {
        id: 'age_18_defi',
        name: 'Minimum Age 18',
        description: 'User must be at least 18 years old',
        type: 'AGE_VERIFICATION',
        config: { minimumAge: 18 },
        enabled: true,
        priority: 1,
      },
      {
        id: 'country_defi',
        name: 'Country Restriction',
        description: 'Check against restricted countries',
        type: 'COUNTRY_RESTRICTION',
        config: {
          restrictedCountries: ['KP', 'IR', 'SY', 'CU', 'VN'],
        },
        enabled: true,
        priority: 2,
      },
      {
        id: 'risk_threshold_defi',
        name: 'Risk Threshold',
        description: 'Risk score must be below threshold',
        type: 'RISK_THRESHOLD',
        config: { maxRiskScore: 50 },
        enabled: true,
        priority: 3,
      },
      {
        id: 'aml_defi',
        name: 'AML Screening',
        description: 'Basic AML screening',
        type: 'AML_SCREENING',
        config: { requireAMLScreening: true },
        enabled: true,
        priority: 4,
      },
    ],
    defaultLevel: 'ENHANCED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createNFTMarketplaceTemplate(): ComplianceTemplate {
  return {
    id: 'NFT_MARKETPLACE',
    name: 'NFT Marketplace',
    description: 'Compliance template for NFT marketplaces',
    rules: [
      {
        id: 'age_13',
        name: 'Minimum Age 13',
        description: 'User must be at least 13 years old',
        type: 'AGE_VERIFICATION',
        config: { minimumAge: 13 },
        enabled: true,
        priority: 1,
      },
      {
        id: 'document_nft',
        name: 'Document Verification',
        description: 'Identity document required for high-value transactions',
        type: 'DOCUMENT_VERIFICATION',
        config: { requiredDocuments: ['PASSPORT'] },
        enabled: true,
        priority: 2,
      },
    ],
    defaultLevel: 'BASIC',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createExchangeStandardTemplate(): ComplianceTemplate {
  return {
    id: 'EXCHANGE_STANDARD',
    name: 'Exchange Standard',
    description: 'Full compliance for digital asset exchanges',
    rules: [
      {
        id: 'age_18_exchange',
        name: 'Minimum Age 18',
        description: 'User must be at least 18 years old',
        type: 'AGE_VERIFICATION',
        config: { minimumAge: 18 },
        enabled: true,
        priority: 1,
      },
      {
        id: 'country_exchange',
        name: 'Country Restriction',
        description: 'Check against restricted countries',
        type: 'COUNTRY_RESTRICTION',
        config: {
          restrictedCountries: ['KP', 'IR', 'SY', 'CU'],
        },
        enabled: true,
        priority: 2,
      },
      {
        id: 'document_exchange',
        name: 'Document Verification',
        description: 'Full document verification required',
        type: 'DOCUMENT_VERIFICATION',
        config: { requiredDocuments: ['PASSPORT', 'DRIVERS_LICENSE', 'ADDRESS_PROOF'] },
        enabled: true,
        priority: 3,
      },
      {
        id: 'aml_exchange',
        name: 'AML Screening',
        description: 'Comprehensive AML screening',
        type: 'AML_SCREENING',
        config: { requireAMLScreening: true },
        enabled: true,
        priority: 4,
      },
      {
        id: 'risk_exchange',
        name: 'Risk Assessment',
        description: 'Risk score must be within acceptable range',
        type: 'RISK_THRESHOLD',
        config: { maxRiskScore: 40 },
        enabled: true,
        priority: 5,
      },
    ],
    defaultLevel: 'ENHANCED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Create template registry
 */
export function createTemplateRegistry(): TemplateRegistry {
  return new TemplateRegistry();
}
