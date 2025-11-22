"use client";

import { useState, useEffect } from "react";
import { getCacheStats, clearAllContentCache, cleanupExpiredCache } from "@/lib/cache/indexed-db-cache";

/**
 * Cache Statistics Component
 * Shows IndexedDB cache status and management controls
 * For debugging / admin use
 */
export function CacheStats() {
  const [stats, setStats] = useState<{
    count: number;
    totalSize: number;
    oldestEntry: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    const data = await getCacheStats();
    setStats(data);
    setLoading(false);
  };

  const handleClearCache = async () => {
    if (confirm("Clear all cached content? You'll need to decrypt again.")) {
      await clearAllContentCache();
      await loadStats();
    }
  };

  const handleCleanup = async () => {
    await cleanupExpiredCache();
    await loadStats();
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) return null;

  const sizeMB = (stats.totalSize / 1024 / 1024).toFixed(2);
  const ageHours = Math.floor((Date.now() - stats.oldestEntry) / 1000 / 60 / 60);

  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">💾 Content Cache (IndexedDB)</h3>
        <button
          onClick={loadStats}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500">Cached Items</div>
          <div className="text-lg font-semibold">{stats.count}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Total Size</div>
          <div className="text-lg font-semibold">{sizeMB} MB</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Oldest</div>
          <div className="text-lg font-semibold">{ageHours}h ago</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCleanup}
          className="flex-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
        >
          Clean Expired
        </button>
        <button
          onClick={handleClearCache}
          className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
        >
          Clear All
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        ℹ️ Cache expires after 8 hours. Content &lt; 20MB only.
      </div>
    </div>
  );
}

