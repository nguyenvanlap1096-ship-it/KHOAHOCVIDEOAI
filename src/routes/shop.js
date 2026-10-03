// Mua khóa chuyên sâu: tạo đơn → trang thanh toán VietQR → học viên báo đã chuyển → admin xác nhận.
const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getSettings } = require('../services/settings');
const { qrSvg, bankName } = require('../services/vietqr');
const {
  ORDER_STATUS, paymentConfig, bundleConfig, hasAccess, accessSummary, pendingOrderFor,
} = require('../services/shop');

router.post('/checkout', requireAuth, async (req, res) => {
  const settings = await getSettings();
  const pay = paymentConfig(settings);
  let item;
  if (req.body.item === 'bundle') {
    const bundle = bundleConfig(settings);
    if (!bundle.enabled) {
      req.flash('error', 'Gói trọn bộ hiện chưa mở bán.');
      return res.redirect('/');
    }
    if ((await accessSummary(req.user)).all) {
      req.flash('info', 'Bạn đã sở hữu gói trọn bộ.');
      return res.redirect('/');
    }
    item = { type: 'bundle', courseId: null, title: bundle.title, amount: bundle.price, back: '/' };
  } else {
    const course = await db.get('SELECT * FROM courses WHERE slug = ? AND published = 1 AND is_premium = 1', [String(req.body.course || '')]);
    if (!course) {
      req.flash('error', 'Không tìm thấy khóa học.');
      return res.redirect('/');
    }
    if (await hasAccess(req.user, course)) return res.redirect(`/learn/${course.slug}`);
    if (!(Number(course.price) > 0)) {
      req.flash('error', 'Khóa học này chưa có giá bán.');
      return res.redirect(`/courses/${course.slug}`);
    }
    item = { type: 'course', courseId: course.id, title: course.title, amount: Number(course.price), back: `/courses/${course.slug}` };
  }
  if (!pay.ready) {
    req.flash('error', 'Website chưa cài đặt tài khoản nhận thanh toán. Vui lòng liên hệ hỗ trợ qua Zalo.');
    return res.redirect(item.back);
  }

  // Đã có đơn đang chờ cho cùng mục này thì dùng lại, tránh tạo nhiều đơn trùng.
  const existing = await pendingOrderFor(req.user.id, item.type, item.courseId);
  if (existing) return res.redirect(`/orders/${existing.id}`);

  const { insertId } = await db.run(
    'INSERT INTO orders (user_id, item_type, course_id, item_title, amount) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, item.type, item.courseId, item.title, item.amount],
  );
  await db.run('UPDATE orders SET transfer_code = ? WHERE id = ?', [`${pay.prefix}${insertId}`, insertId]);
  res.redirect(`/orders/${insertId}`);
});

async function loadOwnOrder(req, res, next) {
  const order = await db.get('SELECT * FROM orders WHERE id = ?', [Number(req.params.id) || 0]);
  if (!order || (order.user_id !== req.user.id && req.user.role !== 'admin')) return next('route');
  req.order = order;
  next();
}

router.get('/orders/:id', requireAuth, loadOwnOrder, async (req, res) => {
  const order = req.order;
  const settings = await getSettings();
  const pay = paymentConfig(settings);
  const course = order.course_id ? await db.get('SELECT slug, title FROM courses WHERE id = ?', [order.course_id]) : null;
  const svg = order.status === 'pending'
    ? await qrSvg({ bin: pay.bin, account: pay.account, amount: order.amount, content: order.transfer_code })
    : null;
  res.render('order', {
    title: `Đơn hàng ${order.transfer_code}`,
    order, course, pay, svg,
    bank: bankName(pay.bin),
    statusLabel: ORDER_STATUS[order.status] || order.status,
    crumbs: [{ label: 'Khóa học', href: '/' }, { label: 'Đơn hàng của tôi', href: '/my#orders' }, { label: order.transfer_code }],
  });
});

router.post('/orders/:id/notify', requireAuth, loadOwnOrder, async (req, res) => {
  if (req.order.status === 'pending') {
    await db.run('UPDATE orders SET notified_at = CURRENT_TIMESTAMP WHERE id = ?', [req.order.id]);
    req.flash('success', 'Đã báo admin. Khóa học sẽ tự mở ngay khi admin xác nhận đã nhận tiền.');
  }
  res.redirect(`/orders/${req.order.id}`);
});

router.post('/orders/:id/cancel', requireAuth, loadOwnOrder, async (req, res) => {
  if (req.order.status === 'pending') {
    await db.run("UPDATE orders SET status = 'cancelled' WHERE id = ?", [req.order.id]);
    req.flash('success', 'Đã hủy đơn hàng.');
  }
  res.redirect('/my#orders');
});

module.exports = router;
