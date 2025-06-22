import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ResendConfirmation = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const { resendConfirmation } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await resendConfirmation(email)
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Confirmation email has been sent! Please check your inbox.')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Resend confirmation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">📧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Resend Confirmation</h1>
          <p className="text-gray-600 mt-2">Get a new confirmation email</p>
        </div>

        {/* Resend Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {message}
                <div className="mt-2">
                  <Link to="/login" className="text-green-600 hover:text-green-800 underline">
                    Go to Sign In
                  </Link>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder="Enter your email address"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the email address you used to sign up
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Confirmation...</span>
                </div>
              ) : (
                'Resend Confirmation Email'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-gray-600">
              Already confirmed?{' '}
              <Link to="/login" className="text-yellow-600 hover:text-yellow-800 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-gray-600">
              Need to change email?{' '}
              <Link to="/signup" className="text-yellow-600 hover:text-yellow-800 font-semibold hover:underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>🚛 English Checkpoint - Empowering Truck Drivers</p>
        </div>
      </div>
    </div>
  )
}

export default ResendConfirmation