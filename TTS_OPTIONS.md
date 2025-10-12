# Voice-Over (TTS) Options for English Truck Coach

## Current Implementation: OpenAI TTS API

**Cost**: $15 per 1 million characters (~much cheaper than ElevenLabs)
- Voice options: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
- Models: `tts-1` (standard) or `tts-1-hd` (higher quality, costs more)
- Already integrated since you have OpenAI API key!

### How to use:
1. Start the server: `npm run dev:server`
2. Start the client: `npm run dev:client`
3. Type a message and the coach will respond with both text and voice

### Change voice:
Edit `/client/src/App.tsx` line 48 to change the voice:
```typescript
voice: "nova", // Change to: alloy, echo, fable, onyx, nova, shimmer
```

---

## FREE Open-Source Alternatives

### 1. Browser Web Speech API (100% Free)
**Pros**:
- No API needed, works in browser
- No cost at all
- Easy to implement

**Cons**:
- Voice quality varies by browser
- Limited voice options

**Implementation**:
Replace the `playVoice` function in `App.tsx` with:
```typescript
const playVoice = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slow down for learners
  utterance.pitch = 1;
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
};
```

---

### 2. Coqui TTS (Free, Self-Hosted)
**Pros**:
- Completely free
- High-quality neural voices
- Can run locally or on your server

**Cons**:
- Requires setup
- Needs Python environment

**Setup**:
```bash
pip install TTS
```

Create a Python TTS server:
```python
# tts_server.py
from flask import Flask, request, send_file
from TTS.api import TTS
import tempfile

app = Flask(__name__)
tts = TTS("tts_models/en/ljspeech/tacotron2-DDC")

@app.route('/tts', methods=['POST'])
def text_to_speech():
    text = request.json['text']
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
        tts.tts_to_file(text=text, file_path=f.name)
        return send_file(f.name, mimetype='audio/wav')

app.run(port=5002)
```

Then update your Node server to proxy to this service.

---

### 3. Mozilla TTS (Free, Self-Hosted)
Similar to Coqui TTS (they're related projects). Good quality, free, self-hosted.

**GitHub**: https://github.com/mozilla/TTS

---

### 4. Piper TTS (Free, Fast, Local)
**Pros**:
- Very fast
- Low resource usage
- Good quality
- Easy to self-host

**Cons**:
- Requires setup

**Docker Setup**:
```bash
docker run -p 10200:10200 rhasspy/piper:latest
```

---

### 5. Festival TTS (Free, Lightweight)
**Pros**:
- Very lightweight
- Works on older hardware
- Easy to install

**Cons**:
- Robotic voice quality

**Install on Mac**:
```bash
brew install festival
```

---

### 6. gTTS (Google Text-to-Speech - Free)
**Pros**:
- Free Google TTS
- Good quality
- Easy to use

**Cons**:
- Requires internet
- Rate limits may apply

**Implementation** (Python):
```bash
pip install gtts
```

Create a server:
```python
from flask import Flask, request, send_file
from gtts import gTTS
import tempfile

app = Flask(__name__)

@app.route('/tts', methods=['POST'])
def text_to_speech():
    text = request.json['text']
    tts = gTTS(text=text, lang='en', slow=True)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
        tts.save(f.name)
        return send_file(f.name, mimetype='audio/mpeg')

app.run(port=5002)
```

---

## Cost Comparison

| Service | Cost | Quality | Setup |
|---------|------|---------|-------|
| ElevenLabs | $$$$ (~$99-330/mo) | Excellent | Easy |
| OpenAI TTS | $ ($15/1M chars) | Excellent | Easy ✅ |
| Web Speech API | FREE | Good | Very Easy |
| Coqui TTS | FREE | Excellent | Medium |
| Piper TTS | FREE | Very Good | Medium |
| gTTS | FREE | Good | Easy |

---

## Recommendation

1. **Use OpenAI TTS** (current implementation) - You already have it, very affordable
2. **For 100% free**: Use Web Speech API (browser-based, no server needed)
3. **For best free quality**: Self-host Coqui TTS or Piper

The current OpenAI implementation is excellent and costs very little. For example:
- 1000 characters = ~$0.015 (1.5 cents)
- 100,000 characters = ~$1.50
- This is much cheaper than ElevenLabs!

## Testing the Current Setup

1. Make sure your server is running
2. Open your browser to the client
3. Send a message
4. The voice will play automatically, or click "Play Voice" button

Enjoy your affordable voice coach!
