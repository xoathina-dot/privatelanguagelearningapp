const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');

const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_initial TEXT NOT NULL,
    native_lang TEXT NOT NULL,
    target_lang TEXT NOT NULL,
    partner_id INTEGER,
    streak INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    xp_today INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    dark_mode INTEGER NOT NULL DEFAULT 0,
    notifications_enabled INTEGER NOT NULL DEFAULT 1,
    role TEXT NOT NULL DEFAULT 'learner'
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    user_id INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS vocab_favorites (
    user_id INTEGER NOT NULL,
    vocab_id TEXT NOT NULL,
    PRIMARY KEY (user_id, vocab_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    translation_de TEXT,
    translation_el TEXT,
    correction TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tutor_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    from_role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Light migration: add the 'role' column if this db was created before it existed.
const userColumns = db.prepare("PRAGMA table_info(users)").all();
if (!userColumns.some(c => c.name === 'role')) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'learner'");
}

// Migration: custom vocab table.
db.exec(`
  CREATE TABLE IF NOT EXISTS custom_vocab (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_lang TEXT NOT NULL,
    target_text TEXT NOT NULL,
    native_text TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    cat TEXT NOT NULL DEFAULT 'Δικά μας',
    added_by_user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);

module.exports = db;
