import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="animate-fade-in">
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
            <Link to="/qa-training" className="btn-primary text-lg px-8 py-4">
              🚔 Start DOT Practice
            </Link>
            <Link to="/ai-coach" className="glass-effect text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200">
              🤖 AI Coach
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
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Q&A Training Feature */}
          <div className="card-feature group cursor-pointer" onClick={() => window.location.href = '/qa-training'}>
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🚔</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">DOT Practice</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Practice with 200 real DOT scenarios between officers and drivers. 
              Professional voice-over helps you learn proper pronunciation and responses.
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              Start Training 
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* AI Coach Feature */}
          <div className="card-feature group cursor-pointer" onClick={() => window.location.href = '/ai-coach'}>
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🤖</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">AI Conversational Coach</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Smart AI coach that helps with English practice, mechanic issues, dispatchers, 
              truck buying, and DOT conversations. Available in multiple languages.
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              Chat with AI 
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
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
        <Link to="/qa-training" className="btn-primary text-lg px-10 py-4 inline-flex items-center">
          Get Started Today
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>
    </div>
  )
}

export default Home