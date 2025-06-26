const fs = require('fs');
const path = require('path');

// Read the compiled contract artifacts
const sarcophagusArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/Sarcophagus.sol/Sarcophagus.json', 'utf8'));
const obolArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/OBOL.sol/OBOL.json', 'utf8'));
const b3trRewardsArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/B3TRRewards.sol/B3TRRewards.json', 'utf8'));
const deathVerifierArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/DeathVerifier.sol/DeathVerifier.json', 'utf8'));
const multiSigWalletArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json', 'utf8'));

// Create the updated contracts.ts file
const contractsContent = `// Network configuration
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
    OBOL: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    B3TR_REWARDS: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    DEATH_VERIFIER: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    MULTISIG_WALLET: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    VTHO_TOKEN: '0x0000000000000000000000000000000000000000', // TODO: Update after testnet deployment
    B3TR_TOKEN: '0x0000000000000000000000000000000000000000' // TODO: Update after testnet deployment
  },
  // Mainnet addresses (to be updated after mainnet deployment)
  MAINNET: {
    SARCOPHAGUS: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    OBOL: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    B3TR_REWARDS: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    DEATH_VERIFIER: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    MULTISIG_WALLET: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    VTHO_TOKEN: '0x0000000000000000000000000000000000000000', // TODO: Update after mainnet deployment
    B3TR_TOKEN: '0x0000000000000000000000000000000000000000' // TODO: Update after mainnet deployment
  },
  // Local development addresses (Hardhat)
  LOCAL: {
    SARCOPHAGUS: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    OBOL: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    B3TR_REWARDS: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    DEATH_VERIFIER: '0xDc64a140Aa3E981100a9becA4E685f962fC0B8C9',
    MULTISIG_WALLET: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    VTHO_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa4',
    B3TR_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa5'
  }
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
  // Default to testnet for development
  return CONTRACT_ADDRESSES.TESTNET;
};

// Multi-sig wallet configuration
export const MULTISIG_CONFIG = {
  REQUIRED_CONFIRMATIONS: 2,
  TIMELOCK_DELAY: 24 * 60 * 60, // 24 hours in seconds
  SIGNERS: [
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
  ]
};

// Contract ABIs from compiled contracts
export const SARCOPHAGUS_ABI = ${JSON.stringify(sarcophagusArtifact.abi, null, 2)};

export const OBOL_ABI = ${JSON.stringify(obolArtifact.abi, null, 2)};

export const B3TR_REWARDS_ABI = ${JSON.stringify(b3trRewardsArtifact.abi, null, 2)};

export const DEATH_VERIFIER_ABI = ${JSON.stringify(deathVerifierArtifact.abi, null, 2)};

export const MULTISIG_WALLET_ABI = ${JSON.stringify(multiSigWalletArtifact.abi, null, 2)};

// Token ABIs (standard ERC20)
export const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
`;

// Write the updated contracts.ts file
fs.writeFileSync('./frontend/app/config/contracts.ts', contractsContent);

console.log('✅ ABIs extracted and contracts.ts updated successfully!');
console.log('📁 Updated: frontend/app/config/contracts.ts'); 