// Muse Studio trên web khoá học: /muse (giao diện), /muse/huong-dan (hướng dẫn), /muse/tai-bo-cai (bộ cài Windows).
// Trang chạy trong trình duyệt học viên và gọi thẳng bộ chạy Muse2API trên máy họ — máy chủ không gọi muse.ai.
const path = require('path');
const express = require('express');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const { museAccess } = require('../services/muse');
const db = require('../db');
const { getSettings } = require('../services/settings');
const studio = require('../services/studio');
const film = require('../../public/js/muse-film');

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

router.get('/', requireAuth, guard, async (req, res) => {
  res.setHeader('Content-Security-Policy', MUSE_CSP);
  // ai: AI viết kịch bản của khoá học (key Google gói miễn phí trên máy chủ, cùng lượt với Xưởng Kịch bản AI).
  const q = await studio.quotaFor(req.user, studio.studioConfig(await getSettings()));
  const ai = q.allowed ? { unlimited: Boolean(q.unlimited), left: Math.max(0, q.quota - q.used) } : null;
  res.render('muse', { cfg: { web: true, base: 'http://127.0.0.1:18610', csrf: res.locals.csrf, ai } });
});

// Viết kịch bản phim liền mạch bằng AI của khoá học. Không có AI / hết lượt → trình duyệt dùng Trình viết nhanh.
router.post('/api/script', requireAuth, async (req, res) => {
  if (!(await museAccess(req.user)).allowed) return res.status(403).json({ error: 'Tài khoản chưa được mở Muse Studio.' });
  const cfg = studio.studioConfig(await getSettings());
  const q = await studio.quotaFor(req.user, cfg);
  if (!q.allowed) return res.status(403).json({ error: 'AI viết kịch bản của khoá học chưa bật cho bạn.', noAi: true });
  if (!q.unlimited && q.used + 1 > q.quota) return res.status(402).json({ error: `Bạn đã dùng hết ${q.quota} lượt AI tháng này.`, noAi: true });
  const b = req.body || {};
  const o = {
    idea: String(b.idea || '').trim().slice(0, 3000), cast: String(b.cast || '').trim().slice(0, 1500),
    scenes: b.scenes, style: b.style, ratio: b.ratio, dialogue: b.dialogue === 'none' ? 'none' : 'talk',
  };
  if (o.idea.length < 5) return res.status(400).json({ error: 'Hãy viết ý tưởng phim (ít nhất vài chữ).' });
  const brief = film.buildBrief(o);
  const { insertId } = await db.run('INSERT INTO studio_jobs (user_id, model_key, kind, points, status) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, 'muse-film', 'musefilm', 1, 'processing']);
  try {
    const result = film.parse(await studio.runText(cfg, brief.system, brief.user), o);
    await db.run("UPDATE studio_jobs SET status = 'completed' WHERE id = ?", [insertId]);
    res.json({ result, used: await studio.usedPoints(req.user.id) });
  } catch (err) {
    if (err.detail) console.warn('[muse] script', err.detail);
    await db.run("UPDATE studio_jobs SET status = 'failed', error = ? WHERE id = ?", [String(err.message).slice(0, 480), insertId]);
    res.status(err.status && err.status >= 400 && err.status < 600 ? err.status : 502).json({ error: err.message });
  }
});

router.get('/huong-dan', requireAuth, guard, (req, res) => {
  res.render('muse-guide', { title: 'Hướng dẫn Muse Studio' });
});

router.get('/tai-bo-cai', requireAuth, guard, (req, res) => {
  res.download(INSTALLER, 'Muse-Studio-Cai-Dat.zip');
});

module.exports = router;
