const express = require('express');
const db = require('../db');
const { requireAuth, getUserById } = require('../auth');
const { getCourse, getAllLessonsFlat, findLesson, getReviewSlots, getReviewQuestionPool } = require('../content');

const router = express.Router();
const DAILY_GOAL_XP = 20;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function todayStr() {
  // Use Europe/Berlin so streak/daily-goal don't flip at UTC midnight.
  return new Date().toLocaleDateString('sv', { timeZone: 'Europe/Berlin' });
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv', { timeZone: 'Europe/Berlin' });
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
  // Only regular (non-review) lessons determine the main unlock chain.
  const flat = getAllLessonsFlat(learner.target_lang);
  const done = completedLessonIds(learner.id);
  const firstNotDoneIndex = flat.findIndex(l => !done.has(l.id));

  const reviewSlots = getReviewSlots(learner.target_lang);
  const result = [];

  course.units.forEach((unit, unitIdx) => {
    // Regular unit
    result.push({
      id: unit.id,
      title: unit.title,
      sub: unit.sub,
      level: unit.level,
      isReview: false,
      lessons: unit.lessons.map(lesson => {
        const flatIdx = flat.findIndex(l => l.id === lesson.id);
        const lessonState = done.has(lesson.id)
          ? 'done'
          : (firstNotDoneIndex === flatIdx ? 'current' : 'locked');
        return { id: lesson.id, title: lesson.title, sub: lesson.sub, xp: lesson.xp, state: lessonState, isReview: false };
      }),
    });

    // Inject review lesson after this unit if a slot exists.
    // Review lessons do NOT affect the main unlock chain for regular lessons.
    const slot = reviewSlots.find(s => s.afterUnitIndex === unitIdx);
    if (slot) {
      // Available only once all covered units' regular lessons are done.
      const allCoveredDone = slot.coveredUnitIds.every(uid => {
        const u = course.units.find(u2 => u2.id === uid);
        return u && u.lessons.every(l => done.has(l.id));
      });
      const reviewState = done.has(slot.id) ? 'done' : (allCoveredDone ? 'current' : 'locked');
      result.push({
        id: slot.id,
        title: slot.title,
        sub: slot.sub,
        level: '★',
        isReview: true,
        lessons: [{
          id: slot.id,
          title: slot.title,
          sub: slot.sub,
          xp: slot.xp,
          state: reviewState,
          isReview: true,
        }],
      });
    }
  });

  return result;
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

  // Support review lessons in addition to regular lessons.
  let found = findLesson(user.target_lang, lessonId);
  if (!found) {
    const slot = getReviewSlots(user.target_lang).find(s => s.id === lessonId);
    if (!slot) return res.status(404).json({ error: 'lesson_not_found' });
    found = { lesson: { xp: slot.xp, title: slot.title }, unit: { title: 'Wiederholung' } };
  }

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
      const yesterday = yesterdayStr();
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
    isCompanionView: false,
  });
});

router.get('/:lessonId/quiz', requireAuth, (req, res) => {
  if (req.user.role === 'companion') {
    return res.status(403).json({ error: 'companion_read_only' });
  }

  // Check for review lesson first.
  const reviewSlots = getReviewSlots(req.user.target_lang);
  const slot = reviewSlots.find(s => s.id === req.params.lessonId);
  if (slot) {
    const pool = getReviewQuestionPool(req.user.target_lang, slot.coveredUnitIds);
    // Pick 5 questions at random — pool grows as more units are covered.
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const quiz = shuffled.slice(0, Math.min(5, shuffled.length));
    return res.json({ lessonTitle: slot.title, unitTitle: 'Wiederholung', quiz, xp: slot.xp, isReview: true });
  }

  const found = findLesson(req.user.target_lang, req.params.lessonId);
  if (!found) return res.status(404).json({ error: 'lesson_not_found' });
  res.json({ lessonTitle: found.lesson.title, unitTitle: found.unit.title, quiz: found.lesson.quiz, xp: found.lesson.xp });
});

module.exports = { router, currentLevelInfo, DAILY_GOAL_XP, effectiveLearner, getCurrentLesson, buildUnitsWithState };
