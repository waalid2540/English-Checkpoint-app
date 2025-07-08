// Pre-recorded Audio Service for DOT Practice
// Uses MP3 files instead of real-time TTS for better mobile compatibility

class PrerecordedAudioService {
  private audioElement: HTMLAudioElement | null = null
  private baseAudioUrl: string

  constructor() {
    this.baseAudioUrl = '/audio' // Audio files served from public/audio/
  }

  // Initialize a single audio element for mobile compatibility
  public initializeAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      console.log('🎵 [Prerecorded] Creating single audio element for reuse')
      this.audioElement = new Audio()
      this.audioElement.preload = 'auto'
      this.audioElement.volume = 1.0
      this.audioElement.muted = false
    }
    return this.audioElement
  }

  // Play audio for a specific question and type (officer or driver)
  async playAudio(questionId: number, type: 'officer' | 'driver'): Promise<void> {
    try {
      console.log(`🎵 [Prerecorded] Playing ${type} audio for question ${questionId}`)
      
      // Construct the audio file path
      const audioUrl = `${this.baseAudioUrl}/${type}/${questionId}.mp3`
      
      // Use single audio element for mobile compatibility
      const audio = this.initializeAudioElement()
      
      return new Promise((resolve, reject) => {
        let resolved = false
        let timeoutId: NodeJS.Timeout
        
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId)
        }
        
        const safeResolve = () => {
          if (!resolved) {
            resolved = true
            console.log(`✅ [Prerecorded] ${type} audio completed for question ${questionId}`)
            cleanup()
            resolve()
          }
        }
        
        const safeReject = (error: string) => {
          if (!resolved) {
            resolved = true
            console.error(`❌ [Prerecorded] ${type} audio failed for question ${questionId}: ${error}`)
            cleanup()
            reject(new Error(error))
          }
        }
        
        // Set up event listeners
        audio.onended = safeResolve
        audio.onerror = (e) => {
          console.error(`❌ [Prerecorded] Audio error for ${audioUrl}:`, e)
          safeReject(`Audio error: ${e}`)
        }
        
        audio.oncanplaythrough = async () => {
          console.log(`🎵 [Prerecorded] Can play through, starting ${type} audio...`)
          
          try {
            // Stop current playback if any
            audio.pause()
            audio.currentTime = 0
            
            // Start new playback
            const playPromise = audio.play()
            
            if (playPromise) {
              await playPromise
              console.log(`✅ [Prerecorded] ${type} play started successfully`)
            }
          } catch (playError) {
            console.error(`❌ [Prerecorded] ${type} play failed:`, playError)
            safeReject(`Play failed: ${playError}`)
          }
        }
        
        // Timeout for audio loading and playback
        timeoutId = setTimeout(() => {
          console.warn(`⚠️ [Prerecorded] ${type} audio timeout for question ${questionId}`)
          safeReject('Audio timeout')
        }, 15000)
        
        // Set source and load
        audio.src = audioUrl
        console.log(`🎵 [Prerecorded] Loading ${type} audio: ${audioUrl}`)
        audio.load()
        
      })
    } catch (error) {
      console.error(`❌ [Prerecorded] playAudio error for question ${questionId}, ${type}:`, error)
      throw error
    }
  }

  // Play a complete conversation (officer then driver)
  async playConversation(questionId: number): Promise<void> {
    try {
      console.log(`🎵 [Prerecorded] Starting conversation ${questionId}`)
      
      // Play officer part
      await this.playAudio(questionId, 'officer')
      
      // Short pause between officer and driver
      console.log('⏸️ [Prerecorded] Pause between officer and driver...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Play driver part
      await this.playAudio(questionId, 'driver')
      
      console.log(`✅ [Prerecorded] Completed conversation ${questionId}`)
    } catch (error) {
      console.error(`❌ [Prerecorded] Conversation ${questionId} failed:`, error)
      throw error
    }
  }

  // Check if audio file exists (for fallback)
  async checkAudioExists(questionId: number, type: 'officer' | 'driver'): Promise<boolean> {
    try {
      const audioUrl = `${this.baseAudioUrl}/${type}/${questionId}.mp3`
      const response = await fetch(audioUrl, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  // Preload audio files for better performance
  async preloadAudio(questionIds: number[]): Promise<void> {
    console.log(`🔄 [Prerecorded] Preloading audio for ${questionIds.length} questions`)
    
    for (const id of questionIds.slice(0, 5)) { // Preload first 5 questions
      try {
        const officerUrl = `${this.baseAudioUrl}/officer/${id}.mp3`
        const driverUrl = `${this.baseAudioUrl}/driver/${id}.mp3`
        
        // Preload by creating temporary audio elements
        const officerAudio = new Audio(officerUrl)
        const driverAudio = new Audio(driverUrl)
        
        officerAudio.preload = 'auto'
        driverAudio.preload = 'auto'
        
        // No need to wait for loading, just trigger the preload
        officerAudio.load()
        driverAudio.load()
        
        console.log(`✅ [Prerecorded] Preloaded question ${id}`)
      } catch (error) {
        console.warn(`⚠️ [Prerecorded] Failed to preload question ${id}:`, error)
      }
    }
  }
}

// Factory function to create the prerecorded audio service
export const createPrerecordedAudioService = (): PrerecordedAudioService => {
  console.log('🎵 [Prerecorded] Initializing prerecorded audio service')
  return new PrerecordedAudioService()
}

// Default export
export default PrerecordedAudioService