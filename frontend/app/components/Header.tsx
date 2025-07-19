'use client'

import React from 'react'

export default function Header() {
  return (
    <header className="bg-background-card/95 border-b border-accent-gold/30 py-4 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img 
              src="/logo.png" 
              alt="Sarcophagus Protocol" 
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-heading font-bold text-text-primary m-0">Sarcophagus Protocol</h1>
              <p className="text-sm text-accent-gold font-body m-0">Digital Inheritance Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-vechain-green/20 border border-vechain-green/30 rounded-lg">
              <div className="w-2 h-2 bg-vechain-green rounded-full"></div>
              <span className="text-xs text-vechain-green font-medium">VeChain Testnet</span>
            </div>
            

          </div>
        </div>
      </div>
    </header>
  )
} 