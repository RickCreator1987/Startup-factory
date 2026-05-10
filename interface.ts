/**
 * Wallet Adapter Interface for Solana wallets
 * @package @solana-zk-kyc/sdk
 */

import type { PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';

/**
 * Wallet adapter interface
 */
export interface WalletAdapter {
  /** Get the public key of the wallet */
  readonly publicKey: PublicKey | null;
  /** Whether the wallet is connected */
  readonly connected: boolean;
  /** Wallet name */
  readonly name: string;

  /**
   * Connect to the wallet
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the wallet
   */
  disconnect(): Promise<void>;

  /**
   * Sign a transaction
   * @param transaction - Transaction to sign
   * @returns Signed transaction
   */
  signTransaction(transaction: Transaction): Promise<Transaction>;

  /**
   * Sign multiple transactions
   * @param transactions - Transactions to sign
   * @returns Signed transactions
   */
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;

  /**
   * Sign a message
   * @param message - Message to sign
   * @returns Signature
   */
  signMessage(message: Uint8Array): Promise<Uint8Array>;

  /**
   * Add event listener for wallet events
   */
  on(event: string, fn: (...args: any[]) => void): void;

  /**
   * Remove event listener
   */
  off(event: string, fn: (...args: any[]) => void): void;
}

/**
 * Phantom Wallet Adapter
 */
export class PhantomWalletAdapter implements WalletAdapter {
  private _publicKey: PublicKey | null = null;
  private _connected: boolean = false;
  private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connected(): boolean {
    return this._connected;
  }

  get name(): string {
    return 'Phantom';
  }

  async connect(): Promise<void> {
    // In a browser environment with Phantom installed
    if (typeof window !== 'undefined' && (window as any).phantom?.solana) {
      const phantom = (window as any).phantom.solana;
      try {
        const response = await phantom.connect();
        if (response?.publicKey) {
          this._publicKey = new PublicKey(response.publicKey.toString());
          this._connected = true;
          this.emit('connect', this._publicKey);
        }
      } catch (error) {
        throw new Error('Failed to connect to Phantom wallet');
      }
    } else {
      // Mock for development
      this._publicKey = this.generateMockPublicKey();
      this._connected = true;
      this.emit('connect', this._publicKey);
    }
  }

  async disconnect(): Promise<void> {
    this._publicKey = null;
    this._connected = false;
    this.emit('disconnect');
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this._connected) {
      throw new Error('Wallet not connected');
    }

    // In production, use actual Phantom signing
    // const phantom = (window as any).phantom?.solana;
    // if (phantom) {
    //   return await phantom.signTransaction(transaction);
    // }

    // Mock signing for development
    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    return Promise.all(transactions.map(tx => this.signTransaction(tx)));
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._connected) {
      throw new Error('Wallet not connected');
    }

    // Mock message signing for development
    const signature = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      signature[i] = Math.floor(Math.random() * 256);
    }
    return signature;
  }

  on(event: string, fn: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(fn);
  }

  off(event: string, fn: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(fn => fn(...args));
    }
  }

  private generateMockPublicKey(): PublicKey {
    // Generate a mock public key for development
    const mockKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      mockKey[i] = Math.floor(Math.random() * 256);
    }
    return new PublicKey(mockKey);
  }
}

/**
 * Solflare Wallet Adapter
 */
export class SolflareWalletAdapter implements WalletAdapter {
  private _publicKey: PublicKey | null = null;
  private _connected: boolean = false;
  private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connected(): boolean {
    return this._connected;
  }

  get name(): string {
    return 'Solflare';
  }

  async connect(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).solflare) {
      const solflare = (window as any).solflare;
      try {
        await solflare.connect();
        if (solflare.publicKey) {
          this._publicKey = new PublicKey(solflare.publicKey.toString());
          this._connected = true;
          this.emit('connect', this._publicKey);
        }
      } catch (error) {
        throw new Error('Failed to connect to Solflare wallet');
      }
    } else {
      this._publicKey = this.generateMockPublicKey();
      this._connected = true;
      this.emit('connect', this._publicKey);
    }
  }

  async disconnect(): Promise<void> {
    this._publicKey = null;
    this._connected = false;
    this.emit('disconnect');
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this._connected) {
      throw new Error('Wallet not connected');
    }
    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    return Promise.all(transactions.map(tx => this.signTransaction(tx)));
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._connected) {
      throw new Error('Wallet not connected');
    }
    const signature = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      signature[i] = Math.floor(Math.random() * 256);
    }
    return signature;
  }

  on(event: string, fn: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(fn);
  }

  off(event: string, fn: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(fn => fn(...args));
    }
  }

  private generateMockPublicKey(): PublicKey {
    const mockKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      mockKey[i] = Math.floor(Math.random() * 256);
    }
    return new PublicKey(mockKey);
  }
}

/**
 * Create wallet adapter from type
 */
export function createWalletAdapter(type: 'phantom' | 'solflare'): WalletAdapter {
  switch (type) {
    case 'phantom':
      return new PhantomWalletAdapter();
    case 'solflare':
      return new SolflareWalletAdapter();
    default:
      throw new Error(`Unknown wallet type: ${type}`);
  }
}
