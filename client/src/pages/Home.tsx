import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import InstallPrompt from '../components/InstallPrompt'

const Home = () => {
  const { user } = useAuth()
  const subscription = useSubscription()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isSuccess = urlParams.get('success') === 'true'
    const isAutoActivate = urlParams.get('auto_activate') === 'true'
    
    if (isSuccess) {
      setShowSuccessMessage(true)
      
      if (isAutoActivate && user) {
        autoActivatePremium()
        return
      }
      
      window.history.replaceState({}, document.title, window.location.pathname)
      setTimeout(() => window.location.reload(), 1000)
      setTimeout(() => setShowSuccessMessage(false), 8000)
    }
  }, [user])

  const autoActivatePremium = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'
      const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
      
      const response = await fetch(`${API_BASE_URL}/api/subscription/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        alert('🎉 Premium access activated!')
        window.history.replaceState({}, document.title, window.location.pathname)
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (error) {
      console.error('Activation error:', error)
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-6 rounded-xl shadow-2xl z-50 max-w-sm animate-bounce">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="font-bold text-lg">Premium Activated!</h3>
              <p className="text-sm opacity-90">Unlimited access unlocked!</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-6">
              <span className="text-5xl">🎯</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
            Master English
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              With AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            Practice real conversations, pass DOT inspections, and speak confidently. 
            <span className="text-white font-semibold"> Powered by AI.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/conversation-practice"
              className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🎤</span>
              Start Speaking
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            {!user && (
              <Link
                to="/signup"
                className="px-10 py-5 bg-white/10 backdrop-blur text-white text-xl font-bold rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Create Free Account
              </Link>
            )}
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-2xl">✓</span>
              <span>9,000+ TikTok Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-2xl">✓</span>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-2xl">✓</span>
              <span>Voice Recognition</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 3 Core Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            3 Powerful Features
          </h2>
          <p className="text-xl text-blue-200 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to speak English confidently. Nothing more, nothing less.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Conversation Practice */}
            <Link 
              to="/conversation-practice"
              className="group relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur border border-orange-500/30 rounded-3xl p-8 hover:border-orange-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
            >
              <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-4xl">🎤</span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Conversation Practice</h3>
              
              <p className="text-blue-200 mb-6 leading-relaxed">
                Talk with AI in real scenarios. Practice job interviews, phone calls, everyday conversations, and more. The AI listens and responds naturally.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> Voice recognition
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> AI conversations
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> Multiple scenarios
                </li>
              </ul>
              
              <div className="flex items-center text-orange-400 font-semibold group-hover:text-orange-300">
                Start Talking
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>

            {/* Feature 2: DOT Practice */}
            <Link 
              to="/qa-training"
              className="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur border border-blue-500/30 rounded-3xl p-8 hover:border-blue-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-4xl">🚔</span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">DOT Practice</h3>
              
              <p className="text-blue-200 mb-6 leading-relaxed">
                Master 200+ real DOT checkpoint questions. Learn exactly what officers ask and how to respond with confidence. Audio included.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> 200+ questions
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> Real scenarios
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> Audio training
                </li>
              </ul>
              
              <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300">
                Start Practice
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>

            {/* Feature 3: Highway Rules */}
            <Link 
              to="/highway-rules"
              className="group relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur border border-green-500/30 rounded-3xl p-8 hover:border-green-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-4xl">🛣️</span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Highway Rules</h3>
              
              <p className="text-blue-200 mb-6 leading-relaxed">
                Learn road signs and highway rules with interactive lessons. Essential knowledge for safe driving and DOT compliance.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> Road signs
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> Interactive lessons
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-green-400">✓</span> DOT compliance
                </li>
              </ul>
              
              <div className="flex items-center text-green-400 font-semibold group-hover:text-green-300">
                Learn Rules
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-black/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Choose a Scenario</h3>
              <p className="text-blue-200">Pick what you want to practice - job interview, phone call, or casual conversation</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Speak Naturally</h3>
              <p className="text-blue-200">Talk to the AI like a real person. It listens and responds in real-time</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Better</h3>
              <p className="text-blue-200">Practice anytime, anywhere. Your confidence will grow with every session</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Speak Confidently?
          </h2>
          <p className="text-xl text-blue-200 mb-12">
            Join thousands who improved their English with AI-powered practice
          </p>
          
          <Link
            to="/conversation-practice"
            className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300"
          >
            <span className="text-3xl">🎤</span>
            Start Free Practice
          </Link>
          
          <p className="text-blue-300 mt-6 text-sm">
            No credit card required • Start in 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <span className="text-white font-bold text-lg">Checkpoint English</span>
          </div>
          
          <div className="flex items-center gap-6 text-blue-200 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          
          <div className="text-blue-300 text-sm">
            © 2026 Checkpoint English
          </div>
        </div>
      </footer>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  )
}

export default Home
