import React, { useEffect, useState } from 'react'

interface TalkingAvatarProps {
  mood: 'neutral' | 'speaking' | 'listening' | 'thinking'
  size?: 'sm' | 'md' | 'lg'
}

const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ mood, size = 'lg' }) => {
  const [mouthFrame, setMouthFrame] = useState(0)
  const [blinkEyes, setBlinkEyes] = useState(false)
  const [headTilt, setHeadTilt] = useState(0)

  // Smooth mouth animation when speaking
  useEffect(() => {
    if (mood === 'speaking') {
      const interval = setInterval(() => {
        setMouthFrame(Math.floor(Math.random() * 4))
      }, 120)
      return () => clearInterval(interval)
    } else {
      setMouthFrame(0)
    }
  }, [mood])

  // Natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkEyes(true)
      setTimeout(() => setBlinkEyes(false), 120)
    }, 2500 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [])

  // Subtle head movement when listening
  useEffect(() => {
    if (mood === 'listening') {
      const tiltInterval = setInterval(() => {
        setHeadTilt(prev => (prev === 0 ? 3 : prev === 3 ? -3 : 0))
      }, 800)
      return () => clearInterval(tiltInterval)
    } else {
      setHeadTilt(0)
    }
  }, [mood])

  const sizeMap = {
    sm: { container: 'w-28 h-28', avatar: 120 },
    md: { container: 'w-44 h-44', avatar: 180 },
    lg: { container: 'w-60 h-60', avatar: 240 }
  }

  const moodColors = {
    speaking: { primary: '#10B981', secondary: '#34D399', glow: 'rgba(16, 185, 129, 0.4)' },
    listening: { primary: '#EF4444', secondary: '#F87171', glow: 'rgba(239, 68, 68, 0.4)' },
    thinking: { primary: '#F59E0B', secondary: '#FBBF24', glow: 'rgba(245, 158, 11, 0.4)' },
    neutral: { primary: '#6366F1', secondary: '#818CF8', glow: 'rgba(99, 102, 241, 0.3)' }
  }

  const colors = moodColors[mood]
  const { container, avatar } = sizeMap[size]

  // Mouth shapes for speech animation
  const getMouthPath = () => {
    if (mood === 'speaking') {
      const mouths = [
        'M 85 145 Q 100 152 115 145', // slightly open
        'M 82 143 Q 100 160 118 143', // open
        'M 80 145 Q 100 168 120 145', // wide open
        'M 88 145 Q 100 150 112 145', // almost closed
      ]
      return mouths[mouthFrame]
    }
    if (mood === 'listening') {
      return 'M 90 147 Q 100 147 110 147' // small O shape
    }
    if (mood === 'thinking') {
      return 'M 95 148 Q 108 145 112 148' // shifted smile
    }
    return 'M 85 145 Q 100 155 115 145' // friendly smile
  }

  return (
    <div className="flex flex-col items-center">
      {/* Glow effect */}
      <div 
        className={`${container} relative`}
        style={{
          filter: `drop-shadow(0 0 20px ${colors.glow}) drop-shadow(0 0 40px ${colors.glow})`
        }}
      >
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `rotate(${headTilt}deg)` }}
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="faceGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            
            <radialGradient id="cheekGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FECACA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FECACA" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#1F2937" />
            </linearGradient>

            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Animated ring */}
          <circle 
            cx="100" 
            cy="100" 
            r="95" 
            fill="none" 
            stroke="url(#ringGradient)" 
            strokeWidth="4"
            className={mood === 'listening' ? 'animate-pulse' : ''}
          />
          
          {/* Sound waves when speaking */}
          {mood === 'speaking' && (
            <g className="animate-pulse">
              <path d="M 170 85 Q 185 100 170 115" fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <path d="M 180 75 Q 200 100 180 125" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            </g>
          )}

          {/* Head/Face base */}
          <circle cx="100" cy="105" r="75" fill="url(#faceGradient)" />
          
          {/* Hair */}
          <ellipse cx="100" cy="55" rx="55" ry="35" fill="url(#hairGradient)" />
          <ellipse cx="60" cy="70" rx="20" ry="25" fill="url(#hairGradient)" />
          <ellipse cx="140" cy="70" rx="20" ry="25" fill="url(#hairGradient)" />

          {/* Ears */}
          <ellipse cx="30" cy="105" rx="10" ry="15" fill="#FCD34D" />
          <ellipse cx="170" cy="105" rx="10" ry="15" fill="#FCD34D" />

          {/* Cheeks */}
          <circle cx="60" cy="130" r="15" fill="url(#cheekGradient)" />
          <circle cx="140" cy="130" r="15" fill="url(#cheekGradient)" />

          {/* Eyes */}
          <g>
            {/* Left eye */}
            <ellipse 
              cx="70" 
              cy="105" 
              rx="15" 
              ry={blinkEyes ? 2 : 18} 
              fill="white"
              className="transition-all duration-75"
            />
            {!blinkEyes && (
              <>
                <circle cx="72" cy="105" r="8" fill="#1F2937" />
                <circle cx="74" cy="102" r="3" fill="white" />
              </>
            )}
            
            {/* Right eye */}
            <ellipse 
              cx="130" 
              cy="105" 
              rx="15" 
              ry={blinkEyes ? 2 : 18} 
              fill="white"
              className="transition-all duration-75"
            />
            {!blinkEyes && (
              <>
                <circle cx="132" cy="105" r="8" fill="#1F2937" />
                <circle cx="134" cy="102" r="3" fill="white" />
              </>
            )}
          </g>

          {/* Eyebrows */}
          <path 
            d={mood === 'thinking' ? 'M 55 82 Q 70 78 85 85' : 'M 55 85 Q 70 80 85 85'} 
            fill="none" 
            stroke="#4B5563" 
            strokeWidth="4" 
            strokeLinecap="round"
            className="transition-all duration-200"
          />
          <path 
            d={mood === 'thinking' ? 'M 145 85 Q 130 78 115 82' : 'M 145 85 Q 130 80 115 85'} 
            fill="none" 
            stroke="#4B5563" 
            strokeWidth="4" 
            strokeLinecap="round"
            className="transition-all duration-200"
          />

          {/* Nose */}
          <ellipse cx="100" cy="125" rx="5" ry="8" fill="#EAB308" opacity="0.6" />

          {/* Mouth */}
          <path 
            d={getMouthPath()} 
            fill={mood === 'speaking' ? '#7C2D12' : 'none'}
            stroke="#92400E" 
            strokeWidth="4" 
            strokeLinecap="round"
            className="transition-all duration-100"
          />
          
          {/* Tongue when speaking wide */}
          {mood === 'speaking' && mouthFrame === 2 && (
            <ellipse cx="100" cy="158" rx="8" ry="5" fill="#F87171" />
          )}

          {/* Thinking bubbles */}
          {mood === 'thinking' && (
            <g filter="url(#glow)">
              <circle cx="165" cy="55" r="5" fill={colors.primary} className="animate-bounce" style={{ animationDelay: '0ms' }} />
              <circle cx="175" cy="40" r="7" fill={colors.primary} className="animate-bounce" style={{ animationDelay: '150ms' }} />
              <circle cx="188" cy="22" r="10" fill={colors.primary} className="animate-bounce" style={{ animationDelay: '300ms' }} />
            </g>
          )}

          {/* Listening indicator */}
          {mood === 'listening' && (
            <g className="animate-pulse">
              <circle cx="100" cy="185" r="12" fill={colors.primary} />
              <rect x="97" y="175" width="6" height="12" rx="3" fill="white" />
              <rect x="94" y="190" width="12" height="3" rx="1" fill="white" />
            </g>
          )}
        </svg>
      </div>

      {/* Status badge */}
      <div className="mt-4">
        <div 
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg transition-all duration-300 ${
            mood === 'listening' ? 'animate-pulse' : ''
          }`}
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 4px 20px ${colors.glow}`
          }}
        >
          {mood === 'speaking' && (
            <>
              <span className="flex gap-0.5">
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </span>
              Speaking...
            </>
          )}
          {mood === 'listening' && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              Listening...
            </>
          )}
          {mood === 'thinking' && (
            <>
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              Thinking...
            </>
          )}
          {mood === 'neutral' && (
            <>
              <span className="text-base">✨</span>
              Ready to help!
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TalkingAvatar
