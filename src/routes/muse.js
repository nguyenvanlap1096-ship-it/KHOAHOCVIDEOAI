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
    idea: String(b.idea || '').trim().slice(0, 3000), cast: String(b.cast || '').trim().slice(0, 3000), castFixed: b.castFixed === true,
    castNames: String(b.castNames || '').slice(0, 300), productName: String(b.productName || '').slice(0, 60),
    scenes: b.scenes, style: b.style, ratio: b.ratio, dialogue: b.dialogue === 'none' ? 'none' : 'talk',
    genre: ['film', 'ad', 'affiliate', 'psa'].includes(b.genre) ? b.genre : 'film', product: String(b.product || '').trim().slice(0, 1500), productPhoto: b.productPhoto === true,
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

// AI khoá học (Gemini) xem ảnh tham chiếu ở bước 1 và tả ngoại hình bằng tiếng Anh, để kịch bản + video bám đúng ảnh.
// Ảnh do trình duyệt thu nhỏ trước khi gửi; máy chủ không lưu ảnh.
const DESCRIBE_SYSTEM = `You describe reference images for an AI video generator so it can recreate the exact same character or product in every shot.
For each image write look_en: 25-40 English words, concrete and visual only. Person or animal: apparent age, gender, build, face shape, skin tone, eyes, exact hair (length, style, color), exact outfit with colors and materials, accessories, one signature detail. Product: product type, exact shape and proportions, exact colors, material and finish, packaging, label/logo colors and position, distinctive parts. Never invent details you cannot see. If the image shows several views of the same subject, describe the subject once.
Return ONLY JSON: {"items":[{"name":"...","look_en":"..."}]} in the same order as the images.`;
router.post('/api/describe', requireAuth, express.json({ limit: '6mb' }), async (req, res) => {
  if (!(await museAccess(req.user)).allowed) return res.status(403).json({ error: 'Tài khoản chưa được mở Muse Studio.' });
  const cfg = studio.studioConfig(await getSettings());
  const q = await studio.quotaFor(req.user, cfg);
  if (!q.allowed) return res.status(403).json({ error: 'AI của khoá học chưa bật cho bạn.', noAi: true });
  if (!q.unlimited && q.used + 1 > q.quota) return res.status(402).json({ error: `Bạn đã dùng hết ${q.quota} lượt AI tháng này.`, noAi: true });
  const items = (Array.isArray((req.body || {}).items) ? req.body.items : []).slice(0, 5);
  const media = [], lines = [];
  for (const [i, it] of items.entries()) {
    const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(it.image || ''));
    if (!m) return res.status(400).json({ error: 'Ảnh tham chiếu không hợp lệ (chỉ nhận JPG, PNG, WEBP).' });
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > 3 * 1024 * 1024) return res.status(400).json({ error: 'Ảnh tham chiếu quá lớn.' });
    media.push({ mime: m[1], buffer });
    lines.push(`Image ${i + 1}: ${it.kind === 'product' ? 'PRODUCT' : 'CHARACTER'} named "${String(it.name || '').slice(0, 40)}"${it.desc ? `. Owner's note (Vietnamese, trust it for things not visible): ${String(it.desc).slice(0, 300)}` : ''}`);
  }
  if (!media.length) return res.status(400).json({ error: 'Chưa có ảnh nào.' });
  const { insertId } = await db.run('INSERT INTO studio_jobs (user_id, model_key, kind, points, status) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, 'muse-describe', 'musedesc', 1, 'processing']);
  try {
    const text = await studio.runText(cfg, DESCRIBE_SYSTEM, lines.join('\n'), media);
    const j = JSON.parse(String(text).replace(/^```(?:json)?\s*|```\s*$/g, ''));
    const out = (Array.isArray(j.items) ? j.items : []).slice(0, media.length).map(x => ({ name: String(x.name || '').slice(0, 40), look_en: String(x.look_en || '').replace(/\s+/g, ' ').trim().slice(0, 400) }));
    await db.run("UPDATE studio_jobs SET status = 'completed' WHERE id = ?", [insertId]);
    res.json({ items: out, used: await studio.usedPoints(req.user.id) });
  } catch (err) {
    if (err.detail) console.warn('[muse] describe', err.detail);
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
