// ElevenLabs Text-to-Speech Service
// Professional AI voices for DOT training and pronunciation

interface ElevenLabsConfig {
  apiKey: string
  voiceId: string
  baseUrl: string
}

class ElevenLabsService {
  private config: ElevenLabsConfig
  private audioElement: HTMLAudioElement | null = null

  constructor(apiKey: string, voiceId: string) {
    this.config = {
      apiKey,
      voiceId,
      baseUrl: 'https://api.elevenlabs.io/v1'
    }
  }

  // Initialize a single audio element for mobile compatibility
  public initializeAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      console.log('🎵 [Mobile v3] Creating single audio element for reuse')
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
      .replace(/\./g, '. . .')
      .replace(/\?/g, '? . . .')
      // Add pauses after commas for slower speech
      .replace(/,/g, ', . ')
      // Add pauses between words for very slow speech
      .replace(/\s+/g, ' . ')
  }

  async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      // Process text for educational clarity
      const processedText = this.addNaturalPauses(text)
      
      console.log(`🎵 ElevenLabs: Generating speech for: "${text.substring(0, 50)}..."`)
      console.log(`🔗 API URL: ${this.config.baseUrl}/text-to-speech/${this.config.voiceId}`)
      
      const response = await fetch(`${this.config.baseUrl}/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.7,        // Higher stability for clearer speech
            similarity_boost: 0.8, // Higher similarity for consistent voice
            style: 0.2,            // Slight style for more natural speech
            use_speaker_boost: true
          }
        })
      })

      console.log(`📡 ElevenLabs response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ ElevenLabs API error: ${response.status} - ${errorText}`)
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log(`✅ Generated audio: ${arrayBuffer.byteLength} bytes`)
      return arrayBuffer
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error)
      throw error
    }
  }

  async playText(text: string): Promise<void> {
    try {
      console.log(`🎵 [Mobile v3] Starting playText for: "${text.substring(0, 30)}..."`)
      
      // Generate audio first
      const audioBuffer = await this.generateSpeech(text)
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      console.log(`🎵 [Mobile v3] Audio blob created: ${audioBlob.size} bytes`)
      
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
            console.log('✅ [Mobile v3] Audio completed successfully')
            cleanup()
            resolve()
          }
        }
        
        const safeReject = (error: string) => {
          if (!resolved) {
            resolved = true
            console.error(`❌ [Mobile v3] Audio failed: ${error}`)
            cleanup()
            reject(new Error(error))
          }
        }
        
        // Remove old event listeners and add new ones
        audio.onended = safeResolve
        audio.onerror = (e) => {
          console.error('❌ [Mobile v3] Audio error:', e)
          safeReject(`Audio error: ${e}`)
        }
        
        audio.oncanplaythrough = async () => {
          console.log('🎵 [Mobile v3] Can play through, starting playback...')
          
          try {
            // Stop current playback if any
            audio.pause()
            audio.currentTime = 0
            
            // Start new playback
            const playPromise = audio.play()
            
            if (playPromise) {
              await playPromise
              console.log('✅ [Mobile v3] Play started successfully')
            }
          } catch (playError) {
            console.error('❌ [Mobile v3] Play failed:', playError)
            safeReject(`Play failed: ${playError}`)
          }
        }
        
        // Mobile timeout
        timeoutId = setTimeout(() => {
          console.warn('⚠️ [Mobile v3] Audio timeout after 20 seconds')
          safeReject('Audio timeout')
        }, 20000)
        
        // Set source and load
        audio.src = audioUrl
        console.log(`🎵 [Mobile v3] Audio source set, loading...`)
        audio.load()
        
      })
    } catch (error) {
      console.error('❌ [Mobile v3] playText error:', error)
      throw error
    }
  }

  // Batch generate multiple audio clips for conversations
  async generateConversationAudio(conversation: { officer: string; driver: string }[]): Promise<{
    officerAudio: ArrayBuffer[]
    driverAudio: ArrayBuffer[]
  }> {
    const officerPromises = conversation.map(item => this.generateSpeech(item.officer))
    const driverPromises = conversation.map(item => this.generateSpeech(item.driver))

    const [officerAudio, driverAudio] = await Promise.all([
      Promise.all(officerPromises),
      Promise.all(driverPromises)
    ])

    return { officerAudio, driverAudio }
  }
}

// Factory function to create ElevenLabs service with environment variables
export const createElevenLabsService = (): ElevenLabsService => {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID
  
  console.log('🔍 ElevenLabs Debug:')
  console.log('  API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING')
  console.log('  Voice ID:', voiceId || 'MISSING')
  console.log('  Environment vars loaded:', Object.keys(import.meta.env))
  
  if (!apiKey || !voiceId) {
    console.error('❌ ElevenLabs configuration missing')
    throw new Error('ElevenLabs API key and Voice ID must be configured in environment variables')
  }
  
  return new ElevenLabsService(apiKey, voiceId)
}

// Default export
export default ElevenLabsService