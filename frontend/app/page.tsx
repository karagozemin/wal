"use client";

import Link from "next/link";
import { WalletButton } from "@/components/auth/WalletButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Web3 Patreon</h1>
            <WalletButton />
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6" style={{ color: '#111827' }}>
            Support Creators.
            <br />
            <span className="text-blue-600">Own Your Content.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            The first decentralized creator platform built on Sui Stack.
            Encrypted storage with Seal, distributed hosting on Walrus.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
            >
              Start Creating
            </Link>
            <Link
              href="/explore"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition text-lg"
            >
              Explore Creators
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Web3 Patreon?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Encrypted Content</h4>
              <p className="text-gray-600">
                Your content is encrypted with Seal protocol. Only subscribers can access it.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Decentralized Storage</h4>
              <p className="text-gray-600">
                Content stored on Walrus protocol. Censorship-resistant and always available.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Direct Payments</h4>
              <p className="text-gray-600">
                No middleman. Creators receive 100% of subscription fees directly on Sui.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="container mx-auto px-4 py-20 bg-gray-50 rounded-3xl my-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Built on the Sui Stack
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Sui</div>
              <p className="text-gray-600">
                Smart contracts for subscriptions and access control
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Walrus</div>
              <p className="text-gray-600">
                Decentralized storage for all content
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Seal</div>
              <p className="text-gray-600">
                Encryption and access policies
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h3 className="text-3xl font-bold mb-6">
            Ready to get started?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet and create your profile in minutes
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
          >
            Launch App
          </Link>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t mt-20">
          <div className="text-center text-gray-600">
            <p>Built for Walrus Haulout Hackathon 2024</p>
            <p className="mt-2 text-sm">
              Powered by Sui • Walrus • Seal
            </p>
          </div>
        </footer>
      </div>
  );
}
