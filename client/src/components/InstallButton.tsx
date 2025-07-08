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

const InstallButton: React.FC = () => {
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
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
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
    setShowInstallButton(false)
  }

  // Don't show if already installed
  if (isStandalone) {
    return null
  }

  // iOS users - show instructions with link
  if (isIOS) {
    return (
      <div className="text-center">
        <p className="text-blue-200 text-sm mb-2">📱 Install as App</p>
        <p className="text-xs text-blue-300 opacity-80 max-w-xs mx-auto mb-3">
          Tap Share ⬆️ then "Add to Home Screen" for the best experience
        </p>
        <Link
          to="/install"
          className="text-blue-300 hover:text-white text-xs underline"
        >
          See detailed instructions →
        </Link>
      </div>
    )
  }

  // Android/Desktop - show install button if prompt available
  if (showInstallButton && deferredPrompt) {
    return (
      <button
        onClick={handleInstallClick}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2"
      >
        <span>📱</span>
        <span>Install App</span>
      </button>
    )
  }

  // Always show manual install instructions for browsers that don't trigger the prompt
  return (
    <div className="text-center">
      <Link
        to="/install"
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 inline-flex items-center space-x-2"
      >
        <span>📱</span>
        <span>Install App</span>
      </Link>
      <p className="text-xs text-blue-300 opacity-80 mt-2">
        Works on all devices • No app store needed
      </p>
    </div>
  )
}

export default InstallButton