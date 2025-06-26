'use client'

import React, { useState } from 'react'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'
import { useNotification } from '../contexts/NotificationContext'
import { useLoading } from '../contexts/LoadingContext'
import BeneficiaryModal from './BeneficiaryModal'

interface CreateSarcophagusProps {
  onClose: () => void
}

export default function CreateSarcophagus({ onClose }: CreateSarcophagusProps) {
  const { createSarcophagus } = useSarcophagusContract()
  const { showNotification } = useNotification()
  const { isLoading, setLoading } = useLoading()
  const [isBeneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [showFinalWarning, setShowFinalWarning] = useState(false)
  const [confirmedWarnings, setConfirmedWarnings] = useState({
    irrevocable: false,
    timeLock: false,
    penalties: false,
    deathOnly: false,
    legal: false
  })

  const handleCreateVault = () => {
    setBeneficiaryModalOpen(true)
  }

  const handleBeneficiaryComplete = async (beneficiaries: any[], charityAddress?: string) => {
    try {
      setLoading('createVault', true)
      
      // Extract beneficiary data for contract call
      const addresses = beneficiaries.map(b => b.address)
      const percentages = beneficiaries.map(b => b.percentage * 100) // Convert to basis points

      // Create the sarcophagus with basic parameters
      await createSarcophagus(addresses, percentages)
      
      showNotification('Vault created successfully!', 'success')
      onClose()
    } catch (error) {
      console.error('Error creating vault:', error)
      showNotification('Failed to create vault. Please try again.', 'error')
    } finally {
      setLoading('createVault', false)
      setBeneficiaryModalOpen(false)
    }
  }

  const handleWarningConfirmation = (warning: keyof typeof confirmedWarnings) => {
    setConfirmedWarnings(prev => ({
      ...prev,
      [warning]: !prev[warning]
    }))
  }

  const allWarningsConfirmed = Object.values(confirmedWarnings).every(Boolean)

  const renderWarningStep = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="text-red-600 text-3xl mr-3">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600">CRITICAL WARNINGS</h2>
          </div>

          <div className="space-y-6">
            {/* Irrevocable Warning */}
            <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={confirmedWarnings.irrevocable}
                  onChange={() => handleWarningConfirmation('irrevocable')}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-red-800 text-lg mb-2">
                    🔒 IRREVOCABLE COMMITMENT
                  </h3>
                  <p className="text-red-700">
                    <strong>Your vault is IRREVOCABLE for 7 years.</strong> Once created, you CANNOT withdraw any funds for 7 years, regardless of circumstances. This is a permanent, life-changing decision.
                  </p>
                </div>
              </div>
            </div>

            {/* Time Lock Warning */}
            <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={confirmedWarnings.timeLock}
                  onChange={() => handleWarningConfirmation('timeLock')}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-orange-800 text-lg mb-2">
                    ⏰ SEVERE TIME LOCK
                  </h3>
                  <p className="text-orange-700">
                    <strong>7-year complete lock:</strong> No withdrawals of any kind for 7 years.<br/>
                    <strong>15-year partial access:</strong> Only 30% withdrawal with 35% penalty.<br/>
                    <strong>Emergency access:</strong> 90% penalty after 7 years.
                  </p>
                </div>
              </div>
            </div>

            {/* Death Only Warning */}
            <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={confirmedWarnings.deathOnly}
                  onChange={() => handleWarningConfirmation('deathOnly')}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-purple-800 text-lg mb-2">
                    💀 DEATH-TRIGGERED ONLY
                  </h3>
                  <p className="text-purple-700">
                    <strong>Funds are ONLY released upon your verified death.</strong> This is not a savings account or investment vehicle. Your beneficiaries receive funds only after you die and death is verified by oracles.
                  </p>
                </div>
              </div>
            </div>

            {/* Penalty Warning */}
            <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={confirmedWarnings.penalties}
                  onChange={() => handleWarningConfirmation('penalties')}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-yellow-800 text-lg mb-2">
                    💸 SEVERE PENALTIES
                  </h3>
                  <p className="text-yellow-700">
                    <strong>Partial withdrawal:</strong> 35% penalty (you lose 35% of what you withdraw)<br/>
                    <strong>Full withdrawal:</strong> 20% penalty<br/>
                    <strong>Emergency withdrawal:</strong> 90% penalty (you lose 90% of your funds)
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Warning */}
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={confirmedWarnings.legal}
                  onChange={() => handleWarningConfirmation('legal')}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-blue-800 text-lg mb-2">
                    ⚖️ LEGAL IMPLICATIONS
                  </h3>
                  <p className="text-blue-700">
                    <strong>This is a legally binding inheritance contract.</strong> Consult with legal professionals about inheritance laws in your jurisdiction. This may affect your estate planning, taxes, and legal obligations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Warning */}
          <div className="mt-8 p-4 bg-red-100 border-2 border-red-400 rounded-lg">
            <h3 className="font-bold text-red-800 text-lg mb-2">
              🚨 FINAL WARNING
            </h3>
            <p className="text-red-700">
              <strong>By creating this vault, you are making a permanent, irrevocable commitment to lock your funds until death or severe penalties.</strong> This decision cannot be undone. Are you absolutely certain you understand the implications?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600"
            >
              CANCEL - I'm Not Ready
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!allWarningsConfirmed}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              I UNDERSTAND - Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderVaultCreation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Create Inheritance Vault</h2>
          
          {/* Final Confirmation */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Final reminder:</strong> This vault will be irrevocable for 7 years with severe penalties for early withdrawal.
            </p>
          </div>

          {/* Vault creation form would go here */}
          <div className="space-y-4">
            <p className="text-gray-600">
              Vault creation form components would be here...
            </p>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Back to Warnings
            </button>
            <button
              onClick={() => setShowFinalWarning(true)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Create Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFinalWarning = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            LAST CHANCE TO CANCEL
          </h2>
          <p className="text-gray-700 mb-6">
            <strong>Are you absolutely certain?</strong><br/>
            This vault will be irrevocable for 7 years.<br/>
            You will lose 90% of your funds if you need emergency access.<br/>
            This is a permanent, life-changing decision.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowFinalWarning(false)}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
            >
              CANCEL - I'm Not Ready
            </button>
            <button
              onClick={handleCreateVault}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700"
            >
              YES - Create Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render BeneficiaryModal if open
  if (isBeneficiaryModalOpen) {
    return (
      <BeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setBeneficiaryModalOpen(false)}
        onComplete={handleBeneficiaryComplete}
      />
    )
  }

  if (step === 1) {
    return renderWarningStep()
  }

  if (showFinalWarning) {
    return renderFinalWarning()
  }

  return renderVaultCreation()
} 