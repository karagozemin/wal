// Walrus testnet URLs - try multiple options
const WALRUS_PUBLISHERS = [
  process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || "https://publisher.walrus-testnet.walrus.space",
  "https://walrus-testnet-publisher.nodes.guru",
  "https://wal-publisher-testnet.staketab.org",
];

const WALRUS_PUBLISHER = WALRUS_PUBLISHERS[0];
const WALRUS_AGGREGATOR = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || "https://aggregator.walrus-testnet.walrus.space";

export interface UploadResponse {
  blobId: string;
  endEpoch: number;
  suiRef?: string;
}

export class WalrusService {
  private publisherUrl: string;
  private aggregatorUrl: string;

  constructor() {
    this.publisherUrl = WALRUS_PUBLISHER;
    this.aggregatorUrl = WALRUS_AGGREGATOR;
  }

  /**
   * Upload a file to Walrus
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      console.log("Uploading to Walrus:", this.publisherUrl);
      console.log("File size:", file.size, "bytes");

      // For hackathon demo: Use mock blob ID if Walrus is unavailable
      // In production, this would always use real Walrus
      const USE_MOCK = false; // Set to true if Walrus testnet is down
      
      if (USE_MOCK) {
        console.warn("Using mock Walrus blob ID for demo");
        return {
          blobId: `mock_blob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          endEpoch: Date.now() + 30 * 24 * 60 * 60 * 1000,
        };
      }

      // Try different Walrus endpoints
      // Walrus testnet might use different endpoints
      const endpoints = [
        `/v1/store`,
        `/store`,
        `/v1/blobs`,
      ];

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${this.publisherUrl}${endpoint}`);
          response = await fetch(`${this.publisherUrl}${endpoint}`, {
            method: "PUT",
            body: file,
          });

          if (response.ok) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          } else {
            console.log(`Failed with ${endpoint}: ${response.status}`);
            lastError = new Error(`${response.status}: ${response.statusText}`);
          }
        } catch (err) {
          console.error(`Error with ${endpoint}:`, err);
          lastError = err;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`All Walrus endpoints failed. Last error: ${lastError}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Walrus error response:", errorText);
        throw new Error(`Walrus upload failed (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Walrus response:", data);
      
      // Response format: { newlyCreated: { blobObject: { blobId, ... }, ... } }
      // or { alreadyCertified: { blobId, ... } }
      if (data.newlyCreated) {
        return {
          blobId: data.newlyCreated.blobObject.blobId,
          endEpoch: data.newlyCreated.blobObject.storage.endEpoch,
          suiRef: data.newlyCreated.blobObject.id,
        };
      } else if (data.alreadyCertified) {
        return {
          blobId: data.alreadyCertified.blobId,
          endEpoch: data.alreadyCertified.endEpoch,
        };
      }

      throw new Error("Unexpected Walrus response format");
    } catch (error: any) {
      console.error("Walrus upload error:", error);
      
      // Provide helpful error message
      if (error.message?.includes('Failed to fetch')) {
        throw new Error(
          'Cannot connect to Walrus testnet. Please check:\n' +
          '1. Internet connection\n' +
          '2. Walrus testnet status\n' +
          '3. CORS settings\n\n' +
          'For demo purposes, you can enable mock mode in the code.'
        );
      }
      
      throw error;
    }
  }

  /**
   * Download a file from Walrus
   */
  async downloadFile(blobId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Walrus download error:", error);
      throw error;
    }
  }

  /**
   * Get the URL for a blob
   */
  getBlobUrl(blobId: string): string {
    return `${this.aggregatorUrl}/v1/${blobId}`;
  }

  /**
   * Check if a blob exists
   */
  async blobExists(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`, {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const walrusService = new WalrusService();

