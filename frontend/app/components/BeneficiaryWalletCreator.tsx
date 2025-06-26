'use client'

import React, { useState } from 'react'

interface BeneficiaryWallet {
  id: string
  name: string
  email: string
  walletAddress: string
  privateKey: string
  recoveryPhrase: string
  status: 'created' | 'claimed' | 'pending'
  createdAt: Date
}

interface BeneficiaryWalletCreatorProps {
  beneficiary: {
    name: string
    email: string
    phone?: string
  }
  onWalletCreated: (wallet: BeneficiaryWallet) => void
  onClose: () => void
}

export default function BeneficiaryWalletCreator({ beneficiary, onWalletCreated, onClose }: BeneficiaryWalletCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [wallet, setWallet] = useState<BeneficiaryWallet | null>(null)

  const generateWallet = async () => {
    setIsCreating(true)
    
    // Simulate wallet creation (in production, this would use VeChain wallet generation)
    setTimeout(() => {
      const newWallet: BeneficiaryWallet = {
        id: Date.now().toString(),
        name: beneficiary.name,
        email: beneficiary.email,
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        privateKey: `0x${Math.random().toString(16).substr(2, 64)}`,
        recoveryPhrase: 'demo recovery phrase for testing purposes only',
        status: 'created',
        createdAt: new Date()
      }
      
      setWallet(newWallet)
      setIsCreating(false)
    }, 2000)
  }

  const sendWalletInfo = async () => {
    if (!wallet) return
    
    // Simulate sending wallet info to beneficiary
    alert(`Wallet information sent to ${beneficiary.email}!\n\nIn production, this would:\n- Send secure email with wallet details\n- Provide step-by-step claiming instructions\n- Include recovery information`)
    
    onWalletCreated(wallet)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1f2e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Create Wallet for {beneficiary.name}</h1>
              <p className="text-gray-400">Automatically generate a VeChain wallet for non-crypto beneficiary</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Beneficiary Info */}
          <div className="bg-[#1a1f2e]/60 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Beneficiary Information</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Name:</span> <span className="text-white">{beneficiary.name}</span></div>
              <div><span className="text-gray-400">Email:</span> <span className="text-white">{beneficiary.email}</span></div>
              {beneficiary.phone && (
                <div><span className="text-gray-400">Phone:</span> <span className="text-white">{beneficiary.phone}</span></div>
              )}
            </div>
          </div>

          {/* Wallet Creation */}
          {!wallet ? (
            <div className="bg-[#1a1f2e]/60 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Create VeChain Wallet</h3>
              <p className="text-gray-300 mb-4">
                We&apos;ll automatically create a VeChain wallet for {beneficiary.name} and send them the details via email.
                This makes it easy for non-crypto users to claim their inheritance.
              </p>
              
              <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg mb-4">
                <h4 className="text-blue-400 font-semibold mb-2">What happens next:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Generate secure VeChain wallet</li>
                  <li>• Send wallet details to {beneficiary.email}</li>
                  <li>• Provide step-by-step claiming instructions</li>
                  <li>• Include recovery information</li>
                </ul>
              </div>

              <button
                onClick={generateWallet}
                disabled={isCreating}
                className={`w-full py-3 rounded-lg transition-colors ${
                  isCreating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                }`}
              >
                {isCreating ? 'Creating Wallet...' : 'Create Wallet & Send Details'}
              </button>
            </div>
          ) : (
            /* Wallet Created */
            <div className="bg-[#1a1f2e]/60 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Wallet Created Successfully!</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Wallet Address</label>
                  <div className="bg-[#2d3748] p-3 rounded-lg border border-gray-600">
                    <code className="text-sm text-green-400 break-all">{wallet.walletAddress}</code>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Recovery Phrase</label>
                  <div className="bg-[#2d3748] p-3 rounded-lg border border-gray-600">
                    <code className="text-sm text-yellow-400">{wallet.recoveryPhrase}</code>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-600/30 p-4 rounded-lg">
                  <p className="text-sm text-green-300">
                    <strong>Wallet ready!</strong> Click below to send the wallet information to {beneficiary.email}.
                  </p>
                </div>

                <button
                  onClick={sendWalletInfo}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Send Wallet Details to {beneficiary.email}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 