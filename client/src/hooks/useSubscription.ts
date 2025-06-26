import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface SubscriptionStatus {
  isPremium: boolean
  trialDaysLeft: number
  dailyUsage: number
  dailyLimit: number
  subscriptionId?: string
  loading: boolean
}

export const useSubscription = (): SubscriptionStatus => {
  const { user } = useAuth()
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    trialDaysLeft: 0,
    dailyUsage: 0,
    dailyLimit: 3, // Free users get 3 conversations per day
    loading: true
  })

  useEffect(() => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }))
      return
    }

    checkSubscriptionStatus()
  }, [user])

  const checkSubscriptionStatus = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'
      
      const response = await fetch(`${API_BASE_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatus({
          isPremium: data.isPremium || false,
          trialDaysLeft: data.trialDaysLeft || 0,
          dailyUsage: data.dailyUsage || 0,
          dailyLimit: data.isPremium ? 999 : 3,
          subscriptionId: data.subscriptionId,
          loading: false
        })
      } else {
        // Default to free user
        setStatus(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Subscription check error:', error)
      setStatus(prev => ({ ...prev, loading: false }))
    }
  }

  return status
}