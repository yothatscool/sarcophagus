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
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: '50px', height: '50px', border: '3px solid #d4af37', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
          <p style={{marginTop: '20px', color: '#d4af37'}}>Loading Sarcophagus Protocol...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      
      <main className="container">
        {/* Hero Section */}
        <div className="hero">
          <h1>The Sarcophagus Protocol</h1>
          <p>
            Revolutionary digital inheritance platform on VeChain that combines secure{' '}
            <span style={{color: '#d4af37', fontWeight: 'bold'}}>asset inheritance</span> with{' '}
            <span style={{color: '#d4af37', fontWeight: 'bold'}}>environmental impact rewards</span>.
          </p>
          
          {/* Feature Buttons */}
          <div>
            <button className="button">Multi-Sig Security</button>
            <button className="button">Environmental Rewards</button>
            <button className="button">NFT Inheritance</button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid">
          {/* Connect Wallet Panel */}
          <div className="card">
            <h2>Connect Wallet</h2>
            <VeChainConnect onAccountUpdate={handleAccountUpdate} />
          </div>

          {/* Inheritance Dashboard Panel */}
          <div className="card">
            <h2>Inheritance Dashboard</h2>
            {account ? (
              <SarcophagusDashboard 
                account={account} 
                connex={connex}
                onUserDataUpdate={handleUserDataUpdate}
              />
            ) : (
              <div className="card" style={{textAlign: 'center'}}>
                <h3 style={{color: '#d4af37', marginBottom: '10px'}}>Sarcophagus Dashboard</h3>
                <p style={{color: '#e9ecef'}}>Please connect your VeChain wallet to access the dashboard.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Activity Grid */}
        <div className="grid">
          {/* Quick Stats Panel */}
          <div className="card">
            <h2>Quick Stats</h2>
            <QuickStats 
              isUserVerified={userData.isVerified}
              hasSarcophagus={userData.hasSarcophagus}
              userSarcophagus={userData.userSarcophagus}
              userBeneficiaries={userData.userBeneficiaries}
              obolRewards={userData.obolRewards}
            />
          </div>

          {/* Recent Activity Panel */}
          <div className="card">
            <h2>Recent Activity</h2>
            <RecentActivity />
          </div>
        </div>

        {/* Built for VeChain Section */}
        <div className="card" style={{textAlign: 'center'}}>
          <h2 style={{fontSize: '2rem', marginBottom: '30px'}}>Built for VeChain</h2>
          <div className="grid">
            <div style={{textAlign: 'center'}}>
              <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(0, 180, 180, 0.2)', border: '1px solid rgba(0, 180, 180, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
                <div style={{width: '30px', height: '30px', backgroundColor: '#00b4b4', borderRadius: '50%'}}></div>
              </div>
              <h3 style={{color: '#d4af37', marginBottom: '10px'}}>Native Integration</h3>
              <p style={{color: '#e9ecef'}}>Built specifically for VeChain's energy-efficient blockchain</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(0, 180, 180, 0.2)', border: '1px solid rgba(0, 180, 180, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
                <div style={{width: '30px', height: '30px', backgroundColor: '#00b4b4', borderRadius: '50%'}}></div>
              </div>
              <h3 style={{color: '#d4af37', marginBottom: '10px'}}>Energy Efficient</h3>
              <p style={{color: '#e9ecef'}}>Low-cost transactions with VeChain's dual-token model</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(0, 180, 180, 0.2)', border: '1px solid rgba(0, 180, 180, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
                <div style={{width: '30px', height: '30px', backgroundColor: '#00b4b4', borderRadius: '50%'}}></div>
              </div>
              <h3 style={{color: '#d4af37', marginBottom: '10px'}}>Secure & Fast</h3>
              <p style={{color: '#e9ecef'}}>Enterprise-grade security with lightning-fast confirmations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 