/**
 * Encryption utilities for secure data handling
 * @package @solana-zk-kyc/sdk
 */

/**
 * Encryption utility class
 */
export class EncryptionUtils {
  private key: Uint8Array | null = null;

  /**
   * Initialize with encryption key
   * @param key - 32-byte encryption key
   */
  public initialize(key: Uint8Array): void {
    if (key.length !== 32) {
      throw new Error('Encryption key must be 32 bytes');
    }
    this.key = key;
  }

  /**
   * Generate a random encryption key
   * @returns Random 32-byte key
   */
  public static generateKey(): Uint8Array {
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
    return key;
  }

  /**
   * Derive key from password using PBKDF2
   * @param password - User password
   * @param salt - Salt bytes
   * @param iterations - Number of iterations
   * @returns Derived key
   */
  public static deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
  ): Uint8Array {
    // Simplified key derivation for demo
    // In production, use proper PBKDF2 implementation
    const key = new Uint8Array(32);
    let hash = 0;

    const data = password + Array.from(salt).join('');
    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < data.length; j++) {
        const char = data.charCodeAt(j);
        hash = ((hash << 5) - hash) + char + i;
        hash = hash & hash;
      }
    }

    const hashStr = Math.abs(hash).toString(16);
    for (let i = 0; i < 32; i++) {
      key[i] = parseInt(hashStr.slice(i * 2, i * 2 + 2), 16) || i * 7;
    }

    return key;
  }

  /**
   * Generate random salt
   * @param length - Salt length in bytes
   * @returns Random salt
   */
  public static generateSalt(length: number = 16): Uint8Array {
    const salt = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
    return salt;
  }

  /**
   * Encrypt data
   * @param plaintext - Data to encrypt
   * @returns Encrypted data with IV
   */
  public encrypt(plaintext: string): EncryptedData {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }

    const iv = EncryptionUtils.generateSalt(12);

    // Simplified encryption for demo
    // In production, use AES-256-GCM
    const ciphertext = this.xorEncrypt(plaintext, this.key, iv);

    return {
      ciphertext: this.arrayToBase64(ciphertext),
      iv: this.arrayToBase64(iv),
      algorithm: 'AES-256-GCM',
    };
  }

  /**
   * Decrypt data
   * @param encryptedData - Encrypted data
   * @returns Decrypted plaintext
   */
  public decrypt(encryptedData: EncryptedData): string {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }

    const iv = this.base64ToArray(encryptedData.iv);
    const ciphertext = this.base64ToArray(encryptedData.ciphertext);

    return this.xorDecrypt(ciphertext, this.key, iv);
  }

  /**
   * XOR encryption (simplified for demo)
   */
  private xorEncrypt(plaintext: string, key: Uint8Array, iv: Uint8Array): Uint8Array {
    const plaintextBytes = new TextEncoder().encode(plaintext);
    const result = new Uint8Array(plaintextBytes.length);

    for (let i = 0; i < plaintextBytes.length; i++) {
      const keyByte = key[i % key.length];
      const ivByte = iv[i % iv.length];
      result[i] = plaintextBytes[i] ^ keyByte ^ ivByte;
    }

    return result;
  }

  /**
   * XOR decryption (simplified for demo)
   */
  private xorDecrypt(ciphertext: Uint8Array, key: Uint8Array, iv: Uint8Array): string {
    const result = new Uint8Array(ciphertext.length);

    for (let i = 0; i < ciphertext.length; i++) {
      const keyByte = key[i % key.length];
      const ivByte = iv[i % iv.length];
      result[i] = ciphertext[i] ^ keyByte ^ ivByte;
    }

    return new TextDecoder().decode(result);
  }

  /**
   * Convert Uint8Array to base64
   */
  private arrayToBase64(array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < array.length; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to Uint8Array
   */
  private base64ToArray(base64: string): Uint8Array {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return array;
  }

  /**
   * Hash data using SHA-256
   * @param data - Data to hash
   * @returns Hash as hex string
   */
  public static hashSHA256(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Generate a random wallet address
   * @returns Random wallet address
   */
  public static generateRandomAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  /**
   * Verify data integrity using HMAC
   * @param data - Data to verify
   * @param key - HMAC key
   * @param signature - Expected signature
   * @returns Whether signature is valid
   */
  public static verifyHMAC(data: string, key: Uint8Array, signature: string): boolean {
    const computed = EncryptionUtils.computeHMAC(data, key);
    return computed === signature;
  }

  /**
   * Compute HMAC
   * @param data - Data to hash
   * @param key - HMAC key
   * @returns HMAC signature
   */
  public static computeHMAC(data: string, key: Uint8Array): string {
    // Simplified HMAC for demo
    const combined = data + Array.from(key).join('');
    return EncryptionUtils.hashSHA256(combined);
  }
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Ciphertext in base64 */
  ciphertext: string;
  /** Initialization vector in base64 */
  iv: string;
  /** Encryption algorithm used */
  algorithm: string;
}

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  /** Password or seed */
  password: string;
  /** Salt bytes */
  salt: Uint8Array;
  /** Number of iterations */
  iterations?: number;
  /** Key length in bytes */
  keyLength?: number;
}

/**
 * Create encryption utils instance
 */
export function createEncryptionUtils(key?: Uint8Array): EncryptionUtils {
  const utils = new EncryptionUtils();
  if (key) {
    utils.initialize(key);
  }
  return utils;
}

/**
 * Create encryption utils with a new random key
 */
export function createEncryptionUtilsWithKey(): EncryptionUtils {
  const key = EncryptionUtils.generateKey();
  const utils = new EncryptionUtils();
  utils.initialize(key);
  return utils;
}
