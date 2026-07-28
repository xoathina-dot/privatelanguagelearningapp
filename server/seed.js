const bcrypt = require('bcryptjs');
const db = require('./db');

function otherLang(lang) {
  return lang === 'de' ? 'el' : 'de';
}

function seedUser(envPrefix, fallback) {
  const username = process.env[`${envPrefix}_USERNAME`] || fallback.username;
  const password = process.env[`${envPrefix}_PASSWORD`] || fallback.password;
  const displayName = process.env[`${envPrefix}_DISPLAY_NAME`] || fallback.displayName;
  const targetLang = (process.env[`${envPrefix}_TARGET_LANG`] || fallback.targetLang).toLowerCase();

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return existing.id;

  const hash = bcrypt.hashSync(password, 10);
  const avatarInitial = displayName.trim().charAt(0).toUpperCase();
  const info = db.prepare(`
    INSERT INTO users (username, password_hash, display_name, avatar_initial, native_lang, target_lang)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(username, hash, displayName, avatarInitial, otherLang(targetLang), targetLang);
  return info.lastInsertRowid;
}

function seed() {
  const user1Id = seedUser('USER1', {
    username: 'user1',
    password: 'change-me-1',
    displayName: 'Nutzer 1',
    targetLang: 'de',
  });
  const user2Id = seedUser('USER2', {
    username: 'user2',
    password: 'change-me-2',
    displayName: 'Nutzer 2',
    targetLang: 'el',
  });

  // Link the two accounts as partners of each other (for the shared Messages tab).
  db.prepare('UPDATE users SET partner_id = ? WHERE id = ?').run(user2Id, user1Id);
  db.prepare('UPDATE users SET partner_id = ? WHERE id = ?').run(user1Id, user2Id);

  console.log('Seed complete. Accounts ready:');
  const rows = db.prepare('SELECT username, display_name, target_lang FROM users').all();
  rows.forEach(r => console.log(`  - ${r.username} (${r.display_name}) learning ${r.target_lang}`));
}

seed();
