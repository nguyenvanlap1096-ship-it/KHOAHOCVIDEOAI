// Cài đặt website (Zalo hỗ trợ...) lưu trong bảng settings, có cache trong bộ nhớ.
const db = require('../db');

const DEFAULTS = {
  zalo_phone: '',
  zalo_link: '',
  zalo_qr: '',
  support_title: 'Hỗ trợ qua Zalo',
  support_text: 'Cần tư vấn khóa học hoặc gặp sự cố khi học? Nhắn Zalo cho chúng tôi.',
  support_hours: '8:00 – 22:00 hằng ngày',
};

let cache = null;

async function getSettings() {
  if (!cache) {
    const rows = await db.all('SELECT name, value FROM settings');
    cache = { ...DEFAULTS, ...Object.fromEntries(rows.map(r => [r.name, r.value ?? ''])) };
  }
  return cache;
}

async function setSettings(values) {
  for (const [name, value] of Object.entries(values)) {
    const { changes } = await db.run('UPDATE settings SET value = ? WHERE name = ?', [value, name]);
    if (!changes) {
      const exists = await db.get('SELECT 1 AS x FROM settings WHERE name = ?', [name]);
      if (!exists) await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', [name, value]);
    }
  }
  cache = null;
}

// Thông tin hỗ trợ dùng cho nút Zalo nổi; null nếu chưa cấu hình.
function supportInfo(s) {
  const phone = String(s.zalo_phone || '').replace(/\D/g, '');
  const url = s.zalo_link || (phone ? `https://zalo.me/${phone}` : '');
  if (!url) return null;
  return {
    url,
    phone,
    phoneDisplay: phone.replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3'),
    title: s.support_title,
    text: s.support_text,
    hours: s.support_hours,
    qr: s.zalo_qr,
  };
}

module.exports = { DEFAULTS, getSettings, setSettings, supportInfo };
