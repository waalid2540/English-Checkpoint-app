import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import { dotQuestions } from '../data/dot-questions'
import UpgradePopup from '../components/UpgradePopup'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'

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
  isPremium?: boolean
}

const AICoach = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const subscription = useSubscription()
  
  // Redirect to signup if not authenticated
  useEffect(() => {
    console.log('AICoach - Auth state:', { user: !!user, loading })
    
    // Use a timeout to ensure auth has had time to load
    const timer = setTimeout(() => {
      if (!user) {
        console.log('AICoach - No user after timeout, redirecting to signup')
        navigate('/signup', {
          state: {
            from: '/ai-coach',
            featureName: 'AI Coach',
            message: 'Sign up now to access AI Coach!'
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
    console.log('AICoach - Still loading auth...')
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
  
  console.log('AICoach - Rendering component, user:', user?.email || 'No user')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your English Coach. Start speaking!",
      sender: 'coach',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [currentMode, setCurrentMode] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [voiceSpeed, setVoiceSpeed] = useState(0.8)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isDOTPracticeMode, setIsDOTPracticeMode] = useState(false)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState<'daily_limit' | 'dot_questions' | 'premium_feature'>('daily_limit')
  const [userProfile, setUserProfile] = useState<any>({})
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)


  // Check if user has reached daily limit
  const hasReachedLimit = !subscription.isPremium && subscription.dailyUsage >= subscription.dailyLimit

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
    }
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
  ]

  // Available OpenAI TTS voices
  const availableVoices = [
    { code: 'alloy', name: 'Alloy (Balanced)', flag: '🎭' },
    { code: 'echo', name: 'Echo (Male)', flag: '♂️' },
    { code: 'fable', name: 'Fable (Expressive)', flag: '🎪' },
    { code: 'nova', name: 'Nova (Female)', flag: '♀️' },
    { code: 'onyx', name: 'Onyx (Deep Male)', flag: '🔥' },
    { code: 'shimmer', name: 'Shimmer (Soft Female)', flag: '✨' }
  ]

  // Auto-start voice when component loads
  useEffect(() => {
    if (hasReachedLimit) {
      setUpgradeTrigger('daily_limit')
      setShowUpgradePopup(true)
    } else {
      // Auto-start voice conversation
      setTimeout(() => {
        startVoiceConversation()
      }, 1000)
    }
  }, [hasReachedLimit])

  // Browser Speech Recognition - WORKS IMMEDIATELY
  const startVoiceConversation = () => {
    console.log('🎤 Starting voice conversation...')
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Please use Chrome browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('✅ Voice recognition started')
      setIsListening(true)
      setContinuousMode(true)
    }

    recognition.onresult = async (event: any) => {
      // Stop any AI speaking when user starts talking (interruption)
      if (isSpeaking) {
        console.log('🛑 User interrupted AI - stopping speech')
        setIsSpeaking(false)
        // Stop any audio playing
        const audioElements = document.querySelectorAll('audio')
        audioElements.forEach(audio => {
          audio.pause()
          audio.currentTime = 0
        })
      }
      
      const lastResult = event.results[event.results.length - 1]
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim()
        console.log('🗣️ You said:', transcript)
        
        if (transcript.length > 2) {
          // Show user message
          const userMessage: Message = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, userMessage])
          
          // Get AI response and speak it back (voice conversation)
          const aiReply = await getAIResponse(transcript, currentMode)
          
          const coachResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: aiReply,
            sender: 'coach',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, coachResponse])
          
          // AI speaks back in voice conversations
          console.log('🎙️ AI will speak:', aiReply.substring(0, 30))
          speakText(aiReply)
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('❌ Speech error:', event.error)
    }

    recognition.onend = () => {
      console.log('🔄 Restarting voice recognition...')
      if (continuousMode) {
        setTimeout(() => recognition.start(), 100)
      }
    }

    recognition.start()
  }

  const stopVoiceConversation = () => {
    console.log('⏹️ Stopping voice conversation')
    setContinuousMode(false)
    setIsListening(false)
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Professional OpenAI TTS Implementation
  const speakText = async (text: string) => {
    setIsSpeaking(true)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/text-to-speech`, {
        text: text,
        voice: selectedVoice
      }, {
        responseType: 'blob'
      })
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.playbackRate = voiceSpeed
      
      // Handle autoplay restrictions professionally
      audio.play().then(() => {
        // Audio playing successfully
      }).catch(() => {
        // Autoplay blocked - enable manual play
        setAudioUrl(audioUrl)
      })
      
      audio.onended = () => {
        setIsSpeaking(false)
        setAudioUrl(null)
        URL.revokeObjectURL(audioUrl)
      }
      
    } catch (error) {
      setIsSpeaking(false)
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

      const systemPrompt = `You are Checkpoint English Coach, an EXTREMELY intelligent, warm, and multilingual AI assistant specializing in helping truck drivers master English. You have perfect memory and exceptional language skills.

🧠 ENHANCED INTELLIGENCE:
- PERFECT MEMORY: Remember every detail they've shared (name, routes, family, experiences, preferences)
- CONTEXT MASTERY: Reference previous conversations naturally ("Remember when you told me about...")
- ADAPTIVE LEARNING: Adjust teaching based on their progress and learning style
- CULTURAL AWARENESS: Understand cultural nuances and trucking industry specifics

🌍 EXPERT MULTILINGUAL SUPPORT:
- NATIVE-LEVEL ACCURACY: Provide perfectly accurate translations in Somali, Spanish, Arabic, French, Portuguese, Hindi, Russian, etc.
- DETECT & RESPOND: Automatically detect ANY language and respond fluently
- CULTURAL CONTEXT: Use culturally appropriate phrases and expressions
- DUAL FORMAT: "[Perfect Native Language] 🔄 English: [Natural English + Teaching]"

📚 SOMALI LANGUAGE EXPERTISE:
- Use proper Somali grammar and vocabulary
- Common phrases: "Waan ku caawin karaa" (I can help you), "Sidee tahay?" (How are you?), "Mahadsanid" (Thank you)
- Truck-related Somali terms: "Baabuur weyn" (truck), "Waddo" (road), "Xamuul" (cargo)
- Cultural respect: Use appropriate greetings and polite forms

🚛 TRUCKING INDUSTRY MASTERY:
- DOT regulations, HOS rules, inspection procedures
- Route knowledge, truck stops, weigh stations
- Mechanical terms, cargo types, logistics
- Real-world scenarios and challenges

💬 CONVERSATION MEMORY & FLOW:
- REMEMBER: Names, family, home countries, routes, experiences, goals
- REFERENCE: "How's that route to Chicago you mentioned?" "Is your son still learning English?"
- BUILD: Each conversation builds on previous ones naturally
- PERSONAL: Ask about their specific situations and follow up later

CURRENT MODE: ${mode ? modeContext[mode as keyof typeof modeContext] : "General conversation"}

🎯 ENHANCED RESPONSE STYLE:
- Show you remember previous conversations
- Ask specific follow-up questions about their life
- Provide culturally sensitive and industry-specific advice
- Use their name if they've shared it
- Reference their specific truck routes, family, or challenges
- Correct English naturally while maintaining conversation flow

💡 MEMORY EXAMPLES:
- "How's that delivery to Houston going that you mentioned yesterday?"
- "Did your family back in Somalia get the money you sent?"
- "Remember you had trouble with 'inspection' - you're getting much better!"
- "You said you're driving the I-10 route - that's a long one!"

🔥 TRANSLATION ACCURACY:
- Somali: Use proper grammar, cultural context, truck terminology
- Spanish: Regional variations (Mexican, Central American truckers)
- Arabic: Formal and colloquial as appropriate
- All languages: 100% accuracy with cultural sensitivity

Remember: You're not just teaching English - you're a trusted friend who remembers everything and genuinely cares about their success, family, and trucking career.`

      // Send conversation history for better memory
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))

      // Get user profile for persistent memory
      const savedProfile = localStorage.getItem(`user_profile_${user?.id}`)
      const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}

      console.log('📡 Sending request to:', `${API_BASE_URL}/api/ai/chat`)
      console.log('📡 Request data:', { message: userMessage.substring(0, 50), mode, hasHistory: conversationHistory.length })
      
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userMessage,
        mode: mode,
        systemPrompt: systemPrompt,
        language: selectedLanguage,
        conversationHistory: conversationHistory,
        userProfile: currentProfile,
        enhancedMode: true, // Flag for smarter AI processing
        userId: user?.id
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ AI response received:', response.data.reply?.substring(0, 100))

      setIsProcessing(false)
      
      // Update user profile with new information from AI response
      if (response.data.updatedProfile) {
        localStorage.setItem(`user_profile_${user?.id}`, JSON.stringify(response.data.updatedProfile))
        setUserProfile(response.data.updatedProfile)
      }
      
      return response.data.reply || "I'm here to help you practice English! What would you like to work on?"
      
    } catch (error) {
      setIsProcessing(false)
      console.error('❌ AI response error:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      
      // Better mobile error handling
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        console.log('🔄 Network issue detected, retrying...')
        // Could implement retry logic here
      }
      
      const fallbackResponses = [
        "That's wonderful! You're making great progress. Keep practicing!",
        "Excellent work! I can see you're really trying. That's the spirit!",
        "Well done! Every word you practice makes you stronger in English.",
        "Amazing effort! You're getting better every day. I believe in you!"
      ]
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  const handleSendMessage = async (messageText?: string, shouldSpeak: boolean = false) => {
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
      
      // Speak the response if it came from voice input OR if voice is enabled
      if (shouldSpeak || isListening) {
        console.log('🗣️ Speaking AI response - shouldSpeak:', shouldSpeak, 'isListening:', isListening)
        speakText(aiReply)
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error)
    }
  }

  const selectMode = (mode: CoachMode) => {
    setCurrentMode(mode.id)
    
    if (mode.id === 'dot-practice') {
      setIsDOTPracticeMode(true)
      setCurrentQuestionIndex(0)
      const firstQuestion = dotQuestions[0]
      const modeMessage: Message = {
        id: Date.now().toString(),
        text: `🚓 **DOT Q&A Practice Mode Activated!**

I'll ask you real DOT checkpoint questions. Practice your responses!

**📚 Available:**
- Questions 1-10: FREE 🆓
- Questions 11-200: Premium Upgrade Required 🔒

**🎯 Question 1 of 200:**

**Officer:** "${firstQuestion.officer}"

**Your turn!** Practice your response, then say "next question" or "show answer" to see the sample response.`,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, modeMessage])
    } else {
      setIsDOTPracticeMode(false)
      const modeMessage: Message = {
        id: Date.now().toString(),
        text: `🎉 Excellent choice! You've selected **${mode.name}** mode. 

${mode.description}

🎤 **Voice Tips:**
- Click the microphone button to start voice conversation
- Speak clearly and naturally
- I'll listen and respond just like a human conversation!

🚀 Ready when you are! How can I help you today?`,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, modeMessage])
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Modern Header with Voice Controls */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">AI English Coach</h1>
                {isListening && <p className="text-xs text-blue-100">🎤 Listening...</p>}
                {isSpeaking && <p className="text-xs text-purple-100">🔊 Speaking...</p>}
              </div>
            </div>
            
            {/* Voice Settings + Test Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => speakText('Hello! This is a voice test. Can you hear me?')}
                className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600"
              >
                Test Voice
              </button>
              
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="text-xs bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-2 py-1 backdrop-blur"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.code} value={voice.code} className="text-black">
                    {voice.flag} {voice.name}
                  </option>
                ))}
              </select>
              
              <select
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                className="text-xs bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-2 py-1 backdrop-blur"
              >
                <option value={0.6} className="text-black">Slow</option>
                <option value={0.8} className="text-black">Normal</option>
                <option value={1.0} className="text-black">Fast</option>
                <option value={1.2} className="text-black">Faster</option>
              </select>
            </div>
          </div>
        </div>
      </div>
          
        {/* Mode Selection */}
        {!currentMode && (
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={async () => {
                    if (mode.isPremium && !subscription.isPremium) {
                      const upgradePrompt = confirm(
                        mode.name + " is a Premium feature! Upgrade to Premium to access unlimited conversations and all advanced features. Start your 7-day free trial now?"
                      )
                      if (upgradePrompt) {
                        try {
                          const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
                          
                          const response = await fetch(API_BASE_URL + '/api/stripe/create-checkout-session', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': 'Bearer ' + (session?.access_token || '')
                            },
                            body: JSON.stringify({
                              priceId: 'price_1RcfPeI4BWGkGyQalTvXi4RP',
                              successUrl: window.location.origin + '/?success=true',
                              cancelUrl: window.location.origin + '/ai-coach?canceled=true'
                            })
                          })
                          
                          const data = await response.json()
                          if (data.url) {
                            window.location.href = data.url
                          }
                        } catch (err) {
                          console.error('Stripe error:', err)
                        }
                      }
                    } else {
                      selectMode(mode)
                    }
                  }}
                  className={mode.isPremium && !subscription.isPremium 
                    ? 'group relative p-4 rounded-xl bg-gray-400 opacity-75 hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl' 
                    : 'group relative p-4 rounded-xl bg-gradient-to-br ' + mode.gradient + ' hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl'}
                >
                  {mode.isPremium && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {subscription.isPremium ? '⭐' : '🔒'}
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="text-white font-semibold text-sm">{mode.name}</div>
                    {mode.isPremium && !subscription.isPremium && (
                      <div className="text-xs text-white opacity-80 mt-1">Premium</div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-white bg-opacity-20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              ))}
            </div>
          </div>
        )}

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-3">
          {messages.map((message) => {
            const isUser = message.sender === 'user'
            return (
            <div key={message.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
              <div className={isUser 
                ? 'max-w-xs rounded-2xl px-4 py-3 bg-blue-500 text-white' 
                : 'max-w-xs rounded-2xl px-4 py-3 bg-white text-gray-800 shadow-sm border'}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.sender === 'coach' && (
                  <button
                    onClick={() => {
                      if (audioUrl) {
                        const audio = new Audio(audioUrl)
                        audio.playbackRate = voiceSpeed
                        audio.play()
                      } else {
                        speakText(message.text)
                      }
                    }}
                    disabled={isSpeaking}
                    className="mt-2 text-xs text-blue-500 hover:text-blue-700"
                  >
                    🔊 {isSpeaking ? 'Speaking...' : 'Play Audio'}
                  </button>
                )}
              </div>
            </div>
            )
          })}
          
          {/* Typing Indicator */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 bg-opacity-80">
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

      {/* Simple One-Button Voice Interface */}
      <div className="bg-white border-t p-4">
        {!continuousMode ? (
          <div className="text-center">
            <button
              onClick={startVoiceConversation}
              disabled={isProcessing}
              className="w-full py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🎤 Start Voice Conversation
            </button>
            <p className="text-gray-500 text-sm mt-2">Tap to start speaking with your AI coach</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Listening...</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={stopVoiceConversation}
                className="flex-1 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                ⏹️ Stop
              </button>
              
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Or type here..."
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              />
              
              {inputText.trim() && (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Upgrade Popup */}
      <UpgradePopup 
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        trigger={upgradeTrigger}
      />
    </div>
  )
}

export default AICoach