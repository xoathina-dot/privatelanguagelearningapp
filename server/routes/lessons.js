const express = require('express');
const db = require('../db');
const { requireAuth, getUserById } = require('../auth');
const { getCourse, getAllLessonsFlat, findLesson } = require('../content');

const router = express.Router();
const DAILY_GOAL_XP = 20;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Streaks must reset at local midnight, not UTC midnight — otherwise evening
// activity (UTC+2/+3) gets counted on the wrong calendar day and the streak
// can break or double-count depending on time of day.
const APP_TIMEZONE = 'Europe/Athens';

function dateStrInAppTz(date) {
  // en-CA locale formats as YYYY-MM-DD, which is what we store/compare.
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(date);
}

function todayStr() {
  return dateStrInAppTz(new Date());
}

function yesterdayStr() {
  // Subtract 1 calendar day in the app timezone, not 24h in UTC — this stays
  // correct across DST transitions (e.g. the day summer time starts/ends).
  const [y, m, d] = todayStr().split('-').map(Number);
  const localNoonUtc = new Date(Date.UTC(y, m - 1, d, 12)); // noon avoids DST edge issues
  localNoonUtc.setUTCDate(localNoonUtc.getUTCDate() - 1);
  return dateStrInAppTz(localNoonUtc);
}

function completedLessonIds(userId) {
  const rows = db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ?').all(userId);
  return new Set(rows.map(r => r.lesson_id));
}

// For a 'companion' account, all progress/dashboard views should reflect the
// partner (the actual learner) rather than the companion's own (empty) record.
function effectiveLearner(user) {
  if (user.role === 'companion') {
    return user.partner_id ? getUserById(user.partner_id) : null;
  }
  return user;
}

function buildUnitsWithState(learner) {
  const course = getCourse(learner.target_lang);
  const flat = getAllLessonsFlat(learner.target_lang);
  const done = completedLessonIds(learner.id);
  const firstNotDoneIndex = flat.findIndex(l => !done.has(l.id));

  return course.units.map(unit => ({
    id: unit.id,
    title: unit.title,
    sub: unit.sub,
    level: unit.level,
    lessons: unit.lessons.map(lesson => {
      const flatIdx = flat.findIndex(l => l.id === lesson.id);
      const state = done.has(lesson.id)
        ? 'done'
        : (firstNotDoneIndex === flatIdx ? 'current' : 'locked');
      return { id: lesson.id, title: lesson.title, sub: lesson.sub, xp: lesson.xp, state };
    }),
  }));
}

function currentLevelInfo(learner) {
  const flat = getAllLessonsFlat(learner.target_lang);
  const done = completedLessonIds(learner.id);
  const allDone = flat.length > 0 && flat.every(l => done.has(l.id));
  const currentLesson = flat.find(l => !done.has(l.id));
  const course = getCourse(learner.target_lang);
  let unitLevel = course.units[0] ? course.units[0].level : 'A1';
  if (currentLesson) {
    const found = findLesson(learner.target_lang, currentLesson.id);
    if (found) unitLevel = found.unit.level;
  } else if (course.units.length) {
    unitLevel = course.units[course.units.length - 1].level;
  }
  const idx = LEVELS.indexOf(unitLevel);
  const nextLevel = idx >= 0 && idx + 1 < LEVELS.length ? LEVELS[idx + 1] : unitLevel;
  return { level: unitLevel, levelProgressLabel: allDone ? `${unitLevel} → ${nextLevel}` : unitLevel, allDone };
}

// Reusable by the tutor route (companion coach needs to know what the partner is on).
function getCurrentLesson(learner) {
  const flat = getAllLessonsFlat(learner.target_lang);
  const done = completedLessonIds(learner.id);
  const next = flat.find(l => !done.has(l.id));
  if (!next) return null;
  return findLesson(learner.target_lang, next.id);
}

function emptyDashboard(isCompanionView) {
  return {
    units: [], streak: 0, xp: 0, level: 'A1', dailyGoalPct: 0, dailyGoalLabel: `0 / ${DAILY_GOAL_XP} XP`,
    isCompanionView, learnerDisplayName: null,
  };
}

router.get('/', requireAuth, (req, res) => {
  const isCompanionView = req.user.role === 'companion';
  const learner = effectiveLearner(req.user);
  if (!learner) return res.json(emptyDashboard(isCompanionView));

  const units = buildUnitsWithState(learner);
  const { level } = currentLevelInfo(learner);
  res.json({
    units,
    streak: learner.streak,
    xp: learner.xp,
    level,
    dailyGoalPct: Math.min(100, Math.round((learner.xp_today / DAILY_GOAL_XP) * 100)),
    dailyGoalLabel: `${Math.min(learner.xp_today, DAILY_GOAL_XP)} / ${DAILY_GOAL_XP} XP`,
    isCompanionView,
    learnerDisplayName: isCompanionView ? learner.display_name : null,
  });
});

router.post('/:lessonId/complete', requireAuth, (req, res) => {
  if (req.user.role === 'companion') {
    return res.status(403).json({ error: 'companion_read_only' });
  }
  const user = req.user;
  const { lessonId } = req.params;
  const found = findLesson(user.target_lang, lessonId);
  if (!found) return res.status(404).json({ error: 'lesson_not_found' });

  const already = db.prepare('SELECT 1 FROM lesson_progress WHERE user_id = ? AND lesson_id = ?').get(user.id, lessonId);
  const today = todayStr();

  if (!already) {
    db.prepare('INSERT INTO lesson_progress (user_id, lesson_id, completed_at) VALUES (?, ?, ?)')
      .run(user.id, lessonId, new Date().toISOString());

    let newStreak = user.streak;
    let newXpToday = user.xp_today;

    if (user.last_active_date === today) {
      newXpToday += found.lesson.xp;
    } else {
      newStreak = user.last_active_date === yesterdayStr() ? user.streak + 1 : 1;
      newXpToday = found.lesson.xp;
    }

    db.prepare(`
      UPDATE users SET xp = xp + ?, streak = ?, xp_today = ?, last_active_date = ? WHERE id = ?
    `).run(found.lesson.xp, newStreak, newXpToday, today, user.id);
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const units = buildUnitsWithState(updatedUser);
  const { level } = currentLevelInfo(updatedUser);
  res.json({
    units,
    streak: updatedUser.streak,
    xp: updatedUser.xp,
    level,
    dailyGoalPct: Math.min(100, Math.round((updatedUser.xp_today / DAILY_GOAL_XP) * 100)),
    dailyGoalLabel: `${Math.min(updatedUser.xp_today, DAILY_GOAL_XP)} / ${DAILY_GOAL_XP} XP`,
    xpEarned: already ? 0 : found.lesson.xp,
    isCompanionView: false,
  });
});

router.get('/:lessonId/quiz', requireAuth, (req, res) => {
  if (req.user.role === 'companion') {
    return res.status(403).json({ error: 'companion_read_only' });
  }
  const found = findLesson(req.user.target_lang, req.params.lessonId);
  if (!found) return res.status(404).json({ error: 'lesson_not_found' });
  res.json({ lessonTitle: found.lesson.title, unitTitle: found.unit.title, quiz: found.lesson.quiz, xp: found.lesson.xp });
});

module.exports = { router, currentLevelInfo, DAILY_GOAL_XP, effectiveLearner, getCurrentLesson, buildUnitsWithState };