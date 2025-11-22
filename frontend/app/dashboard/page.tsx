"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { WalletButton } from "@/components/auth/WalletButton";
import { ContentUploader } from "@/components/creator/ContentUploader";
import { ContentViewer } from "@/components/content/ContentViewer";
import { EditContentModal } from "@/components/content/EditContentModal";
import { PACKAGE_ID } from "@/lib/sui/config";
import { suiClient } from "@/lib/sui/client";
import Link from "next/link";

export default function Dashboard() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [loading, setLoading] = useState(true);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [creatingTier, setCreatingTier] = useState(false);
  const [tiers, setTiers] = useState<Array<{ id: string; name: string; currentSubscribers: number; pricePerMonth: string }>>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [myContent, setMyContent] = useState<Array<{
    content_id: string;
    title: string;
    is_public: boolean;
    walrus_blob_id: string;
    seal_policy_id: string;
    description: string;
    content_type: string;
    is_archived: boolean;
    encryption_key: string;
    required_tier_id: string;
  }>>([]);
  
  // Form states
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [tierName, setTierName] = useState("");
  const [tierDescription, setTierDescription] = useState("");
  const [tierPrice, setTierPrice] = useState("");
  const [maxSubscribers, setMaxSubscribers] = useState("100");
  
  // Edit modal state
  const [editingContent, setEditingContent] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);
  
  // Archive/Unarchive states
  const [showArchived, setShowArchived] = useState(false);
  const [archivedContent, setArchivedContent] = useState<Array<{
    content_id: string;
    title: string;
    is_public: boolean;
    walrus_blob_id: string;
    seal_policy_id: string;
    description: string;
    content_type: string;
    is_archived: boolean;
    encryption_key: string;
    required_tier_id: string;
  }>>([]);

  // Auto-fetch creator profile on mount
  useEffect(() => {
    if (account?.address) {
      fetchCreatorProfile();
    }
  }, [account?.address]);

  const fetchCreatorProfile = async () => {
    if (!account?.address) return;
    
    setLoading(true);
    try {
      // Query for ProfileCreated events from this user
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::creator_profile::ProfileCreated`,
        },
        limit: 50,
      });

      // Find this user's profile
      const userProfileEvent = events.data.find(
        (event: any) => event.parsedJson?.owner === account.address
      );

      if (userProfileEvent && userProfileEvent.parsedJson) {
        const eventData = userProfileEvent.parsedJson as any;
        const profileIdFromEvent = eventData.profile_id;
        console.log("Found profile:", profileIdFromEvent);
        setProfileId(profileIdFromEvent);
        setHasProfile(true);
        
        // Fetch existing tiers for this profile
        await fetchTiers(profileIdFromEvent);
        // Fetch user's content
        await fetchMyContent();
      } else {
        console.log("No profile found for this wallet");
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyContent = async () => {
    if (!account?.address) return;
    
    try {
      // Query for ContentCreated events from this user
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::content::ContentCreated`,
        },
        limit: 50,
      });

      // Filter content created by this user
      const userContentEvents = events.data.filter(
        (event: any) => event.parsedJson?.creator === account.address
      );

      // Fetch full content objects
      const userContentWithDetails = await Promise.all(
        userContentEvents.map(async (event: any) => {
          const data = event.parsedJson;
          try {
            const contentObject = await suiClient.getObject({
              id: data.content_id,
              options: { showContent: true },
            });

            const fields = (contentObject.data?.content as any)?.fields || {};
            
            return {
              content_id: data.content_id,
              title: data.title || fields.title || "Untitled",
              is_public: data.is_public,
              walrus_blob_id: fields.walrus_blob_id || "",
              seal_policy_id: fields.seal_policy_id || "",
              description: fields.description || "",
              content_type: fields.content_type || "media",
              is_archived: fields.is_archived || false,
              encryption_key: fields.encryption_key || "",
              required_tier_id: fields.required_tier_id || "",
            };
          } catch (error) {
            console.error(`Error fetching content ${data.content_id}:`, error);
            return {
              content_id: data.content_id,
              title: data.title,
              is_public: data.is_public,
              walrus_blob_id: "",
              seal_policy_id: "",
              description: "",
              content_type: "media",
              is_archived: false,
              encryption_key: "",
              required_tier_id: "",
            };
          }
        })
      );

      // Separate active and archived content
      const activeContent = userContentWithDetails.filter(c => !c.is_archived);
      const archivedContentList = userContentWithDetails.filter(c => c.is_archived);
      
      setMyContent(activeContent);
      setArchivedContent(archivedContentList);
      console.log("Found active content:", activeContent);
      console.log("Found archived content:", archivedContentList);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const fetchTiers = async (profileId: string) => {
    try {
      // Query for TierCreated events for this profile
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::subscription::TierCreated`,
        },
        limit: 50,
      });

      // Filter tiers for this creator and fetch full tier data
      const profileTierEvents = events.data.filter((event: any) => {
        return event.parsedJson?.creator === account?.address;
      });

      // Fetch full tier objects to get current_subscribers
      const tiersWithDetails = await Promise.all(
        profileTierEvents.map(async (event: any) => {
          try {
            const tierId = event.parsedJson?.tier_id;
            const tierObject = await suiClient.getObject({
              id: tierId,
              options: { showContent: true },
            });

            const fields = (tierObject.data?.content as any)?.fields || {};
            return {
              id: tierId,
              name: event.parsedJson?.name || fields.name || "Untitled",
              currentSubscribers: parseInt(fields.current_subscribers || "0"),
              pricePerMonth: (parseInt(fields.price_per_month || "0") / 1e9).toString(),
            };
          } catch (error) {
            console.error("Error fetching tier details:", error);
            return {
              id: event.parsedJson?.tier_id,
              name: event.parsedJson?.name || "Untitled",
              currentSubscribers: 0,
              pricePerMonth: "0",
            };
          }
        })
      );

      setTiers(tiersWithDetails);
      
      // Calculate analytics
      const totalSubs = tiersWithDetails.reduce((sum, tier) => sum + tier.currentSubscribers, 0);
      const monthlyRevenue = tiersWithDetails.reduce(
        (sum, tier) => sum + (tier.currentSubscribers * parseFloat(tier.pricePerMonth)),
        0
      );
      
      setTotalSubscribers(totalSubs);
      setTotalRevenue(monthlyRevenue);
      
      console.log("Found tiers with analytics:", tiersWithDetails, {
        totalSubs,
        monthlyRevenue: monthlyRevenue.toFixed(2) + " SUI",
      });
    } catch (error) {
      console.error("Error fetching tiers:", error);
    }
  };

  const handleCreateProfile = async () => {
    if (!account || !handle || !bio) {
      alert("Please fill all fields");
      return;
    }

    setCreatingProfile(true);

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::creator_profile::create_profile`,
        arguments: [
          tx.pure.string(handle),
          tx.pure.string(bio),
          tx.pure.string("default_profile_image"),
          tx.pure.string("default_banner_image"),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result: any) => {
            console.log("Profile created:", result);
            
            // Wait a bit for the transaction to be indexed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Re-fetch profile to get the real ID
            await fetchCreatorProfile();
            
            alert("Profile created successfully!");
          },
          onError: (error) => {
            console.error("Profile creation error:", error);
            alert(`Profile creation failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Profile creation error:", error);
      alert(`Profile creation failed: ${error}`);
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleCreateTier = async () => {
    if (!tierName || !tierPrice) {
      alert("Please fill required fields");
      return;
    }

    setCreatingTier(true);

    try {
      const tx = new Transaction();
      
      const priceInMist = BigInt(parseFloat(tierPrice) * 1_000_000_000);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::subscription::create_tier`,
        arguments: [
          tx.object(profileId),
          tx.pure.string(tierName),
          tx.pure.string(tierDescription),
          tx.pure.u64(priceInMist),
          tx.pure.u64(BigInt(maxSubscribers)),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log("Tier created:", result);
            alert("Tier created successfully!");
            
            // Wait and re-fetch tiers
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchTiers(profileId);
            
            // Reset form
            setTierName("");
            setTierDescription("");
            setTierPrice("");
          },
          onError: (error) => {
            console.error("Tier creation error:", error);
            alert(`Tier creation failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Tier creation error:", error);
      alert(`Tier creation failed: ${error}`);
    } finally {
      setCreatingTier(false);
    }
  };

  const handleEditContent = (content: typeof myContent[0]) => {
    setEditingContent({
      id: content.content_id,
      title: content.title,
      description: content.description,
    });
  };

  // Edit content handled by EditContentModal component

  const handleArchiveContent = async (contentId: string) => {
    if (!confirm("Archive this content? It will be hidden from your profile.")) {
      return;
    }

    setIsUpdating(true);
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::content::archive_content`,
        arguments: [
          tx.object(contentId),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result: any) => {
            console.log("Content archived:", result);
            alert("Content archived successfully! 📦");
            
            // Re-fetch content
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchMyContent();
          },
          onError: (error) => {
            console.error("Archive failed:", error);
            alert(`Archive failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Archive error:", error);
      alert(`Archive failed: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnarchiveContent = async (contentId: string) => {
    if (!confirm("Restore this content? It will be visible again.")) {
      return;
    }

    setIsUpdating(true);
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::content::unarchive_content`,
        arguments: [
          tx.object(contentId),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result: any) => {
            console.log("Content restored:", result);
            alert("Content restored successfully! 🔄");
            
            // Re-fetch content
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchMyContent();
          },
          onError: (error) => {
            console.error("Restore failed:", error);
            alert(`Restore failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error("Restore error:", error);
      alert(`Restore failed: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the dashboard
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  Web3 Patreon
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Creator Dashboard</span>
              </div>
              <WalletButton />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  Web3 Patreon
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Creator Dashboard</span>
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {!hasProfile ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold mb-6">Create Your Profile</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Handle *
                    </label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="@yourname"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio *
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      rows={4}
                      placeholder="Tell your fans about yourself..."
                    />
                  </div>

                  <button
                    onClick={handleCreateProfile}
                    disabled={creatingProfile}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    {creatingProfile ? "Creating..." : "Create Profile"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats - Real Analytics */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-blue-700">Total Subscribers</div>
                    <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-blue-900">{totalSubscribers}</div>
                  <div className="text-xs text-blue-600 mt-1">Across {tiers.length} tier{tiers.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-green-700">Monthly Revenue</div>
                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-green-900">{totalRevenue.toFixed(2)}</div>
                  <div className="text-xs text-green-600 mt-1">SUI per month</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-purple-700">Total Content</div>
                    <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-purple-900">{myContent.filter(c => !c.is_archived).length}</div>
                  <div className="text-xs text-purple-600 mt-1">{myContent.filter(c => c.is_archived).length} archived</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-orange-700">Active Tiers</div>
                    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-orange-900">{tiers.length}</div>
                  <div className="text-xs text-orange-600 mt-1">Subscription options</div>
                </div>
              </div>

              {/* Create Subscription Tier */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create Subscription Tier</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tier Name *
                    </label>
                    <input
                      type="text"
                      value={tierName}
                      onChange={(e) => setTierName(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="e.g., Basic, Premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (SUI/month) *
                    </label>
                    <input
                      type="number"
                      value={tierPrice}
                      onChange={(e) => setTierPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="5.0"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={tierDescription}
                      onChange={(e) => setTierDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      rows={2}
                      placeholder="What subscribers get..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Subscribers
                    </label>
                    <input
                      type="number"
                      value={maxSubscribers}
                      onChange={(e) => setMaxSubscribers(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="100"
                      min="1"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleCreateTier}
                      disabled={creatingTier}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {creatingTier ? "Creating..." : "Create Tier"}
                    </button>
                  </div>
                </div>

                {tiers.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Your Tiers:</p>
                    <div className="flex flex-wrap gap-2">
                      {tiers.map((tier) => (
                        <span
                          key={tier.id}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {tier.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Content */}
              {tiers.length > 0 && (
                <ContentUploader profileId={profileId} tiers={tiers} />
              )}

              {/* My Content */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">My Content</h3>
                  
                  {/* Tab Switcher */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setShowArchived(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        !showArchived 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📁 Active ({myContent.length})
                    </button>
                    <button
                      onClick={() => setShowArchived(true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        showArchived 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📦 Archived ({archivedContent.length})
                    </button>
                  </div>
                </div>
                
                {/* Active Content */}
                {!showArchived && (
                  <>
                    {myContent.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">
                        No active content. Create some content above! 📝
                      </p>
                    ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myContent.map((content) => (
                      <div
                        key={content.content_id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                      >
                        {/* Thumbnail Preview */}
                        <div className="relative bg-gray-100 overflow-hidden">
                          <ContentViewer
                            content={{
                              id: content.content_id,
                              title: content.title,
                              description: content.description,
                              walrusBlobId: content.walrus_blob_id,
                              sealPolicyId: content.seal_policy_id,
                              isPublic: content.is_public,
                              contentType: content.content_type,
                              creator: account?.address || "",
                              encryptionKey: content.encryption_key,
                              requiredTierId: content.required_tier_id,
                            }}
                            hasAccess={true}
                            compact={true}
                          />
                          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              content.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {content.is_public ? '🌐' : '🔒'}
                            </span>
                            {!content.is_public && !content.encryption_key && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ⚠️ Key Missing
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">{content.title}</h4>
                          {content.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{content.description}</p>
                          )}
                          
                          {/* Warning for missing encryption key */}
                          {!content.is_public && !content.encryption_key && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                              ⚠️ Encryption key missing. Re-upload recommended.
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditContent(content)}
                              className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleArchiveContent(content.content_id)}
                              className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition font-medium"
                            >
                              📦 Archive
                            </button>
                            <a
                              href={`https://suiscan.xyz/testnet/object/${content.content_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition"
                              title="View on Sui"
                            >
                              🔗
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                    )}
                  </>
                )}

                {/* Archived Content */}
                {showArchived && (
                  <>
                    {archivedContent.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">
                        No archived content. Archive some content to see them here! 📦
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {archivedContent.map((content) => (
                          <div
                            key={content.content_id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white opacity-75"
                          >
                            {/* Thumbnail Preview */}
                            <div className="relative bg-gray-100 overflow-hidden">
                              <ContentViewer
                                content={{
                                  id: content.content_id,
                                  title: content.title,
                                  description: content.description,
                                  walrusBlobId: content.walrus_blob_id,
                                  sealPolicyId: content.seal_policy_id,
                                  isPublic: content.is_public,
                                  contentType: content.content_type,
                                  creator: account?.address || "",
                                  encryptionKey: content.encryption_key,
                                  requiredTierId: content.required_tier_id,
                                }}
                                hasAccess={true}
                                compact={true}
                              />
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  📦 Archived
                                </span>
                                {!content.is_public && !content.encryption_key && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    ⚠️ Key Missing
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Content Info */}
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-1 truncate">{content.title}</h4>
                              {content.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{content.description}</p>
                              )}
                              
                              {/* Archived Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUnarchiveContent(content.content_id)}
                                  disabled={isUpdating}
                                  className="flex-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition font-medium disabled:opacity-50"
                                >
                                  🔄 Restore
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Permanently delete this content? This cannot be undone!")) {
                                      alert("Permanent delete not implemented yet. Use archive for now.");
                                    }
                                  }}
                                  className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition font-medium"
                                >
                                  🗑️ Delete
                                </button>
                                <a
                                  href={`https://suiscan.xyz/testnet/object/${content.content_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition"
                                  title="View on Sui"
                                >
                                  🔗
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit Content Modal */}
        {editingContent && (
          <EditContentModal
            content={editingContent}
            isOpen={true}
            onClose={() => setEditingContent(null)}
            onSuccess={async () => {
              await fetchMyContent();
            }}
          />
        )}
      </div>
  );
}

