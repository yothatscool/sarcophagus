'use client'

import React, { useState, useEffect } from 'react'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'
import { useWallet } from '../contexts/WalletContext'

interface WithdrawalEligibility {
  canWithdrawPartial: boolean
  canWithdrawAll: boolean
  canEmergencyWithdraw: boolean
  timeUntilPartialWithdrawal: string
  timeUntilFullWithdrawal: string
  timeUntilEmergencyWithdrawal: string
}

export default function WithdrawalManager() {
  const { account } = useWallet()
  const { 
    getWithdrawalEligibility, 
    withdrawPartial, 
    withdrawAll, 
    emergencyWithdraw,
    userSarcophagus 
  } = useSarcophagusContract()

  const [eligibility, setEligibility] = useState<WithdrawalEligibility | null>(null)
  const [partialPercentage, setPartialPercentage] = useState(25) // 25% default
  const [emergencyReason, setEmergencyReason] = useState('')
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)

  useEffect(() => {
    if (account) {
      loadEligibility()
    }
  }, [account])

  const loadEligibility = async () => {
    if (!account) return
    const data = await getWithdrawalEligibility(account)
    setEligibility(data)
  }

  const formatTime = (seconds: string) => {
    const totalSeconds = parseInt(seconds)
    if (totalSeconds === 0) return 'Available now'
    
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const handlePartialWithdraw = async () => {
    await withdrawPartial(partialPercentage)
    await loadEligibility()
  }

  const handleFullWithdraw = async () => {
    await withdrawAll()
    await loadEligibility()
  }

  const handleEmergencyWithdraw = async () => {
    if (!emergencyReason.trim()) {
      alert('Please provide a reason for emergency withdrawal')
      return
    }
    await emergencyWithdraw(emergencyReason)
    setShowEmergencyModal(false)
    setEmergencyReason('')
    await loadEligibility()
  }

  if (!userSarcophagus) {
    return null
  }

  const totalValue = Number(userSarcophagus.vetAmount) + 
                    Number(userSarcophagus.vthoAmount) + 
                    Number(userSarcophagus.b3trAmount) + 
                    Number(userSarcophagus.obolAmount)

  if (totalValue === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Withdrawal Management</h3>
      
      {eligibility && (
        <div className="space-y-4">
          {/* Time-locked Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Withdrawal Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Emergency Withdrawal:</span>
                <span className={eligibility.canEmergencyWithdraw ? 'text-green-600' : 'text-gray-500'}>
                  {eligibility.canEmergencyWithdraw ? 'Available' : formatTime(eligibility.timeUntilEmergencyWithdrawal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Partial Withdrawal:</span>
                <span className={eligibility.canWithdrawPartial ? 'text-green-600' : 'text-gray-500'}>
                  {eligibility.canWithdrawPartial ? 'Available' : formatTime(eligibility.timeUntilPartialWithdrawal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Full Withdrawal:</span>
                <span className={eligibility.canWithdrawAll ? 'text-green-600' : 'text-gray-500'}>
                  {eligibility.canWithdrawAll ? 'Available' : formatTime(eligibility.timeUntilFullWithdrawal)}
                </span>
              </div>
            </div>
          </div>

          {/* Withdrawal Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Partial Withdrawal */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Partial Withdrawal (35% penalty)</h4>
              <p className="text-sm text-gray-600 mb-3">
                Withdraw up to 30% of your funds after 15 years
              </p>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Percentage:</label>
                <select 
                  value={partialPercentage} 
                  onChange={(e) => setPartialPercentage(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                  disabled={!eligibility.canWithdrawPartial}
                >
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                  <option value={30}>30%</option>
                </select>
              </div>
              <button
                onClick={handlePartialWithdraw}
                disabled={!eligibility.canWithdrawPartial}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Withdraw {partialPercentage}%
              </button>
            </div>

            {/* Full Withdrawal */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Full Withdrawal (20% penalty)</h4>
              <p className="text-sm text-gray-600 mb-3">
                Withdraw all funds after 15 years
              </p>
              <button
                onClick={handleFullWithdraw}
                disabled={!eligibility.canWithdrawAll}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Withdraw All
              </button>
            </div>

            {/* Emergency Withdrawal */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Emergency Withdrawal (90% penalty)</h4>
              <p className="text-sm text-gray-600 mb-3">
                Emergency access after 7 years with severe penalty
              </p>
              <button
                onClick={() => setShowEmergencyModal(true)}
                disabled={!eligibility.canEmergencyWithdraw}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Emergency Withdraw
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-yellow-600 text-lg mr-2">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">Important Notes</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• No withdrawals allowed in the first 7 years</li>
                  <li>• Partial withdrawal (up to 30%) available after 15 years with 35% penalty</li>
                  <li>• Full withdrawal available after 15 years with 20% penalty</li>
                  <li>• Emergency withdrawal available after 7 years with 90% penalty</li>
                  <li>• All penalties are collected by the protocol</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Severe Warning */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-red-600 text-xl mr-3">🚨</div>
              <div>
                <h4 className="font-bold text-red-800 text-lg">SEVERE WARNING</h4>
                <p className="text-red-700 mt-2">
                  <strong>These withdrawals are PERMANENT and IRREVERSIBLE.</strong> You will lose significant portions of your inheritance funds. 
                  This is not a savings account - this is a death-triggered inheritance vault. 
                  <strong>Only withdraw if you have no other options.</strong>
                </p>
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                  <p className="text-red-800 text-sm font-medium">
                    💀 Remember: Your beneficiaries will receive these funds upon your death. 
                    Every withdrawal reduces what your loved ones will inherit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Withdrawal Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Emergency Withdrawal</h3>
            <div className="mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">
                  <strong>Warning:</strong> This will incur a 90% penalty on your total funds. 
                  Only use in true emergencies.
                </p>
              </div>
              <label className="block text-sm font-medium mb-2">Emergency Reason:</label>
              <textarea
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                placeholder="Please describe the emergency situation..."
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyWithdraw}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Confirm Emergency Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 