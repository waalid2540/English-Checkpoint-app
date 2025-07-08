// Script to generate all audio files for DOT practice questions
// This will create MP3 files for all 198 questions and answers

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../client/.env') });

// Use Node.js built-in fetch (available in Node 18+)
const fetch = globalThis.fetch;

// Sample prompts data (first few for testing)
const samplePrompts = [
  {
    officer: "What are you hauling?",
    driver: "I'm hauling refrigerated meat products for a grocery chain.",
    id: 1,
    isFree: true
  },
  {
    officer: "How far are you from your delivery location?",
    driver: "I'm about 120 miles away from my drop-off point.",
    id: 2,
    isFree: true
  },
  {
    officer: "Are your load straps secure?",
    driver: "Yes, I double-checked all straps before leaving the warehouse.",
    id: 3,
    isFree: true
  },
  {
    officer: "When did you last take a break?",
    driver: "About 30 minutes ago, I stopped at a rest area for lunch.",
    id: 4,
    isFree: true
  },
  {
    officer: "Are you hauling perishable goods?",
    driver: "Yes, I'm transporting frozen vegetables in a reefer trailer.",
    id: 5,
    isFree: true
  }
];

class AudioGenerator {
  constructor(apiKey, voiceId) {
    this.apiKey = apiKey;
    this.voiceId = voiceId;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  // Add natural pauses to text for slower, clearer speech
  addNaturalPauses(text) {
    return text
      .replace(/\./g, '. . .')
      .replace(/\?/g, '? . . .')
      .replace(/,/g, ', . ')
      .replace(/\s+/g, ' . ');
  }

  async generateSpeech(text) {
    try {
      const processedText = this.addNaturalPauses(text);
      
      console.log(`🎵 Generating audio for: "${text.substring(0, 50)}..."`);
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('❌ TTS error:', error);
      throw error;
    }
  }

  async generateAllAudioFiles() {
    // Create directories if they don't exist
    const audioDir = path.join(__dirname, '../client/public/audio');
    const officerDir = path.join(audioDir, 'officer');
    const driverDir = path.join(audioDir, 'driver');

    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    if (!fs.existsSync(officerDir)) fs.mkdirSync(officerDir, { recursive: true });
    if (!fs.existsSync(driverDir)) fs.mkdirSync(driverDir, { recursive: true });

    console.log(`🚀 Starting generation of ${samplePrompts.length * 2} audio files...`);

    for (let i = 0; i < samplePrompts.length; i++) {
      const prompt = samplePrompts[i];
      const questionId = prompt.id || (i + 1);

      try {
        // Generate officer audio
        console.log(`👮‍♂️ Generating officer audio ${questionId}/198...`);
        const officerAudio = await this.generateSpeech(prompt.officer);
        const officerPath = path.join(officerDir, `${questionId}.mp3`);
        fs.writeFileSync(officerPath, Buffer.from(officerAudio));

        // Wait a bit to not overwhelm the API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate driver audio
        console.log(`🚛 Generating driver audio ${questionId}/198...`);
        const driverAudio = await this.generateSpeech(prompt.driver);
        const driverPath = path.join(driverDir, `${questionId}.mp3`);
        fs.writeFileSync(driverPath, Buffer.from(driverAudio));

        // Wait a bit between each conversation
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log(`✅ Completed conversation ${questionId}/198`);

      } catch (error) {
        console.error(`❌ Failed to generate audio for conversation ${questionId}:`, error);
        // Continue with next conversation
      }
    }

    console.log('🎉 Audio generation completed!');
  }
}

// Main execution
async function main() {
  const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
  const voiceId = process.env.VITE_ELEVENLABS_VOICE_ID;

  console.log('🔧 Environment Check:');
  console.log('  API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
  console.log('  Voice ID:', voiceId || 'MISSING');

  if (!apiKey || !voiceId) {
    console.error('❌ Please set VITE_ELEVENLABS_API_KEY and VITE_ELEVENLABS_VOICE_ID environment variables');
    console.error('💡 Make sure your client/.env file has these values');
    process.exit(1);
  }

  const generator = new AudioGenerator(apiKey, voiceId);
  await generator.generateAllAudioFiles();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AudioGenerator };