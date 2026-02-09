import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (!error) {
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      setShowUserMenu(false)
    }
  }

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-xl">🎯</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-white">Checkpoint English</h1>
            </div>
          </Link>

          {/* Desktop Navigation - Only 3 Features */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/conversation-practice" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/conversation-practice') 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🎤</span>
              <span>Speak</span>
            </Link>
            <Link 
              to="/qa-training" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/qa-training') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🚔</span>
              <span>DOT</span>
            </Link>
            <Link 
              to="/highway-rules" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/highway-rules') 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🛣️</span>
              <span>Rules</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl border border-white/10 py-2 z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-sm font-medium text-white truncate">{user?.email}</div>
                      <div className="text-xs text-gray-400 mt-1">Free Account</div>
                    </div>
                    
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>⚙️</span>
                      <span>Settings</span>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25"
                >
                  Start Free
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="space-y-1">
              <Link 
                to="/conversation-practice" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/conversation-practice') 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="text-xl">🎤</span>
                <span>Conversation Practice</span>
              </Link>
              <Link 
                to="/qa-training" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/qa-training') 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="text-xl">🚔</span>
                <span>DOT Practice</span>
              </Link>
              <Link 
                to="/highway-rules" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/highway-rules') 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="text-xl">🛣️</span>
                <span>Highway Rules</span>
              </Link>
              
              {!user && (
                <div className="pt-4 mt-4 border-t border-white/10 space-y-2 px-4">
                  <Link 
                    to="/login" 
                    className="block py-3 text-center text-gray-300 hover:text-white font-medium transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block py-3 text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
