// Auto-generated from deployment
export const CONTRACT_ADDRESSES = {
  // Testnet addresses (VeChain Testnet) - Updated with corrected deployed contracts
  testnet: {
    sarcophagus: '0x80f0e023555063617D1671CF560335Cbd8d40bB0',
    obolToken: '0x05459899FE7274Bb043532B8cE7AadE809165da3',
    b3trRewards: '0xD711E420B76fAB9b034F58c742E1b23E92e0B930',
    deathVerifier: '0xd97D799F09b1D0B950210Bf2726856b578B85caC',
    multiSigWallet: '0xACE75E2f990860c6614a1DB4d2BbB5bf6105fFcE',
    // Token addresses for deposits
    vet: '0x0000000000000000000000000000000000000000', // Native VET
    vtho: '0x0000000000000000000000000000000000000000', // Native VTHO
    b3tr: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699', // B3TR token
    glo: '0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e', // GLO token
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

// Helper function to get current network addresses
export const getCurrentNetworkAddresses = (network: 'testnet' | 'mainnet' = 'testnet') => {
  return CONTRACT_ADDRESSES[network];
};

// Contract ABIs - Basic interfaces for common functions
export const OBOL_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const SARCOPHAGUS_ABI = [
  {
    "inputs": [{"name": "", "type": "address"}],
    "name": "sarcophagi",
    "outputs": [
      {"name": "vetAmount", "type": "uint256"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "beneficiaries", "type": "tuple[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "address"}],
    "name": "verifications",
    "outputs": [
      {"name": "isVerified", "type": "bool"},
      {"name": "age", "type": "uint8"},
      {"name": "verificationHash", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "beneficiaries", "type": "address[]"},
      {"name": "percentages", "type": "uint16[]"},
      {"name": "guardians", "type": "address[]"},
      {"name": "isMinors", "type": "bool[]"},
      {"name": "ages", "type": "uint8[]"},
      {"name": "contingentBeneficiaries", "type": "address[]"},
      {"name": "survivorshipPeriods", "type": "uint256[]"}
    ],
    "name": "createSarcophagus",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

export const B3TR_REWARDS_ABI = [
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "calculateRewards",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const DEATH_VERIFIER_ABI = [
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "age", "type": "uint8"},
      {"name": "lifeExpectancy", "type": "uint8"},
      {"name": "verificationHash", "type": "string"}
    ],
    "name": "verifyUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "deathTimestamp", "type": "uint256"},
      {"name": "age", "type": "uint8"},
      {"name": "lifeExpectancy", "type": "uint8"},
      {"name": "deathCertificate", "type": "string"}
    ],
    "name": "requestDeathVerification",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

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
  chainId: 0, // VeChain testnet
  rpcUrl: "https://testnet.vechain.org",
  explorerUrl: "https://explore-testnet.vechain.org"
} as const;
