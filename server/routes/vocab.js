const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { getCourse } = require('../content');

const router = express.Router();

function favoriteIds(userId) {
  const rows = db.prepare('SELECT vocab_id FROM vocab_favorites WHERE user_id = ?').all(userId);
  return new Set(rows.map(r => r.vocab_id));
}

router.get('/', requireAuth, (req, res) => {
  const course = getCourse(req.user.target_lang);
  const favs = favoriteIds(req.user.id);
  const vocab = course.vocab.map(v => ({ ...v, fav: favs.has(v.id) }));
  res.json({ vocab });
});

router.post('/:vocabId/toggle-favorite', requireAuth, (req, res) => {
  const { vocabId } = req.params;
  const existing = db.prepare('SELECT 1 FROM vocab_favorites WHERE user_id = ? AND vocab_id = ?')
    .get(req.user.id, vocabId);
  if (existing) {
    db.prepare('DELETE FROM vocab_favorites WHERE user_id = ? AND vocab_id = ?').run(req.user.id, vocabId);
  } else {
    db.prepare('INSERT INTO vocab_favorites (user_id, vocab_id) VALUES (?, ?)').run(req.user.id, vocabId);
  }
  res.json({ fav: !existing });
});

module.exports = { router };
