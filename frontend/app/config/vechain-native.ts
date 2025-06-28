import Connex from '@vechain/connex';

// VeChain Native Configuration
export const VECHAIN_CONFIG = {
  // Testnet configuration
  testnet: {
    node: 'https://testnet.vechain.org',
    network: 'test' as const,
    contracts: {
      sarcophagus: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      obolToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      b3trRewards: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
      deathVerifier: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      multiSigWallet: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      // Token addresses for deposits
      vet: '0x0000000000000000000000000000000000000000', // Native VET
      vtho: '0x0000000000000000000000000000456E65726779', // VTHO
      b3tr: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699', // B3TR testnet
      glo: '0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e', // GLO testnet
    }
  },
  // Mainnet configuration (to be updated when deployed)
  mainnet: {
    node: 'https://mainnet.vechain.org',
    network: 'main' as const,
    contracts: {
      sarcophagus: '0x0000000000000000000000000000000000000000',
      obolToken: '0x0000000000000000000000000000000000000000',
      b3trRewards: '0x0000000000000000000000000000000000000000',
      deathVerifier: '0x0000000000000000000000000000000000000000',
      multiSigWallet: '0x0000000000000000000000000000000000000000',
      vet: '0x0000000000000000000000000000000000000000',
      vtho: '0x0000000000000000000000000000456E65726779',
      b3tr: '0x0000000000000000000000000000000000000000',
      glo: '0x0000000000000000000000000000000000000000',
    }
  }
};

// Oracle addresses for death verification
export const ORACLE_ADDRESSES = [
  '0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6',
  '0xa19f660abf4fed45226787cd17ef723d94d1ce31',
  '0x8c8d7c46219d9205f056f28fee5950ad564d9f23',
  '0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc',
  '0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c'
];

// Initialize Connex instance
export function createConnex(network: 'testnet' | 'mainnet' = 'testnet') {
  const config = VECHAIN_CONFIG[network];
  return new Connex({
    node: config.node,
    network: config.network
  });
}

// Get contract addresses for current network
export function getContractAddresses(network: 'testnet' | 'mainnet' = 'testnet') {
  return VECHAIN_CONFIG[network].contracts;
}

// VeChain-specific utility functions
export const VECHAIN_UTILS = {
  // Convert VET to wei (VeChain uses 18 decimals like Ethereum)
  toWei: (amount: string | number): string => {
    return (Number(amount) * 1e18).toString();
  },
  
  // Convert wei to VET
  fromWei: (amount: string): string => {
    return (Number(amount) / 1e18).toString();
  },
  
  // Format VET amount for display
  formatVET: (amount: string): string => {
    return Number(VECHAIN_UTILS.fromWei(amount)).toFixed(6);
  },
  
  // Get VeChain explorer URL
  getExplorerUrl: (address: string, network: 'testnet' | 'mainnet' = 'testnet'): string => {
    const baseUrl = network === 'testnet' 
      ? 'https://explore-testnet.vechain.org' 
      : 'https://explore.vechain.org';
    return `${baseUrl}/address/${address}`;
  }
}; 