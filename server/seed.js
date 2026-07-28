const bcrypt = require('bcryptjs');
const db = require('./db');

function seedUser(envPrefix, fallback) {
  const username = process.env[`${envPrefix}_USERNAME`] || fallback.username;
  const password = process.env[`${envPrefix}_PASSWORD`] || fallback.password;
  const displayName = process.env[`${envPrefix}_DISPLAY_NAME`] || fallback.displayName;
  const role = (process.env[`${envPrefix}_ROLE`] || fallback.role || 'learner').toLowerCase();
  const targetLang = (process.env[`${envPrefix}_TARGET_LANG`] || fallback.targetLang).toLowerCase();
  const nativeLang = (process.env[`${envPrefix}_NATIVE_LANG`] || fallback.nativeLang).toLowerCase();

  const avatarInitial = displayName.trim().charAt(0).toUpperCase();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

  if (existing) {
    // Re-apply identity fields on every boot so changing Secrets later takes effect,
    // without touching progress (streak/xp/lesson_progress live untouched elsewhere).
    db.prepare(`
      UPDATE users SET display_name = ?, avatar_initial = ?, native_lang = ?, target_lang = ?, role = ?
      WHERE id = ?
    `).run(displayName, avatarInitial, nativeLang, targetLang, role, existing.id);
    return existing.id;
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(`
    INSERT INTO users (username, password_hash, display_name, avatar_initial, native_lang, target_lang, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(username, hash, displayName, avatarInitial, nativeLang, targetLang, role);
  return info.lastInsertRowid;
}

function seed() {
  const user1Id = seedUser('USER1', {
    username: 'user1',
    password: 'change-me-1',
    displayName: 'Nutzer 1',
    role: 'learner',
    targetLang: 'de',
    nativeLang: 'el',
  });
  const user2Id = seedUser('USER2', {
    username: 'user2',
    password: 'change-me-2',
    displayName: 'Nutzer 2',
    role: 'learner',
    targetLang: 'el',
    nativeLang: 'de',
  });

  // Link the two accounts as partners of each other (shared Messages tab, companion dashboard).
  db.prepare('UPDATE users SET partner_id = ? WHERE id = ?').run(user2Id, user1Id);
  db.prepare('UPDATE users SET partner_id = ? WHERE id = ?').run(user1Id, user2Id);

  console.log('Seed complete. Accounts ready:');
  const rows = db.prepare('SELECT username, display_name, role, target_lang FROM users').all();
  rows.forEach(r => {
    const desc = r.role === 'companion' ? `supporting partner learning ${r.target_lang}` : `learning ${r.target_lang}`;
    console.log(`  - ${r.username} (${r.display_name}) — ${r.role}, ${desc}`);
  });
}

seed();
