"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { walrusService } from "@/lib/walrus/client";
import { sealService } from "@/lib/seal/encryption";

interface ContentViewerProps {
  content: {
    id: string;
    title: string;
    description: string;
    walrusBlobId: string;
    sealPolicyId: string;
    isPublic: boolean;
    contentType: string;
    creator: string;
  };
  hasAccess: boolean;
}

export function ContentViewer({ content, hasAccess }: ContentViewerProps) {
  const account = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contentUrl, setContentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hasAccess || content.isPublic) {
      loadContent();
    }
  }, [content.walrusBlobId, hasAccess]);

  const loadContent = async () => {
    setLoading(true);
    setError("");

    try {
      // Download from Walrus
      const blob = await walrusService.downloadFile(content.walrusBlobId);
      
      if (content.isPublic) {
        // Public content - display directly
        const url = URL.createObjectURL(blob);
        setContentUrl(url);
      } else {
        // Encrypted content - decrypt first
        const encryptedData = new Uint8Array(await blob.arrayBuffer());
        
        // Get IV from localStorage
        const ivString = localStorage.getItem(`iv_${content.walrusBlobId}`);
        if (!ivString) {
          throw new Error("Decryption parameters not found");
        }
        
        const iv = new Uint8Array(ivString.split(",").map(Number));
        
        // Decrypt
        const decryptedData = await sealService.decryptContent(
          encryptedData,
          content.sealPolicyId,
          iv,
          account?.address || "",
          hasAccess
        );
        
        // Create URL from decrypted data
        const decryptedBlob = new Blob([new Uint8Array(decryptedData)]);
        const url = URL.createObjectURL(decryptedBlob);
        setContentUrl(url);
      }
    } catch (err) {
      console.error("Content load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess && !content.isPublic) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Locked Content
        </h3>
        <p className="text-gray-600">
          Subscribe or purchase to access this content
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadContent}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!contentUrl) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-xl font-bold">{content.title}</h3>
        {content.description && (
          <p className="text-gray-600 mt-2">{content.description}</p>
        )}
      </div>
      
      <div className="p-4">
        {content.contentType === "image" && (
          <img
            src={contentUrl}
            alt={content.title}
            className="w-full rounded-lg"
          />
        )}
        
        {content.contentType === "video" && (
          <video
            src={contentUrl}
            controls
            className="w-full rounded-lg"
          />
        )}
        
        {content.contentType === "audio" && (
          <audio
            src={contentUrl}
            controls
            className="w-full"
          />
        )}
        
        {content.contentType === "file" && (
          <div className="text-center py-8">
            <a
              href={contentUrl}
              download={content.title}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

