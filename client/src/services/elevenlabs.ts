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

  async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(`${this.config.baseUrl}/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      throw error
    }
  }

  async playText(text: string): Promise<void> {
    try {
      const audioBuffer = await this.generateSpeech(text)
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio(audioUrl)
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Audio playback failed'))
        }
        audio.play()
      })
    } catch (error) {
      console.error('Failed to play audio:', error)
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
  
  if (!apiKey || !voiceId) {
    throw new Error('ElevenLabs API key and Voice ID must be configured in environment variables')
  }
  
  return new ElevenLabsService(apiKey, voiceId)
}

// Default export
export default ElevenLabsService