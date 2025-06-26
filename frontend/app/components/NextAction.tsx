'use client'

import React from 'react'
// import { useWallet } from '../contexts/WalletContext'

interface NextActionProps {
  isUserVerified: boolean
  hasSarcophagus: boolean
  userSarcophagus: any
}

export default function NextAction({ 
  isUserVerified, 
  hasSarcophagus, 
  userSarcophagus 
}: NextActionProps) {
  // const { account } = useWallet()

  const getNextAction = () => {
    if (!isUserVerified) {
      return {
        title: 'Complete Onboarding',
        description: 'Verify your identity and calculate life expectancy to get started',
        action: 'Start Onboarding',
        color: 'bg-purple-600 hover:bg-purple-700',
        icon: '📋'
      }
    }
    
    if (!hasSarcophagus) {
      return {
        title: 'Create Your Sarcophagus',
        description: 'Set up your digital inheritance vault with beneficiaries',
        action: 'Create Vault',
        color: 'bg-green-600 hover:bg-green-700',
        icon: '⚰️'
      }
    }

    if (userSarcophagus?.isDeceased) {
      return {
        title: 'Claim Inheritance',
        description: 'The original owner has passed. You can now claim your inheritance',
        action: 'Claim Now',
        color: 'bg-yellow-600 hover:bg-yellow-700',
        icon: '💰'
      }
    }

    return {
      title: 'Manage Your Vault',
      description: 'Add funds, update beneficiaries, or check your rewards',
      action: 'Manage Vault',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: '🔧'
    }
  }

  const action = getNextAction()

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{action.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{action.title}</h3>
            <p className="text-gray-300 mb-4">{action.description}</p>
            <button className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${action.color}`}>
              {action.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 