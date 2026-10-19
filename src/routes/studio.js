// Xưởng Kịch bản AI trên website: trang /studio và API /api/studio/* (viết kịch bản bằng AI của khoá học).
const express = require('express');
const multer = require('multer');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getSettings } = require('../services/settings');
const studio = require('../services/studio');
const scripts = require('../../public/js/studio-scripts');

const page = express.Router();
const api = express.Router();

// Học viên có thể dán key Google miễn phí của mình, gọi thẳng từ trình duyệt nên mở thêm địa chỉ của Google.
const STUDIO_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data:",
  "connect-src 'self' https://generativelanguage.googleapis.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

page.get('/', requireAuth, async (req, res) => {
  const house = await studio.houseInfo(req.user);
  if (!house.features.length) {
    return res.status(403).render('error', {
      title: 'Xưởng Kịch bản AI đang tạm đóng', status: 403,
      message: 'Xưởng Kịch bản AI đang tạm đóng. Giảng viên sẽ mở lại sớm — bạn quay lại sau nhé.',
    });
  }
  res.setHeader('Content-Security-Policy', STUDIO_CSP);
  res.render('studio', {
    title: 'Xưởng Kịch bản AI',
    boot: { house, csrf: res.locals.csrf, user: { name: req.user.name, admin: req.user.role === 'admin' } },
  });
});

api.use(requireAuth);

// Ảnh / video tham chiếu: tối đa 4 ảnh (8 MB/ảnh) + 1 video (50 MB), chỉ giữ trong bộ nhớ khi đang viết.
const IMG_MAX = 8 * 1024 * 1024, VIDEO_MAX = 50 * 1024 * 1024;
const refUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: VIDEO_MAX, files: 5 } }).array('refs', 5);
function acceptRefs(req, res, next) {
  if (!req.is('multipart/form-data')) return next();
  refUpload(req, res, err => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Video tham chiếu quá lớn (tối đa 50 MB). Cắt ngắn video rồi thử lại.' : err.code === 'LIMIT_FILE_COUNT' ? 'Tối đa 4 ảnh và 1 video tham chiếu.' : 'Không nhận được file tham chiếu.' });
    try { req.body = Object.assign({}, JSON.parse((req.body && req.body.payload) || '{}')); } catch { req.body = {}; }
    next();
  });
}
function readRefs(files) {
  const images = [], videos = [];
  for (const f of files || []) {
    if (/^image\/(png|jpe?g|webp)$/.test(f.mimetype)) {
      if (f.size > IMG_MAX) throw Object.assign(new Error('Ảnh tham chiếu quá lớn (tối đa 8 MB mỗi ảnh).'), { status: 400 });
      images.push({ mime: f.mimetype, buffer: f.buffer });
    } else if (/^video\/(mp4|quicktime|webm|x-m4v|mpeg)$/.test(f.mimetype)) {
      videos.push({ mime: f.mimetype === 'video/x-m4v' ? 'video/mp4' : f.mimetype, buffer: f.buffer });
    } else throw Object.assign(new Error('Chỉ nhận ảnh JPG/PNG/WebP và video MP4/MOV/WebM.'), { status: 400 });
  }
  if (images.length > 4 || videos.length > 1) throw Object.assign(new Error('Tối đa 4 ảnh và 1 video tham chiếu.'), { status: 400 });
  return { images, videos };
}

// Viết kịch bản video (kind=video) hoặc bộ ảnh (kind=image). Máy chủ tự ghép lệnh từ bộ hướng dẫn chung.
// Có ảnh/video tham chiếu thì Gemini xem trực tiếp rồi viết giống hoặc lấy cảm hứng.
api.post('/script', acceptRefs, async (req, res) => {
  const b = req.body || {};
  let refs;
  try { refs = readRefs(req.files); } catch (err) { return res.status(err.status || 400).json({ error: err.message }); }
  const kind = b.kind === 'image' ? 'image' : 'video';
  const cfg = studio.studioConfig(await getSettings());
  const have = studio.featuresFor(req.user, cfg);
  if (!have.length) return res.status(403).json({ error: 'Xưởng Kịch bản AI đang tạm đóng.' });
  if (!have.includes(kind)) return res.status(403).json({ error: kind === 'image' ? 'Kịch bản ảnh đang tạm tắt.' : 'Kịch bản video đang tạm tắt.' });
  const q = await studio.quotaFor(req.user, cfg);
  if (!q.allowed) {
    const msg = q.reason === 'paid' ? 'AI viết kịch bản dành cho học viên khoá chuyên sâu. Bạn vẫn dùng được nút "Nhờ Gemini/ChatGPT viết".'
      : q.reason === 'off' ? 'Khoá học chưa bật AI viết kịch bản. Dùng nút "Nhờ Gemini/ChatGPT viết" (miễn phí) hoặc dán key Google miễn phí của bạn trong Cài đặt.'
        : 'Tài khoản của bạn chưa được cấp lượt viết. Dùng nút "Nhờ Gemini/ChatGPT viết".';
    return res.status(403).json({ error: msg });
  }
  if (!q.unlimited && q.used + 1 > q.quota) {
    return res.status(402).json({ error: `Bạn đã dùng hết ${q.quota} lượt viết tháng này. Dùng nút "Nhờ Gemini/ChatGPT viết" (miễn phí) hoặc dán key Google miễn phí của bạn trong Cài đặt.` });
  }
  const idea = String(b.idea || '').trim().slice(0, 3000);
  const hasRef = refs.images.length + refs.videos.length > 0;
  if (idea.length < 5 && !hasRef) return res.status(400).json({ error: 'Hãy viết ý tưởng (ít nhất vài chữ) hoặc tải ảnh/video tham chiếu.' });
  const common = {
    industry: b.industry, purpose: b.purpose, target: b.target, idea,
    ref: hasRef ? { video: refs.videos.length > 0, images: refs.images.length, mode: b.refMode === 'inspire' ? 'inspire' : 'copy' } : null,
    brand: String(b.brand || '').trim().slice(0, 120), style: String(b.style || '').trim().slice(0, 300),
  };
  const brief = kind === 'image'
    ? scripts.buildImageBrief({ ...common, count: b.count, ratio: b.ratio })
    : scripts.buildBrief({ ...common, voice: b.voice, scenes: b.scenes, dur: b.dur, ratio: ['16:9', '9:16', '1:1'].includes(b.ratio) ? b.ratio : '16:9' });

  const running = await db.get("SELECT COUNT(*) AS n FROM studio_jobs WHERE user_id = ? AND status = 'processing' AND created_at >= ?",
    [req.user.id, new Date(Date.now() - 5 * 60000).toISOString().slice(0, 19).replace('T', ' ')]);
  if (Number(running.n) >= 2) return res.status(429).json({ error: 'Bạn đang có 2 kịch bản đang viết. Đợi xong rồi viết tiếp.' });

  const { insertId } = await db.run(
    'INSERT INTO studio_jobs (user_id, model_key, kind, points, status) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, String(brief.target.key), kind, 1, 'processing'],
  );
  try {
    const text = await studio.runText(cfg, brief.system, brief.user, [...refs.videos, ...refs.images]);
    const result = kind === 'image' ? scripts.parseImageSet(text) : scripts.parseScript(text);
    await db.run("UPDATE studio_jobs SET status = 'completed' WHERE id = ?", [insertId]);
    res.json({ result, used: await studio.usedPoints(req.user.id) });
  } catch (err) {
    if (err.detail) console.warn('[studio] script', err.detail);
    await db.run("UPDATE studio_jobs SET status = 'failed', error = ? WHERE id = ?", [String(err.message).slice(0, 480), insertId]);
    res.status(err.status && err.status >= 400 && err.status < 600 ? err.status : 502).json({ error: err.message });
  }
});

api.get('/me', async (req, res) => {
  res.json(await studio.houseInfo(req.user));
});

module.exports = { page, api };
