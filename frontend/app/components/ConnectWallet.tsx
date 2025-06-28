"use client";
import React, { useState } from "react";

export default function ConnectWallet() {
  const [error, setError] = useState('')

  const connectWallet = async () => {
    try {
      setError('')
      
      let accounts = null
      
      // Try VeWorld wallet
      if (typeof window !== 'undefined' && (window as any).veworld) {
        try {
          const veworld = (window as any).veworld
          const account = await veworld.getAccount()
          if (account) {
            accounts = [account]
          }
        } catch (e) {
          console.log('VeWorld connection failed:', e)
        }
      }
      
      // Try VeChain Connex
      if (!accounts && typeof window !== 'undefined' && (window as any).connex) {
        try {
          const connex = (window as any).connex
          const account = await connex.thor.account().get()
          if (account) {
            accounts = [account]
          }
        } catch (e) {
          console.log('Connex connection failed:', e)
        }
      }
      
      // Try VeChain Sync
      if (!accounts && typeof window !== 'undefined' && (window as any).sync) {
        try {
          const sync = (window as any).sync
          const account = await sync.getAccount()
          if (account) {
            accounts = [account]
          }
        } catch (e) {
          console.log('Sync connection failed:', e)
        }
      }

      if (accounts && accounts.length > 0) {
        // For now, just show success - in a real app you'd update the wallet context
        alert('Wallet connected successfully! Account: ' + accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4))
      } else {
        setError('Please install VeWorld wallet to connect.')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setError('Failed to connect wallet. Please try again.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">⚰️</span>
      </div>
      <h2 className="text-3xl font-bold mb-4">Welcome to Sarcophagus Protocol</h2>
      <p className="text-xl text-gray-400 mb-8">
        Secure your digital legacy with the most advanced inheritance protocol
      </p>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 max-w-md">
          {error}
        </div>
      )}
      
      <button 
        onClick={connectWallet}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
} 