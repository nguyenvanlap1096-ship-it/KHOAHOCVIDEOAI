const path = require('path');
const router = require('express').Router();
const db = require('../db');
const config = require('../config');
const h = require('../helpers');
const { requireAuth } = require('../middleware/auth');
const { listCourses, lessonsWithProgress, pickResume, isBookmarked, latestVideos } = require('../services/courses');
const { getSettings } = require('../services/settings');
const {
  ORDER_STATUS, salesOpen, bundleConfig, hasAccess, accessSummary, pendingOrderFor,
} = require('../services/shop');

async function findCourse(slug, user) {
  const course = await db.get('SELECT * FROM courses WHERE slug = ?', [slug]);
  if (!course) return null;
  if (!Number(course.published) && !(user && user.role === 'admin')) return null;
  return course;
}

// Khóa chuyên sâu cho cột bên phải trang chủ, kèm trạng thái đã mở khóa của người xem.
async function premiumShelf(user) {
  const [courses, access, settings] = await Promise.all([
    listCourses({ userId: user && user.id, premium: 'only' }),
    accessSummary(user),
    getSettings(),
  ]);
  const bundle = bundleConfig(settings);
  const isAdmin = Boolean(user && user.role === 'admin');
  const open = salesOpen(settings);
  courses.forEach(c => { c.unlocked = access.all || access.ids.has(c.id); });
  // Đóng bán: người xem chỉ còn thấy khóa đã mua (admin vẫn thấy đủ để quản lý).
  if (!open && !isAdmin) {
    return { courses: courses.filter(c => c.unlocked), bundle: { ...bundle, enabled: false }, ownsBundle: access.all, salesOpen: false };
  }
  return { courses, bundle, ownsBundle: access.all && !isAdmin, salesOpen: open };
}

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const level = h.LEVELS.includes(req.query.level) ? req.query.level : '';
  const userId = req.user && req.user.id;
  const courses = await listCourses({ userId, q, level, premium: 'exclude' });
  const continueLearning = (q || level) ? [] : (await listCourses({ userId }))
    .filter(c => c.started && c.percent < 100)
    .sort((a, b) => String(b.last_at).localeCompare(String(a.last_at)))
    .slice(0, 3);
  const videos = (q || level) ? [] : await latestVideos(4);
  res.render('home', {
    title: 'Khám phá khóa học', courses, continueLearning, videos, q, level,
    premium: await premiumShelf(req.user),
  });
});

router.get('/videos', async (req, res) => {
  res.render('videos', {
    title: 'Video mới cập nhật',
    videos: await latestVideos(48),
    crumbs: [{ label: 'Khóa học', href: '/' }, { label: 'Video mới cập nhật' }],
  });
});

router.get('/courses/:slug', async (req, res, next) => {
  const course = await findCourse(req.params.slug, req.user);
  if (!course) return next();
  const userId = req.user && req.user.id;
  const lessons = await lessonsWithProgress(course.id, userId);
  const totalSec = lessons.reduce((s, l) => s + Number(l.duration_sec), 0);
  const percent = h.coursePercent(lessons.reduce((s, l) => s + l.percent, 0), lessons.length);
  const unlocked = await hasAccess(req.user, course);
  const settings = await getSettings();
  const bundle = bundleConfig(settings);
  const open = salesOpen(settings);
  let pending = null;
  if (req.user && !unlocked) {
    pending = await pendingOrderFor(req.user.id, 'course', course.id)
      || (bundle.enabled ? await pendingOrderFor(req.user.id, 'bundle', null) : null);
  }
  res.render('course', {
    title: course.title,
    course, lessons, totalSec, percent, unlocked, bundle, pending, salesOpen: open,
    started: lessons.some(l => l.progress_at),
    resume: lessons.length ? pickResume(lessons) : null,
    bookmarked: await isBookmarked(userId, course.id),
  });
});

router.get('/learn/:slug{/:lessonId}', requireAuth, async (req, res, next) => {
  const course = await findCourse(req.params.slug, req.user);
  if (!course) return next();
  if (!(await hasAccess(req.user, course))) {
    req.flash('info', 'Đây là khóa chuyên sâu. Hãy mua khóa học để bắt đầu học.');
    return res.redirect(`/courses/${course.slug}`);
  }
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
  const [courses, saved, orders, access] = await Promise.all([
    listCourses({ userId: req.user.id }),
    db.all('SELECT course_id FROM bookmarks WHERE user_id = ?', [req.user.id]),
    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50', [req.user.id]),
    accessSummary(req.user),
  ]);
  const savedIds = new Set(saved.map(r => r.course_id));
  const learning = courses
    .filter(c => c.started)
    .sort((a, b) => String(b.last_at).localeCompare(String(a.last_at)));
  const owned = req.user.role === 'admin' ? [] : courses.filter(c => Number(c.is_premium) && (access.all || access.ids.has(c.id)));
  res.render('my', {
    title: 'Khóa học của tôi',
    inProgress: learning.filter(c => c.percent < 100),
    completed: learning.filter(c => c.percent >= 100),
    saved: courses.filter(c => savedIds.has(c.id)),
    owned, orders, ORDER_STATUS,
  });
});

// Video tự upload: chỉ phát cho người đã đăng nhập (và đã mua nếu là khóa chuyên sâu).
// sendFile hỗ trợ Range để tua video.
router.get('/media/:file', requireAuth, async (req, res, next) => {
  if (!/^[a-f0-9]{32}\.(mp4|webm|ogv)$/.test(req.params.file)) return next();
  const course = await db.get(
    "SELECT c.id, c.is_premium FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.video_type = 'upload' AND l.video_ref = ?",
    [req.params.file],
  );
  if (course && !(await hasAccess(req.user, course))) return res.status(403).end();
  res.sendFile(path.join(config.uploadDir, req.params.file), { maxAge: '1d' }, err => {
    if (err && !res.headersSent) next();
  });
});

module.exports = router;
