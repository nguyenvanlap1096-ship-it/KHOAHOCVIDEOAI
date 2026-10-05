const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

function pad(n) {
  return String(n).padStart(2, '0');
}

// 662 -> "11:02", 3725 -> "1:02:05"
function fmtDuration(sec) {
  sec = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// 13500 -> "3 giờ 45 phút"
function fmtTotal(sec) {
  if ((Number(sec) || 0) > 0 && Number(sec) < 30) return 'dưới 1 phút';
  const mins = Math.round((Number(sec) || 0) / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} phút`;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

// "11:02" | "1:02:05" | "90" -> giây; chuỗi rỗng -> 0; sai định dạng -> null
function parseDuration(input) {
  const s = String(input || '').trim();
  if (!s) return 0;
  if (!/^\d+(:\d{1,2}){0,2}$/.test(s)) return null;
  return s.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0);
}

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

// Nhận link YouTube ở mọi dạng phổ biến (watch, youtu.be, embed, shorts) hoặc ID 11 ký tự.
function youtubeId(input) {
  const s = String(input || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  let url;
  try { url = new URL(s); } catch { return null; }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') || (url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/) || [])[1];
  }
  return id && /^[\w-]{11}$/.test(id.slice(0, 11)) ? id.slice(0, 11) : null;
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase();
}

function lines(text) {
  return String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

function paragraphs(text) {
  return String(text || '').split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean);
}

// Mỗi dòng: "Tiêu đề | https://..." hoặc chỉ URL. Chỉ chấp nhận http(s).
function parseResources(text) {
  return lines(text).map(line => {
    const [a, b] = line.split('|').map(x => x.trim());
    const url = b || a;
    const title = b ? a : url;
    return /^https?:\/\//i.test(url) ? { title, url } : null;
  }).filter(Boolean);
}

// Thời điểm lưu trong CSDL (giờ UTC) → giờ Việt Nam, ví dụ "03/10/2026 12:45".
function fmtDateTime(value) {
  const t = Date.parse(String(value || '').replace(' ', 'T') + (/[zZ+]/.test(String(value)) ? '' : 'Z'));
  if (!Number.isFinite(t)) return '';
  return new Date(t).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function coursePercent(pctSum, lessonCount) {
  return lessonCount ? Math.min(100, Math.round(Number(pctSum || 0) / lessonCount)) : 0;
}

// Chữ hiện trên ảnh bìa khi chưa có ảnh: số module ("Module 04 — ..." → "04") hoặc chữ cái đầu.
function coverLabel(title) {
  const m = String(title || '').match(/^\s*module\s+(\d+)/i);
  return m ? m[1] : String(title || '?').trim().charAt(0).toUpperCase();
}

// Tỉ lệ khung hình video hỗ trợ (rộng:cao).
const VIDEO_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '4:5', '21:9'];

// Đổi kích thước video thật (vd 1080×1920) sang tỉ lệ chuẩn gần nhất (vd "9:16").
function nearestRatio(width, height) {
  const w = Number(width);
  const hgt = Number(height);
  if (!(w > 0 && hgt > 0)) return '';
  const target = w / hgt;
  return VIDEO_RATIOS.reduce((best, r) => {
    const [a, b] = r.split(':').map(Number);
    const [c, d] = best.split(':').map(Number);
    return Math.abs(Math.log(a / b / target)) < Math.abs(Math.log(c / d / target)) ? r : best;
  }, VIDEO_RATIOS[0]);
}

// "9:16" → { w: 9, h: 16, portrait: true }; mặc định 16:9.
function ratioParts(ratio) {
  const [w, hgt] = (VIDEO_RATIOS.includes(ratio) ? ratio : '16:9').split(':').map(Number);
  return { w, h: hgt, portrait: hgt > w };
}

function imageUrl(filename) {
  return filename ? `/uploads/images/${filename}` : null;
}

// Ảnh đại diện của video: thumbnail tự upload → ảnh YouTube → ảnh bìa khóa học.
function lessonThumb(lesson) {
  if (lesson.thumbnail) return imageUrl(lesson.thumbnail);
  if (lesson.video_type === 'youtube' && lesson.video_ref) return `https://i.ytimg.com/vi/${lesson.video_ref}/hqdefault.jpg`;
  return imageUrl(lesson.cover_image);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Escape nội dung prompt và tô sáng các biến dạng [Tên sản phẩm] để người dùng biết cần thay.
function highlightPrompt(text) {
  return escapeHtml(text).replace(/\[[^\]\n]{1,80}\]/g, m => `<mark>${m}</mark>`);
}

function daysSince(dateStr) {
  const t = Date.parse(String(dateStr || '').replace(' ', 'T') + (/[zZ+]/.test(String(dateStr)) ? '' : 'Z'));
  return Number.isFinite(t) ? (Date.now() - t) / 86400000 : Infinity;
}

// Nhãn cho video: "Mới" nếu thêm trong 7 ngày, "Cập nhật" nếu vừa thay video.
function freshness(item) {
  if (daysSince(item.created_at) <= 7) return 'Mới';
  if (daysSince(item.updated_at) <= 7) return 'Cập nhật';
  return null;
}

module.exports = {
  LEVELS, fmtDuration, fmtTotal, parseDuration, slugify, youtubeId,
  initials, lines, paragraphs, parseResources, coursePercent, fmtDateTime,
  VIDEO_RATIOS, nearestRatio, ratioParts, coverLabel, imageUrl, lessonThumb, escapeHtml, highlightPrompt, freshness,
};
