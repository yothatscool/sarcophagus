'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContractAddresses, VECHAIN_UTILS } from '../config/vechain-native';

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

export function useVeChainNative() {
  const [connex, setConnex] = useState<any>(null);
  const [account, setAccount] = useState<{ address: string; balance: string; energy: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSarcophagus, setUserSarcophagus] = useState<SarcophagusData | null>(null);
  const [hasSarcophagus, setHasSarcophagus] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [userStake, setUserStake] = useState<UserStake | null>(null);

  // Initialize Connex
  useEffect(() => {
    const initConnex = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const Connex = (await import('@vechain/connex')).default;
        const connexInstance = new Connex({
          node: 'https://testnet.vechain.org',
          network: 'test'
        });
        setConnex(connexInstance);
      } catch (err) {
        console.error('Failed to initialize Connex:', err);
        setError('Failed to connect to VeChain');
      }
    };

    initConnex();
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!connex) {
      setError('VeChain not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check for VeWorld wallet
      if (typeof window !== 'undefined' && (window as any).veworld) {
        const veworld = (window as any).veworld;
        const account = await veworld.getAccount();
        
        if (account) {
          const balance = await connex.thor.account(account.address).get();
          setAccount({
            address: account.address,
            balance: VECHAIN_UTILS.fromWei(balance.balance),
            energy: VECHAIN_UTILS.fromWei(balance.energy)
          });
          setIsConnected(true);
          return account.address;
        }
      } else if (typeof window !== 'undefined' && (window as any).sync2) {
        // Check for Sync2 wallet
        const sync2 = (window as any).sync2;
        const account = await sync2.getAccount();
        
        if (account) {
          const balance = await connex.thor.account(account.address).get();
          setAccount({
            address: account.address,
            balance: VECHAIN_UTILS.fromWei(balance.balance),
            energy: VECHAIN_UTILS.fromWei(balance.energy)
          });
          setIsConnected(true);
          return account.address;
        }
      } else {
        setError('No VeChain wallet found. Please install VeWorld or Sync2.');
        return null;
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error('Wallet connection error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [connex]);

  // Get contract addresses
  const getContracts = useCallback(() => {
    return getContractAddresses('testnet');
  }, []);

  // Create sarcophagus
  const createSarcophagus = useCallback(async (beneficiaries: string[], percentages: number[]) => {
    if (!connex || !account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const addresses = getContracts();
      const sarcophagusAddress = addresses.sarcophagus;

      // Create transaction clause
      const clause = connex.thor.transaction()
        .clause(sarcophagusAddress)
        .method('createSarcophagus', [beneficiaries, percentages]);

      // For now, we'll just log the transaction
      // In a real implementation, this would trigger wallet signing
      console.log('Create sarcophagus transaction:', clause);
      
      // Mock success for now
      setHasSarcophagus(true);
      return { wait: async () => {} };
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to create sarcophagus';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [connex, account, getContracts]);

  // Deposit tokens
  const depositTokens = useCallback(async (vthoAmount: string, b3trAmount: string) => {
    if (!connex || !account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const addresses = getContracts();
      const sarcophagusAddress = addresses.sarcophagus;

      // Create transaction clause
      const clause = connex.thor.transaction()
        .clause(sarcophagusAddress)
        .method('depositTokens', [
          VECHAIN_UTILS.toWei(vthoAmount || '0'),
          VECHAIN_UTILS.toWei(b3trAmount || '0')
        ])
        .value(VECHAIN_UTILS.toWei('100')); // Minimum VET deposit

      console.log('Deposit tokens transaction:', clause);
      
      // Mock success for now
      return { wait: async () => {} };
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to deposit tokens';
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [connex, account, getContracts]);

  // Get user sarcophagus data
  const getUserSarcophagus = useCallback(async (userAddress: string) => {
    if (!connex) return null;

    try {
      const addresses = getContracts();
      const sarcophagusAddress = addresses.sarcophagus;

      const result = await connex.thor.transaction()
        .clause(sarcophagusAddress)
        .method('getSarcophagus', [userAddress])
        .call();

      if (result && result.data) {
        // Parse the result data
        // This is a simplified version - you'd need to properly decode the ABI
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting user sarcophagus:', error);
      return null;
    }
  }, [connex, getContracts]);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!connex || !account) return;

    try {
      setLoading(true);
      
      // Get user sarcophagus data
      const sarcophagusData = await getUserSarcophagus(account.address);
      if (sarcophagusData) {
        setUserSarcophagus(sarcophagusData);
        setHasSarcophagus(true);
      } else {
        setHasSarcophagus(false);
        setUserSarcophagus(null);
      }

      // Check if user is verified
      try {
        const addresses = getContracts();
        const sarcophagusAddress = addresses.sarcophagus;
        
        const verificationResult = await connex.thor.transaction()
          .clause(sarcophagusAddress)
          .method('getUserVerification', [account.address])
          .call();

        setIsUserVerified(verificationResult?.data?.isVerified || false);
      } catch (error) {
        setIsUserVerified(false);
      }

    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [connex, account, getUserSarcophagus, getContracts]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    setUserSarcophagus(null);
    setHasSarcophagus(false);
    setIsUserVerified(false);
    setUserStake(null);
  }, []);

  return {
    // State
    connex,
    account,
    isConnected,
    loading,
    error,
    userSarcophagus,
    hasSarcophagus,
    isUserVerified,
    userStake,

    // Functions
    connectWallet,
    disconnectWallet,
    createSarcophagus,
    depositTokens,
    getUserSarcophagus,
    refreshUserData,
    getContracts
  };
} 