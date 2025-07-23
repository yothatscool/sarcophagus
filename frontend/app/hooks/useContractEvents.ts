import { useEffect } from 'react';
import { getCurrentNetworkAddresses } from '../config/contracts';
import SARCOPHAGUS_ABI from '../../../artifacts/contracts/Sarcophagus.sol/Sarcophagus.json';
import DEATH_VERIFIER_ABI from '../../../artifacts/contracts/DeathVerifier.sol/DeathVerifier.json';

// Helper to decode event logs
function decodeEvent(
  abi: any,
  eventName: string,
  data: string,
  topics: string[]
): any {
  try {
    const iface = new (window as any).ethers.utils.Interface(abi);
    return iface.decodeEventLog(eventName, data, topics);
  } catch (e) {
    return null;
  }
}

export function useContractEvents(callback: (eventName: string, data: any) => void) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    const connex = (window as any).connex;
    if (!connex) {
      // Fallback: simulate events for demo
      const timeout = setTimeout(() => {
        callback('VaultCreated', { owner: '0x1234...', name: 'Demo Vault' });
      }, 1000);
      return () => clearTimeout(timeout);
    }

    // Get contract addresses
    const addresses = getCurrentNetworkAddresses();
    const contracts = [
      { address: addresses.sarcophagus, abi: SARCOPHAGUS_ABI.abi },
      { address: addresses.deathVerifier, abi: DEATH_VERIFIER_ABI.abi },
    ];

    // Store filter refs for cleanup
    const filters: any[] = [];

    contracts.forEach(({ address, abi }) => {
      abi.filter((item: any) => item.type === 'event').forEach((event: any) => {
        const filter = connex.thor.filter('event', [address, event.name]);
        filters.push(filter);
        filter.on('data', (log: any) => {
          // Decode event data
          const decoded = decodeEvent(abi, event.name, log.data, log.topics);
          callback(event.name, decoded || log);
        });
      });
    });

    // Cleanup listeners on unmount
    return () => {
      filters.forEach(f => f.off && f.off('data'));
    };
  }, [callback]);
} 