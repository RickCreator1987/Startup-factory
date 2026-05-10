import { PublicKey } from "@solana/web3.js";

// You can hardcode initial authorities here.
// Later, you can make this dynamic by fetching from a PDA registry.
export const ADMIN_WALLETS: PublicKey[] = [
  new PublicKey("FILL_THIS_WITH_YOUR_MAIN_ADMIN_WALLET"),
  new PublicKey("OPTIONAL_SECOND_ADMIN_WALLET"),
];
