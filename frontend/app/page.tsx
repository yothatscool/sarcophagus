'use client'

import { useState, useEffect } from 'react'
import { Framework } from '@vechain/connex-framework'
import { Driver, SimpleNet } from '@vechain/connex-driver'
import { useVereavementContract } from './hooks/useVereavementContract'
import { useRitualContract } from './hooks/useRitualContract'
import { useContractEvents } from './hooks/useContractEvents'
import { useNotification } from './contexts/NotificationContext'
import { ethers } from 'ethers'

export default function Home() {
  const [connex, setConnex] = useState<Framework | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [vaultStatus, setVaultStatus] = useState<any>(null)
  const [ritualState, setRitualState] = useState<any>(null)
  const [account, setAccount] = useState('')
  
  const { showNotification, showTransactionNotification } = useNotification()
  
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
        setConnex(connexInstance)
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
      setRitualState(ritual.ritualState)
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
          setIsConnected(true)
          setAccount(accounts[0])
          await refreshData()
        }
      } catch (error) {
        console.error('Error checking connection:', error)
        showNotification('Failed to check wallet connection', 'error')
      }
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setIsConnected(true)
        setAccount(accounts[0])
        await refreshData()
        showNotification('Wallet connected successfully', 'success')
      } catch (error) {
        console.error('Error connecting wallet:', error)
        showNotification('Failed to connect wallet', 'error')
      }
    }
  }

  const handleProcessGrowth = async () => {
    try {
      const tx = await processSymbolicGrowth()
      showTransactionNotification(tx.hash)
      await tx.wait()
      showNotification('Symbolic growth processed successfully', 'success')
    } catch (error) {
      console.error('Error processing growth:', error)
      showNotification('Failed to process symbolic growth', 'error')
    }
  }

  const handleRecordOffset = async () => {
    try {
      const tx = await recordCarbonOffset('1', 'Test Offset')
      showTransactionNotification(tx.hash)
      await tx.wait()
      showNotification('Carbon offset recorded successfully', 'success')
    } catch (error) {
      console.error('Error recording offset:', error)
      showNotification('Failed to record carbon offset', 'error')
    }
  }

  const handleCreateVault = async () => {
    try {
      const tx = await createRitualVault()
      showTransactionNotification(tx.hash)
      await tx.wait()
      showNotification('Ritual vault created successfully', 'success')
    } catch (error) {
      console.error('Error creating vault:', error)
      showNotification('Failed to create ritual vault', 'error')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Vereavement Protocol
          </h1>
          <button
            onClick={connectWallet}
            className={`px-6 py-2 rounded-full ${
              isConnected
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-purple-600 hover:bg-purple-700'
            } transition-colors duration-200`}
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Ritual Value Card */}
          <div className="bg-gray-800 rounded-2xl p-6 backdrop-blur-lg bg-opacity-50 hover:bg-opacity-70 transition-all duration-200">
            <h2 className="text-xl font-semibold mb-4">Ritual Value</h2>
            <p className="text-3xl font-bold text-purple-400">{ritualValue} ETH</p>
            <button
              onClick={handleProcessGrowth}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition-colors duration-200"
            >
              Process Growth
            </button>
          </div>

          {/* Carbon Offset Card */}
          <div className="bg-gray-800 rounded-2xl p-6 backdrop-blur-lg bg-opacity-50 hover:bg-opacity-70 transition-all duration-200">
            <h2 className="text-xl font-semibold mb-4">Carbon Offset</h2>
            <p className="text-3xl font-bold text-green-400">{carbonOffset} tons</p>
            <button
              onClick={handleRecordOffset}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg transition-colors duration-200"
            >
              Record Offset
            </button>
          </div>

          {/* Longevity Score Card */}
          <div className="bg-gray-800 rounded-2xl p-6 backdrop-blur-lg bg-opacity-50 hover:bg-opacity-70 transition-all duration-200">
            <h2 className="text-xl font-semibold mb-4">Longevity Score</h2>
            <p className="text-3xl font-bold text-blue-400">{longevityScore} points</p>
            <button
              onClick={refreshData}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors duration-200"
            >
              Update Score
            </button>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Available Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleCreateVault}
              className="bg-indigo-600 hover:bg-indigo-700 py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Create Ritual Vault
            </button>
            <button className="bg-pink-600 hover:bg-pink-700 py-3 px-4 rounded-lg transition-colors duration-200">
              Manage Beneficiaries
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 py-3 px-4 rounded-lg transition-colors duration-200">
              Complete Ritual
            </button>
            <button className="bg-teal-600 hover:bg-teal-700 py-3 px-4 rounded-lg transition-colors duration-200">
              Preserve Memorial
            </button>
          </div>
        </div>

        {/* Status Section */}
        {isConnected && (
          <div className="mt-8 text-sm text-gray-400">
            Connected Account: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </div>
    </main>
  )
} 