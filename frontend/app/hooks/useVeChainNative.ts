import { useState, useEffect, useCallback } from 'react';
import Connex from '@vechain/connex';
import { createConnex, getContractAddresses, VECHAIN_UTILS } from '../config/vechain-native';

export interface VeChainAccount {
  address: string;
  balance: string;
  energy: string;
}

export interface VeChainContract {
  address: string;
  abi: any[];
}

export function useVeChainNative(network: 'testnet' | 'mainnet' = 'testnet') {
  const [connex, setConnex] = useState<Connex | null>(null);
  const [account, setAccount] = useState<VeChainAccount | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Connex
  useEffect(() => {
    try {
      const connexInstance = createConnex(network);
      setConnex(connexInstance);
      setError(null);
    } catch (err) {
      setError('Failed to initialize VeChain connection');
      console.error('VeChain initialization error:', err);
    }
  }, [network]);

  // Connect wallet (VeWorld, Sync2, etc.)
  const connectWallet = useCallback(async () => {
    if (!connex) {
      setError('VeChain not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if VeWorld is available
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
        }
      } else {
        // Fallback to manual connection
        setError('VeWorld wallet not found. Please install VeWorld or use Sync2.');
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connex]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Get contract instance
  const getContract = useCallback((contractName: string) => {
    if (!connex) return null;

    const addresses = getContractAddresses(network);
    const address = addresses[contractName as keyof typeof addresses];
    
    if (!address) {
      console.error(`Contract address not found for ${contractName}`);
      return null;
    }

    return connex.thor.account(address);
  }, [connex, network]);

  // Call contract method (simplified)
  const callContract = useCallback(async (
    contractName: string, 
    method: string, 
    params: any[] = [],
    value: string = '0'
  ) => {
    if (!connex || !account) {
      throw new Error('Not connected to VeChain');
    }

    const contract = getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    try {
      // For now, return a mock response
      // In a real implementation, this would create and sign transactions
      console.log(`Contract call: ${contractName}.${method}(${params.join(', ')})`);
      return { success: true, message: 'Transaction ready for signing' };
    } catch (err) {
      console.error(`Contract call error:`, err);
      throw err;
    }
  }, [connex, account, getContract]);

  // Get account balance
  const getBalance = useCallback(async (address?: string) => {
    if (!connex) return null;

    const targetAddress = address || account?.address;
    if (!targetAddress) return null;

    try {
      const balance = await connex.thor.account(targetAddress).get();
      return {
        vet: VECHAIN_UTILS.fromWei(balance.balance),
        energy: VECHAIN_UTILS.fromWei(balance.energy)
      };
    } catch (err) {
      console.error('Balance fetch error:', err);
      return null;
    }
  }, [connex, account]);

  // Get transaction history (simplified)
  const getTransactionHistory = useCallback(async (address?: string, limit: number = 10) => {
    if (!connex) return [];

    const targetAddress = address || account?.address;
    if (!targetAddress) return [];

    try {
      // For now, return empty array
      // In a real implementation, this would fetch transaction history
      console.log(`Getting transaction history for ${targetAddress}`);
      return [];
    } catch (err) {
      console.error('Transaction history error:', err);
      return [];
    }
  }, [connex, account]);

  return {
    connex,
    account,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    getContract,
    callContract,
    getBalance,
    getTransactionHistory,
    utils: VECHAIN_UTILS
  };
} 