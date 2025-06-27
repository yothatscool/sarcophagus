'use client'

import { useState } from 'react'
import VaultManagementModal from './components/VaultManagementModal'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState('')
  const [step, setStep] = useState('connect') // connect, onboard, vault, dashboard
  const [error, setError] = useState('')
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState([{ address: '', percentage: 50 }])
  const [vaultData, setVaultData] = useState({
    age: '',
    lifeExpectancy: 85,
    healthStatus: 'good',
    occupation: '',
    location: '',
    emergencyContact: '',
    legalDocuments: false,
    carbonOffset: true
  })
  const [vaultCreated, setVaultCreated] = useState(false)
  
  // Vault management modal state
  const [showVaultModal, setShowVaultModal] = useState(false)
  const [vaultModalTab, setVaultModalTab] = useState<'deposit' | 'obol' | 'b3tr' | 'beneficiaries' | 'info' | 'nfts' | 'convert'>('deposit')

  const connectWallet = async () => {
    try {
      setError('')
      
      let accounts = null
      
      // Debug: log what's available
      console.log('Available wallet objects:', {
        veworld: typeof window !== 'undefined' ? !!(window as any).veworld : false,
        vechain: typeof window !== 'undefined' ? !!(window as any).vechain : false,
        connex: typeof window !== 'undefined' ? !!(window as any).connex : false,
        sync: typeof window !== 'undefined' ? !!(window as any).sync : false,
        ethereum: typeof window !== 'undefined' ? !!(window as any).ethereum : false
      })
      
      // Try VeWorld wallet - check multiple possible object names
      if (typeof window !== 'undefined') {
        const veworld = (window as any).veworld || (window as any).VeWorld || (window as any).veworldWallet
        if (veworld) {
          try {
            console.log('Trying VeWorld connection...')
            // Try different methods VeWorld might use
            let account = null
            if (typeof veworld.getAccount === 'function') {
              account = await veworld.getAccount()
            } else if (typeof veworld.request === 'function') {
              account = await veworld.request({ method: 'eth_requestAccounts' })
              account = account && account[0]
            } else if (typeof veworld.connect === 'function') {
              account = await veworld.connect()
            }
            
            if (account) {
              accounts = [account]
              console.log('VeWorld connected successfully:', account)
            }
          } catch (e) {
            console.log('VeWorld connection failed:', e)
          }
        }
      }
      
      // Try VeChain wallet (VeWorld exposes this)
      if (!accounts && typeof window !== 'undefined' && (window as any).vechain) {
        try {
          console.log('Trying VeChain connection...')
          const vechain = (window as any).vechain
          let account = null
          
          // Try different methods VeChain might use
          if (typeof vechain.getAccount === 'function') {
            account = await vechain.getAccount()
          } else if (typeof vechain.request === 'function') {
            account = await vechain.request({ method: 'eth_requestAccounts' })
            account = account && account[0]
          } else if (typeof vechain.connect === 'function') {
            account = await vechain.connect()
          } else if (typeof vechain.thor === 'object' && vechain.thor.account) {
            account = await vechain.thor.account().get()
          }
          
          if (account) {
            accounts = [account]
            console.log('VeChain connected successfully:', account)
          }
        } catch (e) {
          console.log('VeChain connection failed:', e)
        }
      }
      
      // Try VeChain Connex
      if (!accounts && typeof window !== 'undefined' && (window as any).connex) {
        try {
          console.log('Trying Connex connection...')
          const connex = (window as any).connex
          const account = await connex.thor.account().get()
          if (account) {
            accounts = [account]
            console.log('Connex connected successfully:', account)
          }
        } catch (e) {
          console.log('Connex connection failed:', e)
        }
      }
      
      // Try VeChain Sync
      if (!accounts && typeof window !== 'undefined' && (window as any).sync) {
        try {
          console.log('Trying Sync connection...')
          const sync = (window as any).sync
          const account = await sync.getAccount()
          if (account) {
            accounts = [account]
            console.log('Sync connected successfully:', account)
          }
        } catch (e) {
          console.log('Sync connection failed:', e)
        }
      }

      // Try standard ethereum provider (VeWorld might expose this)
      if (!accounts && typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          console.log('Trying ethereum provider...')
          accounts = await (window as any).ethereum.request({ 
            method: 'eth_requestAccounts' 
          })
          console.log('Ethereum provider connected:', accounts)
        } catch (e) {
          console.log('Ethereum provider failed:', e)
        }
      }

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        setStep('onboard')
      } else {
        console.log('No wallet found. Available objects:', Object.keys(window || {}).filter(key => 
          key.toLowerCase().includes('wallet') || 
          key.toLowerCase().includes('ve') || 
          key.toLowerCase().includes('eth')
        ))
        setError('Please install VeWorld wallet to connect.')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setError('Failed to connect wallet. Please try again.')
    }
  }

  const completeOnboarding = () => {
    setShowOnboarding(true)
    setOnboardingStep(1)
  }

  const nextOnboardingStep = () => {
    if (onboardingStep < 6) {
      setOnboardingStep(onboardingStep + 1)
    }
  }

  const prevOnboardingStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { address: '', percentage: 0 }])
  }

  const removeBeneficiary = (index: number) => {
    if (beneficiaries.length > 1) {
      setBeneficiaries(beneficiaries.filter((_, i) => i !== index))
    }
  }

  const updateBeneficiary = (index: number, field: 'address' | 'percentage', value: string) => {
    const newBeneficiaries = [...beneficiaries]
    if (field === 'percentage') {
      newBeneficiaries[index].percentage = parseInt(value) || 0
    } else {
      newBeneficiaries[index].address = value
    }
    setBeneficiaries(newBeneficiaries)
  }

  const updateVaultData = (field: string, value: any) => {
    setVaultData({ ...vaultData, [field]: value })
  }

  const createVault = () => {
    // Validate beneficiaries
    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0)
    if (totalPercentage !== 100) {
      alert('Beneficiary percentages must add up to 100%')
      return
    }
    
    if (beneficiaries.some(b => !b.address)) {
      alert('Please fill in all beneficiary addresses')
      return
    }

    // Mock vault creation
    console.log('Creating vault with data:', { vaultData, beneficiaries })
    setVaultCreated(true)
    setShowOnboarding(false)
    setStep('dashboard')
  }

  const handleDepositTokens = () => {
    setVaultModalTab('deposit')
    setShowVaultModal(true)
  }

  const handleManageVault = () => {
    setVaultModalTab('info')
    setShowVaultModal(true)
  }

  const handleViewBeneficiaries = () => {
    setVaultModalTab('beneficiaries')
    setShowVaultModal(true)
  }

  const renderOnboardingStep = () => {
    switch (onboardingStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-2">Current Age</label>
              <input 
                id="age"
                name="age"
                type="number" 
                value={vaultData.age}
                onChange={(e) => updateVaultData('age', e.target.value)}
                placeholder="Enter your age"
                className="w-full p-3 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="healthStatus" className="block text-sm font-medium mb-2">Health Status</label>
              <select 
                id="healthStatus"
                name="healthStatus"
                value={vaultData.healthStatus}
                onChange={(e) => updateVaultData('healthStatus', e.target.value)}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium mb-2">Occupation</label>
              <input 
                id="occupation"
                name="occupation"
                type="text" 
                value={vaultData.occupation}
                onChange={(e) => updateVaultData('occupation', e.target.value)}
                placeholder="Your occupation"
                className="w-full p-3 bg-gray-700 rounded border border-gray-600"
              />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Life Expectancy Calculation</h3>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-300 mb-2">Based on your age ({vaultData.age}) and health status ({vaultData.healthStatus})</p>
              <p className="text-2xl font-bold text-green-400">{vaultData.lifeExpectancy} years</p>
              <p className="text-sm text-gray-400">This affects your vault's time-lock mechanism</p>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">Location</label>
              <input 
                id="location"
                name="location"
                type="text" 
                value={vaultData.location}
                onChange={(e) => updateVaultData('location', e.target.value)}
                placeholder="Your location"
                className="w-full p-3 bg-gray-700 rounded border border-gray-600"
              />
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Emergency Contact</h3>
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium mb-2">Emergency Contact</label>
              <input 
                id="emergencyContact"
                name="emergencyContact"
                type="text" 
                value={vaultData.emergencyContact}
                onChange={(e) => updateVaultData('emergencyContact', e.target.value)}
                placeholder="Name and contact information"
                className="w-full p-3 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div className="bg-blue-900 border border-blue-700 p-4 rounded">
              <p className="text-sm text-blue-200">
                This contact will be notified if your vault needs to be accessed due to inactivity or other triggers.
              </p>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Legal & Compliance</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input 
                  id="legalDocuments"
                  name="legalDocuments"
                  type="checkbox" 
                  checked={vaultData.legalDocuments}
                  onChange={(e) => updateVaultData('legalDocuments', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-sm">I have prepared necessary legal documents</span>
              </label>
              <label className="flex items-center space-x-3">
                <input 
                  id="carbonOffset"
                  name="carbonOffset"
                  type="checkbox" 
                  checked={vaultData.carbonOffset}
                  onChange={(e) => updateVaultData('carbonOffset', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-sm">Enable carbon offset features</span>
              </label>
            </div>
            <div className="bg-yellow-900 border border-yellow-700 p-4 rounded">
              <p className="text-sm text-yellow-200">
                <strong>Important:</strong> Ensure you have proper legal documentation for your digital assets and beneficiaries.
              </p>
            </div>
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Vault Summary</h3>
            <div className="bg-gray-700 p-4 rounded space-y-2">
              <p><strong>Owner:</strong> {account.slice(0, 6)}...{account.slice(-4)}</p>
              <p><strong>Age:</strong> {vaultData.age} years</p>
              <p><strong>Life Expectancy:</strong> {vaultData.lifeExpectancy} years</p>
              <p><strong>Health Status:</strong> {vaultData.healthStatus}</p>
              <p><strong>Occupation:</strong> {vaultData.occupation}</p>
              <p><strong>Location:</strong> {vaultData.location}</p>
              <p><strong>Carbon Offset:</strong> {vaultData.carbonOffset ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="bg-green-900 border border-green-700 p-4 rounded">
              <p className="text-sm text-green-200">
                Your vault will be time-locked for {vaultData.lifeExpectancy - parseInt(vaultData.age || '0')} years.
              </p>
            </div>
          </div>
        )
      
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Beneficiaries</h3>
            <div>
              <p className="text-sm font-medium mb-4">Beneficiary Addresses & Percentages</p>
              {beneficiaries.map((beneficiary, index) => (
                <div key={index} className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label htmlFor={`beneficiary-address-${index}`} className="block text-xs text-gray-400 mb-1">
                        Address {index + 1}
                      </label>
                      <input 
                        id={`beneficiary-address-${index}`}
                        name={`beneficiary-address-${index}`}
                        type="text" 
                        placeholder="Beneficiary address"
                        value={beneficiary.address}
                        onChange={(e) => updateBeneficiary(index, 'address', e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded border border-gray-600"
                      />
                    </div>
                    <div className="w-20">
                      <label htmlFor={`beneficiary-percentage-${index}`} className="block text-xs text-gray-400 mb-1">
                        %
                      </label>
                      <input 
                        id={`beneficiary-percentage-${index}`}
                        name={`beneficiary-percentage-${index}`}
                        type="number" 
                        placeholder="%" 
                        value={beneficiary.percentage}
                        onChange={(e) => updateBeneficiary(index, 'percentage', e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded border border-gray-600"
                      />
                    </div>
                    {beneficiaries.length > 1 && (
                      <div className="flex items-end">
                        <button 
                          onClick={() => removeBeneficiary(index)}
                          className="px-3 py-3 bg-red-600 hover:bg-red-700 rounded"
                          aria-label={`Remove beneficiary ${index + 1}`}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button 
                onClick={addBeneficiary}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                + Add Beneficiary
              </button>
            </div>
            <div className="text-sm text-gray-400">
              Total: {beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">⚰️ Sarcophagus Protocol</h1>
          <p className="text-xl text-gray-400">Secure your digital legacy</p>
        </div>

        {step === 'connect' && (
          <div className="text-center">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🔗</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8">Connect your wallet to start securing your digital legacy</p>
            
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 max-w-md mx-auto">
                {error}
              </div>
            )}
            
            <button 
              onClick={connectWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {step === 'onboard' && (
          <div className="text-center">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Wallet Connected!</h2>
            <p className="text-gray-400 mb-4">Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <p className="text-gray-400 mb-8">Complete onboarding to create your vault</p>
            <button 
              onClick={completeOnboarding}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Start Onboarding
            </button>
          </div>
        )}

        {step === 'dashboard' && (
          <div className="text-center">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Vault Created Successfully!</h2>
            <p className="text-gray-400 mb-8">Your digital legacy is now secured</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-bold mb-2">Vault Status</h3>
                <p className="text-green-400">Active</p>
                <p className="text-sm text-gray-400">Ready for deposits</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-bold mb-2">Total Value</h3>
                <p className="text-2xl font-bold">0 VET</p>
                <p className="text-sm text-gray-400">No deposits yet</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-bold mb-2">OBOL Rewards</h3>
                <p className="text-2xl font-bold">0 OBOL</p>
                <p className="text-sm text-gray-400">Start earning rewards</p>
              </div>
            </div>

            <div className="mt-8 space-x-4">
              <button 
                onClick={handleDepositTokens}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Deposit Tokens
              </button>
              <button 
                onClick={handleManageVault}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Manage Vault
              </button>
              <button 
                onClick={handleViewBeneficiaries}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                View Beneficiaries
              </button>
            </div>
          </div>
        )}

        {/* Comprehensive Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create Your Vault</h2>
                <div className="text-sm text-gray-400">Step {onboardingStep} of 6</div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(onboardingStep / 6) * 100}%` }}
                ></div>
              </div>

              {renderOnboardingStep()}

              <div className="flex gap-4 mt-6">
                {onboardingStep > 1 && (
                  <button 
                    onClick={prevOnboardingStep}
                    className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                )}
                {onboardingStep < 6 ? (
                  <button 
                    onClick={nextOnboardingStep}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    onClick={createVault}
                    className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Create Vault
                  </button>
                )}
                <button 
                  onClick={() => setShowOnboarding(false)}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vault Management Modal */}
        {showVaultModal && (
          <VaultManagementModal
            vault={{
              id: 'mock-vault-1',
              owner: account,
              beneficiaries: beneficiaries,
              totalValue: '0',
              lifeExpectancy: vaultData.lifeExpectancy,
              createdAt: new Date(),
              status: 'active',
              obolRewards: '0',
              obolLocked: '0'
            }}
            isOpen={showVaultModal}
            onClose={() => setShowVaultModal(false)}
            defaultTab={vaultModalTab}
          />
        )}
      </div>
    </div>
  )
} 