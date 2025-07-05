import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const subscription = useSubscription()

  useEffect(() => {
    // Redirect to home after a few seconds to show the success message
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-white text-3xl">✅</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">
            Welcome to Premium! 🎉
          </p>
        </div>

        {/* Loading Status */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Activating your premium features...</span>
          </div>
          
          {subscription.isPremium ? (
            <div className="text-green-600 font-semibold">
              ✅ Premium access activated!
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              This may take a few moments to process.
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4">What's unlocked:</h3>
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Unlimited DOT practice questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Advanced pronunciation training</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">All speed quiz difficulties</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Complete highway rules content</span>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Redirecting you to the app in a few seconds...
        </p>
      </div>
    </div>
  )
}

export default PaymentSuccess