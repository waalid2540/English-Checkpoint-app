import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { samplePrompts } from '../data/sample-prompts'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import UpgradePopup from '../components/UpgradePopup'
import { createElevenLabsService } from '../services/elevenlabs'

const QATraining = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const subscription = useSubscription()
  
  // Redirect to signup if not authenticated
  useEffect(() => {
    console.log('QATraining - Auth state:', { user: !!user, loading })
    
    // Use a timeout to ensure auth has had time to load
    const timer = setTimeout(() => {
      if (!user) {
        console.log('QATraining - No user after timeout, redirecting to signup')
        navigate('/signup', {
          state: {
            from: '/qa-training',
            featureName: 'DOT Practice Training',
            message: 'Sign up now to access DOT Practice Training!'
          }
        })
      }
    }, 1000) // Wait 1 second for auth to resolve
    
    // Clean up timeout if user is found or component unmounts
    if (user) {
      clearTimeout(timer)
    }
    
    return () => clearTimeout(timer)
  }, [user, navigate])
  
  // Show loading for first 2 seconds or while auth is loading
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
  
  console.log('QATraining - Rendering component, user:', user?.email || 'No user')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingType, setPlayingType] = useState<'officer' | 'driver' | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [elevenLabsService, setElevenLabsService] = useState<any>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const isPlayingRef = useRef(false)

  // Initialize ElevenLabs service
  useEffect(() => {
    console.log('🔧 Environment Variables Check:')
    console.log('  All env vars:', Object.keys(import.meta.env))
    console.log('  VITE_ELEVENLABS_API_KEY:', import.meta.env.VITE_ELEVENLABS_API_KEY ? 'EXISTS' : 'MISSING')
    console.log('  VITE_ELEVENLABS_VOICE_ID:', import.meta.env.VITE_ELEVENLABS_VOICE_ID ? 'EXISTS' : 'MISSING')
    
    try {
      const service = createElevenLabsService()
      setElevenLabsService(service)
      console.log('✅ ElevenLabs service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize ElevenLabs:', error)
    }
  }, [])

  // Filter prompts based on subscription status
  const availablePrompts = samplePrompts.filter((prompt, index) => {
    if (index < 10) return true // First 10 are free
    return subscription.isPremium // Rest require premium
  })

  const currentPrompt = availablePrompts[currentIndex] || samplePrompts[0]

  const playAll = async () => {
    if (!elevenLabsService) {
      console.error('ElevenLabs service not initialized')
      return
    }

    setIsPlaying(true)
    isPlayingRef.current = true
    setAudioLoading(false) // Don't show loading for play all
    setCurrentIndex(0)
    
    try {
      // Play each conversation sequentially with ElevenLabs
      for (let i = 0; i < availablePrompts.length; i++) {
        // Check if user stopped playback
        if (!isPlayingRef.current) {
          console.log('🛑 User stopped playback')
          break
        }
        
        const prompt = availablePrompts[i]
        setCurrentIndex(i)
        console.log(`🎵 Playing conversation ${i + 1}/${availablePrompts.length}`)
        
        // Play officer part
        setPlayingType('officer')
        console.log(`👮‍♂️ Officer: ${prompt.officer}`)
        try {
          await elevenLabsService.playText(prompt.officer)
        } catch (error) {
          console.error('❌ Officer audio failed:', error)
          continue // Skip to next conversation if this one fails
        }
        
        // Check again after officer speech
        if (!isPlayingRef.current) break
        
        // Short pause between officer and driver
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Play driver part
        setPlayingType('driver')
        console.log(`🚛 Driver: ${prompt.driver}`)
        try {
          await elevenLabsService.playText(prompt.driver)
        } catch (error) {
          console.error('❌ Driver audio failed:', error)
          continue // Skip to next conversation if this one fails
        }
        
        setPlayingType(null)
        
        // Extra long pause between conversations (4 seconds) for processing
        if (i < availablePrompts.length - 1) {
          console.log(`⏸️ Pausing between conversations for comprehension...`)
          await new Promise(resolve => setTimeout(resolve, 4000))
        }
      }
      
      console.log('✅ Finished playing all conversations')
    } catch (error) {
      console.error('❌ Play all error:', error)
    } finally {
      setIsPlaying(false)
      isPlayingRef.current = false
      setAudioLoading(false)
      setPlayingType(null)
      console.log('🏁 Play all completed')
    }
  }

  const playCurrentPrompt = async () => {
    if (!elevenLabsService) return
    
    setAudioLoading(true)
    try {
      const prompt = currentPrompt
      
      // Play officer part
      setPlayingType('officer')
      await elevenLabsService.playText(prompt.officer)
      
      // Brief pause
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Play driver part
      setPlayingType('driver')
      await elevenLabsService.playText(prompt.driver)
      
    } catch (error) {
      console.error('❌ Single prompt playback error:', error)
    } finally {
      setAudioLoading(false)
      setPlayingType(null)
    }
  }

  const stopAll = () => {
    console.log('🛑 Stopping all audio playback')
    setIsPlaying(false)
    isPlayingRef.current = false
    setPlayingType(null)
    setAudioLoading(false)
    // Note: ElevenLabs audio playback can't be easily cancelled mid-stream
    // The loop will check isPlayingRef and stop at next iteration
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">🎵 DOT Practice Training</h1>
      
      {/* Big Play Button */}
      <div className="text-center mb-8">
        <button
          onClick={isPlaying ? stopAll : playAll}
          disabled={audioLoading || !elevenLabsService}
          className={`w-40 h-40 rounded-full text-white font-bold shadow-lg disabled:bg-gray-400 ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {audioLoading ? (
            <>
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-sm">Loading ElevenLabs...</div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-2">{isPlaying ? '⏹️' : '▶️'}</div>
              <div className="text-lg">{isPlaying ? 'STOP' : 'PLAY ALL'}</div>
            </>
          )}
        </button>
        {!elevenLabsService && (
          <p className="text-red-500 text-sm mt-2">⚠️ ElevenLabs not initialized</p>
        )}
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
          <div className="mt-2">
            <button
              onClick={playCurrentPrompt}
              disabled={audioLoading || !elevenLabsService}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              {audioLoading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </span>
              ) : (
                '🎵 Play This Conversation'
              )}
            </button>
          </div>
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