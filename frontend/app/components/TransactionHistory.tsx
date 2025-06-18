'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Framework } from '@vechain/connex-framework';

interface Transaction {
  txid: string;
  timestamp: number;
  type: string;
  status: 'success' | 'failed' | 'pending';
}

interface VeChainEvent {
  meta: {
    blockNumber: number;
    txID: string;
  };
  topics: string[];
}

export default function TransactionHistory() {
  const { connex, address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (connex && address) {
      fetchTransactionHistory();
    }
  }, [connex, address]);

  const fetchTransactionHistory = async () => {
    if (!connex || !address) return;

    setIsLoading(true);
    try {
      const filter = connex.thor.filter('event', [
        { address: address }
      ]);

      const events = await filter.apply(0, 10);
      const txs: Transaction[] = await Promise.all(
        events.map(async (event: VeChainEvent) => {
          const block = await connex.thor.block(event.meta.blockNumber).get();
          const receipt = await connex.thor.transaction(event.meta.txID).getReceipt();

          return {
            txid: event.meta.txID,
            timestamp: block?.timestamp ?? 0,
            type: getTransactionType(event.topics[0]),
            status: receipt?.reverted ? 'failed' : 'success',
          };
        })
      );

      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
    setIsLoading(false);
  };

  const getTransactionType = (topic: string): string => {
    // Map event signatures to human-readable names
    const eventTypes: { [key: string]: string } = {
      'VaultCreated': 'Create Vault',
      'BeneficiaryAdded': 'Add Beneficiary',
      'RitualCompleted': 'Complete Ritual',
      'MemorialPreserved': 'Preserve Memorial'
    };
    return eventTypes[topic] || 'Transaction';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const shortenHash = (hash: string): string => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-[#1a1f2e]/80 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-4">Transaction History</h2>
        <div className="text-gray-400">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2e]/80 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-purple-400 mb-4">Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="text-gray-400">No transactions found</div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.txid}
              className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-white font-medium">{tx.type}</div>
                <div className="text-gray-400 text-sm">
                  {formatDate(tx.timestamp)} • TX: {shortenHash(tx.txid)}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tx.status === 'success'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {tx.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 