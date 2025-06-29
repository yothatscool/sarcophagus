'use client';

import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';
import { VECHAIN_UTILS } from '../config/vechain-native';

interface SarcophagusDashboardProps {
  account: {
    address: string;
    balance: string;
    energy: string;
  } | null;
  connex?: any;
}

interface SarcophagusData {
  vetAmount: string;
  createdAt: number;
  beneficiaries: Array<{
    recipient: string;
    percentage: number;
    isMinor: boolean;
    age: number;
  }>;
}

interface UserVerification {
  isVerified: boolean;
  age: number;
  verificationHash: string;
}

export default function SarcophagusDashboard({ account, connex }: SarcophagusDashboardProps) {
  const [userVerification, setUserVerification] = useState<UserVerification | null>(null);
  const [sarcophagusData, setSarcophagusData] = useState<SarcophagusData | null>(null);
  const [obolBalance, setObolBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage' | 'beneficiaries' | 'verification'>('overview');

  useEffect(() => {
    if (account && connex) {
      loadUserData();
    }
  }, [account, connex]);

  const loadUserData = async () => {
    if (!account || !connex) return;
    
    setIsLoading(true);
    try {
      // Load user verification status from DeathVerifier contract
      const verificationClause = connex.thor
        .account(CONTRACT_ADDRESSES.testnet.deathVerifier)
        .method('getUserVerification')
        .value(account.address);

      const verificationResult = await verificationClause.call();
      setUserVerification({
        isVerified: verificationResult.decoded[0],
        age: Number(verificationResult.decoded[1]),
        verificationHash: `Age: ${verificationResult.decoded[1]}, Life Expectancy: ${verificationResult.decoded[2]}`
      });

      // Load sarcophagus data
      const sarcophagusClause = connex.thor
        .account(CONTRACT_ADDRESSES.testnet.sarcophagus)
        .method('sarcophagi')
        .value(account.address);

      const sarcophagusResult = await sarcophagusClause.call();
      if (sarcophagusResult.decoded[0] !== '0') {
        setSarcophagusData({
          vetAmount: sarcophagusResult.decoded[0],
          createdAt: Number(sarcophagusResult.decoded[1]),
          beneficiaries: sarcophagusResult.decoded[2] || []
        });
      }

      // Load OBOL balance
      const obolClause = connex.thor
        .account(CONTRACT_ADDRESSES.testnet.obolToken)
        .method('balanceOf')
        .value(account.address);

      const obolResult = await obolClause.call();
      setObolBalance(obolResult.decoded[0]);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserVerification = async () => {
    if (!account || !connex) return;
    
    setIsLoading(true);
    try {
      console.log('Starting user verification process...');
      
      // Create the verification transaction using vendor API
      const clause = connex.thor
        .account(CONTRACT_ADDRESSES.testnet.deathVerifier)
        .method('verifyUser')
        .value(account.address, 30, 'ipfs://QmTestVerificationHash');

      console.log('Verification clause created:', clause);
      
      // Get the signing service from vendor
      const signingService = await connex.vendor.sign('tx', [clause]);
      console.log('Signing service obtained:', signingService);
      
      if (signingService && signingService.txid) {
        console.log('Transaction signed with ID:', signingService.txid);
        
        // Wait for transaction to be mined
        console.log('Waiting for transaction to be mined...');
        const receipt = await connex.thor.transaction(signingService.txid).getReceipt();
        console.log('Transaction receipt:', receipt);
        
        if (receipt && receipt.reverted === false) {
          console.log('Verification successful!');
          alert('Identity verification successful! Your account has been verified.');
          
          // Reload user data to update verification status
          await loadUserData();
        } else {
          console.error('Transaction reverted:', receipt);
          alert('Verification failed. Transaction was reverted. Please try again.');
        }
      } else {
        console.error('No signing service available');
        alert('Unable to sign transaction. Please check your wallet connection.');
      }
      
    } catch (error) {
      console.error('Error during verification:', error);
      alert(`Error during verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSarcophagus = async () => {
    if (!account || !connex || !userVerification?.isVerified) {
      alert('User must be verified before creating a sarcophagus.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting sarcophagus creation process...');
      
      // Generate a test beneficiary (in real app, user would input this)
      const testBeneficiary = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      const clause = connex.thor
        .account(CONTRACT_ADDRESSES.testnet.sarcophagus)
        .method('createSarcophagus')
        .value(
          [testBeneficiary],
          [10000], // 100%
          ['0x0000000000000000000000000000000000000000'],
          [false],
          [25],
          ['0x0000000000000000000000000000000000000000'],
          [0]
        );

      console.log('Sarcophagus creation clause created:', clause);
      
      // Get the signing service from vendor
      const signingService = await connex.vendor.sign('tx', [clause]);
      console.log('Signing service obtained:', signingService);
      
      if (signingService && signingService.txid) {
        console.log('Transaction signed with ID:', signingService.txid);
        
        // Wait for transaction to be mined
        console.log('Waiting for transaction to be mined...');
        const receipt = await connex.thor.transaction(signingService.txid).getReceipt();
        console.log('Transaction receipt:', receipt);
        
        if (receipt && receipt.reverted === false) {
          console.log('Sarcophagus creation successful!');
          alert('Sarcophagus vault created successfully! Your digital inheritance is now secure.');
          
          // Reload user data to update sarcophagus status
          await loadUserData();
        } else {
          console.error('Transaction reverted:', receipt);
          alert('Sarcophagus creation failed. Transaction was reverted. Please try again.');
        }
      } else {
        console.error('No signing service available');
        alert('Unable to sign transaction. Please check your wallet connection.');
      }
      
    } catch (error) {
      console.error('Error creating sarcophagus:', error);
      alert(`Error creating sarcophagus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏺 Sarcophagus Dashboard</h2>
        <p className="text-gray-600">Please connect your VeChain wallet to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🏺 Sarcophagus Dashboard</h2>
        <p className="text-gray-600">Manage your digital inheritance on VeChain</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'create', label: 'Create Vault', icon: '📦' },
            { id: 'manage', label: 'Manage Vault', icon: '⚙️' },
            { id: 'beneficiaries', label: 'Beneficiaries', icon: '👥' },
            { id: 'verification', label: 'Verification', icon: '🔐' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Verification Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔐 Verification Status</h3>
                {userVerification ? (
                  <div>
                    <p className={`text-sm ${userVerification.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {userVerification.isVerified ? '✅ Verified' : '❌ Not Verified'}
                    </p>
                    {userVerification.isVerified && (
                      <p className="text-xs text-gray-600 mt-1">Age: {userVerification.age}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Loading...</p>
                )}
              </div>

              {/* Sarcophagus Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">📦 Vault Status</h3>
                {sarcophagusData ? (
                  <div>
                    <p className="text-sm text-green-600">✅ Active Vault</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Balance: {VECHAIN_UTILS.formatVET(sarcophagusData.vetAmount)} VET
                    </p>
                    <p className="text-xs text-gray-600">
                      Created: {new Date(sarcophagusData.createdAt * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No active vault</p>
                )}
              </div>

              {/* OBOL Balance */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">🪙 OBOL Balance</h3>
                <p className="text-sm text-purple-600">
                  {VECHAIN_UTILS.formatVET(obolBalance)} OBOL
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                {!userVerification?.isVerified && (
                  <button
                    onClick={handleUserVerification}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Verify Identity
                  </button>
                )}
                {userVerification?.isVerified && !sarcophagusData && (
                  <button
                    onClick={handleCreateSarcophagus}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create Vault
                  </button>
                )}
                {sarcophagusData && (
                  <button
                    onClick={() => setActiveTab('manage')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Manage Vault
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Vault Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h3>
              <p className="text-sm text-yellow-700">
                Creating a sarcophagus vault requires identity verification. This is a one-time process that ensures 
                the security and legitimacy of your digital inheritance plan.
              </p>
            </div>

            {!userVerification?.isVerified ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You must verify your identity before creating a vault.</p>
                <button
                  onClick={handleUserVerification}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Verify Identity First
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Create Your Sarcophagus Vault</h3>
                <p className="text-gray-600">
                  Your vault will securely store your digital assets and automatically distribute them to your 
                  beneficiaries according to your specified instructions.
                </p>
                <button
                  onClick={handleCreateSarcophagus}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {isLoading ? 'Creating...' : 'Create Vault'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manage Vault Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {sarcophagusData ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Your Vault</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Vault Details</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Balance:</strong> {VECHAIN_UTILS.formatVET(sarcophagusData.vetAmount)} VET
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Created:</strong> {new Date(sarcophagusData.createdAt * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Beneficiaries:</strong> {sarcophagusData.beneficiaries.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                        Add Funds
                      </button>
                      <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm">
                        Update Beneficiaries
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                        Emergency Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No active vault found.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Create Your First Vault
                </button>
              </div>
            )}
          </div>
        )}

        {/* Beneficiaries Tab */}
        {activeTab === 'beneficiaries' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Manage Beneficiaries</h3>
            {sarcophagusData && sarcophagusData.beneficiaries.length > 0 ? (
              <div className="space-y-4">
                {sarcophagusData.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{beneficiary.recipient}</p>
                        <p className="text-sm text-gray-600">
                          {beneficiary.percentage / 100}% • Age: {beneficiary.age}
                          {beneficiary.isMinor && ' • Minor'}
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                  Add New Beneficiary
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No beneficiaries configured yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Identity Verification</h3>
            {userVerification ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  userVerification.isVerified 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    userVerification.isVerified ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {userVerification.isVerified ? '✅ Verified' : '❌ Not Verified'}
                  </h4>
                  {userVerification.isVerified && (
                    <div className="text-sm text-gray-600">
                      <p>Age: {userVerification.age}</p>
                      <p>Verification Hash: {userVerification.verificationHash}</p>
                    </div>
                  )}
                </div>
                {!userVerification.isVerified && (
                  <button
                    onClick={handleUserVerification}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Identity'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading verification status...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 