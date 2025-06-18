import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { getContract, sendTransaction } from '../utils/contracts';
import { CONTRACT_ADDRESSES, VEREAVEMENT_ABI } from '../config/contracts';

export function useVereavementContract() {
  const { connex, address } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);
  const [ritualValue, setRitualValue] = useState<string>('0');
  const [carbonOffset, setCarbonOffset] = useState<string>('0');
  const [longevityScore, setLongevityScore] = useState<string>('0');

  useEffect(() => {
    const initContract = async () => {
      const vereavementContract = await getContract(
        connex,
        CONTRACT_ADDRESSES.VEREAVEMENT,
        VEREAVEMENT_ABI
      );
      setContract(vereavementContract);
    };

    if (connex) {
      initContract();
    }
  }, [connex]);

  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !address) return;

      try {
        const [value, offset, score] = await Promise.all([
          contract.getRitualValue(address),
          contract.getCarbonOffset(address),
          contract.getLongevityScore(address)
        ]);

        setRitualValue(value.toString());
        setCarbonOffset(offset.toString());
        setLongevityScore(score.toString());
      } catch (error) {
        console.error('Error fetching contract data:', error);
      }
    };

    fetchData();
  }, [contract, address]);

  const createRitualVault = async () => {
    return sendTransaction(connex, contract, 'createRitualVault', []);
  };

  const recordCarbonOffset = async (amount: string, source: string) => {
    return sendTransaction(connex, contract, 'recordCarbonOffset', [amount, source, '0x']);
  };

  const processSymbolicGrowth = async () => {
    return sendTransaction(connex, contract, 'processSymbolicGrowth', []);
  };

  const addBeneficiary = async (beneficiary: string, percentage: number) => {
    return sendTransaction(connex, contract, 'addBeneficiary', [beneficiary, percentage]);
  };

  const completeRitual = async (ritualType: string) => {
    return sendTransaction(connex, contract, 'completeRitual', [ritualType]);
  };

  const preserveMemorial = async (memorialHash: string) => {
    return sendTransaction(connex, contract, 'preserveMemorial', [memorialHash]);
  };

  const refreshData = async () => {
    if (!contract || !address) return;

    try {
      const [value, offset, score] = await Promise.all([
        contract.getRitualValue(address),
        contract.getCarbonOffset(address),
        contract.getLongevityScore(address)
      ]);

      setRitualValue(value.toString());
      setCarbonOffset(offset.toString());
      setLongevityScore(score.toString());
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const getBeneficiaries = async () => {
    if (!contract || !address) return [];

    try {
      const beneficiaryCount = await contract.getBeneficiaryCount(address);
      const beneficiaries = await Promise.all(
        Array.from({ length: beneficiaryCount.toNumber() }, (_, i) =>
          contract.getBeneficiaryAtIndex(address, i)
        )
      );

      return beneficiaries.map(b => ({
        address: b.beneficiaryAddress,
        percentage: b.percentage.toNumber()
      }));
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      throw error;
    }
  };

  const removeBeneficiary = async (beneficiaryAddress: string) => {
    return sendTransaction(connex, contract, 'removeBeneficiary', [beneficiaryAddress]);
  };

  return {
    contract,
    ritualValue,
    carbonOffset,
    longevityScore,
    createRitualVault,
    recordCarbonOffset,
    processSymbolicGrowth,
    addBeneficiary,
    completeRitual,
    preserveMemorial,
    getBeneficiaries,
    removeBeneficiary,
    refreshData
  };
} 