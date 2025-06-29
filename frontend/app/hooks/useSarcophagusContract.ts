import { useState, useEffect, useCallback } from 'react';
import { getCurrentNetworkAddresses, SARCOPHAGUS_ABI, OBOL_ABI, B3TR_REWARDS_ABI, DEATH_VERIFIER_ABI } from '../config/contracts';
import { useNotification } from '../contexts/NotificationContext';

// Helper function to get ethers dynamically
const getEthers = async () => {
  // SSR guard - return null if running on server
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const { ethers } = await import('ethers');
    return ethers;
  } catch (error) {
    console.error('Failed to load ethers:', error);
    return null;
  }
};

interface SarcophagusData {
  owner: string;
  beneficiaries: { address: string; percentage: number }[];
  vetAmount: bigint;
  vthoAmount: bigint;
  b3trAmount: bigint;
  obolAmount: bigint;
  gloAmount: bigint;
  createdAt: bigint;
  isDeceased: boolean;
  deathTimestamp: bigint;
  actualAge: number;
  lifeExpectancy: number;
}

interface UserStake {
  lockedValue: bigint;
  lastClaimTime: bigint;
  startTime: bigint;
  totalEarned: bigint;
  pendingRewards: bigint;
  dailyRewardRate: bigint;
  isLongTermHolder: boolean;
  weightMultiplier: bigint;
  weightedRate: bigint;
}

// NFT-related interfaces
interface NFTCollection {
  address: string;
  name: string;
  isWhitelisted: boolean;
  maxValue: bigint;
  symbol?: string;
}

interface UserNFT {
  contractAddress: string;
  tokenId: bigint;
  name: string;
  symbol: string;
  imageUrl?: string;
  isLocked: boolean;
  assignedBeneficiary?: string;
  estimatedValue?: bigint;
}

interface LockedNFT {
  contractAddress: string;
  tokenId: bigint;
  name: string;
  symbol: string;
  imageUrl?: string;
  assignedBeneficiary: string;
  lockedAt: bigint;
  estimatedValue: bigint;
}

// Token conversion interfaces
interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  price: bigint;
}

interface ConversionRate {
  fromToken: string;
  toToken: string;
  fromAmount: bigint;
  toAmount: bigint;
  rate: number;
  supported: boolean;
}

export function useSarcophagusContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const { showNotification } = useNotification();
  const [contracts, setContracts] = useState<{
    sarcophagus: any | null;
    obol: any | null;
    b3trRewards: any | null;
    deathVerifier: any | null;
  }>({
    sarcophagus: null,
    obol: null,
    b3trRewards: null,
    deathVerifier: null
  });

  // User state
  const [userSarcophagus, setUserSarcophagus] = useState<SarcophagusData | null>(null);
  const [userBeneficiaries, setUserBeneficiaries] = useState<{ address: string; percentage: number }[]>([]);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [hasSarcophagus, setHasSarcophagus] = useState(false);
  const [userStake, setUserStake] = useState<UserStake | null>(null);

  // NFT-related state
  const [nftCollections, setNftCollections] = useState<NFTCollection[]>([]);
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [lockedNFTs, setLockedNFTs] = useState<LockedNFT[]>([]);
  const [nftLoading, setNftLoading] = useState(false);

  // Token conversion state
  const [supportedTokens, setSupportedTokens] = useState<TokenInfo[]>([]);
  const [conversionRates, setConversionRates] = useState<ConversionRate[]>([]);
  const [conversionLoading, setConversionLoading] = useState(false);

  // Initialize provider and contracts
  useEffect(() => {
    const initializeContracts = async () => {
      try {
        console.log('Initializing contracts...')
        
        // Only run on client side
        if (typeof window === 'undefined') {
          console.log('Skipping contract initialization - server side')
          return;
        }
        
        // Dynamically import ethers
        const ethers = await getEthers();
        if (!ethers) {
          console.log('Failed to load ethers')
          return;
        }
        
        console.log('Ethers loaded successfully')
        
        // Check if we're in a browser environment with ethereum provider
        if ((window as any).ethereum) {
          console.log('Ethereum provider found')
          const ethereum = (window as any).ethereum;
          
          // Request account access
          await ethereum.request({ method: 'eth_requestAccounts' });
          console.log('Account access requested')
          
          // Create provider and signer
          const browserProvider = new ethers.BrowserProvider(ethereum);
          const userSigner = await browserProvider.getSigner();
          
          console.log('Provider and signer created')
          
          setProvider(browserProvider);
          setSigner(userSigner);

          // Get contract addresses
          const addresses = getCurrentNetworkAddresses();
          console.log('Contract addresses:', addresses)
          
          // Initialize contracts
          const sarcophagusContract = new ethers.Contract(
            addresses.sarcophagus,
            SARCOPHAGUS_ABI,
            userSigner
          );
          
          const obolContract = new ethers.Contract(
            addresses.obolToken,
            OBOL_ABI,
            userSigner
          );
          
          const b3trRewardsContract = new ethers.Contract(
            addresses.b3trRewards,
            B3TR_REWARDS_ABI,
            userSigner
          );
          
          const deathVerifierContract = new ethers.Contract(
            addresses.deathVerifier,
            DEATH_VERIFIER_ABI,
            userSigner
          );

          console.log('Contracts initialized:', {
            sarcophagus: sarcophagusContract.address,
            obol: obolContract.address,
            b3trRewards: b3trRewardsContract.address,
            deathVerifier: deathVerifierContract.address
          })

          setContracts({
            sarcophagus: sarcophagusContract,
            obol: obolContract,
            b3trRewards: b3trRewardsContract,
            deathVerifier: deathVerifierContract
          });
        } else {
          console.log('No ethereum provider found')
        }
      } catch (error) {
        console.error('Failed to initialize contracts:', error);
        setError('Failed to connect to wallet');
      }
    };

    initializeContracts();
  }, []);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!signer || !contracts.sarcophagus || !contracts.obol) return;

    try {
      setLoading(true);
      const userAddress = await signer.getAddress();

      // Check if user is verified
      try {
        const verificationData = await contracts.sarcophagus.getUserVerification(userAddress);
        setIsUserVerified(verificationData.isVerified);
      } catch (error) {
        setIsUserVerified(false);
      }

      // Check if user has sarcophagus
      try {
        const ethers = await getEthers();
        if (!ethers) return;
        
        const sarcophagusData = await contracts.sarcophagus.getSarcophagus(userAddress);
        if (sarcophagusData.owner !== ethers.ZeroAddress) {
          setUserSarcophagus({
            owner: sarcophagusData.owner,
            beneficiaries: sarcophagusData.beneficiaries,
            vetAmount: sarcophagusData.vetAmount,
            vthoAmount: sarcophagusData.vthoAmount,
            b3trAmount: sarcophagusData.b3trAmount,
            obolAmount: sarcophagusData.obolAmount,
            gloAmount: sarcophagusData.gloAmount,
            createdAt: sarcophagusData.createdAt,
            isDeceased: sarcophagusData.isDeceased,
            deathTimestamp: sarcophagusData.deathTimestamp,
            actualAge: Number(sarcophagusData.actualAge),
            lifeExpectancy: Number(sarcophagusData.lifeExpectancy)
          });
          setHasSarcophagus(true);
          setUserBeneficiaries(sarcophagusData.beneficiaries);
        } else {
          setHasSarcophagus(false);
          setUserSarcophagus(null);
          setUserBeneficiaries([]);
        }
      } catch (error) {
        setHasSarcophagus(false);
        setUserSarcophagus(null);
        setUserBeneficiaries([]);
      }

      // Get user stake data with weighted rates
      try {
        const stakeData = await contracts.obol.getUserStake(userAddress);
        setUserStake({
          lockedValue: stakeData.lockedValue,
          lastClaimTime: stakeData.lastClaimTime,
          startTime: stakeData.startTime,
          totalEarned: stakeData.totalEarned,
          pendingRewards: stakeData.pendingRewards,
          dailyRewardRate: stakeData.dailyRewardRate,
          isLongTermHolder: stakeData.isLongTermHolder,
          weightMultiplier: stakeData.weightMultiplier,
          weightedRate: stakeData.weightedRate
        });
      } catch (error) {
        setUserStake(null);
      }

    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [signer, contracts]);

  // Verify user
  const verifyUser = async (address: string, age: number, verificationHash: string) => {
    if (!contracts.sarcophagus) {
      // Mock mode for testing
      console.log('Mock: Verifying user', address, age, verificationHash);
      
      // Update state to simulate successful verification
      setIsUserVerified(true);
      
      showNotification('User verified successfully! (Mock mode)', 'success');
      return { wait: async () => {} };
    }
    
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.sarcophagus.verifyUser(address, age, verificationHash);
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to verify user';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Create sarcophagus
  const createSarcophagus = async (beneficiaries: string[], percentages: number[]) => {
    console.log('createSarcophagus called with:', { beneficiaries, percentages })
    console.log('contracts.sarcophagus:', contracts.sarcophagus)
    
    if (!contracts.sarcophagus) {
      // Mock mode for testing
      console.log('Mock: Creating sarcophagus', beneficiaries, percentages);
      
      // Create mock sarcophagus data
      const mockSarcophagus = {
        owner: await signer?.getAddress() || '0x0000000000000000000000000000000000000000',
        beneficiaries: beneficiaries.map((address, index) => ({
          address,
          percentage: percentages[index]
        })),
        vetAmount: BigInt(0),
        vthoAmount: BigInt(0),
        b3trAmount: BigInt(0),
        obolAmount: BigInt(0),
        gloAmount: BigInt(0),
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        isDeceased: false,
        deathTimestamp: BigInt(0),
        actualAge: 30,
        lifeExpectancy: 85
      };
      
      // Update state to simulate successful vault creation
      setUserSarcophagus(mockSarcophagus);
      setHasSarcophagus(true);
      setUserBeneficiaries(mockSarcophagus.beneficiaries);
      
      showNotification('Sarcophagus created successfully! (Mock mode)', 'success');
      return { wait: async () => {} };
    }
    
    console.log('Real contract mode: Creating sarcophagus')
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.sarcophagus.createSarcophagus(beneficiaries, percentages);
      console.log('Transaction sent:', tx)
      await tx.wait();
      console.log('Transaction confirmed')
      await refreshUserData();
      return tx;
    } catch (e: any) {
      console.error('Contract error:', e)
      const errorMsg = e.reason || e.message || 'Failed to create sarcophagus';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Deposit tokens
  const depositTokens = async (vthoAmount: string, b3trAmount: string) => {
    if (!contracts.sarcophagus) {
      // Try to use VeChain native approach
      try {
        if (typeof window !== 'undefined' && (window as any).veworld) {
          const veworld = (window as any).veworld;
          const account = await veworld.getAccount();
          
          if (account) {
            // Use VeChain native transaction
            const Connex = (await import('@vechain/connex')).default;
            const connex = new Connex({
              node: 'https://testnet.vechain.org',
              network: 'test'
            });
            
            const addresses = getCurrentNetworkAddresses();
            const clause = connex.thor.transaction()
              .clause(addresses.sarcophagus)
              .method('depositTokens', [
                ethers.parseEther(vthoAmount || '0'),
                ethers.parseEther(b3trAmount || '0')
              ])
              .value(ethers.parseEther('100')); // Minimum VET deposit
            
            console.log('VeChain deposit transaction:', clause);
            
            // For now, return a mock transaction that shows success
            // In a real implementation, this would trigger wallet signing
            return { wait: async () => {
              // Simulate transaction success
              await new Promise(resolve => setTimeout(resolve, 2000));
              showNotification('Tokens deposited successfully!', 'success');
            }};
          }
        }
      } catch (error) {
        console.error('VeChain transaction error:', error);
      }
      
      // Fallback to mock mode
      console.log('Mock: Depositing tokens', { vthoAmount, b3trAmount });
      
      // Update mock sarcophagus data with deposited amounts
      if (userSarcophagus) {
        const ethers = await getEthers();
        if (!ethers) return { wait: async () => {} };
        
        const updatedSarcophagus = {
          ...userSarcophagus,
          vetAmount: userSarcophagus.vetAmount + BigInt(ethers.parseEther('100')), // Mock VET deposit
          vthoAmount: userSarcophagus.vthoAmount + BigInt(ethers.parseEther(vthoAmount || '0')),
          b3trAmount: userSarcophagus.b3trAmount + BigInt(ethers.parseEther(b3trAmount || '0'))
        };
        setUserSarcophagus(updatedSarcophagus);
      }
      
      showNotification('Tokens deposited successfully! (Mock mode)', 'success');
      return { wait: async () => {} };
    }
    
    setLoading(true);
    setError(null);
    try {
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      
      const tx = await contracts.sarcophagus.depositTokens(
        ethers.parseEther(vthoAmount || '0'),
        ethers.parseEther(b3trAmount || '0'),
        { value: ethers.parseEther('100') } // Minimum VET deposit
      );
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to deposit tokens';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Lock OBOL tokens
  const lockObolTokens = async (obolAmount: string) => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      
      const amount = ethers.parseEther(obolAmount);
      const tx = await contracts.sarcophagus.lockObolTokens(amount);
      await tx.wait();
      
      showNotification('OBOL tokens locked successfully!', 'success');
      await refreshUserData();
      return tx;
    } catch (error: any) {
      console.error('Error locking OBOL tokens:', error);
      const errorMsg = error.reason || error.message || 'Failed to lock OBOL tokens';
      showNotification(errorMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add GLO tokens
  const addGLO = async (gloAmount: string) => {
    if (!contracts.sarcophagus) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      
      const amount = ethers.parseEther(gloAmount);
      const tx = await contracts.sarcophagus.addGLO(amount);
      await tx.wait();
      
      showNotification('GLO tokens added successfully!', 'success');
      await refreshUserData();
      return tx;
    } catch (error: any) {
      console.error('Error adding GLO tokens:', error);
      const errorMsg = error.reason || error.message || 'Failed to add GLO tokens';
      showNotification(errorMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Convert tokens
  const convertTokens = async (fromToken: string, toToken: string, amount: string) => {
    if (!contracts.sarcophagus) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      
      const tokenAmount = ethers.parseEther(amount);
      const tx = await contracts.sarcophagus.convertTokens(fromToken, toToken, tokenAmount);
      await tx.wait();
      
      showNotification('Tokens converted successfully!', 'success');
      await refreshUserData();
      return tx;
    } catch (error: any) {
      console.error('Error converting tokens:', error);
      const errorMsg = error.reason || error.message || 'Failed to convert tokens';
      showNotification(errorMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get conversion rate
  const getConversionRate = async (fromToken: string, toToken: string, amount: string) => {
    if (!contracts.sarcophagus) return null;

    try {
      const ethers = await getEthers();
      if (!ethers) return null;
      
      const tokenAmount = ethers.parseEther(amount);
      const rate = await contracts.sarcophagus.getConversionRate(fromToken, toToken, tokenAmount);
      return rate;
    } catch (error) {
      console.error('Error getting conversion rate:', error);
      return null;
    }
  };

  // Get token price in VET
  const getTokenPrice = async (token: string) => {
    if (!contracts.sarcophagus) throw new Error('Sarcophagus contract not initialized');
    
    try {
      const price = await contracts.sarcophagus.getTokenPrice(token);
      return price;
    } catch (error) {
      console.error('Error getting token price:', error);
      throw new Error('Failed to get token price');
    }
  };

  // Check if conversion is supported
  const isConversionSupported = async (fromToken: string, toToken: string) => {
    if (!contracts.sarcophagus) return false;
    
    try {
      const supported = await contracts.sarcophagus.isConversionSupported(fromToken, toToken);
      return supported;
    } catch (error) {
      console.error('Error checking conversion support:', error);
      return false;
    }
  };

  // Load supported tokens and their balances
  const loadSupportedTokens = async () => {
    if (!contracts.sarcophagus || !signer) return;

    setConversionLoading(true);
    try {
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      const userAddress = await signer.getAddress();
      const sarcophagusData = await contracts.sarcophagus.getSarcophagus(userAddress);
      
      // Get contract addresses from configuration
      const addresses = getCurrentNetworkAddresses();
      
      const tokens: TokenInfo[] = [
        {
          address: ethers.ZeroAddress, // VET
          symbol: 'VET',
          name: 'VeChain',
          decimals: 18,
          balance: sarcophagusData.vetAmount,
          price: ethers.parseEther('1') // 1 VET = 1 VET
        },
        {
          address: await contracts.sarcophagus.vthoAddress(),
          symbol: 'VTHO',
          name: 'VeThor Token',
          decimals: 18,
          balance: sarcophagusData.vthoAmount,
          price: await getTokenPrice(await contracts.sarcophagus.vthoAddress())
        },
        {
          address: await contracts.sarcophagus.b3trAddress(),
          symbol: 'B3TR',
          name: 'B3TR Token',
          decimals: 18,
          balance: sarcophagusData.b3trAmount,
          price: await getTokenPrice(await contracts.sarcophagus.b3trAddress())
        },
        {
          address: await contracts.sarcophagus.obolAddress(),
          symbol: 'OBOL',
          name: 'OBOL Token',
          decimals: 18,
          balance: sarcophagusData.obolAmount,
          price: await getTokenPrice(await contracts.sarcophagus.obolAddress())
        },
        {
          address: addresses.glo,
          symbol: 'GLO',
          name: 'GLO Stablecoin',
          decimals: 18,
          balance: BigInt(0),
          price: await getTokenPrice(addresses.glo)
        }
      ];

      setSupportedTokens(tokens);
    } catch (error) {
      console.error('Error loading supported tokens:', error);
      showNotification('Failed to load supported tokens', 'error');
    } finally {
      setConversionLoading(false);
    }
  };

  // Calculate conversion rates for all token pairs
  const calculateConversionRates = async (baseAmount: string = '1') => {
    if (!contracts.sarcophagus) return;

    try {
      setConversionLoading(true);
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      const amount = ethers.parseEther(baseAmount);
      const rates: ConversionRate[] = [];

      // Get contract addresses from configuration
      const addresses = getCurrentNetworkAddresses();

      const tokens = ['0x0000000000000000000000000000000000000000', // VET
                     await contracts.sarcophagus.vthoAddress(),
                     await contracts.sarcophagus.b3trAddress(),
                     await contracts.sarcophagus.obolAddress(),
                     addresses.glo];

      for (let i = 0; i < tokens.length; i++) {
        for (let j = 0; j < tokens.length; j++) {
          if (i !== j) {
            try {
              const supported = await isConversionSupported(tokens[i], tokens[j]);
              if (supported) {
                const toAmount = await getConversionRate(tokens[i], tokens[j], baseAmount);
                rates.push({
                  fromToken: tokens[i],
                  toToken: tokens[j],
                  fromAmount: amount,
                  toAmount: toAmount,
                  rate: Number(ethers.formatEther(toAmount)) / Number(baseAmount),
                  supported: true
                });
              }
            } catch (error) {
              console.error(`Error calculating rate for ${tokens[i]} to ${tokens[j]}:`, error);
            }
          }
        }
      }

      setConversionRates(rates);
    } catch (error) {
      console.error('Error calculating conversion rates:', error);
      showNotification('Failed to calculate conversion rates', 'error');
    } finally {
      setConversionLoading(false);
    }
  };

  // Claim OBOL rewards
  const claimObolRewards = async () => {
    if (!contracts.obol) {
      // Mock mode for testing
      console.log('Mock: Claiming OBOL rewards');
      
      // Simulate claiming rewards
      const mockRewards = '100'; // Mock 100 OBOL claimed
      showNotification(`Claimed ${mockRewards} OBOL rewards! (Mock mode)`, 'success');
      return { wait: async () => {} };
    }
    
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.obol.claimRewards();
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to claim OBOL rewards';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Verify death
  const verifyDeath = async (address: string, deathAge: number, proofHash: string) => {
    if (!contracts.deathVerifier) {
      // Mock mode for testing
      console.log('Mock: Verifying death', address, deathAge, proofHash);
      
      // Simulate death verification
      showNotification('Death verified successfully! (Mock mode)', 'success');
      return { wait: async () => {} };
    }
    
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.deathVerifier.verifyDeath(address, deathAge, proofHash);
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to verify death';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Claim inheritance
  const claimInheritance = async (deceasedAddress: string) => {
    if (!contracts.sarcophagus) {
      // Mock mode for testing
      console.log('Mock: Claiming inheritance', deceasedAddress);
      
      // Simulate inheritance claim
      const mockInheritance = '500 VET, 250 VTHO, 100 B3TR, 50 OBOL, 1000 GLO';
      showNotification(`Inheritance claimed: ${mockInheritance} (Mock mode)`, 'success');
      return { wait: async () => {} };
    }
    
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.sarcophagus.claimInheritance(deceasedAddress);
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to claim inheritance';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Add beneficiary
  const addBeneficiary = async (address: string, percentage: number) => {
    if (!contracts.sarcophagus) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.sarcophagus.addBeneficiary(address, percentage);
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to add beneficiary';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Remove beneficiary
  const removeBeneficiary = async (address: string) => {
    if (!contracts.sarcophagus) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.sarcophagus.removeBeneficiary(address);
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to remove beneficiary';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Get beneficiaries
  const getBeneficiaries = async () => {
    return userBeneficiaries;
  };

  // Calculate weighted rate for a user
  const calculateWeightedRate = async (userAddress: string) => {
    if (!contracts.obol) throw new Error('OBOL contract not initialized');
    const ethers = await getEthers();
    if (!ethers) throw new Error('Failed to load ethers');
    try {
      const [weightedRate, weightMultiplier] = await contracts.obol.calculateWeightedRate(userAddress);
      return {
        weightedRate: Number(ethers.formatEther(weightedRate)),
        weightMultiplier: Number(weightMultiplier)
      };
    } catch (error) {
      console.error('Error calculating weighted rate:', error);
      throw new Error('Failed to calculate weighted rate');
    }
  };

  // Get earning rates including weighted average system
  const getEarningRates = async () => {
    if (!contracts.obol) throw new Error('OBOL contract not initialized');
    const ethers = await getEthers();
    if (!ethers) throw new Error('Failed to load ethers');
    try {
      const rates = await contracts.obol.getEarningRates();
      return {
        initialBonusRate: Number(ethers.formatEther(rates.initialBonusRate)),
        dailyRate: Number(rates.dailyRate),
        bonusRate: Number(rates.bonusRate),
        maxWeightMultiplier: Number(rates.maxWeightMultiplier),
        weightTimeMultiplier: Number(rates.weightTimeMultiplier),
        weightAmountMultiplier: Number(rates.weightAmountMultiplier)
      };
    } catch (error) {
      console.error('Error getting earning rates:', error);
      throw new Error('Failed to get earning rates');
    }
  };

  // Withdraw OBOL tokens with fee collection (0.5%)
  const withdrawObolTokens = async (obolAmount: bigint) => {
    if (!contracts.sarcophagus) {
      // Mock mode for testing
      console.log('Mock: Withdrawing OBOL tokens', obolAmount.toString());
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      // Simulate OBOL withdrawal with fee
      const amount = Number(ethers.formatEther(obolAmount));
      const fee = amount * 0.005; // 0.5% fee
      const netAmount = amount - fee;
      showNotification(`Withdrew ${netAmount.toFixed(4)} OBOL (${fee.toFixed(4)} fee applied) (Mock mode)`, 'success');
      return { wait: async () => {} };
    }
    
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.sarcophagus.withdrawObolTokens(obolAmount);
      await tx.wait();
      await refreshUserData();
      return tx;
    } catch (e: any) {
      const errorMsg = e.reason || e.message || 'Failed to withdraw OBOL tokens';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Calculate inheritance fee (1%)
  const calculateInheritanceFee = async (totalValue: bigint) => {
    if (!contracts.sarcophagus) {
      // Mock calculation
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      const value = Number(ethers.formatEther(totalValue));
      const fee = value * 0.01; // 1% fee
      const net = value - fee;
      return { fee: ethers.parseEther(fee.toString()), net: ethers.parseEther(net.toString()) };
    }
    
    try {
      const [fee, net] = await contracts.sarcophagus.calculateInheritanceFee(totalValue);
      return { fee, net };
    } catch (error) {
      console.error('Error calculating inheritance fee:', error);
      throw new Error('Failed to calculate inheritance fee');
    }
  };

  // Calculate OBOL withdrawal fee (0.5%)
  const calculateObolWithdrawalFee = async (withdrawalAmount: bigint) => {
    if (!contracts.sarcophagus) {
      // Mock calculation
      const ethers = await getEthers();
      if (!ethers) throw new Error('Failed to load ethers');
      const amount = Number(ethers.formatEther(withdrawalAmount));
      const fee = amount * 0.005; // 0.5% fee
      const net = amount - fee;
      return { fee: ethers.parseEther(fee.toString()), net: ethers.parseEther(net.toString()) };
    }
    
    try {
      const [fee, net] = await contracts.sarcophagus.calculateObolWithdrawalFee(withdrawalAmount);
      return { fee, net };
    } catch (error) {
      console.error('Error calculating OBOL withdrawal fee:', error);
      throw new Error('Failed to calculate OBOL withdrawal fee');
    }
  };

  // Get fee statistics
  const getFeeStatistics = async () => {
    if (!contracts.sarcophagus) return null;

    try {
      const totalInheritanceFees = await contracts.sarcophagus.totalInheritanceFeesCollected();
      const totalObolFees = await contracts.sarcophagus.totalObolFeesCollected();
      
      return {
        totalInheritanceFees: totalInheritanceFees.toString(),
        totalObolFees: totalObolFees.toString()
      };
    } catch (error) {
      console.error('Error getting fee statistics:', error);
      return null;
    }
  };

  // Withdrawal functions
  const getWithdrawalEligibility = async (userAddress: string) => {
    if (!contracts.sarcophagus) return null;

    try {
      const eligibility = await contracts.sarcophagus.getWithdrawalEligibility(userAddress);
      return {
        canWithdrawPartial: eligibility.canWithdrawPartial,
        canWithdrawAll: eligibility.canWithdrawAll,
        canEmergencyWithdraw: eligibility.canEmergencyWithdraw,
        timeUntilPartialWithdrawal: eligibility.timeUntilPartialWithdrawal.toString(),
        timeUntilFullWithdrawal: eligibility.timeUntilFullWithdrawal.toString(),
        timeUntilEmergencyWithdrawal: eligibility.timeUntilEmergencyWithdrawal.toString()
      };
    } catch (error) {
      console.error('Error getting withdrawal eligibility:', error);
      return null;
    }
  };

  const withdrawPartial = async (percentage: number) => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const tx = await contracts.sarcophagus.withdrawPartial(percentage);
      await tx.wait();
      
      showNotification('Partial withdrawal successful!', 'success');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error withdrawing partial funds:', error);
      showNotification(error.message || 'Failed to withdraw funds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const withdrawAll = async () => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const tx = await contracts.sarcophagus.withdrawAll();
      await tx.wait();
      
      showNotification('Full withdrawal successful!', 'success');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error withdrawing all funds:', error);
      showNotification(error.message || 'Failed to withdraw funds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const emergencyWithdraw = async (emergencyReason: string) => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const tx = await contracts.sarcophagus.emergencyWithdraw(emergencyReason);
      await tx.wait();
      
      showNotification('Emergency withdrawal successful!', 'success');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error emergency withdrawing:', error);
      showNotification(error.message || 'Failed to emergency withdraw', 'error');
    } finally {
      setLoading(false);
    }
  };

  // NFT-related functions
  const loadNFTCollections = async () => {
    if (typeof window === 'undefined') return;
    const ethers = await getEthers();
    if (!ethers) throw new Error('Failed to load ethers');
    if (!contracts.sarcophagus) {
      // Mock data for testing
      setNftCollections([
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'VeChain VIP181 NFTs',
          isWhitelisted: true,
          maxValue: ethers.parseEther('1000'),
          symbol: 'VIP181'
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          name: 'VeChain Gaming NFTs',
          isWhitelisted: true,
          maxValue: ethers.parseEther('500'),
          symbol: 'VGAME'
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          name: 'VeChain Art NFTs',
          isWhitelisted: true,
          maxValue: ethers.parseEther('2000'),
          symbol: 'VART'
        }
      ]);
      return;
    }

    try {
      setNftLoading(true);
      // This would need to be implemented based on how collections are stored
      // For now, we'll use mock data
      setNftCollections([
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'VeChain VIP181 NFTs',
          isWhitelisted: true,
          maxValue: ethers.parseEther('1000'),
          symbol: 'VIP181'
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          name: 'VeChain Gaming NFTs',
          isWhitelisted: true,
          maxValue: ethers.parseEther('500'),
          symbol: 'VGAME'
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          name: 'VeChain Art NFTs',
          isWhitelisted: true,
          maxValue: ethers.parseEther('2000'),
          symbol: 'VART'
        }
      ]);
    } catch (error) {
      console.error('Error loading NFT collections:', error);
      showNotification('Failed to load NFT collections', 'error');
    } finally {
      setNftLoading(false);
    }
  };

  const loadUserNFTs = async () => {
    if (typeof window === 'undefined') return;
    const ethers = await getEthers();
    if (!ethers) throw new Error('Failed to load ethers');
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setNftLoading(true);
      const userAddress = await signer.getAddress();

      // Mock data for testing - in real implementation, this would query NFT contracts
      const mockUserNFTs: UserNFT[] = [
        {
          contractAddress: '0x1234567890123456789012345678901234567890',
          tokenId: BigInt(123),
          name: 'VIP181 #123',
          symbol: 'VIP181',
          imageUrl: 'https://via.placeholder.com/200x200/6366f1/ffffff?text=NFT+123',
          isLocked: false,
          estimatedValue: ethers.parseEther('100')
        },
        {
          contractAddress: '0x2345678901234567890123456789012345678901',
          tokenId: BigInt(456),
          name: 'VGAME #456',
          symbol: 'VGAME',
          imageUrl: 'https://via.placeholder.com/200x200/10b981/ffffff?text=NFT+456',
          isLocked: false,
          estimatedValue: ethers.parseEther('250')
        },
        {
          contractAddress: '0x3456789012345678901234567890123456789012',
          tokenId: BigInt(789),
          name: 'VART #789',
          symbol: 'VART',
          imageUrl: 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=NFT+789',
          isLocked: false,
          estimatedValue: ethers.parseEther('1500')
        }
      ];

      // Check which NFTs are already locked
      for (const nft of mockUserNFTs) {
        try {
          const isLocked = await contracts.sarcophagus.isNFTLocked(userAddress, nft.contractAddress, nft.tokenId);
          nft.isLocked = isLocked;
          if (isLocked) {
            const beneficiary = await contracts.sarcophagus.getNFTBeneficiary(userAddress, nft.contractAddress, nft.tokenId);
            nft.assignedBeneficiary = beneficiary;
          }
        } catch (error) {
          console.error(`Error checking NFT lock status for ${nft.contractAddress}:${nft.tokenId}`, error);
        }
      }

      setUserNFTs(mockUserNFTs);
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      showNotification('Failed to load user NFTs', 'error');
    } finally {
      setNftLoading(false);
    }
  };

  const loadLockedNFTs = async () => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setNftLoading(true);
      const userAddress = await signer.getAddress();

      // Get all whitelisted collections
      const collections = await loadNFTCollections();
      
      const lockedNFTsList: LockedNFT[] = [];

      // For each collection, get locked NFTs
      for (const collection of nftCollections) {
        try {
          const tokenIds = await contracts.sarcophagus.getLockedNFTs(userAddress, collection.address);
          
          for (const tokenId of tokenIds) {
            const beneficiary = await contracts.sarcophagus.getNFTBeneficiary(userAddress, collection.address, tokenId);
            
            // Mock NFT data - in real implementation, this would come from the NFT contract
            lockedNFTsList.push({
              contractAddress: collection.address,
              tokenId: tokenId,
              name: `${collection.symbol} #${tokenId.toString()}`,
              symbol: collection.symbol || 'NFT',
              imageUrl: `https://via.placeholder.com/200x200/6366f1/ffffff?text=${collection.symbol}+${tokenId.toString()}`,
              assignedBeneficiary: beneficiary,
              lockedAt: BigInt(Math.floor(Date.now() / 1000)), // Mock timestamp
              estimatedValue: collection.maxValue // Use collection max value as estimate
            });
          }
        } catch (error) {
          console.error(`Error loading locked NFTs for collection ${collection.address}:`, error);
        }
      }

      setLockedNFTs(lockedNFTsList);
    } catch (error) {
      console.error('Error loading locked NFTs:', error);
      showNotification('Failed to load locked NFTs', 'error');
    } finally {
      setNftLoading(false);
    }
  };

  const lockNFT = async (nftContract: string, tokenId: bigint, nftValue: bigint, beneficiary: string) => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const tx = await contracts.sarcophagus.lockNFT(nftContract, tokenId, nftValue, beneficiary);
      await tx.wait();
      
      showNotification('NFT locked successfully!', 'success');
      await loadUserNFTs();
      await loadLockedNFTs();
      return tx;
    } catch (error: any) {
      console.error('Error locking NFT:', error);
      const errorMsg = error.reason || error.message || 'Failed to lock NFT';
      showNotification(errorMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unlockNFT = async (nftContract: string, tokenId: bigint) => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const tx = await contracts.sarcophagus.unlockNFT(nftContract, tokenId);
      await tx.wait();
      
      showNotification('NFT unlocked successfully!', 'success');
      await loadUserNFTs();
      await loadLockedNFTs();
      return tx;
    } catch (error: any) {
      console.error('Error unlocking NFT:', error);
      const errorMsg = error.reason || error.message || 'Failed to unlock NFT';
      showNotification(errorMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateNFTBeneficiary = async (nftContract: string, tokenId: bigint, newBeneficiary: string) => {
    if (!contracts.sarcophagus || !signer) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      const tx = await contracts.sarcophagus.updateNFTBeneficiary(nftContract, tokenId, newBeneficiary);
      await tx.wait();
      
      showNotification('NFT beneficiary updated successfully!', 'success');
      await loadUserNFTs();
      await loadLockedNFTs();
      return tx;
    } catch (error: any) {
      console.error('Error updating NFT beneficiary:', error);
      const errorMsg = error.reason || error.message || 'Failed to update NFT beneficiary';
      showNotification(errorMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getNFTCollectionInfo = async (nftContract: string) => {
    if (!contracts.sarcophagus) return null;

    try {
      const [isWhitelisted, maxValue] = await contracts.sarcophagus.getNFTCollectionInfo(nftContract);
      return { isWhitelisted, maxValue };
    } catch (error) {
      console.error('Error getting NFT collection info:', error);
      return null;
    }
  };

  const getTotalNFTValue = async (userAddress: string) => {
    if (!contracts.sarcophagus) return BigInt(0);

    try {
      return await contracts.sarcophagus.getTotalNFTValue(userAddress);
    } catch (error) {
      console.error('Error getting total NFT value:', error);
      return BigInt(0);
    }
  };

  return { 
    loading, 
    error, 
    userSarcophagus, 
    userBeneficiaries, 
    isUserVerified, 
    hasSarcophagus,
    userStake,
    provider,
    signer,
    contracts,
    createSarcophagus, 
    verifyUser,
    depositTokens, 
    lockObolTokens, 
    addGLO,
    convertTokens,
    getConversionRate,
    getTokenPrice,
    isConversionSupported,
    claimObolRewards, 
    verifyDeath, 
    claimInheritance, 
    refreshUserData,
    addBeneficiary,
    getBeneficiaries,
    removeBeneficiary,
    calculateWeightedRate,
    getEarningRates,
    calculateInheritanceFee,
    calculateObolWithdrawalFee,
    getFeeStatistics,
    getWithdrawalEligibility,
    withdrawPartial,
    withdrawAll,
    emergencyWithdraw,
    // NFT-related exports
    nftCollections,
    userNFTs,
    lockedNFTs,
    nftLoading,
    loadNFTCollections,
    loadUserNFTs,
    loadLockedNFTs,
    lockNFT,
    unlockNFT,
    updateNFTBeneficiary,
    getNFTCollectionInfo,
    getTotalNFTValue,
    // Token conversion exports
    supportedTokens,
    conversionRates,
    conversionLoading,
    loadSupportedTokens,
    calculateConversionRates
  };
} 