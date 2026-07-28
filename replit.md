# Γεια & Hallo — Private Greek–German Learning App

A private language learning app for two people: one learning German (native Greek speaker), one learning Greek (native German speaker). Features streaks/XP, lessons with quizzes, an AI tutor chat, a shared messages area with AI translation & grammar correction, a vocabulary trainer, and a profile area.

## Stack

- **Server:** Node.js ≥ 22.5 + Express (`server/`)
- **Database:** SQLite via Node's built-in `node:sqlite` — no external DB, no native compilation, stored at `data/app.db`
- **Frontend:** Vanilla JS SPA (`public/`) — no build step, no framework
- **AI features** (tutor chat, translation, grammar correction): Anthropic API, server-side only

## Running the App

**Run command:** `npm start` → `node server/index.js`  
**Port:** 5000

The workflow "Start application" is already configured. Click Run or use the workflow panel.

## Required Secrets

Set these in the Secrets panel (never commit to `.env`):

| Secret | Description |
|---|---|
| `JWT_SECRET` | Long random string for session tokens |
| `ANTHROPIC_API_KEY` | From https://console.anthropic.com |
| `USER1_USERNAME` | Username for learner 1 |
| `USER1_PASSWORD` | Password for learner 1 |
| `USER1_DISPLAY_NAME` | Display name for learner 1 |
| `USER1_TARGET_LANG` | `de` (learning German) or `el` (learning Greek) |
| `USER2_USERNAME` | Username for learner 2 |
| `USER2_PASSWORD` | Password for learner 2 |
| `USER2_DISPLAY_NAME` | Display name for learner 2 |
| `USER2_TARGET_LANG` | `de` or `el` (opposite of user 1) |

Optional: `ANTHROPIC_MODEL` to override the AI model (default: `claude-sonnet-5`).

## Project Structure

```
server/
  index.js       — Express app entry point
  seed.js        — Creates/seeds the two user accounts on startup
  auth.js        — JWT session helpers
  ai.js          — Anthropic API calls (tutor, translation, grammar)
  content.js     — Lessons, vocab, tutor prompts per language direction
  db.js          — SQLite setup
  routes/        — auth, lessons, vocab, messages, tutor, profile
public/
  index.html     — SPA shell
  app.js         — Frontend logic
  styles.css     — CSS variables-based theme (light/dark)
data/
  app.db         — SQLite database (created on first run; back this up!)
scripts/
  post-merge.sh  — Runs `npm install` after task merges
```

## Customising Content

- **Lessons, quiz questions, vocab:** `server/content.js`
- **AI behaviour / model:** `server/ai.js` (or set `ANTHROPIC_MODEL` secret)
- **Design / colours:** `public/styles.css` — CSS variables in `:root` and `body.dark`

## Persistence

All progress lives in `data/app.db`. On Replit this persists between restarts. Download it occasionally (right-click → Download in the file explorer) as a backup.

## User Preferences
