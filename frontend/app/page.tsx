"use client";

import Link from "next/link";
import { WalletButton } from "@/components/auth/WalletButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent">
        {/* Header */}
        <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
                <img 
                  src="/walron.JPG" 
                  alt="Walron Logo" 
                  className="w-9 h-9 object-contain rounded-lg"
                />
                <h1 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">
                  Walron
                </h1>
              </Link>
              <nav className="flex items-center gap-3 sm:gap-6">
                <Link
                  href="/explore"
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Explore
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <div className="flex-shrink-0">
                  <WalletButton />
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-6 py-20 md:py-32 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Built on Sui • Powered by Walrus & Seal
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 dark:text-white mb-6 leading-[1.1] tracking-tight">
                Support creators.
                <br />
                <span className="text-slate-500 dark:text-slate-400">
                  Own the future.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                The first truly decentralized creator economy. Encrypted content, unstoppable hosting, 
                and subscription NFTs you can trade.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors text-sm shadow-sm"
                >
                  Start Creating
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-3 rounded-lg font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  Explore Creators
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-12 text-center pt-8 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">$0</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Platform Fees</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">100%</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Decentralized</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">∞</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Censorship-Resistant</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-slate-50/30 dark:bg-slate-900/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">
                How it works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                A new way to support creators, built for the decentralized web
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Encrypted & Private</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  Content encrypted with Seal Protocol. Only subscribers with the right NFT can decrypt and view.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Unstoppable Storage</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  Files stored on Walrus distributed network. No single point of failure, always accessible.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Zero Platform Fees</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  Direct payments on Sui blockchain. 100% goes to creators. No middleman taking a cut.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="border-y border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/20 py-16">
          <div className="container mx-auto px-6">
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-white text-center mb-10 tracking-tight">
              Built on the Sui Stack
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Sui</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Smart contracts for subscriptions and access control
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Walrus</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Decentralized storage for all content
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Seal</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Encryption and access policies
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-white mb-3 tracking-tight">
            Ready to get started?
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Connect your wallet and create your profile in minutes
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors text-sm"
          >
            Launch App
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-100 dark:border-slate-800 py-8">
          <div className="container mx-auto px-6">
            <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
              <p>Built for Walrus Haulout Hackathon 2025</p>
              <p className="mt-2 text-xs">
                Powered by Sui • Walrus • Seal
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}
