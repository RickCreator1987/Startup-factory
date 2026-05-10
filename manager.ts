/**
 * Identity Manager - Handles DID creation, resolution, and credential management
 * @package @solana-zk-kyc/sdk
 */

import type {
  DIDDocument,
  VerifiableCredential,
  CredentialSubject,
  Claim,
  CredentialVerificationResult,
  DIDResolutionResult,
  WalletProfile,
} from '../../types/identity';

/**
 * Identity Manager class for managing decentralized identities
 */
export class IdentityManager {
  private didRegistry: Map<string, DIDDocument> = new Map();
  private credentialRegistry: Map<string, VerifiableCredential> = new Map();

  /**
   * Create a new DID for a wallet address
   * @param walletAddress - User's wallet public key
   * @returns DID Document
   */
  public createDID(walletAddress: string): DIDDocument {
    const did = `did:solana:${walletAddress}`;

    const document: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      id: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: this.generatePublicKeyMultibase(walletAddress),
        },
      ],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`],
    };

    this.didRegistry.set(did, document);
    return document;
  }

  /**
   * Generate a mock public key multibase (for demo purposes)
   * In production, derive from actual wallet key
   */
  private generatePublicKeyMultibase(walletAddress: string): string {
    // Create a mock multibase encoded key
    // In production, this would use the actual public key
    const addressHash = this.hashString(walletAddress);
    return `z${addressHash}`;
  }

  /**
   * Simple hash function for key generation
   */
  private hashString(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(40, '0');
  }

  /**
   * Resolve a DID to its document
   * @param did - DID to resolve
   * @returns Resolution result
   */
  public resolveDID(did: string): DIDResolutionResult {
    const document = this.didRegistry.get(did);

    if (!document) {
      // Try to construct from DID
      const parsed = this.parseDID(did);
      if (parsed) {
        return {
          didDocument: this.createDID(parsed.identifier),
          metadata: {
            deactivated: false,
          },
        };
      }

      return {
        didDocument: null,
        metadata: {
          deactivated: true,
        },
      };
    }

    return {
      didDocument: document,
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        deactivated: false,
      },
    };
  }

  /**
   * Parse DID string into components
   * @param did - DID string
   * @returns Parsed DID components
   */
  public parseDID(did: string): { method: string; identifier: string } | null {
    const match = did.match(/^did:([^:]+):(.+)$/);
    if (!match) {
      return null;
    }

    return {
      method: match[1],
      identifier: match[2],
    };
  }

  /**
   * Issue a verifiable credential
   * @param issuerDID - Issuer's DID
   * @param subjectDID - Subject's DID
   * @param claims - Array of claims
   * @returns Verifiable credential
   */
  public issueCredential(
    issuerDID: string,
    subjectDID: string,
    claims: Claim[]
  ): VerifiableCredential {
    const credentialId = `urn:uuid:${this.generateUUID()}`;

    // Build credential subject from claims
    const credentialSubject: CredentialSubject = {
      id: subjectDID,
    };

    for (const claim of claims) {
      credentialSubject[claim.key] = claim.value;
    }

    const credential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://schema.org',
      ],
      id: credentialId,
      type: ['VerifiableCredential', 'KYCVerificationCredential'],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      expirationDate: this.addYears(new Date(), 1).toISOString(),
      credentialSubject,
    };

    // Add proof (in production, this would be a actual cryptographic proof)
    credential.proof = this.createCredentialProof(issuerDID, credential);

    this.credentialRegistry.set(credentialId, credential);
    return credential;
  }

  /**
   * Create a credential proof
   * In production, this would use actual cryptographic signing
   */
  private createCredentialProof(
    issuerDID: string,
    credential: VerifiableCredential
  ): import('../../types/identity').CredentialProof {
    // Create a mock proof for demonstration
    // In production, this would use actual Ed25519 signing
    const proofData = JSON.stringify({
      issuer: credential.issuer,
      subject: credential.credentialSubject.id,
      issuanceDate: credential.issuanceDate,
    });

    return {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `${issuerDID}#key-1`,
      proofValue: this.hashString(proofData),
    };
  }

  /**
   * Verify a credential
   * @param credential - Credential to verify
   * @returns Verification result
   */
  public verifyCredential(credential: VerifiableCredential): CredentialVerificationResult {
    // Check credential structure
    if (!credential.id || !credential.issuer || !credential.credentialSubject) {
      return {
        isValid: false,
        errors: ['Invalid credential structure'],
      };
    }

    // Check expiration
    if (credential.expirationDate) {
      const expirationDate = new Date(credential.expirationDate);
      if (expirationDate < new Date()) {
        return {
          isValid: false,
          errors: ['Credential has expired'],
        };
      }
    }

    // Verify issuer exists
    const issuerDoc = this.resolveDID(credential.issuer);
    if (!issuerDoc.didDocument) {
      return {
        isValid: false,
        errors: ['Issuer not found'],
      };
    }

    // Verify proof (simplified for demo)
    if (credential.proof) {
      const isProofValid = this.verifyCredentialProof(credential);
      if (!isProofValid) {
        return {
          isValid: false,
          errors: ['Invalid credential proof'],
        };
      }
    }

    return {
      isValid: true,
      metadata: {
        issuer: credential.issuer,
        subject: credential.credentialSubject.id,
        issuanceDate: credential.issuanceDate,
        expirationDate: credential.expirationDate,
      },
    };
  }

  /**
   * Verify credential proof
   * Simplified for demo - in production use actual signature verification
   */
  private verifyCredentialProof(credential: VerifiableCredential): boolean {
    // For demo, always return true if proof exists
    // In production, verify actual cryptographic signature
    return !!credential.proof?.proofValue;
  }

  /**
   * Get credential by ID
   * @param credentialId - Credential ID
   * @returns Credential or null
   */
  public getCredential(credentialId: string): VerifiableCredential | null {
    return this.credentialRegistry.get(credentialId) || null;
  }

  /**
   * Get all credentials for a subject
   * @param subjectDID - Subject's DID
   * @returns Array of credentials
   */
  public getCredentialsForSubject(subjectDID: string): VerifiableCredential[] {
    const credentials: VerifiableCredential[] = [];

    for (const credential of this.credentialRegistry.values()) {
      if (credential.credentialSubject.id === subjectDID) {
        credentials.push(credential);
      }
    }

    return credentials;
  }

  /**
   * Revoke a credential
   * @param credentialId - Credential ID to revoke
   * @returns Whether revocation was successful
   */
  public revokeCredential(credentialId: string): boolean {
    const credential = this.credentialRegistry.get(credentialId);
    if (!credential) {
      return false;
    }

    // Remove from registry
    this.credentialRegistry.delete(credentialId);
    return true;
  }

  /**
   * Add years to a date
   */
  private addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Export all DIDs (for debugging/serialization)
   */
  public exportDIDs(): Map<string, DIDDocument> {
    return new Map(this.didRegistry);
  }

  /**
   * Import DIDs (for deserialization)
   */
  public importDIDs(docs: Map<string, DIDDocument>): void {
    for (const [did, doc] of docs) {
      this.didRegistry.set(did, doc);
    }
  }

  /**
   * Clear all data (for testing)
   */
  public clear(): void {
    this.didRegistry.clear();
    this.credentialRegistry.clear();
  }
}

/**
 * Create a new Identity Manager instance
 */
export function createIdentityManager(): IdentityManager {
  return new IdentityManager();
}

/**
 * Create a KYC credential
 */
export function createKYCCredential(
  issuerDID: string,
  subjectDID: string,
  complianceLevel: string,
  verifiedAt: Date,
  expiresAt: Date
): VerifiableCredential {
  const manager = new IdentityManager();

  const claims: Claim[] = [
    { key: 'complianceLevel', value: complianceLevel },
    { key: 'verifiedAt', value: verifiedAt.toISOString(), type: 'string' },
    { key: 'kycProvider', value: 'solana-zk-kyc-sdk', type: 'string' },
    { key: 'jurisdiction', value: 'global', type: 'string' },
  ];

  return manager.issueCredential(issuerDID, subjectDID, claims);
}
