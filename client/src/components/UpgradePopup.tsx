import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface UpgradePopupProps {
  isOpen: boolean
  onClose: () => void
  trigger: 'daily_limit' | 'dot_questions' | 'premium_feature'
  triggerText?: string
}

const UpgradePopup: React.FC<UpgradePopupProps> = ({ 
  isOpen, 
  onClose, 
  trigger, 
  triggerText 
}) => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'

  const handleUpgrade = async () => {
    console.log('🚀 Starting upgrade process...')
    setLoading(true)
    
    try {
      // Get auth session
      const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
      console.log('✅ Got auth session:', !!session)
      
      const requestData = {
        priceId: 'price_1RcfPeI4BWGkGyQalTvXi4RP',
        successUrl: `${window.location.origin}${window.location.pathname}?success=true`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?canceled=true`
      }
      
      console.log('📡 Making Stripe request to:', `${API_BASE_URL}/api/stripe/create-checkout-session`)
      console.log('📡 Request data:', requestData)
      console.log('📡 Auth token:', session?.access_token ? 'Present' : 'Missing')
      
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP Error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('📡 Response data:', data)
      
      if (data.url) {
        console.log('✅ Redirecting to Stripe:', data.url)
        // Use window.open as fallback if direct redirect fails
        const opened = window.open(data.url, '_blank')
        if (!opened) {
          window.location.href = data.url
        }
      } else {
        console.error('❌ No URL in response:', data)
        alert(`Error: ${data.error || 'No checkout URL received'}`)
      }
    } catch (err) {
      console.error('❌ Stripe error:', err)
      alert(`Error starting checkout: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getTriggerContent = () => {
    switch (trigger) {
      case 'daily_limit':
        return {
          title: "🚀 Daily Limit Reached!",
          subtitle: "You've used all your free conversations today",
          description: "Upgrade to Premium for unlimited access to all features!"
        }
      case 'dot_questions':
        return {
          title: "🔒 Unlock All DOT Questions!",
          subtitle: "You've completed the 10 free questions",
          description: "Get access to all 188 remaining questions plus unlimited features!"
        }
      case 'premium_feature':
        return {
          title: "⭐ Premium Feature",
          subtitle: triggerText || "This feature requires Premium access",
          description: "Upgrade now to unlock all advanced features and unlimited usage!"
        }
      default:
        return {
          title: "🚀 Upgrade to Premium",
          subtitle: "Unlock the full potential",
          description: "Get unlimited access to all features!"
        }
    }
  }

  const content = getTriggerContent()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 my-8 overflow-hidden shadow-2xl transform transition-all">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💎</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{content.title}</h2>
            <p className="text-blue-100 text-base">{content.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-4 text-base">
            {content.description}
          </p>

          {/* Features List */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 text-center text-sm">🎉 Premium Includes:</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 text-sm">Unlimited AI conversations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 text-sm">All 198 DOT practice questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 text-sm">Advanced voice features</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 text-sm">Priority support</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-800 mb-1">$9.99<span className="text-base text-gray-500">/month</span></div>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
              🚀 Instant Access
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                '💳 Upgrade Now - $9.99/month'
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
            >
              Maybe Later
            </button>
          </div>

          {/* Fine print */}
          <p className="text-xs text-gray-400 text-center mt-3">
            Cancel anytime. Immediate access to all features.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpgradePopup