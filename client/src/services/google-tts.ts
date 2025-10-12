// Google Text-to-Speech Service (100% FREE!)
// Free alternative to ElevenLabs
// Professional AI voices for DOT training and pronunciation

interface GoogleTTSConfig {
  apiUrl: string
}

class GoogleTTSService {
  private config: GoogleTTSConfig
  private audioElement: HTMLAudioElement | null = null

  constructor() {
    // Use your backend API endpoint
    this.config = {
      apiUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3003'
    }
  }

  // Initialize a single audio element for mobile compatibility
  public initializeAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      console.log('🎵 [OpenAI TTS] Creating single audio element for reuse')
      this.audioElement = new Audio()
      this.audioElement.preload = 'auto'
      this.audioElement.volume = 1.0
      this.audioElement.muted = false
    }
    return this.audioElement
  }

  // Add natural pauses to text for slower, clearer speech
  private addNaturalPauses(text: string): string {
    return text
      // Add longer pauses after periods and question marks for slower speech
      .replace(/\./g, '. ')
      .replace(/\?/g, '? ')
      // Add pauses after commas for slower speech
      .replace(/,/g, ', ')
  }

  async generateSpeech(text: string, lang: string = 'en', slow: boolean = true): Promise<ArrayBuffer> {
    try {
      // Process text for educational clarity
      const processedText = this.addNaturalPauses(text)

      console.log(`🎵 Google TTS: Generating speech for: "${text.substring(0, 50)}..."`)
      console.log(`🔗 API URL: ${this.config.apiUrl}/api/tts/generate`)
      console.log(`🌍 Language: ${lang}, Slow: ${slow}`)

      const response = await fetch(`${this.config.apiUrl}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: processedText,
          lang: lang, // Language code (en, es, etc.)
          slow: slow  // Speak slowly for learners
        })
      })

      console.log(`📡 Google TTS response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Google TTS API error: ${response.status} - ${errorText}`)
        throw new Error(`Google TTS API error: ${response.status} - ${errorText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log(`✅ Generated audio: ${arrayBuffer.byteLength} bytes`)
      return arrayBuffer
    } catch (error) {
      console.error('❌ Google TTS error:', error)
      throw error
    }
  }

  async playText(text: string, lang: string = 'en', slow: boolean = true): Promise<void> {
    try {
      console.log(`🎵 [Google TTS] Starting playText for: "${text.substring(0, 30)}..."`)

      // Generate audio first
      const audioBuffer = await this.generateSpeech(text, lang, slow)
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)

      console.log(`🎵 [Google TTS] Audio blob created: ${audioBlob.size} bytes`)

      // Use single audio element for mobile compatibility
      const audio = this.initializeAudioElement()

      return new Promise((resolve, reject) => {
        let resolved = false
        let timeoutId: NodeJS.Timeout

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId)
          // Don't destroy the audio element, just clean up URL
          URL.revokeObjectURL(audioUrl)
        }

        const safeResolve = () => {
          if (!resolved) {
            resolved = true
            console.log('✅ [Google TTS] Audio completed successfully')
            cleanup()
            resolve()
          }
        }

        const safeReject = (error: string) => {
          if (!resolved) {
            resolved = true
            console.error(`❌ [Google TTS] Audio failed: ${error}`)
            cleanup()
            reject(new Error(error))
          }
        }

        // Remove old event listeners and add new ones
        audio.onended = safeResolve
        audio.onerror = (e) => {
          console.error('❌ [Google TTS] Audio error:', e)
          safeReject(`Audio error: ${e}`)
        }

        audio.oncanplaythrough = async () => {
          console.log('🎵 [Google TTS] Can play through, starting playback...')

          try {
            // Stop current playback if any
            audio.pause()
            audio.currentTime = 0

            // Start new playback
            const playPromise = audio.play()

            if (playPromise) {
              await playPromise
              console.log('✅ [Google TTS] Play started successfully')
            }
          } catch (playError) {
            console.error('❌ [Google TTS] Play failed:', playError)
            safeReject(`Play failed: ${playError}`)
          }
        }

        // Mobile timeout
        timeoutId = setTimeout(() => {
          console.warn('⚠️ [Google TTS] Audio timeout after 20 seconds')
          safeReject('Audio timeout')
        }, 20000)

        // Set source and load
        audio.src = audioUrl
        console.log(`🎵 [Google TTS] Audio source set, loading...`)
        audio.load()

      })
    } catch (error) {
      console.error('❌ [Google TTS] playText error:', error)
      throw error
    }
  }

  // Batch generate multiple audio clips for conversations
  async generateConversationAudio(conversation: { officer: string; driver: string }[], lang: string = 'en', slow: boolean = true): Promise<{
    officerAudio: ArrayBuffer[]
    driverAudio: ArrayBuffer[]
  }> {
    const officerPromises = conversation.map(item => this.generateSpeech(item.officer, lang, slow))
    const driverPromises = conversation.map(item => this.generateSpeech(item.driver, lang, slow))

    const [officerAudio, driverAudio] = await Promise.all([
      Promise.all(officerPromises),
      Promise.all(driverPromises)
    ])

    return { officerAudio, driverAudio }
  }
}

// Factory function to create Google TTS service
export const createGoogleTTSService = (): GoogleTTSService => {
  console.log('🔍 Google TTS Service Created')
  console.log('  Using Google TTS API via backend')
  console.log('  Cost: 100% FREE!')

  return new GoogleTTSService()
}

// Default export
export default GoogleTTSService
