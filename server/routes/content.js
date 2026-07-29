const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { getCourse } = require('../content');
const { effectiveLearner } = require('./lessons');

const router = express.Router();

// ── Validation helpers ───────────────────────────────────────────────────────

function validateQuizQuestion(q, prefix) {
  if (!q || typeof q !== 'object') return `${prefix}: muss ein Objekt sein.`;
  if (!String(q.prompt  || '').trim()) return `${prefix}: "prompt" fehlt oder ist leer.`;
  if (!String(q.translation || '').trim()) return `${prefix}: "translation" fehlt oder ist leer.`;
  if (!String(q.answer  || '').trim()) return `${prefix}: "answer" fehlt oder ist leer.`;
  if (!Array.isArray(q.options) || q.options.length < 2)
    return `${prefix}: "options" muss ein Array mit mindestens 2 Einträgen sein.`;
  if (!q.options.includes(q.answer))
    return `${prefix}: "answer" (${JSON.stringify(q.answer)}) muss exakt einem Eintrag in "options" entsprechen.`;
  return null;
}

function validateLesson(l, prefix) {
  if (!String(l.title || '').trim()) return `${prefix}: "title" fehlt oder ist leer.`;
  if (!String(l.sub   || '').trim()) return `${prefix}: "sub" fehlt oder ist leer.`;
  if (typeof l.xp !== 'number' || !Number.isFinite(l.xp))
    return `${prefix}: "xp" muss eine Zahl sein.`;
  if (!Array.isArray(l.quiz) || !l.quiz.length)
    return `${prefix}: "quiz" muss ein nicht-leeres Array sein.`;
  for (let i = 0; i < l.quiz.length; i++) {
    const err = validateQuizQuestion(l.quiz[i], `${prefix}, Quiz-Frage ${i + 1}`);
    if (err) return err;
  }
  return null;
}

// ── POST /api/content/import ─────────────────────────────────────────────────

router.post('/import', requireAuth, (req, res) => {
  const { type, data } = req.body || {};
  if (!data || typeof data !== 'object')
    return res.status(400).json({ error: '"data" fehlt oder ist kein Objekt.' });

  // Determine target_lang server-side — never trust the client.
  const learner = effectiveLearner(req.user);
  if (!learner)
    return res.status(400).json({ error: 'Kein verknüpfter Lerner-Account gefunden.' });
  const targetLang = learner.target_lang;

  const now = new Date().toISOString();

  // ── type: lesson ────────────────────────────────────────────────────────────
  if (type === 'lesson') {
    const { unitId, title, sub, xp, quiz } = data;

    if (!String(title || '').trim()) return res.status(400).json({ error: '"title" fehlt oder ist leer.' });
    if (!String(sub   || '').trim()) return res.status(400).json({ error: '"sub" fehlt oder ist leer.' });
    if (typeof xp !== 'number' || !Number.isFinite(xp))
      return res.status(400).json({ error: '"xp" muss eine Zahl sein.' });
    if (!Array.isArray(quiz) || !quiz.length)
      return res.status(400).json({ error: '"quiz" muss ein nicht-leeres Array sein.' });

    for (let i = 0; i < quiz.length; i++) {
      const err = validateQuizQuestion(quiz[i], `Quiz-Frage ${i + 1}`);
      if (err) return res.status(400).json({ error: err });
    }

    // Validate unitId against merged course (includes custom units).
    const course = getCourse(targetLang);
    const unitExists = course.units.some(u => u.id === unitId);
    if (!unitExists)
      return res.status(400).json({ error: `Einheit "${unitId}" existiert nicht in Sprache "${targetLang}".` });

    db.prepare(
      'INSERT INTO custom_lessons (target_lang, unit_id, title, sub, xp, quiz_json, created_at) VALUES (?,?,?,?,?,?,?)'
    ).run(targetLang, unitId, title.trim(), sub.trim(), xp, JSON.stringify(quiz), now);

    return res.json({ ok: true });
  }

  // ── type: unit ──────────────────────────────────────────────────────────────
  if (type === 'unit') {
    const { title, sub, level, lessons } = data;

    if (!String(title || '').trim()) return res.status(400).json({ error: '"title" fehlt oder ist leer.' });
    if (!String(sub   || '').trim()) return res.status(400).json({ error: '"sub" fehlt oder ist leer.' });
    if (!Array.isArray(lessons) || !lessons.length)
      return res.status(400).json({ error: '"lessons" muss ein nicht-leeres Array sein.' });

    for (let i = 0; i < lessons.length; i++) {
      const err = validateLesson(lessons[i], `Lektion ${i + 1}`);
      if (err) return res.status(400).json({ error: err });
    }

    // Insert unit, then all its lessons.
    const unitInfo = db.prepare(
      'INSERT INTO custom_units (target_lang, title, sub, level, created_at) VALUES (?,?,?,?,?)'
    ).run(targetLang, title.trim(), sub.trim(), (level || 'A1').trim(), now);

    const unitId = `customunit_${unitInfo.lastInsertRowid}`;
    const stmt = db.prepare(
      'INSERT INTO custom_lessons (target_lang, unit_id, title, sub, xp, quiz_json, created_at) VALUES (?,?,?,?,?,?,?)'
    );
    for (const l of lessons) {
      stmt.run(targetLang, unitId, l.title.trim(), l.sub.trim(), l.xp, JSON.stringify(l.quiz), now);
    }

    return res.json({ ok: true });
  }

  return res.status(400).json({ error: `Ungültiger "type": "${type}". Erlaubt: "lesson" oder "unit".` });
});

module.exports = { router };
