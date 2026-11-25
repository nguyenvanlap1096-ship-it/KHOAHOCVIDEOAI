const router = require('express').Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { safeNext } = require('../middleware/auth');
const { getSettings, supportInfo } = require('../services/settings');
const { museConfig } = require('../services/muse');
const { normalizePhone, phoneEmail } = require('../helpers');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).render('error', {
    title: 'Thử lại sau', status: 429, message: 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  }),
});

function logIn(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(err => {
      if (err) return reject(err);
      req.session.userId = user.id;
      resolve();
    });
  });
}

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/login', { title: 'Đăng nhập', values: {}, errors: {}, next: safeNext(req.query.next) });
});

// Đăng nhập bằng số điện thoại (học viên mới) hoặc email (admin, học viên cũ).
router.post('/login', limiter, async (req, res) => {
  const login = String(req.body.login || req.body.email || '').trim();
  const password = String(req.body.password || '');
  const next = safeNext(req.body.next);
  const email = login.includes('@') ? login.toLowerCase() : (normalizePhone(login) ? phoneEmail(normalizePhone(login)) : '');
  const user = email && await db.get('SELECT id, password_hash, status FROM users WHERE email = ?', [email]);
  const fail = message => res.status(400).render('auth/login', { title: 'Đăng nhập', values: { login }, next, errors: { form: message } });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return fail('Số điện thoại / email hoặc mật khẩu không đúng.');
  if (user.status !== 'active') return fail('Tài khoản đang chờ quản trị viên duyệt. Vui lòng liên hệ Zalo hỗ trợ để được kích hoạt.');
  await logIn(req, user);
  res.redirect(next);
});

router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/register', { title: 'Tạo tài khoản', values: {}, errors: {}, next: safeNext(req.query.next) });
});

// Đăng ký bằng số điện thoại → tài khoản ở trạng thái "chờ duyệt", admin xác nhận đúng học viên mới cho vào học.
router.post('/register', limiter, async (req, res) => {
  const values = {
    name: String(req.body.name || '').trim(),
    phone: String(req.body.phone || '').trim(),
  };
  const password = String(req.body.password || '');
  const next = safeNext(req.body.next);
  const errors = {};
  const phone = normalizePhone(values.phone);
  if (values.name.length < 2 || values.name.length > 120) errors.name = 'Họ tên cần từ 2 đến 120 ký tự.';
  if (!phone) errors.phone = 'Số điện thoại không hợp lệ (10 số, ví dụ 0901 234 567).';
  if (password.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự.';
  else if (password !== String(req.body.password_confirm || '')) errors.password_confirm = 'Mật khẩu nhập lại không khớp.';
  const existing = phone && await db.get('SELECT status FROM users WHERE email = ?', [phoneEmail(phone)]);
  if (existing) {
    errors.phone = existing.status === 'active'
      ? 'Số điện thoại này đã có tài khoản. Hãy đăng nhập.'
      : 'Số điện thoại này đã đăng ký và đang chờ duyệt.';
  }
  if (Object.keys(errors).length) {
    return res.status(400).render('auth/register', { title: 'Tạo tài khoản', values, errors, next });
  }
  const hash = await bcrypt.hash(password, 12);
  await db.run(
    "INSERT INTO users (name, email, password_hash, role, status, muse_enabled) VALUES (?, ?, ?, 'student', 'pending', ?)",
    [values.name, phoneEmail(phone), hash, museConfig(await getSettings()).autoNew ? 1 : 0],
  );
  res.render('auth/pending', { title: 'Chờ duyệt tài khoản', name: values.name, phone, zalo: supportInfo(await getSettings()) });
});

// Quên mật khẩu: học viên tự đặt mật khẩu mới bằng số điện thoại. Không gửi được SMS / email xác minh,
// nên mật khẩu mới được lưu tạm (đã mã hóa) và chỉ có hiệu lực sau khi admin xác nhận đúng người qua Zalo.
router.get('/forgot', (req, res) => {
  if (req.user) return res.redirect('/my#account');
  res.render('auth/forgot', { title: 'Quên mật khẩu', values: {}, errors: {} });
});

router.post('/forgot', limiter, async (req, res) => {
  const values = { phone: String(req.body.phone || '').trim() };
  const password = String(req.body.password || '');
  const errors = {};
  const phone = normalizePhone(values.phone);
  if (!phone) errors.phone = 'Số điện thoại không hợp lệ (10 số, ví dụ 0901 234 567).';
  if (password.length < 8) errors.password = 'Mật khẩu mới cần ít nhất 8 ký tự.';
  else if (password !== String(req.body.password_confirm || '')) errors.password_confirm = 'Mật khẩu nhập lại không khớp.';
  if (Object.keys(errors).length) return res.status(400).render('auth/forgot', { title: 'Quên mật khẩu', values, errors });
  const user = await db.get("SELECT id, reset_open_until FROM users WHERE email = ? AND status = 'active'", [phoneEmail(phone)]);
  const hash = user ? await bcrypt.hash(password, 12) : null;
  if (user && Number(user.reset_open_until) > Date.now()) {
    // Admin đã bấm "Cho tự đặt lại mật khẩu": đổi luôn, dùng được ngay (mỗi lần mở chỉ dùng 1 lần).
    await db.run('UPDATE users SET password_hash = ?, reset_hash = NULL, reset_at = NULL, reset_open_until = NULL WHERE id = ?', [hash, user.id]);
    req.flash('success', 'Đã đặt mật khẩu mới. Hãy đăng nhập bằng số điện thoại và mật khẩu mới.');
    return res.redirect('/login');
  }
  if (user) {
    await db.run('UPDATE users SET reset_hash = ?, reset_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, user.id]);
  }
  // Luôn báo giống nhau để người lạ không dò được số nào đã có tài khoản.
  res.render('auth/forgot-sent', { title: 'Đã gửi yêu cầu', phone, zalo: supportInfo(await getSettings()) });
});

// Học viên đang đăng nhập tự đổi mật khẩu (cần mật khẩu hiện tại).
router.post('/account/password', limiter, async (req, res) => {
  if (!req.user) return res.redirect('/login?next=' + encodeURIComponent('/my#account'));
  const current = String(req.body.current_password || '');
  const password = String(req.body.password || '');
  const row = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
  let error = '';
  if (!row || !(await bcrypt.compare(current, row.password_hash))) error = 'Mật khẩu hiện tại không đúng.';
  else if (password.length < 8) error = 'Mật khẩu mới cần ít nhất 8 ký tự.';
  else if (password !== String(req.body.password_confirm || '')) error = 'Mật khẩu nhập lại không khớp.';
  if (error) {
    req.flash('error', error);
  } else {
    await db.run('UPDATE users SET password_hash = ?, reset_hash = NULL, reset_at = NULL, reset_open_until = NULL WHERE id = ?', [await bcrypt.hash(password, 12), req.user.id]);
    req.flash('success', 'Đã đổi mật khẩu. Lần sau hãy đăng nhập bằng mật khẩu mới.');
  }
  res.redirect('/my#account');
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('demia.sid');
    res.redirect('/');
  });
});

module.exports = router;
