// Muse Studio trên web khoá học: giao diện tạo video/ảnh nói chuyện với bộ chạy Muse2API cài trên máy học viên
// (http://127.0.0.1:18610). Máy chủ không gọi muse.ai, không giữ key hay cookie của học viên — chỉ quyết định ai được vào trang.
const db = require('../db');
const { getSettings } = require('./settings');

function museConfig(s) {
  return { open: s.muse_open !== '0', autoNew: s.muse_auto_new === '1' };
}

// Quản trị luôn vào được; học viên cần công tắc chung đang mở và được bật riêng.
// req.user đã có muse_enabled (nạp sẵn khi đăng nhập) nên thường không phải hỏi lại CSDL.
async function museAccess(user, settings) {
  if (!user) return { allowed: false, reason: 'login' };
  if (user.role === 'admin') return { allowed: true, admin: true };
  const cfg = museConfig(settings || await getSettings());
  if (!cfg.open) return { allowed: false, reason: 'closed' };
  const enabled = user.muse_enabled != null ? user.muse_enabled
    : ((await db.get('SELECT muse_enabled FROM users WHERE id = ?', [user.id])) || {}).muse_enabled;
  return Number(enabled) === 1 ? { allowed: true } : { allowed: false, reason: 'off' };
}

module.exports = { museConfig, museAccess };
