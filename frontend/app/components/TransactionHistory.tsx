'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface Transaction {
  txid: string;
  timestamp: number;
  type: string;
  status: 'success' | 'failed' | 'pending';
}

export default function TransactionHistory() {
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchTransactionHistory();
    }
  }, [address]);

  const fetchTransactionHistory = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // For demo purposes, we'll simulate transaction history
      // In production, you would fetch from the blockchain
      const mockTransactions: Transaction[] = [
        {
          txid: '0x1234567890abcdef1234567890abcdef12345678',
          timestamp: Date.now() / 1000 - 3600,
          type: 'Create Vault',
          status: 'success'
        },
        {
          txid: '0xabcdef1234567890abcdef1234567890abcdef12',
          timestamp: Date.now() / 1000 - 7200,
          type: 'Add Beneficiary',
          status: 'success'
        },
        {
          txid: '0x567890abcdef1234567890abcdef1234567890ab',
          timestamp: Date.now() / 1000 - 10800,
          type: 'Deposit Tokens',
          status: 'success'
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
    setIsLoading(false);
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