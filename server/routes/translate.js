import express from 'express';

const router = express.Router();

// Translation API endpoint using Google Translate free API
router.post('/', async (req, res) => {
  try {
    const { text, target, source = 'en' } = req.body;

    if (!text || !target) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    console.log(`🌍 Translation request: ${source} → ${target}`);
    console.log(`📝 Text: "${text.substring(0, 100)}..."`);

    // Using Google Translate free endpoint (unofficial)
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(translateUrl);
    const data = await response.json();

    // Parse Google Translate response
    let translatedText = '';
    if (data && data[0]) {
      translatedText = data[0].map(item => item[0]).join('');
    }

    console.log(`✅ Translation result: "${translatedText.substring(0, 100)}..."`);

    res.json({
      translatedText: translatedText || text,
      sourceLanguage: source,
      targetLanguage: target
    });

  } catch (error) {
    console.error('❌ Translation error:', error);
    // Return original text if translation fails
    res.json({
      translatedText: req.body.text,
      error: 'Translation failed, returning original text'
    });
  }
});

export default router;
