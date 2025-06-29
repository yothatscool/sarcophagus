'use client';

import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';
import { VECHAIN_UTILS } from '../config/vechain-native';
import { useNotification } from '../contexts/NotificationContext';
import { ContractInteractions } from '../utils/contractInteractions';
import { testContractIntegration, testMockIntegration } from '../utils/test-contract-integration';
import QuickStats from './QuickStats';
import RecentActivity from './RecentActivity';
import CreateSarcophagus from './CreateSarcophagus';
import ManageVault from './ManageVault';
import BeneficiaryModal from './BeneficiaryModal';
import LegalDisclosure from './LegalDisclosure';

interface SarcophagusDashboardProps {
  account: {
    address: string;
    balance: string;
    energy: string;
  } | null;
  connex?: any;
  onUserDataUpdate?: (userData: any) => void;
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

export default function SarcophagusDashboard({ account, connex, onUserDataUpdate }: SarcophagusDashboardProps) {
  const [userVerification, setUserVerification] = useState<UserVerification | null>(null);
  const [sarcophagusData, setSarcophagusData] = useState<SarcophagusData | null>(null);
  const [obolBalance, setObolBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage' | 'beneficiaries' | 'verification'>('overview');
  const [isTestMode, setIsTestMode] = useState(true); // Default to test mode
  const [lastTransaction, setLastTransaction] = useState<{txid: string, status: 'pending' | 'success' | 'failed'} | null>(null);

  useEffect(() => {
    if (account && connex) {
      loadUserData();
    }
  }, [account, connex, isTestMode]);

  const loadUserData = async () => {
    if (!account || !connex) return;
    
    setIsLoading(true);
    try {
      console.log('Loading user data...');
      
      // Initialize contract interactions
      const contractInteractions = new ContractInteractions(connex, isTestMode);
      
      // Load user verification status
      const verification = await contractInteractions.getUserVerification(account.address);
      setUserVerification(verification);
      
      // Load sarcophagus data
      const sarcophagus = await contractInteractions.getUserSarcophagus(account.address);
      setSarcophagusData(sarcophagus);
      
      // Load OBOL rewards
      const obolRewards = await contractInteractions.getObolRewards(account.address);
      setObolBalance(obolRewards);

      console.log('User data loaded successfully');

      // Update parent component
      if (onUserDataUpdate) {
        onUserDataUpdate({
          isVerified: verification.isVerified,
          hasSarcophagus: !!sarcophagus,
          userSarcophagus: sarcophagus,
          userBeneficiaries: sarcophagus?.beneficiaries || [],
          obolRewards: obolRewards
        });
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback to mock data on error
      setUserVerification({
        isVerified: false,
        age: 0,
        verificationHash: 'Error loading verification'
      });
      setSarcophagusData(null);
      setObolBalance('0');
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
      
      const contractInteractions = new ContractInteractions(connex, isTestMode);
      
      // Generate a mock verification hash for testing
      const verificationHash = `verification-${account.address}-${Date.now()}`;
      const age = 35; // Mock age for now
      
      // Call the contract to verify user
      const tx = await contractInteractions.verifyUser(account.address, age, verificationHash);
      
      // Set transaction as pending
      setLastTransaction({ txid: tx.txid, status: 'pending' });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.reverted) {
        setLastTransaction({ txid: tx.txid, status: 'failed' });
        throw new Error('Transaction reverted');
      }
      
      // Set transaction as successful
      setLastTransaction({ txid: tx.txid, status: 'success' });
      
      console.log('Verification successful! Transaction ID:', tx.txid);
      
      // Update local state
      setUserVerification({
        isVerified: true,
        age: age,
        verificationHash: verificationHash
      });
      
      // Update parent component
      if (onUserDataUpdate) {
        onUserDataUpdate({
          isVerified: true,
          hasSarcophagus: !!sarcophagusData,
          userSarcophagus: sarcophagusData,
          userBeneficiaries: sarcophagusData?.beneficiaries || [],
          obolRewards: obolBalance
        });
      }
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `✅ Identity verification successful! Transaction: ${tx.txid.substring(0, 10)}...`;
      document.body.appendChild(successMessage);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error during verification:', error);
      
      // Set transaction as failed if we have a txid
      if (lastTransaction && lastTransaction.status === 'pending') {
        setLastTransaction({ txid: lastTransaction.txid, status: 'failed' });
      }
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSarcophagus = async () => {
    if (!account || !connex) {
      alert('Please connect your wallet first.');
      return;
    }
    
    if (!userVerification?.isVerified) {
      alert('Please verify your identity first.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Creating sarcophagus...');
      
      const contractInteractions = new ContractInteractions(connex, isTestMode);
      
      // Mock beneficiaries for now - in a real app, this would come from a form
      const beneficiaries = [
        '0x1234567890123456789012345678901234567890',
        '0x0987654321098765432109876543210987654321'
      ];
      const percentages = [60, 40]; // 60% to first beneficiary, 40% to second
      
      // Call the contract to create sarcophagus
      const tx = await contractInteractions.createSarcophagus(account.address, beneficiaries, percentages);
      
      // Set transaction as pending
      setLastTransaction({ txid: tx.txid, status: 'pending' });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.reverted) {
        setLastTransaction({ txid: tx.txid, status: 'failed' });
        throw new Error('Transaction reverted');
      }
      
      // Set transaction as successful
      setLastTransaction({ txid: tx.txid, status: 'success' });
      
      console.log('Sarcophagus created successfully! Transaction ID:', tx.txid);
      
      // Update local state with mock data (in real app, we'd fetch from blockchain)
      const newSarcophagusData: SarcophagusData = {
        vetAmount: '0', // Will be updated when funds are added
        createdAt: Date.now(),
        beneficiaries: beneficiaries.map((addr, index) => ({
          recipient: addr,
          percentage: percentages[index],
          isMinor: false,
          age: 25
        }))
      };
      
      setSarcophagusData(newSarcophagusData);
      
      // Update parent component
      if (onUserDataUpdate) {
        onUserDataUpdate({
          isVerified: userVerification.isVerified,
          hasSarcophagus: true,
          userSarcophagus: newSarcophagusData,
          userBeneficiaries: newSarcophagusData.beneficiaries,
          obolRewards: obolBalance
        });
      }
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `✅ Sarcophagus created! Transaction: ${tx.txid.substring(0, 10)}...`;
      document.body.appendChild(successMessage);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error creating sarcophagus:', error);
      
      // Set transaction as failed if we have a txid
      if (lastTransaction && lastTransaction.status === 'pending') {
        setLastTransaction({ txid: lastTransaction.txid, status: 'failed' });
      }
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Failed to create sarcophagus: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Funds Handler
  const handleAddFunds = async () => {
    if (!account || !connex || !sarcophagusData) {
      alert('Please connect your wallet and ensure you have an active vault.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting add funds process...');
      
      // Mock add funds process
      setTimeout(() => {
        console.log('Mock add funds successful!');
        
        // Update the sarcophagus data with more funds
        const currentAmount = BigInt(sarcophagusData.vetAmount);
        const newAmount = currentAmount + BigInt('500000000000000000'); // Add 0.5 VET
        const updatedSarcophagusData = {
          ...sarcophagusData,
          vetAmount: newAmount.toString()
        };
        
        setSarcophagusData(updatedSarcophagusData);
        
        // Update parent component with new sarcophagus data
        if (onUserDataUpdate) {
          onUserDataUpdate({
            isVerified: true,
            hasSarcophagus: true,
            userSarcophagus: updatedSarcophagusData,
            userBeneficiaries: updatedSarcophagusData.beneficiaries,
            obolRewards: '1500000000000000000' // Increase OBOL rewards to 1.5
          });
        }
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = '✅ Funds added successfully! 0.5 VET added to your vault.';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error adding funds:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error adding funds: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
      setIsLoading(false);
    }
  };

  // Update Beneficiaries Handler
  const handleUpdateBeneficiaries = async () => {
    if (!account || !connex || !sarcophagusData) {
      alert('Please connect your wallet and ensure you have an active vault.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting update beneficiaries process...');
      
      // Mock update beneficiaries process
      setTimeout(() => {
        console.log('Mock update beneficiaries successful!');
        
        // Update with new beneficiary data
        const updatedBeneficiaries = [
          {
            recipient: '0x1234567890123456789012345678901234567890',
            percentage: 40,
            isMinor: false,
            age: 25
          },
          {
            recipient: '0x0987654321098765432109876543210987654321',
            percentage: 35,
            isMinor: false,
            age: 30
          },
          {
            recipient: '0x1111111111111111111111111111111111111111',
            percentage: 25,
            isMinor: true,
            age: 15
          }
        ];
        
        const updatedSarcophagusData = {
          ...sarcophagusData,
          beneficiaries: updatedBeneficiaries
        };
        
        setSarcophagusData(updatedSarcophagusData);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = '✅ Beneficiaries updated successfully! Added 1 new beneficiary.';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating beneficiaries:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error updating beneficiaries: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
      setIsLoading(false);
    }
  };

  // Emergency Withdraw Handler
  const handleEmergencyWithdraw = async () => {
    if (!account || !connex || !sarcophagusData) {
      alert('Please connect your wallet and ensure you have an active vault.');
      return;
    }
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      '⚠️ Emergency Withdraw Warning\n\n' +
      'This action will immediately withdraw all funds from your vault and distribute them to beneficiaries.\n' +
      'This action cannot be undone.\n\n' +
      'Are you sure you want to proceed?'
    );
    
    if (!confirmed) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting emergency withdraw process...');
      
      // Mock emergency withdraw process
      setTimeout(() => {
        console.log('Mock emergency withdraw successful!');
        
        // Clear the sarcophagus data (withdraw all funds)
        setSarcophagusData(null);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = '✅ Emergency withdraw completed! All funds have been distributed to beneficiaries.';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        setIsLoading(false);
      }, 3000); // Longer delay for emergency action
      
    } catch (error) {
      console.error('Error during emergency withdraw:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error during emergency withdraw: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
      setIsLoading(false);
    }
  };

  // Add New Beneficiary Handler
  const handleAddNewBeneficiary = async () => {
    if (!account || !connex || !sarcophagusData) {
      alert('Please connect your wallet and ensure you have an active vault.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting add new beneficiary process...');
      
      // Mock add new beneficiary process
      setTimeout(() => {
        console.log('Mock add new beneficiary successful!');
        
        // Add a new beneficiary
        const newBeneficiary = {
          recipient: '0x2222222222222222222222222222222222222222',
          percentage: 20,
          isMinor: false,
          age: 28
        };
        
        const updatedBeneficiaries = [...sarcophagusData.beneficiaries, newBeneficiary];
        
        // Recalculate percentages to ensure they add up to 100%
        const totalPercentage = updatedBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
        if (totalPercentage > 100) {
          // Adjust the last beneficiary's percentage
          updatedBeneficiaries[updatedBeneficiaries.length - 1].percentage = 
            updatedBeneficiaries[updatedBeneficiaries.length - 1].percentage - (totalPercentage - 100);
        }
        
        const updatedSarcophagusData = {
          ...sarcophagusData,
          beneficiaries: updatedBeneficiaries
        };
        
        setSarcophagusData(updatedSarcophagusData);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = '✅ New beneficiary added successfully!';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error adding new beneficiary:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error adding new beneficiary: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
      setIsLoading(false);
    }
  };

  // Edit Beneficiary Handler
  const handleEditBeneficiary = async (index: number) => {
    if (!account || !connex || !sarcophagusData) {
      alert('Please connect your wallet and ensure you have an active vault.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Starting edit beneficiary process for index ${index}...`);
      
      // Mock edit beneficiary process
      setTimeout(() => {
        console.log('Mock edit beneficiary successful!');
        
        // Update the beneficiary at the specified index
        const updatedBeneficiaries = [...sarcophagusData.beneficiaries];
        updatedBeneficiaries[index] = {
          ...updatedBeneficiaries[index],
          percentage: updatedBeneficiaries[index].percentage + 5, // Increase percentage by 5%
          age: updatedBeneficiaries[index].age + 1 // Increase age by 1
        };
        
        const updatedSarcophagusData = {
          ...sarcophagusData,
          beneficiaries: updatedBeneficiaries
        };
        
        setSarcophagusData(updatedSarcophagusData);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = '✅ Beneficiary updated successfully!';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error editing beneficiary:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error editing beneficiary: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
      setIsLoading(false);
    }
  };

  const handleTestIntegration = async () => {
    if (!connex) {
      alert('Please connect your wallet first.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Running contract integration tests...');
      
      // Test mock integration first
      const mockResult = await testMockIntegration(connex);
      
      // Test real integration if not in test mode
      let realResult = false;
      if (!isTestMode) {
        realResult = await testContractIntegration(connex);
      }
      
      // Show results
      const message = isTestMode 
        ? `Mock Tests: ${mockResult ? '✅ PASSED' : '❌ FAILED'}`
        : `Mock Tests: ${mockResult ? '✅ PASSED' : '❌ FAILED'}\nReal Tests: ${realResult ? '✅ PASSED' : '❌ FAILED'}`;
      
      alert(`Integration Test Results:\n\n${message}`);
      
    } catch (error) {
      console.error('Error running integration tests:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">🏺 Sarcophagus Dashboard</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mode:</span>
            <button
              onClick={() => setIsTestMode(!isTestMode)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isTestMode 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}
            >
              {isTestMode ? '🧪 Test Mode' : '🔗 Live Mode'}
            </button>
            <button
              onClick={handleTestIntegration}
              disabled={isLoading}
              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 disabled:opacity-50"
            >
              {isLoading ? '⏳ Testing...' : '🧪 Test Integration'}
            </button>
          </div>
        </div>
        <p className="text-gray-600">Manage your digital inheritance on VeChain</p>
        {isTestMode && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            🧪 Test Mode: Using mock data. Switch to Live Mode for real blockchain transactions.
          </div>
        )}
        {lastTransaction && (
          <div className={`mt-2 p-2 rounded text-xs ${
            lastTransaction.status === 'pending' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
            lastTransaction.status === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {lastTransaction.status === 'pending' && '⏳ Transaction pending...'}
            {lastTransaction.status === 'success' && '✅ Transaction confirmed!'}
            {lastTransaction.status === 'failed' && '❌ Transaction failed!'}
            <span className="ml-2 font-mono text-xs">
              {lastTransaction.txid.substring(0, 10)}...
            </span>
          </div>
        )}
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
                      <button
                        onClick={handleAddFunds}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Add Funds
                      </button>
                      <button
                        onClick={handleUpdateBeneficiaries}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Update Beneficiaries
                      </button>
                      <button
                        onClick={handleEmergencyWithdraw}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                      >
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
                      <button
                        onClick={() => handleEditBeneficiary(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddNewBeneficiary}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
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