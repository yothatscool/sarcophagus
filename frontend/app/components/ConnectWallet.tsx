"use client";
import React from "react";
import { WalletButton } from '@vechain/dapp-kit-react';

export default function ConnectWallet() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">⚰️</span>
      </div>
      <h2 className="text-3xl font-bold mb-4">Welcome to Sarcophagus Protocol</h2>
      <p className="text-xl text-gray-400 mb-8">
        Secure your digital legacy with the most advanced inheritance protocol on VeChain
      </p>
      <WalletButton />
    </div>
  );
} 