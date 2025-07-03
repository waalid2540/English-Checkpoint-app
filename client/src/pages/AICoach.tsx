import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import UpgradePopup from '../components/UpgradePopup'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
}

const AICoach = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const subscription = useSubscription()
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your English Coach. Click Start to begin speaking!",
      sender: 'coach',
      timestamp: new Date()
    }
  ])
  
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [voiceSpeed, setVoiceSpeed] = useState(0.8)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [continuousMode, setContinuousMode] = useState(false)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState<'daily_limit' | 'dot_questions' | 'premium_feature'>('daily_limit')
  
  const recognitionRef = useRef<any>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Check if user has reached daily limit
  const hasReachedLimit = !subscription.isPremium && subscription.dailyUsage >= subscription.dailyLimit

  const availableVoices = [
    { code: 'alloy', name: 'Alloy', flag: '🎭' },
    { code: 'echo', name: 'Echo', flag: '♂️' },
    { code: 'nova', name: 'Nova', flag: '♀️' },
    { code: 'onyx', name: 'Onyx', flag: '🔥' },
    { code: 'shimmer', name: 'Shimmer', flag: '✨' }
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' }
  ]

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/signup', {
        state: {
          from: '/ai-coach',
          featureName: 'AI Coach',
          message: 'Sign up now to access AI Coach!'
        }
      })
    }
  }, [user, loading, navigate])

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  // Continuous voice conversation
  const startContinuousConversation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please use Chrome browser.')
      return
    }

    setContinuousMode(true)
    startListening()
  }

  const stopContinuousConversation = () => {
    setContinuousMode(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = async (event: any) => {
      const lastResult = event.results[event.results.length - 1]
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim()
        
        if (transcript.length > 2) {
          const userMessage: Message = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, userMessage])
          
          // Get AI response with translation
          const aiReply = await getAIResponse(transcript)
          const coachMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiReply,
            sender: 'coach',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, coachMessage])
          
          // Speak the response
          speakText(aiReply)
        }
      }
    }

    recognition.onerror = () => {
      if (continuousMode) {
        setTimeout(() => recognition.start(), 100)
      }
    }

    recognition.onend = () => {
      if (continuousMode) {
        setTimeout(() => recognition.start(), 100)
      } else {
        setIsListening(false)
      }
    }

    recognition.start()
  }

  // Clean OpenAI TTS implementation
  const speakText = async (text: string) => {
    // Stop any current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    
    setIsSpeaking(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/text-to-speech`, {
        text: text,
        voice: selectedVoice
      }, {
        responseType: 'blob',
        timeout: 10000
      })

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      currentAudioRef.current = audio
      audio.playbackRate = voiceSpeed

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
      }

      await audio.play()
      
    } catch (error) {
      setIsSpeaking(false)
      console.error('TTS Error:', error)
    }
  }

  // Get AI response with translation support
  const getAIResponse = async (userMessage: string): Promise<string> => {
    setIsProcessing(true)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userMessage,
        mode: 'casual',
        language: selectedLanguage,
        systemPrompt: `You are an English coach for truck drivers. Always respond in both the user's selected language (${selectedLanguage}) AND English. Format: "[Response in ${languages.find(l => l.code === selectedLanguage)?.name || 'selected language'}] 🔄 English: [English translation]"`
      }, {
        timeout: 15000
      })
      
      setIsProcessing(false)
      return response.data.reply || "I'm here to help you practice English!"
      
    } catch (error) {
      setIsProcessing(false)
      console.error('AI Error:', error)
      return "Sorry, I had trouble understanding. Can you try again?"
    }
  }

  // Send text message
  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    const aiReply = await getAIResponse(inputText)
    const coachMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiReply,
      sender: 'coach',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, coachMessage])
    speakText(aiReply)
  }

  // Auto-start conversation when component loads
  useEffect(() => {
    if (!loading && user && !hasReachedLimit) {
      setTimeout(() => {
        startContinuousConversation()
      }, 2000)
    }
  }, [loading, user, hasReachedLimit])

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
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
            
            {/* Voice & Language Settings */}
            <div className="flex items-center space-x-1">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-2 py-1"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-black">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="text-xs bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-2 py-1"
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
                className="text-xs bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-2 py-1"
              >
                <option value={0.6} className="text-black">Slow</option>
                <option value={0.8} className="text-black">Normal</option>
                <option value={1.0} className="text-black">Fast</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={message.sender === 'user' 
                ? 'max-w-xs rounded-2xl px-4 py-3 bg-blue-500 text-white' 
                : 'max-w-xs rounded-2xl px-4 py-3 bg-white text-gray-800 shadow-sm border'}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.sender === 'coach' && (
                  <button
                    onClick={() => speakText(message.text)}
                    disabled={isSpeaking}
                    className="mt-2 text-xs text-blue-500 hover:text-blue-700"
                  >
                    🔊 {isSpeaking ? 'Speaking...' : 'Play'}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={continuousMode ? stopContinuousConversation : startContinuousConversation}
            disabled={isProcessing || isSpeaking}
            className={continuousMode 
              ? 'px-6 py-3 bg-red-500 text-white rounded-xl font-semibold' 
              : 'px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600'}
          >
            {continuousMode ? '⏹️ Stop Chat' : '🎤 Start Chat'}
          </button>
          
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type message..."
            className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          
          {inputText.trim() && (
            <button
              onClick={sendMessage}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
            >
              Send
            </button>
          )}
        </div>
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