"use client";

import { use } from "react";
import { WalletButton } from "@/components/auth/WalletButton";
import { SubscriptionCard } from "@/components/payment/SubscriptionCard";
import { TipButton } from "@/components/payment/TipButton";
import { ContentViewer } from "@/components/content/ContentViewer";
import Link from "next/link";

// Mock data - in production, fetch from blockchain
const getMockCreatorData = (address: string) => ({
  profile: {
    id: "profile_123",
    address,
    handle: "@creator",
    bio: "Creating amazing content on Web3 Patreon!",
    profileImage: "",
    bannerImage: "",
    totalSubscribers: 42,
    totalRevenue: "156.5",
  },
  tiers: [
    {
      id: "tier_1",
      name: "Basic",
      description: "Access to basic content and community",
      pricePerMonth: "5",
      currentSubscribers: 25,
      maxSubscribers: 100,
    },
    {
      id: "tier_2",
      name: "Premium",
      description: "All basic benefits + exclusive content and early access",
      pricePerMonth: "10",
      currentSubscribers: 15,
      maxSubscribers: 50,
    },
    {
      id: "tier_3",
      name: "VIP",
      description: "Everything + 1-on-1 sessions and custom requests",
      pricePerMonth: "25",
      currentSubscribers: 2,
      maxSubscribers: 10,
    },
  ],
  content: [
    {
      id: "content_1",
      title: "Welcome to My Page!",
      description: "Introduction and what to expect",
      walrusBlobId: "blob_123",
      sealPolicyId: "public",
      isPublic: true,
      contentType: "video",
      creator: address,
    },
    {
      id: "content_2",
      title: "Exclusive Tutorial",
      description: "Premium content for subscribers",
      walrusBlobId: "blob_456",
      sealPolicyId: "policy_456",
      isPublic: false,
      contentType: "video",
      creator: address,
    },
  ],
});

export default function CreatorProfile({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const data = getMockCreatorData(address);

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Web3 Patreon
              </Link>
              <WalletButton />
            </div>
          </div>
        </header>

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-48" />

        <div className="container mx-auto px-4">
          {/* Profile Section */}
          <div className="relative -mt-20 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-gray-300 rounded-full flex-shrink-0" />
                
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.profile.handle}</h1>
                  <p className="text-gray-600 mb-4">{data.profile.bio}</p>
                  
                  <div className="flex gap-6 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {data.profile.totalSubscribers}
                      </span>{" "}
                      subscribers
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {data.profile.totalRevenue} SUI
                      </span>{" "}
                      total revenue
                    </div>
                  </div>

                  <TipButton
                    creatorAddress={address}
                    profileId={data.profile.id}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Tiers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Tiers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {data.tiers.map((tier) => (
                <SubscriptionCard
                  key={tier.id}
                  tier={tier}
                  profileId={data.profile.id}
                  isSubscribed={false}
                />
              ))}
            </div>
          </section>

          {/* Content Feed */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Content</h2>
            <div className="space-y-6">
              {data.content.map((content) => (
                <div key={content.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <ContentViewer
                    content={content}
                    hasAccess={content.isPublic}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
  );
}

