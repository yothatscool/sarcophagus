'use client';

import { useState, useEffect } from 'react';
import { VECHAIN_UTILS } from '../config/vechain-native';

interface VeChainAccount {
  address: string;
  balance: string;
  energy: string;
}

interface VeChainConnectProps {
  onAccountUpdate?: (account: VeChainAccount | null) => void;
}

export default function VeChainConnect({ onAccountUpdate }: VeChainConnectProps) {
  const [account, setAccount] = useState<VeChainAccount | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connex, setConnex] = useState<any>(null);

  // Initialize Connex
  useEffect(() => {
    const initConnex = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const Connex = (await import('@vechain/connex')).default;
        const connexInstance = new Connex({
          node: 'https://testnet.vechain.org',
          network: 'test'
        });
        setConnex(connexInstance);
      } catch (err) {
        console.error('Failed to initialize Connex:', err);
        setError('Failed to connect to VeChain');
      }
    };

    initConnex();
  }, []);

  // Notify parent component when account changes
  useEffect(() => {
    if (onAccountUpdate) {
      onAccountUpdate(account);
    }
  }, [account, onAccountUpdate]);

  const connectWallet = async () => {
    if (!connex) {
      setError('VeChain not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let walletAccount = null;

      // Debug: Log what wallet objects are available
      console.log('Available wallet objects:', {
        veworld: typeof window !== 'undefined' ? !!(window as any).veworld : false,
        sync2: typeof window !== 'undefined' ? !!(window as any).sync2 : false,
        sync: typeof window !== 'undefined' ? !!(window as any).sync : false,
        connex: typeof window !== 'undefined' ? !!(window as any).connex : false,
        vechain: typeof window !== 'undefined' ? !!(window as any).vechain : false,
        ConnexWalletBuddy: typeof window !== 'undefined' ? !!(window as any).ConnexWalletBuddy : false
      });

      // Check for VeChain wallet (VeWorld/Sync2 via ConnexWalletBuddy)
      if (typeof window !== 'undefined' && (window as any).vechain) {
        try {
          console.log('Attempting VeChain wallet connection...');
          const vechain = (window as any).vechain;
          console.log('VeChain object:', vechain);
          
          // Try to get account using VeChain wallet API
          if (vechain.getAccount) {
            walletAccount = await vechain.getAccount();
            console.log('VeChain account found:', walletAccount);
          } else if (vechain.account) {
            walletAccount = await vechain.account();
            console.log('VeChain account found:', walletAccount);
          }
        } catch (err) {
          console.log('VeChain connection failed:', err);
        }
      }

      // Check for ConnexWalletBuddy
      if (!walletAccount && typeof window !== 'undefined' && (window as any).ConnexWalletBuddy) {
        try {
          console.log('Attempting ConnexWalletBuddy connection...');
          const buddy = (window as any).ConnexWalletBuddy;
          console.log('ConnexWalletBuddy object:', buddy);
          
          // Try to get account using ConnexWalletBuddy
          if (buddy.getAccount) {
            walletAccount = await buddy.getAccount();
            console.log('ConnexWalletBuddy account found:', walletAccount);
          }
        } catch (err) {
          console.log('ConnexWalletBuddy connection failed:', err);
        }
      }

      // Check for VeWorld wallet (legacy check)
      if (!walletAccount && typeof window !== 'undefined' && (window as any).veworld) {
        try {
          console.log('Attempting VeWorld connection...');
          const veworld = (window as any).veworld;
          console.log('VeWorld object:', veworld);
          walletAccount = await veworld.getAccount();
          console.log('VeWorld account found:', walletAccount);
        } catch (err) {
          console.log('VeWorld connection failed:', err);
        }
      }

      // Check for Sync2 wallet (legacy check)
      if (!walletAccount && typeof window !== 'undefined' && (window as any).sync2) {
        try {
          console.log('Attempting Sync2 connection...');
          const sync2 = (window as any).sync2;
          console.log('Sync2 object:', sync2);
          walletAccount = await sync2.getAccount();
          console.log('Sync2 account found:', walletAccount);
        } catch (err) {
          console.log('Sync2 connection failed:', err);
        }
      }

      // Check for VeChain Sync (older version)
      if (!walletAccount && typeof window !== 'undefined' && (window as any).sync) {
        try {
          console.log('Attempting Sync connection...');
          const sync = (window as any).sync;
          console.log('Sync object:', sync);
          walletAccount = await sync.getAccount();
          console.log('Sync account found:', walletAccount);
        } catch (err) {
          console.log('Sync connection failed:', err);
        }
      }

      // Check for Connex wallet (legacy check)
      if (!walletAccount && typeof window !== 'undefined' && (window as any).connex) {
        try {
          console.log('Attempting Connex connection...');
          const connexWallet = (window as any).connex;
          console.log('Connex object:', connexWallet);
          // Try different Connex API methods
          if (connexWallet.thor && connexWallet.thor.account) {
            walletAccount = await connexWallet.thor.account().get();
            console.log('Connex account found:', walletAccount);
          }
        } catch (err) {
          console.log('Connex connection failed:', err);
        }
      }

      if (walletAccount && walletAccount.address) {
        // Get account balance and energy
        const accountInfo = await connex.thor.account(walletAccount.address).get();
        
        setAccount({
          address: walletAccount.address,
          balance: VECHAIN_UTILS.fromWei(accountInfo.balance),
          energy: VECHAIN_UTILS.fromWei(accountInfo.energy)
        });
        setIsConnected(true);
        setError(null);
      } else {
        console.log('No wallet account found. Available objects:', {
          veworld: typeof window !== 'undefined' ? (window as any).veworld : 'N/A',
          sync2: typeof window !== 'undefined' ? (window as any).sync2 : 'N/A',
          sync: typeof window !== 'undefined' ? (window as any).sync : 'N/A',
          connex: typeof window !== 'undefined' ? (window as any).connex : 'N/A',
          vechain: typeof window !== 'undefined' ? (window as any).vechain : 'N/A',
          ConnexWalletBuddy: typeof window !== 'undefined' ? (window as any).ConnexWalletBuddy : 'N/A'
        });
        setError('No VeChain wallet found. Please install VeWorld or Sync2.');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🔗 VeChain Wallet Connection
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your VeChain wallet to interact with the Sarcophagus Protocol.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Supported Wallets:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>VeWorld</strong> - Mobile wallet with dApp browser</li>
              <li>• <strong>Sync2</strong> - Desktop wallet for VeChain</li>
            </ul>
          </div>

          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Connect VeChain Wallet'}
          </button>

          {/* Debug button for development */}
          <button
            onClick={() => {
              console.log('=== WALLET DEBUG INFO ===');
              console.log('Window object:', typeof window !== 'undefined' ? 'Available' : 'Not available');
              if (typeof window !== 'undefined') {
                console.log('VeWorld:', (window as any).veworld);
                console.log('Sync2:', (window as any).sync2);
                console.log('Sync:', (window as any).sync);
                console.log('Connex:', (window as any).connex);
                console.log('VeChain:', (window as any).vechain);
                console.log('ConnexWalletBuddy:', (window as any).ConnexWalletBuddy);
                console.log('All window properties:', Object.keys(window).filter(key => 
                  key.toLowerCase().includes('vechain') || 
                  key.toLowerCase().includes('veworld') || 
                  key.toLowerCase().includes('sync') || 
                  key.toLowerCase().includes('connex')
                ));
              }
              alert('Check browser console for wallet debug info');
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2"
          >
            Debug Wallet Detection
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Connected to VeChain</h3>
                <p className="text-green-600 text-sm">
                  Address: {shortenAddress(account!.address)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-800 font-semibold">
                  {parseFloat(account!.balance).toFixed(2)} VET
                </p>
                <p className="text-green-800 font-semibold">
                  {parseFloat(account!.energy).toFixed(2)} Energy
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">VET Balance</p>
              <p className="font-semibold text-gray-800">
                {parseFloat(account!.balance).toFixed(4)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Energy</p>
              <p className="font-semibold text-gray-800">
                {parseFloat(account!.energy).toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={disconnectWallet}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
} 