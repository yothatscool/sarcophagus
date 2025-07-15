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
      <div className="min-h-screen bg-gradient-to-br from-primary-blue to-accent-blueDark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto"></div>
          <p className="mt-4 text-accent-gold font-medium">Loading Sarcophagus Protocol...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue to-accent-blueDark temple-texture">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4 font-serif">
              The Sarcophagus Protocol
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Revolutionary digital inheritance platform on VeChain that combines 
              <span className="text-accent-gold font-semibold"> secure asset inheritance </span>
              with 
              <span className="text-accent-gold font-semibold"> environmental impact rewards</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="card-gold px-6 py-3">
                <span className="text-accent-gold font-semibold">Multi-Sig Security</span>
              </div>
              <div className="card-gold px-6 py-3">
                <span className="text-accent-gold font-semibold">Environmental Rewards</span>
              </div>
              <div className="card-gold px-6 py-3">
                <span className="text-accent-gold font-semibold">NFT Inheritance</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet Connection */}
          <div className="lg:col-span-1">
            <div className="card-hover p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 text-accent-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                Connect Wallet
              </h2>
              <VeChainConnect onAccountUpdate={handleAccountUpdate} />
            </div>
          </div>

          {/* Right Column - Sarcophagus Dashboard */}
          <div className="lg:col-span-2">
            <div className="card-hover p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 text-accent-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                Inheritance Dashboard
              </h2>
              <SarcophagusDashboard 
                account={account}
                connex={connex}
                onUserDataUpdate={handleUserDataUpdate}
              />
            </div>
          </div>
        </div>

        {/* Stats and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="card-hover p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-accent-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
              </svg>
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
          <div className="card-hover p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-accent-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              Recent Activity
            </h2>
            <RecentActivity userData={userData} />
          </div>
        </div>

        {/* VeChain Integration Info */}
        <div className="mt-8 card-gold p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 text-accent-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
            </svg>
            Built for VeChain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-vechain-green/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-vechain-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-semibold text-accent-gold">Native Integration</h3>
              <p className="text-gray-300">Built specifically for VeChain using Connex framework</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-vechain-green/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-vechain-green" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-accent-gold">Energy Efficient</h3>
              <p className="text-gray-300">Leverages VeChain's dual-token model (VET + Energy)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-vechain-green/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-vechain-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-semibold text-accent-gold">Secure & Fast</h3>
              <p className="text-gray-300">Powered by VeChain's Proof of Authority consensus</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 