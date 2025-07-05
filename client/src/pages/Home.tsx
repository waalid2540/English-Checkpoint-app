import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import FeatureAccess from '../components/FeatureAccess'
import InstallPrompt from '../components/InstallPrompt'
import PaymentDebugger from '../components/PaymentDebugger'

const Home = () => {
  const { user } = useAuth()
  const subscription = useSubscription()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      setShowSuccessMessage(true)
      console.log('🎉 Payment successful! User should have premium access now')
      
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname)
      
      // Force subscription status refresh
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
      // Hide success message after 8 seconds
      setTimeout(() => setShowSuccessMessage(false), 8000)
    }
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-6 rounded-xl shadow-lg z-50 max-w-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-bold">Payment Successful!</h3>
              <p className="text-sm">You now have unlimited access to all features!</p>
              <p className="text-xs mt-1 opacity-80">Refreshing your account...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="hero-section text-white py-20 px-6 rounded-3xl mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            Master English for
            <span className="block text-yellow-300">Truck Driving</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Professional English training designed specifically for truck drivers. 
            Practice conversations, learn DOT regulations, and communicate confidently on the road.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <FeatureAccess 
              featureName="DOT Practice Training"
              targetPath="/qa-training"
              className="btn-primary text-lg px-8 py-4 cursor-pointer text-center"
            >
              🚔 Start DOT Practice {!user && '(Free Trial)'}
            </FeatureAccess>
            <Link
              to="/speed-quiz"
              className="glass-effect text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 cursor-pointer text-center"
            >
              ⚡ Speed Quiz Challenge
            </Link>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-300/20 rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-full animate-pulse-slow delay-2000"></div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Everything You Need to <span className="gradient-text">Succeed</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* DOT Practice Training */}
          <FeatureAccess 
            featureName="DOT Practice Training"
            targetPath="/qa-training"
            className="card-feature group cursor-pointer"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🚔</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">DOT Practice Training</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Master 200+ real DOT checkpoint scenarios with professional voice-over. 
              Learn proper responses to officer questions and build confidence.
            </p>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-600 font-semibold text-sm">📚 200+ Questions</div>
                <div className="text-xs text-gray-600">Real scenarios</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 font-semibold text-sm">🔊 Audio Training</div>
                <div className="text-xs text-gray-600">Professional voice</div>
              </div>
            </div>
            
            {!user && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-lg mb-4 text-sm font-semibold border border-green-200">
                ✨ Sign up for FREE - Get 10 questions!
              </div>
            )}
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              {user ? 'Continue Training' : 'Get Free Access'}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </FeatureAccess>

          {/* Amazing Pronunciation Trainer */}
          <Link 
            to="/pronunciation-trainer"
            className="card-feature group cursor-pointer"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Pronunciation Trainer</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Perfect your English pronunciation with our advanced trainer. Record yourself, 
              compare with natives, and master 5 essential categories.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-red-600 font-semibold text-sm">🎤 Voice Recording</div>
                <div className="text-xs text-gray-600">Record & compare</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-purple-600 font-semibold text-sm">🚨 5 Categories</div>
                <div className="text-xs text-gray-600">DOT, Emergency, etc.</div>
              </div>
            </div>
            
            <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
              Start Pronunciation Training
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Amazing Speed Quiz */}
          <Link 
            to="/speed-quiz"
            className="card-feature group cursor-pointer"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Speed Quiz Challenge</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Test your DOT knowledge under pressure! Quick-fire questions with time limits 
              to build confidence and reaction speed.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-yellow-600 font-semibold text-sm">⏱️ Timed Challenges</div>
                <div className="text-xs text-gray-600">7-15 seconds each</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-red-600 font-semibold text-sm">🔥 3 Difficulty Modes</div>
                <div className="text-xs text-gray-600">Easy to DOT Pressure</div>
              </div>
            </div>
            
            <div className="flex items-center text-yellow-600 font-semibold group-hover:text-yellow-700">
              Start Speed Challenge
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Interactive Highway Rules */}
          <Link 
            to="/highway-rules"
            className="card-feature group cursor-pointer"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🛣️</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Highway Rules & Signs</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Interactive learning for road signs and highway rules. Essential knowledge 
              for DOT inspections and safe driving.
            </p>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 font-semibold text-sm">🚧 Interactive Signs</div>
                <div className="text-xs text-gray-600">Learn with real examples</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-600 font-semibold text-sm">📋 Highway Rules</div>
                <div className="text-xs text-gray-600">DOT compliance guide</div>
              </div>
            </div>
            
            <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
              Start Learning Rules
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16 px-8 rounded-3xl text-center">
        <h2 className="text-3xl font-bold mb-12">Trusted by Truck Drivers Worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl font-bold mb-2">20,000+</div>
            <div className="text-blue-100">Active Users</div>
          </div>
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl font-bold mb-2">200+</div>
            <div className="text-blue-100">Practice Questions</div>
          </div>
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl font-bold mb-2">Multiple</div>
            <div className="text-blue-100">Languages</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold mb-6 text-gray-800">
          Ready to Improve Your English?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of truck drivers who have improved their communication skills 
          and confidence on the road.
        </p>
        <FeatureAccess 
          featureName="DOT Practice Training"
          targetPath="/qa-training"
          className="btn-primary text-lg px-10 py-4 inline-flex items-center cursor-pointer"
        >
          {user ? 'Continue Learning' : 'Start Free Account'}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </FeatureAccess>
      </section>

      {/* Install Prompt */}
      <InstallPrompt />
      
      {/* Payment Debugger (only shows on localhost or with ?debug=true) */}
      <PaymentDebugger />
    </div>
  )
}

export default Home