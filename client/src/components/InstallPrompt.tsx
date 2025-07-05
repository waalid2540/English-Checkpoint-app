import React, { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if user is on iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show the install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!localStorage.getItem('install-prompt-dismissed')) {
          setShowInstallPrompt(true)
        }
      }, 5000) // Wait 5 seconds before showing
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS doesn't support beforeinstallprompt, so show manual instructions
    if (ios && !standalone) {
      setTimeout(() => {
        if (!localStorage.getItem('ios-install-prompt-dismissed')) {
          setShowInstallPrompt(true)
        }
      }, 10000) // Wait longer for iOS users
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Remember that user dismissed the prompt
    if (isIOS) {
      localStorage.setItem('ios-install-prompt-dismissed', 'true')
    } else {
      localStorage.setItem('install-prompt-dismissed', 'true')
    }
  }

  // Don't show if already installed or if user previously dismissed
  if (isStandalone || !showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg">🚛</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">
            Install English Checkpoint
          </h3>
          <p className="text-gray-600 text-xs mt-1">
            {isIOS 
              ? 'Tap the share button and "Add to Home Screen" for quick access'
              : 'Install our app for faster access and offline features'
            }
          </p>
          
          {isIOS && (
            <div className="mt-2 text-xs text-gray-500">
              <span className="inline-flex items-center space-x-1">
                <span>1. Tap</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>2. "Add to Home Screen"</span>
              </span>
            </div>
          )}
          
          <div className="flex space-x-2 mt-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Install
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors"
            >
              {isIOS ? 'Got it' : 'Maybe later'}
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt