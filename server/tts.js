const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// Google Cloud TTS language codes for our two course languages. We let
// Google pick its default voice for the language + gender rather than
// pinning a specific voice name, since not every language has the same
// voice tiers (e.g. Greek has fewer WaveNet voices than German).
const LANGUAGE_CODES = { de: 'de-DE', el: 'el-GR' };

async function synthesizeSpeech(text, targetLang) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('missing_api_key'), { code: 'missing_api_key' });
  }
  const languageCode = LANGUAGE_CODES[targetLang];
  if (!languageCode) {
    throw Object.assign(new Error('unsupported_language'), { code: 'unsupported_language' });
  }

  const res = await fetch(`${TTS_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode, ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Google TTS API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  if (!data.audioContent) {
    throw new Error('Google TTS API returned no audio content');
  }
  return data.audioContent; // base64-encoded MP3
}

module.exports = { synthesizeSpeech };