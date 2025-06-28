// Auto-generated from deployment
export const CONTRACT_ADDRESSES = {
  SARCOPHAGUS: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  DEATH_VERIFIER: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  OBOL_TOKEN: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  B3TR_REWARDS: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  MULTISIG_WALLET: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
} as const;

export const ORACLE_ADDRESSES = [
  "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
  "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
  "0xe791fec915dffd49f7353d826bbc361183f5ae22",
  "0x24a939b60cfcbcca540259c0a06d83369d9b534f",
  "0xbb8c80bc4ef02737493b1cfdf240e6ed7d20292d"
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
