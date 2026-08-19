const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { COURSES, getAllLessonsFlat } = require('../content');

const router = express.Router();

// Validates a single lesson object from imported JSON. Returns an error
// string, or null if the lesson is valid.
function validateLesson(lesson) {
  if (!lesson || typeof lesson !== 'object') return 'invalid_lesson';
  if (!lesson.id || typeof lesson.id !== 'string') return 'lesson_missing_id';
  if (!lesson.title || typeof lesson.title !== 'string') return 'lesson_missing_title';
  if (typeof lesson.xp !== 'number' || lesson.xp <= 0) return 'lesson_missing_xp';
  if (lesson.intro !== undefined && typeof lesson.intro !== 'string') return 'invalid_lesson_intro';
  if (!Array.isArray(lesson.quiz) || !lesson.quiz.length) return 'lesson_missing_quiz';
  for (const q of lesson.quiz) {
    if (!q || typeof q !== 'object') return 'invalid_quiz_question';
    if (!q.prompt || !q.answer) return 'quiz_question_missing_fields';
    if (!Array.isArray(q.options) || q.options.length < 2) return 'quiz_question_needs_options';
    if (!q.options.includes(q.answer)) return 'quiz_answer_not_in_options';
  }
  return null;
}

router.post('/', requireAuth, (req, res) => {
  const { targetLang, unit } = req.body || {};

  if (targetLang !== 'de' && targetLang !== 'el') {
    return res.status(400).json({ error: 'invalid_target_lang' });
  }
  if (!unit || typeof unit !== 'object' || !unit.id || !unit.title
      || !Array.isArray(unit.lessons) || !unit.lessons.length) {
    return res.status(400).json({ error: 'invalid_unit' });
  }

  const staticCourse = COURSES[targetLang];
  const isStaticUnit = staticCourse.units.some(u => u.id === unit.id);
  const existingCustom = db.prepare('SELECT * FROM custom_units WHERE target_lang = ? AND unit_id = ?')
    .get(targetLang, unit.id);

  // Built-in units live in code, not the DB, so we can't merge into them here.
  if (isStaticUnit && !existingCustom) {
    return res.status(409).json({ error: 'unit_id_collides_with_static', unitId: unit.id });
  }

  for (const lesson of unit.lessons) {
    const err = validateLesson(lesson);
    if (err) return res.status(400).json({ error: err, lessonId: lesson && lesson.id });
  }

  // Lesson ids must stay globally unique across both courses — progress is
  // keyed by lesson id alone (lesson_progress.lesson_id), so a collision
  // would silently merge two unrelated lessons' completion state.
  const allExistingIds = new Set([
    ...getAllLessonsFlat('de').map(l => l.id),
    ...getAllLessonsFlat('el').map(l => l.id),
  ]);

  let mergedUnit;
  if (existingCustom) {
    const current = JSON.parse(existingCustom.unit_json);
    const currentLessonIds = new Set(current.lessons.map(l => l.id));
    for (const lesson of unit.lessons) {
      // A lesson id is fine if it's brand new, or if it already belongs to
      // *this* custom unit (re-importing = updating that lesson).
      if (allExistingIds.has(lesson.id) && !currentLessonIds.has(lesson.id)) {
        return res.status(409).json({ error: 'duplicate_lesson_id', lessonId: lesson.id });
      }
    }
    const lessonsById = new Map(current.lessons.map(l => [l.id, l]));
    for (const lesson of unit.lessons) lessonsById.set(lesson.id, lesson);
    mergedUnit = {
      id: current.id,
      title: unit.title || current.title,
      sub: unit.sub || current.sub || '',
      level: unit.level || current.level || 'A1',
      lessons: [...lessonsById.values()],
    };
  } else {
    for (const lesson of unit.lessons) {
      if (allExistingIds.has(lesson.id)) {
        return res.status(409).json({ error: 'duplicate_lesson_id', lessonId: lesson.id });
      }
    }
    mergedUnit = {
      id: unit.id,
      title: unit.title,
      sub: unit.sub || '',
      level: unit.level || 'A1',
      lessons: unit.lessons,
    };
  }

  const now = new Date().toISOString();
  if (existingCustom) {
    db.prepare('UPDATE custom_units SET unit_json = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(mergedUnit), now, existingCustom.id);
  } else {
    db.prepare(`
      INSERT INTO custom_units (target_lang, unit_id, unit_json, added_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(targetLang, unit.id, JSON.stringify(mergedUnit), req.user.id, now, now);
  }

  res.status(201).json({ unit: mergedUnit, lessonsImported: unit.lessons.length });
});

module.exports = { router };