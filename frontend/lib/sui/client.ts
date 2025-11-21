import { SuiClient } from "@mysten/sui/client";
import { SUI_NETWORK } from "./config";
import { getFullnodeUrl } from "@mysten/sui/client";

export const suiClient = new SuiClient({
  url: getFullnodeUrl(SUI_NETWORK),
});

export default suiClient;

