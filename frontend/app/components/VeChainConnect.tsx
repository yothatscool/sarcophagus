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
          console.log('VeChain methods:', Object.keys(vechain));
          
          // VeChain Testnet configuration
          const testnetConfig = {
            node: 'https://testnet.vechain.org',
            network: 'test',
            genesisId: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a'
          };
          
          // Try to get account using VeWorld API methods
          if (vechain.newConnexVendor) {
            console.log('Using vechain.newConnexVendor method...');
            try {
              const vendor = vechain.newConnexVendor(testnetConfig);
              console.log('ConnexVendor created:', vendor);
              console.log('Vendor methods:', vendor ? Object.keys(vendor) : 'No vendor');
              
              // Try to get account info
              if (vendor && vendor.account) {
                console.log('Calling vendor.account()...');
                const account = await vendor.account();
                console.log('Account from vendor:', account);
                if (account && account.address) {
                  walletAccount = { address: account.address };
                  console.log('VeChain account found via vendor:', walletAccount);
                }
              } else if (vendor && vendor.request) {
                console.log('Trying vendor.request...');
                const result = await vendor.request({ method: 'vechain_accounts' });
                console.log('Vendor request result:', result);
                if (result && result.length > 0) {
                  walletAccount = { address: result[0] };
                  console.log('VeChain account found via vendor request:', walletAccount);
                }
              }
            } catch (vendorErr) {
              console.log('Vendor method failed:', vendorErr);
            }
          }
          
          // Fallback to newConnex method
          if (!walletAccount && vechain.newConnex) {
            console.log('Using vechain.newConnex method...');
            try {
              const connex = vechain.newConnex(testnetConfig);
              console.log('Connex created:', connex);
              console.log('Connex methods:', connex ? Object.keys(connex) : 'No connex');
              
              // Try to get account info
              if (connex && connex.thor && connex.thor.account) {
                console.log('Calling connex.thor.account().get()...');
                const account = await connex.thor.account().get();
                console.log('Account from connex:', account);
                if (account && account.address) {
                  walletAccount = { address: account.address };
                  console.log('VeChain account found via connex:', walletAccount);
                }
              }
            } catch (connexErr) {
              console.log('Connex method failed:', connexErr);
            }
          }
          
          // Try newConnexSigner method
          if (!walletAccount && vechain.newConnexSigner) {
            console.log('Using vechain.newConnexSigner method...');
            try {
              const signer = vechain.newConnexSigner(testnetConfig);
              console.log('ConnexSigner created:', signer);
              console.log('Signer methods:', signer ? Object.keys(signer) : 'No signer');
              
              if (signer && signer.account) {
                console.log('Calling signer.account()...');
                const account = await signer.account();
                console.log('Account from signer:', account);
                if (account && account.address) {
                  walletAccount = { address: account.address };
                  console.log('VeChain account found via signer:', walletAccount);
                }
              }
            } catch (signerErr) {
              console.log('Signer method failed:', signerErr);
            }
          }
          
          // Fallback to request method (but with VeWorld-specific methods)
          if (!walletAccount && vechain.request) {
            console.log('Using vechain.request method with VeWorld methods...');
            try {
              // Try VeWorld-specific methods instead of eth_accounts
              const result = await vechain.request({ method: 'vechain_accounts' });
              console.log('VeChain request result (vechain_accounts):', result);
              
              if (result && result.length > 0) {
                walletAccount = { address: result[0] };
                console.log('VeChain account found via request:', walletAccount);
              }
            } catch (requestErr) {
              console.log('Request method failed:', requestErr);
            }
          }
          
          // If still no account, try to get it from the wallet directly
          if (!walletAccount) {
            console.log('Trying to access wallet account directly...');
            try {
              // Check if there's a way to get the current account
              if (vechain.isVeWorld) {
                console.log('This is VeWorld wallet, trying alternative methods...');
                // Try to see if we can get account info from the wallet state
                console.log('VeWorld wallet state:', vechain);
              }
            } catch (directErr) {
              console.log('Direct access failed:', directErr);
            }
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
          console.log('ConnexWalletBuddy methods:', Object.keys(buddy));
          
          // Try to get account using ConnexWalletBuddy
          if (buddy.create) {
            console.log('Using ConnexWalletBuddy.create method...');
            try {
              // Create ConnexWalletBuddy with testnet configuration
              const connex = buddy.create({
                node: 'https://testnet.vechain.org',
                network: 'test'
              });
              console.log('ConnexWalletBuddy connex created:', connex);
              console.log('ConnexWalletBuddy methods:', connex ? Object.keys(connex) : 'No connex');
              
              if (connex && connex.thor && connex.thor.account) {
                const account = await connex.thor.account().get();
                console.log('Account from ConnexWalletBuddy:', account);
                if (account && account.address) {
                  walletAccount = { address: account.address };
                  console.log('ConnexWalletBuddy account found:', walletAccount);
                }
              } else if (connex && connex.account) {
                const account = await connex.account();
                console.log('Account from ConnexWalletBuddy:', account);
                if (account && account.address) {
                  walletAccount = { address: account.address };
                  console.log('ConnexWalletBuddy account found:', walletAccount);
                }
              }
            } catch (createErr) {
              console.log('ConnexWalletBuddy create failed:', createErr);
            }
          } else if (buddy.getAccount) {
            walletAccount = await buddy.getAccount();
            console.log('ConnexWalletBuddy account found:', walletAccount);
          } else if (buddy.request) {
            console.log('Using ConnexWalletBuddy.request method...');
            const result = await buddy.request({ method: 'eth_accounts' });
            console.log('ConnexWalletBuddy request result:', result);
            
            if (result && result.length > 0) {
              walletAccount = { address: result[0] };
              console.log('ConnexWalletBuddy account found via request:', walletAccount);
            }
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
                
                if ((window as any).vechain) {
                  console.log('VeChain methods:', Object.keys((window as any).vechain));
                }
                if ((window as any).ConnexWalletBuddy) {
                  console.log('ConnexWalletBuddy methods:', Object.keys((window as any).ConnexWalletBuddy));
                }
                
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

          {/* Test wallet connection button */}
          <button
            onClick={async () => {
              console.log('=== TESTING WALLET CONNECTION ===');
              if (typeof window !== 'undefined' && (window as any).vechain) {
                const vechain = (window as any).vechain;
                console.log('Testing VeChain wallet methods...');
                
                try {
                  // Test 1: Try to create a vendor
                  if (vechain.newConnexVendor) {
                    console.log('Test 1: Creating vendor...');
                    const vendor = vechain.newConnexVendor();
                    console.log('Vendor created:', vendor);
                    if (vendor) {
                      console.log('Vendor methods:', Object.keys(vendor));
                    }
                  }
                  
                  // Test 2: Try to create a connex
                  if (vechain.newConnex) {
                    console.log('Test 2: Creating connex...');
                    const connex = vechain.newConnex();
                    console.log('Connex created:', connex);
                    if (connex) {
                      console.log('Connex methods:', Object.keys(connex));
                    }
                  }
                  
                  // Test 3: Try to create a signer
                  if (vechain.newConnexSigner) {
                    console.log('Test 3: Creating signer...');
                    const signer = vechain.newConnexSigner();
                    console.log('Signer created:', signer);
                    if (signer) {
                      console.log('Signer methods:', Object.keys(signer));
                    }
                  }
                  
                } catch (err) {
                  console.log('Test failed:', err);
                }
              }
              alert('Check browser console for wallet connection test results');
            }}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2"
          >
            Test Wallet Connection
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