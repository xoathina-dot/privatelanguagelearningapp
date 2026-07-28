const express = require('express');
const db = require('../db');
const { requireAuth, getUserById } = require('../auth');
const { getCourse } = require('../content');
const { currentLevelInfo } = require('./lessons');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const user = req.user;
  const course = getCourse(user.target_lang);
  const partner = user.partner_id ? getUserById(user.partner_id) : null;
  const { levelProgressLabel } = currentLevelInfo(user);
  res.json({
    displayName: user.display_name,
    avatarInitial: user.avatar_initial,
    targetLangLabel: course.label,
    streak: user.streak,
    xp: user.xp,
    levelProgressLabel,
    partnerDisplayName: partner ? partner.display_name : null,
    notificationsEnabled: !!user.notifications_enabled,
    darkMode: !!user.dark_mode,
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

module.exports = { router };
