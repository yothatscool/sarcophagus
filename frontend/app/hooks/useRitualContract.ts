import { useContract } from './useContract';
import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ADDRESSES, RITUAL_ENGINE_ABI } from '../config/contracts';

interface ContractTransaction {
  hash: string;
  wait: () => Promise<any>;
}

export function useRitualContract() {
  const { contract } = useContract(CONTRACT_ADDRESSES.RITUAL_ENGINE, RITUAL_ENGINE_ABI);
  const [ritualState, setRitualState] = useState<any>(null);

  useEffect(() => {
    if (contract) {
      fetchRitualState();
    }
  }, [contract]);

  const fetchRitualState = async () => {
    if (!contract) return;

    try {
      const state = await contract.getRitualState();
      setRitualState(state);
    } catch (error) {
      console.error('Error fetching ritual state:', error);
    }
  };

  const updateLongevityMetrics = async (): Promise<ContractTransaction> => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.updateLongevityMetrics();
    return tx;
  };

  const processSymbolicGrowth = async (): Promise<ContractTransaction> => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.processSymbolicGrowth();
    return tx;
  };

  const recordCarbonOffset = async (
    amount: string,
    source: string,
    proofHash: string
  ): Promise<ContractTransaction> => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.recordCarbonOffset(amount, source, proofHash);
    return tx;
  };

  const getRitualValue = async (user: string): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    const value = await contract.getRitualValue(user);
    return value.toString();
  };

  const getLongevityScore = async (user: string): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    const score = await contract.getLongevityScore(user);
    return score.toString();
  };

  const getTotalCarbonOffset = async (user: string): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    const offset = await contract.getTotalCarbonOffset(user);
    return offset.toString();
  };

  return {
    contract,
    ritualState,
    updateLongevityMetrics,
    processSymbolicGrowth,
    recordCarbonOffset,
    getRitualValue,
    getLongevityScore,
    getTotalCarbonOffset,
    refreshState: fetchRitualState
  };
} 