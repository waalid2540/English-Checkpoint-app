import React, { useEffect, useState } from 'react'

interface TalkingAvatarProps {
  mood: 'neutral' | 'speaking' | 'listening' | 'thinking'
  size?: 'sm' | 'md' | 'lg'
}

const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ mood, size = 'lg' }) => {
  const [mouthOpen, setMouthOpen] = useState(false)
  const [blinkEyes, setBlinkEyes] = useState(false)

  // Animate mouth when speaking
  useEffect(() => {
    if (mood === 'speaking') {
      const interval = setInterval(() => {
        setMouthOpen(prev => !prev)
      }, 150)
      return () => clearInterval(interval)
    } else {
      setMouthOpen(false)
    }
  }, [mood])

  // Blink eyes periodically
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkEyes(true)
      setTimeout(() => setBlinkEyes(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [])

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-56 h-56'
  }

  const getMoodColor = () => {
    switch (mood) {
      case 'speaking': return 'from-green-400 to-emerald-500'
      case 'listening': return 'from-red-400 to-rose-500'
      case 'thinking': return 'from-yellow-400 to-amber-500'
      default: return 'from-blue-400 to-indigo-500'
    }
  }

  const getMoodRing = () => {
    switch (mood) {
      case 'speaking': return 'ring-green-400 shadow-green-400/50'
      case 'listening': return 'ring-red-400 shadow-red-400/50 animate-pulse'
      case 'thinking': return 'ring-yellow-400 shadow-yellow-400/50'
      default: return 'ring-blue-400 shadow-blue-400/50'
    }
  }

  return (
    <div className="relative">
      {/* Animated glow background */}
      <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-br ${getMoodColor()} blur-xl opacity-50 animate-pulse`}></div>
      
      {/* Main avatar container */}
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${getMoodColor()} ring-4 ${getMoodRing()} shadow-2xl transition-all duration-300 overflow-hidden`}>
        
        {/* Face background */}
        <div className="absolute inset-4 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full shadow-inner">
          
          {/* Hair */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-b from-gray-800 to-gray-700 rounded-t-full"></div>
          
          {/* Face features container */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            
            {/* Eyes */}
            <div className="flex space-x-6 mb-3">
              {/* Left eye */}
              <div className="relative">
                <div className={`w-6 h-${blinkEyes ? '1' : '6'} bg-white rounded-full shadow-inner transition-all duration-100 flex items-center justify-center`}>
                  {!blinkEyes && (
                    <div className={`w-3 h-3 bg-gray-800 rounded-full ${mood === 'listening' ? 'animate-pulse' : ''}`}>
                      <div className="w-1 h-1 bg-white rounded-full ml-0.5 mt-0.5"></div>
                    </div>
                  )}
                </div>
                {/* Eyebrow */}
                <div className={`absolute -top-2 left-0 w-7 h-1.5 bg-gray-700 rounded-full transform ${mood === 'thinking' ? 'rotate-6' : mood === 'speaking' ? '-rotate-3' : ''} transition-transform`}></div>
              </div>
              
              {/* Right eye */}
              <div className="relative">
                <div className={`w-6 h-${blinkEyes ? '1' : '6'} bg-white rounded-full shadow-inner transition-all duration-100 flex items-center justify-center`}>
                  {!blinkEyes && (
                    <div className={`w-3 h-3 bg-gray-800 rounded-full ${mood === 'listening' ? 'animate-pulse' : ''}`}>
                      <div className="w-1 h-1 bg-white rounded-full ml-0.5 mt-0.5"></div>
                    </div>
                  )}
                </div>
                {/* Eyebrow */}
                <div className={`absolute -top-2 left-0 w-7 h-1.5 bg-gray-700 rounded-full transform ${mood === 'thinking' ? '-rotate-6' : mood === 'speaking' ? 'rotate-3' : ''} transition-transform`}></div>
              </div>
            </div>
            
            {/* Nose */}
            <div className="w-2 h-3 bg-amber-300 rounded-full mb-2"></div>
            
            {/* Mouth */}
            <div className={`transition-all duration-100 ${
              mood === 'speaking' 
                ? mouthOpen 
                  ? 'w-8 h-6 bg-gray-800 rounded-full' 
                  : 'w-10 h-3 bg-gray-800 rounded-full'
                : mood === 'listening'
                  ? 'w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600'
                  : mood === 'thinking'
                    ? 'w-4 h-4 bg-gray-800 rounded-full ml-4'
                    : 'w-12 h-2 bg-gray-700 rounded-full'
            }`}>
              {mood === 'speaking' && mouthOpen && (
                <div className="w-full h-1/2 bg-pink-400 rounded-b-full mt-3"></div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sound waves for speaking */}
        {mood === 'speaking' && (
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
            <div className="w-3 h-1 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-5 h-1 bg-green-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-4 h-1 bg-green-400 rounded-full animate-pulse delay-150"></div>
          </div>
        )}
        
        {/* Microphone indicator for listening */}
        {mood === 'listening' && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <span className="text-white text-sm">🎤</span>
            </div>
          </div>
        )}
        
        {/* Thinking bubbles */}
        {mood === 'thinking' && (
          <div className="absolute -top-2 -right-2 flex flex-col space-y-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
      </div>
      
      {/* Status text */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
          mood === 'speaking' ? 'bg-green-500 text-white' :
          mood === 'listening' ? 'bg-red-500 text-white animate-pulse' :
          mood === 'thinking' ? 'bg-yellow-500 text-white' :
          'bg-gray-600 text-white'
        }`}>
          {mood === 'speaking' && '🔊 Speaking...'}
          {mood === 'listening' && '🎤 Listening...'}
          {mood === 'thinking' && '💭 Thinking...'}
          {mood === 'neutral' && '✅ Ready'}
        </div>
      </div>
    </div>
  )
}

export default TalkingAvatar
