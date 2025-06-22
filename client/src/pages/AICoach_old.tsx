import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
  isTyping?: boolean
}

interface CoachMode {
  id: string
  name: string
  icon: string
  description: string
  color: string
  gradient: string
}

const AICoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Checkpoint English Coach! 😊 I'm here to help you master English for trucking and life in America. Which mode would you like to use today?",
      sender: 'coach',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [currentMode, setCurrentMode] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [voiceLevel, setVoiceLevel] = useState(0)
  const [audioSupported, setAudioSupported] = useState(true)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<any>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const silenceTimerRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const modes: CoachMode[] = [
    {
      id: 'casual',
      name: 'Casual Chat',
      icon: '💬',
      description: 'Build confidence through real-life conversations',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'beginner',
      name: 'Beginner English',
      icon: '🌟',
      description: 'Learn basic words and grammar in a friendly way',
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'dot',
      name: 'DOT Checkpoint',
      icon: '🚓',
      description: 'Practice police/officer checkpoint dialogues',
      color: 'bg-red-500',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 'truck',
      name: 'Truck Parts',
      icon: '🔧',
      description: 'Learn truck vocabulary (brake, axle, hose, coolant)',
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'mechanic',
      name: 'Mechanic Talk',
      icon: '⚙️',
      description: 'Explain truck problems to mechanics in English',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'health',
      name: 'Health Support',
      icon: '🩺',
      description: 'Practice health and emergency vocabulary',
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      id: 'progress',
      name: 'Progress Mode',
      icon: '📊',
      description: 'Review your learning progress and weak areas',
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' }
  ]

  // Initialize continuous voice detection
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [])

  const startContinuousListening = async () => {
    try {
      console.log('🎤 Requesting microphone permission...')
      setContinuousMode(true)
      setIsListening(true)

      // Request microphone permission with better error handling
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      
      console.log('✅ Microphone permission granted')
      streamRef.current = stream

      // Use webm format which has better browser support
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      }
      
      // Check supported formats and use the best one
      let mimeType = 'audio/webm;codecs=opus'
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      }
      
      console.log('🎵 Using audio format:', mimeType)
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Set up voice activity detection with better audio analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.3
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      microphone.connect(analyser)

      let isSpeaking = false
      let speechStartTime = 0
      let silenceStartTime = 0

      const detectVoice = () => {
        if (!continuousMode || !analyser) return

        analyser.getByteFrequencyData(dataArray)
        
        // Calculate volume with better algorithm
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i]
        }
        const volume = Math.sqrt(sum / dataArray.length)
        setVoiceLevel(volume)

        const threshold = 15 // Lower threshold for better sensitivity
        const currentTime = Date.now()

        if (volume > threshold && !isSpeaking && !isProcessing) {
          // Start of speech detected
          console.log('🗣️ Speech detected, starting recording...')
          isSpeaking = true
          speechStartTime = currentTime
          audioChunksRef.current = []
          
          try {
            mediaRecorder.start(100) // Record in 100ms chunks
          } catch (e) {
            console.error('Error starting recording:', e)
          }
          
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }
        } else if (volume <= threshold && isSpeaking) {
          // Potential end of speech
          if (!silenceStartTime) {
            silenceStartTime = currentTime
          }
          
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }
          
          silenceTimerRef.current = setTimeout(() => {
            if (isSpeaking && (currentTime - speechStartTime > 500)) { // Minimum 0.5 second speech
              console.log('🔇 Silence detected, stopping recording...')
              isSpeaking = false
              silenceStartTime = 0
              try {
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop()
                }
              } catch (e) {
                console.error('Error stopping recording:', e)
              }
            }
          }, 1000) // 1 second of silence to stop
        } else if (volume > threshold) {
          silenceStartTime = 0 // Reset silence timer if speaking again
        }

        if (continuousMode) {
          requestAnimationFrame(detectVoice)
        }
      }

      // Handle recorded audio with better error handling
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📊 Audio chunk received, size:', event.data.size)
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped, processing audio...')
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          console.log('🎵 Created audio blob, size:', audioBlob.size, 'type:', mimeType)
          
          if (audioBlob.size > 1000) { // Only process if we have substantial audio
            await processAudioWithWhisper(audioBlob)
          } else {
            console.log('⚠️ Audio too short, skipping...')
          }
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event)
      }

      // Start voice detection
      detectVoice()

    } catch (error) {
      console.error('❌ Error starting continuous listening:', error)
      setContinuousMode(false)
      setIsListening(false)
      
      // Show user-friendly error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "🎤 I need microphone permission to hear you. Please allow microphone access and try again.",
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const stopContinuousListening = () => {
    setContinuousMode(false)
    setIsListening(false)
    setVoiceLevel(0)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const processAudioWithWhisper = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)
      console.log('🤖 Processing audio with OpenAI Whisper...')
      console.log('📊 Audio blob size:', audioBlob.size, 'type:', audioBlob.type)

      const formData = new FormData()
      
      // Convert to supported format if needed
      let finalBlob = audioBlob
      let extension = 'webm'
      
      if (audioBlob.type.includes('wav')) {
        extension = 'wav'
      } else if (audioBlob.type.includes('webm')) {
        extension = 'webm'
      } else if (audioBlob.type.includes('mp4')) {
        extension = 'mp4'
      }
      
      formData.append('audio', finalBlob, `speech.${extension}`)
      console.log('📤 Sending to Whisper API with extension:', extension)

      const response = await axios.post('http://localhost:3001/api/ai/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          console.log('📤 Upload progress:', progress + '%')
        }
      })

      console.log('✅ Whisper API response:', response.data)

      if (response.data.success && response.data.text) {
        const transcript = response.data.text.trim()
        console.log('🗣️ Transcript:', transcript)
        
        if (transcript.length > 2) { // Only process meaningful input
          // Show user message immediately
          const userMessage: Message = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, userMessage])
          
          // Get AI response
          console.log('🤖 Getting AI response for:', transcript)
          const aiReply = await getAIResponse(transcript, currentMode)
          console.log('✅ AI replied:', aiReply.substring(0, 50) + '...')
          
          const coachResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: aiReply,
            sender: 'coach',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, coachResponse])
          
          // Speak the AI response using TTS - THIS IS CRITICAL
          console.log('🔊 Now speaking AI response...')
          await speakText(aiReply)
          console.log('✅ Voice conversation complete!')
        } else {
          console.log('⚠️ Transcript too short, ignoring')
        }
      } else {
        console.log('❌ No valid transcript received')
        // Don't show error for failed transcription, just continue listening
      }

    } catch (error) {
      console.error('❌ Whisper API error:', error)
      
      // Only show error if it's a real problem, not just failed recognition
      if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "🔧 Having trouble with voice recognition. You can still type your message below.",
          sender: 'coach',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsProcessing(false)
    }
  }


  const speakText = async (text: string) => {
    console.log('AI SPEAKING:', text)
    setIsSpeaking(true)
    
    // Use browser TTS - IT WORKS IMMEDIATELY
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel() // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.lang = 'en-US'
      
      utterance.onstart = () => console.log('✅ AI STARTED SPEAKING')
      utterance.onend = () => {
        console.log('✅ AI FINISHED SPEAKING')
        setIsSpeaking(false)
      }
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesis.speak(utterance)
      console.log('🔊 VOICE PLAYING NOW!')
    }
  }


  const getAIResponse = async (userMessage: string, mode: string | null): Promise<string> => {
    try {
      setIsProcessing(true)
      
      const modeContext = {
        casual: "You are having a friendly, casual conversation with a truck driver to build their English confidence.",
        beginner: "You are teaching basic English words and grammar to a beginner truck driver in a simple, friendly way.",
        dot: "You are helping a truck driver practice DOT checkpoint conversations. Simulate being an officer or help them practice responses.",
        truck: "You are teaching truck-related vocabulary like brake, axle, hose, coolant, engine, transmission, etc.",
        mechanic: "You are helping a truck driver practice explaining truck problems to mechanics in clear English.",
        health: "You are helping a truck driver practice health and emergency vocabulary and conversations.",
        progress: "You are reviewing the driver's English learning progress and helping them identify areas to improve."
      }

      const systemPrompt = `You are Checkpoint English Coach, a warm, friendly, and patient AI assistant helping truck drivers master English. 

PERSONALITY: Always be encouraging, supportive, and human-like. Never be robotic. Speak like a caring tutor.

CURRENT MODE: ${mode ? modeContext[mode as keyof typeof modeContext] : "General conversation"}

LANGUAGE SUPPORT: The user interface is set to ${languages.find(l => l.code === selectedLanguage)?.name || 'English'}. If user speaks in their native language, acknowledge it and help them practice the English equivalent.

INSTRUCTIONS:
- Keep responses conversational and encouraging
- Ask follow-up questions to practice more
- Correct mistakes gently and positively
- Use truck driver context in examples
- Always end with motivation
- If user asks for translation, provide it and then practice English
- Support multi-language conversations while focusing on English learning
- Be extra patient with non-native speakers

Remember: You're building their confidence for checkpoints, emergencies, health, repairs, and life in America.`

      const response = await axios.post('http://localhost:3001/api/ai/chat', {
        message: userMessage,
        mode: mode,
        systemPrompt: systemPrompt
      })

      setIsProcessing(false)
      return response.data.reply || "I'm here to help you practice English! What would you like to work on?"
      
    } catch (error) {
      setIsProcessing(false)
      console.error('AI response error:', error)
      
      // Fallback responses
      const fallbackResponses = [
        "That's wonderful! You're making great progress. Keep practicing!",
        "Excellent work! I can see you're really trying. That's the spirit!",
        "Well done! Every word you practice makes you stronger in English.",
        "Amazing effort! You're getting better every day. I believe in you!"
      ]
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    // Get AI response
    try {
      const aiReply = await getAIResponse(textToSend, currentMode)
      
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        sender: 'coach',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, coachResponse])
      
      // Speak the response
      await speakText(aiReply)
      
    } catch (error) {
      console.error('Error getting AI response:', error)
    }
  }

  const selectMode = (mode: CoachMode) => {
    setCurrentMode(mode.id)
    const modeMessage: Message = {
      id: Date.now().toString(),
      text: `🎉 Excellent choice! You've selected **${mode.name}** mode. \n\n${mode.description}\n\n🎤 **Voice Tips:**\n- Click the microphone button to start voice conversation\n- Speak clearly and naturally\n- I'll listen and respond just like ChatGPT!\n\n🚀 Ready when you are! How can I help you today?`,
      sender: 'coach',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, modeMessage])
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Professional Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Professional Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">🚛</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Checkpoint English Coach
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {currentMode 
                    ? `🎯 ${modes.find(m => m.id === currentMode)?.name} Mode Active`
                    : '🌟 Choose your learning adventure'
                  }
                </p>
              </div>
            </div>
            
            {/* Language Selector & Voice Status */}
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              {continuousMode && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">🎤 Listening...</span>
                  <div className="w-8 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-100"
                      style={{ width: `${Math.min(voiceLevel * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {isProcessing && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full border border-blue-200">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin"></div>
                  <span className="text-blue-700 font-medium text-sm">🤖 Processing...</span>
                </div>
              )}
              
              {isSpeaking && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-700 font-medium text-sm">🔊 Speaking...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Mode Selection Cards */}
          {!currentMode && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  className={`group relative p-4 rounded-xl border-2 border-transparent bg-gradient-to-br ${mode.gradient} hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="text-white font-semibold text-sm">{mode.name}</div>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Professional Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`group relative ${
                message.sender === 'user' 
                  ? 'bg-white/60' 
                  : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
              } hover:bg-opacity-80 transition-all duration-200`}
            >
              <div className="py-8 px-6">
                <div className="flex space-x-4">
                  {/* Professional Avatars */}
                  <div className={`relative flex-shrink-0`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-blue-600 to-blue-700'
                    }`}>
                      <span className="text-white text-lg font-bold">
                        {message.sender === 'user' ? '👨‍💼' : '🤖'}
                      </span>
                    </div>
                    {message.sender === 'coach' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-base font-bold text-gray-800">
                        {message.sender === 'user' ? 'You' : 'English Coach'}
                      </div>
                      {message.sender === 'coach' && currentMode && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${modes.find(m => m.id === currentMode)?.gradient} text-white`}>
                          {modes.find(m => m.id === currentMode)?.icon} {modes.find(m => m.id === currentMode)?.name}
                        </span>
                      )}
                    </div>
                    
                    <div className="prose prose-blue max-w-none">
                      <div className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                        {message.text}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500 font-medium">
                        {message.timestamp.toLocaleString()}
                      </div>
                      
                      {message.sender === 'coach' && (
                        <div className="flex items-center space-x-2">
                          <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            👍 Helpful
                          </button>
                          <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            📝 Copy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Enhanced Typing Indicator */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
              <div className="py-8 px-6">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-800 mb-2">
                      English Coach is thinking...
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-500">Crafting the perfect response for you</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Input Area */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          
          <div className="flex items-end space-x-4">
            {/* Professional Voice Button */}
            <div className="relative">
              <button
                onClick={continuousMode ? stopContinuousListening : startContinuousListening}
                disabled={isProcessing}
                className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  continuousMode 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200 animate-pulse' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {continuousMode ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                      <path d="M19 11a7 7 0 0 1-14 0m7 7v4m-4 0h8"/>
                    </svg>
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {continuousMode ? 'Stop Listening' : 'Start Voice Chat'}
                </div>
              </button>
              
              {/* Voice Level Indicator */}
              {continuousMode && voiceLevel > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              )}
            </div>

            {/* Professional Text Input */}
            <div className="flex-1 relative">
              <div className="relative border-2 border-gray-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200 bg-white shadow-sm">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message or use voice to speak with your English Coach..."
                  className="w-full p-4 pr-16 border-0 bg-transparent resize-none focus:outline-none max-h-32 text-gray-800 placeholder-gray-400"
                  rows={1}
                  disabled={isProcessing}
                />
                
                {/* Send Button Inside Input */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !inputText.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Professional Status Bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>OpenAI Whisper Voice Recognition</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>GPT-4 AI Coach</span>
              </span>
              <button
                onClick={() => speakText('Hello! This is OpenAI voice test for truck drivers.')}
                className="ml-4 px-3 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 transition-colors"
              >
                🔊 Test OpenAI Voice
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>🌐 {languages.find(l => l.code === selectedLanguage)?.flag} {languages.find(l => l.code === selectedLanguage)?.name}</span>
              <span>•</span>
              <span>Press Enter to send</span>
              <span>•</span>
              <span>🎤 Voice + 🔊 TTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICoach