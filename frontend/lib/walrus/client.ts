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
   * Based on official example: https://github.com/MystenLabs/walrus/blob/main/docs/examples/javascript/blob_upload_download_webapi.html
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      console.log("Uploading to Walrus:", this.publisherUrl);
      console.log("File size:", file.size, "bytes");

      // Use the correct endpoint: /v1/blobs with epochs parameter
      // Following the official JavaScript example
      const numEpochs = 1;
      const response = await fetch(`${this.publisherUrl}/v1/blobs?epochs=${numEpochs}`, {
        method: "PUT",
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Walrus error response:", errorText);
        throw new Error(`Walrus upload failed (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Walrus response:", data);
      
      // Response format from Walrus docs:
      // { newlyCreated: { blobObject: { blobId, storage: { endEpoch }, id } } }
      // or { alreadyCertified: { blobId, endEpoch, event: { txDigest } } }
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
      throw error;
    }
  }

  /**
   * Download a file from Walrus
   * Based on official example: GET /v1/blobs/{blob_id}
   */
  async downloadFile(blobId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${blobId}`);
      
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
    return `${this.aggregatorUrl}/v1/blobs/${blobId}`;
  }

  /**
   * Check if a blob exists
   */
  async blobExists(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${blobId}`, {
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

