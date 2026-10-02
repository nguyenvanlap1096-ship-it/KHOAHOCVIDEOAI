const path = require('path');
const router = require('express').Router();
const db = require('../db');
const config = require('../config');
const h = require('../helpers');
const { requireAuth } = require('../middleware/auth');
const { listCourses, lessonsWithProgress, pickResume, isBookmarked } = require('../services/courses');

async function findCourse(slug, user) {
  const course = await db.get('SELECT * FROM courses WHERE slug = ?', [slug]);
  if (!course) return null;
  if (!Number(course.published) && !(user && user.role === 'admin')) return null;
  return course;
}

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const level = h.LEVELS.includes(req.query.level) ? req.query.level : '';
  const userId = req.user && req.user.id;
  const courses = await listCourses({ userId, q, level });
  const continueLearning = (q || level) ? [] : courses
    .filter(c => c.started && c.percent < 100)
    .sort((a, b) => String(b.last_at).localeCompare(String(a.last_at)))
    .slice(0, 3);
  res.render('home', { title: 'Khám phá khóa học', courses, continueLearning, q, level });
});

router.get('/courses/:slug', async (req, res, next) => {
  const course = await findCourse(req.params.slug, req.user);
  if (!course) return next();
  const userId = req.user && req.user.id;
  const lessons = await lessonsWithProgress(course.id, userId);
  const totalSec = lessons.reduce((s, l) => s + Number(l.duration_sec), 0);
  const percent = h.coursePercent(lessons.reduce((s, l) => s + l.percent, 0), lessons.length);
  res.render('course', {
    title: course.title,
    course, lessons, totalSec, percent,
    started: lessons.some(l => l.progress_at),
    resume: lessons.length ? pickResume(lessons) : null,
    bookmarked: await isBookmarked(userId, course.id),
  });
});

router.get('/learn/:slug{/:lessonId}', requireAuth, async (req, res, next) => {
  const course = await findCourse(req.params.slug, req.user);
  if (!course) return next();
  const lessons = await lessonsWithProgress(course.id, req.user.id);
  if (!lessons.length) {
    req.flash('info', 'Khóa học này chưa có bài học nào.');
    return res.redirect(`/courses/${course.slug}`);
  }
  if (!req.params.lessonId) return res.redirect(`/learn/${course.slug}/${pickResume(lessons).id}`);

  const idx = lessons.findIndex(l => l.id === Number(req.params.lessonId));
  if (idx < 0) return next();
  const lesson = await db.get(
    `SELECT l.*, COALESCE(p.position_sec, 0) AS position_sec
       FROM lessons l LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
      WHERE l.id = ?`,
    [req.user.id, lessons[idx].id],
  );
  const current = lessons[idx];
  // Bài đã xong thì phát lại từ đầu thay vì nhảy tới cuối video.
  const startAt = current.completed ? 0 : Number(lesson.position_sec);

  res.render('learn', {
    title: `${lesson.title} · ${course.title}`,
    course, lessons, lesson, current, startAt,
    scripts: ['/js/player.js'],
    prev: lessons[idx - 1] || null,
    next: lessons[idx + 1] || null,
    totalSec: lessons.reduce((s, l) => s + Number(l.duration_sec), 0),
    percent: h.coursePercent(lessons.reduce((s, l) => s + l.percent, 0), lessons.length),
    keyPoints: h.lines(lesson.key_points),
    resources: h.parseResources(lesson.resources),
    bookmarked: await isBookmarked(req.user.id, course.id),
  });
});

router.get('/my', requireAuth, async (req, res) => {
  const courses = await listCourses({ userId: req.user.id });
  const saved = await db.all('SELECT course_id FROM bookmarks WHERE user_id = ?', [req.user.id]);
  const savedIds = new Set(saved.map(r => r.course_id));
  const learning = courses
    .filter(c => c.started)
    .sort((a, b) => String(b.last_at).localeCompare(String(a.last_at)));
  res.render('my', {
    title: 'Khóa học của tôi',
    inProgress: learning.filter(c => c.percent < 100),
    completed: learning.filter(c => c.percent >= 100),
    saved: courses.filter(c => savedIds.has(c.id)),
  });
});

// Video tự upload: chỉ phát cho người đã đăng nhập. sendFile hỗ trợ Range để tua video.
router.get('/media/:file', requireAuth, (req, res, next) => {
  if (!/^[a-f0-9]{32}\.(mp4|webm|ogv)$/.test(req.params.file)) return next();
  res.sendFile(path.join(config.uploadDir, req.params.file), { maxAge: '1d' }, err => {
    if (err && !res.headersSent) next();
  });
});

module.exports = router;
