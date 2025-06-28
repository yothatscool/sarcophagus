'use client';

import { useState, useEffect } from 'react';
import { getContractAddresses, VECHAIN_UTILS } from '../config/vechain-native';

interface ContractInteractionProps {
  account: {
    address: string;
    balance: string;
    energy: string;
  } | null;
  connex: any;
}

export default function VeChainContractInteraction({ account, connex }: ContractInteractionProps) {
  const [contracts, setContracts] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<string>('sarcophagus');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [methodParams, setMethodParams] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    if (connex) {
      const addresses = getContractAddresses('testnet');
      setContracts(addresses);
    }
  }, [connex]);

  const contractMethods = {
    sarcophagus: [
      { name: 'createSarcophagus', params: ['beneficiaries[]', 'percentages[]'] },
      { name: 'depositVET', params: [] },
      { name: 'depositVTHO', params: ['amount'] },
      { name: 'withdrawAssets', params: [] },
      { name: 'getUserVault', params: ['user'] }
    ],
    obolToken: [
      { name: 'claimContinuousRewards', params: ['user'] },
      { name: 'balanceOf', params: ['account'] },
      { name: 'transfer', params: ['to', 'amount'] }
    ],
    b3trRewards: [
      { name: 'calculateRewards', params: ['user'] },
      { name: 'claimRewards', params: ['user'] },
      { name: 'getUserStats', params: ['user'] }
    ],
    deathVerifier: [
      { name: 'verifyDeath', params: ['user', 'timestamp'] },
      { name: 'getVerificationStatus', params: ['user'] },
      { name: 'getOracleCount', params: [] }
    ]
  };

  const callContractMethod = async () => {
    if (!connex || !account || !selectedContract || !selectedMethod) {
      setResult('Error: Missing required parameters');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const contractAddress = contracts[selectedContract];
      if (!contractAddress) {
        setResult('Error: Contract address not found');
        return;
      }

      // Parse parameters
      let params: any[] = [];
      if (methodParams.trim()) {
        try {
          params = JSON.parse(methodParams);
        } catch (e) {
          setResult('Error: Invalid parameters format. Use JSON array format.');
          return;
        }
      }

      // Create transaction clause
      const clause = connex.thor.transaction()
        .clause(contractAddress)
        .method(selectedMethod, params);

      // For read-only methods, we can call directly
      const isReadOnly = ['balanceOf', 'getUserVault', 'calculateRewards', 'getVerificationStatus', 'getOracleCount'].includes(selectedMethod);
      
      if (isReadOnly) {
        const result = await clause.call();
        setResult(JSON.stringify(result, null, 2));
      } else {
        // For write methods, we need user to sign
        setResult('Transaction ready for signing. Please approve in your wallet.');
        // In a real implementation, this would trigger wallet signing
        console.log('Transaction clause:', clause);
      }

    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getContractExplorerUrl = (contractName: string) => {
    const address = contracts?.[contractName];
    if (!address) return '#';
    return `https://explore-testnet.vechain.org/address/${address}`;
  };

  if (!contracts) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading contracts...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🔧 VeChain Contract Interaction
      </h2>

      {!account ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Please connect your VeChain wallet first.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Contract Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Contract
            </label>
            <select
              value={selectedContract}
              onChange={(e) => {
                setSelectedContract(e.target.value);
                setSelectedMethod('');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sarcophagus">Sarcophagus (Main Contract)</option>
              <option value="obolToken">OBOL Token</option>
              <option value="b3trRewards">B3TR Rewards</option>
              <option value="deathVerifier">Death Verifier</option>
            </select>
            
            <div className="mt-2">
              <a
                href={getContractExplorerUrl(selectedContract)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View on VeChain Explorer →
              </a>
            </div>
          </div>

          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a method...</option>
              {contractMethods[selectedContract as keyof typeof contractMethods]?.map((method) => (
                <option key={method.name} value={method.name}>
                  {method.name}({method.params.join(', ')})
                </option>
              ))}
            </select>
          </div>

          {/* Parameters */}
          {selectedMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parameters (JSON array format)
              </label>
              <textarea
                value={methodParams}
                onChange={(e) => setMethodParams(e.target.value)}
                placeholder='["param1", "param2"] or leave empty for no parameters'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Execute Button */}
          {selectedMethod && (
            <button
              onClick={callContractMethod}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Executing...' : 'Execute Method'}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Result:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 