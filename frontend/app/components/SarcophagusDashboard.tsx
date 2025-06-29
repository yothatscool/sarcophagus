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

// Utility function to encode function calls
function encodeFunctionCall(functionName: string, types: string[], values: any[]): string {
  // Function signature hashes (first 4 bytes of keccak256)
  const functionSignatures: { [key: string]: string } = {
    'verifyUser(address,uint256,string)': '0xfcaa653e', // Calculated
    'createSarcophagus(address[],uint16[],address[],bool[],uint8[],address[],uint256[])': '0x12345678', // Placeholder
    'getUserVerification(address)': '0x8da5cb5b', // Known
    'sarcophagi(address)': '0x12345678', // Placeholder
    'balanceOf(address)': '0x70a08231' // Known ERC20 balanceOf
  };
  
  const signature = functionSignatures[functionName];
  if (!signature) {
    throw new Error(`Function signature not found for: ${functionName}`);
  }
  
  // For now, return the signature - in a real implementation, we'd encode the parameters
  // This is a simplified version - we'll need to properly encode the parameters
  return signature;
}

// Simple parameter encoding for basic types
function encodeParameter(type: string, value: any): string {
  if (type === 'address') {
    // Remove '0x' prefix and pad to 64 characters
    return value.replace('0x', '').padStart(64, '0');
  } else if (type === 'uint256' || type === 'uint8') {
    // Convert number to hex and pad to 64 characters
    return parseInt(value).toString(16).padStart(64, '0');
  } else if (type === 'string') {
    // For strings, we need to encode the offset and length
    // This is a simplified version - in production, use a proper ABI encoder
    const stringHex = Buffer.from(value, 'utf8').toString('hex');
    return '0000000000000000000000000000000000000000000000000000000000000020' + // offset
           stringHex.length.toString(16).padStart(64, '0') + // length
           stringHex.padEnd(64, '0'); // data
  }
  return '';
}

// Enhanced function call encoding
function encodeFunctionCallWithParams(functionName: string, types: string[], values: any[]): string {
  const functionSignatures: { [key: string]: string } = {
    'verifyUser(address,uint256,string)': '0xfcaa653e',
    'createSarcophagus(address[],uint16[],address[],bool[],uint8[],address[],uint256[])': '0x12345678',
    'getUserVerification(address)': '0x8da5cb5b',
    'sarcophagi(address)': '0x12345678',
    'balanceOf(address)': '0x70a08231'
  };
  
  const signature = functionSignatures[functionName];
  if (!signature) {
    throw new Error(`Function signature not found for: ${functionName}`);
  }
  
  // Encode parameters
  let encodedParams = '';
  for (let i = 0; i < types.length; i++) {
    encodedParams += encodeParameter(types[i], values[i]);
  }
  
  return signature + encodedParams;
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
      console.log('Loading user data...');
      
      // For now, let's set some mock data to avoid ABI errors
      // TODO: Implement proper contract calls once we figure out the correct ABI format
      
      setUserVerification({
        isVerified: false,
        age: 0,
        verificationHash: 'Not verified yet'
      });

      setSarcophagusData(null);
      setObolBalance('0');

      console.log('User data loaded (mock data)');

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserVerification = async () => {
    if (!account || !connex) {
      alert('Please connect your wallet first.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting user verification process...');
      
      // For now, let's use a mock verification to avoid transaction signing issues
      // This will help us test the UI flow while we fix the wallet integration
      console.log('Using mock verification for testing...');
      
      // Simulate a successful verification with better UX
      setTimeout(() => {
        console.log('Mock verification successful!');
        setUserVerification({
          isVerified: true,
          age: 35, // Mock age for now
          verificationHash: `mock-verification-${Date.now()}`
        });
        
        // Show success message in a more elegant way
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = '✅ Identity verification successful! You can now create your sarcophagus vault.';
        document.body.appendChild(successMessage);
        
        // Remove the message after 5 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error during verification:', error);
      
      // Show error message in a more elegant way
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error during verification: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
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
      
      // For now, let's use a mock sarcophagus creation to avoid transaction signing issues
      // This will help us test the UI flow while we fix the wallet integration
      console.log('Using mock sarcophagus creation for testing...');
      
      // Simulate a successful sarcophagus creation with better UX
      setTimeout(() => {
        console.log('Mock sarcophagus creation successful!');
        
        // Create mock sarcophagus data
        const mockSarcophagusData: SarcophagusData = {
          vetAmount: '1000000000000000000', // 1 VET in wei
          createdAt: Math.floor(Date.now() / 1000),
          beneficiaries: [
            {
              recipient: '0x1234567890123456789012345678901234567890',
              percentage: 50,
              isMinor: false,
              age: 25
            },
            {
              recipient: '0x0987654321098765432109876543210987654321',
              percentage: 50,
              isMinor: false,
              age: 30
            }
          ]
        };
        
        setSarcophagusData(mockSarcophagusData);
        
        // Show success message in a more elegant way
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = '✅ Sarcophagus vault created successfully! Your digital inheritance is now secure.';
        document.body.appendChild(successMessage);
        
        // Remove the message after 5 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating sarcophagus:', error);
      
      // Show error message in a more elegant way
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error creating sarcophagus: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
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
        {/* Development Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 Development Mode</h3>
          <p className="text-sm text-yellow-700">
            This is currently running in development mode with mock data. Wallet transactions are simulated for testing purposes. 
            Real blockchain transactions will be enabled once wallet integration is fully implemented.
          </p>
        </div>

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