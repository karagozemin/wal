/**
 * SuiNS Client for Name Resolution
 * Resolves .sui domains to addresses and vice versa
 */

import { SuiClient } from '@mysten/sui/client';
import { SuinsClient } from '@mysten/suins';
import { SUI_NETWORK } from '@/lib/sui/config';

let suinsClient: SuinsClient | null = null;

/**
 * Initialize SuiNS client (lazy)
 */
function getSuiNSClient(suiClient: SuiClient): SuinsClient {
  if (!suinsClient) {
    suinsClient = new SuinsClient({
      client: suiClient,
      network: SUI_NETWORK, // 'testnet' or 'mainnet'
    });
  }
  return suinsClient;
}

/**
 * Resolve a .sui name to an address
 * @param name - SuiNS name (e.g., "alice.sui")
 * @param suiClient - Sui client instance
 * @returns Address or null if not found
 */
export async function resolveNameToAddress(
  name: string,
  suiClient: SuiClient
): Promise<string | null> {
  try {
    // Ensure name has .sui suffix (getNameRecord requires full name)
    const fullName = name.endsWith('.sui') ? name : `${name}.sui`;
    console.log(`🔍 Resolving SuiNS name: ${fullName}`);
    
    const client = getSuiNSClient(suiClient);
    const result = await client.getNameRecord(fullName);
    
    const address = result?.targetAddress || null;
    if (address) {
      console.log(`✅ SuiNS: ${fullName} → ${address}`);
    } else {
      console.log(`⚠️ SuiNS: ${fullName} resolved but no targetAddress found`);
    }
    return address;
  } catch (error) {
    console.error(`❌ SuiNS: ${name} not found or error:`, error);
    return null;
  }
}

/**
 * Reverse resolve an address to .sui name
 * Uses Sui RPC API (not SDK) as per SuiNS documentation
 * @param address - Sui address
 * @param suiClient - Sui client instance
 * @returns SuiNS name or null if not found
 */
export async function resolveAddressToName(
  address: string,
  suiClient: SuiClient
): Promise<string | null> {
  try {
    console.log(`🔍 Resolving address to SuiNS name: ${address.slice(0, 8)}...`);
    
    // Use Sui RPC API for reverse lookup (SDK doesn't support this)
    // According to SuiNS docs: "You do not need to use the SDK for name resolution"
    const result = await suiClient.resolveNameServiceNames({ address });
    
    if (result && result.data && result.data.length > 0) {
      // Get the first (default) name
      const name = result.data[0];
      const finalName = name.endsWith('.sui') ? name : `${name}.sui`;
      console.log(`✅ SuiNS: ${address.slice(0, 8)}... → ${finalName}`);
      return finalName;
    }
    
    console.log(`ℹ️ No SuiNS name found for ${address.slice(0, 8)}...`);
    return null;
  } catch (error) {
    console.error(`❌ SuiNS error for ${address.slice(0, 8)}...:`, error);
    return null;
  }
}

/**
 * Check if a string is a valid SuiNS name format
 */
export function isSuiNSName(input: string): boolean {
  return input.endsWith('.sui') && input.length > 4;
}

/**
 * Format display name (SuiNS or shortened address)
 * @param address - User address
 * @param suinsName - Optional SuiNS name
 * @returns Formatted display name
 */
export function formatDisplayName(address: string, suinsName?: string | null): string {
  if (suinsName) {
    return suinsName;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get user's SuiNS name if they have one
 * @param address - User address
 * @param suiClient - Sui client instance
 * @returns SuiNS name or null
 */
export async function getUserSuiNS(
  address: string,
  suiClient: SuiClient
): Promise<string | null> {
  try {
    console.log(`🔍 Checking SuiNS for address: ${address.slice(0, 8)}...`);
    const name = await resolveAddressToName(address, suiClient);
    if (name) {
      console.log(`✅ Found SuiNS name: ${name}`);
    } else {
      console.log(`ℹ️ No SuiNS name found for this address`);
    }
    return name;
  } catch (error) {
    console.error('❌ Error getting user SuiNS:', error);
    return null;
  }
}

