'use client'

import React, { useState, useEffect } from 'react'
import { useContractEvents } from '../hooks/useContractEvents'

interface Activity {
  id: string
  type: 'deposit' | 'claim' | 'reward' | 'verification'
  description: string
  amount?: string
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])

  // Mock recent activities - in real implementation, fetch from contract events
  useEffect(() => {
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'deposit',
        description: 'Deposited 10 VET to vault',
        amount: '10 VET',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'completed'
      },
      {
        id: '2',
        type: 'reward',
        description: 'Earned OBOL rewards',
        amount: '5.2 OBOL',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'completed'
      },
      {
        id: '3',
        type: 'verification',
        description: 'User verification completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        status: 'completed'
      }
    ]
    setActivities(mockActivities)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰'
      case 'claim': return '🎁'
      case 'reward': return '⭐'
      case 'verification': return '✅'
      default: return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="text-xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-xs text-purple-400">{activity.amount}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-xs ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </p>
                  <p className="text-xs text-gray-400">
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