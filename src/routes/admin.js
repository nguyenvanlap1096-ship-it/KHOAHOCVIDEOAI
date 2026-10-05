const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const db = require('../db');
const config = require('../config');
const h = require('../helpers');
const { requireAdmin } = require('../middleware/auth');
const { acceptFiles, discardUploads, removeFile, videoExists, MAX_IMAGE_MB } = require('../uploads');
const { getSettings, setSettings } = require('../services/settings');
const { listCategories, listPrompts } = require('../services/prompts');
const { BANKS } = require('../services/vietqr');
const { ORDER_STATUS, fmtVnd, salesOpen, grantAccess, revokeAccess, countPendingOrders } = require('../services/shop');
const { safeNext } = require('../middleware/auth');

router.use(requireAdmin);
router.use('/uploads', require('./admin-uploads'));

const nav = active => ({ adminNav: active });
const hasErrors = errors => Object.keys(errors).length > 0;

// Xử lý một trường ảnh trong form: ảnh mới → thay; tích "xóa ảnh" → bỏ; không đổi → giữ ảnh cũ.
function resolveImage(req, field, current, errors) {
  if (req.uploadErrors[field]) {
    errors[field] = req.uploadErrors[field];
    return current || null;
  }
  if (req.uploaded[field]) return req.uploaded[field];
  if (req.body && req.body[`remove_${field}`]) return null;
  return current || null;
}

// Sau khi lưu thành công: xóa file ảnh/video cũ không còn dùng.
function cleanupReplaced(oldValue, newValue) {
  if (oldValue && oldValue !== newValue) removeFile(oldValue);
}

/* ---------- Tổng quan ---------- */
router.get('/', async (req, res) => {
  const count = async sql => Number((await db.get(sql)).n);
  const [users, courses, lessons, completions, prompts, pendingOrders] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM users'),
    count('SELECT COUNT(*) AS n FROM courses'),
    count('SELECT COUNT(*) AS n FROM lessons'),
    count('SELECT COUNT(*) AS n FROM progress WHERE completed = 1'),
    count('SELECT COUNT(*) AS n FROM prompts'),
    countPendingOrders(),
  ]);
  const recentUsers = await db.all('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT 6');
  const settings = await getSettings();
  res.render('admin/dashboard', {
    title: 'Quản trị',
    stats: { users, courses, lessons, completions, prompts, pendingOrders },
    recentUsers,
    zaloConfigured: Boolean(settings.zalo_phone || settings.zalo_link || settings.zalo_qr),
    ...nav('dashboard'),
  });
});

/* ---------- Khóa học ---------- */
router.get('/courses', async (req, res) => {
  const courses = await db.all(
    `SELECT c.id, c.slug, c.title, c.level, c.category, c.color, c.cover_image, c.is_premium, c.price, c.published, COUNT(l.id) AS lesson_count
       FROM courses c LEFT JOIN lessons l ON l.course_id = c.id
      GROUP BY c.id, c.slug, c.title, c.level, c.category, c.color, c.cover_image, c.is_premium, c.price, c.published, c.created_at
      ORDER BY c.created_at DESC, c.id DESC`,
  );
  res.render('admin/courses', { title: 'Quản lý khóa học', courses, ...nav('courses') });
});

function readCourseForm(req, existing) {
  const body = req.body || {};
  const values = {
    title: String(body.title || '').trim(),
    slug: h.slugify(body.slug || body.title),
    description: String(body.description || '').trim(),
    category: String(body.category || '').trim().slice(0, 80),
    level: h.LEVELS.includes(body.level) ? body.level : h.LEVELS[0],
    color: /^#[0-9a-f]{6}$/i.test(body.color || '') ? body.color : '#4F46E5',
    published: body.published ? 1 : 0,
    is_premium: body.is_premium ? 1 : 0,
    price: Math.round(Number(String(body.price || '').replace(/[^\d]/g, '')) || 0),
  };
  const errors = {};
  if (!values.title) errors.title = 'Vui lòng nhập tên khóa học.';
  if (values.is_premium && values.price < 1000) errors.price = 'Khóa chuyên sâu cần giá từ 1.000đ trở lên.';
  if (values.price > 100000000) errors.price = 'Giá không hợp lệ.';
  else if (values.title.length > 200) errors.title = 'Tên khóa học tối đa 200 ký tự.';
  if (!values.slug) errors.slug = 'Đường dẫn không hợp lệ.';
  values.cover_image = resolveImage(req, 'cover', existing && existing.cover_image, errors);
  return { values, errors };
}

async function slugTaken(slug, exceptId = 0) {
  return Boolean(await db.get('SELECT id FROM courses WHERE slug = ? AND id <> ?', [slug, exceptId]));
}

const courseFormLocals = (course, values, errors) => ({
  title: course ? 'Sửa khóa học' : 'Thêm khóa học', course, values, errors, maxImageMb: MAX_IMAGE_MB, ...nav('courses'),
});

router.get('/courses/new', (req, res) => {
  res.render('admin/course-form', courseFormLocals(null, { level: h.LEVELS[0], color: '#4F46E5', published: 0 }, {}));
});

router.post('/courses', acceptFiles(['cover']), async (req, res) => {
  const { values, errors } = readCourseForm(req, null);
  if (!errors.slug && await slugTaken(values.slug)) errors.slug = 'Đường dẫn này đã được dùng cho khóa học khác.';
  if (hasErrors(errors)) {
    discardUploads(req);
    return res.status(400).render('admin/course-form', courseFormLocals(null, { ...values, cover_image: null }, errors));
  }
  const { insertId } = await db.run(
    'INSERT INTO courses (slug, title, description, level, category, color, cover_image, is_premium, price, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [values.slug, values.title, values.description, values.level, values.category, values.color, values.cover_image, values.is_premium, values.price, values.published],
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
  res.render('admin/course-form', courseFormLocals(req.course, req.course, {}));
});

router.post('/courses/:id', loadCourse, acceptFiles(['cover']), async (req, res) => {
  const { values, errors } = readCourseForm(req, req.course);
  if (!errors.slug && await slugTaken(values.slug, req.course.id)) errors.slug = 'Đường dẫn này đã được dùng cho khóa học khác.';
  if (hasErrors(errors)) {
    discardUploads(req);
    return res.status(400).render('admin/course-form', courseFormLocals(req.course, { ...values, cover_image: req.course.cover_image }, errors));
  }
  await db.run(
    `UPDATE courses SET slug = ?, title = ?, description = ?, level = ?, category = ?, color = ?, cover_image = ?, is_premium = ?, price = ?, published = ?,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [values.slug, values.title, values.description, values.level, values.category, values.color, values.cover_image, values.is_premium, values.price, values.published, req.course.id],
  );
  cleanupReplaced(req.course.cover_image, values.cover_image);
  req.flash('success', 'Đã lưu thay đổi.');
  res.redirect('/admin/courses');
});

router.post('/courses/:id/delete', loadCourse, async (req, res) => {
  const lessonFiles = await db.all('SELECT video_type, video_ref, thumbnail FROM lessons WHERE course_id = ?', [req.course.id]);
  await db.run('DELETE FROM courses WHERE id = ?', [req.course.id]);
  await db.run("DELETE FROM access WHERE scope = 'course' AND course_id = ?", [req.course.id]);
  removeFile(req.course.cover_image);
  lessonFiles.forEach(f => {
    if (f.video_type === 'upload') removeFile(f.video_ref);
    removeFile(f.thumbnail);
  });
  req.flash('success', `Đã xóa khóa học “${req.course.title}”.`);
  res.redirect('/admin/courses');
});

/* ---------- Bài học ---------- */
router.get('/courses/:id/lessons', loadCourse, async (req, res) => {
  const lessons = await db.all(
    'SELECT id, position, title, duration_sec, video_type, video_ref, thumbnail, video_ratio FROM lessons WHERE course_id = ? ORDER BY position, id',
    [req.course.id],
  );
  lessons.forEach(l => { l.video_missing = l.video_type === 'upload' && l.video_ref && !videoExists(l.video_ref); });
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
    video_ratio: h.VIDEO_RATIOS.includes(b.video_ratio) ? b.video_ratio : 'auto',
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
    if (req.uploadErrors.video_file) errors.video_file = req.uploadErrors.video_file;
    else if (req.uploaded.video_file) videoRef = req.uploaded.video_file;
    else if (existing && existing.video_type === 'upload' && existing.video_ref) videoRef = existing.video_ref;
    else if (b.video_pending === '1') videoRef = null;
    else errors.video_file = 'Vui lòng chọn file video.';
  }
  const thumbnail = resolveImage(req, 'thumbnail', existing && existing.thumbnail, errors);

  // Tỉ lệ khung hình: admin chọn tay, hoặc tự nhận diện (file upload: đọc kích thước ngay trên trình duyệt;
  // YouTube: link /shorts/ là video dọc 9:16). Không chuyển đổi video nên lưu tức thì.
  let videoRatio = null;
  if (values.video_type !== 'none') {
    if (values.video_ratio !== 'auto') videoRatio = values.video_ratio;
    else if (values.video_type === 'youtube') videoRatio = /\/shorts\//i.test(values.youtube_url) ? '9:16' : '16:9';
    else if (req.uploaded.video_file) videoRatio = h.VIDEO_RATIOS.includes(b.detected_ratio) ? b.detected_ratio : null;
    else if (existing && existing.video_ref === videoRef) videoRatio = existing.video_ratio || null;
  }

  return {
    values: { ...values, thumbnail },
    errors,
    data: {
      title: values.title, duration_sec: durationSec || 0, summary: values.summary,
      key_points: values.key_points, resources: values.resources,
      video_type: values.video_type, video_ref: videoRef, thumbnail, video_ratio: videoRatio,
    },
  };
}

function lessonFormValues(lesson) {
  return {
    ...lesson,
    duration: lesson.duration_sec ? h.fmtDuration(lesson.duration_sec) : '',
    youtube_url: lesson.video_type === 'youtube'
      ? (lesson.video_ratio === '9:16' ? `https://www.youtube.com/shorts/${lesson.video_ref}` : `https://www.youtube.com/watch?v=${lesson.video_ref}`)
      : '',
    video_ratio: lesson.video_ratio || 'auto',
  };
}

const lessonFormLocals = (course, lesson, values, errors) => ({
  title: lesson ? 'Sửa bài học' : 'Thêm bài học',
  course, lesson, values, errors, maxUploadMb: config.maxUploadMb, maxImageMb: MAX_IMAGE_MB, ...nav('courses'),
});

const lessonUploads = acceptFiles(['video_file', 'thumbnail']);

router.get('/courses/:id/lessons/new', loadCourse, (req, res) => {
  res.render('admin/lesson-form', lessonFormLocals(req.course, null, { video_type: 'youtube' }, {}));
});

router.post('/courses/:id/lessons', loadCourse, lessonUploads, async (req, res) => {
  const { values, errors, data } = readLessonForm(req, null);
  if (hasErrors(errors)) {
    discardUploads(req);
    return res.status(400).render('admin/lesson-form', lessonFormLocals(req.course, null, { ...values, thumbnail: null }, errors));
  }
  const { pos } = await db.get('SELECT COALESCE(MAX(position), 0) + 1 AS pos FROM lessons WHERE course_id = ?', [req.course.id]);
  await db.run(
    `INSERT INTO lessons (course_id, position, title, duration_sec, summary, key_points, resources, video_type, video_ref, thumbnail, video_ratio, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [req.course.id, Number(pos), data.title, data.duration_sec, data.summary, data.key_points, data.resources, data.video_type, data.video_ref, data.thumbnail, data.video_ratio],
  );
  const { id: newId } = await db.get('SELECT MAX(id) AS id FROM lessons WHERE course_id = ?', [req.course.id]);
  req.flash('success', `Đã thêm bài học “${data.title}”.`);
  const back = `/admin/courses/${req.course.id}/lessons`;
  if (req.accepts(['html', 'json']) === 'json') return res.json({ ok: true, lessonId: newId, title: data.title, redirect: back });
  res.redirect(back);
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

router.post('/lessons/:id', loadLesson, lessonUploads, async (req, res) => {
  const { values, errors, data } = readLessonForm(req, req.lesson);
  if (hasErrors(errors)) {
    discardUploads(req);
    return res.status(400).render('admin/lesson-form', lessonFormLocals(req.course, req.lesson, { ...values, thumbnail: req.lesson.thumbnail }, errors));
  }
  // Chỉ đánh dấu "cập nhật" khi video thực sự thay đổi, để mục Video mới không bị nhiễu khi sửa chính tả.
  const videoChanged = data.video_type !== req.lesson.video_type || data.video_ref !== req.lesson.video_ref;
  await db.run(
    `UPDATE lessons SET title = ?, duration_sec = ?, summary = ?, key_points = ?, resources = ?, video_type = ?, video_ref = ?, thumbnail = ?, video_ratio = ?
            ${videoChanged ? ', updated_at = CURRENT_TIMESTAMP' : ''}
      WHERE id = ?`,
    [data.title, data.duration_sec, data.summary, data.key_points, data.resources, data.video_type, data.video_ref, data.thumbnail, data.video_ratio, req.lesson.id],
  );
  if (req.lesson.video_type === 'upload') cleanupReplaced(req.lesson.video_ref, data.video_ref);
  cleanupReplaced(req.lesson.thumbnail, data.thumbnail);
  req.flash('success', 'Đã lưu bài học.');
  const back = `/admin/courses/${req.course.id}/lessons`;
  if (req.accepts(['html', 'json']) === 'json') return res.json({ ok: true, lessonId: req.lesson.id, title: data.title, redirect: back });
  res.redirect(back);
});

router.post('/lessons/:id/delete', loadLesson, async (req, res) => {
  await db.run('DELETE FROM lessons WHERE id = ?', [req.lesson.id]);
  if (req.lesson.video_type === 'upload') removeFile(req.lesson.video_ref);
  removeFile(req.lesson.thumbnail);
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

/* ---------- Thư viện prompt ---------- */
router.get('/prompts', async (req, res) => {
  const categories = await listCategories({ publicOnly: false });
  const active = categories.find(c => String(c.id) === String(req.query.nganh)) || null;
  const prompts = await listPrompts({ categoryId: active && active.id, publicOnly: false });
  res.render('admin/prompts', { title: 'Thư viện prompt', categories, active, prompts, ...nav('prompts') });
});

function readPromptForm(body, categories) {
  const values = {
    category_id: Number(body.category_id) || 0,
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    content: String(body.content || '').replace(/\r\n/g, '\n').trim(),
    tool: String(body.tool || '').trim().slice(0, 120),
    published: body.published ? 1 : 0,
  };
  const errors = {};
  if (!categories.some(c => c.id === values.category_id)) errors.category_id = 'Vui lòng chọn ngành nghề.';
  if (!values.title) errors.title = 'Vui lòng nhập tên prompt.';
  else if (values.title.length > 200) errors.title = 'Tên prompt tối đa 200 ký tự.';
  if (!values.content) errors.content = 'Vui lòng nhập nội dung prompt.';
  return { values, errors };
}

const promptFormLocals = (prompt, values, errors, categories) => ({
  title: prompt ? 'Sửa prompt' : 'Thêm prompt', prompt, values, errors, categories, ...nav('prompts'),
});

router.get('/prompts/new', async (req, res) => {
  const categories = await listCategories({ publicOnly: false });
  if (!categories.length) {
    req.flash('error', 'Hãy tạo ít nhất một ngành nghề trước khi thêm prompt.');
    return res.redirect('/admin/prompts');
  }
  res.render('admin/prompt-form', promptFormLocals(null, { category_id: Number(req.query.nganh) || categories[0].id, published: 1 }, {}, categories));
});

router.post('/prompts', async (req, res) => {
  const categories = await listCategories({ publicOnly: false });
  const { values, errors } = readPromptForm(req.body, categories);
  if (hasErrors(errors)) return res.status(400).render('admin/prompt-form', promptFormLocals(null, values, errors, categories));
  await db.run(
    'INSERT INTO prompts (category_id, title, description, content, tool, published) VALUES (?, ?, ?, ?, ?, ?)',
    [values.category_id, values.title, values.description, values.content, values.tool, values.published],
  );
  req.flash('success', `Đã thêm prompt “${values.title}”.`);
  res.redirect(`/admin/prompts?nganh=${values.category_id}`);
});

async function loadPrompt(req, res, next) {
  req.prompt = await db.get('SELECT * FROM prompts WHERE id = ?', [Number(req.params.id) || 0]);
  if (!req.prompt) return next('route');
  next();
}

router.get('/prompts/:id/edit', loadPrompt, async (req, res) => {
  const categories = await listCategories({ publicOnly: false });
  res.render('admin/prompt-form', promptFormLocals(req.prompt, req.prompt, {}, categories));
});

router.post('/prompts/:id', loadPrompt, async (req, res) => {
  const categories = await listCategories({ publicOnly: false });
  const { values, errors } = readPromptForm(req.body, categories);
  if (hasErrors(errors)) return res.status(400).render('admin/prompt-form', promptFormLocals(req.prompt, values, errors, categories));
  await db.run(
    `UPDATE prompts SET category_id = ?, title = ?, description = ?, content = ?, tool = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [values.category_id, values.title, values.description, values.content, values.tool, values.published, req.prompt.id],
  );
  req.flash('success', 'Đã lưu prompt.');
  res.redirect(`/admin/prompts?nganh=${values.category_id}`);
});

router.post('/prompts/:id/delete', loadPrompt, async (req, res) => {
  await db.run('DELETE FROM prompts WHERE id = ?', [req.prompt.id]);
  req.flash('success', `Đã xóa prompt “${req.prompt.title}”.`);
  res.redirect(`/admin/prompts?nganh=${req.prompt.category_id}`);
});

/* ---------- Ngành nghề (danh mục prompt) ---------- */
function readCategoryForm(body) {
  const name = String(body.name || '').trim().slice(0, 120);
  return {
    name,
    slug: h.slugify(name),
    color: /^#[0-9a-f]{6}$/i.test(body.color || '') ? body.color : '#4F46E5',
  };
}

router.post('/prompt-categories', async (req, res) => {
  const v = readCategoryForm(req.body);
  if (!v.slug) {
    req.flash('error', 'Vui lòng nhập tên ngành nghề.');
  } else if (await db.get('SELECT id FROM prompt_categories WHERE slug = ?', [v.slug])) {
    req.flash('error', `Ngành “${v.name}” đã tồn tại.`);
  } else {
    const { pos } = await db.get('SELECT COALESCE(MAX(position), 0) + 1 AS pos FROM prompt_categories');
    const { insertId } = await db.run(
      'INSERT INTO prompt_categories (slug, name, color, position) VALUES (?, ?, ?, ?)',
      [v.slug, v.name, v.color, Number(pos)],
    );
    req.flash('success', `Đã thêm ngành “${v.name}”.`);
    return res.redirect(`/admin/prompts?nganh=${insertId}`);
  }
  res.redirect('/admin/prompts');
});

router.post('/prompt-categories/:id', async (req, res) => {
  const id = Number(req.params.id) || 0;
  const v = readCategoryForm(req.body);
  if (!v.slug) req.flash('error', 'Tên ngành nghề không được để trống.');
  else if (await db.get('SELECT id FROM prompt_categories WHERE slug = ? AND id <> ?', [v.slug, id])) req.flash('error', `Ngành “${v.name}” đã tồn tại.`);
  else {
    await db.run('UPDATE prompt_categories SET name = ?, slug = ?, color = ? WHERE id = ?', [v.name, v.slug, v.color, id]);
    req.flash('success', 'Đã lưu ngành nghề.');
  }
  res.redirect(`/admin/prompts?nganh=${id}`);
});

router.post('/prompt-categories/:id/delete', async (req, res) => {
  const id = Number(req.params.id) || 0;
  const { n } = await db.get('SELECT COUNT(*) AS n FROM prompts WHERE category_id = ?', [id]);
  if (Number(n) > 0) {
    req.flash('error', `Ngành này còn ${n} prompt. Hãy xóa hoặc chuyển prompt sang ngành khác trước.`);
    return res.redirect(`/admin/prompts?nganh=${id}`);
  }
  await db.run('DELETE FROM prompt_categories WHERE id = ?', [id]);
  req.flash('success', 'Đã xóa ngành nghề.');
  res.redirect('/admin/prompts');
});

// Thông tin nơi lưu video cho trang Cài đặt.
function storageInfo() {
  const files = (() => { try { return fs.readdirSync(config.uploadDir).filter(f => /\.(mp4|webm|ogv)$/.test(f)); } catch { return []; } })();
  const bytes = files.reduce((s, f) => { try { return s + fs.statSync(path.join(config.uploadDir, f)).size; } catch { return s; } }, 0);
  return { dir: config.uploadDir, persistent: config.uploadPersistent, isProd: config.isProd, count: files.length, mb: Math.round(bytes / 1048576) };
}

/* ---------- Cài đặt: Zalo hỗ trợ ---------- */
router.get('/settings', async (req, res) => {
  res.render('admin/settings', { title: 'Cài đặt', values: await getSettings(), defaultSiteName: config.siteName, banks: BANKS, storage: storageInfo(), errors: {}, maxImageMb: MAX_IMAGE_MB, ...nav('settings') });
});

router.post('/settings', acceptFiles(['zalo_qr', 'site_logo']), async (req, res) => {
  const current = await getSettings();
  const b = req.body || {};
  const values = {
    site_name: String(b.site_name || '').trim().slice(0, 60),
    site_tagline: String(b.site_tagline || '').trim().slice(0, 60),
    hero_title: String(b.hero_title || '').trim().slice(0, 120),
    hero_text: String(b.hero_text || '').trim().slice(0, 300),
    zalo_phone: String(b.zalo_phone || '').replace(/[^\d+]/g, ''),
    zalo_link: String(b.zalo_link || '').trim(),
    support_title: String(b.support_title || '').trim().slice(0, 80),
    support_text: String(b.support_text || '').trim().slice(0, 300),
    support_hours: String(b.support_hours || '').trim().slice(0, 80),
    pay_bank_bin: BANKS.some(x => x.bin === b.pay_bank_bin) ? b.pay_bank_bin : '',
    pay_account_no: String(b.pay_account_no || '').replace(/\s/g, '').slice(0, 30),
    pay_account_name: String(b.pay_account_name || '').trim().toUpperCase().slice(0, 60),
    pay_prefix: String(b.pay_prefix || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'BKAI',
    premium_sales_open: b.premium_sales_open ? '1' : '0',
    bundle_enabled: b.bundle_enabled ? '1' : '',
    bundle_title: String(b.bundle_title || '').trim().slice(0, 120),
    bundle_price: String(Math.round(Number(String(b.bundle_price || '').replace(/[^\d]/g, '')) || 0) || ''),
    bundle_description: String(b.bundle_description || '').trim().slice(0, 300),
  };
  const errors = {};
  if (values.pay_account_no && !/^[A-Za-z0-9]{4,30}$/.test(values.pay_account_no)) errors.pay_account_no = 'Số tài khoản chỉ gồm chữ và số.';
  if (values.pay_account_no && !values.pay_bank_bin) errors.pay_bank_bin = 'Vui lòng chọn ngân hàng.';
  if (values.bundle_enabled && !(Number(values.bundle_price) >= 1000)) errors.bundle_price = 'Nhập giá gói trọn bộ (từ 1.000đ).';
  const digits = values.zalo_phone.replace(/\D/g, '');
  if (values.zalo_phone && (digits.length < 9 || digits.length > 12)) errors.zalo_phone = 'Số điện thoại Zalo không hợp lệ.';
  if (values.zalo_link && !/^https:\/\/(zalo\.me|oa\.zalo\.me|chat\.zalo\.me)\//i.test(values.zalo_link)) {
    errors.zalo_link = 'Link phải bắt đầu bằng https://zalo.me/ hoặc https://oa.zalo.me/';
  }
  values.zalo_qr = resolveImage(req, 'zalo_qr', current.zalo_qr, errors) || '';
  values.site_logo = resolveImage(req, 'site_logo', current.site_logo, errors) || '';
  if (hasErrors(errors)) {
    discardUploads(req);
    return res.status(400).render('admin/settings', {
      title: 'Cài đặt', defaultSiteName: config.siteName, banks: BANKS, storage: storageInfo(), values: { ...values, zalo_qr: current.zalo_qr, site_logo: current.site_logo }, errors, maxImageMb: MAX_IMAGE_MB, ...nav('settings'),
    });
  }
  await setSettings(values);
  cleanupReplaced(current.zalo_qr, values.zalo_qr);
  cleanupReplaced(current.site_logo, values.site_logo);
  req.flash('success', 'Đã lưu cài đặt.');
  res.redirect('/admin/settings');
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

/* ---------- Đơn hàng khóa chuyên sâu ---------- */
router.get('/orders', async (req, res) => {
  const status = ['pending', 'paid', 'cancelled', 'all'].includes(req.query.status) ? req.query.status : 'pending';
  const orders = await db.all(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o JOIN users u ON u.id = o.user_id
      ${status === 'all' ? '' : 'WHERE o.status = ?'}
      ORDER BY (o.notified_at IS NULL), o.id DESC LIMIT 200`,
    status === 'all' ? [] : [status],
  );
  const counts = Object.fromEntries((await db.all('SELECT status, COUNT(*) AS n FROM orders GROUP BY status')).map(r => [r.status, Number(r.n)]));
  res.render('admin/orders', { title: 'Đơn hàng', orders, status, counts, ORDER_STATUS, fmtVnd, salesOpen: salesOpen(await getSettings()), ...nav('orders') });
});

// Bật / tắt mở bán khóa chuyên sâu.
router.post('/sales', async (req, res) => {
  const open = req.body.open === '1';
  await setSettings({ premium_sales_open: open ? '1' : '0' });
  req.flash('success', open ? 'Đã MỞ bán khóa chuyên sâu.' : 'Đã ĐÓNG bán khóa chuyên sâu. Học viên đã mua vẫn học bình thường.');
  res.redirect(req.body.next ? safeNext(req.body.next) : '/admin/orders');
});

async function loadOrder(req, res, next) {
  req.order = await db.get('SELECT * FROM orders WHERE id = ?', [Number(req.params.id) || 0]);
  if (!req.order) return next('route');
  next();
}

router.post('/orders/:id/confirm', loadOrder, async (req, res) => {
  if (req.order.status !== 'paid') {
    await grantAccess(req.order.user_id, req.order.item_type, req.order.course_id, req.order.id);
    await db.run("UPDATE orders SET status = 'paid', confirmed_at = CURRENT_TIMESTAMP WHERE id = ?", [req.order.id]);
    req.flash('success', `Đã xác nhận đơn ${req.order.transfer_code} – khóa học đã mở cho học viên.`);
  }
  res.redirect('/admin/orders');
});

router.post('/orders/:id/cancel', loadOrder, async (req, res) => {
  if (req.order.status === 'paid') await revokeAccess(req.order);
  await db.run("UPDATE orders SET status = 'cancelled' WHERE id = ?", [req.order.id]);
  req.flash('success', req.order.status === 'paid'
    ? `Đã hủy đơn ${req.order.transfer_code} và thu hồi quyền học.`
    : `Đã hủy đơn ${req.order.transfer_code}.`);
  res.redirect(`/admin/orders?status=${req.order.status}`);
});

// Xóa học viên (kèm tiến độ học và khóa học đã lưu – xóa theo khóa ngoại).
// Không cho xóa chính mình hay tài khoản admin: phải gỡ quyền admin trước.
router.post('/users/:id/delete', async (req, res) => {
  const target = await db.get('SELECT id, name, role FROM users WHERE id = ?', [Number(req.params.id) || 0]);
  if (!target) {
    req.flash('error', 'Không tìm thấy người dùng.');
  } else if (target.id === req.user.id) {
    req.flash('error', 'Bạn không thể tự xóa tài khoản của chính mình.');
  } else if (target.role === 'admin') {
    req.flash('error', `${target.name} đang là quản trị viên. Hãy gỡ quyền admin trước khi xóa.`);
  } else {
    await db.run('DELETE FROM progress WHERE user_id = ?', [target.id]);
    await db.run('DELETE FROM bookmarks WHERE user_id = ?', [target.id]);
    await db.run('DELETE FROM access WHERE user_id = ?', [target.id]);
    await db.run('DELETE FROM orders WHERE user_id = ?', [target.id]);
    await db.run('DELETE FROM users WHERE id = ?', [target.id]);
    req.flash('success', `Đã xóa học viên “${target.name}”.`);
  }
  res.redirect('/admin/users');
});

module.exports = router;
