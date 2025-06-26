import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useMCP } from '../lib/mcp-client'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
  type?: 'text' | 'mcp-response'
  mcpTool?: string
}

const MCPEnhancedAICoach = () => {
  const subscription = useSubscription()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your enhanced AI Coach with MCP tools! 🚛✨\n\nI can help you with:\n🔧 DOT regulations\n📚 Trucking vocabulary\n🎯 Learning progress tracking\n🎭 Checkpoint scenarios\n🎤 Pronunciation analysis\n\nTry saying: 'Show me DOT safety regulations' or 'Give me mechanical vocabulary'",
      sender: 'coach',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('en')
  const [voiceSpeed, setVoiceSpeed] = useState(0.8)
  
  const recognitionRef = useRef<any>(null)
  const { user } = useAuth()
  const mcp = useMCP()

  // Available gTTS voices
  const availableVoices = [
    { code: 'en', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'en-au', name: 'English (Australia)', flag: '🇦🇺' }
  ]

  // MCP-aware conversation modes
  const mcpModes = [
    {
      id: 'dot-regulations',
      name: 'DOT Regulations',
      icon: '🚓',
      description: 'Learn DOT rules with real-time regulation lookup',
      color: 'bg-red-500',
      mcpTools: ['get_dot_regulations']
    },
    {
      id: 'vocabulary',
      name: 'Smart Vocabulary',
      icon: '📚',
      description: 'Learn trucking terms with MCP vocabulary database',
      color: 'bg-blue-500',
      mcpTools: ['get_trucking_vocabulary']
    },
    {
      id: 'pronunciation',
      name: 'Pronunciation Coach',
      icon: '🎤',
      description: 'Get AI-powered pronunciation analysis',
      color: 'bg-green-500',
      mcpTools: ['analyze_pronunciation']
    },
    {
      id: 'scenarios',
      name: 'Checkpoint Practice',
      icon: '🎭',
      description: 'Practice with realistic checkpoint scenarios',
      color: 'bg-purple-500',
      mcpTools: ['get_checkpoint_scenarios']
    }
  ]

  // Browser Speech Recognition
  const startVoiceConversation = () => {
    console.log('🎤 Starting MCP-enhanced voice conversation...')
    
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
      setIsListening(true)
      setContinuousMode(true)
    }

    recognition.onresult = async (event: any) => {
      const lastResult = event.results[event.results.length - 1]
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim()
        console.log('🗣️ You said:', transcript)
        
        if (transcript.length > 2) {
          await handleUserMessage(transcript)
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('❌ Speech error:', event.error)
    }

    recognition.onend = () => {
      if (continuousMode) {
        setTimeout(() => recognition.start(), 100)
      }
    }

    recognition.start()
  }

  const stopVoiceConversation = () => {
    setContinuousMode(false)
    setIsListening(false)
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Enhanced message handling with MCP
  const handleUserMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      // Check if message requires MCP tools
      const mcpResponse = await processMCPRequest(messageText)
      
      if (mcpResponse) {
        // MCP tool was used
        const mcpMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: mcpResponse.content,
          sender: 'coach',
          timestamp: new Date(),
          type: 'mcp-response',
          mcpTool: mcpResponse.tool
        }
        setMessages(prev => [...prev, mcpMessage])
        speakText(mcpResponse.content)
        
        // Track learning progress if relevant
        if (user && mcpResponse.tool !== 'get_dot_regulations') {
          await mcp.trackLearningProgress(
            user.id,
            mcpResponse.tool.replace('get_', ''),
            85, // Mock score
            2 // Mock duration
          )
        }
      } else {
        // Regular AI conversation
        const aiReply = await getRegularAIResponse(messageText)
        const coachResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiReply,
          sender: 'coach',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, coachResponse])
        speakText(aiReply)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble right now, but I'm still here to help! Try asking about DOT regulations or trucking vocabulary.",
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  // Process MCP requests
  const processMCPRequest = async (message: string): Promise<{content: string, tool: string} | null> => {
    const lowerMessage = message.toLowerCase()
    
    // DOT regulations
    if (lowerMessage.includes('dot') || lowerMessage.includes('regulation') || lowerMessage.includes('safety') || lowerMessage.includes('hours of service')) {
      let category = 'safety'
      if (lowerMessage.includes('hours') || lowerMessage.includes('driving time')) category = 'hours-of-service'
      if (lowerMessage.includes('inspection') || lowerMessage.includes('vehicle check')) category = 'vehicle-inspection'
      if (lowerMessage.includes('license') || lowerMessage.includes('cdl')) category = 'licensing'
      
      const content = await mcp.getDOTRegulations(category)
      return { content, tool: 'get_dot_regulations' }
    }
    
    // Vocabulary requests
    if (lowerMessage.includes('vocabulary') || lowerMessage.includes('words') || lowerMessage.includes('terms')) {
      let category = 'mechanical'
      if (lowerMessage.includes('safety')) category = 'safety'
      if (lowerMessage.includes('navigation') || lowerMessage.includes('gps')) category = 'navigation'
      if (lowerMessage.includes('communication')) category = 'communication'
      
      let difficulty = 'intermediate'
      if (lowerMessage.includes('beginner') || lowerMessage.includes('basic')) difficulty = 'beginner'
      if (lowerMessage.includes('advanced') || lowerMessage.includes('difficult')) difficulty = 'advanced'
      
      const content = await mcp.getTruckingVocabulary(category, difficulty, 8)
      return { content, tool: 'get_trucking_vocabulary' }
    }
    
    // Checkpoint scenarios
    if (lowerMessage.includes('checkpoint') || lowerMessage.includes('scenario') || lowerMessage.includes('practice conversation')) {
      const content = await mcp.getCheckpointScenarios('routine-inspection', 'intermediate')
      return { content, tool: 'get_checkpoint_scenarios' }
    }
    
    return null
  }

  // Regular AI response for non-MCP conversations
  const getRegularAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userMessage,
        mode: 'enhanced',
        systemPrompt: `You are an enhanced AI Coach for truck drivers with MCP capabilities. 
        
        Mention that you have special tools available:
        - 🔧 DOT regulations lookup (say "show me DOT safety rules")  
        - 📚 Trucking vocabulary (say "give me mechanical vocabulary")
        - 🎭 Checkpoint scenarios (say "practice checkpoint conversation")
        - 🎤 Pronunciation analysis
        
        Keep responses encouraging and mention these special features when relevant.`,
        language: 'en'
      }, {
        timeout: 30000
      })

      return response.data.reply || "I'm here to help with your English learning and trucking knowledge!"
      
    } catch (error) {
      console.error('AI response error:', error)
      return "Try asking me about DOT regulations, trucking vocabulary, or checkpoint scenarios! I have special tools for these topics."
    }
  }

  // Google TTS
  const speakText = async (text: string) => {
    setIsSpeaking(true)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/text-to-speech`, {
        text: text,
        language: selectedVoice
      }, {
        responseType: 'blob',
        timeout: 15000
      })
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.playbackRate = voiceSpeed
      
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
      
    } catch (error) {
      console.error('❌ gTTS error:', error)
      setIsSpeaking(false)
    }
  }

  // Premium Gate - Block free users from MCP
  if (!subscription.isPremium && !subscription.loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-lg mx-4 text-center shadow-2xl">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🤖</span>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-blue-600 bg-clip-text text-transparent mb-4">
            MCP Enhanced AI Coach
          </h1>
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-6">
            PREMIUM FEATURE
          </div>
          
          <p className="text-gray-600 mb-6">
            Access advanced trucking tools, DOT regulations, vocabulary training, and enhanced AI capabilities.
          </p>
          
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">🔧 MCP Tools Include:</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>✅ DOT safety regulations lookup</li>
              <li>✅ Advanced trucking vocabulary</li>
              <li>✅ Checkpoint scenario practice</li>
              <li>✅ Learning progress analytics</li>
              <li>✅ Pronunciation analysis</li>
              <li>✅ Real-time conversation tools</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Create Stripe checkout session
                fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    priceId: 'price_1RcfPeI4BWGkGyQalTvXi4RP',
                    successUrl: `${window.location.origin}/mcp-coach?success=true`,
                    cancelUrl: `${window.location.origin}/mcp-coach?canceled=true`
                  })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.url) {
                    window.location.href = data.url
                  }
                })
                .catch(err => console.error('Stripe error:', err))
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🚀 Start 7-Day Free Trial
            </button>
            <button
              onClick={() => window.location.href = '/ai-coach'}
              className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Try Basic Coach
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            $9.99/month after trial • Cancel anytime
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">🤖</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MCP</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-blue-600 bg-clip-text text-transparent">
                  MCP-Enhanced AI Coach
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  🔧 Powered by Model Context Protocol Tools
                </p>
              </div>
            </div>
            
            {/* Trial Signup Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // Create Stripe checkout session
                  fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      priceId: 'price_1RcfPeI4BWGkGyQalTvXi4RP',
                      successUrl: `${window.location.origin}/mcp-coach?success=true`,
                      cancelUrl: `${window.location.origin}/mcp-coach?canceled=true`
                    })
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.url) {
                      window.location.href = data.url
                    }
                  })
                  .catch(err => console.error('Stripe error:', err))
                }}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                🚀 Start 7-Day Free Trial
              </button>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">Premium Features</div>
                <div className="text-xs text-gray-600">$9.99/month after trial</div>
              </div>
            </div>
            
            {/* Voice Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">🔊 Voice:</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.code} value={voice.code}>
                      {voice.flag} {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {isListening && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">🎤 Listening...</span>
                </div>
              )}
              
              {isSpeaking && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-700 font-medium text-sm">🔊 Speaking...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* MCP Mode Selection */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {mcpModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleUserMessage(`Tell me about ${mode.name.toLowerCase()}`)}
                className={`group relative p-4 rounded-xl border-2 border-transparent ${mode.color} hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{mode.icon}</div>
                  <div className="text-white font-semibold text-sm">{mode.name}</div>
                  <div className="text-white/80 text-xs mt-1">{mode.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`group relative ${
                message.sender === 'user' 
                  ? 'bg-white/60' 
                  : message.type === 'mcp-response'
                  ? 'bg-gradient-to-r from-purple-50/80 to-blue-50/80 border-l-4 border-purple-500'
                  : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
              } hover:bg-opacity-80 transition-all duration-200`}
            >
              <div className="py-8 px-6">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : message.type === 'mcp-response'
                        ? 'bg-gradient-to-br from-purple-600 to-blue-700'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700'
                    }`}>
                      <span className="text-white text-lg font-bold">
                        {message.sender === 'user' ? '👨‍💼' : message.type === 'mcp-response' ? '🔧' : '🤖'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-base font-bold text-gray-800">
                        {message.sender === 'user' ? 'You' : 'MCP AI Coach'}
                      </div>
                      {message.mcpTool && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          🔧 {message.mcpTool}
                        </span>
                      )}
                    </div>
                    
                    <div className="prose prose-blue max-w-none">
                      <div className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                        {message.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Processing Indicator */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80">
              <div className="py-8 px-6">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-800 mb-2">
                      MCP AI Coach is thinking...
                    </div>
                    <div className="text-sm text-gray-500">
                      🔧 Checking MCP tools and generating response
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-end space-x-4">
            {/* Voice Button */}
            <button
              onClick={continuousMode ? stopVoiceConversation : startVoiceConversation}
              disabled={isProcessing}
              className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                continuousMode 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg animate-pulse' 
                  : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-center w-6 h-6">
                {continuousMode ? '⏹️' : '🎤'}
              </div>
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <div className="relative border-2 border-gray-200 rounded-2xl focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all duration-200 bg-white shadow-sm">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (inputText.trim()) {
                        handleUserMessage(inputText.trim())
                        setInputText('')
                      }
                    }
                  }}
                  placeholder="Ask about DOT regulations, trucking vocabulary, or checkpoint scenarios..."
                  className="w-full p-4 pr-16 border-0 bg-transparent resize-none focus:outline-none max-h-32 text-gray-800"
                  rows={1}
                  disabled={isProcessing}
                />
                
                <button
                  onClick={() => {
                    if (inputText.trim()) {
                      handleUserMessage(inputText.trim())
                      setInputText('')
                    }
                  }}
                  disabled={isProcessing || !inputText.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span>MCP-Enhanced AI Coach</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Real-time DOT & Vocabulary Data</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>GPT-4 + Google TTS</span>
              </span>
            </div>
            
            <div className="text-xs text-gray-400">
              🔧 Try: "Show me DOT safety rules" or "Give me mechanical vocabulary"
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MCPEnhancedAICoach