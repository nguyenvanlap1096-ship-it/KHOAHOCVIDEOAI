const router = require('express').Router();
const { listCategories, listPrompts } = require('../services/prompts');

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const categories = await listCategories();
  const active = categories.find(c => c.slug === req.query.nganh) || null;
  const prompts = await listPrompts({ categoryId: active && active.id, q });
  res.render('prompts', {
    title: active ? `Prompt ngành ${active.name}` : 'Thư viện prompt theo ngành nghề',
    categories, active, prompts, q,
    total: categories.reduce((s, c) => s + c.prompt_count, 0),
  });
});

module.exports = router;
