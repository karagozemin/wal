"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "@/lib/sui/client";
import { PACKAGE_ID } from "@/lib/sui/config";
import Link from "next/link";

interface SubscriptionListing {
  id: string;
  tierId: string;
  tierName: string;
  creator: string;
  subscriber: string;
  expiresAt: number;
  price: string;
}

export default function MarketplacePage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [loading, setLoading] = useState(true);
  const [mySubscriptions, setMySubscriptions] = useState<SubscriptionListing[]>([]);
  const [allListings, setAllListings] = useState<SubscriptionListing[]>([]);
  const [transferring, setTransferring] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");

  useEffect(() => {
    if (account?.address) {
      fetchMySubscriptions();
    }
  }, [account?.address]);

  const fetchMySubscriptions = async () => {
    if (!account?.address) return;
    
    setLoading(true);
    try {
      // Query for user's Subscription NFTs
      const subscriptions = await suiClient.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${PACKAGE_ID}::subscription::Subscription`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log("User's subscriptions:", subscriptions.data.length);

      const listings: SubscriptionListing[] = [];

      for (const item of subscriptions.data) {
        if (item.data?.content?.dataType === "moveObject") {
          const fields = item.data.content.fields as any;
          
          // Fetch tier name
          const tierObj = await suiClient.getObject({
            id: fields.tier_id,
            options: { showContent: true },
          });

          let tierName = "Unknown Tier";
          if (tierObj.data?.content?.dataType === "moveObject") {
            const tierFields = tierObj.data.content.fields as any;
            tierName = tierFields.name;
          }

          listings.push({
            id: item.data.objectId,
            tierId: fields.tier_id,
            tierName,
            creator: fields.creator,
            subscriber: fields.subscriber,
            expiresAt: parseInt(fields.expires_at),
            price: "0", // Set price when listing
          });
        }
      }

      setMySubscriptions(listings);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (subscriptionId: string) => {
    if (!recipientAddress || !recipientAddress.startsWith("0x")) {
      alert("Please enter a valid Sui address");
      return;
    }

    setTransferring(subscriptionId);

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::subscription::transfer_subscription`,
        arguments: [
          tx.object(subscriptionId),
          tx.pure.address(recipientAddress),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            alert("Subscription transferred successfully!");
            setRecipientAddress("");
            fetchMySubscriptions();
          },
          onError: (error) => {
            console.error("Transfer failed:", error);
            alert(`Transfer failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Transfer error:", error);
      alert(`Transfer failed: ${error}`);
    } finally {
      setTransferring(null);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view the NFT marketplace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                🐋 WAL
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-bold text-gray-900">Subscription NFT Marketplace</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            🎟️ Subscription NFT Marketplace
          </h3>
          <p className="text-blue-800">
            Transfer your Subscription NFTs to others! Each NFT grants access to exclusive creator content.
            The new owner will inherit all remaining subscription time.
          </p>
        </div>

        {/* My Subscriptions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Subscription NFTs</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your subscriptions...</p>
            </div>
          ) : mySubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-600 mb-4">You don't have any subscription NFTs yet</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Explore Creators
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySubscriptions.map((sub) => {
                const now = Date.now();
                const daysRemaining = Math.ceil((sub.expiresAt - now) / (1000 * 60 * 60 * 24));
                const isExpired = now >= sub.expiresAt;

                return (
                  <div
                    key={sub.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{sub.tierName}</h3>
                        {isExpired ? (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            Expired
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(sub.expiresAt).toLocaleDateString()}
                      </p>
                      {!isExpired && (
                        <p className="text-sm text-blue-600 font-medium">
                          {daysRemaining} days remaining
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer to:
                      </label>
                      <input
                        type="text"
                        value={transferring === sub.id ? recipientAddress : ""}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        onFocus={() => setTransferring(sub.id)}
                        className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 bg-white mb-2"
                        placeholder="0x..."
                      />
                      <button
                        onClick={() => handleTransfer(sub.id)}
                        disabled={transferring === sub.id && !recipientAddress}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
                      >
                        {transferring === sub.id ? "Transferring..." : "Transfer NFT"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 How It Works</h3>
          <div className="space-y-2 text-gray-700">
            <p>• Each Subscription NFT is a unique on-chain asset that grants access to creator content</p>
            <p>• NFTs can be transferred to any Sui address</p>
            <p>• The new owner immediately gains access to all tier benefits</p>
            <p>• Remaining subscription time transfers with the NFT</p>
            <p>• Perfect for gifting or selling premium subscriptions!</p>
          </div>
        </div>
      </main>
    </div>
  );
}

