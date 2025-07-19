'use client'

import React, { useState, useEffect } from 'react'
import { useContractEvents } from '../hooks/useContractEvents'

interface Activity {
  id: string
  type: 'deposit' | 'claim' | 'reward' | 'verification' | 'vault_creation' | 'beneficiary_update' | 'funds_added'
  description: string
  amount?: string
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}

interface UserData {
  isVerified: boolean;
  hasSarcophagus: boolean;
  userSarcophagus: any;
  userBeneficiaries: any[];
  obolRewards: string;
}

interface RecentActivityProps {
  userData?: UserData;
}

export default function RecentActivity({ userData }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])

  // Generate activities based on user data
  useEffect(() => {
    const newActivities: Activity[] = []
    
    if (userData?.isVerified) {
      newActivities.push({
        id: 'verification',
        type: 'verification',
        description: 'User verification completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'completed'
      })
    }
    
    if (userData?.hasSarcophagus && userData?.userSarcophagus) {
      newActivities.push({
        id: 'vault_creation',
        type: 'vault_creation',
        description: 'Sarcophagus vault created',
        amount: `${(Number(userData.userSarcophagus.vetAmount) / 1e18).toFixed(2)} VET`,
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        status: 'completed'
      })
      
      // Add beneficiary activity if there are beneficiaries
      if (userData.userBeneficiaries.length > 0) {
        newActivities.push({
          id: 'beneficiaries',
          type: 'beneficiary_update',
          description: `Added ${userData.userBeneficiaries.length} beneficiaries`,
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          status: 'completed'
        })
      }
      
      // Add OBOL rewards activity
      if (userData.obolRewards && Number(userData.obolRewards) > 0) {
        newActivities.push({
          id: 'rewards',
          type: 'reward',
          description: 'Earned OBOL rewards',
          amount: `${(Number(userData.obolRewards) / 1e18).toFixed(2)} OBOL`,
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
          status: 'completed'
        })
      }
    }
    
    // Sort by timestamp (newest first)
    newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    setActivities(newActivities)
  }, [userData])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰'
      case 'claim': return '🎁'
      case 'reward': return '⭐'
      case 'verification': return '✅'
      case 'vault_creation': return '🏛️'
      case 'beneficiary_update': return '👥'
      case 'funds_added': return '💎'
      default: return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-vechain-green'
      case 'pending': return 'text-accent-gold'
      case 'failed': return 'text-red-400'
      default: return 'text-text-muted'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-accent-gold">Recent Activity</h3>
      <div className="bg-background-card/50 backdrop-blur-sm border border-accent-gold/30 rounded-xl p-4 shadow-sarcophagus">
        {activities.length === 0 ? (
          <p className="text-text-muted text-center py-8 font-body">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-primary-blue/20 rounded-lg border border-accent-gold/20 hover:border-accent-gold/40 transition-colors duration-200">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary font-body">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-xs text-accent-gold font-medium">{activity.amount}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </p>
                  <p className="text-xs text-text-muted font-body">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 