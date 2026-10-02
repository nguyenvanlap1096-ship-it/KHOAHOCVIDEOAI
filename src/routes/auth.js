const router = require('express').Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { safeNext } = require('../middleware/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).render('error', {
    title: 'Thử lại sau', status: 429, message: 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  }),
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

router.post('/login', limiter, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const next = safeNext(req.body.next);
  const user = email && await db.get('SELECT id, password_hash FROM users WHERE email = ?', [email]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(400).render('auth/login', {
      title: 'Đăng nhập', values: { email }, next,
      errors: { form: 'Email hoặc mật khẩu không đúng.' },
    });
  }
  await logIn(req, user);
  res.redirect(next);
});

router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/register', { title: 'Tạo tài khoản', values: {}, errors: {}, next: safeNext(req.query.next) });
});

router.post('/register', limiter, async (req, res) => {
  const values = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
  };
  const password = String(req.body.password || '');
  const next = safeNext(req.body.next);
  const errors = {};
  if (values.name.length < 2 || values.name.length > 120) errors.name = 'Họ tên cần từ 2 đến 120 ký tự.';
  if (!EMAIL_RE.test(values.email) || values.email.length > 190) errors.email = 'Email không hợp lệ.';
  if (password.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự.';
  else if (password !== String(req.body.password_confirm || '')) errors.password_confirm = 'Mật khẩu nhập lại không khớp.';
  if (!errors.email && await db.get('SELECT id FROM users WHERE email = ?', [values.email])) {
    errors.email = 'Email này đã được đăng ký. Hãy đăng nhập.';
  }
  if (Object.keys(errors).length) {
    return res.status(400).render('auth/register', { title: 'Tạo tài khoản', values, errors, next });
  }
  const hash = await bcrypt.hash(password, 12);
  const { insertId } = await db.run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
    [values.name, values.email, hash],
  );
  await logIn(req, { id: insertId });
  req.flash('success', `Chào mừng ${values.name}! Tài khoản của bạn đã sẵn sàng.`);
  res.redirect(next);
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('demia.sid');
    res.redirect('/');
  });
});

module.exports = router;
