// One-time script: resets learning progress (XP, streak, completed lessons)
// and the messages/tutor chat history, so the app can be handed over to the
// learner with a clean slate. Usernames and passwords are left untouched.
//
// Run once from the project root:
//   node server/scripts/reset-progress.js
//
// Safe to delete this file afterwards — it's not used by the running app.

const db = require('../db');

const users = db.prepare('SELECT id, username, display_name FROM users').all();
if (!users.length) {
  console.log('Keine Nutzer gefunden — nichts zu tun.');
  process.exit(0);
}

const resetUser = db.prepare(`
  UPDATE users SET xp = 0, streak = 0, xp_today = 0, last_active_date = NULL WHERE id = ?
`);
const deleteProgress = db.prepare('DELETE FROM lesson_progress WHERE user_id = ?');

for (const u of users) {
  resetUser.run(u.id);
  deleteProgress.run(u.id);
  console.log(`Fortschritt zurückgesetzt: ${u.display_name} (${u.username})`);
}

const messagesDeleted = db.prepare('DELETE FROM messages').run();
const tutorDeleted = db.prepare('DELETE FROM tutor_messages').run();
console.log(`Nachrichten gelöscht: ${messagesDeleted.changes}`);
console.log(`Tutor-Chat-Verlauf gelöscht: ${tutorDeleted.changes}`);

console.log('\nFertig — Fortschritt und Chat-Verläufe sind zurückgesetzt.');
console.log('Logins (Username/Passwort) sind unverändert.');