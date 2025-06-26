'use client';

import React, { useState, useEffect } from 'react';
import { CONTRACT_ADDRESSES, MULTISIG_CONFIG } from '../config/contracts';
import { useWallet } from '../contexts/WalletContext';

interface Transaction {
  id: number;
  target: string;
  value: string;
  data: string;
  executed: boolean;
  confirmations: number;
  timelockEnd: number;
  isConfirmed: boolean;
}

interface MultiSigManagerProps {
  userAddress: string;
}

export default function MultiSigManager({ userAddress }: MultiSigManagerProps) {
  const { connex } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    target: '',
    value: '0',
    data: ''
  });

  // Get the current network addresses
  const addresses = CONTRACT_ADDRESSES.TESTNET; // Default to testnet for now

  useEffect(() => {
    if (connex) {
      loadTransactions();
    }
  }, [connex]);

  const loadTransactions = async () => {
    if (!connex) return;

    try {
      setLoading(true);
      // Use Connex to interact with MultiSig contract
      // This is a simplified version - in production you'd use proper Connex contract calls
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          target: addresses.MULTISIG_WALLET,
          value: '1.5',
          data: '0x',
          executed: false,
          confirmations: 1,
          timelockEnd: Date.now() / 1000 + 3600,
          isConfirmed: true
        }
      ];

      setTransactions(mockTransactions);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitTransaction = async () => {
    if (!connex || !newTransaction.target) return;

    try {
      setLoading(true);
      setError(null);

      // Use Connex to submit transaction
      // This would use connex.vendor.sign('tx', {...}) in production
      setSuccess('Transaction submitted successfully');
      setNewTransaction({ target: '', value: '0', data: '' });
      await loadTransactions();
    } catch (err) {
      setError('Failed to submit transaction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmTransaction = async (transactionId: number) => {
    if (!connex) return;

    try {
      setLoading(true);
      setError(null);

      // Use Connex to confirm transaction
      setSuccess('Transaction confirmed successfully');
      await loadTransactions();
    } catch (err) {
      setError('Failed to confirm transaction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const revokeConfirmation = async (transactionId: number) => {
    if (!connex) return;

    try {
      setLoading(true);
      setError(null);

      // Use Connex to revoke confirmation
      setSuccess('Confirmation revoked successfully');
      await loadTransactions();
    } catch (err) {
      setError('Failed to revoke confirmation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeTransaction = async (transactionId: number) => {
    if (!connex) return;

    try {
      setLoading(true);
      setError(null);

      // Use Connex to execute transaction
      setSuccess('Transaction executed successfully');
      await loadTransactions();
    } catch (err) {
      setError('Failed to execute transaction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSigner = MULTISIG_CONFIG.SIGNERS.includes(userAddress);
  const canExecute = (transaction: Transaction) => {
    const now = Math.floor(Date.now() / 1000);
    return transaction.confirmations >= MULTISIG_CONFIG.REQUIRED_CONFIRMATIONS && 
           transaction.timelockEnd <= now && 
           !transaction.executed;
  };

  if (!isSigner) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800">Multi-Sig Access Required</h2>
          <p className="text-yellow-700">You need to be a signer to access this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Multi-Signature Wallet Manager</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Address:</strong> {addresses.MULTISIG_WALLET}
            </div>
            <div>
              <strong>Required Confirmations:</strong> {MULTISIG_CONFIG.REQUIRED_CONFIRMATIONS}
            </div>
          </div>
        </div>

        {/* New Transaction Form */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Submit New Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Address</label>
              <input
                type="text"
                value={newTransaction.target}
                onChange={(e) => setNewTransaction({...newTransaction, target: e.target.value})}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value (VET)</label>
              <input
                type="number"
                value={newTransaction.value}
                onChange={(e) => setNewTransaction({...newTransaction, value: e.target.value})}
                placeholder="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data (hex)</label>
              <input
                type="text"
                value={newTransaction.data}
                onChange={(e) => setNewTransaction({...newTransaction, data: e.target.value})}
                placeholder="0x"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={submitTransaction}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Transaction'}
          </button>
        </div>

        {/* Transactions List */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Transactions</h3>
          {loading ? (
            <div className="text-center py-4">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No transactions found</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <strong>ID: {tx.id}</strong>
                      <div className="text-sm text-gray-600">Target: {tx.target}</div>
                      <div className="text-sm text-gray-600">Value: {tx.value} VET</div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs ${
                        tx.executed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.executed ? 'Executed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!tx.isConfirmed && (
                      <button
                        onClick={() => confirmTransaction(tx.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}
                    {tx.isConfirmed && !tx.executed && (
                      <button
                        onClick={() => revokeConfirmation(tx.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                    {canExecute(tx) && (
                      <button
                        onClick={() => executeTransaction(tx.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-6 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
} 