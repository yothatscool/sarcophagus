import { CONTRACT_ADDRESSES } from '../config/contracts';

// Contract ABIs for real interactions
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
    "inputs": [{"name": "user", "type": "address"}],
    "name": "verifications",
    "outputs": [
      {"name": "isVerified", "type": "bool"},
      {"name": "age", "type": "uint8"},
      {"name": "verificationHash", "type": "string"}
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
      const deathVerifier = this.connex.thor.account(CONTRACT_ADDRESSES.testnet.deathVerifier);
      const verification = await deathVerifier.method(DEATH_VERIFIER_ABI).call('verifications', [userAddress]);
      
      return {
        isVerified: verification.isVerified,
        age: verification.age,
        verificationHash: verification.verificationHash
      };
    } catch (error) {
      console.error('Error getting user verification:', error);
      return {
        isVerified: false,
        age: 0,
        verificationHash: 'Error loading verification'
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
      const sarcophagusData = await sarcophagus.method(SARCOPHAGUS_ABI).call('sarcophagi', [userAddress]);
      
      if (sarcophagusData.vetAmount === '0') {
        return null; // No sarcophagus found
      }

      return {
        vetAmount: sarcophagusData.vetAmount,
        createdAt: sarcophagusData.createdAt,
        beneficiaries: sarcophagusData.beneficiaries || []
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
      const stakeData = await obol.method(OBOL_ABI).call('getUserStake', [userAddress]);
      
      return stakeData.pendingRewards || '0';
    } catch (error) {
      console.error('Error getting OBOL rewards:', error);
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
      const clause = {
        to: CONTRACT_ADDRESSES.testnet.deathVerifier,
        value: '0x0',
        data: this.encodeFunctionCall('verifyUser', ['address', 'uint8', 'uint8', 'string'], [
          userAddress,
          age,
          85, // Default life expectancy
          verificationHash
        ])
      };

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
      // Prepare default arrays for missing parameters
      const guardians = new Array(beneficiaries.length).fill('0x0000000000000000000000000000000000000000');
      const isMinors = new Array(beneficiaries.length).fill(false);
      const ages = new Array(beneficiaries.length).fill(25);
      const contingentBeneficiaries = new Array(beneficiaries.length).fill('0x0000000000000000000000000000000000000000');
      const survivorshipPeriods = new Array(beneficiaries.length).fill('0');

      const clause = {
        to: CONTRACT_ADDRESSES.testnet.sarcophagus,
        value: '0x0', // No VET sent initially
        data: this.encodeFunctionCall('createSarcophagus', [
          'address[]', 'uint16[]', 'address[]', 'bool[]', 'uint8[]', 'address[]', 'uint256[]'
        ], [
          beneficiaries,
          percentages,
          guardians,
          isMinors,
          ages,
          contingentBeneficiaries,
          survivorshipPeriods
        ])
      };

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
    } catch (error) {
      console.error('Error creating sarcophagus:', error);
      throw error;
    }
  }

  // Helper function to encode function calls
  private encodeFunctionCall(functionName: string, types: string[], values: any[]): string {
    const functionSignatures: { [key: string]: string } = {
      'verifyUser(address,uint8,uint8,string)': '0xfcaa653e',
      'createSarcophagus(address[],uint16[],address[],bool[],uint8[],address[],uint256[])': '0x12345678',
      'getUserStake(address)': '0x8da5cb5b'
    };
    
    const signature = functionSignatures[functionName];
    if (!signature) {
      throw new Error(`Function signature not found for: ${functionName}`);
    }
    
    // For now, return the signature - in production, we'd properly encode the parameters
    return signature;
  }
} 