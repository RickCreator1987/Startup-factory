/**
 * Example: Basic Usage
 * Demonstrates basic SDK initialization and verification flow
 * @package @solana-zk-kyc/sdk
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { createSDK, createWalletAdapter } from '../src/index';

// Example configuration
const CONFIG = {
  // Solana network connection
  connection: new Connection('https://api.devnet.solana.com'),

  // Wallet adapter (Phantom, Solflare, etc.)
  walletAdapter: createWalletAdapter('phantom'),

  // Oracle public key for verification
  oraclePublicKey: new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V'),

  // Trusted oracles
  trustedOracles: [
    new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V'),
    new PublicKey('8yMYt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9W'),
  ],

  // KYC Provider configuration (optional)
  identityProvider: {
    provider: 'persona',
    apiKey: process.env.PERSONA_API_KEY || 'test_key',
  },

  // Enable ML risk assessment
  enableMLRiskAssessment: true,

  // Enable auto compliance reporting
  enableAutoReporting: true,

  // Merkle tree depth
  merkleTreeDepth: 20,

  // Default language
  defaultLanguage: 'en',
};

async function main() {
  // Create SDK instance
  const sdk = createSDK(CONFIG);

  // Initialize SDK
  await sdk.initialize();

  console.log('SDK initialized successfully');
  console.log('Version:', sdk.getVersion());

  // Example: Verify user identity
  const walletAddress = 'EpkM2xHNoF6JVqM7VqdJ5xBbY1V5Z8Y9Z0X1Y2Z3A4B5';

  const verificationResult = await sdk.verifyIdentity({
    provider: 'persona',
    walletAddress: walletAddress,
    tier: 'BASIC',
    requirements: {
      requireIdentityDocs: true,
      requireSelfie: true,
      requireAddressProof: false,
    },
    metadata: {
      fullName: 'John Doe',
      email: 'john@example.com',
      dateOfBirth: '1990-01-15',
      nationality: 'US',
      countryOfResidence: 'US',
    },
  });

  console.log('Verification result:', verificationResult);

  // Check compliance status
  const walletPublicKey = new PublicKey(walletAddress);
  const complianceResult = await sdk.checkCompliance(walletPublicKey);

  console.log('Compliance result:', complianceResult);

  // Assess risk
  const riskAssessment = await sdk.assessRisk(walletAddress);
  console.log('Risk assessment:', riskAssessment);

  // Generate compliance report
  const report = await sdk.generateReport({
    type: 'KYC_SUMMARY',
    walletAddress: walletAddress,
    period: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31'),
    },
  });

  console.log('Compliance report generated:', report.reportId);
}

// Run example
main().catch(console.error);
