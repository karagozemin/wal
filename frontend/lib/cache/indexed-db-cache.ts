/**
 * IndexedDB Content Cache
 * Caches decrypted content to avoid re-decryption on page refresh
 * 
 * Storage limits:
 * - Max file size: 20MB (configurable)
 * - Cache duration: 8 hours
 * - Auto-cleanup on expiry
 */

const DB_NAME = 'decrypted_content_db';
const STORE_NAME = 'content_cache';
const DB_VERSION = 1;

const MAX_CACHEABLE_SIZE = 20 * 1024 * 1024; // 20MB
const CACHE_DURATION = 8 * 60 * 60 * 1000; // 8 hours

interface CachedContent {
  contentId: string;
  blob: Blob;
  contentType: string;
  decryptedAt: number;
  expiresAt: number;
  size: number;
  tierId?: string;
}

/**
 * Open or create IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('❌ IndexedDB open failed:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'contentId' });
        
        // Create indexes for faster queries
        objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        objectStore.createIndex('tierId', 'tierId', { unique: false });
        
        console.log('✅ IndexedDB object store created');
      }
    };
  });
}

/**
 * Cache decrypted content to IndexedDB
 */
export async function cacheDecryptedContent(
  contentId: string,
  blob: Blob,
  tierId?: string
): Promise<boolean> {
  try {
    // Check size limit
    if (blob.size > MAX_CACHEABLE_SIZE) {
      console.log('⚠️ Content too large to cache:', {
        size: blob.size,
        limit: MAX_CACHEABLE_SIZE,
        sizeMB: (blob.size / 1024 / 1024).toFixed(2) + 'MB',
      });
      return false;
    }
    
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const cached: CachedContent = {
      contentId,
      blob,
      contentType: blob.type,
      decryptedAt: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
      size: blob.size,
      tierId,
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(cached);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    console.log('💾 Content cached to IndexedDB:', {
      contentId: contentId.slice(0, 10) + '...',
      size: (blob.size / 1024).toFixed(2) + 'KB',
      expiresIn: '8 hours',
    });
    
    // Clean up expired entries in background
    cleanupExpiredCache().catch(console.error);
    
    return true;
  } catch (error) {
    console.error('❌ IndexedDB cache failed:', error);
    return false;
  }
}

/**
 * Get cached content from IndexedDB
 */
export async function getCachedContent(contentId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const cached = await new Promise<CachedContent | undefined>((resolve, reject) => {
      const request = store.get(contentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (!cached) {
      return null;
    }
    
    // Check expiry
    if (Date.now() > cached.expiresAt) {
      console.log('🗑️ Cached content expired, removing...');
      await clearCachedContent(contentId);
      return null;
    }
    
    const remainingHours = Math.floor((cached.expiresAt - Date.now()) / 1000 / 60 / 60);
    console.log('♻️ Using cached content from IndexedDB', {
      contentId: contentId.slice(0, 10) + '...',
      size: (cached.size / 1024).toFixed(2) + 'KB',
      remainingHours: remainingHours + 'h',
    });
    
    return cached.blob;
  } catch (error) {
    console.error('❌ IndexedDB read failed:', error);
    return null;
  }
}

/**
 * Clear specific cached content
 */
export async function clearCachedContent(contentId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(contentId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    console.log('🗑️ Cleared cached content:', contentId.slice(0, 10) + '...');
  } catch (error) {
    console.error('❌ Failed to clear cached content:', error);
  }
}

/**
 * Clear all cached content (e.g., on logout)
 */
export async function clearAllContentCache(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    console.log('🗑️ All content cache cleared');
  } catch (error) {
    console.error('❌ Failed to clear all cache:', error);
  }
}

/**
 * Clear cached content for a specific tier (e.g., subscription cancelled)
 */
export async function clearCacheByTier(tierId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('tierId');
    
    const request = index.openCursor(IDBKeyRange.only(tierId));
    
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
    
    console.log('🗑️ Cleared cache for tier:', tierId.slice(0, 10) + '...');
  } catch (error) {
    console.error('❌ Failed to clear tier cache:', error);
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('expiresAt');
    
    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);
    
    let deletedCount = 0;
    
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
    
    if (deletedCount > 0) {
      console.log(`🗑️ Cleaned up ${deletedCount} expired cache entries`);
    }
  } catch (error) {
    console.error('❌ Failed to cleanup expired cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  count: number;
  totalSize: number;
  oldestEntry: number;
}> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const allEntries = await new Promise<CachedContent[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    const totalSize = allEntries.reduce((sum, entry) => sum + entry.size, 0);
    const oldestEntry = allEntries.length > 0 
      ? Math.min(...allEntries.map(e => e.decryptedAt))
      : Date.now();
    
    return {
      count: allEntries.length,
      totalSize,
      oldestEntry,
    };
  } catch (error) {
    console.error('❌ Failed to get cache stats:', error);
    return { count: 0, totalSize: 0, oldestEntry: Date.now() };
  }
}

