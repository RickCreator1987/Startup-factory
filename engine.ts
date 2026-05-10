/**
 * Risk Assessment Engine - ML-based risk analysis
 * @package @solana-zk-kyc/sdk
 */

import type {
  RiskAssessment,
  RiskFactor,
  RiskLevel,
  WalletProfile,
  RiskFactorCategory,
} from '../../types/compliance';

/**
 * Risk Assessment Engine
 */
export class RiskEngine {
  private riskThresholds: RiskThresholds = {
    lowMax: 30,
    mediumMax: 60,
  };

  /**
   * Configure risk thresholds
   * @param thresholds - Risk threshold configuration
   */
  public setThresholds(thresholds: RiskThresholds): void {
    this.riskThresholds = thresholds;
  }

  /**
   * Assess risk for a wallet address
   * @param walletAddress - Wallet to assess
   * @param profile - Wallet profile data
   * @returns Risk assessment result
   */
  public async assessRisk(
    walletAddress: string,
    profile?: WalletProfile
  ): Promise<RiskAssessment> {
    // Use provided profile or generate mock
    const walletProfile = profile || await this.analyzeWalletHistory(walletAddress);

    // Get risk factors
    const factors = this.calculateRiskFactors(walletProfile);

    // Calculate overall score
    const riskScore = this.calculateRiskScore(factors);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, riskLevel);

    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    return {
      riskScore,
      riskLevel,
      factors,
      recommendations,
      timestamp: now,
      expiresAt,
    };
  }

  /**
   * Analyze wallet history
   * In production, this would query blockchain data
   * @param walletAddress - Wallet address
   * @returns Wallet profile
   */
  public async analyzeWalletHistory(walletAddress: string): Promise<WalletProfile> {
    // Mock wallet profile for demonstration
    // In production, analyze actual blockchain data
    const walletAge = Math * 100.floor(Math.random()0) + 30;
    const transactionCount = Math.floor(Math.random() * 5000) + 100;
    const totalVolume = Math.random() * 10000;
    const averageTransactionSize = totalVolume / transactionCount;
    const highRiskInteractions = Math.floor(Math.random() * 10);

    return {
      address: walletAddress,
      walletAge,
      transactionCount,
      totalVolume,
      averageTransactionSize,
      highRiskInteractions,
      geographicIndicators: this.generateGeographicIndicators(),
      deviceFingerprints: this.generateDeviceFingerprints(),
      behavioralPatterns: this.generateBehavioralPatterns(),
    };
  }

  /**
   * Generate mock geographic indicators
   */
  private generateGeographicIndicators(): string[] {
    const regions = ['North America', 'Europe', 'Asia', 'South America', 'Oceania'];
    const numRegions = Math.floor(Math.random() * 3) + 1;
    const selected: string[] = [];

    for (let i = 0; i < numRegions; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      if (!selected.includes(region)) {
        selected.push(region);
      }
    }

    return selected;
  }

  /**
   * Generate mock device fingerprints
   */
  private generateDeviceFingerprints(): string[] {
    const devices = ['mobile-ios', 'mobile-android', 'desktop-chrome', 'desktop-firefox'];
    const numDevices = Math.floor(Math.random() * 2) + 1;
    const selected: string[] = [];

    for (let i = 0; i < numDevices; i++) {
      const device = devices[Math.floor(Math.random() * devices.length)];
      if (!selected.includes(device)) {
        selected.push(device);
      }
    }

    return selected;
  }

  /**
   * Generate mock behavioral patterns
   */
  private generateBehavioralPatterns(): string[] {
    const patterns = [
      'regular-transactions',
      'defi-interactions',
      'nft-trading',
      'token-swaps',
      'staking',
    ];
    const numPatterns = Math.floor(Math.random() * 3) + 1;
    const selected: string[] = [];

    for (let i = 0; i < numPatterns; i++) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      if (!selected.includes(pattern)) {
        selected.push(pattern);
      }
    }

    return selected;
  }

  /**
   * Calculate risk factors from wallet profile
   */
  private calculateRiskFactors(profile: WalletProfile): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Wallet age factor
    factors.push(this.evaluateWalletAge(profile.walletAge));

    // Transaction volume factor
    factors.push(this.evaluateTransactionVolume(profile.totalVolume));

    // Transaction count factor
    factors.push(this.evaluateTransactionCount(profile.transactionCount));

    // High risk interactions factor
    factors.push(this.evaluateHighRiskInteractions(profile.highRiskInteractions));

    // Average transaction size factor
    factors.push(this.evaluateAverageTransactionSize(profile.averageTransactionSize));

    // Behavioral patterns factor
    if (profile.behavioralPatterns) {
      factors.push(this.evaluateBehavioralPatterns(profile.behavioralPatterns));
    }

    return factors;
  }

  /**
   * Evaluate wallet age
   */
  private evaluateWalletAge(age: number): RiskFactor {
    let weight = 0.15;
    let riskContribution = 0;

    if (age < 30) {
      riskContribution = 80;
    } else if (age < 90) {
      riskContribution = 50;
    } else if (age < 180) {
      riskContribution = 30;
    } else if (age < 365) {
      riskContribution = 15;
    } else {
      riskContribution = 5;
    }

    return {
      id: 'wallet_age',
      name: 'Wallet Age',
      category: 'WALLET_HISTORY',
      weight,
      value: age,
      riskContribution,
    };
  }

  /**
   * Evaluate transaction volume
   */
  private evaluateTransactionVolume(volume: number): RiskFactor {
    const weight = 0.2;
    let riskContribution = 0;

    if (volume > 100000) {
      riskContribution = 90;
    } else if (volume > 50000) {
      riskContribution = 70;
    } else if (volume > 10000) {
      riskContribution = 50;
    } else if (volume > 1000) {
      riskContribution = 30;
    } else {
      riskContribution = 10;
    }

    return {
      id: 'transaction_volume',
      name: 'Transaction Volume',
      category: 'TRANSACTION_PATTERN',
      weight,
      value: volume,
      riskContribution,
    };
  }

  /**
   * Evaluate transaction count
   */
  private evaluateTransactionCount(count: number): RiskFactor {
    const weight = 0.15;
    let riskContribution = 0;

    if (count > 10000) {
      riskContribution = 80;
    } else if (count > 5000) {
      riskContribution = 60;
    } else if (count > 1000) {
      riskContribution = 40;
    } else if (count > 100) {
      riskContribution = 20;
    } else {
      riskContribution = 10;
    }

    return {
      id: 'transaction_count',
      name: 'Transaction Count',
      category: 'TRANSACTION_PATTERN',
      weight,
      value: count,
      riskContribution,
    };
  }

  /**
   * Evaluate high risk interactions
   */
  private evaluateHighRiskInteractions(count: number): RiskFactor {
    const weight = 0.25;
    let riskContribution = 0;

    if (count > 50) {
      riskContribution = 100;
    } else if (count > 20) {
      riskContribution = 80;
    } else if (count > 10) {
      riskContribution = 60;
    } else if (count > 5) {
      riskContribution = 40;
    } else if (count > 0) {
      riskContribution = 20;
    } else {
      riskContribution = 0;
    }

    return {
      id: 'high_risk_interactions',
      name: 'High Risk Address Interactions',
      category: 'EXTERNAL',
      weight,
      value: count,
      riskContribution,
    };
  }

  /**
   * Evaluate average transaction size
   */
  private evaluateAverageTransactionSize(avgSize: number): RiskFactor {
    const weight = 0.15;
    let riskContribution = 0;

    if (avgSize > 10000) {
      riskContribution = 90;
    } else if (avgSize > 5000) {
      riskContribution = 70;
    } else if (avgSize > 1000) {
      riskContribution = 50;
    } else if (avgSize > 100) {
      riskContribution = 30;
    } else {
      riskContribution = 10;
    }

    return {
      id: 'average_transaction_size',
      name: 'Average Transaction Size',
      category: 'TRANSACTION_PATTERN',
      weight,
      value: avgSize,
      riskContribution,
    };
  }

  /**
   * Evaluate behavioral patterns
   */
  private evaluateBehavioralPatterns(patterns: string[]): RiskFactor {
    const weight = 0.1;
    let riskContribution = 0;

    const highRiskPatterns = ['defi-interactions', 'token-swaps'];
    const mediumRiskPatterns = ['nft-trading', 'staking'];
    const lowRiskPatterns = ['regular-transactions'];

    for (const pattern of patterns) {
      if (highRiskPatterns.includes(pattern)) {
        riskContribution += 40;
      } else if (mediumRiskPatterns.includes(pattern)) {
        riskContribution += 20;
      } else if (lowRiskPatterns.includes(pattern)) {
        riskContribution += 5;
      }
    }

    riskContribution = Math.min(riskContribution, 100);

    return {
      id: 'behavioral_patterns',
      name: 'Behavioral Patterns',
      category: 'BEHAVIORAL',
      weight,
      value: patterns,
      riskContribution,
    };
  }

  /**
   * Calculate overall risk score from factors
   */
  private calculateRiskScore(factors: RiskFactor[]): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const factor of factors) {
      weightedSum += factor.riskContribution * factor.weight;
      totalWeight += factor.weight;
    }

    if (totalWeight === 0) {
      return 0;
    }

    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score <= this.riskThresholds.lowMax) {
      return 'LOW';
    } else if (score <= this.riskThresholds.mediumMax) {
      return 'MEDIUM';
    } else if (score <= 85) {
      return 'HIGH';
    } else {
      return 'CRITICAL';
    }
  }

  /**
   * Generate recommendations based on factors and level
   */
  private generateRecommendations(factors: RiskFactor[], level: RiskLevel): string[] {
    const recommendations: string[] = [];

    if (level === 'LOW') {
      recommendations.push('Standard verification sufficient');
      return recommendations;
    }

    // Add recommendations based on high-risk factors
    const highRiskFactors = factors
      .filter(f => f.riskContribution >= 60)
      .sort((a, b) => b.riskContribution - a.riskContribution);

    for (const factor of highRiskFactors) {
      switch (factor.id) {
        case 'wallet_age':
          recommendations.push('Request additional verification due to new wallet');
          break;
        case 'high_risk_interactions':
          recommendations.push('Review transaction history with high-risk addresses');
          recommendations.push('Consider enhanced due diligence');
          break;
        case 'transaction_volume':
          recommendations.push('Request source of funds documentation');
          break;
        case 'average_transaction_size':
          recommendations.push('Verify source of large transactions');
          break;
        default:
          recommendations.push(`Review ${factor.name} for additional risk`);
      }
    }

    if (level === 'CRITICAL') {
      recommendations.push('Manual review required before approval');
      recommendations.push('Consider rejecting verification');
    } else if (level === 'HIGH') {
      recommendations.push('Enhanced due diligence recommended');
    }

    return recommendations;
  }
}

/**
 * Risk thresholds configuration
 */
export interface RiskThresholds {
  /** Maximum score for low risk */
  lowMax: number;
  /** Maximum score for medium risk */
  mediumMax: number;
}

/**
 * Create risk engine instance
 */
export function createRiskEngine(thresholds?: RiskThresholds): RiskEngine {
  const engine = new RiskEngine();
  if (thresholds) {
    engine.setThresholds(thresholds);
  }
  return engine;
}
