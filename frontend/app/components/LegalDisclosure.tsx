'use client'

import React, { useState } from 'react'

interface LegalDisclosureProps {
  onAccept: () => void
  onDecline: () => void
  userAddress: string
}

export default function LegalDisclosure({ onAccept, onDecline, userAddress }: LegalDisclosureProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [acceptedRisks, setAcceptedRisks] = useState(false)
  const [acceptedLegal, setAcceptedLegal] = useState(false)
  const [acceptedTax, setAcceptedTax] = useState(false)

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedRisks && acceptedLegal && acceptedTax

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="text-red-600 text-3xl mr-3">⚖️</div>
            <h2 className="text-2xl font-bold text-red-600">LEGAL DISCLOSURE & AGREEMENT</h2>
          </div>

          <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-red-800 font-medium">
              <strong>IMPORTANT:</strong> This is a legally binding agreement. By accepting these terms, you acknowledge that you have read, understood, and agree to be bound by all provisions.
            </p>
          </div>

          <div className="space-y-6">
            {/* Terms of Service */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-lg mb-2">Terms of Service Agreement</h3>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. IRREVOCABLE COMMITMENT:</strong> By using the Sarcophagus Protocol, you acknowledge that funds deposited are irrevocably locked for a minimum of 7 years with no exceptions for any circumstances including medical emergencies, financial hardship, or legal proceedings.
                    </p>
                    <p className="mb-2">
                      <strong>2. DEATH-TRIGGERED RELEASE:</strong> Funds are only released upon verified death through oracle confirmation. This is not a savings account, investment vehicle, or emergency fund.
                    </p>
                    <p className="mb-2">
                      <strong>3. SEVERE PENALTIES:</strong> Early withdrawals incur penalties of 20-90% of total funds. Emergency withdrawals after 7 years result in 90% penalty.
                    </p>
                    <p className="mb-2">
                      <strong>4. NO GUARANTEES:</strong> The protocol makes no guarantees regarding inheritance law compliance, tax implications, or legal validity in your jurisdiction.
                    </p>
                    <p className="mb-2">
                      <strong>5. TECHNICAL RISKS:</strong> Smart contract risks, oracle failures, network issues, and technological failures may result in permanent loss of funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-lg mb-2">Privacy Policy & Data Handling</h3>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. PUBLIC BLOCKCHAIN:</strong> All transactions are recorded on public blockchain and may be permanently visible to anyone.
                    </p>
                    <p className="mb-2">
                      <strong>2. DEATH VERIFICATION:</strong> Death verification requires sharing personal information with oracles and may involve third-party verification services.
                    </p>
                    <p className="mb-2">
                      <strong>3. BENEFICIARY INFORMATION:</strong> Beneficiary addresses and inheritance percentages are stored on-chain and publicly visible.
                    </p>
                    <p className="mb-2">
                      <strong>4. NO ANONYMITY:</strong> This protocol is not anonymous. Your identity may be linked to your vault through various means.
                    </p>
                    <p className="mb-2">
                      <strong>5. DATA RETENTION:</strong> Information may be retained indefinitely on blockchain and by third-party services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Disclosure */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptedRisks}
                  onChange={(e) => setAcceptedRisks(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-lg mb-2">Comprehensive Risk Disclosure</h3>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. PERMANENT LOSS:</strong> Funds may be permanently lost due to smart contract bugs, oracle failures, or technological issues.
                    </p>
                    <p className="mb-2">
                      <strong>2. REGULATORY RISKS:</strong> Changes in laws or regulations may affect the legality or functionality of the protocol.
                    </p>
                    <p className="mb-2">
                      <strong>3. INHERITANCE LAW RISKS:</strong> The protocol may not comply with inheritance laws in your jurisdiction.
                    </p>
                    <p className="mb-2">
                      <strong>4. TAX IMPLICATIONS:</strong> Use of this protocol may have significant tax consequences that you are responsible for understanding.
                    </p>
                    <p className="mb-2">
                      <strong>5. BENEFICIARY RISKS:</strong> Beneficiaries may be unable to claim funds due to technical, legal, or regulatory issues.
                    </p>
                    <p className="mb-2">
                      <strong>6. NO INSURANCE:</strong> Funds are not insured by any government agency or private insurance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptedLegal}
                  onChange={(e) => setAcceptedLegal(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-lg mb-2">Legal Disclaimer & Professional Advice</h3>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. NOT LEGAL ADVICE:</strong> This protocol does not constitute legal advice. You should consult with qualified legal professionals.
                    </p>
                    <p className="mb-2">
                      <strong>2. JURISDICTION SPECIFIC:</strong> Inheritance laws vary by jurisdiction. This protocol may not be valid in your location.
                    </p>
                    <p className="mb-2">
                      <strong>3. ESTATE PLANNING:</strong> This protocol may conflict with existing estate plans or wills. Professional review is required.
                    </p>
                    <p className="mb-2">
                      <strong>4. NO WARRANTIES:</strong> The protocol is provided "as is" without any warranties regarding legality or effectiveness.
                    </p>
                    <p className="mb-2">
                      <strong>5. LIABILITY LIMITATION:</strong> The protocol developers and operators disclaim all liability for any damages or losses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Implications */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptedTax}
                  onChange={(e) => setAcceptedTax(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <div>
                  <h3 className="font-bold text-lg mb-2">Tax Implications & Responsibilities</h3>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. TAX CONSULTATION:</strong> You are responsible for consulting with qualified tax professionals regarding all tax implications.
                    </p>
                    <p className="mb-2">
                      <strong>2. INHERITANCE TAXES:</strong> Beneficiaries may be subject to inheritance, estate, or gift taxes depending on jurisdiction.
                    </p>
                    <p className="mb-2">
                      <strong>3. CAPITAL GAINS:</strong> Token appreciation may result in capital gains taxes for beneficiaries.
                    </p>
                    <p className="mb-2">
                      <strong>4. REPORTING REQUIREMENTS:</strong> You are responsible for all tax reporting requirements in your jurisdiction.
                    </p>
                    <p className="mb-2">
                      <strong>5. NO TAX ADVICE:</strong> The protocol does not provide tax advice and makes no representations about tax consequences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Warning */}
          <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 rounded-lg">
            <h3 className="font-bold text-red-800 text-lg mb-2">
              🚨 FINAL ACKNOWLEDGMENT
            </h3>
            <p className="text-red-700 text-sm">
              <strong>By accepting these terms, you acknowledge that:</strong><br/>
              • You have read and understood all disclosures<br/>
              • You have consulted or will consult with legal and tax professionals<br/>
              • You accept all risks associated with using this protocol<br/>
              • You understand this is a legally binding agreement<br/>
              • You are making an irrevocable commitment with severe penalties
            </p>
          </div>

          {/* User Address Display */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Wallet Address:</strong> {userAddress}<br/>
              <strong>Date:</strong> {new Date().toLocaleDateString()}<br/>
              <strong>Time:</strong> {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={onDecline}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600"
            >
              DECLINE - I Do Not Agree
            </button>
            <button
              onClick={onAccept}
              disabled={!allAccepted}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              I ACCEPT ALL TERMS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 