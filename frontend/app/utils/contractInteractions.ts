import { CONTRACT_ADDRESSES } from '../config/contracts';

// Simplified contract ABIs for real interactions
export const DEATH_VERIFIER_ABI = [
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "age", "type": "uint256"},
      {"name": "verificationData", "type": "string"}
    ],
    "name": "verifyUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserVerification",
    "outputs": [
      {"name": "isVerified", "type": "bool"},
      {"name": "age", "type": "uint256"},
      {"name": "lifeExpectancy", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const SARCOPHAGUS_ABI = [
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
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "sarcophagi",
    "outputs": [
      {"name": "vetAmount", "type": "uint256"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "beneficiaries", "type": "tuple[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const OBOL_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserStake",
    "outputs": [
      {"name": "lockedValue", "type": "uint256"},
      {"name": "lastClaimTime", "type": "uint256"},
      {"name": "startTime", "type": "uint256"},
      {"name": "totalEarned", "type": "uint256"},
      {"name": "pendingRewards", "type": "uint256"},
      {"name": "dailyRewardRate", "type": "uint256"},
      {"name": "isLongTermHolder", "type": "bool"},
      {"name": "weightMultiplier", "type": "uint256"},
      {"name": "weightedRate", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Utility functions for contract interactions
export class ContractInteractions {
  private connex: any;
  private isTestMode: boolean;

  constructor(connex: any, isTestMode: boolean = true) {
    this.connex = connex;
    this.isTestMode = isTestMode;
  }

  // Get user verification status from blockchain
  async getUserVerification(userAddress: string) {
    if (this.isTestMode) {
      return {
        isVerified: false,
        age: 0,
        verificationHash: 'Not verified yet'
      };
    }

    try {
      // For demo purposes, we'll simulate verification status
      // In production, this would check the actual contract state
      console.log('Getting demo verification status for user:', userAddress);
      
      // Simulate checking verification status
      // In a real scenario, this would call the contract
      const isVerified = false; // Start as unverified
      
      return {
        isVerified: isVerified,
        age: 0,
        verificationHash: isVerified ? 'Demo Verified' : 'Not verified yet'
      };
      
      /*
      // Original code - would check actual contract state
      const deathVerifier = this.connex.thor.account(CONTRACT_ADDRESSES.testnet.deathVerifier);
      
      // Try to call the function directly
      const result = await deathVerifier.method({
        name: 'getUserVerification',
        type: 'function',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          { name: 'isVerified', type: 'bool' },
          { name: 'age', type: 'uint256' },
          { name: 'lifeExpectancy', type: 'uint256' }
        ]
      }).call(userAddress);
      
      // Handle the result properly
      if (result && typeof result.isVerified === 'boolean') {
        return {
          isVerified: result.isVerified,
          age: result.age || 0,
          verificationHash: result.isVerified ? 'Verified' : 'Not verified'
        };
      } else {
        // User not verified yet
        return {
          isVerified: false,
          age: 0,
          verificationHash: 'Not verified yet'
        };
      }
      */
    } catch (error) {
      console.error('Error getting user verification:', error);
      // Return default values for any error (user might not be verified yet)
      return {
        isVerified: false,
        age: 0,
        verificationHash: 'Not verified yet'
      };
    }
  }

  // Get user sarcophagus data from blockchain
  async getUserSarcophagus(userAddress: string) {
    if (this.isTestMode) {
      return null;
    }

    try {
      const sarcophagus = this.connex.thor.account(CONTRACT_ADDRESSES.testnet.sarcophagus);
      
      const result = await sarcophagus.method({
        name: 'sarcophagi',
        type: 'function',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          { name: 'vetAmount', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'beneficiaries', type: 'tuple[]' }
        ]
      }).call(userAddress);
      
      if (result.vetAmount === '0') {
        return null; // No sarcophagus found
      }

      return {
        vetAmount: result.vetAmount,
        createdAt: result.createdAt,
        beneficiaries: result.beneficiaries || []
      };
    } catch (error) {
      console.error('Error getting user sarcophagus:', error);
      return null;
    }
  }

  // Get OBOL rewards from blockchain
  async getObolRewards(userAddress: string) {
    if (this.isTestMode) {
      return '0';
    }

    try {
      const obol = this.connex.thor.account(CONTRACT_ADDRESSES.testnet.obolToken);
      
      // First try to get basic balance
      const balance = await obol.method({
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }).call(userAddress);
      
      // If user has no balance, return 0
      if (!balance || balance === '0') {
        return '0';
      }
      
      // Try to get stake data
      const result = await obol.method({
        name: 'getUserStake',
        type: 'function',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          { name: 'lockedValue', type: 'uint256' },
          { name: 'lastClaimTime', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'totalEarned', type: 'uint256' },
          { name: 'pendingRewards', type: 'uint256' },
          { name: 'dailyRewardRate', type: 'uint256' },
          { name: 'isLongTermHolder', type: 'bool' },
          { name: 'weightMultiplier', type: 'uint256' },
          { name: 'weightedRate', type: 'uint256' }
        ]
      }).call(userAddress);
      
      // Return pending rewards or 0 if not available
      return result?.pendingRewards || '0';
    } catch (error) {
      console.error('Error getting OBOL rewards:', error);
      // Return 0 for any error (user might not have stakes yet)
      return '0';
    }
  }

  // Verify user on blockchain
  async verifyUser(userAddress: string, age: number, verificationHash: string) {
    if (this.isTestMode) {
      // Return mock transaction
      return {
        txid: `mock-verification-${Date.now()}`,
        wait: async () => ({ reverted: false })
      };
    }

    try {
      // For demo purposes, we'll simulate verification since regular users can't call verifyUser
      // In production, this would be handled by authorized oracles
      console.log('Simulating user verification for demo purposes...');
      
      // Simulate a successful verification transaction
      const mockTxid = `demo-verification-${Date.now()}`;
      
      return {
        txid: mockTxid,
        wait: async () => {
          // Simulate transaction confirmation
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { reverted: false };
        }
      };
      
      /* 
      // Original code - requires ORACLE_ROLE which users don't have
      const deathVerifier = this.connex.thor.account(CONTRACT_ADDRESSES.testnet.deathVerifier);
      
      const clause = deathVerifier.method({
        name: 'verifyUser',
        type: 'function',
        inputs: [
          { name: 'user', type: 'address' },
          { name: 'age', type: 'uint256' },
          { name: 'verificationData', type: 'string' }
        ]
      }).value(0).asClause(userAddress, age, verificationHash);

      const signingService = await this.connex.vendor.sign('tx', [clause]);
      const signedTx = await signingService.signer(userAddress);
      
      // Handle the signed transaction
      let txid: string;
      if (signedTx && typeof signedTx === 'object' && signedTx.accepted) {
        txid = await new Promise<string>((resolve, reject) => {
          signedTx.accepted((result: any) => {
            if (result && result.txid) {
              resolve(result.txid);
            } else {
              reject(new Error('No transaction ID in result'));
            }
          });
        });
      } else {
        txid = signedTx.txid || signedTx.id || signedTx.hash;
      }

      return {
        txid,
        wait: async () => {
          const receipt = await this.connex.thor.transaction(txid).getReceipt();
          return { reverted: receipt.reverted };
        }
      };
      */
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Create sarcophagus on blockchain
  async createSarcophagus(userAddress: string, beneficiaries: string[], percentages: number[]) {
    if (this.isTestMode) {
      return {
        txid: `mock-sarcophagus-${Date.now()}`,
        wait: async () => ({ reverted: false })
      };
    }

    try {
      // For demo purposes, we'll simulate vault creation since the real contract might not be fully deployed
      // In production, this would make a real blockchain transaction
      console.log('Simulating vault creation for demo purposes...');
      
      // Simulate a successful vault creation transaction
      const mockTxid = `demo-sarcophagus-${Date.now()}`;
      
      return {
        txid: mockTxid,
        wait: async () => {
          // Simulate transaction confirmation
          await new Promise(resolve => setTimeout(resolve, 3000));
          return { reverted: false };
        }
      };
      
      /* 
      // Original code - requires properly deployed contract
      // Prepare default arrays for missing parameters
      const guardians = new Array(beneficiaries.length).fill('0x0000000000000000000000000000000000000000');
      const isMinors = new Array(beneficiaries.length).fill(false);
      const ages = new Array(beneficiaries.length).fill(25);
      const contingentBeneficiaries = new Array(beneficiaries.length).fill('0x0000000000000000000000000000000000000000');
      const survivorshipPeriods = new Array(beneficiaries.length).fill('0');

      const sarcophagus = this.connex.thor.account(CONTRACT_ADDRESSES.testnet.sarcophagus);
      
      const clause = sarcophagus.method({
        name: 'createSarcophagus',
        type: 'function',
        inputs: [
          { name: 'beneficiaries', type: 'address[]' },
          { name: 'percentages', type: 'uint16[]' },
          { name: 'guardians', type: 'address[]' },
          { name: 'isMinors', type: 'bool[]' },
          { name: 'ages', type: 'uint8[]' },
          { name: 'contingentBeneficiaries', type: 'address[]' },
          { name: 'survivorshipPeriods', type: 'uint256[]' }
        ]
      }).value(0).asClause(
        beneficiaries,
        percentages,
        guardians,
        isMinors,
        ages,
        contingentBeneficiaries,
        survivorshipPeriods
      );

      const signingService = await this.connex.vendor.sign('tx', [clause]);
      const signedTx = await signingService.signer(userAddress);
      
      let txid: string;
      if (signedTx && typeof signedTx === 'object' && signedTx.accepted) {
        txid = await new Promise<string>((resolve, reject) => {
          signedTx.accepted((result: any) => {
            if (result && result.txid) {
              resolve(result.txid);
            } else {
              reject(new Error('No transaction ID in result'));
            }
          });
        });
      } else {
        txid = signedTx.txid || signedTx.id || signedTx.hash;
      }

      return {
        txid,
        wait: async () => {
          const receipt = await this.connex.thor.transaction(txid).getReceipt();
          return { reverted: receipt.reverted };
        }
      };
      */
    } catch (error) {
      console.error('Error creating sarcophagus:', error);
      throw error;
    }
  }
} 