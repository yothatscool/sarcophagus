'use client';

import React, { useState, useEffect } from 'react';

// Contract addresses and configuration
const CONTRACT_ADDRESSES = {
  TESTNET: {
    MULTISIG_WALLET: '0x1234567890123456789012345678901234567890'
  }
};

const MULTISIG_CONFIG = {
  SIGNERS: ['0x1234567890123456789012345678901234567890'],
  REQUIRED_CONFIRMATIONS: 2
};

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
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // Mock transactions for demo purposes
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
    if (!newTransaction.target) return;

    try {
      setLoading(true);
      setError(null);

      // Mock transaction submission for demo
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
    try {
      setLoading(true);
      setError(null);

      // Mock transaction confirmation for demo
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
    try {
      setLoading(true);
      setError(null);

      // Mock confirmation revocation for demo
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
    try {
      setLoading(true);
      setError(null);

      // Mock transaction execution for demo
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending transactions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Transaction #{transaction.id}</h4>
                      <p className="text-sm text-gray-600">Target: {transaction.target}</p>
                      <p className="text-sm text-gray-600">Value: {transaction.value} VET</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.executed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.executed ? 'Executed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <strong>Confirmations:</strong> {transaction.confirmations}/{MULTISIG_CONFIG.REQUIRED_CONFIRMATIONS}
                    </div>
                    <div>
                      <strong>Timelock:</strong> {new Date(transaction.timelockEnd * 1000).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {!transaction.isConfirmed && (
                      <button
                        onClick={() => confirmTransaction(transaction.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}
                    {transaction.isConfirmed && (
                      <button
                        onClick={() => revokeConfirmation(transaction.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                    {canExecute(transaction) && (
                      <button
                        onClick={() => executeTransaction(transaction.id)}
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
      </div>
    </div>
  );
} 