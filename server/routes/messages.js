const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { translateText, checkGrammar } = require('../ai');
const { MESSAGE_QUICK_REPLIES } = require('../content');

const router = express.Router();

function shape(msg, currentUserId) {
  return {
    id: msg.id,
    from: msg.sender_id === currentUserId ? 'me' : 'her',
    text: msg.text,
    correction: msg.correction || null,
  };
}

router.get('/', requireAuth, (req, res) => {
  if (!req.user.partner_id) return res.json({ messages: [], quickReplies: [] });
  const rows = db.prepare(`
    SELECT * FROM messages WHERE sender_id = ? OR sender_id = ? ORDER BY id ASC
  `).all(req.user.id, req.user.partner_id);
  const quickReplies = req.user.role === 'companion'
    ? (MESSAGE_QUICK_REPLIES[req.user.native_lang] || [])
    : [];
  res.json({ messages: rows.map(m => shape(m, req.user.id)), quickReplies });
});

router.post('/', requireAuth, (req, res) => {
  const text = (req.body && req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'empty_message' });
  const info = db.prepare(`
    INSERT INTO messages (sender_id, text, created_at) VALUES (?, ?, ?)
  `).run(req.user.id, text, new Date().toISOString());
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);
  res.json({ message: shape(row, req.user.id) });
});

router.post('/:id/translate', requireAuth, async (req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'not_found' });

  const toLang = req.user.native_lang;
  const cacheCol = toLang === 'de' ? 'translation_de' : 'translation_el';
  if (msg[cacheCol]) return res.json({ translation: msg[cacheCol] });

  try {
    const translation = await translateText(msg.text, toLang);
    db.prepare(`UPDATE messages SET ${cacheCol} = ? WHERE id = ?`).run(translation, msg.id);
    res.json({ translation });
  } catch (e) {
    if (e.code === 'missing_api_key') return res.status(503).json({ error: 'missing_api_key' });
    console.error(e);
    res.status(500).json({ error: 'translation_failed' });
  }
});

router.post('/check', requireAuth, async (req, res) => {
  const text = (req.body && req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'empty_message' });
  try {
    const correction = await checkGrammar(text, req.user.target_lang);
    res.json({ correction });
  } catch (e) {
    if (e.code === 'missing_api_key') return res.status(503).json({ error: 'missing_api_key' });
    console.error(e);
    res.status(500).json({ error: 'check_failed' });
  }
});

module.exports = { router };