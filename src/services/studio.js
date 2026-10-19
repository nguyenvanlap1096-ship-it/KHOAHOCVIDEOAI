// Xưởng Kịch bản AI: học viên viết kịch bản + prompt ảnh/video bằng AI của khoá học.
// Chỉ dùng AI MIỄN PHÍ: key Google AI Studio gói miễn phí (không bật thanh toán) do quản trị dán; học viên không thấy key.
// Gói miễn phí giới hạn số lần gọi mỗi phút/ngày nên mỗi học viên có số lượt viết mỗi tháng.
const db = require('../db');
const { getSettings } = require('./settings');

const GOOGLE_BASE = process.env.GOOGLE_AI_BASE || 'https://generativelanguage.googleapis.com/v1beta'; // biến môi trường chỉ dùng khi chạy thử
const DEFAULT_GOOGLE_MODEL = 'gemini-3.5-flash';

// Các phần quản trị bật/tắt được với học viên (quản trị luôn thấy đủ).
const FEATURES = [
  { key: 'video', label: 'Kịch bản video' },
  { key: 'image', label: 'Kịch bản ảnh' },
];

function studioConfig(s) {
  const fkeys = FEATURES.map(f => f.key);
  const googleKey = s.studio_google_key || '';
  return {
    open: s.studio_open !== '0',
    features: s.studio_features ? s.studio_features.split(',').filter(k => fkeys.includes(k)) : fkeys,
    switchedOn: s.studio_enabled === '1',
    enabled: s.studio_enabled === '1' && Boolean(googleKey),
    provider: googleKey ? 'google' : '',
    googleKey,
    googleModel: (s.studio_google_model || DEFAULT_GOOGLE_MODEL).trim(),
    who: s.studio_who === 'paid' ? 'paid' : 'all',
    points: Math.max(0, Number(s.studio_points) || 0),
  };
}

// Đầu tháng theo giờ Việt Nam (UTC+7), trả về dạng UTC như cột created_at trong CSDL.
function monthStart() {
  const vn = new Date(Date.now() + 7 * 3600000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), 1) - 7 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
}

async function usedPoints(userId) {
  const r = await db.get(
    "SELECT COALESCE(SUM(points), 0) AS n FROM studio_jobs WHERE user_id = ? AND status <> 'failed' AND created_at >= ?",
    [userId, monthStart()],
  );
  return Number(r.n) || 0;
}

// Lượt viết của một người: quản trị không giới hạn; học viên dùng mức riêng (nếu đặt) hoặc mức chung.
async function quotaFor(user, cfg) {
  if (!cfg.enabled) return { allowed: false, reason: 'off', quota: 0, used: 0 };
  if (user.role === 'admin') return { allowed: true, unlimited: true, quota: 0, used: await usedPoints(user.id) };
  if (cfg.who === 'paid') {
    const paid = await db.get('SELECT 1 AS x FROM access WHERE user_id = ?', [user.id]);
    if (!paid) return { allowed: false, reason: 'paid', quota: 0, used: 0 };
  }
  const row = await db.get('SELECT studio_quota FROM users WHERE id = ?', [user.id]);
  const quota = row && row.studio_quota != null ? Number(row.studio_quota) : cfg.points;
  return { allowed: quota > 0, reason: quota > 0 ? '' : 'zero', quota, used: await usedPoints(user.id) };
}

function featuresFor(user, cfg) {
  if (user.role === 'admin') return FEATURES.map(f => f.key);
  return cfg.open ? cfg.features : [];
}

async function houseInfo(user) {
  const cfg = studioConfig(await getSettings());
  const q = await quotaFor(user, cfg);
  return {
    enabled: q.allowed, reason: q.reason, quota: q.quota, used: q.used, unlimited: Boolean(q.unlimited),
    features: featuresFor(user, cfg), open: cfg.open, offFeatures: FEATURES.filter(f => !cfg.features.includes(f.key)).map(f => f.label),
  };
}

function fail(message, status, detail) {
  return Object.assign(new Error(message), { status, detail });
}

// Lỗi của nhà cung cấp AI đổi thành câu dễ hiểu cho học viên (không lộ chuyện key của trung tâm).
function friendly(status, m) {
  const low = String(m || '').toLowerCase();
  if (status === 400 && (low.includes('api key') || low.includes('api_key'))) return 'AI của khoá học đang bảo trì. Báo giảng viên giúp nhé.';
  if (status === 401 || status === 403 || low.includes('invalid credentials')) return 'AI của khoá học đang bảo trì. Báo giảng viên giúp nhé.';

  if (status === 404) return 'Model AI của khoá học không còn dùng được. Báo giảng viên sửa mã model.';
  if (status === 429) return 'AI miễn phí của khoá học đang quá tải (giới hạn của gói miễn phí). Đợi 1–2 phút, hoặc dùng nút "Nhờ Gemini/ChatGPT viết".';
  return 'AI đang bận. Thử lại sau ít phút.';
}

async function call(url, opt) {
  let r;
  try {
    r = await fetch(url, { ...opt, signal: AbortSignal.timeout(120000) });
  } catch (err) {
    throw fail('Không kết nối được tới AI. Thử lại sau ít phút.', 502, String(err));
  }
  const txt = await r.text();
  let j = {};
  try { j = JSON.parse(txt); } catch { /* không phải JSON */ }
  if (!r.ok) {
    const m = (j.error && (j.error.message || (typeof j.error === 'string' && j.error))) || (typeof j.detail === 'string' ? j.detail : '') || txt.slice(0, 300);
    throw Object.assign(fail(friendly(r.status, m), r.status >= 500 ? 502 : r.status === 429 ? 429 : 400, `${r.status} ${m}`), { upstream: r.status });
  }
  return j;
}

// media: [{ mime, buffer }] — ảnh / video tham chiếu cho Gemini xem. Ảnh và video nhỏ gửi thẳng trong yêu cầu;
// video lớn tải qua Files API của Google (tự xoá sau khi viết xong, Google cũng tự xoá sau 48 giờ).
const INLINE_MAX = 14 * 1024 * 1024;
async function mediaParts(cfg, media) {
  const parts = [], uploaded = [];
  for (const m of media) {
    if (m.buffer.length <= INLINE_MAX) parts.push({ inlineData: { mimeType: m.mime, data: m.buffer.toString('base64') } });
    else {
      const f = await uploadFile(cfg, m);
      uploaded.push(f.name);
      parts.push({ fileData: { mimeType: m.mime, fileUri: f.uri } });
    }
  }
  return { parts, uploaded };
}
async function uploadFile(cfg, m) {
  const UPLOAD = GOOGLE_BASE.replace(/\/v1beta$/, '/upload/v1beta');
  let r;
  try {
    r = await fetch(`${UPLOAD}/files`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': cfg.googleKey, 'X-Goog-Upload-Protocol': 'resumable', 'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(m.buffer.length), 'X-Goog-Upload-Header-Content-Type': m.mime, 'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: { display_name: 'tham-chieu' } }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (err) { throw fail('Không tải được video tham chiếu lên AI. Thử lại.', 502, String(err)); }
  const url = r.headers.get('x-goog-upload-url');
  if (!r.ok || !url) throw fail(friendly(r.status, await r.text()), 502, `upload start ${r.status}`);
  const done = await call(url, {
    method: 'POST',
    headers: { 'Content-Length': String(m.buffer.length), 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize' },
    body: m.buffer,
  });
  let f = done.file || {};
  const t0 = Date.now();
  while (f.state === 'PROCESSING' && Date.now() - t0 < 120000) {
    await new Promise(res => setTimeout(res, 3000));
    f = await call(`${GOOGLE_BASE}/${f.name}`, { headers: { 'x-goog-api-key': cfg.googleKey } });
  }
  if (f.state === 'FAILED' || !f.uri) throw fail('AI không đọc được video tham chiếu. Thử video khác (MP4, dưới 1 phút).', 400, JSON.stringify(f).slice(0, 200));
  if (f.state === 'PROCESSING') throw fail('Video tham chiếu xử lý quá lâu. Thử video ngắn hơn.', 504);
  return f;
}

async function googleText(cfg, system, user, media = []) {
  const { parts, uploaded } = media.length ? await mediaParts(cfg, media) : { parts: [], uploaded: [] };
  try {
    const j = await call(`${GOOGLE_BASE}/models/${encodeURIComponent(cfg.googleModel)}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': cfg.googleKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [...parts, { text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: media.length ? 0.4 : 0.8 },
      }),
    });
    const cand = (j.candidates || [])[0];
    const text = cand && cand.content && (cand.content.parts || []).map(p => p.text || '').join('');
    if (!text) throw fail('AI không trả về nội dung (có thể bị bộ lọc an toàn chặn). Thử diễn đạt lại ý tưởng.', 502, JSON.stringify(j).slice(0, 300));
    return text;
  } finally {
    for (const name of uploaded) fetch(`${GOOGLE_BASE}/${name}`, { method: 'DELETE', headers: { 'x-goog-api-key': cfg.googleKey } }).catch(() => {});
  }
}

function runText(cfg, system, user, media) {
  return googleText(cfg, system, user, media);
}

// Kiểm tra key cho trang quản trị.
async function checkKey(cfg) {
  if (cfg.provider === 'google') {
    const j = await call(`${GOOGLE_BASE}/models?pageSize=200`, { headers: { 'x-goog-api-key': cfg.googleKey } });
    const names = (j.models || []).map(m => String(m.name).replace('models/', ''));
    return names.includes(cfg.googleModel)
      ? `Key Google hoạt động, có model ${cfg.googleModel}.`
      : `Key Google hoạt động nhưng KHÔNG thấy model "${cfg.googleModel}". Một số model đang có: ${names.filter(n => /flash|pro/.test(n)).slice(0, 6).join(', ')}.`;
  }
  throw fail('Chưa có key.', 400);
}

module.exports = { FEATURES, DEFAULT_GOOGLE_MODEL, studioConfig, quotaFor, featuresFor, houseInfo, usedPoints, monthStart, runText, checkKey };
