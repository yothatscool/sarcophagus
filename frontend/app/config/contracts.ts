// Mock ABIs for testing (will be replaced with actual imports after deployment)
export const SARCOPHAGUS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "beneficiaries",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "percentages",
        "type": "uint256[]"
      }
    ],
    "name": "createSarcophagus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const OBOL_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "lockTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const B3TR_REWARDS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "yearsEarly",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "inheritanceValue",
        "type": "uint256"
      }
    ],
    "name": "mintCarbonOffsetReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const DEATH_VERIFIER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "age",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "verificationHash",
        "type": "string"
      }
    ],
    "name": "verifyUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Network configuration
export const NETWORKS = {
  TESTNET: {
    chainId: 39,
    name: 'VeChain Testnet',
    rpcUrl: 'https://testnet.veblocks.net',
    explorer: 'https://explore-testnet.vechain.org'
  },
  MAINNET: {
    chainId: 1,
    name: 'VeChain Mainnet', 
    rpcUrl: 'https://mainnet.veblocks.net',
    explorer: 'https://explore.vechain.org'
  }
};

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Testnet addresses (to be updated after deployment)
  TESTNET: {
    SARCOPHAGUS: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    OBOL_TOKEN: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    B3TR_REWARDS: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    DEATH_VERIFIER: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    MULTISIG_WALLET: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    VTHO_TOKEN: '0x0000000000000000000000000000456E65726779', // VTHO address (same on testnet)
    B3TR_TOKEN: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699', // B3TR testnet address
    GLO_TOKEN: '0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e' // GLO testnet address
  },
  // Mainnet addresses (to be updated after mainnet deployment)
  MAINNET: {
    SARCOPHAGUS: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    OBOL_TOKEN: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    B3TR_REWARDS: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    DEATH_VERIFIER: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    MULTISIG_WALLET: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    VTHO_TOKEN: '0x0000000000000000000000000000456E65726779', // VTHO address (same on mainnet)
    B3TR_TOKEN: '0x0000000000000000000000000000000000000000', // TODO: Update with actual mainnet B3TR address
    GLO_TOKEN: '0x0000000000000000000000000000000000000000' // TODO: Update with actual mainnet GLO address
  },
  // Local development addresses (Hardhat) - Updated with actual deployed addresses
  LOCAL: {
    SARCOPHAGUS: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    OBOL_TOKEN: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    B3TR_REWARDS: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    DEATH_VERIFIER: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    MULTISIG_WALLET: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    VTHO_TOKEN: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // MockVTHOManager
    B3TR_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // MockB3TR
    GLO_TOKEN: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' // MockGLO
  }
};

// Oracle addresses for death verification
export const ORACLE_ADDRESSES = [
  '0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6',
  '0xa19f660abf4fed45226787cd17ef723d94d1ce31',
  '0xe791fec915dffd49f7353d826bbc361183f5ae22',
  '0x24a939b60cfcbcca540259c0a06d83369d9b534f',
  '0xbb8c80bc4ef02737493b1cfdf240e6ed7d20292d'
] as const;

// Multi-sig wallet configuration
export const MULTISIG_CONFIG = {
  signers: [
    '0x3d32fE6e85066240f3018c9FC664db7967d2d313', // Main protocol address (40% weight)
    '0x73f121d48ec8028a9a0e01166bbf6dec669ac940', // Signer 2 (25% weight)
    '0x804d23410d548594db9eabbb4ed2894f591e9d72', // Signer 3 (20% weight)
    '0x1b0a35f55c02f97fd9ab0af3980ca11eb8067a90', // Signer 4 (10% weight)
    '0xd0c282e767c9ea8fe773fba6c6847e7dd2a905c6'  // Signer 5 (5% weight)
  ],
  weights: [40, 25, 20, 10, 5], // Weights in percentage
  requiredWeight: 60 // 60% required for standard actions
};

// Protocol configuration
export const PROTOCOL_CONFIG = {
  // Fee rates (in basis points)
  INHERITANCE_FEE_RATE: 100, // 1% (100 basis points)
  OBOL_WITHDRAWAL_FEE_RATE: 50, // 0.5% (50 basis points)
  
  // OBOL tokenomics
  OBOL_DAILY_RATE: 1, // 0.01% daily (3.65% APY)
  OBOL_BONUS_RATE: 15, // 0.015% daily (5.475% APY) after 1 year
  OBOL_BONUS_THRESHOLD: 365 * 24 * 60 * 60, // 1 year in seconds
  
  // B3TR bonus rates
  B3TR_CARBON_OFFSET_BASE: 100, // Base B3TR for carbon offset
  B3TR_LEGACY_BASE: 100, // Base B3TR for legacy
  B3TR_LEGACY_PER_YEAR: 20, // Additional B3TR per year beyond life expectancy
  
  // Survivorship periods
  DEFAULT_SURVIVORSHIP_PERIOD: 30 * 24 * 60 * 60, // 30 days in seconds
  MAX_SURVIVORSHIP_PERIOD: 365 * 24 * 60 * 60, // 1 year in seconds
  
  // Oracle configuration
  MIN_ORACLE_CONFIRMATIONS: 3,
  ORACLE_VERIFICATION_EXPIRY: 30 * 24 * 60 * 60, // 30 days in seconds
  
  // Circuit breaker
  CIRCUIT_BREAKER_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
};

// Helper function to get contract addresses based on network
export const getContractAddresses = (network: 'TESTNET' | 'MAINNET' | 'LOCAL' = 'TESTNET') => {
  return CONTRACT_ADDRESSES[network];
};

// Helper function to get current network addresses
export const getCurrentNetworkAddresses = () => {
  if (typeof window !== 'undefined') {
    // Check if we're in a browser environment
    const chainId = (window as any).ethereum?.chainId;
    if (chainId === '0x27' || chainId === 39) {
      return CONTRACT_ADDRESSES.TESTNET;
    } else if (chainId === '0x1' || chainId === 1) {
      return CONTRACT_ADDRESSES.MAINNET;
    }
  }
  // Default to LOCAL for development since TESTNET addresses are placeholders
  return CONTRACT_ADDRESSES.LOCAL;
}; 