'use client';

import { DAppKitProvider } from '@vechain/dapp-kit-react';
import { ReactNode } from 'react';

// Re-export the necessary hooks so the rest of the app can use them
export { useWallet, useWalletModal } from '@vechain/dapp-kit-react';

// This is the main provider that will wrap our application
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <DAppKitProvider
      node="https://testnet.vechain.org/"
      usePersistence
      walletConnectOptions={{
        projectId: 'a1472a0dff98ffc1f834887119efdf65',
        metadata: {
          name: 'Sarcophagus Protocol',
          description: 'A decentralized protocol for preserving digital legacies',
          url: 'http://localhost:3000',
          icons: ['http://localhost:3000/logo.png'],
        },
      }}
      logLevel="DEBUG"
    >
      {children}
    </DAppKitProvider>
  );
} 