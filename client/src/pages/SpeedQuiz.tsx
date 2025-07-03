import React, { useState, useEffect, useRef } from 'react'
import { samplePrompts } from '../data/sample-prompts'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import UpgradePopup from '../components/UpgradePopup'

interface QuizQuestion {
  id: number
  officer: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface GameStats {
  score: number
  streak: number
  bestStreak: number
  totalQuestions: number
  correctAnswers: number
  averageTime: number
  rank: string
}

const SpeedQuiz = () => {
  const { user } = useAuth()
  const subscription = useSubscription()
  
  const [gameMode, setGameMode] = useState<'menu' | 'playing' | 'finished'>('menu')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [timeLimit, setTimeLimit] = useState(10) // seconds per question
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    averageTime: 0,
    rank: 'Rookie'
  })
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [responseTimes, setResponseTimes] = useState<number[]>([])

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Difficulty settings
  const difficultySettings = {
    easy: { time: 15, questions: 10, name: 'Easy Ride', color: 'green', icon: '🚛' },
    medium: { time: 10, questions: 15, name: 'Highway Speed', color: 'yellow', icon: '⚡' },
    hard: { time: 7, questions: 20, name: 'DOT Pressure', color: 'red', icon: '🔥' }
  }

  // Generate quiz questions from DOT prompts
  useEffect(() => {
    generateQuestions()
  }, [difficulty, subscription.isPremium])

  const generateQuestions = () => {
    const settings = difficultySettings[difficulty]
    const availablePrompts = subscription.isPremium 
      ? samplePrompts 
      : samplePrompts.slice(0, 10) // Free users get first 10

    if (availablePrompts.length < settings.questions && !subscription.isPremium) {
      // Show upgrade popup if not enough questions
      return
    }

    // Shuffle and select prompts
    const shuffled = [...availablePrompts].sort(() => Math.random() - 0.5)
    const selectedPrompts = shuffled.slice(0, settings.questions)

    const quizQuestions: QuizQuestion[] = selectedPrompts.map((prompt, index) => {
      // Generate 3 wrong answers and 1 correct answer
      const wrongAnswers = generateWrongAnswers(prompt.driver)
      const allAnswers = [prompt.driver, ...wrongAnswers].sort(() => Math.random() - 0.5)
      const correctIndex = allAnswers.indexOf(prompt.driver)

      return {
        id: index + 1,
        officer: prompt.officer,
        options: allAnswers,
        correctAnswer: correctIndex,
        explanation: `The correct response shows professionalism and provides the information the officer needs.`
      }
    })

    setQuestions(quizQuestions)
  }

  const generateWrongAnswers = (correctAnswer: string): string[] => {
    const wrongAnswerPool = [
      "I don't know",
      "Maybe later",
      "That's not my job",
      "I'm not sure about that",
      "Can you repeat the question?",
      "I forgot to check",
      "It's in the truck somewhere",
      "My dispatcher handles that",
      "I'll check later",
      "That's too complicated"
    ]

    // Get 3 random wrong answers
    const shuffled = wrongAnswerPool.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  // Timer logic
  useEffect(() => {
    if (gameMode === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameMode === 'playing') {
      handleTimeout()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeLeft, gameMode])

  const startGame = () => {
    if (!subscription.isPremium && difficulty !== 'easy') {
      setShowUpgradePopup(true)
      return
    }

    const settings = difficultySettings[difficulty]
    setTimeLimit(settings.time)
    setTimeLeft(settings.time)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setGameStats({
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageTime: 0,
      rank: 'Rookie'
    })
    setResponseTimes([])
    setQuestionStartTime(Date.now())
    setGameMode('playing')
    generateQuestions()
  }

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return // Already answered

    const responseTime = (Date.now() - questionStartTime) / 1000
    setResponseTimes(prev => [...prev, responseTime])
    setSelectedAnswer(answerIndex)

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer
    
    if (isCorrect) {
      const timeBonus = Math.max(0, timeLeft * 10) // Bonus points for speed
      const newScore = gameStats.score + 100 + timeBonus
      const newStreak = gameStats.streak + 1
      
      setGameStats(prev => ({
        ...prev,
        score: newScore,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        correctAnswers: prev.correctAnswers + 1,
        totalQuestions: prev.totalQuestions + 1
      }))

      // Play success sound
      playSound('success')
    } else {
      setGameStats(prev => ({
        ...prev,
        streak: 0,
        totalQuestions: prev.totalQuestions + 1
      }))

      // Play error sound
      playSound('error')
    }

    // Move to next question after 2 seconds
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const handleTimeout = () => {
    setSelectedAnswer(-1) // Mark as timeout
    setGameStats(prev => ({
      ...prev,
      streak: 0,
      totalQuestions: prev.totalQuestions + 1
    }))
    
    playSound('timeout')
    
    setTimeout(() => {
      nextQuestion()
    }, 1500)
  }

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      finishGame()
    } else {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(timeLimit)
      setQuestionStartTime(Date.now())
    }
  }

  const finishGame = () => {
    const avgTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : timeLimit

    const accuracy = gameStats.totalQuestions > 0 
      ? (gameStats.correctAnswers / gameStats.totalQuestions) * 100 
      : 0

    let rank = 'Rookie'
    if (accuracy >= 90 && gameStats.bestStreak >= 10) rank = 'DOT Expert'
    else if (accuracy >= 80 && gameStats.bestStreak >= 7) rank = 'Professional Driver'
    else if (accuracy >= 70 && gameStats.bestStreak >= 5) rank = 'Experienced Driver'
    else if (accuracy >= 60) rank = 'Learning Driver'

    setGameStats(prev => ({
      ...prev,
      averageTime: avgTime,
      rank
    }))

    setGameMode('finished')
    playSound('finish')
  }

  const playSound = (type: 'success' | 'error' | 'timeout' | 'finish') => {
    // Simple audio feedback using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
        break
      case 'error':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime) // A3
        break
      case 'timeout':
        oscillator.frequency.setValueAtTime(196, audioContext.currentTime) // G3
        break
      case 'finish':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2) // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4) // G5
        break
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const resetGame = () => {
    setGameMode('menu')
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setTimeLeft(timeLimit)
  }

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent mb-4">
              ⚡ Speed Quiz Challenge
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Test your DOT knowledge under pressure! Quick thinking builds confidence for real checkpoints.
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Challenge</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(difficultySettings).map(([key, settings]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key as any)}
                  disabled={key !== 'easy' && !subscription.isPremium}
                  className={`p-8 rounded-2xl transition-all transform hover:scale-105 ${
                    difficulty === key
                      ? `bg-${settings.color}-500 text-white shadow-2xl`
                      : 'bg-white text-gray-700 shadow-lg hover:shadow-xl'
                  } ${key !== 'easy' && !subscription.isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-4xl mb-4">{settings.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{settings.name}</h3>
                  <div className="text-sm space-y-1">
                    <div>⏱️ {settings.time} seconds per question</div>
                    <div>📝 {settings.questions} questions total</div>
                    {key !== 'easy' && !subscription.isPremium && (
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded mt-2">
                        🔒 Premium Only
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-red-500 text-white text-xl font-bold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              🚀 Start Speed Quiz
            </button>
          </div>

          {/* How to Play */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>• Answer DOT questions quickly and accurately</div>
              <div>• Earn bonus points for fast responses</div>
              <div>• Build streaks for maximum scores</div>
              <div>• Beat your personal best times</div>
            </div>
          </div>
        </div>

        <UpgradePopup 
          isOpen={showUpgradePopup}
          onClose={() => setShowUpgradePopup(false)}
          trigger="speed_quiz"
        />
      </div>
    )
  }

  if (gameMode === 'playing') {
    const currentQ = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 text-white">
        <div className="max-w-4xl mx-auto p-8">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{gameStats.score}</div>
                <div className="text-sm text-gray-300">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{gameStats.streak}</div>
                <div className="text-sm text-gray-300">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">{currentQuestion + 1}/{questions.length}</div>
                <div className="text-sm text-gray-300">Question</div>
              </div>
            </div>

            {/* Timer */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                timeLeft <= 3 ? 'bg-red-500 animate-pulse' : 
                timeLeft <= 5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {timeLeft}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-8">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-red-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="bg-black/30 rounded-2xl p-8 mb-6">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">👮‍♂️</span>
                <div>
                  <h3 className="text-xl font-bold text-blue-300">DOT Officer Says:</h3>
                </div>
              </div>
              <p className="text-2xl font-medium leading-relaxed">
                "{currentQ?.officer}"
              </p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-4">
            {currentQ?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-6 rounded-xl text-left transition-all transform hover:scale-102 ${
                  selectedAnswer === null 
                    ? 'bg-white/10 hover:bg-white/20 border-2 border-transparent hover:border-white/30'
                    : selectedAnswer === index
                      ? index === currentQ.correctAnswer
                        ? 'bg-green-500 border-2 border-green-300'
                        : 'bg-red-500 border-2 border-red-300'
                      : index === currentQ.correctAnswer
                        ? 'bg-green-500 border-2 border-green-300'
                        : 'bg-gray-600 opacity-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {selectedAnswer !== null && (
            <div className="mt-6 text-center">
              {selectedAnswer === currentQ.correctAnswer ? (
                <div className="text-green-300 text-xl font-bold">
                  ✅ Correct! +{100 + (timeLeft * 10)} points
                </div>
              ) : selectedAnswer === -1 ? (
                <div className="text-yellow-300 text-xl font-bold">
                  ⏰ Time's up!
                </div>
              ) : (
                <div className="text-red-300 text-xl font-bold">
                  ❌ Incorrect! Streak broken.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Game finished
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Results Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🏆 Quiz Complete!
          </h1>
          <div className="text-6xl mb-4">{gameStats.rank === 'DOT Expert' ? '🥇' : gameStats.rank === 'Professional Driver' ? '🥈' : '🥉'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{gameStats.rank}</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600">{gameStats.score}</div>
            <div className="text-gray-600">Final Score</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600">{gameStats.correctAnswers}/{gameStats.totalQuestions}</div>
            <div className="text-gray-600">Correct</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-purple-600">{gameStats.bestStreak}</div>
            <div className="text-gray-600">Best Streak</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-orange-600">{gameStats.averageTime.toFixed(1)}s</div>
            <div className="text-gray-600">Avg Time</div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Performance Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Accuracy</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${(gameStats.correctAnswers / gameStats.totalQuestions) * 100}%` }}
                  ></div>
                </div>
                <span className="font-bold">{Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Speed</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${Math.max(0, 100 - (gameStats.averageTime / timeLimit) * 100)}%` }}
                  ></div>
                </div>
                <span className="font-bold">{Math.round(Math.max(0, 100 - (gameStats.averageTime / timeLimit) * 100))}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            🔄 Play Again
          </button>
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  )
}

export default SpeedQuiz