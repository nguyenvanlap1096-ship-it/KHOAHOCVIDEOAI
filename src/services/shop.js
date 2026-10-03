// Khóa chuyên sâu trả phí: quyền truy cập, đơn hàng, cấu hình thanh toán.
const db = require('../db');

const ORDER_STATUS = { pending: 'Chờ xác nhận', paid: 'Đã thanh toán', cancelled: 'Đã hủy' };

function fmtVnd(n) {
  return `${Math.round(Number(n) || 0).toLocaleString('vi-VN')}đ`;
}

function paymentConfig(s) {
  return {
    bin: s.pay_bank_bin || '',
    account: String(s.pay_account_no || '').replace(/\s/g, ''),
    accountName: s.pay_account_name || '',
    prefix: (String(s.pay_prefix || 'BKAI').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'BKAI').slice(0, 8),
    ready: Boolean(s.pay_bank_bin && s.pay_account_no),
  };
}

function bundleConfig(s) {
  const price = Number(s.bundle_price) || 0;
  return {
    enabled: s.bundle_enabled === '1' && price > 0,
    title: s.bundle_title || 'Trọn bộ khóa chuyên sâu',
    description: s.bundle_description || '',
    price,
  };
}

// Admin luôn vào được; khóa miễn phí ai cũng vào được (khóa chuyên sâu cần mua lẻ hoặc gói trọn bộ).
async function hasAccess(user, course) {
  if (!course || !Number(course.is_premium)) return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Boolean(await db.get(
    "SELECT 1 AS x FROM access WHERE user_id = ? AND (scope = 'bundle' OR (scope = 'course' AND course_id = ?))",
    [user.id, course.id],
  ));
}

// Danh sách id khóa chuyên sâu người dùng đã mở ({ all: true } nếu có gói trọn bộ hoặc là admin).
async function accessSummary(user) {
  if (!user) return { all: false, ids: new Set() };
  if (user.role === 'admin') return { all: true, ids: new Set() };
  const rows = await db.all('SELECT scope, course_id FROM access WHERE user_id = ?', [user.id]);
  return {
    all: rows.some(r => r.scope === 'bundle'),
    ids: new Set(rows.filter(r => r.scope === 'course').map(r => Number(r.course_id))),
  };
}

async function grantAccess(userId, scope, courseId, orderId) {
  const cid = scope === 'course' ? Number(courseId) : 0;
  const exists = await db.get('SELECT 1 AS x FROM access WHERE user_id = ? AND scope = ? AND course_id = ?', [userId, scope, cid]);
  if (!exists) {
    await db.run('INSERT INTO access (user_id, scope, course_id, order_id) VALUES (?, ?, ?, ?)', [userId, scope, cid, orderId]);
  }
}

async function revokeAccess(order) {
  const cid = order.item_type === 'course' ? Number(order.course_id) : 0;
  await db.run('DELETE FROM access WHERE user_id = ? AND scope = ? AND course_id = ?', [order.user_id, order.item_type, cid]);
}

async function pendingOrderFor(userId, itemType, courseId) {
  return db.get(
    `SELECT * FROM orders WHERE user_id = ? AND item_type = ? AND status = 'pending'
       AND ${itemType === 'course' ? 'course_id = ?' : 'course_id IS NULL'}
     ORDER BY id DESC LIMIT 1`,
    itemType === 'course' ? [userId, itemType, courseId] : [userId, itemType],
  );
}

async function countPendingOrders() {
  return Number((await db.get("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'")).n);
}

module.exports = {
  ORDER_STATUS, fmtVnd, paymentConfig, bundleConfig, hasAccess, accessSummary,
  grantAccess, revokeAccess, pendingOrderFor, countPendingOrders,
};
