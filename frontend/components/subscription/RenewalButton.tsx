"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/sui/config";

interface RenewalButtonProps {
  subscription: {
    id: string;
    tierId: string;
    tierName: string;
    tierPrice: string; // In SUI
    expiresAt: number; // timestamp
  };
  profileId: string;
  onSuccess?: () => void;
}

export function RenewalButton({ subscription, profileId, onSuccess }: RenewalButtonProps) {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [renewing, setRenewing] = useState(false);

  // Calculate days until expiry
  const now = Date.now();
  const daysRemaining = Math.floor((subscription.expiresAt - now) / 1000 / 60 / 60 / 24);
  const hoursRemaining = Math.floor((subscription.expiresAt - now) / 1000 / 60 / 60);
  const isExpiringSoon = daysRemaining <= 7;
  const isExpired = subscription.expiresAt < now;

  const handleRenew = async () => {
    setRenewing(true);

    try {
      const tx = new Transaction();

      // Calculate price in MIST (1 SUI = 1,000,000,000 MIST)
      const priceInMist = BigInt(parseFloat(subscription.tierPrice) * 1_000_000_000);

      // Split coins for payment
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);

      const clockObjectId = "0x6"; // Sui Clock object

      tx.moveCall({
        target: `${PACKAGE_ID}::subscription::renew`,
        arguments: [
          tx.object(subscription.id), // subscription
          tx.object(subscription.tierId), // tier
          tx.object(profileId), // profile
          coin, // payment
          tx.object(clockObjectId), // clock
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Subscription renewed:", result);
            alert(`✅ Subscription renewed! Valid for 30 more days.`);
            if (onSuccess) onSuccess();
            window.location.reload();
          },
          onError: (error) => {
            console.error("Renewal error:", error);
            alert(`❌ Renewal failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Renew error:", error);
      alert(`❌ Renewal failed: ${error}`);
    } finally {
      setRenewing(false);
    }
  };

  // Don't show button if more than 7 days remaining (unless expired)
  if (!isExpired && daysRemaining > 7) {
    return null;
  }

  return (
    <div className="mt-4">
      {/* Expiry Warning */}
      {isExpired ? (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-900 mb-1">
                ⚠️ Subscription Expired
              </h3>
              <p className="text-sm text-red-700">
                Your subscription to <strong>{subscription.tierName}</strong> has expired.
                Renew now to regain access to exclusive content!
              </p>
            </div>
          </div>
        </div>
      ) : isExpiringSoon ? (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-yellow-900 mb-1">
                ⏰ Expiring Soon
              </h3>
              <p className="text-sm text-yellow-700">
                Your subscription to <strong>{subscription.tierName}</strong> expires in{" "}
                {daysRemaining > 0 ? (
                  <strong>{daysRemaining} day{daysRemaining > 1 ? "s" : ""}</strong>
                ) : (
                  <strong>{hoursRemaining} hour{hoursRemaining > 1 ? "s" : ""}</strong>
                )}
                . Renew now to avoid losing access!
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Renewal Button */}
      <button
        onClick={handleRenew}
        disabled={renewing}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl ${
          isExpired
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {renewing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Renewing...
          </span>
        ) : (
          <>
            {isExpired ? "🔄 Renew Subscription" : "🔄 Renew Now"} - {subscription.tierPrice} SUI
          </>
        )}
      </button>

      {/* Additional Info */}
      <p className="text-xs text-gray-500 text-center mt-2">
        Renewal extends your subscription by 30 days from {isExpired ? "now" : "current expiry"}
      </p>
    </div>
  );
}

