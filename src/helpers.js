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

function coursePercent(pctSum, lessonCount) {
  return lessonCount ? Math.min(100, Math.round(Number(pctSum || 0) / lessonCount)) : 0;
}

module.exports = {
  LEVELS, fmtDuration, fmtTotal, parseDuration, slugify, youtubeId,
  initials, lines, paragraphs, parseResources, coursePercent,
};
