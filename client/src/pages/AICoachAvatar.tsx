import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
}

const AICoachAvatar = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [avatarConnected, setAvatarConnected] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(true)
  
  const recognitionRef = useRef<any>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sessionTokenRef = useRef<string>('')

  // Initialize Avatar
  useEffect(() => {
    if (!loading && user) {
      initializeAvatar()
    }
  }, [loading, user])

  const initializeAvatar = async () => {
    try {
      console.log('🎬 Initializing HeyGen Avatar...')
      
      const apiToken = import.meta.env.VITE_HEYGEN_API_TOKEN
      
      if (!apiToken || apiToken === 'your_heygen_token_here') {
        console.log('⚠️ No HeyGen token found, using browser TTS')
        // Fallback to browser TTS
        setTimeout(() => {
          setAvatarConnected(true)
          setAvatarLoading(false)
          startListening()
          speakWelcomeMessage()
        }, 2000)
        return
      }
      
      // Get session token from HeyGen
      const sessionResponse = await fetch('https://api.heygen.com/v1/streaming.create_token', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiToken,
          'Content-Type': 'application/json'
        }
      })
      
      if (!sessionResponse.ok) {
        throw new Error(`Session creation failed: ${sessionResponse.status}`)
      }
      
      const sessionData = await sessionResponse.json()
      sessionTokenRef.current = sessionData.data.token
      
      console.log('✅ HeyGen session created successfully')
      
      // Create streaming session
      const streamResponse = await fetch('https://api.heygen.com/v1/streaming.new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionTokenRef.current}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quality: 'high',
          avatar_name: import.meta.env.VITE_HEYGEN_AVATAR_ID || 'default'
        })
      })
      
      const streamData = await streamResponse.json()
      
      if (streamData.data && streamData.data.sdp) {
        console.log('✅ Setting up WebRTC connection...')
        await setupWebRTC(streamData.data.sdp, streamData.data.ice_servers)
        setAvatarConnected(true)
        setAvatarLoading(false)
        
        // Start conversation
        setTimeout(() => {
          startListening()
          speakWelcomeMessage()
        }, 2000)
      } else {
        throw new Error('No streaming data received')
      }
      
    } catch (error) {
      console.error('❌ Avatar initialization failed:', error)
      console.log('🔄 Falling back to browser TTS')
      
      // Fallback to browser TTS
      setAvatarLoading(false)
      setAvatarConnected(true) // Still show as connected for UI
      setTimeout(() => {
        startListening()
        speakWelcomeMessage()
      }, 1000)
    }
  }
  
  const setupWebRTC = async (sdp: string, iceServers: any[]) => {
    const pc = new RTCPeerConnection({ iceServers })
    peerConnectionRef.current = pc

    pc.ontrack = (event) => {
      console.log('📺 Received video stream from HeyGen')
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0]
        videoRef.current.style.opacity = '1'
      }
    }

    await pc.setRemoteDescription({ type: 'offer', sdp })
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    // Send answer back to HeyGen
    const startResponse = await fetch('https://api.heygen.com/v1/streaming.start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionTokenRef.current}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sdp: answer.sdp
      })
    })
    
    if (!startResponse.ok) {
      throw new Error(`WebRTC start failed: ${startResponse.status}`)
    }
    
    console.log('✅ WebRTC connection established')
  }

  const speakWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: '1',
      text: "Hello! I'm your English coach. Just start speaking and I'll help you practice!",
      sender: 'coach',
      timestamp: new Date()
    }
    setMessages([welcomeMsg])
    speakWithAvatar("Hello! I'm your English coach. Just start speaking and I'll help you practice!")
  }

  // Voice Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Please use Chrome browser for voice features')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
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
        const text = lastResult[0].transcript.trim()
        
        if (text.length > 3) {
          // Add user message
          const userMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, userMsg])
          
          // Get AI response
          const aiResponse = await getAIResponse(text)
          
          // Add AI message
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            sender: 'coach',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiMsg])
          
          // Avatar speaks
          speakWithAvatar(aiResponse)
        }
      }
    }

    recognition.onerror = (error: any) => {
      console.log('Speech recognition error:', error)
      setTimeout(() => {
        if (recognition) recognition.start()
      }, 1000)
    }

    recognition.onend = () => {
      setTimeout(() => {
        if (recognition) recognition.start()
      }, 1000)
    }

    recognition.start()
  }

  // Avatar Speech with HeyGen Integration
  const speakWithAvatar = async (text: string) => {
    setIsSpeaking(true)
    
    // Try HeyGen first if session token exists
    if (sessionTokenRef.current) {
      try {
        console.log('🤖 HeyGen avatar speaking:', text.substring(0, 30))
        
        const response = await fetch('https://api.heygen.com/v1/streaming.task', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionTokenRef.current}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            task_type: 'talk'
          })
        })
        
        if (response.ok) {
          console.log('✅ HeyGen avatar speaking successfully')
          // Estimate speaking duration based on text length
          const duration = Math.max(2000, text.length * 60)
          setTimeout(() => {
            setIsSpeaking(false)
          }, duration)
          return
        } else {
          console.log('⚠️ HeyGen speech failed, using browser TTS')
        }
      } catch (error) {
        console.error('❌ HeyGen speech error:', error)
      }
    }
    
    // Fallback to browser TTS
    console.log('🔊 Using browser TTS fallback')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    
    // Use best English voice
    const voices = speechSynthesis.getVoices()
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Female') || voice.name.includes('Google'))
    )
    if (englishVoice) utterance.voice = englishVoice
    
    utterance.onend = () => {
      setIsSpeaking(false)
    }
    
    utterance.onerror = () => {
      setIsSpeaking(false)
    }
    
    speechSynthesis.speak(utterance)
  }

  // Get AI response
  const getAIResponse = async (userText: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userText,
        systemPrompt: `You are a professional English coach for truck drivers. Have natural, encouraging conversations. Keep responses under 40 words and focus on practical English they need for trucking work.`
      })
      
      return response.data.reply || "That's great! Keep practicing - you're doing well!"
      
    } catch (error) {
      console.error('AI Error:', error)
      return "I'm here to help you practice English. What would you like to talk about?"
    }
  }

  // Loading screen
  if (loading || avatarLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Loading Your AI Coach
          </h2>
          <p className="text-gray-600 text-lg">Preparing your personalized English practice session...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Avatar Video Section */}
      <div className="w-2/3 bg-gradient-to-br from-gray-900 to-blue-900 relative overflow-hidden">
        {/* Animated Avatar Placeholder */}
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-400/10 rounded-full animate-pulse delay-1000"></div>
          
          {/* Avatar Placeholder */}
          <div className="relative z-10 text-center">
            <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-6xl text-white">👨‍🏫</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">English Coach</h2>
            <p className="text-blue-200 text-lg">Ready to help you practice!</p>
          </div>
          
          {/* Video element for future HeyGen integration */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            style={{ display: avatarConnected ? 'block' : 'none' }}
          />
        </div>
        
        {/* Status Overlay */}
        <div className="absolute top-6 left-6 bg-black/50 backdrop-blur text-white px-4 py-3 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${avatarConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className="text-sm font-medium">
              {isSpeaking ? '🗣️ Speaking' : isListening ? '🎤 Listening' : '✅ Ready'}
            </span>
          </div>
        </div>

        {/* Voice Indicator */}
        {isListening && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500/90 backdrop-blur text-white px-6 py-3 rounded-full flex items-center space-x-3 animate-pulse shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
              <span className="font-semibold">Listening for your voice...</span>
            </div>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-500/90 backdrop-blur text-white px-6 py-3 rounded-full flex items-center space-x-3 shadow-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-4 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-6 bg-white rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-4 bg-white rounded-full animate-pulse delay-150"></div>
              </div>
              <span className="font-semibold">Speaking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-1/3 bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">AI English Coach</h1>
              <p className="text-sm opacity-90">Professional conversation practice</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  {message.sender === 'coach' && (
                    <button
                      onClick={() => speakWithAvatar(message.text)}
                      disabled={isSpeaking}
                      className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium"
                    >
                      🔊 {isSpeaking ? 'Speaking...' : 'Repeat'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-gray-500">Start speaking to begin your conversation!</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-2">How to Use</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Just speak naturally</p>
              <p>✅ I'll listen and respond</p>
              <p>✅ No buttons to press</p>
              <p>✅ Practice real conversations</p>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-500">
                {isListening ? 'Voice Active' : 'Starting...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICoachAvatar