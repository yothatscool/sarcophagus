'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import DAppKitProvider with no SSR to avoid Connex issues
const DAppKitProvider = dynamic(
  () => import('@vechain/dapp-kit-react').then(mod => ({ default: mod.DAppKitProvider })),
  { ssr: false }
);

// Re-export the necessary hooks - these will be used client-side only
export { useWallet, useWalletModal } from '@vechain/dapp-kit-react';

// This is the main provider that will wrap our application
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <DAppKitProvider
      nodeUrl="https://testnet.vechain.org/"
      genesis="test"
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