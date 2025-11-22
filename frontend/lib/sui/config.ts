import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export { networkConfig, useNetworkVariable, useNetworkVariables };

// Updated: 2024-11-22 - Added expiry check to seal_approve()
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x3957388874954b7da66b555c6ea2756ad95dfc670881fed7a89e0b427753e544";
export const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as "testnet" | "mainnet";

