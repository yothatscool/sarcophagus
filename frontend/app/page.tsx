'use client'

import { useState, useEffect } from 'react'
import VeChainConnect from './components/VeChainConnect'
import SarcophagusDashboard from './components/SarcophagusDashboard'
import Header from './components/Header'
import QuickStats from './components/QuickStats'
import RecentActivity from './components/RecentActivity'

interface VeChainAccount {
  address: string;
  balance: string;
  energy: string;
}

interface UserData {
  isVerified: boolean;
  hasSarcophagus: boolean;
  userSarcophagus: any;
  userBeneficiaries: any[];
  obolRewards: string;
}

export default function Home() {
  const [account, setAccount] = useState<VeChainAccount | null>(null)
  const [connex, setConnex] = useState<any>(null)
  const [userData, setUserData] = useState<UserData>({
    isVerified: false,
    hasSarcophagus: false,
    userSarcophagus: null,
    userBeneficiaries: [],
    obolRewards: '0'
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle account updates from VeChainConnect
  const handleAccountUpdate = (newAccount: VeChainAccount | null, newConnex?: any) => {
    setAccount(newAccount)
    setConnex(newConnex)
  }

  // Handle user data updates from SarcophagusDashboard
  const handleUserDataUpdate = (newUserData: Partial<UserData>) => {
    setUserData(prev => ({
      ...prev,
      ...newUserData
    }))
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-blueDark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto"></div>
          <p className="mt-4 text-accent-gold font-medium">Loading Sarcophagus Protocol...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-blueDark">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-accent-gold mb-4 font-serif">
              The Sarcophagus Protocol
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed">
              Revolutionary digital inheritance platform on VeChain that combines secure{' '}
              <span className="text-accent-gold font-semibold">asset inheritance</span> with{' '}
              <span className="text-accent-gold font-semibold">environmental impact rewards</span>.
            </p>
            
            {/* Feature Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button className="px-6 py-3 bg-background-card border border-accent-gold/30 text-accent-gold rounded-lg hover:bg-primary-blueLight transition-all duration-300 shadow-sarcophagus hover:shadow-gold">
                Multi-Sig Security
              </button>
              <button className="px-6 py-3 bg-background-card border border-accent-gold/30 text-accent-gold rounded-lg hover:bg-primary-blueLight transition-all duration-300 shadow-sarcophagus hover:shadow-gold">
                Environmental Rewards
              </button>
              <button className="px-6 py-3 bg-background-card border border-accent-gold/30 text-accent-gold rounded-lg hover:bg-primary-blueLight transition-all duration-300 shadow-sarcophagus hover:shadow-gold">
                NFT Inheritance
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Connect Wallet Panel */}
          <div className="bg-background-card backdrop-blur-sm border border-accent-gold/30 rounded-lg shadow-sarcophagus p-6">
            <h2 className="text-xl font-semibold text-accent-gold mb-4 flex items-center font-heading">
              Connect Wallet
            </h2>
            <VeChainConnect onAccountUpdate={handleAccountUpdate} />
          </div>

          {/* Inheritance Dashboard Panel */}
          <div className="bg-background-card backdrop-blur-sm border border-accent-gold/30 rounded-lg shadow-sarcophagus p-6">
            <h2 className="text-xl font-semibold text-accent-gold mb-4 flex items-center font-heading">
              Inheritance Dashboard
            </h2>
            {account ? (
              <SarcophagusDashboard 
                account={account} 
                connex={connex}
                onUserDataUpdate={handleUserDataUpdate}
              />
            ) : (
              <div className="bg-background-card backdrop-blur-sm border border-accent-gold/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-accent-gold mb-2 font-heading">Sarcophagus Dashboard</h3>
                <p className="text-text-secondary">Please connect your VeChain wallet to access the dashboard.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Stats Panel */}
          <div className="bg-background-card backdrop-blur-sm border border-accent-gold/30 rounded-lg shadow-sarcophagus p-6">
            <h2 className="text-xl font-semibold text-accent-gold mb-4 flex items-center font-heading">
              Quick Stats
            </h2>
            <QuickStats 
              isUserVerified={userData.isVerified}
              hasSarcophagus={userData.hasSarcophagus}
              userSarcophagus={userData.userSarcophagus}
              userBeneficiaries={userData.userBeneficiaries}
              obolRewards={userData.obolRewards}
            />
          </div>

          {/* Recent Activity Panel */}
          <div className="bg-background-card backdrop-blur-sm border border-accent-gold/30 rounded-lg shadow-sarcophagus p-6">
            <h2 className="text-xl font-semibold text-accent-gold mb-4 flex items-center font-heading">
              Recent Activity
            </h2>
            <RecentActivity />
          </div>
        </div>

        {/* Built for VeChain Section */}
        <div className="bg-background-card backdrop-blur-sm border border-accent-gold/30 rounded-lg shadow-sarcophagus p-8 text-center">
          <h2 className="text-2xl font-bold text-accent-gold mb-8 font-heading">Built for VeChain</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-vechain-green/20 border border-vechain-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-vechain-green rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-accent-gold mb-2 font-heading">Native Integration</h3>
              <p className="text-text-secondary">Built specifically for VeChain's energy-efficient blockchain</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-vechain-green/20 border border-vechain-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-vechain-green rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-accent-gold mb-2 font-heading">Energy Efficient</h3>
              <p className="text-text-secondary">Low-cost transactions with VeChain's dual-token model</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-vechain-green/20 border border-vechain-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-vechain-green rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-accent-gold mb-2 font-heading">Secure & Fast</h3>
              <p className="text-text-secondary">Enterprise-grade security with lightning-fast confirmations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 