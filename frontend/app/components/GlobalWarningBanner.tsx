'use client'

import React, { useState } from 'react'

export default function GlobalWarningBanner() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-xl mr-3">⚠️</div>
              <div>
                <p className="font-medium">
                  <strong>WARNING:</strong> This is an irrevocable inheritance protocol with 7-year locks and severe penalties
                </p>
                {isExpanded && (
                  <div className="mt-2 text-sm">
                    <p>• No withdrawals for 7 years • 90% penalty for emergency withdrawals • Funds only released upon death • Consult legal/financial advisors</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-red-100"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 