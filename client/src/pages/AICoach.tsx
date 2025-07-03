import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
  correction?: string
}

const AICoach = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [conversationActive, setConversationActive] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' }
  ]

  // Start voice conversation
  const startConversation = () => {
    setIsStarted(true)
    setConversationActive(true)
    
    // Add welcome message
    const welcomeMsg: Message = {
      id: 'welcome',
      text: "Good morning! I'm a DOT officer conducting a routine inspection. Please approach my window and greet me to begin.",
      sender: 'coach',
      timestamp: new Date()
    }
    setMessages([welcomeMsg])
    
    // Speak welcome message and start continuous listening
    speakText(welcomeMsg.text).then(() => {
      startContinuousListening()
    })
  }

  // Continuous listening system
  const startContinuousListening = () => {
    if (!conversationActive) return
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      console.log('🎤 Continuous listening started')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript.trim().length > 3) {
        console.log('📝 Final transcript:', finalTranscript)
        handleUserSpeech(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('🚫 Speech recognition error:', event.error)
      
      if (event.error === 'not-allowed') {
        alert('🎤 Please allow microphone access to use voice features')
        return
      }
      
      // Restart recognition after error
      setTimeout(() => {
        if (conversationActive && !isSpeaking) {
          startContinuousListening()
        }
      }, 1000)
    }

    recognition.onend = () => {
      console.log('🛑 Speech recognition ended')
      setIsListening(false)
      
      // Restart recognition if conversation is still active
      setTimeout(() => {
        if (conversationActive && !isSpeaking) {
          startContinuousListening()
        }
      }, 500)
    }

    recognition.start()
  }

  // Handle user speech input
  const handleUserSpeech = async (transcript: string) => {
    if (!conversationActive || isSpeaking || isProcessing) return

    // Stop current recognition to prevent overlap
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: transcript,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    // Get AI response
    await getCoachingResponse(transcript)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConversation()
    }
  }, [])

  // Get AI coaching response with REAL conversation flow
  const getCoachingResponse = async (userText: string) => {
    setIsProcessing(true)
    
    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))

      const systemPrompt = `You are a DOT officer conducting a routine truck inspection. This is a REAL conversation simulation.

CRITICAL RULES:
1. Act EXACTLY like a real DOT officer - professional, direct, but friendly
2. ALWAYS ask the next logical question to keep conversation flowing
3. Follow the EXACT DOT checkpoint procedure step by step
4. Keep responses SHORT (15-25 words max)
5. Speak naturally like you're really there

MANDATORY CHECKPOINT SEQUENCE:
1. Greeting → "Good morning. License and registration please."
2. Documents → "Thank you. What are you hauling today?"
3. Cargo → "Where are you headed?"
4. Route → "How long have you been driving today?" 
5. Hours → "Any mechanical issues with your truck?"
6. Condition → "Alright, please step out for a quick vehicle inspection."
7. Inspection → "Everything looks good. Drive safely."

NEVER BREAK CHARACTER. You are NOT a coach - you are a DOT officer doing your job.
ALWAYS move to the next step in the sequence.
If they make grammar mistakes, ignore them - real officers don't correct English.`

      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userText,
        systemPrompt: systemPrompt,
        language: selectedLanguage,
        conversationHistory: conversationHistory,
        enhancedMode: true
      }, {
        timeout: 10000
      })
      
      const coachResponse = response.data.reply || "License and registration, please."
      
      // Add coach message
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: coachResponse,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, coachMsg])
      
      setIsProcessing(false)
      
      // Speak the response and continue conversation
      await speakText(coachResponse)
      
      // Restart continuous listening immediately after speaking
      setTimeout(() => {
        if (conversationActive) {
          startContinuousListening()
        }
      }, 300)
      
    } catch (error) {
      console.error('❌ AI Error:', error)
      setIsProcessing(false)
      
      const fallbackMsg = "I didn't catch that. Could you repeat?"
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: fallbackMsg,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
      
      await speakText(fallbackMsg)
      
      // Continue listening even after errors
      setTimeout(() => {
        if (conversationActive) {
          startContinuousListening()
        }
      }, 500)
    }
  }

  // Text-to-Speech with fallback
  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsSpeaking(true)
      
      try {
        // Try ElevenLabs or OpenAI TTS first (you can add this later)
        // For now, use reliable browser TTS
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.8
        utterance.pitch = 1
        utterance.volume = 1
        
        // Use best available English voice
        const voices = speechSynthesis.getVoices()
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex'))
        ) || voices.find(voice => voice.lang.startsWith('en'))
        
        if (englishVoice) {
          utterance.voice = englishVoice
        }
        
        utterance.onend = () => {
          setIsSpeaking(false)
          resolve()
        }
        
        utterance.onerror = () => {
          console.error('🔊 TTS Error')
          setIsSpeaking(false)
          resolve()
        }
        
        speechSynthesis.speak(utterance)
        
      } catch (error) {
        console.error('🔊 Speech synthesis error:', error)
        setIsSpeaking(false)
        resolve()
      }
    })
  }

  // Stop conversation
  const stopConversation = () => {
    setIsStarted(false)
    setConversationActive(false)
    setIsListening(false)
    setIsSpeaking(false)
    setIsProcessing(false)
    
    // Clear any timeouts
    if (conversationTimeoutRef.current) {
      clearTimeout(conversationTimeoutRef.current)
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    // Stop speech synthesis
    speechSynthesis.cancel()
    
    console.log('🛑 Conversation stopped')
  }

  // Repeat last AI message
  const repeatLastMessage = () => {
    const lastCoachMessage = messages.filter(m => m.sender === 'coach').pop()
    if (lastCoachMessage) {
      speakText(lastCoachMessage.text)
    }
  }

  // Translate message
  const translateMessage = async (text: string) => {
    if (selectedLanguage === 'en') return
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/translate`, {
        text: text,
        targetLanguage: selectedLanguage
      })
      
      if (response.data.translation) {
        await speakText(response.data.translation)
      }
    } catch (error) {
      console.error('Translation error:', error)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl">🚛</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">DOT English Coach</h1>
              <p className="text-sm opacity-90">
                {isListening ? '🎤 Listening - Speak Now' : 
                 isSpeaking ? '🗣️ Officer Speaking...' : 
                 isProcessing ? '🧠 Processing...' : 
                 conversationActive ? '🔄 Conversation Active' : 
                 isStarted ? '✅ Ready to Start' : 'Tap to Begin'}
              </p>
            </div>
          </div>
          
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-sm bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-2 py-1"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="text-black">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !isStarted && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🚔</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">REAL DOT Checkpoint Simulation</h2>
            <p className="text-gray-600 text-lg mb-6">Have actual conversations with a DOT officer</p>
            <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
              <h3 className="font-bold text-gray-800 mb-2">🚛 What You'll Practice:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Greeting the officer professionally</li>
                <li>• Showing your documents</li>
                <li>• Discussing your cargo and route</li>
                <li>• Answering inspection questions</li>
                <li>• Complete checkpoint conversation</li>
              </ul>
              <div className="mt-3 p-2 bg-green-50 rounded">
                <p className="text-xs text-green-700 font-medium">
                  ✅ Continuous conversation - no buttons to press!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm rounded-2xl px-4 py-3 shadow-sm ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                
                {message.sender === 'coach' && (
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => speakText(message.text)}
                      disabled={isSpeaking}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                    >
                      🔊 Repeat
                    </button>
                    
                    {selectedLanguage !== 'en' && (
                      <button
                        onClick={() => translateMessage(message.text)}
                        disabled={isSpeaking}
                        className="text-xs text-green-500 hover:text-green-700 font-medium"
                      >
                        🌍 Translate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-sm text-gray-600">Coach is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          {!isStarted ? (
            <button
              onClick={startConversation}
              className="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-green-600 transition-colors"
            >
🚔 START CHECKPOINT CONVERSATION
            </button>
          ) : (
            <div className="space-y-3">
              {/* Status Indicator */}
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  isListening ? 'bg-red-500 animate-pulse' : 
                  isSpeaking ? 'bg-blue-500 animate-pulse' :
                  isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
                <p className="text-sm text-gray-600">
                  {isListening ? '🎤 Speak now - Officer is listening!' : 
                   isSpeaking ? '👮‍♂️ DOT Officer is speaking...' :
                   isProcessing ? '🧠 Officer is responding...' : 
                   conversationActive ? '🔄 Conversation in progress' : 'Ready for conversation'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={repeatLastMessage}
                  disabled={isSpeaking || messages.filter(m => m.sender === 'coach').length === 0}
                  className="py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  🔊 Repeat
                </button>
                
                <button
                  onClick={stopConversation}
                  className="py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
                >
                  ⏹️ Stop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Instructions */}
      <div className="bg-gray-100 p-3 text-center">
        <p className="text-xs text-gray-600">
          📱 Mobile: Allow microphone access • 🎧 Use headphones for better experience
        </p>
      </div>
    </div>
  )
}

export default AICoach