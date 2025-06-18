'use client'

import { useState, useEffect } from 'react'
import { Framework } from '@vechain/connex-framework'
import { Driver, SimpleNet } from '@vechain/connex-driver'
import { useVereavementContract } from './hooks/useVereavementContract'
import { useRitualContract } from './hooks/useRitualContract'
import { useContractEvents } from './hooks/useContractEvents'
import { useNotification } from './contexts/NotificationContext'
import { ethers } from 'ethers'
import { useWallet } from './contexts/WalletContext'
import { useLoading } from './contexts/LoadingContext'
import TransactionHistory from './components/TransactionHistory'
import BeneficiaryModal from './components/BeneficiaryModal'
import MemorialModal from './components/MemorialModal'
import RitualModal from './components/RitualModal'

export default function Home() {
  const { connect, disconnect, isConnected, address } = useWallet()
  const { showNotification, showTransactionNotification } = useNotification()
  const { isLoading, setLoading } = useLoading()
  const [isBeneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false)
  const [isMemorialModalOpen, setMemorialModalOpen] = useState(false)
  const [isRitualModalOpen, setRitualModalOpen] = useState(false)

  const {
    ritualValue,
    carbonOffset,
    longevityScore,
    createRitualVault,
    recordCarbonOffset,
    processSymbolicGrowth,
    refreshData
  } = useVereavementContract()

  const ritual = useRitualContract()

  // Handle contract events
  useContractEvents((eventName, data) => {
    switch (eventName) {
      case 'VaultCreated':
        showNotification(`New vault created by ${data.owner}`, 'success')
        break
      case 'RitualCompleted':
        showNotification(`Ritual "${data.ritualType}" completed by ${data.user}`, 'success')
        break
      case 'CarbonOffsetRecorded':
        showNotification(`${data.amount} tons of carbon offset recorded`, 'success')
        break
      case 'LongevityScoreUpdated':
        showNotification(`Longevity score updated to ${data.newScore}`, 'info')
        break
      case 'SymbolicGrowthOccurred':
        showNotification(`Ritual value increased to ${ethers.formatEther(data.newValue)} ETH`, 'success')
        break
    }
  })

  useEffect(() => {
    const initConnex = async () => {
      try {
        // Connect to VeChain node (testnet for development)
        const net = new SimpleNet('https://testnet.veblocks.net')
        const driver = await Driver.connect(net)
        const connexInstance = new Framework(driver)
      } catch (error) {
        console.error('Failed to initialize Connex:', error)
        showNotification('Failed to connect to VeChain network', 'error')
      }
    }

    initConnex()
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      fetchContractStates()
    }
  }, [isConnected, address])

  const fetchContractStates = async () => {
    try {
      await ritual.refreshState()
    } catch (error) {
      console.error('Error fetching contract states:', error)
      showNotification('Failed to fetch contract states', 'error')
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          connect(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
        showNotification('Failed to check wallet connection', 'error')
      }
    }
  }

  const handleCreateVault = async () => {
    if (!isConnected) {
      showNotification('Please connect your wallet first', 'warning')
      return
    }
    setLoading('createVault', true)
    try {
      const tx = await createRitualVault()
      showNotification('Creating ritual vault...', 'info')
      await tx.wait()
      showNotification('Ritual vault created successfully!', 'success')
      await refreshData()
    } catch (error) {
      console.error('Error creating vault:', error)
      showNotification('Failed to create ritual vault', 'error')
    }
    setLoading('createVault', false)
  }

  const handleRecordOffset = async () => {
    if (!isConnected) {
      showNotification('Please connect your wallet first', 'warning')
      return
    }
    setLoading('recordOffset', true)
    try {
      const tx = await recordCarbonOffset('1', 'Test Offset')
      showNotification('Recording carbon offset...', 'info')
      await tx.wait()
      showNotification('Carbon offset recorded successfully!', 'success')
      await refreshData()
    } catch (error) {
      console.error('Error recording offset:', error)
      showNotification('Failed to record carbon offset', 'error')
    }
    setLoading('recordOffset', false)
  }

  const handleProcessGrowth = async () => {
    if (!isConnected) {
      showNotification('Please connect your wallet first', 'warning')
      return
    }
    setLoading('processGrowth', true)
    try {
      const tx = await processSymbolicGrowth()
      showNotification('Processing symbolic growth...', 'info')
      await tx.wait()
      showNotification('Symbolic growth processed successfully!', 'success')
      await refreshData()
    } catch (error) {
      console.error('Error processing growth:', error)
      showNotification('Failed to process symbolic growth', 'error')
    }
    setLoading('processGrowth', false)
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Error connecting wallet:', error)
      showNotification('Failed to connect wallet', 'error')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Vereavement Protocol
          </h1>
          <button
            onClick={handleConnect}
            disabled={isLoading.connect}
            className={`px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity ${
              isLoading.connect ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading.connect ? 'Connecting...' : isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Ritual Value Card */}
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Ritual Value</h2>
            <p className="text-4xl font-bold text-white mb-6">{ritualValue} ETH</p>
            <button
              onClick={handleProcessGrowth}
              disabled={isLoading.processGrowth || !isConnected}
              className={`w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-lg font-semibold transition-colors ${
                (isLoading.processGrowth || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading.processGrowth ? 'Processing...' : 'Process Growth'}
            </button>
          </div>

          {/* Carbon Offset Card */}
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Carbon Offset</h2>
            <p className="text-4xl font-bold text-white mb-6">{carbonOffset} tons</p>
            <button
              onClick={handleRecordOffset}
              disabled={isLoading.recordOffset || !isConnected}
              className={`w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg text-lg font-semibold transition-colors ${
                (isLoading.recordOffset || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading.recordOffset ? 'Recording...' : 'Record Offset'}
            </button>
          </div>

          {/* Longevity Score Card */}
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Longevity Score</h2>
            <p className="text-4xl font-bold text-white mb-6">{longevityScore} points</p>
            <button
              onClick={refreshData}
              disabled={isLoading.refresh || !isConnected}
              className={`w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-lg font-semibold transition-colors ${
                (isLoading.refresh || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading.refresh ? 'Updating...' : 'Update Score'}
            </button>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-purple-400">Available Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleCreateVault}
              disabled={isLoading.createVault || !isConnected}
              className={`bg-gradient-to-r from-purple-600 to-indigo-600 py-4 px-6 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity ${
                (isLoading.createVault || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading.createVault ? 'Creating...' : 'Create Ritual Vault'}
            </button>
            <button
              onClick={() => setBeneficiaryModalOpen(true)}
              disabled={!isConnected}
              className={`bg-gradient-to-r from-pink-600 to-rose-600 py-4 px-6 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity ${
                !isConnected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Manage Beneficiaries
            </button>
            <button
              onClick={() => setRitualModalOpen(true)}
              disabled={!isConnected}
              className={`bg-gradient-to-r from-amber-600 to-yellow-600 py-4 px-6 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity ${
                !isConnected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Complete Ritual
            </button>
            <button
              onClick={() => setMemorialModalOpen(true)}
              disabled={!isConnected}
              className={`bg-gradient-to-r from-teal-600 to-emerald-600 py-4 px-6 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity ${
                !isConnected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Preserve Memorial
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory />

        {/* Status Section */}
        {isConnected && address && (
          <div className="mt-8 text-sm text-gray-400">
            Connected Account: {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
          </div>
        )}

        {/* Modals */}
        <BeneficiaryModal
          isOpen={isBeneficiaryModalOpen}
          onClose={() => setBeneficiaryModalOpen(false)}
        />
        <MemorialModal
          isOpen={isMemorialModalOpen}
          onClose={() => setMemorialModalOpen(false)}
        />
        <RitualModal
          isOpen={isRitualModalOpen}
          onClose={() => setRitualModalOpen(false)}
        />
      </div>
    </main>
  )
} 