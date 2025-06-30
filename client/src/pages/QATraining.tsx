import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { samplePrompts } from '../data/sample-prompts'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import UpgradePopup from '../components/UpgradePopup'

const QATraining = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const subscription = useSubscription()
  
  // Redirect to signup if not authenticated
  useEffect(() => {
    console.log('QATraining - Auth state:', { user: !!user, loading })
    if (!loading && !user) {
      console.log('QATraining - Redirecting to signup')
      navigate('/signup', {
        state: {
          from: '/qa-training',
          featureName: 'DOT Practice Training',
          message: 'Sign up now to access DOT Practice Training!'
        }
      })
    }
  }, [user, loading, navigate])
  
  // Show loading while checking auth
  if (loading) {
    console.log('QATraining - Still loading auth...')
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500 mt-2">Checking your access...</p>
        </div>
      </div>
    )
  }
  
  // Don't render if no user (will redirect)
  if (!user) {
    console.log('QATraining - No user, returning null')
    return null
  }
  
  console.log('QATraining - Rendering component for user:', user.email)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingType, setPlayingType] = useState<'officer' | 'driver' | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)

  // Filter prompts based on subscription status
  const availablePrompts = samplePrompts.filter((prompt, index) => {
    if (index < 10) return true // First 10 are free
    return subscription.isPremium // Rest require premium
  })

  const currentPrompt = availablePrompts[currentIndex] || samplePrompts[0]

  const playAll = () => {
    setIsPlaying(true)
    setCurrentIndex(0)
    
    // Create conversation audio using available prompts
    let script = ""
    availablePrompts.forEach(prompt => {
      script += `Officer: ${prompt.officer}... Driver: ${prompt.driver}... `
    })
    
    // Play audio
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = 0.7
    utterance.onend = () => setIsPlaying(false)
    speechSynthesis.speak(utterance)
    
    // Update text every 8 seconds (slower to match audio)
    let questionIndex = 0
    const updateText = () => {
      if (questionIndex < availablePrompts.length) {
        console.log(`Showing question ${questionIndex + 1}`)
        setCurrentIndex(questionIndex)
        setPlayingType('officer')
        
        setTimeout(() => {
          setPlayingType('driver')
          setTimeout(() => {
            setPlayingType(null)
            questionIndex++
            if (questionIndex < availablePrompts.length) {
              setTimeout(updateText, 1500)
            }
          }, 4000)
        }, 4000)
      }
    }
    
    updateText()
  }

  const stopAll = () => {
    setIsPlaying(false)
    setPlayingType(null)
    speechSynthesis.cancel()
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">🎵 DOT Practice Training</h1>
      
      {/* Big Play Button */}
      <div className="text-center mb-8">
        <button
          onClick={isPlaying ? stopAll : playAll}
          className={`w-40 h-40 rounded-full text-white font-bold shadow-lg ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          <div className="text-5xl mb-2">{isPlaying ? '⏹️' : '▶️'}</div>
          <div className="text-lg">{isPlaying ? 'STOP' : 'PLAY ALL'}</div>
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="text-center text-xl font-bold mb-4">
          Question {currentIndex + 1} of {availablePrompts.length}
          {!subscription.isPremium && (
            <span className="text-sm text-gray-600 block">
              (🆓 Free: 1-10 | 🔒 Premium: 11-198)
            </span>
          )}
        </div>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / availablePrompts.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Question & Answer */}
      <div className="space-y-6">
        {/* Officer Question */}
        <div className={`p-6 rounded-lg border-l-8 ${
          playingType === 'officer' ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-4">👮‍♂️</span>
              <div>
                <h3 className="text-2xl font-bold text-blue-800">DOT Officer</h3>
                <p className="text-blue-600">Official Question</p>
              </div>
            </div>
            {playingType === 'officer' && (
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full">
                <span className="animate-pulse">🔊 Speaking Now</span>
              </div>
            )}
          </div>
          <p className="text-xl text-blue-900 font-medium leading-relaxed">
            "{currentPrompt.officer}"
          </p>
        </div>

        {/* Driver Answer */}
        <div className={`p-6 rounded-lg border-l-8 ${
          playingType === 'driver' ? 'bg-green-100 border-green-500' : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🚛</span>
              <div>
                <h3 className="text-2xl font-bold text-green-800">Professional Driver</h3>
                <p className="text-green-600">Correct Response</p>
              </div>
            </div>
            {playingType === 'driver' && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-full">
                <span className="animate-pulse">🔊 Speaking Now</span>
              </div>
            )}
          </div>
          <p className="text-xl text-green-900 font-medium leading-relaxed">
            "{currentPrompt.driver}"
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium"
        >
          ← Previous
        </button>

        <div className="text-center">
          <span className="text-lg font-medium text-gray-700">
            {currentIndex + 1} / {availablePrompts.length}
          </span>
        </div>

        <button
          onClick={async () => {
            if (currentIndex + 1 >= availablePrompts.length && !subscription.isPremium) {
              // Show beautiful upgrade popup
              setShowUpgradePopup(true)
            } else {
              setCurrentIndex(Math.min(availablePrompts.length - 1, currentIndex + 1))
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          {currentIndex + 1 >= availablePrompts.length && !subscription.isPremium ? '🔒 Upgrade' : 'Next →'}
        </button>
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {!subscription.isPremium && currentIndex >= 8 && (
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-2">🚀 Unlock All 198 Questions!</h3>
          <p className="mb-4">You're almost at the end of free questions. Get premium access to master all DOT scenarios!</p>
          <button
            onClick={() => setShowUpgradePopup(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Start 7-Day Free Trial - $9.99/month
          </button>
        </div>
      )}

      {/* Status */}
      {isPlaying && (
        <div className="text-center mt-8">
          <div className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg">
            <span className="animate-pulse">🎵</span>
            <span className="ml-2 font-medium">Playing all conversations automatically...</span>
          </div>
        </div>
      )}
      
      {/* Upgrade Popup */}
      <UpgradePopup 
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        trigger="dot_questions"
      />
    </div>
  )
}

export default QATraining