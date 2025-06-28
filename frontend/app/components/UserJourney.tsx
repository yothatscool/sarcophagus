'use client'

import React from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'
import ConnectWallet from './ConnectWallet'
import Dashboard from './Dashboard'

export default function UserJourney() {
  const { account } = useWallet()
  const isConnected = !!account
  const { isUserVerified, hasSarcophagus, userSarcophagus } = useSarcophagusContract()

  // Determine user's current journey stage
  const getUserStage = () => {
    if (!isConnected) return 'unconnected'
    if (!isUserVerified) return 'connected'
    if (!hasSarcophagus) return 'verified'
    if (userSarcophagus?.isDeceased) return 'beneficiary'
    return 'active'
  }

  const currentStage = getUserStage()

  // For active users, show the dashboard
  if (currentStage === 'active') {
    return <Dashboard />
  }

  // For verified users without vault, show a message to complete onboarding
  if (currentStage === 'verified') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-yellow-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Identity Verified!</h2>
        <p className="text-xl text-gray-400 mb-8 text-center max-w-2xl">
          Your identity has been verified. You need to complete the onboarding process to create your vault.
        </p>
        <p className="text-gray-500 text-center">
          The onboarding modal should appear automatically or you can refresh the page.
        </p>
      </div>
    )
  }

  // For connected but not verified users, show verification message
  if (currentStage === 'connected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">🔐</span>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Wallet Connected!</h2>
        <p className="text-xl text-gray-400 mb-8 text-center max-w-2xl">
          Your wallet is connected. You need to verify your identity and complete onboarding to create your vault.
        </p>
        <p className="text-gray-500 text-center">
          The onboarding modal should appear automatically or you can refresh the page.
        </p>
      </div>
    )
  }

  // For beneficiaries, show inheritance claim
  if (currentStage === 'beneficiary') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">💔</span>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Inheritance Available</h2>
        <p className="text-xl text-gray-400 mb-8 text-center max-w-2xl">
          You have an inheritance available to claim from a deceased vault owner.
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Claim Inheritance
        </button>
      </div>
    )
  }

  // Default: show connect wallet
  return <ConnectWallet />
} 