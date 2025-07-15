'use client'

import React from 'react'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'

interface QuickActionsProps {
  isUserVerified: boolean
  hasSarcophagus: boolean
  userSarcophagus: any
}

export default function QuickActions({ 
  isUserVerified, 
  hasSarcophagus, 
  userSarcophagus 
}: QuickActionsProps) {
  const { claimObolRewards } = useSarcophagusContract()

  const getQuickActions = () => {
    const actions = []

    if (!isUserVerified) {
      actions.push({
        title: 'Start Onboarding',
        description: 'Verify your identity',
        icon: '📋',
        color: 'bg-accent-gold hover:bg-accent-goldDark text-primary-blue',
        action: () => console.log('Start onboarding')
      })
    }

    if (isUserVerified && !hasSarcophagus) {
      actions.push({
        title: 'Create Vault',
        description: 'Set up inheritance vault',
        icon: '⚰️',
        color: 'bg-vechain-green hover:bg-vechain-greenDark text-white',
        action: () => console.log('Create vault')
      })
    }

    if (hasSarcophagus) {
      actions.push({
        title: 'Add Funds',
        description: 'Deposit VET, VTHO, B3TR',
        icon: '💰',
        color: 'bg-primary-blue hover:bg-primary-blueDark text-accent-gold',
        action: () => console.log('Add funds')
      })

      actions.push({
        title: 'Manage Beneficiaries',
        description: 'Update beneficiary list',
        icon: '👥',
        color: 'bg-sarcophagus-700 hover:bg-sarcophagus-600 text-accent-gold',
        action: () => console.log('Manage beneficiaries')
      })

      if (userSarcophagus?.obolRewards && Number(userSarcophagus.obolRewards) > 0) {
        actions.push({
          title: 'Claim Rewards',
          description: 'Claim OBOL rewards',
          icon: '⭐',
          color: 'bg-accent-gold hover:bg-accent-goldDark text-primary-blue',
          action: claimObolRewards
        })
      }
    }

    return actions
  }

  const actions = getQuickActions()

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} rounded-xl p-4 text-left transition-all duration-300 font-medium shadow-sarcophagus hover:shadow-gold`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{action.icon}</div>
              <div>
                <p className="font-semibold">{action.title}</p>
                <p className="text-sm opacity-80">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
} 