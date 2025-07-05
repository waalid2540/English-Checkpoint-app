import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const EmergencyPremiumActivation: React.FC = () => {
  const { user } = useAuth()
  const [activated, setActivated] = useState(false)

  const handleActivation = () => {
    // Emergency activation for paid users
    localStorage.setItem('user_premium_status', 'true')
    setActivated(true)
    // Reload page to refresh subscription status
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  // Only show if user is logged in and hasn't activated yet
  if (!user || activated || localStorage.getItem('user_premium_status') === 'true') {
    return null
  }

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-red-50 border border-red-200 rounded-xl shadow-lg z-50 p-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg">⚠️</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-900 text-sm">
            Payment Issue Fix
          </h3>
          <p className="text-red-700 text-xs mt-1">
            If you just paid and don't have access yet, click below to activate your premium features:
          </p>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleActivation}
              className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
            >
              Activate Premium
            </button>
          </div>
          
          <p className="text-xs text-red-500 mt-2">
            This is a temporary fix while we resolve payment processing issues.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmergencyPremiumActivation