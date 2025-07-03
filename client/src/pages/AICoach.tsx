import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-backend.onrender.com'

const AICoach = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const recognitionRef = useRef(null)

  const startChat = () => {
    setIsStarted(true)
    
    const recognition = new (window as any).webkitSpeechRecognition()
    recognitionRef.current = recognition
    
    recognition.continuous = true
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      setIsListening(true)
      console.log('Voice started')
    }
    
    recognition.onresult = async (event) => {
      const text = event.results[event.results.length - 1][0].transcript.trim()
      console.log('You said:', text)
      
      if (text.length > 2) {
        // Add user message
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: text, 
          sender: 'user' 
        }])
        
        // Get AI response
        try {
          const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
            message: text,
            systemPrompt: "You are an English coach for truck drivers. Respond ONLY in English. Help them practice English for trucking work. Keep responses under 25 words. Be encouraging and focus on English learning."
          })
          
          const aiText = response.data.reply || "Great! Keep practicing!"
          
          // Add AI message
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: aiText, 
            sender: 'coach' 
          }])
          
          // Speak response
          const utterance = new SpeechSynthesisUtterance(aiText)
          utterance.rate = 0.8
          speechSynthesis.speak(utterance)
          
        } catch (error) {
          console.error('Error:', error)
          const fallback = "I'm here to help you practice English!"
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: fallback, 
            sender: 'coach' 
          }])
          
          const utterance = new SpeechSynthesisUtterance(fallback)
          speechSynthesis.speak(utterance)
        }
      }
    }
    
    recognition.onerror = (event) => {
      console.log('Speech error:', event.error)
      setTimeout(() => recognition.start(), 1000)
    }
    
    recognition.onend = () => {
      if (isStarted) {
        setTimeout(() => recognition.start(), 100)
      }
    }
    
    recognition.start()
  }

  const stopChat = () => {
    setIsStarted(false)
    setIsListening(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    speechSynthesis.cancel()
  }

  return (
    <div className="h-screen bg-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">🎓 English Coach</h1>
        <p className="text-lg mt-2">Practice English for Truck Drivers</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚛</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Ready to Practice!</h2>
            <p className="text-gray-600">Tap the button below to start speaking</p>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm p-4 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 shadow-lg border'
              }`}>
                <p className="text-base">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-white border-t">
        {!isStarted ? (
          <button
            onClick={startChat}
            className="w-full py-6 bg-green-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-green-600"
          >
            🎤 TAP TO START SPEAKING
          </button>
        ) : (
          <div className="space-y-4">
            {/* Status */}
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full mx-auto mb-2 ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
              }`}></div>
              <p className="text-lg font-semibold text-gray-700">
                {isListening ? '🎤 Listening...' : '⏸️ Ready'}
              </p>
              <p className="text-sm text-gray-500">Speak naturally about trucking</p>
            </div>
            
            {/* Stop Button */}
            <button
              onClick={stopChat}
              className="w-full py-4 bg-red-500 text-white text-lg font-bold rounded-xl hover:bg-red-600"
            >
              ⏹️ STOP CONVERSATION
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-100 p-4 text-center">
        <p className="text-sm text-gray-600">
          💡 Just speak naturally - I'll help you practice English for trucking!
        </p>
      </div>
    </div>
  )
}

export default AICoach