"use client";

import Link from "next/link";
import { WalletButton } from "@/components/auth/WalletButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">W3</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Web3 Patreon
                </h1>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/explore"
                  className="text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Explore
                </Link>
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
          
          <div className="container mx-auto px-4 py-24 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-8 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">
                  Built on Sui • Powered by Walrus & Seal
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Support creators.
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Own the future.
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                The first truly decentralized creator economy. Encrypted content, unstoppable hosting, 
                and subscription NFTs you can trade. Zero platform fees, infinite possibilities.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold hover:from-blue-700 hover:to-purple-700 transition text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  Start Creating →
                </Link>
                <Link
                  href="/explore"
                  className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition text-lg"
                >
                  Find Creators
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">$0</div>
                  <div className="text-sm text-gray-600">Platform Fees</div>
                </div>
                <div className="border-l border-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Decentralized</div>
                </div>
                <div className="border-l border-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">∞</div>
                  <div className="text-sm text-gray-600">Censorship-Resistant</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How it works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A new way to support creators, built for the decentralized web
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Encrypted & Private</h3>
                <p className="text-gray-600 leading-relaxed">
                  Content encrypted with Seal Protocol. Only subscribers with the right NFT can decrypt and view.
                </p>
              </div>

              <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Unstoppable Storage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Files stored on Walrus distributed network. No single point of failure, always accessible.
                </p>
              </div>

              <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Zero Platform Fees</h3>
                <p className="text-gray-600 leading-relaxed">
                  Direct payments on Sui blockchain. 100% goes to creators. No middleman taking a cut.
                </p>
              </div>
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
