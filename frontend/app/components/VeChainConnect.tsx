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
          node: 'https://mainnet.vechain.org', // Use mainnet since VeWorld is connected to mainnet
          network: 'main'
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

      // Check for ConnexWalletBuddy first (seems to work better)
      if (typeof window !== 'undefined' && (window as any).ConnexWalletBuddy) {
        try {
          console.log('Attempting ConnexWalletBuddy connection first...');
          const buddy = (window as any).ConnexWalletBuddy;
          console.log('ConnexWalletBuddy object:', buddy);
          console.log('ConnexWalletBuddy methods:', Object.keys(buddy));
          
          if (buddy.create) {
            console.log('Using ConnexWalletBuddy.create method...');
            try {
              // Use mainnet configuration to match VeWorld
              const buddyConnex = buddy.create({
                node: 'https://mainnet.vechain.org',
                network: 'main',
                genesisId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127'
              });
              console.log('ConnexWalletBuddy connex created:', buddyConnex);
              
              if (buddyConnex && buddyConnex.signCert) {
                console.log('Using ConnexWalletBuddy signCert...');
                try {
                  const cert = await buddyConnex.signCert({
                    purpose: 'identification',
                    payload: {
                      type: 'text',
                      content: 'Requesting account access for VeChain connection'
                    }
                  });
                  
                  console.log('ConnexWalletBuddy certificate result:', cert);
                  console.log('Certificate full object:', JSON.stringify(cert, null, 2));
                  
                  if (cert && cert.annex && cert.annex.signer) {
                    console.log('Found signer in ConnexWalletBuddy cert:', cert.annex.signer);
                    walletAccount = { address: cert.annex.signer };
                  } else if (cert && cert.signer) {
                    console.log('Found signer directly in ConnexWalletBuddy cert:', cert.signer);
                    walletAccount = { address: cert.signer };
                  } else if (cert && cert.origin) {
                    console.log('Found signer in ConnexWalletBuddy cert origin:', cert.origin);
                    walletAccount = { address: cert.origin };
                  }
                } catch (certError) {
                  console.log('ConnexWalletBuddy certificate signing failed:', (certError as Error).message);
                }
              }
            } catch (createErr) {
              console.log('ConnexWalletBuddy create failed:', createErr);
            }
          }
        } catch (err) {
          console.log('ConnexWalletBuddy connection failed:', err);
        }
      }

      // Check for VeChain wallet (VeWorld/Sync2) as fallback
      if (!walletAccount && typeof window !== 'undefined' && (window as any).vechain) {
        try {
          console.log('Attempting VeChain wallet connection...');
          const vechain = (window as any).vechain;
          console.log('VeChain object:', vechain);
          console.log('VeChain methods:', Object.keys(vechain));
          
          // Step 1: Try to trigger VeWorld extension directly with request
          console.log('Trying to trigger VeWorld extension with direct request...');
          
          try {
            // Try different request methods to trigger the extension
            const requestMethods = [
              'eth_requestAccounts',
              'eth_accounts',
              'vechain_accounts',
              'accounts',
              'getAccounts'
            ];
            
            for (const method of requestMethods) {
              try {
                console.log(`Trying vechain.request with method: ${method}`);
                const result = await vechain.request({ method });
                console.log(`Request result for ${method}:`, result);
                
                if (result && Array.isArray(result) && result.length > 0) {
                  console.log(`Found account with ${method}:`, result[0]);
                  walletAccount = { address: result[0] };
                  break;
                }
              } catch (requestError) {
                console.log(`Request failed for ${method}:`, (requestError as Error).message);
              }
            }
          } catch (directRequestError) {
            console.log('Direct request failed:', (directRequestError as Error).message);
          }
          
          // Step 2: If direct request didn't work, try creating Connex instance
          if (!walletAccount) {
            console.log('Direct request failed, trying Connex instance...');
            
            // Use the correct genesisId that matches what VeWorld is using (mainnet)
            const mainnetConfig = {
              node: 'https://mainnet.vechain.org',
              network: 'main',
              genesisId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127'
            };
            
            // Create Connex instance
            console.log('Creating Connex instance...');
            const connexInstance = vechain.newConnex(mainnetConfig);
            console.log('Connex instance created:', connexInstance);
            
            // Try to get account through vendor request
            if (connexInstance.vendor && connexInstance.vendor.request) {
              try {
                console.log('Trying vendor.request to get account...');
                const result = await connexInstance.vendor.request({ method: 'eth_requestAccounts' });
                console.log('Vendor request result:', result);
                
                if (result && Array.isArray(result) && result.length > 0) {
                  console.log('Found account through vendor request:', result[0]);
                  walletAccount = { address: result[0] };
                }
              } catch (vendorRequestError) {
                console.log('Vendor request failed:', (vendorRequestError as Error).message);
              }
            }
            
            // Step 3: If vendor request didn't work, try certificate signing with proper parameters
            if (!walletAccount) {
              try {
                console.log('Trying certificate signing with proper parameters...');
                
                // Try to get a dummy address first to use in certificate signing
                const dummyAddress = '0x0000000000000000000000000000000000000000';
                
                const certService = await connexInstance.vendor.sign('cert', {
                  purpose: 'identification',
                  payload: {
                    type: 'text',
                    content: 'Requesting account access for VeChain connection'
                  }
                });
                
                console.log('Certificate service obtained:', certService);
                
                if (certService && typeof certService.signer === 'function') {
                  console.log('Calling certificate signer with dummy address...');
                  const signedCert = await certService.signer(dummyAddress);
                  console.log('Certificate signed:', signedCert);
                  
                  // Try to extract signer address from certificate
                  if (signedCert && signedCert.annex && signedCert.annex.signer) {
                    console.log('Found signer in certificate annex:', signedCert.annex.signer);
                    walletAccount = { address: signedCert.annex.signer };
                  } else if (signedCert && signedCert.signer) {
                    console.log('Found signer directly in certificate:', signedCert.signer);
                    walletAccount = { address: signedCert.signer };
                  } else if (signedCert && signedCert.origin) {
                    console.log('Found signer in certificate origin:', signedCert.origin);
                    walletAccount = { address: signedCert.origin };
                  }
                }
              } catch (certError) {
                console.log('Certificate signing failed:', (certError as Error).message);
              }
            }
          }
          
        } catch (err) {
          console.log('VeChain connection failed:', err);
        }
      }

      // Check for legacy wallet objects as final fallback
      if (!walletAccount && typeof window !== 'undefined' && (window as any).veworld) {
        try {
          console.log('Attempting VeWorld legacy connection...');
          const veworld = (window as any).veworld;
          console.log('VeWorld object:', veworld);
          walletAccount = await veworld.getAccount();
          console.log('VeWorld account found:', walletAccount);
        } catch (err) {
          console.log('VeWorld connection failed:', err);
        }
      }

      if (typeof window !== 'undefined' && (window as any).sync2) {
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

      if (walletAccount && walletAccount.address) {
        // Get account balance and energy
        try {
          const accountInfo = await connex.thor.account(walletAccount.address).get();
          
          setAccount({
            address: walletAccount.address,
            balance: VECHAIN_UTILS.fromWei(accountInfo.balance),
            energy: VECHAIN_UTILS.fromWei(accountInfo.energy)
          });
          setIsConnected(true);
          setError(null);
        } catch (balanceError) {
          console.log('Failed to get account balance:', balanceError);
          // Still set the account even if we can't get balance
          setAccount({
            address: walletAccount.address,
            balance: '0',
            energy: '0'
          });
          setIsConnected(true);
          setError(null);
        }
      } else {
        // Check if we're still waiting for the account change event
        console.log('No wallet account found yet. Available objects:', {
          veworld: typeof window !== 'undefined' ? (window as any).veworld : 'N/A',
          sync2: typeof window !== 'undefined' ? (window as any).sync2 : 'N/A',
          sync: typeof window !== 'undefined' ? (window as any).sync : 'N/A',
          connex: typeof window !== 'undefined' ? (window as any).connex : 'N/A',
          vechain: typeof window !== 'undefined' ? (window as any).vechain : 'N/A',
          ConnexWalletBuddy: typeof window !== 'undefined' ? (window as any).ConnexWalletBuddy : 'N/A'
        });
        
        // If we have VeChain available, the connection might still be in progress
        if (typeof window !== 'undefined' && (window as any).vechain) {
          setError('Connection in progress... Please check your VeWorld wallet and sign the request if prompted.');
        } else {
          setError('No VeChain wallet found. Please install VeWorld or Sync2.');
        }
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