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
  
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' }
  ]

  // Start voice conversation
  const startConversation = () => {
    setIsStarted(true)
    
    // Add welcome message
    const welcomeMsg: Message = {
      id: 'welcome',
      text: "Good morning! I'm a DOT officer. Let's practice your checkpoint conversation. Start by greeting me!",
      sender: 'coach',
      timestamp: new Date()
    }
    setMessages([welcomeMsg])
    
    // Speak welcome message
    speakText(welcomeMsg.text)
    
    // Start listening after welcome
    setTimeout(() => {
      startListening()
    }, 3000)
  }

  // OpenAI Whisper Voice Recognition
  const startListening = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Voice recording not supported. Please use Chrome or Safari.')
      return
    }

    setIsListening(true)
    console.log('🎤 Starting OpenAI Whisper recording...')

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream)
        const audioChunks: Blob[] = []
        
        recognitionRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          
          // Convert to transcript using OpenAI Whisper
          const transcript = await transcribeWithWhisper(audioBlob)
          
          if (transcript && transcript.length > 2) {
            // Add user message
            const userMsg: Message = {
              id: Date.now().toString(),
              text: transcript,
              sender: 'user',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, userMsg])
            
            // Get AI coaching response
            await getCoachingResponse(transcript)
          }
          
          // Clean up
          stream.getTracks().forEach(track => track.stop())
          setIsListening(false)
          
          // Continue conversation flow
          setTimeout(() => {
            if (isStarted && !isSpeaking) {
              startListening()
            }
          }, 500)
        }

        mediaRecorder.onerror = (event) => {
          console.error('🚫 Recording error:', event)
          setIsListening(false)
          stream.getTracks().forEach(track => track.stop())
          
          // Auto-retry on errors
          setTimeout(() => {
            if (isStarted) startListening()
          }, 2000)
        }

        // Record for 5 seconds at a time
        mediaRecorder.start()
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
        }, 5000)
      })
      .catch(error => {
        console.error('🎤 Microphone access error:', error)
        setIsListening(false)
        alert('🎤 Please allow microphone access to use voice features')
      })
  }

  // OpenAI Whisper transcription
  const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')
      formData.append('model', 'whisper-1')
      formData.append('language', 'en')

      const response = await axios.post(`${API_BASE_URL}/api/ai/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 10000
      })

      const transcript = response.data.text?.trim() || ''
      console.log('📝 Whisper transcript:', transcript)
      return transcript
      
    } catch (error) {
      console.error('❌ Whisper transcription error:', error)
      return ''
    }
  }

  // Get AI coaching response with conversation flow
  const getCoachingResponse = async (userText: string) => {
    setIsProcessing(true)
    
    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))

      const systemPrompt = `You are a professional English coach helping truck drivers practice DOT checkpoint conversations. 

CONVERSATION FLOW RULES:
1. Keep the conversation flowing naturally - act like a real DOT officer
2. Ask follow-up questions to continue the conversation
3. Correct grammar mistakes kindly and give the proper way to say it
4. Give realistic officer responses and questions
5. Keep responses under 50 words
6. Be encouraging but maintain the checkpoint scenario

DOT CHECKPOINT CONVERSATION FLOW:
- Start: "Good morning, officer" → "Good morning. License and registration please"
- Documents: "Here are my documents" → "Thank you. What are you hauling today?"
- Cargo: "I'm carrying freight" → "Where are you headed?"
- Destination: "I'm going to Chicago" → "How long have you been driving?"
- Experience: "5 years" → "Any issues with your truck today?"
- Condition: "Everything is good" → "Alright, drive safe. Have a good day"

KEEP THE CONVERSATION GOING - Don't just give corrections, respond as a DOT officer would!`

      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userText,
        systemPrompt: systemPrompt,
        language: selectedLanguage,
        conversationHistory: conversationHistory,
        enhancedMode: true
      }, {
        timeout: 15000
      })
      
      const coachResponse = response.data.reply || "Good job! Keep practicing your English."
      
      // Add coach message
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: coachResponse,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, coachMsg])
      
      setIsProcessing(false)
      
      // Speak the response
      await speakText(coachResponse)
      
      // Continue listening after AI finishes speaking (improved flow)
      setTimeout(() => {
        if (isStarted && !isListening && !isSpeaking) {
          startListening()
        }
      }, 800)
      
    } catch (error) {
      console.error('❌ AI Error:', error)
      setIsProcessing(false)
      
      const fallbackMsg = "Sorry, I had trouble understanding. Please try again!"
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: fallbackMsg,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
      
      await speakText(fallbackMsg)
      
      // Continue listening
      setTimeout(() => {
        if (isStarted && !isListening) {
          startListening()
        }
      }, 1500)
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
    setIsListening(false)
    setIsSpeaking(false)
    setIsProcessing(false)
    
    // Stop MediaRecorder if it exists
    if (recognitionRef.current) {
      if (recognitionRef.current.state === 'recording') {
        recognitionRef.current.stop()
      }
    }
    
    // Stop all audio streams
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop())
      })
      .catch(() => {}) // Ignore errors
    
    speechSynthesis.cancel()
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
                {isListening ? '🎤 Listening...' : 
                 isSpeaking ? '🗣️ Speaking...' : 
                 isProcessing ? '🧠 Thinking...' : 
                 isStarted ? '✅ Ready' : 'Tap Start'}
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
            <h2 className="text-2xl font-bold text-gray-700 mb-4">DOT Checkpoint Practice</h2>
            <p className="text-gray-600 text-lg mb-6">Practice English conversations with DOT officers</p>
            <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
              <h3 className="font-bold text-gray-800 mb-2">💡 Practice Phrases:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Good morning, officer"</li>
                <li>• "Here is my license"</li>
                <li>• "I'm carrying freight"</li>
                <li>• "This is a routine inspection"</li>
              </ul>
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
              🎤 START DOT PRACTICE
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
                  {isListening ? 'Speak now - I\'m listening!' : 
                   isSpeaking ? 'Coach is speaking...' :
                   isProcessing ? 'Analyzing your English...' : 'Ready for next conversation'}
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