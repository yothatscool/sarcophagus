'use client'

import React from 'react'
import { WalletButton } from '@vechain/dapp-kit-react';

export default function Header() {
  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">⚰️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sarcophagus Protocol
              </h1>
              <p className="text-sm text-gray-400">Secure Digital Inheritance on VeChain</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  )
} 