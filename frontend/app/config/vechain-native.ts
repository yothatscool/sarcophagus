import Connex from '@vechain/connex';

// VeChain Native Configuration
export const VECHAIN_CONFIG = {
  // Testnet configuration - Updated with actual deployed contracts
  testnet: {
    node: 'https://testnet.vechain.org',
    network: 'test' as const,
    contracts: {
      sarcophagus: '0xDdC3EA7774D8159cA36941Cd8C2242f0BddDDD86',
      obolToken: '0x7Bf213e820f681BcdEDB2595B1Aeb304A6638dB9',
      b3trRewards: '0x354f8114254f985fB5ebc4401B4330bB6393ed18',
      deathVerifier: '0xe010129bE20F85845d169BF656310e9F695687A7',
      multiSigWallet: '0x8077A68349049658f5d8E387AaD7475422E04aF7',
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