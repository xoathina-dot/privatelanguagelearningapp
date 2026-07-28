const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { tutorReply } = require('../ai');
const { getCourse } = require('../content');

const router = express.Router();

router.get('/chips', requireAuth, (req, res) => {
  const course = getCourse(req.user.target_lang);
  res.json({ chips: course.tutorChips || [] });
});

function shape(m) {
  return { id: m.id, from: m.from_role === 'ai' ? 'ai' : 'me', text: m.text };
}

router.get('/messages', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM tutor_messages WHERE user_id = ? ORDER BY id ASC').all(req.user.id);
  res.json({ messages: rows.map(shape) });
});

router.post('/messages', requireAuth, async (req, res) => {
  const text = (req.body && req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'empty_message' });

  const now = new Date().toISOString();
  db.prepare('INSERT INTO tutor_messages (user_id, from_role, text, created_at) VALUES (?, ?, ?, ?)')
    .run(req.user.id, 'me', text, now);

  try {
    const history = db.prepare('SELECT * FROM tutor_messages WHERE user_id = ? ORDER BY id ASC').all(req.user.id);
    const reply = await tutorReply(history.slice(-12), req.user.target_lang, req.user.native_lang);
    const info = db.prepare('INSERT INTO tutor_messages (user_id, from_role, text, created_at) VALUES (?, ?, ?, ?)')
      .run(req.user.id, 'ai', reply, new Date().toISOString());
    const rows = db.prepare('SELECT * FROM tutor_messages WHERE user_id = ? ORDER BY id ASC').all(req.user.id);
    res.json({ messages: rows.map(shape) });
  } catch (e) {
    const rows = db.prepare('SELECT * FROM tutor_messages WHERE user_id = ? ORDER BY id ASC').all(req.user.id);
    if (e.code === 'missing_api_key') {
      return res.status(503).json({ error: 'missing_api_key', messages: rows.map(shape) });
    }
    console.error(e);
    res.status(500).json({ error: 'tutor_failed', messages: rows.map(shape) });
  }
});

module.exports = { router };
