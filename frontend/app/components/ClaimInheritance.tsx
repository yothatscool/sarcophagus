'use client'

import React, { useState } from 'react'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'
import { useNotification } from '../contexts/NotificationContext'
import { useLoading } from '../contexts/LoadingContext'
import { deathVerificationApiService } from '../utils/deathVerificationApi'

export default function ClaimInheritance() {
  const { claimInheritance } = useSarcophagusContract()
  const { showNotification } = useNotification()
  const { loadingStates, setLoading } = useLoading()
  const [deceasedAddress, setDeceasedAddress] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [inheritanceData, setInheritanceData] = useState<any>(null)
  const [beneficiaries, setBeneficiaries] = useState<any[]>([])
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('')

  const handleVerify = async () => {
    if (!deceasedAddress) {
      showNotification('Please enter the deceased address', 'error')
      return
    }
    setVerificationStatus('pending')
    try {
      // For demo: use address as name, mock date/country
      const result = await deathVerificationApiService.verifyDeath(
        deceasedAddress,
        '1950-01-01',
        'US'
      )
      setVerificationResult(result)
      setVerificationStatus(result.isVerified ? 'verified' : 'failed')
      
      // If verified, create mock inheritance data
      if (result.isVerified) {
        // Mock inheritance data for demo
        setInheritanceData({
          vetAmount: BigInt('1000000000000000000000'), // 1000 VET
          vthoAmount: BigInt('50000000000000000000000'), // 50,000 VTHO
          b3trAmount: BigInt('10000000000000000000000'), // 10,000 B3TR
          obolAmount: BigInt('5000000000000000000000') // 5,000 OBOL
        })
      }
    } catch (error) {
      setVerificationStatus('failed')
      showNotification('Death verification failed', 'error')
    }
  }

  const handleClaim = async () => {
    if (!deceasedAddress) {
      showNotification('Please enter the deceased address', 'error')
      return
    }
    if (verificationStatus !== 'verified') {
      showNotification('Death must be verified before claiming', 'error')
      return
    }
    setLoading('claimInheritance', true)
    try {
      const tx = await claimInheritance(deceasedAddress)
      await tx.wait()
      showNotification('Inheritance claimed successfully!', 'success')
      setDeceasedAddress('')
      setVerificationStatus('idle')
      setVerificationResult(null)
      setInheritanceData(null)
    } catch (error) {
      console.error('Error claiming inheritance:', error)
      showNotification('Failed to claim inheritance', 'error')
    }
    setLoading('claimInheritance', false)
  }

  // Calculate inheritance value and fees
  const calculateInheritanceValue = () => {
    if (!inheritanceData) return { total: 0, fee: 0, net: 0 }
    
    // Mock token prices (in real app, get from API)
    const vetPrice = 0.023
    const vthoPrice = 0.0008
    const b3trPrice = 0.15
    
    const vetValue = (inheritanceData.vetAmount / 1e18) * vetPrice
    const vthoValue = (inheritanceData.vthoAmount / 1e18) * vthoPrice
    const b3trValue = (inheritanceData.b3trAmount / 1e18) * b3trPrice
    
    const totalValue = vetValue + vthoValue + b3trValue
    const fee = totalValue * 0.01 // 1% fee
    const netValue = totalValue - fee
    
    return { total: totalValue, fee, net: netValue }
  }

  const inheritanceValue = calculateInheritanceValue()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Claim Inheritance
        </h1>
        <p className="text-xl text-gray-300">
          Access your inherited digital assets
        </p>
      </div>

      <div className="bg-black/20 backdrop-blur-sm border border-green-500/20 rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">💰</div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Inheritance Available
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            A loved one has designated you as a beneficiary of their digital inheritance. 
            You can now claim your share of the assets stored in their Sarcophagus vault.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deceased Address
            </label>
            <input
              type="text"
              value={deceasedAddress}
              onChange={(e) => setDeceasedAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the wallet address of the deceased person
            </p>
          </div>

          {/* Death Verification Status */}
          <div className="mb-4">
            <button
              onClick={handleVerify}
              disabled={verificationStatus === 'pending' || !deceasedAddress}
              className="w-full px-6 py-2 mb-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
            >
              {verificationStatus === 'pending' ? 'Verifying...' : 'Verify Death'}
            </button>
            {verificationStatus === 'verified' && (
              <div className="text-green-400 text-sm mt-2">Death verified! (Confidence: {verificationResult?.confidence})</div>
            )}
            {verificationStatus === 'failed' && (
              <div className="text-red-400 text-sm mt-2">Death could not be verified. Please check the address or try again.</div>
            )}
          </div>

          {/* Inheritance Value and Fee Display */}
          {verificationStatus === 'verified' && inheritanceData && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">Inheritance Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Value:</span>
                  <span className="text-white">${inheritanceValue.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Transfer Fee (1%):</span>
                  <span>-${inheritanceValue.fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between text-green-400 font-semibold">
                  <span>You Receive:</span>
                  <span>${inheritanceValue.net.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Fee covers protocol maintenance and verification costs
              </p>
            </div>
          )}

          <button
            onClick={handleClaim}
            disabled={loadingStates.claimInheritance?.isLoading || verificationStatus !== 'verified'}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
          >
            {loadingStates.claimInheritance?.isLoading ? 'Claiming...' : 'Claim Inheritance'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            You will receive your share of VET, VTHO, B3TR, and OBOL tokens, 
            plus additional B3TR bonuses for carbon offset and legacy preservation.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            A 1% transfer fee applies to cover protocol costs
          </p>
        </div>
      </div>
    </div>
  )
} 