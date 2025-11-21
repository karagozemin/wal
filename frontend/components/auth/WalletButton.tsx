"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function WalletButton() {
  const account = useCurrentAccount();

  return (
    <div className="flex items-center gap-4">
      {account && (
        <div className="text-sm text-gray-600">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </div>
      )}
      <ConnectButton />
    </div>
  );
}

