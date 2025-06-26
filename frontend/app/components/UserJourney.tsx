'use client'

import React from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'
import ConnectWallet from './ConnectWallet'
import UserOnboarding from './UserOnboarding'
import CreateSarcophagus from './CreateSarcophagus'
import ManageVault from './ManageVault'
import ClaimInheritance from './ClaimInheritance'
import Dashboard from './Dashboard'

export default function UserJourney() {
  const { isConnected, account } = useWallet()
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

  // For active users, show the dashboard instead of modals
  if (currentStage === 'active') {
    return <Dashboard />
  }

  const renderStage = () => {
    switch (currentStage) {
      case 'unconnected':
        return <ConnectWallet />
      case 'connected':
        return <UserOnboarding />
      case 'verified':
        return <CreateSarcophagus />
      case 'beneficiary':
        return <ClaimInheritance />
      default:
        return <ConnectWallet />
    }
  }

  return (
    <div className="user-journey">
      {renderStage()}
    </div>
  )
} 