const path = require('path');
const router = require('express').Router();
const db = require('../db');
const config = require('../config');
const h = require('../helpers');
const { requireAuth } = require('../middleware/auth');
const { videoExists, docPath } = require('../uploads');
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
  // Khung "Hướng dẫn học": số module đầu / cuối của lộ trình và đường dẫn tới Kho Prompt (15), Tài nguyên (16).
  const moduleOf = c => { const m = String(c.title).match(/^\s*module\s+(\d+)/i); return m ? m[1] : null; };
  const codes = courses.map(moduleOf).filter(Boolean);
  const studyCodes = codes.filter(c => Number(c) < 15).sort((a, b) => a - b);
  const guide = {
    first: studyCodes[0] || null,
    last: studyCodes[studyCodes.length - 1] || null,
    prompts: courses.find(c => moduleOf(c) === '15') || null,
    resources: courses.find(c => moduleOf(c) === '16') || null,
  };
  res.render('home', {
    title: 'Khám phá khóa học', courses, continueLearning, videos, q, level, guide,
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
  lesson.video_missing = lesson.video_type === 'upload' && lesson.video_ref && !videoExists(lesson.video_ref);
  const docs = await db.all('SELECT id, original_name, stored, size, text_content FROM lesson_files WHERE lesson_id = ? ORDER BY position, id', [lesson.id]);
  const prompts = h.promptBlocks(lesson.prompts);
  // Bài đã xong thì phát lại từ đầu thay vì nhảy tới cuối video.
  const startAt = current.completed ? 0 : Number(lesson.position_sec);

  res.render('learn', {
    title: `${lesson.title} · ${course.title}`,
    course, lessons, lesson, current, startAt, docs, prompts,
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

// Tài liệu đính kèm bài học: chỉ cho người đã đăng nhập (và đã mua nếu là khóa chuyên sâu).
// ?xem=1 mở PDF ngay trong trình duyệt; mặc định tải file về với tên gốc.
router.get('/files/:id', requireAuth, async (req, res, next) => {
  const doc = await db.get(
    `SELECT f.original_name, f.stored, c.id AS course_id, c.is_premium
       FROM lesson_files f JOIN lessons l ON l.id = f.lesson_id JOIN courses c ON c.id = l.course_id
      WHERE f.id = ?`,
    [Number(req.params.id) || 0],
  );
  const p = doc && docPath(doc.stored);
  if (!p) return next();
  if (!(await hasAccess(req.user, { id: doc.course_id, is_premium: doc.is_premium }))) return res.status(403).end();
  const inline = req.query.xem === '1' && /.pdf$/.test(doc.stored);
  res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(doc.original_name)}`);
  res.sendFile(p, { maxAge: '1d', headers: { 'X-Content-Type-Options': 'nosniff' } }, err => { if (err && !res.headersSent) next(); });
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
