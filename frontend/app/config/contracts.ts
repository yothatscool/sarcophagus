// Auto-generated from deployment
export const CONTRACT_ADDRESSES = {
  // Testnet addresses (VeChain Testnet)
  testnet: {
    sarcophagus: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    obolToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    b3trRewards: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    deathVerifier: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    multiSigWallet: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    // Token addresses for deposits
    vet: '0x0000000000000000000000000000000000000000', // Native VET
    vtho: '0x0000000000000000000000000000000000000000', // Native VTHO
    b3tr: '0x0000000000000000000000000000000000000000', // Placeholder - update when available
    glo: '0x0000000000000000000000000000000000000000', // Placeholder - update when available
  },
  // Mainnet addresses (VeChain Mainnet) - to be updated when deployed
  mainnet: {
    sarcophagus: '0x0000000000000000000000000000000000000000',
    obolToken: '0x0000000000000000000000000000000000000000',
    b3trRewards: '0x0000000000000000000000000000000000000000',
    deathVerifier: '0x0000000000000000000000000000000000000000',
    multiSigWallet: '0x0000000000000000000000000000000000000000',
    vet: '0x0000000000000000000000000000000000000000',
    vtho: '0x0000000000000000000000000000000000000000',
    b3tr: '0x0000000000000000000000000000000000000000',
    glo: '0x0000000000000000000000000000000000000000',
  }
};

export const ORACLE_ADDRESSES = [
  '0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6',
  '0xa19f660abf4fed45226787cd17ef723d94d1ce31',
  '0x8c8d7c46219d9205f056f28fee5950ad564d9f23',
  '0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc',
  '0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c'
] as const;

export const MULTISIG_CONFIG = {
  signers: [
    "0x3d32fE6e85066240f3018c9FC664db7967d2d313",
    "0x73f121d48ec8028a9a0e01166bbf6dec669ac940",
    "0x804d23410d548594db9eabbb4ed2894f591e9d72",
    "0x1b0a35f55c02f97fd9ab0af3980ca11eb8067a90",
    "0xd0c282e767c9ea8fe773fba6c6847e7dd2a905c6"
  ],
  weights: [40, 25, 20, 10, 5],
  requiredWeight: 60
} as const;

export const NETWORK_CONFIG = {
  name: "VeChain Testnet",
  chainId: 1, // VeChain mainnet, use 0 for testnet
  rpcUrl: "https://mainnet.veblocks.net",
  explorerUrl: "https://explore.vechain.org"
} as const;
