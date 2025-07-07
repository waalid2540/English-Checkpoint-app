// Google Translate Service for DOT Practice
// Helps immigrant drivers understand DOT scenarios in their native language

interface TranslationResponse {
  translatedText: string
  detectedSourceLanguage?: string
}

interface SupportedLanguage {
  code: string
  name: string
  flag: string
}

// Supported languages for immigrant truck drivers
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
  { code: 'am', name: 'Amharic (Ethiopian)', flag: '🇪🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian (Dari)', flag: '🇦🇫' },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' }
]

class TranslationService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    // Using Google Translate API via backend to keep API key secure
    this.apiKey = ''
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-app.onrender.com'
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      console.log(`🌍 Translating to ${targetLanguage}: "${text.substring(0, 50)}..."`)
      
      // Call our backend which handles Google Translate API
      const response = await fetch(`${this.baseUrl}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          target: targetLanguage,
          source: 'en' // Always translating from English
        })
      })

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Translation successful: "${data.translatedText?.substring(0, 50)}..."`)
      
      return data.translatedText || text
    } catch (error) {
      console.error('❌ Translation error:', error)
      // Return original text if translation fails
      return text
    }
  }

  async translateConversation(officer: string, driver: string, targetLanguage: string): Promise<{
    officer: string
    driver: string
  }> {
    try {
      // If target is English, return original
      if (targetLanguage === 'en') {
        return { officer, driver }
      }

      // Translate both parts in parallel for better performance
      const [translatedOfficer, translatedDriver] = await Promise.all([
        this.translateText(officer, targetLanguage),
        this.translateText(driver, targetLanguage)
      ])

      return {
        officer: translatedOfficer,
        driver: translatedDriver
      }
    } catch (error) {
      console.error('❌ Conversation translation error:', error)
      // Return original text if translation fails
      return { officer, driver }
    }
  }

  getLanguageName(code: string): string {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
    return language ? language.name : 'Unknown'
  }

  getLanguageFlag(code: string): string {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
    return language ? language.flag : '🌍'
  }
}

// Create singleton instance
export const translationService = new TranslationService()

export default TranslationService