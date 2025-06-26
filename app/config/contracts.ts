// Contract addresses (VeChain Testnet)
export const CONTRACT_ADDRESSES = {
  SARCOPHAGUS: process.env.NEXT_PUBLIC_SARCOPHAGUS_ADDRESS || '0x...',
  OBOL: process.env.NEXT_PUBLIC_OBOL_ADDRESS || '0x...',
  DEATH_VERIFIER: process.env.NEXT_PUBLIC_DEATH_VERIFIER_ADDRESS || '0x...',
  VTHO: process.env.NEXT_PUBLIC_VTHO_ADDRESS || '0x...',
  B3TR: process.env.NEXT_PUBLIC_B3TR_ADDRESS || '0x...'
};

// Minimal ABI for compilation (replace with full ABI as needed)
export const SARCOPHAGUS_ABI = [
  "function createSarcophagus(address[] calldata beneficiaries, uint256[] calldata percentages) external"
];
export const OBOL_ABI = [
  "function claimContinuousRewards(address user) external"
]; 