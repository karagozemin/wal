"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/sui/config";

interface CancelButtonProps {
  subscription: {
    id: string;
    tierId: string;
    tierName: string;
  };
  profileId: string;
  onSuccess?: () => void;
}

export function CancelButton({ subscription, profileId, onSuccess }: CancelButtonProps) {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::subscription::cancel`,
        arguments: [
          tx.object(subscription.id), // subscription (owned object, will be consumed)
          tx.object(subscription.tierId), // tier
          tx.object(profileId), // profile
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Subscription cancelled:", result);
            alert(`✅ Subscription cancelled successfully.`);
            if (onSuccess) onSuccess();
            window.location.reload();
          },
          onError: (error) => {
            console.error("Cancellation error:", error);
            alert(`❌ Cancellation failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Cancel error:", error);
      alert(`❌ Cancellation failed: ${error}`);
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-2 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg font-medium text-sm transition border border-gray-300 hover:border-red-300"
      >
        Cancel Subscription
      </button>
    );
  }

  return (
    <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
      <div className="mb-3">
        <h4 className="text-sm font-bold text-red-900 mb-2">
          ⚠️ Confirm Cancellation
        </h4>
        <p className="text-xs text-red-700">
          Are you sure you want to cancel your subscription to{" "}
          <strong>{subscription.tierName}</strong>?
        </p>
        <p className="text-xs text-red-600 mt-2 font-medium">
          • You will lose access to exclusive content<br />
          • This action cannot be undone<br />
          • No refund will be issued
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          disabled={cancelling}
          className="flex-1 py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition border border-gray-300 disabled:opacity-50"
        >
          Keep Subscription
        </button>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelling ? (
            <span className="flex items-center justify-center gap-1">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
              Cancelling...
            </span>
          ) : (
            "Yes, Cancel"
          )}
        </button>
      </div>
    </div>
  );
}

