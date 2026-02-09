import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TalkingAvatar from '../components/TalkingAvatar'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
}

const SYSTEM_PROMPT = `You are a friendly English conversation partner. Your job is to:

1. Have natural, flowing conversations about ANY topic the user wants
2. Be encouraging and supportive
3. Gently correct major grammar or pronunciation mistakes (but don't over-correct)
4. Ask follow-up questions to keep the conversation going
5. Adjust your vocabulary to match the user's level

Keep responses SHORT (under 40 words) so conversation flows naturally. Be warm, patient, and make the user feel comfortable practicing.

You can discuss: their day, hobbies, work, family, dreams, news, culture, food, travel, sports, movies, music - ANYTHING they want to talk about.

If they seem stuck, suggest a topic or ask an easy question.`

const GREETINGS = [
  "Hey! Great to see you! What would you like to talk about today?",
  "Hi there! Ready to practice some English? What's on your mind?",
  "Hello! I'm excited to chat with you. What should we talk about?",
  "Hey! How's your day going? Tell me anything!",
]

const ConversationPractice = () => {
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [avatarMood, setAvatarMood] = useState<'neutral' | 'speaking' | 'listening' | 'thinking'>('neutral')
  
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start conversation
  const startConversation = async () => {
    setIsStarted(true)
    
    // Random greeting
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    
    const starterMsg: Message = {
      id: '1',
      text: greeting,
      sender: 'coach',
      timestamp: new Date()
    }
    setMessages([starterMsg])
    
    // Speak greeting then start listening
    await speakText(greeting)
    startListening()
  }

  // Voice Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Please use Chrome or Safari for voice features')
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
          setIsThinking(true)
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
          setIsThinking(false)
          
          // Add AI message
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            sender: 'coach',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiMsg])
          
          // Speak response then resume listening
          await speakText(aiResponse)
          startListening()
        }
      }
    }

    recognition.onerror = (error: any) => {
      console.log('Speech recognition error:', error)
      setIsListening(false)
      
      // Auto-restart on non-fatal errors
      if (error.error !== 'aborted' && error.error !== 'no-speech') {
        setTimeout(() => {
          if (isStarted && !isSpeaking && !isThinking) {
            startListening()
          }
        }, 1000)
      }
    }

    recognition.onend = () => {
      if (!isSpeaking && !isThinking && isStarted) {
        setAvatarMood('neutral')
      }
    }

    try {
      recognition.start()
    } catch (e) {
      console.log('Recognition already started')
    }
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
      utterance.rate = 0.9
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
      
      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
    })
  }

  // Get AI response
  const getAIResponse = async (userText: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userText,
        systemPrompt: SYSTEM_PROMPT,
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      })
      
      return response.data.reply || "That's interesting! Tell me more."
      
    } catch (error) {
      console.error('AI Error:', error)
      return "Sorry, I didn't catch that. Can you say it again?"
    }
  }

  // End conversation
  const endConversation = () => {
    stopListening()
    speechSynthesis.cancel()
    setIsStarted(false)
    setMessages([])
    setAvatarMood('neutral')
  }

  // Tap to talk (manual trigger)
  const tapToTalk = () => {
    if (isListening) {
      stopListening()
    } else if (!isSpeaking && !isThinking) {
      startListening()
    }
  }

  // Start screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-md">
          {/* Avatar preview */}
          <div className="mb-8">
            <TalkingAvatar mood="neutral" size="lg" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            AI English Coach
          </h1>
          
          <p className="text-xl text-purple-200 mb-8">
            Practice speaking English about <span className="text-white font-semibold">anything</span> you want
          </p>

          <button
            onClick={startConversation}
            className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all"
          >
            🎤 Start Talking
          </button>

          <p className="mt-6 text-purple-300 text-sm">
            Free conversation • No scripts • Just talk!
          </p>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="mt-8 text-purple-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // Conversation screen
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-black/20">
        <button
          onClick={endConversation}
          className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full text-sm font-medium transition-colors"
        >
          ✕ End
        </button>
        
        <div className="text-white font-medium">
          {isListening && <span className="text-green-400">🎤 Listening...</span>}
          {isSpeaking && <span className="text-blue-400">🔊 Speaking...</span>}
          {isThinking && <span className="text-yellow-400">💭 Thinking...</span>}
          {!isListening && !isSpeaking && !isThinking && <span className="text-gray-400">Tap mic to talk</span>}
        </div>

        <div className="w-16"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        
        {/* Avatar section */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8">
          <TalkingAvatar mood={avatarMood} size="lg" />
          
          {/* Tap to talk button */}
          <button
            onClick={tapToTalk}
            disabled={isSpeaking || isThinking}
            className={`mt-8 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all transform ${
              isListening 
                ? 'bg-green-500 animate-pulse scale-110' 
                : isSpeaking || isThinking
                  ? 'bg-gray-500 opacity-50 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-105'
            }`}
          >
            {isListening ? '🎤' : isSpeaking ? '🔊' : isThinking ? '💭' : '🎤'}
          </button>
          
          <p className="mt-4 text-purple-200 text-sm">
            {isListening ? 'Speak now...' : 'Tap to talk'}
          </p>
        </div>

        {/* Chat section */}
        <div className="lg:w-1/2 flex flex-col bg-black/20 backdrop-blur">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/20 text-white'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  {message.sender === 'coach' && (
                    <button
                      onClick={() => speakText(message.text)}
                      disabled={isSpeaking}
                      className="mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    >
                      🔊 Repeat
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white/20 text-white rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Tips */}
          <div className="p-4 bg-black/20 border-t border-white/10">
            <p className="text-center text-purple-200 text-sm">
              💡 Talk about anything — your day, hobbies, dreams, questions!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationPractice
