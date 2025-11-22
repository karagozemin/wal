"use client";

import { useState, useRef, useEffect } from "react";
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import Link from "next/link";
import { clearSessionCache } from "@/lib/seal/session-cache";
import { clearAllContentCache } from "@/lib/cache/indexed-db-cache";

export function WalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!account) {
    return <ConnectButton />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {account.address.slice(2, 4).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {account.address}
            </div>
          </div>

          <div className="py-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>

            <Link
              href={`/creator/${account.address}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Public Profile
            </Link>
          </div>

          <div className="border-t border-gray-100 py-2">
            <button
              onClick={() => {
                clearSessionCache(); // Clear Seal SessionKey cache
                clearAllContentCache(); // Clear IndexedDB content cache
                disconnect();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

