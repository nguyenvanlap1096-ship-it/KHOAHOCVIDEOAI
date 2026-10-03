// Cài đặt website (Zalo hỗ trợ...) lưu trong bảng settings, có cache trong bộ nhớ.
const db = require('../db');

const DEFAULTS = {
  site_name: '',
  site_tagline: 'Học trực tuyến',
  site_logo: '',
  hero_title: 'Làm chủ Video AI từ A–Z',
  hero_text: 'Học từng bước từ cơ bản đến nâng cao: lên ý tưởng, viết prompt, tạo hình ảnh, dựng video và hoàn thiện sản phẩm bằng AI.',
  zalo_phone: '',
  zalo_link: '',
  zalo_qr: '',
  support_title: 'Hỗ trợ qua Zalo',
  support_text: 'Cần tư vấn khóa học hoặc gặp sự cố khi học? Nhắn Zalo cho chúng tôi.',
  support_hours: '8:00 – 22:00 hằng ngày',
  premium_sales_open: '1',
  pay_bank_bin: '',
  pay_account_no: '',
  pay_account_name: '',
  pay_prefix: 'BKAI',
  bundle_enabled: '',
  bundle_title: 'Trọn bộ khóa chuyên sâu',
  bundle_price: '',
  bundle_description: 'Mở toàn bộ khóa chuyên sâu hiện có và các khóa chuyên sâu ra mắt sau này.',
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

// Thông tin hỗ trợ cho khung/nút Zalo; hiện khi có số điện thoại, link hoặc ảnh QR (null nếu chưa có gì).
function supportInfo(s) {
  const phone = String(s.zalo_phone || '').replace(/\D/g, '');
  const url = s.zalo_link || (phone ? `https://zalo.me/${phone}` : '');
  if (!url && !s.zalo_qr) return null;
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

// Tên, khẩu hiệu và logo hiển thị trên website (tên rỗng thì dùng SITE_NAME trong biến môi trường).
function siteInfo(s, fallbackName) {
  return {
    name: s.site_name || fallbackName,
    tagline: s.site_tagline,
    heroTitle: s.hero_title || DEFAULTS.hero_title,
    heroText: s.hero_text || DEFAULTS.hero_text,
    logo: s.site_logo ? `/uploads/images/${s.site_logo}` : '/img/logo.svg',
  };
}

module.exports = { DEFAULTS, getSettings, setSettings, supportInfo, siteInfo };
