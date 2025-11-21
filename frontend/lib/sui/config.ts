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

export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0xcc0b3ce8945e7d149899b8d58e6c470bd80ed6909f32976f177270bc31b4af21";
export const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as "testnet" | "mainnet";

