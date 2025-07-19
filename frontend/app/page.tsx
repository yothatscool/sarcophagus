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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-blue to-primary-blueDark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-5 text-accent-gold font-body text-lg">Loading Sarcophagus Protocol...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-blueDark">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-accent-gold mb-6">
            The Sarcophagus Protocol
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary font-body mb-8 max-w-4xl mx-auto leading-relaxed">
            Revolutionary digital inheritance platform on VeChain that combines secure{' '}
            <span className="text-accent-gold font-semibold">asset inheritance</span> with{' '}
            <span className="text-accent-gold font-semibold">environmental impact rewards</span>.
          </p>
          
          {/* Feature Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-accent-gold hover:bg-accent-goldMedium text-primary-blue font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-gold">
              Multi-Sig Security
            </button>
            <button className="bg-accent-gold hover:bg-accent-goldMedium text-primary-blue font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-gold">
              Environmental Rewards
            </button>
            <button className="bg-accent-gold hover:bg-accent-goldMedium text-primary-blue font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-gold">
              NFT Inheritance
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Connect Wallet Panel */}
          <div className="bg-background-card border border-accent-gold rounded-xl p-6 shadow-sarcophagus">
            <h2 className="text-2xl font-heading font-semibold text-accent-gold mb-6">Connect Wallet</h2>
            <VeChainConnect onAccountUpdate={handleAccountUpdate} />
          </div>

          {/* Inheritance Dashboard Panel */}
          <div className="bg-background-card border border-accent-gold rounded-xl p-6 shadow-sarcophagus">
            <h2 className="text-2xl font-heading font-semibold text-accent-gold mb-6">Inheritance Dashboard</h2>
            {account ? (
              <SarcophagusDashboard 
                account={account} 
                connex={connex}
                onUserDataUpdate={handleUserDataUpdate}
              />
            ) : (
              <div className="text-center py-8">
                <h3 className="text-xl font-heading font-semibold text-accent-gold mb-4">Sarcophagus Dashboard</h3>
                <p className="text-text-secondary font-body">Please connect your VeChain wallet to access the dashboard.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Quick Stats Panel */}
          <div className="bg-background-card border border-accent-gold rounded-xl p-6 shadow-sarcophagus">
            <h2 className="text-2xl font-heading font-semibold text-accent-gold mb-6">Quick Stats</h2>
            <QuickStats 
              isUserVerified={userData.isVerified}
              hasSarcophagus={userData.hasSarcophagus}
              userSarcophagus={userData.userSarcophagus}
              userBeneficiaries={userData.userBeneficiaries}
              obolRewards={userData.obolRewards}
            />
          </div>

          {/* Recent Activity Panel */}
          <div className="bg-background-card border border-accent-gold rounded-xl p-6 shadow-sarcophagus">
            <h2 className="text-2xl font-heading font-semibold text-accent-gold mb-6">Recent Activity</h2>
            <RecentActivity />
          </div>
        </div>

        {/* Built for VeChain Section */}
        <div className="bg-background-card border border-accent-gold rounded-xl p-8 text-center shadow-sarcophagus">
          <h2 className="text-4xl font-heading font-bold text-accent-gold mb-12">Built for VeChain</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-vechain-green/20 border border-vechain-green/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-vechain-green rounded-full"></div>
              </div>
              <h3 className="text-xl font-heading font-semibold text-accent-gold mb-4">Native Integration</h3>
              <p className="text-text-secondary font-body">Built specifically for VeChain's energy-efficient blockchain</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-vechain-green/20 border border-vechain-green/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-vechain-green rounded-full"></div>
              </div>
              <h3 className="text-xl font-heading font-semibold text-accent-gold mb-4">Energy Efficient</h3>
              <p className="text-text-secondary font-body">Low-cost transactions with VeChain's dual-token model</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-vechain-green/20 border border-vechain-green/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-vechain-green rounded-full"></div>
              </div>
              <h3 className="text-xl font-heading font-semibold text-accent-gold mb-4">Secure & Fast</h3>
              <p className="text-text-secondary font-body">Enterprise-grade security with lightning-fast confirmations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 