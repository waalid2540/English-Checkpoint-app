// ElevenLabs Text-to-Speech Service
// Professional AI voices for DOT training and pronunciation

interface ElevenLabsConfig {
  apiKey: string
  voiceId: string
  baseUrl: string
}

class ElevenLabsService {
  private config: ElevenLabsConfig

  constructor(apiKey: string, voiceId: string) {
    this.config = {
      apiKey,
      voiceId,
      baseUrl: 'https://api.elevenlabs.io/v1'
    }
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
      console.log(`🎵 [Mobile Fix] Starting playText for: "${text.substring(0, 30)}..."`)
      
      const audioBuffer = await this.generateSpeech(text)
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio()
      
      // Critical mobile settings
      audio.preload = 'auto'
      audio.volume = 1.0
      audio.crossOrigin = 'anonymous'
      
      return new Promise((resolve, reject) => {
        let resolved = false
        let timeoutId: NodeJS.Timeout
        let loadTimeoutId: NodeJS.Timeout
        
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId)
          if (loadTimeoutId) clearTimeout(loadTimeoutId)
          URL.revokeObjectURL(audioUrl)
          audio.pause()
          audio.removeAttribute('src')
          audio.load()
        }
        
        const safeResolve = () => {
          if (!resolved) {
            resolved = true
            cleanup()
            console.log('✅ [Mobile Fix] Audio completed successfully')
            resolve()
          }
        }
        
        const safeReject = (error: string) => {
          if (!resolved) {
            resolved = true
            cleanup()
            console.error(`❌ [Mobile Fix] Audio failed: ${error}`)
            reject(new Error(error))
          }
        }
        
        // Set up event listeners
        audio.onended = safeResolve
        audio.onerror = (e) => {
          console.error('❌ [Mobile Fix] Audio error event:', e)
          safeReject('Audio error event')
        }
        audio.onabort = () => safeReject('Audio aborted')
        audio.onstalled = () => console.warn('⚠️ [Mobile Fix] Audio stalled but continuing...')
        
        // Mobile-specific: wait for can play through and then play immediately
        audio.oncanplaythrough = async () => {
          try {
            console.log('🎵 [Mobile Fix] Audio can play through, attempting to start...')
            if (loadTimeoutId) clearTimeout(loadTimeoutId)
            
            const playPromise = audio.play()
            
            if (playPromise !== undefined) {
              await playPromise
              console.log('✅ [Mobile Fix] Play promise resolved')
            }
          } catch (playError) {
            console.error('❌ [Mobile Fix] Play promise rejected:', playError)
            safeReject(`Play failed: ${playError}`)
          }
        }
        
        // Fallback for when canplaythrough doesn't fire
        audio.oncanplay = async () => {
          if (resolved) return
          
          console.log('🎵 [Mobile Fix] Audio can play (fallback), waiting 500ms then attempting to start...')
          setTimeout(async () => {
            if (resolved) return
            
            try {
              const playPromise = audio.play()
              
              if (playPromise !== undefined) {
                await playPromise
                console.log('✅ [Mobile Fix] Play promise resolved (fallback)')
              }
            } catch (playError) {
              console.error('❌ [Mobile Fix] Play promise rejected (fallback):', playError)
              safeReject(`Play failed (fallback): ${playError}`)
            }
          }, 500)
        }
        
        // Set timeout for complete audio playback - mobile needs longer timeout
        timeoutId = setTimeout(() => {
          console.warn('⚠️ [Mobile Fix] Audio timeout after 25 seconds')
          safeReject('Audio timeout')
        }, 25000)
        
        // Set timeout for audio loading - if it doesn't load in 10 seconds, fail
        loadTimeoutId = setTimeout(() => {
          if (!resolved) {
            console.warn('⚠️ [Mobile Fix] Audio loading timeout after 10 seconds')
            safeReject('Audio loading timeout')
          }
        }, 10000)
        
        // Start loading
        audio.src = audioUrl
        audio.load()
        
      })
    } catch (error) {
      console.error('❌ [Mobile Fix] playText error:', error)
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