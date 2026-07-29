const express = require('express');
const db = require('../db');
const { requireAuth, getUserById } = require('../auth');
const { getCourse } = require('../content');
const { currentLevelInfo, effectiveLearner } = require('./lessons');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const user = req.user;
  const isCompanionView = user.role === 'companion';
  const partner = user.partner_id ? getUserById(user.partner_id) : null;
  const learner = effectiveLearner(user);

  const base = {
    displayName: user.display_name,
    avatarInitial: user.avatar_initial,
    role: user.role,
    partnerDisplayName: partner ? partner.display_name : null,
    notificationsEnabled: !!user.notifications_enabled,
    darkMode: !!user.dark_mode,
  };

  if (!learner) {
    return res.json({ ...base, targetLangLabel: null, streak: 0, xp: 0, levelProgressLabel: 'A1' });
  }

  const course = getCourse(learner.target_lang);
  const { levelProgressLabel } = currentLevelInfo(learner);
  res.json({
    ...base,
    targetLangLabel: course.label,
    streak: learner.streak,
    xp: learner.xp,
    levelProgressLabel,
  });
});

router.post('/toggle-dark', requireAuth, (req, res) => {
  const newVal = req.user.dark_mode ? 0 : 1;
  db.prepare('UPDATE users SET dark_mode = ? WHERE id = ?').run(newVal, req.user.id);
  res.json({ darkMode: !!newVal });
});

router.post('/toggle-notifications', requireAuth, (req, res) => {
  const newVal = req.user.notifications_enabled ? 0 : 1;
  db.prepare('UPDATE users SET notifications_enabled = ? WHERE id = ?').run(newVal, req.user.id);
  res.json({ notificationsEnabled: !!newVal });
});

router.get('/export', requireAuth, (req, res) => {
  const user = req.user;
  const completedLessons = db.prepare(
    'SELECT lesson_id, completed_at FROM lesson_progress WHERE user_id = ? ORDER BY completed_at ASC'
  ).all(user.id);
  const favVocab = db.prepare('SELECT vocab_id FROM vocab_favorites WHERE user_id = ?').all(user.id);
  res.json({
    exportedAt: new Date().toISOString(),
    displayName: user.display_name,
    username: user.username,
    streak: user.streak,
    xp: user.xp,
    completedLessons: completedLessons.map(r => ({ lessonId: r.lesson_id, completedAt: r.completed_at })),
    vocabFavorites: favVocab.map(r => r.vocab_id),
  });
});

module.exports = { router };
