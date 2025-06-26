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

export default function Dashboard() {
  const { isConnected, account } = useWallet()
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
    if (isConnected && account) {
      loadApiData()
    }
  }, [isConnected, account])

  const loadApiData = async () => {
    try {
      // Load all API data in parallel
      const [prices, carbonData, lifeExpectancy, health] = await Promise.allSettled([
        tokenPriceApiService.fetchAllTokenPrices(),
        environmentalApiService.getCarbonFootprint('lifestyle', 'Global'),
        whoApiService.fetchLifeExpectancyData('United States'),
        checkApiHealth()
      ])

      // Set successful results
      if (prices.status === 'fulfilled') setTokenPrices(prices.value)
      if (carbonData.status === 'fulfilled') setEnvironmentalData(carbonData.value)
      if (lifeExpectancy.status === 'fulfilled') setWhoData(lifeExpectancy.value)
      if (health.status === 'fulfilled') setApiHealth(health.value)

    } catch (error) {
      console.error('Error loading API data:', error)
    }
  }

  const checkApiHealth = async () => {
    const [tokenHealth, environmentalHealth, whoHealth] = await Promise.allSettled([
      tokenPriceApiService.checkApiHealth(),
      environmentalApiService.checkApiHealth?.() || Promise.resolve({ available: true }),
      whoApiService.checkApiHealth()
    ])

    return {
      tokenPrices: tokenHealth.status === 'fulfilled' ? tokenHealth.value : { available: false },
      environmental: environmentalHealth.status === 'fulfilled' ? environmentalHealth.value : { available: false },
      who: whoHealth.status === 'fulfilled' ? whoHealth.value : { available: false }
    }
  }

  if (!isConnected) {
    return null // UserJourney will handle unconnected state
  }

  return (
    <div className="dashboard max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* API Status Indicator */}
      {Object.values(apiHealth).some((health: any) => !health.available) && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-400 text-sm">
              Some data sources are using fallback mode
            </span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <QuickStats 
        isUserVerified={isUserVerified}
        hasSarcophagus={hasSarcophagus}
        userSarcophagus={userSarcophagus}
        userBeneficiaries={userBeneficiaries}
        tokenPrices={tokenPrices}
        environmentalData={environmentalData}
        whoData={whoData}
      />

      {/* Next Action */}
      <NextAction 
        isUserVerified={isUserVerified}
        hasSarcophagus={hasSarcophagus}
        userSarcophagus={userSarcophagus}
        environmentalData={environmentalData}
      />

      {/* Recent Activity */}
      <RecentActivity />

      {/* Quick Actions */}
      <QuickActions 
        isUserVerified={isUserVerified}
        hasSarcophagus={hasSarcophagus}
        userSarcophagus={userSarcophagus}
        tokenPrices={tokenPrices}
      />
    </div>
  )
} 