import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const InstallApp: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [browserName, setBrowserName] = useState('')

  useEffect(() => {
    // Detect device and browser
    const userAgent = navigator.userAgent.toLowerCase()
    const iOS = /ipad|iphone|ipod/.test(userAgent)
    const android = /android/.test(userAgent)
    
    setIsIOS(iOS)
    setIsAndroid(android)

    // Detect browser
    if (userAgent.includes('chrome')) setBrowserName('Chrome')
    else if (userAgent.includes('firefox')) setBrowserName('Firefox')
    else if (userAgent.includes('safari')) setBrowserName('Safari')
    else if (userAgent.includes('edge')) setBrowserName('Edge')
    else setBrowserName('Browser')

    // Check if already running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }

    setDeferredPrompt(null)
  }

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-8xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">App Already Installed!</h1>
          <p className="text-lg text-green-600 mb-8">
            You're running Checkpoint English as an installed app. Perfect!
          </p>
          <Link
            to="/qa-training"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            Start DOT Practice
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Install Checkpoint English</h1>
          <p className="text-xl text-gray-600">
            Get the best experience by installing our app on your device
          </p>
        </div>

        {/* Install Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Automatic Install */}
          {deferredPrompt && (
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-200">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">One-Click Install</h2>
              <p className="text-gray-600 mb-6">
                Your browser supports automatic installation. Click below to install instantly!
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Install Now
              </button>
            </div>
          )}

          {/* Manual Install */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manual Install</h2>
            <p className="text-gray-600 mb-6">
              Follow these simple steps to install on your device:
            </p>

            {/* iOS Instructions */}
            {isIOS && (
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                  <p>Tap the <strong>Share</strong> button <span className="text-lg">⬆️</span> in Safari</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                  <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                  <p>Tap <strong>"Add"</strong> to confirm</p>
                </div>
              </div>
            )}

            {/* Android Chrome Instructions */}
            {isAndroid && browserName === 'Chrome' && (
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                  <p>Tap the <strong>menu</strong> button (⋮) in Chrome</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                  <p>Tap <strong>"Add to Home screen"</strong></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                  <p>Tap <strong>"Add"</strong> to confirm</p>
                </div>
              </div>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && (
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                  <p>Look for the <strong>install icon</strong> 📱 in your browser's address bar</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                  <p>Click the icon and select <strong>"Install"</strong></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                  <p>The app will be added to your desktop/start menu</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Install?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Faster Loading</h3>
              <p className="text-sm text-gray-600">Opens instantly like a native app</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📴</div>
              <h3 className="font-bold mb-2">Works Offline</h3>
              <p className="text-sm text-gray-600">Practice even without internet</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🏠</div>
              <h3 className="font-bold mb-2">Home Screen</h3>
              <p className="text-sm text-gray-600">Easy access from your device</p>
            </div>
          </div>
        </div>

        {/* Back to App */}
        <div className="text-center">
          <Link
            to="/qa-training"
            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
          >
            Continue in Browser
          </Link>
        </div>
      </div>
    </div>
  )
}

export default InstallApp