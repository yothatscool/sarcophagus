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

interface Transaction {
  id: string;
  txid: string;
  type: 'verification' | 'create_vault' | 'add_funds' | 'add_beneficiary' | 'update_beneficiary' | 'emergency_withdraw';
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
  timestamp: number;
  description: string;
  amount?: string;
  gasUsed?: string;
  blockNumber?: number;
  confirmations?: number;
  error?: string;
}

// Enhanced error handling interfaces
interface ErrorInfo {
  type: 'wallet' | 'network' | 'validation' | 'contract' | 'user' | 'system';
  code: string;
  title: string;
  message: string;
  suggestion: string;
  action?: string;
  helpUrl?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorContext {
  action: string;
  step: string;
  userData?: any;
  contractData?: any;
}

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
  const [lastTransaction, setLastTransaction] = useState<{ txid: string; status: 'pending' | 'success' | 'failed' } | null>(null);

  // Age input validation state
  const [ageInput, setAgeInput] = useState<string>('');
  const [ageError, setAgeError] = useState<string>('');
  const [showAgeInput, setShowAgeInput] = useState(false);

  // Beneficiary form state
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false);
  const [editingBeneficiaryIndex, setEditingBeneficiaryIndex] = useState<number | null>(null);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    recipient: '',
    percentage: '',
    age: '',
    isMinor: false
  });
  const [beneficiaryErrors, setBeneficiaryErrors] = useState({
    recipient: '',
    percentage: '',
    age: ''
  });

  // Amount validation state
  const [showAmountForm, setShowAmountForm] = useState(false);
  const [amountForm, setAmountForm] = useState({
    vetAmount: '',
    vthoAmount: '',
    b3trAmount: ''
  });
  const [amountErrors, setAmountErrors] = useState({
    vetAmount: '',
    vthoAmount: '',
    b3trAmount: ''
  });
  const [gasEstimate, setGasEstimate] = useState<string>('0');
  const [totalValue, setTotalValue] = useState<string>('0');

  // Enhanced transaction management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactionPolling, setTransactionPolling] = useState<NodeJS.Timeout | null>(null);

  // Age validation function
  const validateAge = (age: string): { isValid: boolean; error: string } => {
    if (!age.trim()) {
      return { isValid: false, error: 'Age is required' };
    }
    
    const ageNum = parseInt(age);
    
    if (isNaN(ageNum)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    
    if (ageNum < 18) {
      return { isValid: false, error: 'You must be at least 18 years old to use this service' };
    }
    
    if (ageNum > 120) {
      return { isValid: false, error: 'Please enter a valid age (maximum 120 years)' };
    }
    
    if (ageNum < 0) {
      return { isValid: false, error: 'Age cannot be negative' };
    }
    
    return { isValid: true, error: '' };
  };

  // Handle age input change
  const handleAgeChange = (value: string) => {
    setAgeInput(value);
    const validation = validateAge(value);
    setAgeError(validation.error);
  };

  // Beneficiary validation functions
  const validateVeChainAddress = (address: string): { isValid: boolean; error: string } => {
    if (!address.trim()) {
      return { isValid: false, error: 'Address is required' };
    }
    
    // VeChain address format: 0x followed by 40 hex characters
    const vechainAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!vechainAddressRegex.test(address)) {
      return { isValid: false, error: 'Please enter a valid VeChain address (0x followed by 40 characters)' };
    }
    
    // Check if it's the same as the user's address
    if (account && address.toLowerCase() === account.address.toLowerCase()) {
      return { isValid: false, error: 'You cannot add yourself as a beneficiary' };
    }
    
    // Check if address already exists in beneficiaries
    if (sarcophagusData && editingBeneficiaryIndex === null) {
      const existingBeneficiary = sarcophagusData.beneficiaries.find(
        b => b.recipient.toLowerCase() === address.toLowerCase()
      );
      if (existingBeneficiary) {
        return { isValid: false, error: 'This address is already a beneficiary' };
      }
    }
    
    return { isValid: true, error: '' };
  };

  const validatePercentage = (percentage: string, currentTotal: number = 0): { isValid: boolean; error: string } => {
    if (!percentage.trim()) {
      return { isValid: false, error: 'Percentage is required' };
    }
    
    const percentageNum = parseFloat(percentage);
    
    if (isNaN(percentageNum)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    
    if (percentageNum <= 0) {
      return { isValid: false, error: 'Percentage must be greater than 0' };
    }
    
    if (percentageNum > 100) {
      return { isValid: false, error: 'Percentage cannot exceed 100%' };
    }
    
    // Check if adding this percentage would exceed 100% total
    const otherBeneficiariesTotal = sarcophagusData 
      ? sarcophagusData.beneficiaries.reduce((sum, b, index) => {
          if (editingBeneficiaryIndex !== null && index === editingBeneficiaryIndex) {
            return sum; // Exclude the one being edited
          }
          return sum + b.percentage;
        }, 0)
      : 0;
    
    const newTotal = otherBeneficiariesTotal + percentageNum;
    if (newTotal > 100) {
      return { isValid: false, error: `Total percentage would exceed 100% (current: ${otherBeneficiariesTotal}%, new total: ${newTotal}%)` };
    }
    
    return { isValid: true, error: '' };
  };

  const validateBeneficiaryAge = (age: string): { isValid: boolean; error: string } => {
    if (!age.trim()) {
      return { isValid: false, error: 'Age is required' };
    }
    
    const ageNum = parseInt(age);
    
    if (isNaN(ageNum)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    
    if (ageNum < 0) {
      return { isValid: false, error: 'Age cannot be negative' };
    }
    
    if (ageNum > 120) {
      return { isValid: false, error: 'Please enter a valid age (maximum 120 years)' };
    }
    
    return { isValid: true, error: '' };
  };

  // Handle beneficiary form changes
  const handleBeneficiaryFormChange = (field: string, value: string | boolean) => {
    setBeneficiaryForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    setBeneficiaryErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Validate entire beneficiary form
  const validateBeneficiaryForm = (): boolean => {
    const recipientValidation = validateVeChainAddress(beneficiaryForm.recipient);
    const percentageValidation = validatePercentage(beneficiaryForm.percentage);
    const ageValidation = validateBeneficiaryAge(beneficiaryForm.age);
    
    setBeneficiaryErrors({
      recipient: recipientValidation.error,
      percentage: percentageValidation.error,
      age: ageValidation.error
    });
    
    return recipientValidation.isValid && percentageValidation.isValid && ageValidation.isValid;
  };

  // Amount validation functions
  const validateVETAmount = (amount: string): { isValid: boolean; error: string } => {
    if (!amount.trim()) {
      return { isValid: false, error: 'Amount is required' };
    }
    
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    
    if (amountNum <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    if (amountNum > 1000000) {
      return { isValid: false, error: 'Amount cannot exceed 1,000,000 VET' };
    }
    
    // Check if user has enough balance
    if (account && amountNum > parseFloat(account.balance)) {
      return { isValid: false, error: `Insufficient balance. You have ${parseFloat(account.balance).toFixed(2)} VET` };
    }
    
    // Minimum deposit check
    if (amountNum < 0.1) {
      return { isValid: false, error: 'Minimum deposit is 0.1 VET' };
    }
    
    return { isValid: true, error: '' };
  };

  const validateVTHOAmount = (amount: string): { isValid: boolean; error: string } => {
    if (!amount.trim()) {
      return { isValid: true, error: '' }; // VTHO is optional
    }
    
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    
    if (amountNum < 0) {
      return { isValid: false, error: 'Amount cannot be negative' };
    }
    
    if (amountNum > 1000000) {
      return { isValid: false, error: 'Amount cannot exceed 1,000,000 VTHO' };
    }
    
    // Check if user has enough energy
    if (account && amountNum > parseFloat(account.energy)) {
      return { isValid: false, error: `Insufficient energy. You have ${parseFloat(account.energy).toFixed(2)} VTHO` };
    }
    
    return { isValid: true, error: '' };
  };

  const validateB3TRAmount = (amount: string): { isValid: boolean; error: string } => {
    if (!amount.trim()) {
      return { isValid: true, error: '' }; // B3TR is optional
    }
    
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
    
    if (amountNum < 0) {
      return { isValid: false, error: 'Amount cannot be negative' };
    }
    
    if (amountNum > 1000000) {
      return { isValid: false, error: 'Amount cannot exceed 1,000,000 B3TR' };
    }
    
    return { isValid: true, error: '' };
  };

  // Handle amount form changes
  const handleAmountFormChange = (field: string, value: string) => {
    setAmountForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    setAmountErrors(prev => ({ ...prev, [field]: '' }));
    
    // Update total value calculation
    updateTotalValue({ ...amountForm, [field]: value });
  };

  // Calculate total value in VET equivalent
  const updateTotalValue = (formData: typeof amountForm) => {
    const vetValue = parseFloat(formData.vetAmount) || 0;
    const vthoValue = (parseFloat(formData.vthoAmount) || 0) * 0.0001; // VTHO to VET conversion
    const b3trValue = (parseFloat(formData.b3trAmount) || 0) * 0.001; // B3TR to VET conversion
    
    const total = vetValue + vthoValue + b3trValue;
    setTotalValue(total.toFixed(4));
    
    // Estimate gas (rough calculation)
    const gasEstimate = Math.max(0.01, total * 0.001); // 0.1% of total, minimum 0.01 VET
    setGasEstimate(gasEstimate.toFixed(4));
  };

  // Validate entire amount form
  const validateAmountForm = (): boolean => {
    const vetValidation = validateVETAmount(amountForm.vetAmount);
    const vthoValidation = validateVTHOAmount(amountForm.vthoAmount);
    const b3trValidation = validateB3TRAmount(amountForm.b3trAmount);
    
    setAmountErrors({
      vetAmount: vetValidation.error,
      vthoAmount: vthoValidation.error,
      b3trAmount: b3trValidation.error
    });
    
    return vetValidation.isValid && vthoValidation.isValid && b3trValidation.isValid;
  };

  // Set maximum amounts
  const setMaxAmount = (field: string) => {
    if (field === 'vetAmount' && account) {
      const maxVET = Math.max(0, parseFloat(account.balance) - 0.1); // Leave 0.1 VET for gas
      setAmountForm(prev => ({ ...prev, vetAmount: maxVET.toFixed(4) }));
      updateTotalValue({ ...amountForm, vetAmount: maxVET.toFixed(4) });
    } else if (field === 'vthoAmount' && account) {
      const maxVTHO = parseFloat(account.energy);
      setAmountForm(prev => ({ ...prev, vthoAmount: maxVTHO.toFixed(4) }));
      updateTotalValue({ ...amountForm, vthoAmount: maxVTHO.toFixed(4) });
    }
  };

  // Transaction management functions
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setActiveTransaction(newTransaction);
    
    // Start polling for transaction updates
    if (newTransaction.status === 'pending') {
      startTransactionPolling(newTransaction);
    }
    
    return newTransaction;
  };

  const updateTransaction = (txid: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => 
      tx.txid === txid ? { ...tx, ...updates } : tx
    ));
    
    setActiveTransaction(prev => 
      prev?.txid === txid ? { ...prev, ...updates } : prev
    );
  };

  const startTransactionPolling = (transaction: Transaction) => {
    // Clear any existing polling
    if (transactionPolling) {
      clearInterval(transactionPolling);
    }
    
    const pollInterval = setInterval(async () => {
      if (!connex || !isTestMode) {
        try {
          // Poll transaction status from VeChain
          const receipt = await connex.thor.transaction(transaction.txid).getReceipt();
          
          if (receipt) {
            if (receipt.reverted) {
              updateTransaction(transaction.txid, {
                status: 'reverted',
                error: 'Transaction was reverted on the blockchain'
              });
              clearInterval(pollInterval);
              setTransactionPolling(null);
            } else {
              // Get transaction details
              const tx = await connex.thor.transaction(transaction.txid).get();
              if (tx) {
                updateTransaction(transaction.txid, { 
                  status: 'confirmed',
                  gasUsed: '50000', // Default gas estimate for VeChain
                  blockNumber: Date.now(), // Use timestamp as block number for now
                  confirmations: 1
                });
                clearInterval(pollInterval);
                setTransactionPolling(null);
              }
            }
          }
        } catch (error) {
          console.log('Transaction still pending...');
        }
      } else {
        // Test mode - simulate confirmation after 3 seconds
        setTimeout(() => {
          updateTransaction(transaction.txid, {
            status: 'confirmed',
            gasUsed: '50000',
            blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
            confirmations: 1
          });
          clearInterval(pollInterval);
          setTransactionPolling(null);
        }, 3000);
      }
    }, 2000); // Poll every 2 seconds
    
    setTransactionPolling(pollInterval);
  };

  const getTransactionStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'confirmed':
        return <span className="text-green-500">✅</span>;
      case 'failed':
      case 'reverted':
        return <span className="text-red-500">❌</span>;
      default:
        return <span className="text-gray-500">⏳</span>;
    }
  };

  const getTransactionTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'verification':
        return '🆔';
      case 'create_vault':
        return '🏺';
      case 'add_funds':
        return '💰';
      case 'add_beneficiary':
      case 'update_beneficiary':
        return '👥';
      case 'emergency_withdraw':
        return '🚨';
      default:
        return '📝';
    }
  };

  const formatTransactionTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Enhanced error handling state
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([]);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Error handling functions
  const analyzeError = (error: any, context: ErrorContext): ErrorInfo => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = errorMessage.toLowerCase();
    
    // Wallet-related errors
    if (errorString.includes('wallet') || errorString.includes('connect') || errorString.includes('account')) {
      return {
        type: 'wallet',
        code: 'WALLET_CONNECTION_ERROR',
        title: 'Wallet Connection Issue',
        message: 'Unable to connect to your VeChain wallet. This is required to use the Sarcophagus Protocol.',
        suggestion: 'Please ensure VeWorld is installed and unlocked, then try connecting again.',
        action: 'Connect Wallet',
        helpUrl: 'https://docs.vechain.org/use-wallet/',
        severity: 'high'
      };
    }
    
    // Network-related errors
    if (errorString.includes('network') || errorString.includes('connection') || errorString.includes('timeout')) {
      return {
        type: 'network',
        code: 'NETWORK_ERROR',
        title: 'Network Connection Issue',
        message: 'Unable to connect to the VeChain network. This may be due to network congestion or connectivity issues.',
        suggestion: 'Please check your internet connection and try again. If the problem persists, try switching networks.',
        action: 'Retry',
        severity: 'medium'
      };
    }
    
    // Contract-related errors
    if (errorString.includes('contract') || errorString.includes('function') || errorString.includes('abi')) {
      return {
        type: 'contract',
        code: 'CONTRACT_ERROR',
        title: 'Smart Contract Issue',
        message: 'There was an issue interacting with the smart contract. This may be due to contract updates or network issues.',
        suggestion: 'Please try again in a few moments. If the problem continues, contact support.',
        action: 'Retry',
        severity: 'high'
      };
    }
    
    // Gas-related errors
    if (errorString.includes('gas') || errorString.includes('insufficient') || errorString.includes('balance')) {
      return {
        type: 'user',
        code: 'INSUFFICIENT_BALANCE',
        title: 'Insufficient Balance',
        message: 'You don\'t have enough VET to complete this transaction. Gas fees are required for all blockchain operations.',
        suggestion: 'Please add more VET to your wallet to cover the transaction costs.',
        action: 'Add Funds',
        severity: 'medium'
      };
    }
    
    // Validation errors
    if (errorString.includes('validation') || errorString.includes('invalid') || errorString.includes('required')) {
      return {
        type: 'validation',
        code: 'VALIDATION_ERROR',
        title: 'Input Validation Error',
        message: 'Some information you provided is invalid or incomplete.',
        suggestion: 'Please check your inputs and ensure all required fields are filled correctly.',
        action: 'Fix Inputs',
        severity: 'low'
      };
    }
    
    // Transaction timeout
    if (errorString.includes('timeout') || errorString.includes('expired')) {
      return {
        type: 'network',
        code: 'TRANSACTION_TIMEOUT',
        title: 'Transaction Timeout',
        message: 'The transaction took too long to process and timed out.',
        suggestion: 'This usually resolves itself. Please check your transaction history to see if it was actually processed.',
        action: 'Check History',
        severity: 'medium'
      };
    }
    
    // Default error
    return {
      type: 'system',
      code: 'UNKNOWN_ERROR',
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. We\'re working to resolve this issue.',
      suggestion: 'Please try again. If the problem persists, contact our support team.',
      action: 'Contact Support',
      helpUrl: 'https://sarcophagus.org/support',
      severity: 'high'
    };
  };

  const showError = (error: any, context: ErrorContext) => {
    const errorInfo = analyzeError(error, context);
    setCurrentError(errorInfo);
    setErrorHistory(prev => [errorInfo, ...prev.slice(0, 9)]); // Keep last 10 errors
    
    // Log error for debugging
    console.error(`Error in ${context.action}/${context.step}:`, error);
    console.error('Error context:', context);
    console.error('Analyzed error info:', errorInfo);
  };

  const clearError = () => {
    setCurrentError(null);
    setShowErrorDetails(false);
  };

  const handleErrorAction = (errorInfo: ErrorInfo) => {
    switch (errorInfo.action) {
      case 'Connect Wallet':
        // Trigger wallet connection
        break;
      case 'Retry':
        // Retry the last action
        break;
      case 'Add Funds':
        setActiveTab('manage');
        break;
      case 'Fix Inputs':
        // Focus on the problematic input
        break;
      case 'Check History':
        setShowTransactionHistory(true);
        break;
      case 'Contact Support':
        window.open(errorInfo.helpUrl || 'https://sarcophagus.org/support', '_blank');
        break;
    }
    clearError();
  };

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'wallet':
        return '🔗';
      case 'network':
        return '🌐';
      case 'validation':
        return '⚠️';
      case 'contract':
        return '📄';
      case 'user':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '❌';
    }
  };

  const getErrorColor = (severity: ErrorInfo['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  useEffect(() => {
    if (account && connex) {
      loadUserData();
    }
  }, [account, connex]);

  // Cleanup transaction polling on unmount
  useEffect(() => {
    return () => {
      if (transactionPolling) {
        clearInterval(transactionPolling);
      }
    };
  }, [transactionPolling]);

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
    
    // Validate age before proceeding
    const ageValidation = validateAge(ageInput);
    if (!ageValidation.isValid) {
      setAgeError(ageValidation.error);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting user verification process...');
      console.log('Test mode:', isTestMode);
      
      const contractInteractions = new ContractInteractions(connex, isTestMode);
      
      // Generate a mock verification hash for testing
      const verificationHash = `verification-${account.address}-${Date.now()}`;
      const age = parseInt(ageInput); // Use validated age input
      
      console.log('Calling verifyUser with:', { userAddress: account.address, age, verificationHash });
      
      // Call the contract to verify user with timeout
      const txPromise = contractInteractions.verifyUser(account.address, age, verificationHash);
      const tx = await Promise.race([
        txPromise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout after 30 seconds')), 30000)
        )
      ]) as Awaited<ReturnType<typeof contractInteractions.verifyUser>>;
      
      console.log('Transaction created:', tx);
      
      // Add transaction to tracking system
      const transaction = addTransaction({
        txid: tx.txid,
        type: 'verification',
        status: 'pending',
        description: `Identity verification for age ${age}`,
        amount: '0',
        gasUsed: '0'
      });
      
      // Set transaction as pending (legacy support)
      setLastTransaction({ txid: tx.txid, status: 'pending' });
      
      // Wait for transaction confirmation with timeout
      const receiptPromise = tx.wait();
      const receipt = await Promise.race([
        receiptPromise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Transaction confirmation timeout after 60 seconds')), 60000)
        )
      ]) as Awaited<ReturnType<typeof tx.wait>>;
      
      console.log('Transaction receipt:', receipt);
      
      if (receipt.reverted) {
        updateTransaction(tx.txid, { status: 'reverted', error: 'Transaction was reverted' });
        setLastTransaction({ txid: tx.txid, status: 'failed' });
        throw new Error('Transaction reverted');
      }
      
      // Update transaction status
      updateTransaction(tx.txid, { 
        status: 'confirmed',
        gasUsed: '50000', // Default gas estimate for VeChain
        blockNumber: Date.now(), // Use timestamp as block number for now
        confirmations: 1
      });
      
      // Set transaction as successful (legacy support)
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
      
      // Use enhanced error handling
      showError(error, {
        action: 'verification',
        step: 'user_verification',
        userData: { address: account.address, age: parseInt(ageInput) }
      });
      
      // Set transaction as failed if we have a txid
      if (lastTransaction && lastTransaction.status === 'pending') {
        setLastTransaction({ txid: lastTransaction.txid, status: 'failed' });
      }
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
      
      // Add transaction to tracking system
      const transaction = addTransaction({
        txid: tx.txid,
        type: 'create_vault',
        status: 'pending',
        description: 'Create Sarcophagus vault',
        amount: '0',
        gasUsed: '0'
      });
      
      // Set transaction as pending (legacy support)
      setLastTransaction({ txid: tx.txid, status: 'pending' });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.reverted) {
        updateTransaction(tx.txid, { status: 'reverted', error: 'Transaction was reverted' });
        setLastTransaction({ txid: tx.txid, status: 'failed' });
        throw new Error('Transaction reverted');
      }
      
      // Update transaction status
      updateTransaction(tx.txid, { 
        status: 'confirmed',
        gasUsed: '50000',
        blockNumber: Date.now(),
        confirmations: 1
      });
      
      // Set transaction as successful (legacy support)
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
      
      // Use enhanced error handling
      showError(error, {
        action: 'create_vault',
        step: 'sarcophagus_creation',
        userData: { 
          address: account.address, 
          beneficiaryCount: 2,
          totalPercentage: 100
        }
      });
      
      // Set transaction as failed if we have a txid
      if (lastTransaction && lastTransaction.status === 'pending') {
        setLastTransaction({ txid: lastTransaction.txid, status: 'failed' });
      }
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
    
    // Show the amount form
    setShowAmountForm(true);
    setAmountForm({
      vetAmount: '',
      vthoAmount: '',
      b3trAmount: ''
    });
    setAmountErrors({
      vetAmount: '',
      vthoAmount: '',
      b3trAmount: ''
    });
    setGasEstimate('0');
    setTotalValue('0');
  };

  // Save Amount Handler
  const handleSaveAmount = async () => {
    if (!account || !connex || !sarcophagusData) {
      alert('Please connect your wallet and ensure you have an active vault.');
      return;
    }
    
    // Validate the form
    if (!validateAmountForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting add funds process...');
      
      // Convert amounts to wei (18 decimals)
      const vetAmountWei = BigInt(Math.floor(parseFloat(amountForm.vetAmount) * 1e18));
      const vthoAmountWei = BigInt(Math.floor(parseFloat(amountForm.vthoAmount || '0') * 1e18));
      const b3trAmountWei = BigInt(Math.floor(parseFloat(amountForm.b3trAmount || '0') * 1e18));
      
      // Add transaction to tracking system (simulated for now)
      const transaction = addTransaction({
        txid: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'add_funds',
        status: 'pending',
        description: `Add ${amountForm.vetAmount} VET to vault`,
        amount: amountForm.vetAmount,
        gasUsed: '0'
      });
      
      // Simulate transaction processing
      setTimeout(() => {
        updateTransaction(transaction.txid, { 
          status: 'confirmed',
          gasUsed: '50000',
          blockNumber: Date.now(),
          confirmations: 1
        });
      }, 2000);
      
      // Update the sarcophagus data with new funds
      const currentVETAmount = sarcophagusData?.vetAmount ? BigInt(sarcophagusData.vetAmount) : BigInt('0');
      const newVETAmount = currentVETAmount + vetAmountWei;
      
      const updatedSarcophagusData = {
        ...sarcophagusData,
        vetAmount: newVETAmount.toString()
      };
      
      setSarcophagusData(updatedSarcophagusData);
      
      // Update parent component with new sarcophagus data
      if (onUserDataUpdate) {
        onUserDataUpdate({
          isVerified: userVerification?.isVerified || false,
          hasSarcophagus: true,
          userSarcophagus: updatedSarcophagusData,
          userBeneficiaries: updatedSarcophagusData.beneficiaries,
          obolRewards: obolBalance
        });
      }
      
      // Close the form
      setShowAmountForm(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `✅ Funds added successfully! ${amountForm.vetAmount} VET added to your vault.`;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error adding funds:', error);
      
      // Use enhanced error handling
      showError(error, {
        action: 'add_funds',
        step: 'fund_deposit',
        userData: { 
          address: account.address, 
          amount: amountForm.vetAmount,
          vaultBalance: sarcophagusData.vetAmount
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel Amount Form
  const handleCancelAmountForm = () => {
    setShowAmountForm(false);
    setAmountForm({
      vetAmount: '',
      vthoAmount: '',
      b3trAmount: ''
    });
    setAmountErrors({
      vetAmount: '',
      vthoAmount: '',
      b3trAmount: ''
    });
    setGasEstimate('0');
    setTotalValue('0');
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
    
    // Show the beneficiary form
    setShowBeneficiaryForm(true);
    setEditingBeneficiaryIndex(null);
    setBeneficiaryForm({
      recipient: '',
      percentage: '',
      age: '',
      isMinor: false
    });
    setBeneficiaryErrors({
      recipient: '',
      percentage: '',
      age: ''
    });
  };

  // Save Beneficiary Handler
  const handleSaveBeneficiary = async () => {
    if (!account || !connex || !sarcophagusData) {
      alert('Please connect your wallet and ensure you have an active vault.');
      return;
    }
    
    // Validate the form
    if (!validateBeneficiaryForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting save beneficiary process...');
      
      const newBeneficiary = {
        recipient: beneficiaryForm.recipient,
        percentage: parseFloat(beneficiaryForm.percentage),
        isMinor: beneficiaryForm.isMinor,
        age: parseInt(beneficiaryForm.age)
      };
      
      let updatedBeneficiaries;
      
      if (editingBeneficiaryIndex !== null) {
        // Editing existing beneficiary
        updatedBeneficiaries = [...sarcophagusData.beneficiaries];
        updatedBeneficiaries[editingBeneficiaryIndex] = newBeneficiary;
      } else {
        // Adding new beneficiary
        updatedBeneficiaries = [...sarcophagusData.beneficiaries, newBeneficiary];
      }
      
      const updatedSarcophagusData = {
        ...sarcophagusData,
        beneficiaries: updatedBeneficiaries
      };
      
      setSarcophagusData(updatedSarcophagusData);
      
      // Update parent component
      if (onUserDataUpdate) {
        onUserDataUpdate({
          isVerified: userVerification?.isVerified || false,
          hasSarcophagus: true,
          userSarcophagus: updatedSarcophagusData,
          userBeneficiaries: updatedBeneficiaries,
          obolRewards: obolBalance
        });
      }
      
      // Close the form
      setShowBeneficiaryForm(false);
      setEditingBeneficiaryIndex(null);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = editingBeneficiaryIndex !== null 
        ? '✅ Beneficiary updated successfully!' 
        : '✅ New beneficiary added successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error saving beneficiary:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error saving beneficiary: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel Beneficiary Form
  const handleCancelBeneficiaryForm = () => {
    setShowBeneficiaryForm(false);
    setEditingBeneficiaryIndex(null);
    setBeneficiaryForm({
      recipient: '',
      percentage: '',
      age: '',
      isMinor: false
    });
    setBeneficiaryErrors({
      recipient: '',
      percentage: '',
      age: ''
    });
  };

  // Edit Beneficiary Handler
  const handleEditBeneficiary = (index: number) => {
    if (!sarcophagusData || !sarcophagusData.beneficiaries[index]) {
      alert('Beneficiary not found.');
      return;
    }
    
    const beneficiary = sarcophagusData.beneficiaries[index];
    
    // Populate the form with existing data
    setBeneficiaryForm({
      recipient: beneficiary.recipient,
      percentage: beneficiary.percentage.toString(),
      age: beneficiary.age.toString(),
      isMinor: beneficiary.isMinor
    });
    
    setEditingBeneficiaryIndex(index);
    setShowBeneficiaryForm(true);
    setBeneficiaryErrors({
      recipient: '',
      percentage: '',
      age: ''
    });
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
      {/* Enhanced Error Display */}
      {currentError && (
        <div className={`fixed top-4 right-4 max-w-md p-4 rounded-lg border shadow-lg z-50 ${getErrorColor(currentError.severity)}`}>
          <div className="flex items-start space-x-3">
            <span className="text-xl">{getErrorIcon(currentError.type)}</span>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{currentError.title}</h4>
              <p className="text-sm mb-2">{currentError.message}</p>
              <p className="text-sm font-medium mb-3">{currentError.suggestion}</p>
              
              <div className="flex items-center space-x-2">
                {currentError.action && (
                  <button
                    onClick={() => handleErrorAction(currentError)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium"
                  >
                    {currentError.action}
                  </button>
                )}
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                >
                  {showErrorDetails ? 'Hide Details' : 'Show Details'}
                </button>
                <button
                  onClick={clearError}
                  className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                >
                  Dismiss
                </button>
              </div>
              
              {showErrorDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Error Code:</strong> {currentError.code}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Severity:</strong> {currentError.severity}
                  </p>
                  {currentError.helpUrl && (
                    <a
                      href={currentError.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Get Help →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800">Vault Balance</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {sarcophagusData ? VECHAIN_UTILS.formatVET(sarcophagusData.vetAmount) : '0'} VET
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800">OBOL Rewards</h3>
                <p className="text-2xl font-bold text-green-600">
                  {VECHAIN_UTILS.formatVET(obolBalance)} OBOL
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800">Beneficiaries</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {sarcophagusData?.beneficiaries.length || 0}
                </p>
              </div>
            </div>

            {/* Transaction Status */}
            {activeTransaction && (
              <div className={`p-4 rounded-lg border ${
                activeTransaction.status === 'pending' ? 'bg-blue-50 border-blue-200' :
                activeTransaction.status === 'confirmed' ? 'bg-green-50 border-green-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTransactionStatusIcon(activeTransaction.status)}
                    <div>
                      <h4 className="font-medium text-gray-800">{activeTransaction.description}</h4>
                      <p className="text-sm text-gray-600">
                        {activeTransaction.status === 'pending' && 'Processing transaction...'}
                        {activeTransaction.status === 'confirmed' && 'Transaction confirmed!'}
                        {activeTransaction.status === 'failed' && 'Transaction failed'}
                        {activeTransaction.status === 'reverted' && 'Transaction reverted'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">TX: {activeTransaction.txid.substring(0, 10)}...</p>
                    <p className="text-xs text-gray-500">{formatTransactionTime(activeTransaction.timestamp)}</p>
                  </div>
                </div>
                {activeTransaction.status === 'confirmed' && activeTransaction.gasUsed && (
                  <div className="mt-2 text-sm text-gray-600">
                    Gas used: {activeTransaction.gasUsed} • Block: {activeTransaction.blockNumber}
                  </div>
                )}
                {activeTransaction.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {activeTransaction.error}
                  </div>
                )}
              </div>
            )}

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                  <button
                    onClick={() => setShowTransactionHistory(!showTransactionHistory)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showTransactionHistory ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {transactions.slice(0, showTransactionHistory ? transactions.length : 3).map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getTransactionTypeIcon(tx.type)}</span>
                          <div>
                            <p className="font-medium text-gray-800">{tx.description}</p>
                            <p className="text-sm text-gray-600">
                              {formatTransactionTime(tx.timestamp)}
                              {tx.amount && tx.amount !== '0' && ` • ${tx.amount} VET`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTransactionStatusIcon(tx.status)}
                          <span className={`text-sm font-medium ${
                            tx.status === 'confirmed' ? 'text-green-600' :
                            tx.status === 'pending' ? 'text-blue-600' :
                            'text-red-600'
                          }`}>
                            {tx.status === 'pending' ? 'Pending' :
                             tx.status === 'confirmed' ? 'Confirmed' :
                             tx.status === 'failed' ? 'Failed' :
                             'Reverted'}
                          </span>
                        </div>
                      </div>
                      
                      {showTransactionHistory && (
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <p>Transaction ID: {tx.txid}</p>
                          {tx.gasUsed && tx.gasUsed !== '0' && <p>Gas Used: {tx.gasUsed}</p>}
                          {tx.blockNumber && <p>Block: {tx.blockNumber}</p>}
                          {tx.confirmations && <p>Confirmations: {tx.confirmations}</p>}
                          {tx.error && <p className="text-red-500">Error: {tx.error}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {transactions.length > 3 && !showTransactionHistory && (
                  <div className="p-4 text-center">
                    <button
                      onClick={() => setShowTransactionHistory(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View all {transactions.length} transactions
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!sarcophagusData ? (
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Create Vault
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('manage')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Manage Vault
                </button>
              )}
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-800 mb-4">Complete Identity Verification</h4>
                <p className="text-sm text-blue-700 mb-4">
                  To create your digital inheritance vault, we need to verify your identity and age. 
                  This is a one-time process that ensures the security and legitimacy of your digital inheritance plan.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="age-input-create" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Age *
                    </label>
                    <input
                      id="age-input-create"
                      type="number"
                      min="18"
                      max="120"
                      value={ageInput}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      placeholder="Enter your age (18-120)"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        ageError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {ageError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {ageError}
                      </p>
                    )}
                    {!ageError && ageInput && (
                      <p className="mt-1 text-sm text-green-600 flex items-center">
                        <span className="mr-1">✅</span>
                        Age looks good!
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Privacy Notice:</strong> Your age is used solely for verification purposes 
                      and to ensure you meet the minimum age requirement (18+). This information is 
                      stored securely on the blockchain.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleUserVerification}
                    disabled={isLoading || !ageInput || !!ageError}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                      isLoading || !ageInput || !!ageError
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying Identity...
                      </span>
                    ) : (
                      'Verify Identity & Continue'
                    )}
                  </button>
                </div>
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
                
                {showAmountForm ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-800 mb-4">Add Funds to Your Vault</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Deposit VET, VTHO, and B3TR tokens into your vault. These funds will be securely stored 
                      and distributed to your beneficiaries according to your specified instructions.
                    </p>
                    
                    <div className="space-y-4">
                      {/* VET Amount */}
                      <div>
                        <label htmlFor="vet-amount" className="block text-sm font-medium text-gray-700 mb-2">
                          VET Amount *
                        </label>
                        <div className="flex space-x-2">
                          <input
                            id="vet-amount"
                            type="number"
                            min="0.1"
                            max="1000000"
                            step="0.01"
                            value={amountForm.vetAmount}
                            onChange={(e) => handleAmountFormChange('vetAmount', e.target.value)}
                            placeholder="Enter VET amount (e.g., 10.5)"
                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              amountErrors.vetAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                          />
                          <button
                            onClick={() => setMaxAmount('vetAmount')}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                            disabled={isLoading}
                          >
                            Max
                          </button>
                        </div>
                        {amountErrors.vetAmount && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {amountErrors.vetAmount}
                          </p>
                        )}
                        {!amountErrors.vetAmount && amountForm.vetAmount && (
                          <p className="mt-1 text-sm text-blue-600">
                            You'll deposit {amountForm.vetAmount} VET to your vault
                          </p>
                        )}
                      </div>
                      
                      {/* VTHO Amount */}
                      <div>
                        <label htmlFor="vtho-amount" className="block text-sm font-medium text-gray-700 mb-2">
                          VTHO Amount (Optional)
                        </label>
                        <div className="flex space-x-2">
                          <input
                            id="vtho-amount"
                            type="number"
                            min="0"
                            max="1000000"
                            step="0.01"
                            value={amountForm.vthoAmount}
                            onChange={(e) => handleAmountFormChange('vthoAmount', e.target.value)}
                            placeholder="Enter VTHO amount (e.g., 1000)"
                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              amountErrors.vthoAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                          />
                          <button
                            onClick={() => setMaxAmount('vthoAmount')}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                            disabled={isLoading}
                          >
                            Max
                          </button>
                        </div>
                        {amountErrors.vthoAmount && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {amountErrors.vthoAmount}
                          </p>
                        )}
                        {!amountErrors.vthoAmount && amountForm.vthoAmount && (
                          <p className="mt-1 text-sm text-blue-600">
                            You'll deposit {amountForm.vthoAmount} VTHO (≈ {(parseFloat(amountForm.vthoAmount) * 0.0001).toFixed(4)} VET equivalent)
                          </p>
                        )}
                      </div>
                      
                      {/* B3TR Amount */}
                      <div>
                        <label htmlFor="b3tr-amount" className="block text-sm font-medium text-gray-700 mb-2">
                          B3TR Amount (Optional)
                        </label>
                        <input
                          id="b3tr-amount"
                          type="number"
                          min="0"
                          max="1000000"
                          step="0.01"
                          value={amountForm.b3trAmount}
                          onChange={(e) => handleAmountFormChange('b3trAmount', e.target.value)}
                          placeholder="Enter B3TR amount (e.g., 500)"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            amountErrors.b3trAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                        {amountErrors.b3trAmount && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {amountErrors.b3trAmount}
                          </p>
                        )}
                        {!amountErrors.b3trAmount && amountForm.b3trAmount && (
                          <p className="mt-1 text-sm text-blue-600">
                            You'll deposit {amountForm.b3trAmount} B3TR (≈ {(parseFloat(amountForm.b3trAmount) * 0.001).toFixed(4)} VET equivalent)
                          </p>
                        )}
                      </div>
                      
                      {/* Summary */}
                      {(amountForm.vetAmount || amountForm.vthoAmount || amountForm.b3trAmount) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-medium text-green-800 mb-2">Transaction Summary</h5>
                          <div className="space-y-1 text-sm text-green-700">
                            <p><strong>Total Value:</strong> {totalValue} VET equivalent</p>
                            <p><strong>Estimated Gas:</strong> {gasEstimate} VET</p>
                            <p><strong>Current Balance:</strong> {VECHAIN_UTILS.formatVET(sarcophagusData.vetAmount)} VET</p>
                            <p><strong>New Balance:</strong> {(parseFloat(VECHAIN_UTILS.formatVET(sarcophagusData.vetAmount)) + parseFloat(amountForm.vetAmount || '0')).toFixed(4)} VET</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveAmount}
                          disabled={isLoading || !amountForm.vetAmount || !!amountErrors.vetAmount || !!amountErrors.vthoAmount || !!amountErrors.b3trAmount}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            isLoading || !amountForm.vetAmount || !!amountErrors.vetAmount || !!amountErrors.vthoAmount || !!amountErrors.b3trAmount
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding Funds...
                            </span>
                          ) : (
                            'Add Funds'
                          )}
                        </button>
                        <button
                          onClick={handleCancelAmountForm}
                          disabled={isLoading}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}
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
            
            {showBeneficiaryForm ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-800 mb-4">
                  {editingBeneficiaryIndex !== null ? 'Edit Beneficiary' : 'Add New Beneficiary'}
                </h4>
                
                <div className="space-y-4">
                  {/* Recipient Address */}
                  <div>
                    <label htmlFor="beneficiary-address" className="block text-sm font-medium text-gray-700 mb-2">
                      VeChain Address *
                    </label>
                    <input
                      id="beneficiary-address"
                      type="text"
                      value={beneficiaryForm.recipient}
                      onChange={(e) => handleBeneficiaryFormChange('recipient', e.target.value)}
                      placeholder="0x..."
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        beneficiaryErrors.recipient ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {beneficiaryErrors.recipient && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {beneficiaryErrors.recipient}
                      </p>
                    )}
                  </div>
                  
                  {/* Percentage */}
                  <div>
                    <label htmlFor="beneficiary-percentage" className="block text-sm font-medium text-gray-700 mb-2">
                      Percentage (%) *
                    </label>
                    <input
                      id="beneficiary-percentage"
                      type="number"
                      min="0.01"
                      max="100"
                      step="0.01"
                      value={beneficiaryForm.percentage}
                      onChange={(e) => handleBeneficiaryFormChange('percentage', e.target.value)}
                      placeholder="Enter percentage (e.g., 25.5)"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        beneficiaryErrors.percentage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {beneficiaryErrors.percentage && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {beneficiaryErrors.percentage}
                      </p>
                    )}
                    {!beneficiaryErrors.percentage && beneficiaryForm.percentage && (
                      <p className="mt-1 text-sm text-blue-600">
                        This beneficiary will receive {beneficiaryForm.percentage}% of your vault
                      </p>
                    )}
                  </div>
                  
                  {/* Age */}
                  <div>
                    <label htmlFor="beneficiary-age" className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      id="beneficiary-age"
                      type="number"
                      min="0"
                      max="120"
                      value={beneficiaryForm.age}
                      onChange={(e) => handleBeneficiaryFormChange('age', e.target.value)}
                      placeholder="Enter age"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        beneficiaryErrors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {beneficiaryErrors.age && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {beneficiaryErrors.age}
                      </p>
                    )}
                  </div>
                  
                  {/* Is Minor Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="beneficiary-minor"
                      type="checkbox"
                      checked={beneficiaryForm.isMinor}
                      onChange={(e) => handleBeneficiaryFormChange('isMinor', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor="beneficiary-minor" className="ml-2 block text-sm text-gray-700">
                      This beneficiary is a minor (special inheritance rules may apply)
                    </label>
                  </div>
                  
                  {/* Total Percentage Warning */}
                  {sarcophagusData && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>Current Total:</strong> {sarcophagusData.beneficiaries.reduce((sum, b, index) => {
                          if (editingBeneficiaryIndex !== null && index === editingBeneficiaryIndex) {
                            return sum; // Exclude the one being edited
                          }
                          return sum + b.percentage;
                        }, 0)}% allocated
                        {beneficiaryForm.percentage && (
                          <span> • New total: {sarcophagusData.beneficiaries.reduce((sum, b, index) => {
                            if (editingBeneficiaryIndex !== null && index === editingBeneficiaryIndex) {
                              return sum; // Exclude the one being edited
                            }
                            return sum + b.percentage;
                          }, 0) + parseFloat(beneficiaryForm.percentage || '0')}%</span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveBeneficiary}
                      disabled={isLoading || !beneficiaryForm.recipient || !beneficiaryForm.percentage || !beneficiaryForm.age}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isLoading || !beneficiaryForm.recipient || !beneficiaryForm.percentage || !beneficiaryForm.age
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        editingBeneficiaryIndex !== null ? 'Update Beneficiary' : 'Add Beneficiary'
                      )}
                    </button>
                    <button
                      onClick={handleCancelBeneficiaryForm}
                      disabled={isLoading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {sarcophagusData && sarcophagusData.beneficiaries.length > 0 ? (
                  <div className="space-y-4">
                    {sarcophagusData.beneficiaries.map((beneficiary, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{beneficiary.recipient}</p>
                            <p className="text-sm text-gray-600">
                              {beneficiary.percentage}% • Age: {beneficiary.age}
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
                    <p className="text-gray-600 mb-4">No beneficiaries configured yet.</p>
                    <button
                      onClick={handleAddNewBeneficiary}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Add Your First Beneficiary
                    </button>
                  </div>
                )}
              </>
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-800 mb-4">Complete Identity Verification</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      To create your digital inheritance vault, we need to verify your identity and age. 
                      This information helps us ensure compliance and provide appropriate services.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="age-input" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Age *
                        </label>
                        <input
                          id="age-input"
                          type="number"
                          min="18"
                          max="120"
                          value={ageInput}
                          onChange={(e) => handleAgeChange(e.target.value)}
                          placeholder="Enter your age (18-120)"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            ageError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                        {ageError && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {ageError}
                          </p>
                        )}
                        {!ageError && ageInput && (
                          <p className="mt-1 text-sm text-green-600 flex items-center">
                            <span className="mr-1">✅</span>
                            Age looks good!
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">
                          <strong>Privacy Notice:</strong> Your age is used solely for verification purposes 
                          and to ensure you meet the minimum age requirement (18+). This information is 
                          stored securely on the blockchain.
                        </p>
                      </div>
                      
                      <button
                        onClick={handleUserVerification}
                        disabled={isLoading || !ageInput || !!ageError}
                        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                          isLoading || !ageInput || !!ageError
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying Identity...
                          </span>
                        ) : (
                          'Verify Identity'
                        )}
                      </button>
                    </div>
                  </div>
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