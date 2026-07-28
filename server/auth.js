const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'insecure-dev-secret-change-me';
const COOKIE_NAME = 'session';

function signToken(userId) {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '90d' });
}

function setSessionCookie(res, userId) {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  console.log('[requireAuth] path:', req.path, '| cookie present:', !!token, '| all cookies:', JSON.stringify(Object.keys(req.cookies || {})));
  if (!token) return res.status(401).json({ error: 'not_authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = getUserById(payload.uid);
    if (!user) return res.status(401).json({ error: 'not_authenticated' });
    req.user = user;
    next();
  } catch (e) {
    console.log('[requireAuth] jwt error:', e.message);
    return res.status(401).json({ error: 'not_authenticated' });
  }
}

module.exports = { setSessionCookie, clearSessionCookie, requireAuth, getUserById, COOKIE_NAME };
