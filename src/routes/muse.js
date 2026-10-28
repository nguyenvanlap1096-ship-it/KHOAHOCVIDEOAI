// Muse Studio trên web khoá học: /muse (giao diện), /muse/huong-dan (hướng dẫn), /muse/tai-bo-cai (bộ cài Windows).
// Trang chạy trong trình duyệt học viên và gọi thẳng bộ chạy Muse2API trên máy họ — máy chủ không gọi muse.ai.
const path = require('path');
const express = require('express');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const { museAccess } = require('../services/muse');

const router = express.Router();
const RUNNER = 'http://127.0.0.1:* http://localhost:*';
const INSTALLER = path.join(config.root, 'assets', 'muse', 'Muse-Studio-Cai-Dat.zip');

// Trang Studio được gọi tới bộ chạy trên máy (127.0.0.1) để lấy dữ liệu, xem video và ảnh.
// Không đặt upgrade-insecure-requests: nếu không trình duyệt sẽ đổi http://127.0.0.1 thành https và hỏng kết nối.
const MUSE_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: ${RUNNER}`,
  `media-src 'self' blob: ${RUNNER}`,
  `connect-src 'self' ${RUNNER}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

async function guard(req, res, next) {
  const a = await museAccess(req.user);
  if (a.allowed) return next();
  res.status(403).render('error', {
    title: 'Muse Studio chưa mở cho bạn', status: 403,
    message: a.reason === 'closed'
      ? 'Muse Studio đang tạm đóng. Giảng viên sẽ mở lại sớm — bạn quay lại sau nhé.'
      : 'Tài khoản của bạn chưa được mở Muse Studio. Nhắn giảng viên (Zalo hỗ trợ) để được bật.',
  });
}

router.get('/', requireAuth, guard, (req, res) => {
  res.setHeader('Content-Security-Policy', MUSE_CSP);
  res.render('muse', { cfg: { web: true, base: 'http://127.0.0.1:18610' } });
});

router.get('/huong-dan', requireAuth, guard, (req, res) => {
  res.render('muse-guide', { title: 'Hướng dẫn Muse Studio' });
});

router.get('/tai-bo-cai', requireAuth, guard, (req, res) => {
  res.download(INSTALLER, 'Muse-Studio-Cai-Dat.zip');
});

module.exports = router;
