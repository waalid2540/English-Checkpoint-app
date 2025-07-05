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
    
    // Check for payment success and start polling
    const urlParams = new URLSearchParams(window.location.search)
    const isPaymentSuccess = urlParams.get('success') === 'true'
    const isPaymentSuccessPage = window.location.pathname === '/payment-success'
    
    if (isPaymentSuccess || isPaymentSuccessPage) {
      console.log('🎉 Payment success detected, starting subscription polling...')
      
      // Initial delay then poll every 3 seconds for up to 30 seconds
      setTimeout(() => {
        let pollAttempts = 0
        const maxPollAttempts = 10 // 30 seconds total
        
        const pollSubscription = setInterval(async () => {
          pollAttempts++
          console.log(`🔄 Polling subscription status (attempt ${pollAttempts}/${maxPollAttempts})`)
          
          try {
            await checkSubscriptionStatus()
          } catch (error) {
            console.error('Error during subscription polling:', error)
          }
          
          // Stop polling after max attempts
          if (pollAttempts >= maxPollAttempts) {
            console.log('⏰ Polling complete - if still no access, contact support')
            clearInterval(pollSubscription)
          }
        }, 3000)
        
        // Cleanup after polling period
        setTimeout(() => {
          clearInterval(pollSubscription)
        }, 35000) // 35 seconds total timeout
      }, 2000) // Initial 2 second delay for webhook processing
    }
  }, [user])

  const checkSubscriptionStatus = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'
      
      // Get session token from Supabase
      const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
      
      if (!session?.access_token) {
        console.log('No auth session found')
        setStatus(prev => ({ ...prev, loading: false, isPremium: false }))
        return
      }
      
      console.log('Checking subscription status for user:', session.user.email)
      
      const response = await fetch(`${API_BASE_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Subscription API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Subscription data received:', data)
        setStatus({
          isPremium: data.isPremium || false,
          trialDaysLeft: data.trialDaysLeft || 0,
          dailyUsage: data.dailyUsage || 0,
          dailyLimit: data.isPremium ? 999 : 3,
          subscriptionId: data.subscriptionId,
          loading: false
        })
      } else {
        const errorText = await response.text()
        console.error('Subscription API error:', response.status, errorText)
        // Default to free user on API error
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
      setStatus({
        isPremium: false,
        trialDaysLeft: 0,
        dailyUsage: 0,
        dailyLimit: 3,
        loading: false
      })
    }
  }

  return status
}