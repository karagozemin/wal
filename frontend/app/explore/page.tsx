"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletButton } from "@/components/auth/WalletButton";
import { suiClient } from "@/lib/sui/client";
import { PACKAGE_ID } from "@/lib/sui/config";
import { resolveAddressToName } from "@/lib/suins/client";

interface Creator {
  address: string;
  handle: string;
  bio: string;
  profileId: string;
  contentCount: number;
  suinsName?: string | null; // SuiNS name if available
}

export default function Explore() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllCreators();
  }, []);

  const fetchAllCreators = async () => {
    setLoading(true);
    try {
      // Fetch all ProfileCreated events
      const profileEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::creator_profile::ProfileCreated`,
        },
        limit: 50,
        order: "descending",
      });

      // Fetch all ContentCreated events to count content per creator
      const contentEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::content::ContentCreated`,
        },
        limit: 100,
        order: "descending",
      });

      // Count content per creator
      const contentCountMap: Record<string, number> = {};
      contentEvents.data.forEach((event: any) => {
        const creator = event.parsedJson?.creator;
        if (creator) {
          contentCountMap[creator] = (contentCountMap[creator] || 0) + 1;
        }
      });

      // Map profiles to creators
      const creatorsList: Creator[] = await Promise.all(
        profileEvents.data.map(async (event: any) => {
        const data = event.parsedJson;
          const address = data.owner;
          const profileId = data.profile_id;
          
          // Fetch full profile object to get bio and images
          let bio = "Creator on Walron";
          let handle = data.handle || address.slice(0, 8);
          
          try {
            const profileObj = await suiClient.getObject({
              id: profileId,
              options: { showContent: true },
            });

            if (profileObj.data?.content?.dataType === "moveObject") {
              const fields = profileObj.data.content.fields as any;
              bio = fields.bio || bio;
              handle = fields.handle || handle;
            }
          } catch (error) {
            console.log(`Could not fetch profile details for ${address.slice(0, 8)}...`);
          }
          
          // Resolve SuiNS name for each creator
          let suinsName: string | null = null;
          try {
            suinsName = await resolveAddressToName(address, suiClient);
          } catch (error) {
            console.log(`Could not resolve SuiNS for ${address.slice(0, 8)}...`);
          }
          
        return {
            address,
            handle,
            bio,
            profileId,
            contentCount: contentCountMap[address] || 0,
            suinsName,
        };
        })
      );

      setCreators(creatorsList);
      console.log("Fetched creators:", creatorsList);
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(
    (creator) =>
      creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-transparent">
        {/* Header */}
        <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-white tracking-tight">
                <img 
                  src="/walron.JPG" 
                  alt="Walron Logo" 
                  className="w-8 h-8 object-contain rounded-lg"
                />
                Walron
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Explore Creators</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Discover amazing creators and support their work
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-2xl border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-800 dark:text-white bg-white dark:bg-slate-900 focus:border-slate-300 dark:focus:border-slate-600 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-700 outline-none transition-colors"
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <img 
                src="/walrus-loading.jpg" 
                alt="Loading..." 
                className="w-24 h-24 object-cover rounded-full animate-bounce mx-auto"
              />
              <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-400">Loading creators...</p>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-16">
              <svg
                className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4"
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
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                {searchQuery ? "No creators found" : "No creators yet"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first creator on Walron!"}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
              >
                Start Creating
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => {
                // Priority: SuiNS name > handle > address
                const creatorUrl = creator.suinsName || creator.handle || creator.address;
                
                return (
                <Link
                  key={creator.address}
                  href={`/creator/${creatorUrl}`}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-lg">
                      {creator.handle[0].toUpperCase()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-white mb-1 truncate">
                        @{creator.handle}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {creator.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {creator.contentCount}
                      </span>{" "}
                      posts
                    </div>
                    {creator.suinsName ? (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {creator.suinsName}
                      </div>
                    ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-500 truncate">
                      {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                    </div>
                    )}
                  </div>
                </Link>
              )})}
            </div>
          )}

        </div>
      </div>
  );
}

