'use client'

import React, { useState, useEffect } from 'react'
import { useContract } from '../hooks/useContract'
import { useWallet } from '../contexts/WalletContext'
import { useNotification } from '../contexts/NotificationContext'
import { useLoading } from '../contexts/LoadingContext'
import { OBOL_ABI, SARCOPHAGUS_ABI } from '../config/contracts'

interface ObolWithdrawalProps {
  className?: string
}

interface ObolData {
  balance: string
  earned: string
  lockedInVault: string
  pendingRewards: string
  dailyRate: string
  isLongTermHolder: boolean
}

export default function ObolWithdrawal({ className = '' }: ObolWithdrawalProps) {
  const { account } = useWallet()
  const { showNotification } = useNotification()
  const { isLoading, setLoading } = useLoading()
  
  // Initialize contracts - you'll need to provide the actual contract addresses
  const { contract: obolContract } = useContract('OBOL_CONTRACT_ADDRESS', OBOL_ABI)
  const { contract: sarcophagusContract } = useContract('SARCOPHAGUS_CONTRACT_ADDRESS', SARCOPHAGUS_ABI)
  
  const [obolData, setObolData] = useState<ObolData | null>(null)
  const [lockAmount, setLockAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    if (account && obolContract) {
      loadObolData()
    }
  }, [account, obolContract])

  const loadObolData = async () => {
    if (!account || !obolContract || !sarcophagusContract) return

    try {
      setLoading('loadObolData', true)
      
      // Get OBOL balance
      const balance = await obolContract.balanceOf(account)
      
      // Get user stake info
      const stakeInfo = await obolContract.getUserStake(account)
      
      // Get pending rewards
      const pendingRewards = await obolContract.getPendingRewards(account)
      
      // Get OBOL locked in vault (from sarcophagus contract)
      const sarcophagusData = await sarcophagusContract.sarcophagi(account)
      const lockedInVault = sarcophagusData.obolAmount

      setObolData({
        balance: balance.toString(),
        earned: (BigInt(stakeInfo.totalEarned) + BigInt(pendingRewards)).toString(),
        lockedInVault: lockedInVault.toString(),
        pendingRewards: pendingRewards.toString(),
        dailyRate: stakeInfo.dailyRewardRate.toString(),
        isLongTermHolder: stakeInfo.isLongTermHolder
      })
    } catch (error) {
      console.error('Error loading OBOL data:', error)
      showNotification('Error loading OBOL data', 'error')
    } finally {
      setLoading('loadObolData', false)
    }
  }

  const handleLockObol = async () => {
    if (!account || !obolContract || !sarcophagusContract || !lockAmount) return

    try {
      setLoading('lockObol', true)
      
      const amount = BigInt(lockAmount) * BigInt(10 ** 18) // Convert to wei
      
      // First approve the sarcophagus contract to spend OBOL
      const approveTx = await obolContract.approve(sarcophagusContract.address, amount)
      await approveTx.wait()
      
      // Then lock the OBOL tokens in the vault
      const lockTx = await sarcophagusContract.lockObolTokens(amount)
      await lockTx.wait()
      
      showNotification('OBOL tokens locked in vault successfully!', 'success')
      setLockAmount('')
      loadObolData() // Refresh data
    } catch (error) {
      console.error('Error locking OBOL:', error)
      showNotification('Error locking OBOL tokens', 'error')
    } finally {
      setLoading('lockObol', false)
    }
  }

  const handleWithdrawObol = async () => {
    if (!account || !obolContract || !withdrawAmount) return

    try {
      setLoading('withdrawObol', true)
      
      const amount = BigInt(withdrawAmount) * BigInt(10 ** 18) // Convert to wei
      
      // Claim rewards (this transfers them to user's wallet)
      const claimTx = await obolContract.claimRewards()
      await claimTx.wait()
      
      showNotification('OBOL tokens withdrawn successfully!', 'success')
      setWithdrawAmount('')
      loadObolData() // Refresh data
    } catch (error) {
      console.error('Error withdrawing OBOL:', error)
      showNotification('Error withdrawing OBOL tokens', 'error')
    } finally {
      setLoading('withdrawObol', false)
    }
  }

  const formatTokenAmount = (amount: string) => {
    return (BigInt(amount) / BigInt(10 ** 18)).toString()
  }

  if (!account) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">OBOL Token Management</h3>
        <p className="text-gray-600">Please connect your wallet to manage OBOL tokens.</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">OBOL Token Management</h3>
      
      {isLoading('loadObolData') ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      ) : obolData ? (
        <div className="space-y-4">
          {/* OBOL Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Earned</p>
              <p className="text-xl font-bold text-blue-800">{formatTokenAmount(obolData.earned)} OBOL</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Locked in Vault</p>
              <p className="text-xl font-bold text-green-800">{formatTokenAmount(obolData.lockedInVault)} OBOL</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Available Balance</p>
              <p className="text-xl font-bold text-yellow-800">{formatTokenAmount(obolData.balance)} OBOL</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Daily Rate</p>
              <p className="text-xl font-bold text-purple-800">{formatTokenAmount(obolData.dailyRate)} OBOL/day</p>
            </div>
          </div>

          {/* Long-term Holder Status */}
          {obolData.isLongTermHolder && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Long-term Holder Bonus Active
                  </p>
                  <p className="text-sm text-green-700">
                    You're earning enhanced rewards for your long-term commitment!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lock OBOL for Inheritance */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Lock OBOL for Inheritance</h4>
            <p className="text-sm text-gray-600 mb-4">
              Lock your earned OBOL tokens in your vault to include them in inheritance distribution to beneficiaries.
            </p>
            
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount to lock"
                value={lockAmount}
                onChange={(e) => setLockAmount(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleLockObol}
                disabled={isLoading('lockObol') || !lockAmount || BigInt(lockAmount || '0') > BigInt(obolData.balance)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading('lockObol') ? 'Locking...' : 'Lock'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Available to lock: {formatTokenAmount(obolData.balance)} OBOL
            </p>
          </div>

          {/* Withdraw OBOL to Wallet */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Withdraw OBOL to Wallet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Withdraw your earned OBOL tokens to your VeWorld wallet for immediate use.
            </p>
            
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleWithdrawObol}
                disabled={isLoading('withdrawObol') || !withdrawAmount}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading('withdrawObol') ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
            {/* OBOL Withdrawal Fee Summary */}
            {withdrawAmount && Number(withdrawAmount) > 0 && (
              <div className="mt-2 text-xs text-gray-700">
                <div>Withdraw Amount: {withdrawAmount} OBOL</div>
                <div>Withdrawal Fee (0.5%): {(Number(withdrawAmount) * 0.005).toFixed(4)} OBOL</div>
                <div className="font-semibold">Net Received: {(Number(withdrawAmount) * 0.995).toFixed(4)} OBOL</div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Pending rewards: {formatTokenAmount(obolData.pendingRewards)} OBOL
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>• Only OBOL tokens locked in your vault will be distributed to beneficiaries</p>
                  <p>• You can choose to lock all, some, or none of your earned OBOL</p>
                  <p>• Withdrawn OBOL tokens are not included in inheritance distribution</p>
                </div>
              </div>
            </div>
          </div>

          {/* OBOL Reward Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-md font-semibold text-blue-800 mb-2">How OBOL Rewards Work</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• OBOL rewards are earned on <b>all tokens locked in your vault</b> (VET, VTHO, B3TR, OBOL), based on their VET-equivalent value.</li>
              <li>• Rewards update automatically after every deposit or lock.</li>
              <li>• <b>Conversion rates:</b> 1 VET = 1 VET, 1 VTHO = 0.0001 VET, 1 B3TR = 0.001 VET, 1 OBOL = 0.01 VET.</li>
              <li>• <b>Hard Cap:</b> Maximum 1,500 OBOL in unclaimed rewards. Claim regularly to continue earning!</li>
              <li>• Lock any supported token to maximize your OBOL earnings.</li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No OBOL data available.</p>
      )}
    </div>
  )
} 