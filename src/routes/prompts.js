const router = require('express').Router();
const { listCategories, listPrompts } = require('../services/prompts');

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const categories = await listCategories();
  const active = categories.find(c => c.slug === req.query.nganh) || null;
  const all = await listPrompts({ categoryId: active && active.id, q });
  // Trang "Tất cả" / kết quả tìm kiếm: chia trang để không tải hàng trăm kịch bản một lúc. Trang một ngành hiện đủ.
  const PER_PAGE = 24;
  const pages = active ? 1 : Math.max(1, Math.ceil(all.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(req.query.trang, 10) || 1));
  const prompts = active ? all : all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageUrl = n => '/prompts?' + new URLSearchParams(Object.assign({}, q ? { q } : {}, n > 1 ? { trang: n } : {})).toString();
  res.render('prompts', {
    title: active ? `Prompt video AI ngành ${active.name}` : 'Prompt tạo video AI theo ngành nghề',
    categories, active, prompts, q, page, pages, pageUrl, found: all.length,
    total: categories.reduce((s, c) => s + c.prompt_count, 0),
  });
});

module.exports = router;
