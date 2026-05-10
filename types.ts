/**
 * TypeScript Type Definitions
 * 
 * Centralized type definitions for the KYC Compliance SDK.
 * These types mirror the Rust structs from the on-chain programs.
 */

import { PublicKey, BN } from '@solana/web3.js';
import { Idl } from '@coral-xyz/anchor';

/**
 * KYC Status Enum
 */
export enum KycStatus {
  /** User is not verified */
  Unverified = 'unverified',
  /** User is pending verification */
  Pending = 'pending',
  /** User is verified */
  Verified = 'verified',
  /** User is frozen/blocked */
  Frozen = 'frozen',
  /** User is on sanctions list */
  Sanctioned = 'sanctioned',
}

/**
 * KYC Level Enum
 */
export enum KycLevel {
  /** No KYC */
  None = 'none',
  /** Basic KYC (email verification only) */
  Basic = 'basic',
  /** Standard KYC (ID verification) */
  Standard = 'standard',
  /** Enhanced KYC (additional documentation) */
  Enhanced = 'enhanced',
  /** Institutional KYC (full due diligence) */
  Institutional = 'institutional',
}

/**
 * Risk Level Enum
 */
export enum RiskLevel {
  /** Low risk */
  Low = 'low',
  /** Medium risk */
  Medium = 'medium',
  /** High risk */
  High = 'high',
  /** Critical risk */
  Critical = 'critical',
}

/**
 * SDK Configuration
 */
export interface ComplianceConfig {
  /** RPC endpoint URL */
  rpcUrl: string;
  /** KYC Compliance Program ID */
  programId: PublicKey;
  /** Wallet adapter (optional, defaults to empty wallet) */
  wallet?: any;
  /** Commitment level (default: confirmed) */
  commitment?: 'processed' | 'confirmed' | 'finalized';
  /** Skip preflight (default: false) */
  skipPreflight?: boolean;
}

/**
 * Register User Parameters
 */
export interface RegisterUserParams {
  /** User's wallet address */
  wallet: PublicKey;
  /** KYC level */
  kycLevel: KycLevel;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Expiry timestamp (Unix timestamp in seconds) */
  expiryTimestamp: number;
}

/**
 * Compliance Status Response
 */
export interface ComplianceStatus {
  /** Wallet address */
  wallet: string;
  /** Current KYC status */
  status: KycStatus;
  /** KYC level */
  kycLevel: KycLevel;
  /** Country code */
  countryCode: string;
  /** Expiry timestamp */
  expiryTimestamp: number;
  /** Whether the wallet is registered */
  registered: boolean;
}

/**
 * Transfer Result
 */
export interface TransferResult {
  /** Whether the transfer is approved */
  approved: boolean;
  /** Reason for rejection (if not approved) */
  reason?: string;
  /** Source compliance status */
  sourceStatus?: ComplianceStatus;
  /** Destination compliance status */
  destinationStatus?: ComplianceStatus;
}

/**
 * Risk Score
 */
export interface RiskScore {
  /** Wallet address */
  wallet: string;
  /** Risk score (0-100) */
  score: number;
  /** Risk level */
  level: RiskLevel;
  /** Factors contributing to score */
  factors: RiskFactor[];
  /** Last updated timestamp */
  lastUpdated: number;
}

/**
 * Risk Factor
 */
export interface RiskFactor {
  /** Factor name */
  name: string;
  /** Factor contribution to score */
  contribution: number;
  /** Description */
  description: string;
}

/**
 * ZK Proof Data
 */
export interface ZkProofData {
  /** Proof bytes */
  proofBytes: string;
  /** Merkle root */
  merkleRoot: string;
  /** Nullifier hash */
  nullifierHash: string;
  /** Signal */
  signal: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Registry Information
 */
export interface RegistryInfo {
  /** Authority address */
  authority: string;
  /** Total registered users */
  totalRegistered: number;
  /** Whether transfers are paused */
  paused: boolean;
  /** Whether circuit breaker is active */
  circuitBreakerActive: boolean;
}

/**
 * Transfer Hook Info
 */
export interface TransferHookInfo {
  /** Program ID */
  programId: PublicKey;
  /** Mint address */
  mint: PublicKey;
  /** Whether it's initialized */
  initialized: boolean;
}

/**
 * Wallet Freeze Info
 */
export interface WalletFreezeInfo {
  /** Wallet address */
  wallet: string;
  /** Whether the wallet is frozen */
  isFrozen: boolean;
  /** Freeze reason */
  reason?: string;
  /** Freeze timestamp */
  frozenAt?: number;
  /** Frozen by */
  frozenBy?: string;
}

/**
 * Event Types
 */
export interface KycRegisteredEvent {
  wallet: string;
  kycLevel: KycLevel;
  timestamp: number;
}

export interface TransferHookEvent {
  source: string;
  destination: string;
  amount: number;
  timestamp: number;
}

export interface RiskScoreUpdatedEvent {
  wallet: string;
  oldScore: number;
  newScore: number;
  timestamp: number;
}

/**
 * Anchor IDL Types (mirroring Rust structs)
 */

export interface KycStatusAccount {
  wallet: PublicKey;
  status: KycStatus;
  kycLevel: KycLevel;
  countryCode: string;
  expiryTimestamp: BN;
  registeredAt: BN;
  lastUpdated: BN;
}

export interface ComplianceRegistryAccount {
  authority: PublicKey;
  totalRegistered: BN;
  paused: boolean;
  circuitBreakerActive: boolean;
  maxTransferAmount: BN;
  velocityLimit: BN;
  velocityWindow: number;
  bump: number;
}

export interface CircuitBreakerAccount {
  isActive: boolean;
  authority: PublicKey;
  threshold: number;
  maxTransferAmount: BN;
  velocityLimit: number;
  velocityWindow: number;
  currentVelocity: number;
  lastVelocityReset: BN;
  bump: number;
}

/**
 * Program IDL (simplified)
 */
export const KycComplianceIDL: Idl = {
  version: '1.0.0',
  name: 'kyc_compliance',
  instructions: [
    {
      name: 'registerUser',
      accounts: [
        { name: 'user', isMut: true, isSigner: true },
        { name: 'kycStatus', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'kycLevel', type: { defined: 'KycLevel' } },
        { name: 'countryCode', type: 'string' },
        { name: 'expiryTimestamp', type: 'i64' },
      ],
    },
    {
      name: 'freezeWallet',
      accounts: [
        { name: 'kycStatus', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: 'unfreezeWallet',
      accounts: [
        { name: 'kycStatus', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: 'activateCircuitBreaker',
      accounts: [
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: 'deactivateCircuitBreaker',
      accounts: [
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'kycStatus',
      type: {
        kind: 'struct',
        fields: [
          { name: 'wallet', type: 'pubkey' },
          { name: 'status', type: { defined: 'KycStatus' } },
          { name: 'kycLevel', type: { defined: 'KycLevel' } },
          { name: 'countryCode', type: 'string' },
          { name: 'expiryTimestamp', type: 'i64' },
          { name: 'registeredAt', type: 'i64' },
          { name: 'lastUpdated', type: 'i64' },
        ],
      },
    },
    {
      name: 'complianceRegistry',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'pubkey' },
          { name: 'totalRegistered', type: 'u64' },
          { name: 'paused', type: 'bool' },
          { name: 'circuitBreakerActive', type: 'bool' },
          { name: 'maxTransferAmount', type: 'u64' },
          { name: 'velocityLimit', type: 'u64' },
          { name: 'velocityWindow', type: 'u32' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  types: [
    {
      name: 'KycStatus',
      type: {
        kind: 'enum',
        variants: [
          { name: 'Unverified' },
          { name: 'Pending' },
          { name: 'Verified' },
          { name: 'Frozen' },
          { name: 'Sanctioned' },
        ],
      },
    },
    {
      name: 'KycLevel',
      type: {
        kind: 'enum',
        variants: [
          { name: 'None' },
          { name: 'Basic' },
          { name: 'Standard' },
          { name: 'Enhanced' },
          { name: 'Institutional' },
        ],
      },
    },
  ],
};

/**
 * Program type for Anchor
 */
export type KycComplianceProgram = {
  version: string;
  name: string;
  instructions: any[];
  accounts: any[];
  types: any[];
};
