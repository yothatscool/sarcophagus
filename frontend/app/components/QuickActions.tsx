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
        color: 'bg-purple-600 hover:bg-purple-700',
        action: () => console.log('Start onboarding')
      })
    }

    if (isUserVerified && !hasSarcophagus) {
      actions.push({
        title: 'Create Vault',
        description: 'Set up inheritance vault',
        icon: '⚰️',
        color: 'bg-green-600 hover:bg-green-700',
        action: () => console.log('Create vault')
      })
    }

    if (hasSarcophagus) {
      actions.push({
        title: 'Add Funds',
        description: 'Deposit VET, VTHO, B3TR',
        icon: '💰',
        color: 'bg-blue-600 hover:bg-blue-700',
        action: () => console.log('Add funds')
      })

      actions.push({
        title: 'Manage Beneficiaries',
        description: 'Update beneficiary list',
        icon: '👥',
        color: 'bg-indigo-600 hover:bg-indigo-700',
        action: () => console.log('Manage beneficiaries')
      })

      if (userSarcophagus?.obolRewards && Number(userSarcophagus.obolRewards) > 0) {
        actions.push({
          title: 'Claim Rewards',
          description: 'Claim OBOL rewards',
          icon: '⭐',
          color: 'bg-yellow-600 hover:bg-yellow-700',
          action: claimObolRewards
        })
      }
    }

    return actions
  }

  const actions = getQuickActions()

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} rounded-lg p-4 text-left transition-colors`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{action.icon}</div>
              <div>
                <p className="font-medium text-white">{action.title}</p>
                <p className="text-sm text-gray-200">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
} 