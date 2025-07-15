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
        color: 'bg-gradient-to-r from-accent-gold to-accent-goldMedium text-primary-blue font-semibold',
        icon: '📋'
      }
    }
    
    if (!hasSarcophagus) {
      return {
        title: 'Create Your Sarcophagus',
        description: 'Set up your digital inheritance vault with beneficiaries',
        action: 'Create Vault',
        color: 'bg-vechain-green hover:bg-vechain-greenDark text-white font-semibold',
        icon: '⚰️'
      }
    }

    if (userSarcophagus?.isDeceased) {
      return {
        title: 'Claim Inheritance',
        description: 'The original owner has passed. You can now claim your inheritance',
        action: 'Claim Now',
        color: 'bg-gradient-to-r from-accent-gold to-accent-goldMedium text-primary-blue font-semibold',
        icon: '💰'
      }
    }

    return {
      title: 'Manage Your Vault',
      description: 'Add funds, update beneficiaries, or check your rewards',
      action: 'Manage Vault',
      color: 'bg-primary-blue hover:bg-primary-blueDark text-accent-gold font-semibold',
      icon: '🔧'
    }
  }

  const action = getNextAction()

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary-blue/30 to-sarcophagus-800/30 border border-accent-gold/40 rounded-xl p-6 backdrop-blur-sm shadow-sarcophagus">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{action.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2 font-serif">{action.title}</h3>
            <p className="text-gray-300 mb-4 font-sans">{action.description}</p>
            <button className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-gold hover:shadow-goldDark ${action.color}`}>
              {action.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 