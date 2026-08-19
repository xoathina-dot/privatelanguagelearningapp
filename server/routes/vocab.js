const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { getCourse } = require('../content');
const { effectiveLearner } = require('./lessons');

const router = express.Router();

function favoriteIds(userId) {
  const rows = db.prepare('SELECT vocab_id FROM vocab_favorites WHERE user_id = ?').all(userId);
  return new Set(rows.map(r => r.vocab_id));
}

// Custom (user-added) vocab rows are given an id like "c17" (c + db row id)
// so they can never collide with the static ids from content.js (e.g. "de1").
function customRowToVocab(row, currentUserId) {
  return {
    id: 'c' + row.id,
    target: row.target,
    native: row.native,
    note: row.note || '',
    cat: row.cat,
    custom: true,
    addedByMe: row.added_by === currentUserId,
  };
}

function loadCustomVocab(targetLang) {
  return db.prepare('SELECT * FROM custom_vocab WHERE target_lang = ? ORDER BY created_at ASC').all(targetLang);
}

router.get('/', requireAuth, (req, res) => {
  const isCompanionView = req.user.role === 'companion';
  const learner = effectiveLearner(req.user);
  if (!learner) return res.json({ vocab: [], isCompanionView, learnerDisplayName: null, courseLabel: null });

  const course = getCourse(learner.target_lang);
  const favs = favoriteIds(req.user.id);
  const staticVocab = course.vocab.map(v => ({ ...v, fav: favs.has(v.id), custom: false }));
  const customVocab = loadCustomVocab(learner.target_lang)
    .map(row => ({ ...customRowToVocab(row, req.user.id), fav: favs.has('c' + row.id) }));

  res.json({
    vocab: [...staticVocab, ...customVocab],
    isCompanionView,
    learnerDisplayName: isCompanionView ? learner.display_name : null,
    courseLabel: course.label,
  });
});

router.post('/', requireAuth, (req, res) => {
  const learner = effectiveLearner(req.user);
  if (!learner) return res.status(400).json({ error: 'no_learner' });

  const target = (req.body.target || '').trim();
  const native = (req.body.native || '').trim();
  const note = (req.body.note || '').trim();
  const cat = (req.body.cat || '').trim();

  if (!target || !native || !cat) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const result = db.prepare(`
    INSERT INTO custom_vocab (target_lang, target, native, note, cat, added_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(learner.target_lang, target, native, note, cat, req.user.id, new Date().toISOString());

  const row = db.prepare('SELECT * FROM custom_vocab WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ vocab: { ...customRowToVocab(row, req.user.id), fav: false } });
});

router.delete('/:vocabId', requireAuth, (req, res) => {
  const { vocabId } = req.params;
  if (!vocabId.startsWith('c')) {
    // Only user-added entries can be deleted; static course content can't.
    return res.status(403).json({ error: 'cannot_delete_static_vocab' });
  }
  const dbId = Number(vocabId.slice(1));
  const learner = effectiveLearner(req.user);
  if (!learner) return res.status(400).json({ error: 'no_learner' });

  const row = db.prepare('SELECT * FROM custom_vocab WHERE id = ?').get(dbId);
  if (!row || row.target_lang !== learner.target_lang) {
    return res.status(404).json({ error: 'not_found' });
  }
  // Either partner can delete a shared custom entry (both learner and companion
  // are working from the same shared vocab list for this course).
  db.prepare('DELETE FROM custom_vocab WHERE id = ?').run(dbId);
  db.prepare('DELETE FROM vocab_favorites WHERE vocab_id = ?').run(vocabId);
  res.json({ deleted: true });
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