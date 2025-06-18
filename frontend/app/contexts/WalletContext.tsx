'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleNet } from '@vechain/connex-driver';
import { useNotification } from './NotificationContext';

interface WalletContextType {
  connex: Framework | null;
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connex, setConnex] = useState<Framework | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { showNotification } = useNotification();

  const initConnex = async () => {
    try {
      const net = new SimpleNet('https://testnet.veblocks.net');
      const driver = await Driver.connect(net);
      const connexInstance = new Framework(driver);
      setConnex(connexInstance);
    } catch (error) {
      console.error('Failed to initialize Connex:', error);
      showNotification('Failed to connect to VeChain network', 'error');
    }
  };

  const connect = async () => {
    if (!connex) {
      throw new Error('Connex not initialized');
    }

    try {
      const certificateResponse = await connex.vendor.sign('cert', {
        purpose: 'identification',
        payload: {
          type: 'text',
          content: 'Please sign this message to connect to Vereavement Protocol'
        }
      });

      setAddress(certificateResponse.annex.signer);
      setIsConnected(true);
      showNotification('Wallet connected successfully', 'success');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showNotification('Failed to connect wallet', 'error');
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    showNotification('Wallet disconnected', 'info');
  };

  useEffect(() => {
    initConnex();
    
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch(console.error);
    }

    // Handle account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connex,
        address,
        isConnected,
        connect,
        disconnect
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 