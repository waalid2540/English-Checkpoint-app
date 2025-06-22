import React, { useState } from 'react'
import { samplePrompts } from '../data/sample-prompts'

const QATraining = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingType, setPlayingType] = useState<'officer' | 'driver' | null>(null)

  const currentPrompt = samplePrompts[currentIndex]

  const playAll = () => {
    setIsPlaying(true)
    setCurrentIndex(0)
    
    // Create conversation audio
    let script = ""
    samplePrompts.forEach(prompt => {
      script += `Officer: ${prompt.officer}... Driver: ${prompt.driver}... `
    })
    
    // Play audio
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = 0.7
    utterance.onend = () => setIsPlaying(false)
    speechSynthesis.speak(utterance)
    
    // Update text every 8 seconds (slower to match audio)
    let questionIndex = 0
    const updateText = () => {
      if (questionIndex < samplePrompts.length) {
        console.log(`Showing question ${questionIndex + 1}`)
        setCurrentIndex(questionIndex)
        setPlayingType('officer')
        
        setTimeout(() => {
          setPlayingType('driver')
          setTimeout(() => {
            setPlayingType(null)
            questionIndex++
            if (questionIndex < samplePrompts.length) {
              setTimeout(updateText, 1500)
            }
          }, 4000)
        }, 4000)
      }
    }
    
    updateText()
  }

  const stopAll = () => {
    setIsPlaying(false)
    setPlayingType(null)
    speechSynthesis.cancel()
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">🎵 DOT Practice Training</h1>
      
      {/* Big Play Button */}
      <div className="text-center mb-8">
        <button
          onClick={isPlaying ? stopAll : playAll}
          className={`w-40 h-40 rounded-full text-white font-bold shadow-lg ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          <div className="text-5xl mb-2">{isPlaying ? '⏹️' : '▶️'}</div>
          <div className="text-lg">{isPlaying ? 'STOP' : 'PLAY ALL'}</div>
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="text-center text-xl font-bold mb-4">
          Question {currentIndex + 1} of {samplePrompts.length}
        </div>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / samplePrompts.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Question & Answer */}
      <div className="space-y-6">
        {/* Officer Question */}
        <div className={`p-6 rounded-lg border-l-8 ${
          playingType === 'officer' ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-4">👮‍♂️</span>
              <div>
                <h3 className="text-2xl font-bold text-blue-800">DOT Officer</h3>
                <p className="text-blue-600">Official Question</p>
              </div>
            </div>
            {playingType === 'officer' && (
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full">
                <span className="animate-pulse">🔊 Speaking Now</span>
              </div>
            )}
          </div>
          <p className="text-xl text-blue-900 font-medium leading-relaxed">
            "{currentPrompt.officer}"
          </p>
        </div>

        {/* Driver Answer */}
        <div className={`p-6 rounded-lg border-l-8 ${
          playingType === 'driver' ? 'bg-green-100 border-green-500' : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🚛</span>
              <div>
                <h3 className="text-2xl font-bold text-green-800">Professional Driver</h3>
                <p className="text-green-600">Correct Response</p>
              </div>
            </div>
            {playingType === 'driver' && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-full">
                <span className="animate-pulse">🔊 Speaking Now</span>
              </div>
            )}
          </div>
          <p className="text-xl text-green-900 font-medium leading-relaxed">
            "{currentPrompt.driver}"
          </p>
        </div>
      </div>

      {/* Status */}
      {isPlaying && (
        <div className="text-center mt-8">
          <div className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg">
            <span className="animate-pulse">🎵</span>
            <span className="ml-2 font-medium">Playing all conversations automatically...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default QATraining