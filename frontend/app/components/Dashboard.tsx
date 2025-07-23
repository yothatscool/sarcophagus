'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'
import { tokenPriceApiService } from '../utils/tokenPriceApi'
import { environmentalApiService } from '../utils/environmentalApi'
import { whoApiService } from '../utils/whoApi'
import QuickStats from './QuickStats'
import NextAction from './NextAction'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'
import WithdrawalManager from './WithdrawalManager'
import DashboardAnalytics from './DashboardAnalytics'

export default function Dashboard() {
  const { account } = useWallet()
  const { 
    isUserVerified, 
    hasSarcophagus, 
    userSarcophagus,
    userBeneficiaries 
  } = useSarcophagusContract()

  // API Data State
  const [tokenPrices, setTokenPrices] = useState<any>(null)
  const [environmentalData, setEnvironmentalData] = useState<any>(null)
  const [whoData, setWhoData] = useState<any>(null)
  const [apiHealth, setApiHealth] = useState<any>({})

  // Load API data on component mount
  useEffect(() => {
    if (account) {
      loadApiData()
    }
  }, [account])

  const loadApiData = async () => {
    try {
      // Load all API data in parallel
      const [prices, carbonData, lifeExpectancy] = await Promise.allSettled([
        tokenPriceApiService.fetchAllTokenPrices(),
        environmentalApiService.getCarbonFootprint('lifestyle', 'Global'),
        whoApiService.fetchLifeExpectancyData('United States')
      ])

      // Set successful results
      if (prices.status === 'fulfilled') setTokenPrices(prices.value)
      if (carbonData.status === 'fulfilled') setEnvironmentalData(carbonData.value)
      if (lifeExpectancy.status === 'fulfilled') setWhoData(lifeExpectancy.value)

    } catch (error) {
      console.error('Error loading API data:', error)
    }
  }

  if (!account) {
    return null // UserJourney will handle unconnected state
  }

  return (
    <div className="dashboard max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Analytics Charts */}
      <DashboardAnalytics />
      {/* API Status Indicator */}
      {Object.values(apiHealth).some((health: any) => !health.available) && (
        <div className="mb-6 p-4 bg-accent-gold/10 border border-accent-gold/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-accent-gold rounded-full animate-pulse shadow-gold"></div>
            <span className="text-accent-gold text-sm font-medium">
              Some data sources are using fallback mode
            </span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between mb-6">
        <QuickStats 
          isUserVerified={isUserVerified}
          hasSarcophagus={hasSarcophagus}
          userSarcophagus={userSarcophagus}
          userBeneficiaries={userBeneficiaries}
        />
      </div>

      {/* Next Action */}
      <NextAction 
        isUserVerified={isUserVerified}
        hasSarcophagus={hasSarcophagus}
        userSarcophagus={userSarcophagus}
      />

      {/* Withdrawal Manager - only show if user has a vault with funds */}
      {hasSarcophagus && userSarcophagus && (
        <WithdrawalManager />
      )}

      {/* Recent Activity */}
      <RecentActivity />

      {/* Quick Actions */}
      <QuickActions 
        isUserVerified={isUserVerified}
        hasSarcophagus={hasSarcophagus}
        userSarcophagus={userSarcophagus}
      />

    </div>
  )
} 