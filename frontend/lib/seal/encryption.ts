/**
 * Seal Encryption Service
 * 
 * Note: This is a simplified implementation for hackathon purposes.
 * In production, you would use the official Seal SDK when available.
 * 
 * For now, we implement basic encryption/decryption with access control logic
 * that can be verified on-chain via Subscription NFTs.
 */

export interface AccessPolicy {
  type: "subscription" | "purchase" | "public";
  requiredTierId?: string;
  creatorAddress: string;
  contentId?: string;
}

export interface EncryptionResult {
  encryptedData: Uint8Array;
  policyId: string;
  iv: Uint8Array;
}

export class SealService {
  /**
   * Encrypt content with an access policy
   * 
   * In a real Seal implementation, this would:
   * 1. Generate encryption keys
   * 2. Register the policy on-chain
   * 3. Encrypt the content
   * 4. Return encrypted data + policy ID
   */
  async encryptContent(
    content: Uint8Array,
    policy: AccessPolicy
  ): Promise<EncryptionResult> {
    try {
      // Generate a random encryption key
      const key = await this.generateKey();
      
      // Generate IV for AES
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the content
      const encryptedData = await this.encryptWithKey(content, key, iv);
      
      // Generate policy ID (in production, this would come from on-chain registration)
      const policyId = this.generatePolicyId(policy);
      
      // Store policy in local storage for demo purposes
      // In production, this would be on-chain
      this.storePolicyLocal(policyId, policy, key);
      
      return {
        encryptedData,
        policyId,
        iv,
      };
    } catch (error) {
      console.error("Seal encryption error:", error);
      throw error;
    }
  }

  /**
   * Decrypt content if user has access
   */
  async decryptContent(
    encryptedData: Uint8Array,
    policyId: string,
    iv: Uint8Array,
    userAddress: string,
    hasAccess: boolean
  ): Promise<Uint8Array> {
    try {
      // Verify access
      if (!hasAccess) {
        throw new Error("Access denied: User does not have required subscription or purchase");
      }

      // Retrieve encryption key from policy
      const key = await this.retrieveKeyFromPolicy(policyId);
      
      if (!key) {
        throw new Error("Encryption key not found for policy");
      }

      // Decrypt the content
      const decryptedData = await this.decryptWithKey(encryptedData, key, iv);
      
      return decryptedData;
    } catch (error) {
      console.error("Seal decryption error:", error);
      throw error;
    }
  }

  /**
   * Generate encryption key
   */
  private async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypt data with key
   */
  private async encryptWithKey(
    data: Uint8Array,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      new Uint8Array(data)
    );
    
    return new Uint8Array(encrypted);
  }

  /**
   * Decrypt data with key
   */
  private async decryptWithKey(
    encryptedData: Uint8Array,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      new Uint8Array(encryptedData)
    );
    
    return new Uint8Array(decrypted);
  }

  /**
   * Generate policy ID
   */
  private generatePolicyId(policy: AccessPolicy): string {
    const policyString = JSON.stringify(policy);
    const encoder = new TextEncoder();
    const data = encoder.encode(policyString + Date.now());
    
    // Simple hash for demo - in production, use proper hashing
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    
    return `seal_policy_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Store policy locally (temporary solution for hackathon)
   */
  private async storePolicyLocal(
    policyId: string,
    policy: AccessPolicy,
    key: CryptoKey
  ): Promise<void> {
    try {
      // Export key to store
      const exportedKey = await crypto.subtle.exportKey("jwk", key);
      
      const policyData = {
        policy,
        key: exportedKey,
        createdAt: Date.now(),
      };
      
      localStorage.setItem(`seal_policy_${policyId}`, JSON.stringify(policyData));
    } catch (error) {
      console.error("Error storing policy:", error);
    }
  }

  /**
   * Retrieve key from policy
   */
  private async retrieveKeyFromPolicy(policyId: string): Promise<CryptoKey | null> {
    try {
      const policyData = localStorage.getItem(`seal_policy_${policyId}`);
      
      if (!policyData) {
        return null;
      }
      
      const { key: exportedKey } = JSON.parse(policyData);
      
      // Import key
      return await crypto.subtle.importKey(
        "jwk",
        exportedKey,
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
    } catch (error) {
      console.error("Error retrieving key:", error);
      return null;
    }
  }

  /**
   * Create public content (no encryption)
   */
  createPublicPolicy(creatorAddress: string): AccessPolicy {
    return {
      type: "public",
      creatorAddress,
    };
  }

  /**
   * Create subscription-gated policy
   */
  createSubscriptionPolicy(
    creatorAddress: string,
    requiredTierId: string
  ): AccessPolicy {
    return {
      type: "subscription",
      requiredTierId,
      creatorAddress,
    };
  }

  /**
   * Create pay-per-view policy
   */
  createPurchasePolicy(
    creatorAddress: string,
    contentId: string
  ): AccessPolicy {
    return {
      type: "purchase",
      contentId,
      creatorAddress,
    };
  }
}

// Export singleton instance
export const sealService = new SealService();

