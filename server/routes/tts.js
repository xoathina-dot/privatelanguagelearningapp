const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { synthesizeSpeech } = require('../tts');

const router = express.Router();
const MAX_TEXT_LENGTH = 300;

router.get('/', requireAuth, async (req, res) => {
  const text = (req.query.text || '').toString().trim();
  const lang = (req.query.lang || '').toString().trim();

  if (!text) return res.status(400).json({ error: 'missing_text' });
  if (text.length > MAX_TEXT_LENGTH) return res.status(400).json({ error: 'text_too_long' });
  if (lang !== 'de' && lang !== 'el') return res.status(400).json({ error: 'invalid_lang' });

  const cached = db.prepare('SELECT audio_base64 FROM tts_cache WHERE text = ? AND lang = ?').get(text, lang);
  if (cached) {
    return res.json({ audio: cached.audio_base64, cached: true });
  }

  try {
    const audio = await synthesizeSpeech(text, lang);
    db.prepare(`
      INSERT INTO tts_cache (text, lang, audio_base64, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(text, lang) DO UPDATE SET audio_base64 = excluded.audio_base64
    `).run(text, lang, audio, new Date().toISOString());
    res.json({ audio, cached: false });
  } catch (e) {
    if (e.code === 'missing_api_key') return res.status(503).json({ error: 'missing_api_key' });
    if (e.code === 'unsupported_language') return res.status(400).json({ error: 'unsupported_language' });
    console.error(e);
    res.status(500).json({ error: 'tts_failed' });
  }
});

module.exports = { router };