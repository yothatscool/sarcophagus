'use client'

import React, { useState } from 'react'

interface LegalAgreementProps {
  onAccept: () => void
  onDecline: () => void
  actionType: 'deposit' | 'lock' | 'convert'
}

export default function LegalAgreement({ onAccept, onDecline, actionType }: LegalAgreementProps) {
  const [accepted, setAccepted] = useState(false)

  const getActionText = () => {
    switch (actionType) {
      case 'deposit':
        return 'depositing tokens'
      case 'lock':
        return 'locking tokens'
      case 'convert':
        return 'converting tokens'
      default:
        return 'performing this action'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="text-red-600 text-3xl mr-3">⚖️</div>
            <h2 className="text-2xl font-bold text-red-600">LEGAL AGREEMENT REQUIRED</h2>
          </div>

          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-red-800 font-medium">
              <strong>IMPORTANT:</strong> Before {getActionText()} into your vault, you must acknowledge and agree to the following terms.
            </p>
          </div>

          <div className="border rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto">
              <p>
                <strong>1. IRREVOCABLE COMMITMENT:</strong> By proceeding, you acknowledge that funds deposited are irrevocably locked for a minimum of 7 years with no exceptions for any circumstances including medical emergencies, financial hardship, or legal proceedings.
              </p>
              <p>
                <strong>2. DEATH-TRIGGERED RELEASE:</strong> Funds are only released upon verified death through oracle confirmation. This is not a savings account, investment vehicle, or emergency fund.
              </p>
              <p>
                <strong>3. SEVERE PENALTIES:</strong> Early withdrawals incur penalties of 20-90% of total funds. Emergency withdrawals after 7 years result in 90% penalty.
              </p>
              <p>
                <strong>4. TECHNICAL RISKS:</strong> Smart contract risks, oracle failures, network issues, and technological failures may result in permanent loss of funds.
              </p>
              <p>
                <strong>5. NO GUARANTEES:</strong> The protocol makes no guarantees regarding inheritance law compliance, tax implications, or legal validity in your jurisdiction.
              </p>
              <p>
                <strong>6. PUBLIC BLOCKCHAIN:</strong> All transactions are recorded on public blockchain and may be permanently visible to anyone.
              </p>
              <p>
                <strong>7. NO INSURANCE:</strong> Funds are not insured by any government agency or private insurance.
              </p>
              <p>
                <strong>8. PROFESSIONAL ADVICE:</strong> You should consult with qualified legal and tax professionals before using this protocol.
              </p>
            </div>
          </div>

          <div className="flex items-start mb-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 mr-3"
              id="legal-agreement-checkbox"
            />
            <label htmlFor="legal-agreement-checkbox" className="text-sm text-gray-700">
              <strong>I acknowledge and agree</strong> that I have read, understood, and accept all the terms and conditions above. I understand this is a legally binding agreement and that I am responsible for all risks associated with using the Sarcophagus Protocol.
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onDecline}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!accepted}
              className={`px-6 py-2 rounded-lg transition-colors ${
                accepted
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
