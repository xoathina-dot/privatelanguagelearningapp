const express = require('express');
const db = require('../db');
const { requireAuth, getUserById } = require('../auth');
const { tutorReply, companionCoachReply } = require('../ai');
const { getCourse, COMPANION_CHIPS } = require('../content');
const { getCurrentLesson } = require('./lessons');

const router = express.Router();

function shape(m) {
  return { id: m.id, from: m.from_role === 'ai' ? 'ai' : 'me', text: m.text };
}

router.get('/chips', requireAuth, (req, res) => {
  if (req.user.role === 'companion') {
    return res.json({ chips: COMPANION_CHIPS });
  }
  const course = getCourse(req.user.target_lang);
  res.json({ chips: course.tutorChips || [] });
});

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
    let reply;
    if (req.user.role === 'companion') {
      const partner = req.user.partner_id ? getUserById(req.user.partner_id) : null;
      const currentLessonInfo = partner ? getCurrentLesson(partner) : null;
      reply = await companionCoachReply(
        history.slice(-12),
        partner ? partner.display_name : 'dein Partner / deine Partnerin',
        partner ? partner.target_lang : 'de',
        currentLessonInfo
      );
    } else {
      reply = await tutorReply(history.slice(-12), req.user.target_lang, req.user.native_lang);
    }
    db.prepare('INSERT INTO tutor_messages (user_id, from_role, text, created_at) VALUES (?, ?, ?, ?)')
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
