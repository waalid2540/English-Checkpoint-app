import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out...')
      const { error } = await signOut()
      if (error) {
        console.error('❌ Sign out error:', error)
        alert('Error signing out: ' + error.message)
      } else {
        console.log('✅ Successfully signed out')
        // Force redirect to home page
        window.location.href = '/'
      }
    } catch (err) {
      console.error('❌ Sign out error:', err)
      alert('Error signing out')
    } finally {
      setShowUserMenu(false)
    }
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🚛</span>
            </div>
            <div>
              <h1 className="font-bold text-xl gradient-text">English Checkpoint</h1>
              <p className="text-xs text-gray-500">Truck Driver Edition</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/qa-training" 
              className={`nav-link ${isActive('/qa-training') ? 'active' : ''}`}
            >
              DOT Practice
            </Link>
            <Link 
              to="/pronunciation-trainer" 
              className={`nav-link ${isActive('/pronunciation-trainer') ? 'active' : ''}`}
            >
              🎯 Pronunciation
            </Link>
            <Link 
              to="/speed-quiz" 
              className={`nav-link ${isActive('/speed-quiz') ? 'active' : ''}`}
            >
              ⚡ Speed Quiz
            </Link>
            <Link 
              to="/settings" 
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || '👤'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <div className="text-xs text-gray-500">Truck Driver</div>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  ⚙️ Settings
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar