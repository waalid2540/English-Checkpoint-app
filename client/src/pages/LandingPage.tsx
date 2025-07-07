import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LandingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleGetStarted = () => {
    if (user) {
      navigate('/qa-training')
    } else {
      navigate('/signup')
    }
  }

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/signup', { state: { email } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Master English
              </span>
              <br />
              <span className="text-white">For Truck Drivers</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Pass your DOT inspections with confidence. Professional AI voices, 20+ languages, 
              and real-world scenarios designed specifically for immigrant truck drivers.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">200+</div>
                <div className="text-blue-200">DOT Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">20+</div>
                <div className="text-blue-200">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">100%</div>
                <div className="text-blue-200">Real Scenarios</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                🚀 Start Free Now
              </button>
              <Link
                to="/qa-training"
                className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all duration-300"
              >
                🎵 Try Demo
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Upgrade When Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-r from-gray-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-yellow-400">English Checkpoint</span>?
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Built specifically for immigrant truck drivers who need to pass DOT inspections and communicate professionally on the road.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">🎵</div>
              <h3 className="text-2xl font-bold mb-4">Professional AI Voices</h3>
              <p className="text-blue-200">
                ElevenLabs AI provides crystal-clear pronunciation with slower speech designed for language learners.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-4">20+ Languages</h3>
              <p className="text-blue-200">
                Supports Urdu, Arabic, Persian, Somali, Spanish, and more. See English with your native language.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">🚔</div>
              <h3 className="text-2xl font-bold mb-4">Real DOT Scenarios</h3>
              <p className="text-blue-200">
                200+ authentic questions and responses used in actual DOT inspections and roadside situations.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">🎤</div>
              <h3 className="text-2xl font-bold mb-4">Pronunciation Training</h3>
              <p className="text-blue-200">
                Record yourself and compare with native speakers. Perfect your accent and build confidence.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold mb-4">Mobile-Friendly</h3>
              <p className="text-blue-200">
                Practice anywhere, anytime. Works perfectly on your phone while on the road.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-4">Instant Progress</h3>
              <p className="text-blue-200">
                Track your improvement with practice scores, streaks, and personalized feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="py-20 bg-gradient-to-r from-red-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                <span className="text-red-300">The Problem:</span><br />
                DOT Inspections Are Stressful
              </h2>
              <div className="space-y-4 text-lg text-red-200">
                <div className="flex items-start gap-3">
                  <span className="text-red-400">😰</span>
                  <span>Language barriers cause miscommunication</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-400">🚫</span>
                  <span>Failed inspections mean lost income</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-400">⏰</span>
                  <span>No time to attend English classes</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-400">💸</span>
                  <span>Expensive tutoring and courses</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold mb-6">
                <span className="text-green-300">The Solution:</span><br />
                English Checkpoint
              </h2>
              <div className="space-y-4 text-lg text-green-200">
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✅</span>
                  <span>Practice real DOT conversations</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✅</span>
                  <span>Learn in your native language</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✅</span>
                  <span>Study anytime, anywhere</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✅</span>
                  <span>Affordable monthly subscription</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Drivers Are Saying
            </h2>
            <p className="text-xl text-blue-200">
              Real stories from truck drivers who improved their English
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-black font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Mohammed A.</h4>
                  <p className="text-blue-200 text-sm">Truck Driver, 5 years</p>
                </div>
              </div>
              <p className="text-blue-100 mb-4">
                "Finally passed my DOT inspection without stress! The Urdu translations helped me understand everything perfectly."
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-black font-bold">
                  C
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Carlos R.</h4>
                  <p className="text-blue-200 text-sm">New Driver, 6 months</p>
                </div>
              </div>
              <p className="text-blue-100 mb-4">
                "The pronunciation training is amazing! I can now communicate confidently with officers and customers."
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-black font-bold">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Ahmad K.</h4>
                  <p className="text-blue-200 text-sm">Experienced Driver, 10 years</p>
                </div>
              </div>
              <p className="text-blue-100 mb-4">
                "This app saved me so much money on English classes. Worth every penny for professional drivers!"
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Affordable Pricing
            </h2>
            <p className="text-xl text-purple-200">
              Choose the plan that works for your driving career
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-400">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
                <div className="text-4xl font-bold text-purple-300 mb-2">$0</div>
                <p className="text-purple-200">Always free</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>10 DOT practice questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>Basic pronunciation training</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>All 20+ languages</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>AI voice training</span>
                </li>
              </ul>
              
              <button
                onClick={handleGetStarted}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300"
              >
                Start Free Now
              </button>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">POPULAR</span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">$9.99</div>
                <p className="text-gray-800">per month</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">All 200+ DOT questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Advanced pronunciation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Emergency scenarios</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Speed quiz challenges</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Highway rules training</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Priority support</span>
                </li>
              </ul>
              
              <button
                onClick={handleGetStarted}
                className="w-full bg-black hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300"
              >
                Try Free, Then Upgrade
              </button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-purple-200 mb-4">
              💳 No credit card required for free plan • Upgrade anytime
            </p>
            <p className="text-sm text-purple-300">
              All plans include access to all languages and mobile app
            </p>
          </div>
        </div>
      </div>

      {/* Email Signup CTA */}
      <div className="py-20 bg-gradient-to-r from-green-900 to-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master English?
          </h2>
          <p className="text-xl text-green-200 mb-8">
            Join thousands of truck drivers who improved their English with our proven system
          </p>
          
          <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl text-black font-medium"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
              >
                Get Started Free
              </button>
            </div>
          </form>
          
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-green-200">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Upgrade when ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🚛 English Checkpoint</h3>
              <p className="text-gray-400">
                Professional English training for truck drivers worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/qa-training" className="hover:text-white">DOT Practice</Link></li>
                <li><Link to="/pronunciation-trainer" className="hover:text-white">Pronunciation</Link></li>
                <li><Link to="/speed-quiz" className="hover:text-white">Speed Quiz</Link></li>
                <li><Link to="/highway-rules" className="hover:text-white">Highway Rules</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">📧</a>
                <a href="#" className="text-gray-400 hover:text-white">📱</a>
                <a href="#" className="text-gray-400 hover:text-white">🌐</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 English Checkpoint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage