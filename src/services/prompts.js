const db = require('../db');

// Danh sách ngành nghề kèm số prompt (chỉ đếm prompt đã xuất bản nếu publicOnly).
async function listCategories({ publicOnly = true } = {}) {
  const rows = await db.all(
    `SELECT pc.id, pc.slug, pc.name, pc.color, pc.position, COUNT(p.id) AS prompt_count
       FROM prompt_categories pc
       LEFT JOIN prompts p ON p.category_id = pc.id ${publicOnly ? 'AND p.published = 1' : ''}
      GROUP BY pc.id, pc.slug, pc.name, pc.color, pc.position
      ORDER BY pc.position, pc.id`,
  );
  return rows.map(r => ({ ...r, prompt_count: Number(r.prompt_count) }));
}

async function listPrompts({ categoryId = null, q = '', publicOnly = true } = {}) {
  const where = [];
  const params = [];
  if (publicOnly) where.push('p.published = 1');
  if (categoryId) { where.push('p.category_id = ?'); params.push(categoryId); }
  if (q) {
    const like = `%${q}%`;
    where.push('(p.title LIKE ? OR p.description LIKE ? OR p.content LIKE ?)');
    params.push(like, like, like);
  }
  return db.all(
    `SELECT p.id, p.title, p.description, p.content, p.tool, p.published, p.updated_at,
            pc.id AS category_id, pc.name AS category_name, pc.slug AS category_slug, pc.color AS category_color
       FROM prompts p JOIN prompt_categories pc ON pc.id = p.category_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY pc.position, pc.id, p.id`,
    params,
  );
}

module.exports = { listCategories, listPrompts };
