'use client'

import React, { useState } from 'react'

interface DepositWarningProps {
  onConfirm: () => void
  onCancel: () => void
  depositAmount: string
}

export default function DepositWarning({ onConfirm, onCancel, depositAmount }: DepositWarningProps) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="text-red-600 text-3xl mr-3">💀</div>
            <h2 className="text-2xl font-bold text-red-600">DEPOSIT WARNING</h2>
          </div>

          <div className="space-y-4">
            {/* Amount Warning */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <h3 className="font-bold text-red-800 text-lg mb-2">
                🔒 LOCKING {depositAmount} FOREVER
              </h3>
              <p className="text-red-700">
                <strong>You are about to lock {depositAmount} in an irrevocable inheritance vault.</strong> 
                These funds will be inaccessible for 7 years and only released upon your death or severe penalties.
              </p>
            </div>

            {/* Time Lock Warning */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
              <h3 className="font-bold text-orange-800 text-lg mb-2">
                ⏰ 7-YEAR COMPLETE LOCK
              </h3>
              <p className="text-orange-700">
                <strong>No access for 7 years:</strong> You cannot withdraw any funds for 7 years, regardless of circumstances.
                Medical emergencies, financial hardship, or any other situation will not allow early access.
              </p>
            </div>

            {/* Penalty Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 text-lg mb-2">
                💸 SEVERE PENALTIES AFTER 7 YEARS
              </h3>
              <p className="text-yellow-700">
                <strong>Emergency withdrawal:</strong> 90% penalty (you lose 90% of your funds)<br/>
                <strong>Partial withdrawal (15+ years):</strong> 35% penalty<br/>
                <strong>Full withdrawal (15+ years):</strong> 20% penalty
              </p>
            </div>

            {/* Death Only Warning */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
              <h3 className="font-bold text-purple-800 text-lg mb-2">
                💀 DEATH-TRIGGERED RELEASE
              </h3>
              <p className="text-purple-700">
                <strong>Funds are ONLY released when you die and death is verified.</strong> 
                This is not an investment or savings account. Your beneficiaries receive the funds only after your verified death.
              </p>
            </div>

            {/* Final Confirmation */}
            <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-red-800 text-lg mb-2">
                    🚨 FINAL CONFIRMATION
                  </h3>
                  <p className="text-red-700">
                    <strong>I understand that I am permanently locking {depositAmount} in an irrevocable inheritance vault.</strong>
                    I accept that these funds will be inaccessible for 7 years and only released upon my death or severe penalties.
                    I have consulted with legal and financial advisors if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600"
            >
              CANCEL - I'm Not Ready
            </button>
            <button
              onClick={onConfirm}
              disabled={!confirmed}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              CONFIRM DEPOSIT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 