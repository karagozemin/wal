/**
 * Real Seal SDK Integration
 * Using official @mysten/seal package
 */

import { SealClient, DemType, SessionKey } from '@mysten/seal';
import type { SealClientOptions } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// KemType enum (from Seal SDK)
enum KemType {
  BonehFranklinBLS12381DemCCA = 0
}

// Seal key server configuration (using Walrus testnet)
// Real production key servers from verified providers
// Note: Using only the most reliable key servers for better performance
const KEY_SERVER_CONFIGS = [
  {
    objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', // Key Server 1 (verified, fast)
    weight: 1,
  },
  {
    objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8', // Key Server 2 (verified, fast)
    weight: 1,
  },
];

const THRESHOLD = 1; // Need 1 out of 2 key servers (lower threshold for better performance)
const ENCRYPTION_TIMEOUT = 600000; // 10 minutes for encryption (large files need time)
const DECRYPTION_TIMEOUT = 180000; // 3 minutes for decryption

export interface RealSealEncryptionResult {
  encryptedObject: Uint8Array;
  symmetricKey: Uint8Array;
  packageId: string;
  id: string;
}

export class RealSealService {
  private sealClient: SealClient | null = null;
  private suiClient: SuiClient;

  constructor(suiClient: SuiClient) {
    this.suiClient = suiClient;
  }

  /**
   * Initialize Seal client
   */
  async initialize(): Promise<void> {
    if (this.sealClient) return;

    try {
      // Create Seal client with key server configuration
      const options: SealClientOptions = {
        suiClient: this.suiClient as any, // Type assertion for compatibility
        serverConfigs: KEY_SERVER_CONFIGS,
        verifyKeyServers: false, // Disable verification for faster initialization
        timeout: ENCRYPTION_TIMEOUT, // Long timeout for large file encryption
      };

      this.sealClient = new SealClient(options);
      
      console.log('✅ Real Seal SDK initialized');
    } catch (error) {
      console.error('Failed to initialize Seal SDK:', error);
      throw error;
    }
  }

  /**
   * Encrypt content using real Seal SDK
   * 
   * @param data - Content to encrypt
   * @param packageId - Package ID for the Seal policy
   * @param identity - Identity to encrypt for (e.g., tier ID or content ID)
   * @returns Encrypted object and symmetric key
   */
  async encryptContent(
    data: Uint8Array,
    packageId: string,
    identity: string
  ): Promise<RealSealEncryptionResult> {
    if (!this.sealClient) {
      await this.initialize();
    }

    try {
      console.log('🔐 Encrypting with real Seal SDK...', {
        dataSize: data.length,
        packageId,
        identity,
        threshold: THRESHOLD,
        keyServers: KEY_SERVER_CONFIGS.length,
      });

      const startTime = Date.now();
      
      const result = await this.sealClient!.encrypt({
        kemType: KemType.BonehFranklinBLS12381DemCCA, // BLS12-381 IBE
        demType: DemType.AesGcm256, // AES-256-GCM encryption
        threshold: THRESHOLD,
        packageId,
        id: identity,
        data,
        aad: new Uint8Array(), // Additional authenticated data (optional)
      });

      const elapsed = Date.now() - startTime;
      console.log('✅ Encryption successful', {
        encryptedSize: result.encryptedObject.length,
        keySize: result.key.length,
        timeMs: elapsed,
      });

      return {
        encryptedObject: result.encryptedObject,
        symmetricKey: result.key,
        packageId,
        id: identity,
      };
    } catch (error) {
      console.error('❌ Seal encryption failed:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack?.split('\n').slice(0, 3),
      });
      throw error;
    }
  }

  /**
   * Create a SessionKey for Seal decryption
   * User must sign a personal message to authorize key access
   */
  async createSessionKey(
    suiClient: SuiClient,
    address: string,
    packageId: string,
    signPersonalMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>
  ): Promise<SessionKey> {
    console.log('🔑 Creating Seal SessionKey...', {
      address,
      packageId,
      ttlMin: 30,
    });

    // Create SessionKey with 30 min TTL (max allowed)
    const sessionKey = await SessionKey.create({
      address,
      packageId,
      ttlMin: 30,
      suiClient,
    });

    // Get message to sign
    const message = sessionKey.getPersonalMessage();
    
    console.log('🖊️  Requesting user signature for SessionKey...');
    
    // User signs the message
    const { signature } = await signPersonalMessage({ message });
    
    // Complete SessionKey initialization
    sessionKey.setPersonalMessageSignature(signature);
    
    console.log('✅ SessionKey created and authorized!');
    
    return sessionKey;
  }

  /**
   * Decrypt content using real Seal SDK with SessionKey
   * Uses seal_approve transaction for authorization
   * 
   * @param encryptedObject - Encrypted data from Seal
   * @param packageId - Package ID
   * @param identity - Identity string (tier ID / policy ID)
   * @param sessionKey - SessionKey for decryption authorization
   * @param subscriptionNFTId - Subscription NFT ID for seal_approve
   * @param suiClient - SuiClient for building transactions
   * @returns Decrypted plaintext
   */
  async decryptContentWithSessionKey(
    encryptedObject: Uint8Array,
    packageId: string,
    identity: string,
    sessionKey: SessionKey,
    subscriptionNFTId: string,
    suiClient: SuiClient
  ): Promise<Uint8Array> {
    if (!this.sealClient) {
      await this.initialize();
    }

    try {
      console.log('🔓 Decrypting with real Seal SDK + seal_approve...', {
        encryptedSize: encryptedObject.length,
        identity,
        packageId,
        subscriptionNFT: subscriptionNFTId,
      });

      // Build transaction that calls seal_approve with CORRECT format
      // First parameter MUST be vector<u8> (the policy/identity ID)
      const tx = new Transaction();
      
      // Convert identity (tier ID / policy ID address string) to bytes
      // Remove "0x" prefix and convert hex to bytes
      const identityHex = identity.startsWith('0x') ? identity.slice(2) : identity;
      const identityBytes = new Uint8Array(
        identityHex.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []
      );
      
      console.log('📝 Building seal_approve transaction...', {
        identity,
        identityBytes: identityBytes.length,
        format: 'vector<u8> as per Seal SDK spec'
      });
      
      tx.moveCall({
        target: `${packageId}::subscription::seal_approve`,
        arguments: [
          tx.pure('vector<u8>', Array.from(identityBytes)),  // ✅ CORRECT: vector<u8>
        ],
      });

      // Build transaction bytes (NOT executed, just for proof)
      const txBytes = await tx.build({ 
        client: suiClient,
        onlyTransactionKind: true 
      });

      console.log('📝 Built seal_approve transaction', {
        txBytesLength: txBytes.length,
        function: 'seal_approve',
      });

      // Decrypt with Seal SDK
      const decrypted = await this.sealClient!.decrypt({
        data: encryptedObject,
        txBytes,
        sessionKey,
        checkShareConsistency: true,
        checkLEEncoding: false,
      });

      console.log('✅ Real Seal decryption successful!', {
        decryptedSize: decrypted.length,
        method: '100% Real Seal SDK decrypt() with seal_approve',
        note: 'Using real seal_approve function from contract!',
      });

      return new Uint8Array(decrypted);
    } catch (error) {
      console.error('❌ Seal decryption failed:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Fetch decryption keys from key servers
   * This should be called before decrypt to cache keys
   * 
   * @param ids - Identity IDs to fetch keys for
   * @param txBytes - Transaction bytes that approve access
   * @param sessionKey - Optional session key
   */
  async fetchKeys(
    ids: string[],
    txBytes: Uint8Array,
    sessionKey?: any
  ): Promise<void> {
    if (!this.sealClient) {
      await this.initialize();
    }

    try {
      console.log('🔑 Fetching keys from Seal key servers...', { ids });

      await this.sealClient!.fetchKeys({
        ids,
        txBytes,
        sessionKey,
        threshold: THRESHOLD,
      });

      console.log('✅ Keys fetched successfully');
    } catch (error) {
      console.error('❌ Failed to fetch keys:', error);
      throw error;
    }
  }

  /**
   * Get key servers information
   */
  async getKeyServers() {
    if (!this.sealClient) {
      await this.initialize();
    }

    return await this.sealClient!.getKeyServers();
  }
}

// Export singleton instance
let realSealServiceInstance: RealSealService | null = null;

export async function getRealSealService(suiClient?: SuiClient): Promise<RealSealService> {
  if (!realSealServiceInstance) {
    // Import default suiClient if not provided
    if (!suiClient) {
      const { suiClient: defaultClient } = await import("@/lib/sui/client");
      suiClient = defaultClient;
    }
    realSealServiceInstance = new RealSealService(suiClient);
  }
  return realSealServiceInstance;
}

