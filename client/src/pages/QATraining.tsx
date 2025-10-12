import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { samplePrompts } from '../data/sample-prompts'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import UpgradePopup from '../components/UpgradePopup'
import { createGoogleTTSService } from '../services/google-tts'
import { translationService, SUPPORTED_LANGUAGES } from '../services/translation'

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
  const [googleTTSService, setGoogleTTSService] = useState<any>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const isPlayingRef = useRef(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translatedPrompts, setTranslatedPrompts] = useState<any[]>([])
  const [translating, setTranslating] = useState(false)
  const [showAllLanguages, setShowAllLanguages] = useState(false)

  // Initialize Google TTS service
  useEffect(() => {
    console.log('🔧 Initializing Google TTS Service')

    try {
      const service = createGoogleTTSService()
      setGoogleTTSService(service)
      console.log('✅ Google TTS service initialized (100% FREE!)')
    } catch (error) {
      console.error('❌ Failed to initialize Google TTS:', error)
    }
  }, [])

  // Filter prompts based on subscription status
  const availablePrompts = samplePrompts.filter((prompt, index) => {
    if (index < 10) return true // First 10 are free
    return subscription.isPremium // Rest require premium
  })

  // Translate prompts when language changes
  useEffect(() => {
    const translatePrompts = async () => {
      if (selectedLanguage === 'en') {
        setTranslatedPrompts(availablePrompts)
        return
      }

      setTranslating(true)
      try {
        console.log(`🌍 Translating ${availablePrompts.length} prompts to ${selectedLanguage}`)
        
        const translated = await Promise.all(
          availablePrompts.map(async (prompt) => {
            const result = await translationService.translateConversation(
              prompt.officer,
              prompt.driver,
              selectedLanguage
            )
            return {
              ...prompt,
              officer: result.officer,
              driver: result.driver,
              originalOfficer: prompt.officer, // Keep original for audio
              originalDriver: prompt.driver    // Keep original for audio
            }
          })
        )
        
        setTranslatedPrompts(translated)
        console.log('✅ All prompts translated successfully')
      } catch (error) {
        console.error('❌ Translation failed:', error)
        setTranslatedPrompts(availablePrompts) // Fallback to original
      } finally {
        setTranslating(false)
      }
    }

    translatePrompts()
  }, [selectedLanguage, availablePrompts.length, subscription.isPremium])

  const currentPrompt = translatedPrompts[currentIndex] || availablePrompts[currentIndex] || samplePrompts[0]

  // Mobile audio initialization to handle browser policies
  const initializeMobileAudio = async () => {
    try {
      // Create a silent audio to unlock audio context on mobile
      const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeCfLDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeDl1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeDl1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeDl1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeDl1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeCg==')
      silentAudio.volume = 0.01
      await silentAudio.play()
      console.log('✅ Mobile audio context initialized')
    } catch (error) {
      console.log('ℹ️ Mobile audio initialization not needed or failed:', error)
    }
  }

  const playAll = async () => {
    if (!googleTTSService) {
      console.error('Google TTS service not initialized')
      return
    }

    // Initialize mobile audio first
    await initializeMobileAudio()

    setIsPlaying(true)
    isPlayingRef.current = true
    setAudioLoading(false) // Don't show loading for play all
    setCurrentIndex(0)
    
    console.log('🚀 Starting playAll with mobile optimizations')
    
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
        
        // Play officer part (always in English for best audio quality)
        setPlayingType('officer')
        console.log(`👮‍♂️ Officer: ${prompt.officer}`)
        try {
          // Use original English text for audio, even if displaying translated
          const audioText = prompt.originalOfficer || prompt.officer
          console.log(`🎵 Attempting to play officer audio: "${audioText.substring(0, 30)}..."`)
          await googleTTSService.playText(audioText)
          console.log(`✅ Officer audio completed successfully`)
        } catch (error) {
          console.error('❌ Officer audio failed:', error)
          // On mobile, continue to next part instead of skipping entire conversation
          console.log('⏭️ Continuing to driver part despite officer audio failure')
        }
        
        // Check again after officer speech
        if (!isPlayingRef.current) break
        
        // Short pause between officer and driver
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Play driver part (always in English for best audio quality)
        setPlayingType('driver')
        console.log(`🚛 Driver: ${prompt.driver}`)
        try {
          // Use original English text for audio, even if displaying translated
          const audioText = prompt.originalDriver || prompt.driver
          console.log(`🎵 Attempting to play driver audio: "${audioText.substring(0, 30)}..."`)
          await googleTTSService.playText(audioText)
          console.log(`✅ Driver audio completed successfully`)
        } catch (error) {
          console.error('❌ Driver audio failed:', error)
          // On mobile, continue to next conversation instead of stopping
          console.log('⏭️ Moving to next conversation despite driver audio failure')
        }
        
        setPlayingType(null)
        
        // Short pause between conversations (next question)
        if (i < availablePrompts.length - 1) {
          console.log(`⏸️ Moving to next question...`)
          await new Promise(resolve => setTimeout(resolve, 1500))
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
    if (!googleTTSService) return
    
    setAudioLoading(true)
    try {
      const prompt = currentPrompt
      
      // Play officer part (use original English for audio)
      setPlayingType('officer')
      const officerText = prompt.originalOfficer || prompt.officer
      await googleTTSService.playText(officerText)
      
      // Brief pause
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Play driver part (use original English for audio)
      setPlayingType('driver')
      const driverText = prompt.originalDriver || prompt.driver
      await googleTTSService.playText(driverText)
      
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
      
      {/* Language Selector */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🌍 Choose Your Language</h3>
            <p className="text-sm text-gray-600">
              English audio with {selectedLanguage === 'en' ? 'English' : translationService.getLanguageName(selectedLanguage)} text for better understanding
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 max-w-4xl">
            {(showAllLanguages ? SUPPORTED_LANGUAGES : SUPPORTED_LANGUAGES.slice(0, 8)).map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                disabled={translating}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedLanguage === language.code
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                } disabled:opacity-50`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
            
            {!showAllLanguages && (
              <button
                onClick={() => setShowAllLanguages(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
              >
                <span>+{SUPPORTED_LANGUAGES.length - 8} more</span>
              </button>
            )}
            
            {showAllLanguages && (
              <button
                onClick={() => setShowAllLanguages(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
              >
                <span>Show Less</span>
              </button>
            )}
          </div>
        </div>
        
        {translating && (
          <div className="mt-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-blue-600 font-medium">Translating to {translationService.getLanguageName(selectedLanguage)}...</span>
          </div>
        )}
      </div>
      
      {/* Big Play Button */}
      <div className="text-center mb-8">
        <button
          onClick={isPlaying ? stopAll : playAll}
          disabled={audioLoading || !googleTTSService}
          className={`w-40 h-40 rounded-full text-white font-bold shadow-lg disabled:bg-gray-400 ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {audioLoading ? (
            <>
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-sm">Loading Audio...</div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-2">{isPlaying ? '⏹️' : '▶️'}</div>
              <div className="text-lg">{isPlaying ? 'STOP' : 'PLAY ALL'}</div>
              <div className="text-xs mt-1 opacity-75">
                {isPlaying ? 'Playing...' : 'Mobile Ready'}
              </div>
            </>
          )}
        </button>
        {!googleTTSService && (
          <p className="text-red-500 text-sm mt-2">⚠️ Google TTS not initialized</p>
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
          
          {/* English Text (Always First) */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded flex items-center">
                🇺🇸 English (Audio)
              </span>
            </div>
            <p className="text-xl text-blue-900 font-medium leading-relaxed">
              "{availablePrompts[currentIndex]?.officer || currentPrompt.officer}"
            </p>
          </div>
          
          {/* Translated Text (If Different Language Selected) */}
          {selectedLanguage !== 'en' && currentPrompt.officer && (
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded flex items-center">
                  {translationService.getLanguageFlag(selectedLanguage)} {translationService.getLanguageName(selectedLanguage)}
                </span>
              </div>
              <p className="text-lg text-blue-800 font-medium leading-relaxed opacity-90">
                "{currentPrompt.officer}"
              </p>
            </div>
          )}
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
          
          {/* English Text (Always First) */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold text-green-700 bg-green-200 px-2 py-1 rounded flex items-center">
                🇺🇸 English (Audio)
              </span>
            </div>
            <p className="text-xl text-green-900 font-medium leading-relaxed">
              "{availablePrompts[currentIndex]?.driver || currentPrompt.driver}"
            </p>
          </div>
          
          {/* Translated Text (If Different Language Selected) */}
          {selectedLanguage !== 'en' && currentPrompt.driver && (
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded flex items-center">
                  {translationService.getLanguageFlag(selectedLanguage)} {translationService.getLanguageName(selectedLanguage)}
                </span>
              </div>
              <p className="text-lg text-green-800 font-medium leading-relaxed opacity-90">
                "{currentPrompt.driver}"
              </p>
            </div>
          )}
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
              disabled={audioLoading || !googleTTSService}
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