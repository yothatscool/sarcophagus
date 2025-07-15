'use client'

import React from 'react'

interface QuickStatsProps {
  isUserVerified: boolean
  hasSarcophagus: boolean
  userSarcophagus: any
  userBeneficiaries: any[]
  obolRewards?: string
  tokenPrices?: any
  environmentalData?: any
  whoData?: any
}

export default function QuickStats({ 
  isUserVerified, 
  hasSarcophagus, 
  userSarcophagus, 
  userBeneficiaries,
  obolRewards,
  tokenPrices,
  environmentalData,
  whoData
}: QuickStatsProps) {
  const getTotalValueLocked = () => {
    if (!userSarcophagus) return '0'
    const vetAmount = Number(userSarcophagus.vetAmount) / 1e18
    const vthoAmount = Number(userSarcophagus.vthoAmount) / 1e18
    const b3trAmount = Number(userSarcophagus.b3trAmount) / 1e18
    return (vetAmount + vthoAmount + b3trAmount).toFixed(2)
  }

  const getStatusColor = () => {
    if (!isUserVerified) return 'text-red-400'
    if (!hasSarcophagus) return 'text-accent-gold'
    return 'text-vechain-green'
  }

  const getStatusText = () => {
    if (!isUserVerified) return 'Not Verified'
    if (!hasSarcophagus) return 'No Vault'
    return 'Active'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Status Card */}
      <div className="info-card bg-primary-blue/20 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-6 hover:border-accent-gold/50 transition-all duration-300 shadow-sarcophagus hover:shadow-gold">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300 font-medium">Status</p>
            <p className={`text-2xl font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor().replace('text-', 'bg-')} shadow-gold`}></div>
        </div>
      </div>

      {/* TVL Card */}
      <div className="info-card bg-primary-blue/20 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-6 hover:border-accent-gold/50 transition-all duration-300 shadow-sarcophagus hover:shadow-gold">
        <p className="text-sm text-gray-300 font-medium">Total Value Locked</p>
        <p className="text-2xl font-bold text-accent-gold">
          {getTotalValueLocked()} VET
        </p>
      </div>

      {/* Beneficiaries Card */}
      <div className="info-card bg-primary-blue/20 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-6 hover:border-accent-gold/50 transition-all duration-300 shadow-sarcophagus hover:shadow-gold">
        <p className="text-sm text-gray-300 font-medium">Beneficiaries</p>
        <p className="text-2xl font-bold text-vechain-green">
          {userBeneficiaries?.length || 0}
        </p>
      </div>

      {/* Rewards Card */}
      <div className="info-card bg-primary-blue/20 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-6 hover:border-accent-gold/50 transition-all duration-300 shadow-sarcophagus hover:shadow-gold">
        <p className="text-sm text-gray-300 font-medium">Pending Rewards</p>
        <p className="text-2xl font-bold text-accent-gold">
          {obolRewards ? 
            (Number(obolRewards) / 1e18).toFixed(2) : '0'} OBOL
        </p>
      </div>

      {/* Token Prices Card */}
      {tokenPrices && (
        <div className="info-card bg-primary-blue/20 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-6 hover:border-accent-gold/50 transition-all duration-300 shadow-sarcophagus hover:shadow-gold col-span-1 md:col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-300 font-medium">Token Prices (USD)</p>
          <div className="text-xs text-accent-gold space-y-1 mt-2">
            <div>VET: ${tokenPrices.vet?.current_price ?? 'N/A'}</div>
            <div>VTHO: ${tokenPrices.vtho?.current_price ?? 'N/A'}</div>
            <div>B3TR: ${tokenPrices.b3tr?.current_price ?? 'N/A'}</div>
            <div>OBOL: ${tokenPrices.obol?.current_price ?? 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Carbon Footprint Card */}
      {environmentalData && (
        <div className="info-card bg-primary-blue/20 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-6 hover:border-accent-gold/50 transition-all duration-300 shadow-sarcophagus hover:shadow-gold col-span-1 md:col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-300 font-medium">Carbon Footprint</p>
          <div className="text-2xl font-bold text-vechain-green mt-2">
            {environmentalData.carbonOutput} {environmentalData.unit}
          </div>
        </div>
      )}

      {/* Life Expectancy Card */}
      {whoData && (
        <div className="info-card bg-primary-blue/20 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-6 hover:border-accent-gold/50 transition-all duration-300 shadow-sarcophagus hover:shadow-gold col-span-1 md:col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-300 font-medium">Life Expectancy (WHO)</p>
          <div className="text-xs text-accent-gold mt-2">
            <div>Male: {whoData.male ?? 'N/A'} yrs</div>
            <div>Female: {whoData.female ?? 'N/A'} yrs</div>
            <div>Source: {whoData.source ?? 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  )
} 