import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import TalkingAvatar from '../components/TalkingAvatar'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
}

interface Scenario {
  id: string
  title: string
  icon: string
  description: string
  systemPrompt: string
  starterMessage: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'job-interview',
    title: 'Job Interview',
    icon: '💼',
    description: 'Practice common interview questions',
    systemPrompt: `You are a hiring manager conducting a job interview. Ask common interview questions one at a time: "Tell me about yourself", "Why do you want this job?", "What are your strengths?", "Where do you see yourself in 5 years?", "Do you have any questions for me?". Be professional and encouraging. Keep responses under 30 words. Give brief feedback on answers.`,
    starterMessage: "Hello! Thanks for coming in today. Please have a seat. Let's start with a simple question - can you tell me a little about yourself?"
  },
  {
    id: 'phone-call',
    title: 'Phone Call',
    icon: '📞',
    description: 'Practice making phone calls',
    systemPrompt: `You are a customer service representative or business person receiving a phone call. Help the caller with common phone tasks: making appointments, asking for information, placing orders, reporting problems. Be helpful and professional. Keep responses short (under 30 words). Ask clarifying questions when needed.`,
    starterMessage: "Hello, thank you for calling. How can I help you today?"
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    icon: '🍽️',
    description: 'Order food and talk to servers',
    systemPrompt: `You are a friendly restaurant server. Help customers order food, explain menu items, take special requests, and make recommendations. Be warm and helpful. Keep responses short (under 25 words). Suggest specials and ask about preferences.`,
    starterMessage: "Hi there! Welcome to our restaurant. Can I start you off with something to drink while you look at the menu?"
  },
  {
    id: 'shopping',
    title: 'Shopping',
    icon: '🛒',
    description: 'Practice at stores and shops',
    systemPrompt: `You are a helpful store employee. Assist customers finding items, explaining products, discussing sizes/colors, handling returns, and answering questions about prices and sales. Be friendly and helpful. Keep responses under 25 words.`,
    starterMessage: "Hi, welcome to the store! Are you looking for anything specific today, or just browsing?"
  },
  {
    id: 'doctor',
    title: 'Doctor Visit',
    icon: '🏥',
    description: 'Practice medical conversations',
    systemPrompt: `You are a friendly doctor or medical receptionist. Help patients describe symptoms, schedule appointments, understand instructions, and ask health questions. Be patient and clear. Keep responses under 30 words. Ask about symptoms, duration, and medical history.`,
    starterMessage: "Hello! I'm Dr. Smith. What brings you in today? Please describe what you've been experiencing."
  },
  {
    id: 'free-talk',
    title: 'Free Conversation',
    icon: '💬',
    description: 'Talk about anything you want',
    systemPrompt: `You are a friendly English conversation partner. Have natural, encouraging conversations about any topic - hobbies, travel, family, work, dreams, news. Gently correct major grammar mistakes. Keep responses under 35 words. Be warm, supportive and ask follow-up questions.`,
    starterMessage: "Hey! Great to talk with you. What's on your mind today? We can chat about anything - your day, your interests, whatever you like!"
  },
  {
    id: 'dot-checkpoint',
    title: 'DOT Checkpoint',
    icon: '🚔',
    description: 'For truck drivers - practice with officers',
    systemPrompt: `You are a DOT officer at a weigh station. Ask a truck driver for documents, check their logbook, ask about cargo, and do a routine inspection. Be professional but firm. Keep responses short (under 25 words). Common questions: "License and registration", "Where are you heading?", "What are you hauling?", "Can I see your logbook?"`,
    starterMessage: "Good morning, driver. Please pull forward to the inspection area. License and registration, please."
  }
]

const ConversationPractice = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [avatarMood, setAvatarMood] = useState<'neutral' | 'speaking' | 'listening' | 'thinking'>('neutral')
  
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start scenario
  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    
    // Add starter message
    const starterMsg: Message = {
      id: '1',
      text: scenario.starterMessage,
      sender: 'coach',
      timestamp: new Date()
    }
    setMessages([starterMsg])
    
    // Speak the starter message
    speakText(scenario.starterMessage)
    
    // Start listening after speaking
    setTimeout(() => {
      startListening()
    }, 3000)
  }

  // Voice Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Please use Chrome or Edge browser for voice features')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setAvatarMood('listening')
    }

    recognition.onresult = async (event: any) => {
      const lastResult = event.results[event.results.length - 1]
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript.trim()
        
        if (text.length > 2) {
          // Stop listening while processing
          recognition.stop()
          setIsListening(false)
          setAvatarMood('thinking')
          
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
          
          // Speak response
          await speakText(aiResponse)
          
          // Resume listening
          setTimeout(() => {
            startListening()
          }, 500)
        }
      }
    }

    recognition.onerror = (error: any) => {
      console.log('Speech recognition error:', error)
      if (error.error !== 'no-speech') {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) {}
          }
        }, 1000)
      }
    }

    recognition.onend = () => {
      setAvatarMood('neutral')
    }

    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Text-to-Speech
  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsSpeaking(true)
      setAvatarMood('speaking')
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.85
      utterance.pitch = 1
      utterance.volume = 1
      
      // Get best voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.lang === 'en-US' && (
          voice.name.includes('Google') || 
          voice.name.includes('Samantha') ||
          voice.name.includes('Alex')
        )
      ) || voices.find(voice => voice.lang.startsWith('en'))
      
      if (preferredVoice) utterance.voice = preferredVoice
      
      utterance.onend = () => {
        setIsSpeaking(false)
        setAvatarMood('neutral')
        resolve()
      }
      
      utterance.onerror = () => {
        setIsSpeaking(false)
        setAvatarMood('neutral')
        resolve()
      }
      
      // Cancel any ongoing speech
      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
    })
  }

  // Get AI response
  const getAIResponse = async (userText: string): Promise<string> => {
    if (!selectedScenario) return "Let's keep practicing!"
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userText,
        systemPrompt: selectedScenario.systemPrompt,
        conversationHistory: messages.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      })
      
      return response.data.reply || "I understand. Please continue."
      
    } catch (error) {
      console.error('AI Error:', error)
      return "I'm sorry, can you repeat that?"
    }
  }

  // End session
  const endSession = () => {
    stopListening()
    speechSynthesis.cancel()
    setSelectedScenario(null)
    setMessages([])
    setAvatarMood('neutral')
  }

  // Loading screen
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Scenario selection screen
  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">
              🎤 Conversation Practice
            </h1>
            <p className="text-blue-200 text-lg">
              Choose a scenario and practice real conversations
            </p>
          </div>

          {/* Scenario Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => startScenario(scenario)}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-left hover:bg-white/20 transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="text-4xl mb-4">{scenario.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{scenario.title}</h3>
                <p className="text-blue-200 text-sm">{scenario.description}</p>
              </button>
            ))}
          </div>

          {/* Back button */}
          <div className="text-center mt-10">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-300 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Conversation screen
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col lg:flex-row">
      {/* Avatar Section */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Animated Talking Avatar */}
        <div className="relative z-10">
          <TalkingAvatar mood={avatarMood} size="lg" />
        </div>

        {/* Scenario info */}
        <div className="mt-8 text-center">
          <div className="text-3xl mb-2">{selectedScenario.icon}</div>
          <h2 className="text-xl font-bold text-white">{selectedScenario.title}</h2>
          <p className="text-blue-200 text-sm">{selectedScenario.description}</p>
        </div>

        {/* End Session button */}
        <button
          onClick={endSession}
          className="mt-8 px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full font-medium transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Chat Section */}
      <div className="lg:w-1/2 bg-white/5 backdrop-blur flex flex-col">
        {/* Chat header */}
        <div className="bg-white/10 p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Conversation</h3>
          <p className="text-blue-200 text-sm">Just speak naturally - I'm listening!</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/20 text-white'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.sender === 'coach' && (
                  <button
                    onClick={() => speakText(message.text)}
                    disabled={isSpeaking}
                    className="mt-2 text-xs opacity-70 hover:opacity-100"
                  >
                    🔊 Repeat
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Tips */}
        <div className="bg-white/10 p-4 border-t border-white/10">
          <div className="text-center text-sm text-blue-200">
            <p>💡 Tip: Speak clearly and take your time</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationPractice
