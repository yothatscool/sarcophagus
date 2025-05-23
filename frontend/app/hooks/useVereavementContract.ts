import { useContract } from './useContract';
import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ADDRESSES, VEREAVEMENT_ABI } from '../config/contracts';

interface ContractTransaction {
  hash: string;
  wait: () => Promise<any>;
}

export function useVereavementContract() {
  const { contract } = useContract(CONTRACT_ADDRESSES.VEREAVEMENT, VEREAVEMENT_ABI);
  const [ritualValue, setRitualValue] = useState<string>('0');
  const [carbonOffset, setCarbonOffset] = useState<string>('0');
  const [longevityScore, setLongevityScore] = useState<string>('0');

  useEffect(() => {
    if (contract) {
      fetchContractData();
    }
  }, [contract]);

  const fetchContractData = async () => {
    if (!contract) return;

    try {
      const [value, offset, score] = await Promise.all([
        contract.getRitualValue(),
        contract.getCarbonOffset(),
        contract.getLongevityScore()
      ]);

      setRitualValue(value.toString());
      setCarbonOffset(offset.toString());
      setLongevityScore(score.toString());
    } catch (error) {
      console.error('Error fetching contract data:', error);
    }
  };

  const createRitualVault = async (): Promise<ContractTransaction> => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.createRitualVault();
    return tx;
  };

  const recordCarbonOffset = async (amount: string, source: string): Promise<ContractTransaction> => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.recordCarbonOffset(amount, source, '0x');
    return tx;
  };

  const processSymbolicGrowth = async (): Promise<ContractTransaction> => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.processSymbolicGrowth();
    return tx;
  };

  const getContractStatus = async () => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getContractStatus();
  };

  const getRitualState = async () => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getRitualState();
  };

  return {
    contract,
    ritualValue,
    carbonOffset,
    longevityScore,
    createRitualVault,
    recordCarbonOffset,
    processSymbolicGrowth,
    getContractStatus,
    getRitualState,
    refreshData: fetchContractData
  };
} 