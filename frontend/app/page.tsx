'use client'

import { useState, useEffect } from 'react'
import VeChainConnect from './components/VeChainConnect'
import SarcophagusDashboard from './components/SarcophagusDashboard'
import Header from './components/Header'
import QuickStats from './components/QuickStats'
import RecentActivity from './components/RecentActivity'

export default function Home() {
  const [connex, setConnex] = useState<any>(null)
  const [account, setAccount] = useState<any>(null)
  const [userData, setUserData] = useState({
    isVerified: false,
    hasSarcophagus: false,
    userSarcophagus: null,
    userBeneficiaries: []
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const initConnex = async () => {
      try {
        const Connex = (await import('@vechain/connex')).default
        const connexInstance = new Connex({
          node: 'https://testnet.vechain.org',
          network: 'test'
        })
        setConnex(connexInstance)
      } catch (err) {
        console.error('Failed to initialize Connex:', err)
      }
    }

    initConnex()
  }, [isClient])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏺 Sarcophagus Protocol
          </h1>
          <p className="text-xl text-gray-600">
            Digital Inheritance on VeChain - Secure your legacy with blockchain technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet Connection */}
          <div className="lg:col-span-1">
            <VeChainConnect />
          </div>

          {/* Right Column - Sarcophagus Dashboard */}
          <div className="lg:col-span-2">
            <SarcophagusDashboard 
              account={account}
              connex={connex}
            />
          </div>
        </div>

        {/* Stats and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <QuickStats 
            isUserVerified={userData.isVerified}
            hasSarcophagus={userData.hasSarcophagus}
            userSarcophagus={userData.userSarcophagus}
            userBeneficiaries={userData.userBeneficiaries}
          />
          <RecentActivity />
        </div>

        {/* VeChain Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            🌐 Built for VeChain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-700">Native Integration</h3>
              <p className="text-blue-600">Built specifically for VeChain using Connex framework</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700">Energy Efficient</h3>
              <p className="text-blue-600">Leverages VeChain's dual-token model (VET + Energy)</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700">Secure & Fast</h3>
              <p className="text-blue-600">Powered by VeChain's Proof of Authority consensus</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 