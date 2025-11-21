"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/sui/config";

interface SubscriptionCardProps {
  tier: {
    id: string;
    name: string;
    description: string;
    pricePerMonth: string;
    currentSubscribers: number;
    maxSubscribers: number;
  };
  profileId: string;
  isSubscribed?: boolean;
}

export function SubscriptionCard({ tier, profileId, isSubscribed }: SubscriptionCardProps) {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setSubscribing(true);

    try {
      const tx = new Transaction();
      
      // Calculate price in MIST (1 SUI = 1,000,000,000 MIST)
      const priceInMist = BigInt(parseFloat(tier.pricePerMonth) * 1_000_000_000);
      
      // Split coins for payment
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
      
      const clockObjectId = "0x6"; // Sui Clock object
      
      tx.moveCall({
        target: `${PACKAGE_ID}::subscription::subscribe`,
        arguments: [
          tx.object(tier.id),
          tx.object(profileId),
          coin,
          tx.object(clockObjectId),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Subscribed:", result);
            alert("Successfully subscribed!");
            window.location.reload();
          },
          onError: (error) => {
            console.error("Subscription error:", error);
            alert(`Subscription failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Subscribe error:", error);
      alert(`Subscription failed: ${error}`);
    } finally {
      setSubscribing(false);
    }
  };

  const isFull = tier.currentSubscribers >= tier.maxSubscribers;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-blue-500 transition">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-blue-600">
            {tier.pricePerMonth}
          </span>
          <span className="text-gray-600">SUI/month</span>
        </div>
      </div>

      <p className="text-gray-600 mb-6 min-h-[60px]">{tier.description}</p>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Subscribers</span>
          <span>
            {tier.currentSubscribers} / {tier.maxSubscribers}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${(tier.currentSubscribers / tier.maxSubscribers) * 100}%`,
            }}
          />
        </div>
      </div>

      {isSubscribed ? (
        <div className="bg-green-50 text-green-700 py-3 px-4 rounded-lg text-center font-semibold">
          ✓ Subscribed
        </div>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={subscribing || isFull}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {subscribing ? "Subscribing..." : isFull ? "Tier Full" : "Subscribe"}
        </button>
      )}

      {isFull && !isSubscribed && (
        <p className="text-sm text-red-600 text-center mt-2">
          This tier has reached its subscriber limit
        </p>
      )}
    </div>
  );
}

