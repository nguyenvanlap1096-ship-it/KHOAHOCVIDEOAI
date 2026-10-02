const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const router = require('express').Router();
const db = require('../db');
const config = require('../config');
const h = require('../helpers');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

/* ---------- Upload video ---------- */
const VIDEO_EXT = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/ogg': '.ogv' };
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(config.uploadDir, { recursive: true });
      cb(null, config.uploadDir);
    },
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + VIDEO_EXT[file.mimetype]),
  }),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (VIDEO_EXT[file.mimetype]) return cb(null, true);
    cb(new Error('Chỉ hỗ trợ video MP4, WebM hoặc OGG.'));
  },
});

function uploadVideo(req, res, next) {
  upload.single('video_file')(req, res, err => {
    if (err) req.uploadError = err.code === 'LIMIT_FILE_SIZE' ? `Video vượt quá ${config.maxUploadMb} MB.` : err.message;
    next();
  });
}

function removeUpload(filename) {
  if (!filename || !/^[a-f0-9]{32}\.(mp4|webm|ogv)$/.test(filename)) return;
  fs.unlink(path.join(config.uploadDir, filename), () => {});
}

const nav = active => ({ adminNav: active });

/* ---------- Tổng quan ---------- */
router.get('/', async (req, res) => {
  const count = async sql => Number((await db.get(sql)).n);
  const [users, courses, lessons, completions] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM users'),
    count('SELECT COUNT(*) AS n FROM courses'),
    count('SELECT COUNT(*) AS n FROM lessons'),
    count('SELECT COUNT(*) AS n FROM progress WHERE completed = 1'),
  ]);
  const recentUsers = await db.all('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT 6');
  res.render('admin/dashboard', { title: 'Quản trị', stats: { users, courses, lessons, completions }, recentUsers, ...nav('dashboard') });
});

/* ---------- Khóa học ---------- */
router.get('/courses', async (req, res) => {
  const courses = await db.all(
    `SELECT c.id, c.slug, c.title, c.level, c.category, c.color, c.published, COUNT(l.id) AS lesson_count
       FROM courses c LEFT JOIN lessons l ON l.course_id = c.id
      GROUP BY c.id, c.slug, c.title, c.level, c.category, c.color, c.published, c.created_at
      ORDER BY c.created_at DESC, c.id DESC`,
  );
  res.render('admin/courses', { title: 'Quản lý khóa học', courses, ...nav('courses') });
});

function readCourseForm(body) {
  const values = {
    title: String(body.title || '').trim(),
    slug: h.slugify(body.slug || body.title),
    description: String(body.description || '').trim(),
    category: String(body.category || '').trim().slice(0, 80),
    level: h.LEVELS.includes(body.level) ? body.level : h.LEVELS[0],
    color: /^#[0-9a-f]{6}$/i.test(body.color || '') ? body.color : '#4F46E5',
    published: body.published ? 1 : 0,
  };
  const errors = {};
  if (!values.title) errors.title = 'Vui lòng nhập tên khóa học.';
  else if (values.title.length > 200) errors.title = 'Tên khóa học tối đa 200 ký tự.';
  if (!values.slug) errors.slug = 'Đường dẫn không hợp lệ.';
  return { values, errors };
}

async function slugTaken(slug, exceptId = 0) {
  return Boolean(await db.get('SELECT id FROM courses WHERE slug = ? AND id <> ?', [slug, exceptId]));
}

router.get('/courses/new', (req, res) => {
  res.render('admin/course-form', {
    title: 'Thêm khóa học', course: null, errors: {},
    values: { level: h.LEVELS[0], color: '#4F46E5', published: 0 }, ...nav('courses'),
  });
});

router.post('/courses', async (req, res) => {
  const { values, errors } = readCourseForm(req.body);
  if (!errors.slug && await slugTaken(values.slug)) errors.slug = 'Đường dẫn này đã được dùng cho khóa học khác.';
  if (Object.keys(errors).length) {
    return res.status(400).render('admin/course-form', { title: 'Thêm khóa học', course: null, values, errors, ...nav('courses') });
  }
  const { insertId } = await db.run(
    'INSERT INTO courses (slug, title, description, level, category, color, published) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [values.slug, values.title, values.description, values.level, values.category, values.color, values.published],
  );
  req.flash('success', 'Đã tạo khóa học. Hãy thêm bài học đầu tiên.');
  res.redirect(`/admin/courses/${insertId}/lessons`);
});

async function loadCourse(req, res, next) {
  req.course = await db.get('SELECT * FROM courses WHERE id = ?', [Number(req.params.id) || 0]);
  if (!req.course) return next('route');
  next();
}

router.get('/courses/:id/edit', loadCourse, (req, res) => {
  res.render('admin/course-form', { title: 'Sửa khóa học', course: req.course, values: req.course, errors: {}, ...nav('courses') });
});

router.post('/courses/:id', loadCourse, async (req, res) => {
  const { values, errors } = readCourseForm(req.body);
  if (!errors.slug && await slugTaken(values.slug, req.course.id)) errors.slug = 'Đường dẫn này đã được dùng cho khóa học khác.';
  if (Object.keys(errors).length) {
    return res.status(400).render('admin/course-form', { title: 'Sửa khóa học', course: req.course, values, errors, ...nav('courses') });
  }
  await db.run(
    `UPDATE courses SET slug = ?, title = ?, description = ?, level = ?, category = ?, color = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [values.slug, values.title, values.description, values.level, values.category, values.color, values.published, req.course.id],
  );
  req.flash('success', 'Đã lưu thay đổi.');
  res.redirect('/admin/courses');
});

router.post('/courses/:id/delete', loadCourse, async (req, res) => {
  const files = await db.all("SELECT video_ref FROM lessons WHERE course_id = ? AND video_type = 'upload'", [req.course.id]);
  await db.run('DELETE FROM courses WHERE id = ?', [req.course.id]);
  files.forEach(f => removeUpload(f.video_ref));
  req.flash('success', `Đã xóa khóa học “${req.course.title}”.`);
  res.redirect('/admin/courses');
});

/* ---------- Bài học ---------- */
router.get('/courses/:id/lessons', loadCourse, async (req, res) => {
  const lessons = await db.all(
    'SELECT id, position, title, duration_sec, video_type FROM lessons WHERE course_id = ? ORDER BY position, id',
    [req.course.id],
  );
  res.render('admin/lessons', { title: `Bài học · ${req.course.title}`, course: req.course, lessons, ...nav('courses') });
});

function readLessonForm(req, existing) {
  const b = req.body || {};
  const values = {
    title: String(b.title || '').trim(),
    duration: String(b.duration || '').trim(),
    summary: String(b.summary || '').trim(),
    key_points: String(b.key_points || '').trim(),
    resources: String(b.resources || '').trim(),
    video_type: ['youtube', 'upload', 'none'].includes(b.video_type) ? b.video_type : 'none',
    youtube_url: String(b.youtube_url || '').trim(),
  };
  const errors = {};
  if (!values.title) errors.title = 'Vui lòng nhập tên bài học.';
  else if (values.title.length > 200) errors.title = 'Tên bài học tối đa 200 ký tự.';
  const durationSec = h.parseDuration(values.duration);
  if (durationSec === null) errors.duration = 'Nhập theo dạng phút:giây, ví dụ 11:02.';

  let videoRef = null;
  if (values.video_type === 'youtube') {
    videoRef = h.youtubeId(values.youtube_url);
    if (!videoRef) errors.youtube_url = 'Link YouTube không hợp lệ.';
  } else if (values.video_type === 'upload') {
    if (req.uploadError) errors.video_file = req.uploadError;
    else if (req.file) videoRef = req.file.filename;
    else if (existing && existing.video_type === 'upload' && existing.video_ref) videoRef = existing.video_ref;
    else errors.video_file = 'Vui lòng chọn file video.';
  }

  return {
    values, errors,
    data: {
      title: values.title, duration_sec: durationSec || 0, summary: values.summary,
      key_points: values.key_points, resources: values.resources,
      video_type: values.video_type, video_ref: videoRef,
    },
  };
}

function lessonFormValues(lesson) {
  return {
    ...lesson,
    duration: lesson.duration_sec ? h.fmtDuration(lesson.duration_sec) : '',
    youtube_url: lesson.video_type === 'youtube' ? `https://www.youtube.com/watch?v=${lesson.video_ref}` : '',
  };
}

const lessonFormLocals = (course, lesson, values, errors) => ({
  title: lesson ? 'Sửa bài học' : 'Thêm bài học',
  course, lesson, values, errors, maxUploadMb: config.maxUploadMb, ...nav('courses'),
});

router.get('/courses/:id/lessons/new', loadCourse, (req, res) => {
  res.render('admin/lesson-form', lessonFormLocals(req.course, null, { video_type: 'youtube' }, {}));
});

router.post('/courses/:id/lessons', loadCourse, uploadVideo, async (req, res) => {
  const { values, errors, data } = readLessonForm(req, null);
  if (Object.keys(errors).length) {
    if (req.file) removeUpload(req.file.filename);
    return res.status(400).render('admin/lesson-form', lessonFormLocals(req.course, null, values, errors));
  }
  const { pos } = await db.get('SELECT COALESCE(MAX(position), 0) + 1 AS pos FROM lessons WHERE course_id = ?', [req.course.id]);
  await db.run(
    `INSERT INTO lessons (course_id, position, title, duration_sec, summary, key_points, resources, video_type, video_ref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.course.id, Number(pos), data.title, data.duration_sec, data.summary, data.key_points, data.resources, data.video_type, data.video_ref],
  );
  req.flash('success', `Đã thêm bài học “${data.title}”.`);
  res.redirect(`/admin/courses/${req.course.id}/lessons`);
});

async function loadLesson(req, res, next) {
  req.lesson = await db.get('SELECT * FROM lessons WHERE id = ?', [Number(req.params.id) || 0]);
  if (!req.lesson) return next('route');
  req.course = await db.get('SELECT * FROM courses WHERE id = ?', [req.lesson.course_id]);
  next();
}

router.get('/lessons/:id/edit', loadLesson, (req, res) => {
  res.render('admin/lesson-form', lessonFormLocals(req.course, req.lesson, lessonFormValues(req.lesson), {}));
});

router.post('/lessons/:id', loadLesson, uploadVideo, async (req, res) => {
  const { values, errors, data } = readLessonForm(req, req.lesson);
  if (Object.keys(errors).length) {
    if (req.file) removeUpload(req.file.filename);
    return res.status(400).render('admin/lesson-form', lessonFormLocals(req.course, req.lesson, values, errors));
  }
  await db.run(
    `UPDATE lessons SET title = ?, duration_sec = ?, summary = ?, key_points = ?, resources = ?, video_type = ?, video_ref = ?
      WHERE id = ?`,
    [data.title, data.duration_sec, data.summary, data.key_points, data.resources, data.video_type, data.video_ref, req.lesson.id],
  );
  if (req.lesson.video_type === 'upload' && req.lesson.video_ref !== data.video_ref) removeUpload(req.lesson.video_ref);
  req.flash('success', 'Đã lưu bài học.');
  res.redirect(`/admin/courses/${req.course.id}/lessons`);
});

router.post('/lessons/:id/delete', loadLesson, async (req, res) => {
  await db.run('DELETE FROM lessons WHERE id = ?', [req.lesson.id]);
  if (req.lesson.video_type === 'upload') removeUpload(req.lesson.video_ref);
  req.flash('success', `Đã xóa bài học “${req.lesson.title}”.`);
  res.redirect(`/admin/courses/${req.course.id}/lessons`);
});

router.post('/lessons/:id/move', loadLesson, async (req, res) => {
  const lessons = await db.all('SELECT id FROM lessons WHERE course_id = ? ORDER BY position, id', [req.course.id]);
  const idx = lessons.findIndex(l => l.id === req.lesson.id);
  const target = req.body.dir === 'up' ? idx - 1 : idx + 1;
  if (target >= 0 && target < lessons.length) {
    [lessons[idx], lessons[target]] = [lessons[target], lessons[idx]];
    for (let i = 0; i < lessons.length; i++) {
      await db.run('UPDATE lessons SET position = ? WHERE id = ?', [i + 1, lessons[i].id]);
    }
  }
  res.redirect(`/admin/courses/${req.course.id}/lessons#lesson-${req.lesson.id}`);
});

/* ---------- Người dùng ---------- */
router.get('/users', async (req, res) => {
  const users = await db.all(
    `SELECT u.id, u.name, u.email, u.role, u.created_at, COUNT(p.lesson_id) AS lessons_started
       FROM users u LEFT JOIN progress p ON p.user_id = u.id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY u.id DESC`,
  );
  res.render('admin/users', { title: 'Người dùng', users, ...nav('users') });
});

router.post('/users/:id/role', async (req, res) => {
  const id = Number(req.params.id) || 0;
  const role = req.body.role === 'admin' ? 'admin' : 'student';
  if (id === req.user.id) {
    req.flash('error', 'Bạn không thể tự thay đổi quyền của chính mình.');
  } else {
    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    req.flash('success', role === 'admin' ? 'Đã cấp quyền quản trị.' : 'Đã chuyển về học viên.');
  }
  res.redirect('/admin/users');
});

module.exports = router;
