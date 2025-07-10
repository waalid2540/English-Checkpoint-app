import React, { useState, useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const { signIn, user } = useAuth()
  const location = useLocation()

  // Get the intended destination from navigation state
  const from = location.state?.from || '/'

  // Check for email confirmation success
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('confirmed') === 'true') {
      setMessage('✅ Email confirmed successfully! You can now sign in with your account.')
    }
  }, [location])

  // Redirect if already logged in
  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          setError('')
          setMessage('EMAIL_NOT_CONFIRMED') // Special flag for prominent display
        } else {
          setError(error.message)
        }
      } else {
        setMessage('Successfully signed in!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">🚛</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Checkpoint English account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
                {message && (
                  <div className="mt-2">
                    <span>{message}</span>
                    <Link to="/resend-confirmation" className="text-red-600 hover:text-red-800 underline ml-1">
                      Resend confirmation email
                    </Link>
                  </div>
                )}
              </div>
            )}

            {message && !error && message !== 'EMAIL_NOT_CONFIRMED' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            {message === 'EMAIL_NOT_CONFIRMED' && (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-xl shadow-lg border-2 border-white">
                <div className="text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold mb-3">Email Not Confirmed!</h3>
                  <div className="bg-white/20 rounded-lg p-4 mb-4">
                    <p className="text-lg font-semibold mb-2">
                      🚨 You must confirm your email first!
                    </p>
                    <p className="text-sm mb-2">
                      Check your email inbox for <strong>{email}</strong>
                    </p>
                    <p className="text-sm">
                      Click the confirmation link to activate your account
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold">
                      📧 Check your email (including spam folder)
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p>• Look for email from "Checkpoint English"</p>
                      <p>• Click the "Confirm your mail" link</p>
                      <p>• Then come back here to sign in</p>
                    </div>
                    
                    <div className="flex gap-3 justify-center mt-4">
                      <Link 
                        to="/resend-confirmation" 
                        className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                      >
                        📧 Resend Email
                      </Link>
                      <button
                        onClick={() => setMessage('')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>🚛 Checkpoint English - Empowering Truck Drivers</p>
        </div>
      </div>
    </div>
  )
}

export default Login