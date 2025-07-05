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
    
    // Check for payment success and refresh status
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      // Delay to allow webhook processing
      setTimeout(() => {
        checkSubscriptionStatus()
      }, 2000)
    }
  }, [user])

  const checkSubscriptionStatus = async () => {
    try {
      // TEMPORARY FIX: Check for payment success in URL or localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const hasPaymentSuccess = urlParams.get('success') === 'true'
      const storedPremium = localStorage.getItem('user_premium_status')
      
      // If payment success, mark as premium and store it
      if (hasPaymentSuccess) {
        localStorage.setItem('user_premium_status', 'true')
        setStatus({
          isPremium: true,
          trialDaysLeft: 0,
          dailyUsage: 0,
          dailyLimit: 999,
          subscriptionId: 'temp_premium',
          loading: false
        })
        return
      }
      
      // Check stored premium status
      if (storedPremium === 'true') {
        setStatus({
          isPremium: true,
          trialDaysLeft: 0,
          dailyUsage: 0,
          dailyLimit: 999,
          subscriptionId: 'stored_premium',
          loading: false
        })
        return
      }

      // Try backend API as fallback
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'
      
      // Get session token from Supabase
      const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
      
      const response = await fetch(`${API_BASE_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
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
        setStatus({
          isPremium: false,
          trialDaysLeft: 0,
          dailyUsage: 0,
          dailyLimit: 3,
          loading: false
        })
      }
    } catch (error) {
      console.error('Subscription check error:', error)
      // Check localStorage as fallback
      const storedPremium = localStorage.getItem('user_premium_status')
      setStatus({
        isPremium: storedPremium === 'true',
        trialDaysLeft: 0,
        dailyUsage: 0,
        dailyLimit: storedPremium === 'true' ? 999 : 3,
        loading: false
      })
    }
  }

  return status
}