'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useNotification } from '../contexts/NotificationContext'
import { useLoading } from '../contexts/LoadingContext'

interface OBOLTokenomics {
  totalSupply: string;
  initialSupply: string;
  rewardSupply: string;
  rewardRate: string;
  remainingRewards: string;
  vestingProgress: number;
  circulatingSupply: string;
  marketCap: string;
}

interface UserOBOLData {
  balance: string;
  totalEarned: string;
  totalLocked: string;
  availableToLock: string;
  vestingAmount: string;
  vestingProgress: number;
}

export default function OBOLTokenPage() {
  const { isConnected, address } = useWallet()
  const { showNotification } = useNotification()
  const { isLoading } = useLoading()
  const [obolTokenomics, setObolTokenomics] = useState<OBOLTokenomics | null>(null)
  const [userOBOLData, setUserOBOLData] = useState<UserOBOLData | null>(null)
  const [lockAmount, setLockAmount] = useState('')
  const [selectedVault, setSelectedVault] = useState('')

  useEffect(() => {
    loadOBOLData()
  }, [isConnected, address])

  const loadOBOLData = async () => {
    try {
      // Mock data for demo - in production this would come from smart contracts
      setObolTokenomics({
        totalSupply: '1,000,000,000',
        initialSupply: '50,000,000',
        rewardSupply: '950,000,000',
        rewardRate: '10 OBOL per 1 VET-equivalent',
        remainingRewards: '847,500,000',
        vestingProgress: 25,
        circulatingSupply: '152,500,000',
        marketCap: '$1,525,000'
      })

      if (isConnected && address) {
        setUserOBOLData({
          balance: '1,250',
          totalEarned: '2,500',
          totalLocked: '750',
          availableToLock: '500',
          vestingAmount: '12,500',
          vestingProgress: 15
        })
      }
    } catch (error) {
      console.error('Error loading OBOL data:', error)
    }
  }

  const handleLockTokens = async () => {
    if (!lockAmount || !selectedVault) {
      showNotification('Please enter amount and select vault', 'warning')
      return
    }

    try {
      // Mock transaction - in production this would call the smart contract
      showNotification('Locking OBOL tokens...', 'info')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate transaction
      showNotification('OBOL tokens locked successfully!', 'success')
      setLockAmount('')
      loadOBOLData() // Refresh data
    } catch (error) {
      console.error('Error locking tokens:', error)
      showNotification('Failed to lock tokens', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-sarcophagus-950">
      {/* Navigation */}
      <nav className="bg-sarcophagus-900/90 backdrop-blur-sm border-b border-sarcophagus-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-2xl font-bold text-sarcophagus-100">Sarcophagus Protocol</a>
            <a 
              href="/obol-token" 
              className="text-accent-gold px-4 py-2 bg-sarcophagus-800/50 rounded-lg border border-sarcophagus-600"
            >
              $OBOL Token
            </a>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <span className="text-sarcophagus-300 text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            ) : (
              <span className="text-sarcophagus-400 text-sm">Not Connected</span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-5xl font-bold text-sarcophagus-100 mb-4">
            $OBOL Token
          </h1>
          <p className="text-xl text-sarcophagus-300 mb-8 max-w-3xl mx-auto">
            The reward token of the Sarcophagus Protocol. Earn $OBOL through our hybrid system: 
            instant bonuses on deposits + continuous rewards over time. Lock tokens to include them in your digital legacy.
          </p>
          
          {obolTokenomics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
                <div className="text-3xl font-bold text-accent-gold">{obolTokenomics.totalSupply}</div>
                <div className="text-sarcophagus-400">Total Supply</div>
              </div>
              <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-400">{obolTokenomics.circulatingSupply}</div>
                <div className="text-sarcophagus-400">Circulating Supply</div>
              </div>
              <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-400">{obolTokenomics.marketCap}</div>
                <div className="text-sarcophagus-400">Market Cap</div>
              </div>
              <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
                <div className="text-3xl font-bold text-accent-gold">730%</div>
                <div className="text-sarcophagus-400">Max APY</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tokenomics Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hybrid Earning System */}
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-sarcophagus-100 mb-6">Hybrid Earning System</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Initial Bonus */}
                <div className="bg-sarcophagus-700/50 border border-sarcophagus-600 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">🎁</div>
                    <h4 className="text-sarcophagus-100 font-semibold">Initial Deposit Bonus</h4>
                  </div>
                  <div className="text-4xl font-bold text-accent-gold mb-2">10:1</div>
                  <div className="text-sarcophagus-400 text-sm mb-3">$OBOL per VET-equivalent deposited</div>
                  <div className="text-sarcophagus-300 text-sm">
                    Get rewarded instantly when you first deposit into your vault
                  </div>
                </div>
                
                {/* Continuous Rewards */}
                <div className="bg-sarcophagus-700/50 border border-sarcophagus-600 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">⚡</div>
                    <h4 className="text-sarcophagus-100 font-semibold">Continuous Rewards</h4>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sarcophagus-400 text-sm">Regular Rate:</span>
                      <span className="text-green-400 font-semibold">1% daily (365% APY)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sarcophagus-400 text-sm">Long-term Bonus:</span>
                      <span className="text-accent-gold font-semibold">2% daily (730% APY)</span>
                    </div>
                  </div>
                  <div className="text-sarcophagus-300 text-sm">
                    Earn continuously based on locked value × time
                  </div>
                </div>
              </div>
            </div>

            {/* Tokenomics Chart */}
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-sarcophagus-100 mb-6">Tokenomics Distribution</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-accent-gold rounded"></div>
                    <span className="text-sarcophagus-300">Initial Supply (Vested)</span>
                  </div>
                  <span className="text-sarcophagus-100 font-semibold">5%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span className="text-sarcophagus-300">Reward Supply</span>
                  </div>
                  <span className="text-sarcophagus-100 font-semibold">95%</span>
                </div>
                
                <div className="w-full bg-sarcophagus-700 rounded-full h-3 mt-4">
                  <div className="bg-accent-gold h-3 rounded-full" style={{ width: '5%' }}></div>
                  <div className="bg-green-400 h-3 rounded-full -mt-3" style={{ width: '95%', marginLeft: '5%' }}></div>
                </div>
              </div>
            </div>

            {/* Earning Example */}
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-sarcophagus-100 mb-6">Earning Example: 100 VET-Equivalent Locked</h3>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                <b>OBOL rewards are earned on the total VET-equivalent value of all locked tokens (VET, VTHO, B3TR, OBOL).</b><br />
                <b>Conversion rates:</b> 1 VET = 1 VET, 1 VTHO = 0.0001 VET, 1 B3TR = 0.001 VET, 1 OBOL = 0.01 VET.<br />
                <b>Hard Cap:</b> Maximum 1,500 OBOL in unclaimed rewards. Claim regularly to continue earning!
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline */}
                <div>
                  <h4 className="text-sarcophagus-100 font-semibold mb-4">Reward Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-accent-gold font-bold text-sm">1</span>
                      </div>
                      <div>
                        <div className="text-sarcophagus-100 font-medium">Day 1</div>
                        <div className="text-sarcophagus-400 text-sm">+1,000 $OBOL (initial bonus)</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <div className="text-sarcophagus-100 font-medium">Day 2</div>
                        <div className="text-sarcophagus-400 text-sm">+1 $OBOL (1% daily rate)</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 font-bold text-sm">30</span>
                      </div>
                      <div>
                        <div className="text-sarcophagus-100 font-medium">Day 30</div>
                        <div className="text-sarcophagus-400 text-sm">+30 $OBOL (30 days of rewards)</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-accent-gold font-bold text-sm">365</span>
                      </div>
                      <div>
                        <div className="text-sarcophagus-100 font-medium">Day 365</div>
                        <div className="text-sarcophagus-400 text-sm">+2 $OBOL (bonus rate kicks in!)</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-accent-gold font-bold text-sm">366</span>
                      </div>
                      <div>
                        <div className="text-sarcophagus-100 font-medium">Day 366+</div>
                        <div className="text-sarcophagus-400 text-sm">+2 $OBOL daily (continued bonus)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Totals */}
                <div>
                  <h4 className="text-sarcophagus-100 font-semibold mb-4">Total Earnings</h4>
                  <div className="space-y-4">
                    <div className="bg-sarcophagus-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent-gold">1,000</div>
                      <div className="text-sarcophagus-400 text-sm">Initial Bonus (Day 1)</div>
                    </div>
                    <div className="bg-sarcophagus-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">364</div>
                      <div className="text-sarcophagus-400 text-sm">Regular Rewards (Days 2-365)</div>
                    </div>
                    <div className="bg-sarcophagus-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent-gold">730</div>
                      <div className="text-sarcophagus-400 text-sm">Bonus Rewards (Days 366-730)</div>
                    </div>
                    <div className="bg-accent-gold/20 border border-accent-gold/30 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent-gold">2,094</div>
                      <div className="text-sarcophagus-400 text-sm">Total $OBOL in 2 Years</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vesting Schedule */}
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-sarcophagus-100 mb-6">Vesting Schedule</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sarcophagus-300">Vesting Progress</span>
                  <span className="text-accent-gold font-semibold">{obolTokenomics?.vestingProgress}%</span>
                </div>
                
                <div className="w-full bg-sarcophagus-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-accent-gold to-accent-bronze h-2 rounded-full transition-all duration-300"
                    style={{ width: `${obolTokenomics?.vestingProgress || 0}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-sarcophagus-700/50 rounded-lg p-4">
                    <div className="text-sarcophagus-400 text-sm">Vesting Duration</div>
                    <div className="text-sarcophagus-100 font-semibold">365 days</div>
                  </div>
                  <div className="bg-sarcophagus-700/50 rounded-lg p-4">
                    <div className="text-sarcophagus-400 text-sm">Cliff Period</div>
                    <div className="text-sarcophagus-100 font-semibold">30 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="space-y-6">
            {/* User Stats */}
            {userOBOLData && (
              <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Your $OBOL Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sarcophagus-400">Balance</span>
                    <span className="text-accent-gold font-semibold">{userOBOLData.balance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sarcophagus-400">Total Earned</span>
                    <span className="text-green-400 font-semibold">{userOBOLData.totalEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sarcophagus-400">Total Locked</span>
                    <span className="text-blue-400 font-semibold">{userOBOLData.totalLocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sarcophagus-400">Available to Lock</span>
                    <span className="text-accent-gold font-semibold">{userOBOLData.availableToLock}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Lock Tokens */}
            {isConnected && userOBOLData && (
              <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Lock $OBOL Tokens</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                      Amount to Lock
                    </label>
                    <input
                      type="number"
                      value={lockAmount}
                      onChange={(e) => setLockAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-sarcophagus-800 border border-sarcophagus-600 rounded-lg px-4 py-2 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:border-accent-gold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                      Select Vault
                    </label>
                    <select
                      value={selectedVault}
                      onChange={(e) => setSelectedVault(e.target.value)}
                      className="w-full bg-sarcophagus-800 border border-sarcophagus-600 rounded-lg px-4 py-2 text-sarcophagus-100 focus:outline-none focus:border-accent-gold"
                    >
                      <option value="">Select a vault...</option>
                      <option value="vault1">Vault #1</option>
                      <option value="vault2">Vault #2</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleLockTokens}
                    disabled={!lockAmount || !selectedVault || isLoading.lockObol}
                    className="w-full bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading.lockObol ? 'Locking...' : 'Lock Tokens'}
                  </button>
                </div>
              </div>
            )}

            {/* Connect Wallet */}
            {!isConnected && (
              <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Connect Wallet</h3>
                <p className="text-sarcophagus-400 mb-4">
                  Connect your wallet to view your $OBOL stats and lock tokens
                </p>
                <a
                  href="/"
                  className="inline-block bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </a>
              </div>
            )}

            {/* Token Info */}
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Token Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-sarcophagus-400">Contract Address</span>
                  <span className="text-sarcophagus-300 font-mono">0x...OBOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sarcophagus-400">Network</span>
                  <span className="text-sarcophagus-300">VeChain</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sarcophagus-400">Decimals</span>
                  <span className="text-sarcophagus-300">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sarcophagus-400">Standard</span>
                  <span className="text-sarcophagus-300">VIP-180</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 