const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { getCourse, getAllLessonsFlat, findLesson } = require('../content');

const router = express.Router();
const DAILY_GOAL_XP = 20;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function completedLessonIds(userId) {
  const rows = db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ?').all(userId);
  return new Set(rows.map(r => r.lesson_id));
}

function buildUnitsWithState(user) {
  const course = getCourse(user.target_lang);
  const flat = getAllLessonsFlat(user.target_lang);
  const done = completedLessonIds(user.id);
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

function currentLevelInfo(user) {
  const flat = getAllLessonsFlat(user.target_lang);
  const done = completedLessonIds(user.id);
  const allDone = flat.length > 0 && flat.every(l => done.has(l.id));
  const currentLesson = flat.find(l => !done.has(l.id));
  const course = getCourse(user.target_lang);
  let unitLevel = course.units[0] ? course.units[0].level : 'A1';
  if (currentLesson) {
    const found = findLesson(user.target_lang, currentLesson.id);
    if (found) unitLevel = found.unit.level;
  } else if (course.units.length) {
    unitLevel = course.units[course.units.length - 1].level;
  }
  const idx = LEVELS.indexOf(unitLevel);
  const nextLevel = idx >= 0 && idx + 1 < LEVELS.length ? LEVELS[idx + 1] : unitLevel;
  return { level: unitLevel, levelProgressLabel: allDone ? `${unitLevel} → ${nextLevel}` : unitLevel, allDone };
}

router.get('/', requireAuth, (req, res) => {
  const user = req.user;
  const units = buildUnitsWithState(user);
  const { level } = currentLevelInfo(user);
  res.json({
    units,
    streak: user.streak,
    xp: user.xp,
    level,
    dailyGoalPct: Math.min(100, Math.round((user.xp_today / DAILY_GOAL_XP) * 100)),
    dailyGoalLabel: `${Math.min(user.xp_today, DAILY_GOAL_XP)} / ${DAILY_GOAL_XP} XP`,
  });
});

router.post('/:lessonId/complete', requireAuth, (req, res) => {
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
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      newStreak = user.last_active_date === yesterday ? user.streak + 1 : 1;
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
  });
});

router.get('/:lessonId/quiz', requireAuth, (req, res) => {
  const found = findLesson(req.user.target_lang, req.params.lessonId);
  if (!found) return res.status(404).json({ error: 'lesson_not_found' });
  res.json({ lessonTitle: found.lesson.title, unitTitle: found.unit.title, quiz: found.lesson.quiz, xp: found.lesson.xp });
});

module.exports = { router, currentLevelInfo, DAILY_GOAL_XP };
