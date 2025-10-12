import React, { useState, useRef, useEffect } from 'react'
import { samplePrompts } from '../data/sample-prompts'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import UpgradePopup from '../components/UpgradePopup'
import { createGoogleTTSService } from '../services/google-tts'

interface PhraseCategory {
  id: string
  name: string
  icon: string
  color: string
  phrases: string[]
  description: string
}

const PronunciationTrainer = () => {
  const { user } = useAuth()
  const subscription = useSubscription()
  
  const [selectedCategory, setSelectedCategory] = useState<string>('dot')
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingType, setPlayingType] = useState<'original' | 'recorded' | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [practiceScore, setPracticeScore] = useState(0)
  const [practiceStreak, setPracticeStreak] = useState(0)
  const [googleTTSService, setGoogle TTSService] = useState<any>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordedAudioRef = useRef<HTMLAudioElement>(null)

  // Phrase Categories with amazing content
  const phraseCategories: PhraseCategory[] = [
    {
      id: 'dot',
      name: 'DOT Checkpoint',
      icon: '🚔',
      color: 'blue',
      description: 'Essential phrases for DOT inspections',
      phrases: [
        'Good morning, officer',
        'Here is my license and registration',
        'I am hauling refrigerated goods',
        'My destination is Chicago, Illinois',
        'I have been driving for four hours today',
        'My truck is in good mechanical condition',
        'I completed my pre-trip inspection',
        'My log book is up to date',
        'The load is properly secured',
        'Thank you, officer. Have a safe day'
      ]
    },
    {
      id: 'emergency',
      name: 'Emergency Situations',
      icon: '🚨',
      color: 'red',
      description: 'Critical phrases for roadside emergencies',
      phrases: [
        'I need help, my truck broke down',
        'Please call a mechanic',
        'My engine is overheating',
        'I have a flat tire',
        'Call nine-one-one please',
        'There has been an accident',
        'I need a tow truck',
        'My trailer is damaged',
        'I am blocking traffic',
        'Send police assistance'
      ]
    },
    {
      id: 'truck_stop',
      name: 'Truck Stop Communication',
      icon: '⛽',
      color: 'green',
      description: 'Common phrases for truck stops and services',
      phrases: [
        'Fill up with diesel, please',
        'Check my tire pressure',
        'Where is the truck wash?',
        'I need a parking spot for the night',
        'Do you have a mechanic on duty?',
        'Where can I get food?',
        'I need to use the restroom',
        'What time do you close?',
        'How much for a shower?',
        'Thank you for your service'
      ]
    },
    {
      id: 'delivery',
      name: 'Delivery & Pickup',
      icon: '📦',
      color: 'purple',
      description: 'Professional phrases for delivery locations',
      phrases: [
        'I am here to make a delivery',
        'Where should I park my truck?',
        'I have a pickup scheduled',
        'Please sign here for the delivery',
        'I need the bill of lading',
        'What dock should I use?',
        'The shipment is refrigerated',
        'I need help unloading',
        'Is someone available to receive this?',
        'The delivery is complete'
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Conversations',
      icon: '🎓',
      color: 'orange',
      description: 'Complex phrases for experienced drivers',
      phrases: subscription.isPremium ? [
        'I am transporting hazardous materials',
        'My hours of service are compliant',
        'I need to speak with the shipping manager',
        'The electronic logging device is functioning properly',
        'I am authorized to handle this cargo',
        'Please verify the customs documentation',
        'I have commercial driver license endorsements',
        'The gross vehicle weight is within limits',
        'I need to report a safety violation',
        'The cargo requires special handling procedures'
      ] : [
        '🔒 Premium phrases available with subscription',
        '🔒 Unlock advanced conversations',
        '🔒 Get professional vocabulary',
        '🔒 Master complex situations'
      ]
    }
  ]

  // Initialize Google TTS service
  useEffect(() => {
    console.log('🔧 Pronunciation Trainer - Environment Variables Check:')
    console.log('  VITE_ELEVENLABS_API_KEY:', import.meta.env.VITE_ELEVENLABS_API_KEY ? 'EXISTS' : 'MISSING')
    console.log('  VITE_ELEVENLABS_VOICE_ID:', import.meta.env.VITE_ELEVENLABS_VOICE_ID ? 'EXISTS' : 'MISSING')
    
    try {
      const service = createGoogleTTSService()
      setGoogle TTSService(service)
      console.log('✅ Google TTS service initialized for Pronunciation Trainer')
    } catch (error) {
      console.error('❌ Failed to initialize Google TTS for Pronunciation Trainer:', error)
    }
  }, [])

  const currentCategory = phraseCategories.find(cat => cat.id === selectedCategory) || phraseCategories[0]
  const currentPhrase = currentCategory.phrases[currentPhraseIndex] || currentCategory.phrases[0]
  const isLocked = selectedCategory === 'advanced' && !subscription.isPremium

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        setPracticeScore(prev => prev + 10)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      setIsRecording(true)
      mediaRecorder.start()
      
      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording()
        }
      }, 15000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to use pronunciation training')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }
  
  const playOriginalAudio = async () => {
    if (isLocked) {
      setShowUpgradePopup(true)
      return
    }
    
    if (!googleTTSService) {
      console.error('Google TTS service not initialized')
      return
    }
    
    setPlayingType('original')
    setIsPlaying(true)
    setAudioLoading(true)
    
    try {
      console.log(`🎵 Playing with Google TTS: ${currentPhrase}`)
      await googleTTSService.playText(currentPhrase)
    } catch (error) {
      console.error('❌ Google TTS playback error:', error)
    } finally {
      setIsPlaying(false)
      setPlayingType(null)
      setAudioLoading(false)
    }
  }
  
  const playRecordedAudio = () => {
    if (recordedAudio && recordedAudioRef.current) {
      setPlayingType('recorded')
      setIsPlaying(true)
      recordedAudioRef.current.src = recordedAudio
      recordedAudioRef.current.play()
      
      recordedAudioRef.current.onended = () => {
        setIsPlaying(false)
        setPlayingType(null)
      }
    }
  }
  
  const clearRecording = () => {
    setRecordedAudio(null)
    speechSynthesis.cancel()
    setIsPlaying(false)
    setPlayingType(null)
  }

  const nextPhrase = () => {
    if (currentPhraseIndex < currentCategory.phrases.length - 1) {
      setCurrentPhraseIndex(prev => prev + 1)
      setPracticeStreak(prev => prev + 1)
      clearRecording()
    }
  }

  const previousPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(prev => prev - 1)
      clearRecording()
    }
  }

  const switchCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPhraseIndex(0)
    clearRecording()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎯 Pronunciation Trainer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master perfect English pronunciation for truck driving. Record yourself, compare with natives, and build confidence!
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-md">
              <div className="text-2xl font-bold text-blue-600">{practiceScore}</div>
              <div className="text-sm text-gray-600">Practice Points</div>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl shadow-md">
              <div className="text-2xl font-bold text-green-600">{practiceStreak}</div>
              <div className="text-sm text-gray-600">Phrase Streak</div>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl shadow-md">
              <div className="text-2xl font-bold text-purple-600">{currentPhraseIndex + 1}/{currentCategory.phrases.length}</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Practice Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {phraseCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => switchCategory(category.id)}
                className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-500 text-white shadow-2xl`
                    : 'bg-white text-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                <p className="text-sm opacity-90">{category.description}</p>
                {category.id === 'advanced' && !subscription.isPremium && (
                  <div className="mt-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    🔒 Premium
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Practice Area */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          {/* Current Phrase Display */}
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 bg-${currentCategory.color}-100 text-${currentCategory.color}-800`}>
              {currentCategory.icon} {currentCategory.name}
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-6">
              <h3 className="text-3xl font-bold text-gray-800 mb-4 leading-relaxed">
                {isLocked ? '🔒 Premium Phrase' : `"${currentPhrase}"`}
              </h3>
              {isLocked && (
                <p className="text-gray-600">Unlock advanced phrases with premium subscription</p>
              )}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Listen Section */}
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-800 mb-4">🔊 Listen to Native</h4>
              <button
                onClick={playOriginalAudio}
                disabled={isPlaying && playingType === 'original'}
                className={`w-32 h-32 rounded-full text-white font-bold shadow-2xl transition-all transform hover:scale-110 ${
                  isPlaying && playingType === 'original'
                    ? 'bg-blue-400 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <div className="text-4xl mb-2">
                  {isPlaying && playingType === 'original' ? '🔊' : '▶️'}
                </div>
                <div className="text-sm">
                  {isPlaying && playingType === 'original' ? 'Playing' : 'Listen'}
                </div>
              </button>
            </div>

            {/* Record Section */}
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-800 mb-4">🎤 Record Yourself</h4>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isLocked}
                  className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold shadow-2xl transition-all transform hover:scale-110 disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">🎤</div>
                  <div className="text-sm">Record</div>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-32 h-32 rounded-full bg-red-600 text-white font-bold shadow-2xl animate-pulse"
                >
                  <div className="text-4xl mb-2">⏹️</div>
                  <div className="text-sm">Stop</div>
                </button>
              )}
            </div>
          </div>

          {/* Recorded Audio Playback */}
          {recordedAudio && (
            <div className="bg-green-50 rounded-2xl p-6 mb-8">
              <h4 className="text-xl font-bold text-green-800 mb-4 text-center">✅ Your Recording</h4>
              <div className="flex justify-center gap-4">
                <button
                  onClick={playRecordedAudio}
                  disabled={isPlaying && playingType === 'recorded'}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    isPlaying && playingType === 'recorded'
                      ? 'bg-green-400 text-white animate-pulse'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isPlaying && playingType === 'recorded' ? '🔊 Playing' : '▶️ Play My Recording'}
                </button>
                <button
                  onClick={clearRecording}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
                >
                  🗑️ Try Again
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">
                    🎉 Great job! Keep practicing to perfect your pronunciation.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={previousPhrase}
              disabled={currentPhraseIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all"
            >
              ← Previous Phrase
            </button>

            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                {currentPhraseIndex + 1} of {currentCategory.phrases.length}
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`bg-${currentCategory.color}-500 h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${((currentPhraseIndex + 1) / currentCategory.phrases.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={nextPhrase}
              disabled={currentPhraseIndex === currentCategory.phrases.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all"
            >
              Next Phrase →
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-orange-800 mb-4">💡 Pronunciation Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-700">
            <div>• Speak slowly and clearly</div>
            <div>• Listen to the rhythm and stress</div>
            <div>• Focus on difficult sounds</div>
            <div>• Practice daily for best results</div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={recordedAudioRef} style={{ display: 'none' }} />
      
      {/* Upgrade Popup */}
      <UpgradePopup 
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        trigger="pronunciation_trainer"
      />
    </div>
  )
}

export default PronunciationTrainer