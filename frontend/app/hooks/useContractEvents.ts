import { useEffect } from 'react';
import { useContract } from './useContract';
import { CONTRACT_ADDRESSES, VEREAVEMENT_ABI, RITUAL_ENGINE_ABI } from '../config/contracts';

export function useContractEvents(onEvent: (eventName: string, data: any) => void) {
  const { contract: vereavementContract } = useContract(CONTRACT_ADDRESSES.VEREAVEMENT, VEREAVEMENT_ABI);
  const { contract: ritualContract } = useContract(CONTRACT_ADDRESSES.RITUAL_ENGINE, RITUAL_ENGINE_ABI);

  useEffect(() => {
    if (!vereavementContract || !ritualContract) return;

    // Vereavement Events
    const vaultCreatedFilter = vereavementContract.filters.VaultCreated();
    const ritualCompletedFilter = vereavementContract.filters.LegacyRitualCompleted();
    const memorialPreservedFilter = vereavementContract.filters.MemorialPreserved();

    // Ritual Events
    const carbonOffsetFilter = ritualContract.filters.CarbonOffsetRecorded();
    const longevityScoreFilter = ritualContract.filters.LongevityScoreUpdated();
    const symbolicGrowthFilter = ritualContract.filters.SymbolicGrowthOccurred();

    // Event Handlers
    const handleVaultCreated = (owner: string, name: string) => {
      onEvent('VaultCreated', { owner, name });
    };

    const handleRitualCompleted = (user: string, ritualType: string) => {
      onEvent('RitualCompleted', { user, ritualType });
    };

    const handleMemorialPreserved = (user: string, memorialHash: string) => {
      onEvent('MemorialPreserved', { user, memorialHash });
    };

    const handleCarbonOffset = (user: string, amount: bigint, source: string) => {
      onEvent('CarbonOffsetRecorded', { user, amount: amount.toString(), source });
    };

    const handleLongevityScore = (user: string, newScore: bigint) => {
      onEvent('LongevityScoreUpdated', { user, newScore: newScore.toString() });
    };

    const handleSymbolicGrowth = (user: string, newValue: bigint) => {
      onEvent('SymbolicGrowthOccurred', { user, newValue: newValue.toString() });
    };

    // Add Event Listeners
    vereavementContract.on(vaultCreatedFilter, handleVaultCreated);
    vereavementContract.on(ritualCompletedFilter, handleRitualCompleted);
    vereavementContract.on(memorialPreservedFilter, handleMemorialPreserved);
    ritualContract.on(carbonOffsetFilter, handleCarbonOffset);
    ritualContract.on(longevityScoreFilter, handleLongevityScore);
    ritualContract.on(symbolicGrowthFilter, handleSymbolicGrowth);

    // Cleanup
    return () => {
      vereavementContract.off(vaultCreatedFilter, handleVaultCreated);
      vereavementContract.off(ritualCompletedFilter, handleRitualCompleted);
      vereavementContract.off(memorialPreservedFilter, handleMemorialPreserved);
      ritualContract.off(carbonOffsetFilter, handleCarbonOffset);
      ritualContract.off(longevityScoreFilter, handleLongevityScore);
      ritualContract.off(symbolicGrowthFilter, handleSymbolicGrowth);
    };
  }, [vereavementContract, ritualContract, onEvent]);
} 