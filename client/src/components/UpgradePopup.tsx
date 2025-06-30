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
      
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📡 Response data:', data)
      
      if (data.url) {
        console.log('✅ Redirecting to Stripe:', data.url)
        window.location.href = data.url
      } else {
        console.error('❌ No URL in response:', data)
        alert(`Error: ${data.error || 'No checkout URL received'}`)
      }
    } catch (err) {
      console.error('❌ Stripe error:', err)
      alert(`Error starting checkout: ${err.message}`)
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl transform transition-all">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💎</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
            <p className="text-blue-100 text-lg">{content.subtitle}</p>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-yellow-300/20 rounded-full animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-600 text-center mb-6 text-lg">
            {content.description}
          </p>

          {/* Features List */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4 text-center">🎉 Premium Includes:</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Unlimited AI conversations</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">All 198 DOT practice questions</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Advanced voice features</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-800 mb-1">$9.99<span className="text-lg text-gray-500">/month</span></div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold inline-block">
              🎁 7-Day FREE Trial
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting Trial...</span>
                </div>
              ) : (
                '🚀 Start 7-Day FREE Trial'
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              Maybe Later
            </button>
          </div>

          {/* Fine print */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Cancel anytime during trial. No commitment required.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpgradePopup