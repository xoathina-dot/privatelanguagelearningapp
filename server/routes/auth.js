const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { setSessionCookie, clearSessionCookie, requireAuth, getUserById } = require('../auth');

const router = express.Router();

function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    avatarInitial: u.avatar_initial,
    nativeLang: u.native_lang,
    targetLang: u.target_lang,
    role: u.role,
    streak: u.streak,
    xp: u.xp,
    darkMode: !!u.dark_mode,
    notificationsEnabled: !!u.notifications_enabled,
  };
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  console.log('[login] username:', JSON.stringify(username), '| password length:', password ? password.length : 0, '| missing?', !username || !password);
  if (!username || !password) return res.status(400).json({ error: 'missing_credentials' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  console.log('[login] user found:', !!user, '| bcrypt match:', user ? bcrypt.compareSync(password, user.password_hash) : 'n/a');
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  setSessionCookie(res, user.id);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const partner = req.user.partner_id ? getUserById(req.user.partner_id) : null;
  res.json({
    user: publicUser(req.user),
    partner: partner ? { displayName: partner.display_name, avatarInitial: partner.avatar_initial } : null,
  });
});

module.exports = { router, publicUser };
