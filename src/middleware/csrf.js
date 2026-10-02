// Chống CSRF bằng token lưu trong session.
// Token được đọc từ: trường form `_csrf`, header `X-CSRF-Token`, hoặc query `?_csrf=`
// (dùng cho form upload multipart để kiểm tra trước khi nhận file).
const crypto = require('crypto');

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = function csrf(req, res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrf = req.session.csrf;
  if (SAFE.has(req.method)) return next();

  const token = (req.body && req.body._csrf) || req.get('x-csrf-token') || req.query._csrf;
  if (token && safeEqual(token, req.session.csrf)) return next();

  const err = new Error('Phiên làm việc đã hết hạn. Vui lòng tải lại trang và thử lại.');
  err.status = 403;
  next(err);
};
