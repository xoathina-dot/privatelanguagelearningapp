const express = require('express');
const db = require('../db');
const { requireAuth, getUserById } = require('../auth');
const { getCourse } = require('../content');
const { effectiveLearner } = require('./lessons');

const router = express.Router();

function favoriteIds(userId) {
  const rows = db.prepare('SELECT vocab_id FROM vocab_favorites WHERE user_id = ?').all(userId);
  return new Set(rows.map(r => r.vocab_id));
}

router.get('/', requireAuth, (req, res) => {
  const isCompanionView = req.user.role === 'companion';
  const learner = effectiveLearner(req.user);
  if (!learner) return res.json({ vocab: [], isCompanionView, learnerDisplayName: null, courseLabel: null });

  const course = getCourse(learner.target_lang);
  const favs = favoriteIds(req.user.id);

  const staticVocab = course.vocab.map(v => ({ ...v, fav: favs.has(v.id), isCustom: false }));

  const customRows = db.prepare(`
    SELECT cv.*, u.display_name AS added_by_name
    FROM custom_vocab cv
    JOIN users u ON cv.added_by_user_id = u.id
    WHERE cv.target_lang = ?
    ORDER BY cv.id ASC
  `).all(learner.target_lang);

  const customVocab = customRows.map(r => ({
    id: `custom_${r.id}`,
    target: r.target_text,
    native: r.native_text,
    note: r.note,
    cat: r.cat,
    fav: favs.has(`custom_${r.id}`),
    isCustom: true,
    addedByName: r.added_by_name,
  }));

  res.json({
    vocab: [...staticVocab, ...customVocab],
    isCompanionView,
    learnerDisplayName: isCompanionView ? learner.display_name : null,
    courseLabel: course.label,
  });
});

router.post('/custom', requireAuth, (req, res) => {
  const { targetText, nativeText, note, cat } = req.body || {};
  const target = (targetText || '').trim();
  const native = (nativeText || '').trim();
  if (!target || !native) return res.status(400).json({ error: 'missing_fields' });

  // Determine target_lang server-side — never trust the client.
  const learner = effectiveLearner(req.user);
  if (!learner) return res.status(400).json({ error: 'no_learner' });

  const info = db.prepare(`
    INSERT INTO custom_vocab (target_lang, target_text, native_text, note, cat, added_by_user_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    learner.target_lang,
    target,
    native,
    (note || '').trim(),
    (cat || 'Δικά μας').trim(),
    req.user.id,
    new Date().toISOString()
  );

  const adder = getUserById(req.user.id);
  res.json({
    vocab: {
      id: `custom_${info.lastInsertRowid}`,
      target,
      native,
      note: (note || '').trim(),
      cat: (cat || 'Δικά μας').trim(),
      fav: false,
      isCustom: true,
      addedByName: adder.display_name,
    },
  });
});

router.delete('/custom/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  const row = db.prepare('SELECT id FROM custom_vocab WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  db.prepare('DELETE FROM custom_vocab WHERE id = ?').run(id);
  db.prepare('DELETE FROM vocab_favorites WHERE vocab_id = ?').run(`custom_${id}`);
  res.json({ ok: true });
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
