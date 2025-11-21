"use client";

import Link from "next/link";
import { WalletButton } from "@/components/auth/WalletButton";

// Mock data - in production, fetch from blockchain
const mockCreators = [
  {
    address: "0x1234567890abcdef",
    handle: "@artcreator",
    bio: "Digital artist creating NFT art and tutorials",
    subscribers: 156,
    tierCount: 3,
  },
  {
    address: "0xabcdef1234567890",
    handle: "@musicproducer",
    bio: "Music producer sharing beats and production tips",
    subscribers: 89,
    tierCount: 2,
  },
  {
    address: "0x9876543210fedcba",
    handle: "@devtutor",
    bio: "Web3 developer teaching blockchain development",
    subscribers: 234,
    tierCount: 3,
  },
];

export default function Explore() {
  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Web3 Patreon
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </Link>
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Creators</h1>
            <p className="text-gray-600">
              Discover amazing creators and support their work
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search creators..."
              className="w-full max-w-2xl border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* Creators Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {mockCreators.map((creator) => (
              <Link
                key={creator.address}
                href={`/creator/${creator.address}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{creator.handle}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {creator.bio}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {creator.subscribers}
                    </span>{" "}
                    subscribers
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">
                      {creator.tierCount}
                    </span>{" "}
                    tiers
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State for Demo */}
          <div className="mt-12 text-center bg-white rounded-lg shadow-md p-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              More creators coming soon!
            </h3>
            <p className="text-gray-600 mb-6">
              Be one of the first creators on Web3 Patreon
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </div>
  );
}

