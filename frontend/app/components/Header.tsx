'use client'

import React from 'react'

export default function Header() {
  return (
    <header className="bg-primary-blue/95 backdrop-blur-sm border-b border-accent-gold/30 shadow-sarcophagus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {/* Actual Logo */}
            <img 
              src="/logo.png" 
              alt="Sarcophagus Protocol" 
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white font-serif">Sarcophagus Protocol</h1>
              <p className="text-sm text-accent-gold font-sans">Digital Inheritance Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-vechain-green/20 border border-vechain-green/30 rounded-lg">
              <div className="w-2 h-2 bg-vechain-green rounded-full animate-pulse"></div>
              <span className="text-sm text-vechain-green font-medium font-sans">VeChain Testnet</span>
            </div>
            
            {/* Connect Wallet Button */}
            <button className="px-4 py-2 bg-gradient-to-r from-accent-gold to-accent-goldMedium hover:from-accent-goldMedium hover:to-accent-goldDark text-primary-blue font-semibold rounded-lg transition-all duration-300 shadow-gold hover:shadow-goldDark">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 