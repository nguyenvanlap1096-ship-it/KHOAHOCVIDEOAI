const db = require('../db');

async function loadUser(req, res, next) {
  req.user = null;
  if (req.session.userId) {
    const user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.session.userId]);
    if (user) req.user = user;
    else delete req.session.userId;
  }
  res.locals.user = req.user;
  next();
}

function requireAuth(req, res, next) {
  if (req.user) return next();
  if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
  res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role === 'admin') return next();
    const err = new Error('Bạn không có quyền truy cập trang quản trị.');
    err.status = 403;
    next(err);
  });
}

// Chỉ cho phép chuyển hướng nội bộ sau khi đăng nhập (chặn open redirect).
function safeNext(value) {
  const s = String(value || '');
  return s.startsWith('/') && !s.startsWith('//') && !s.startsWith('/\\') ? s : '/';
}

module.exports = { loadUser, requireAuth, requireAdmin, safeNext };
