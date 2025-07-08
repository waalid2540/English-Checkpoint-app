import React, { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const PWAInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA install prompt available')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  // Don't show install button if already running as PWA
  if (isStandalone) {
    return null
  }

  // iOS Install Instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Install English Checkpoint</h3>
            <p className="text-xs opacity-90 mb-2">
              Add to your home screen for the best experience!
            </p>
            <p className="text-xs opacity-80">
              Tap the share button <span className="inline-block">⬆️</span> then "Add to Home Screen"
            </p>
          </div>
          <button
            onClick={() => setShowInstallButton(false)}
            className="text-white/70 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  // Android/Desktop Install Button
  if (showInstallButton && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📱</div>
            <div>
              <h3 className="font-bold text-sm">Install English Checkpoint</h3>
              <p className="text-xs opacity-90">
                Add to your device for offline access!
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInstallButton(false)}
              className="text-white/70 hover:text-white text-sm px-2 py-1"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default PWAInstall