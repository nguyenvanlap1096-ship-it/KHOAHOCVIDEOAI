// Tạo tài khoản admin từ biến môi trường, nạp chương trình học Video AI và thư viện prompt mẫu.
const bcrypt = require('bcryptjs');
const db = require('./index');
const config = require('../config');
const { slugify } = require('../helpers');
const CURRICULUM = require('./seed-data/curriculum');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { removeFile, docPath } = require('../uploads');
const PROMPT_LIBRARY = require('./seed-data/prompts');
const MATERIALS = { 15: require('./seed-data/materials-15'), 16: require('./seed-data/materials-16') };
const MATERIALS_VI = require('./seed-data/materials-vi');

// Nội dung ô prompt của một bài: "# Tiêu đề\nPrompt EN\n--- Tiếng Việt ---\nBản dịch", các prompt cách nhau bằng "---".
function materialPrompts(title, d, withVi = true) {
  const vi = (withVi && MATERIALS_VI[title]) || {};
  return d.prompts.map(([t, c]) => `# ${t}\n${c}${vi[t] ? `\n--- Tiếng Việt ---\n${vi[t]}` : ''}`).join('\n---\n');
}

// Kích thước file Word bản đầu (chưa có bản dịch): file còn đúng bản này thì mới được thay bằng bản mới.
const FIRST_DOC_SIZES = {
  'module15-prompt-affiliate.docx': 4791, 'module15-prompt-camera.docx': 4483, 'module15-prompt-cinematic.docx': 5086,
  'module15-prompt-kling.docx': 4815, 'module15-prompt-nhan-vat.docx': 4909, 'module15-prompt-quang-cao.docx': 5011,
  'module15-prompt-san-pham.docx': 5178, 'module15-prompt-storytelling.docx': 4800, 'module15-prompt-tao-anh.docx': 5653,
  'module15-prompt-theo-nganh.docx': 5383, 'module15-prompt-ugc.docx': 4478, 'module15-prompt-veo3.docx': 5012,
  'module16-checklist-lam-video-ai.docx': 3942, 'module16-cong-cu-video-ai-moi.docx': 3889, 'module16-font.docx': 4112,
  'module16-huong-dan-bo-sung.docx': 4352, 'module16-link-cong-cu.docx': 3763, 'module16-nhac.docx': 4001,
  'module16-prompt-moi.docx': 4526, 'module16-sound-effect.docx': 4238, 'module16-template.docx': 4305,
};

// Đường dẫn các khóa học mẫu đời đầu, được thay bằng chương trình Video AI.
const OLD_SAMPLE_SLUGS = [
  'react-cho-nguoi-moi-bat-dau',
  'python-can-ban',
  'cau-truc-du-lieu-va-giai-thuat',
  'thiet-ke-ui-voi-figma',
  'lam-video-bang-ai',
];

async function ensureAdmin() {
  const { email, password, name } = config.admin;
  if (!email || !password) return;
  const existing = await db.get('SELECT id, role FROM users WHERE email = ?', [email]);
  if (existing) {
    if (existing.role !== 'admin') await db.run("UPDATE users SET role = 'admin' WHERE id = ?", [existing.id]);
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  await db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')", [name, email, hash]);
  console.log(`[demia] Đã tạo tài khoản admin: ${email}`);
}

async function insertModule(m) {
  const { insertId } = await db.run(
    'INSERT INTO courses (slug, title, description, level, category, color, published, position) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
    [m.slug, m.title, m.description, m.level, m.category, m.color, Number(m.code) + 1],
  );
  let position = 1;
  for (const title of m.lessons) {
    await db.run(
      "INSERT INTO lessons (course_id, position, title, video_type) VALUES (?, ?, ?, 'none')",
      [insertId, position++, title],
    );
  }
}

// Mỗi gói dữ liệu mẫu chỉ nạp một lần (đánh dấu trong bảng settings),
// để admin xóa nội dung mẫu thì nó không tự xuất hiện lại.
async function once(flag, fn) {
  if (await db.get('SELECT 1 AS x FROM settings WHERE name = ?', [flag])) return;
  await fn();
  await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', [flag, new Date().toISOString()]);
}

// Thay các khóa học mẫu cũ bằng chương trình Video AI (Module 00 → 16), chỉ chạy một lần.
async function ensureCurriculum() {
  await once('seed:curriculum-video-ai', async () => {
    for (const slug of OLD_SAMPLE_SLUGS) {
      const course = await db.get('SELECT id, cover_image FROM courses WHERE slug = ?', [slug]);
      if (!course) continue;
      const files = await db.all('SELECT video_type, video_ref, thumbnail FROM lessons WHERE course_id = ?', [course.id]);
      await db.run('DELETE FROM courses WHERE id = ?', [course.id]);
      removeFile(course.cover_image);
      files.forEach(l => {
        if (l.video_type === 'upload') removeFile(l.video_ref);
        removeFile(l.thumbnail);
      });
    }
    // Chèn ngược để Module 00 hiển thị đầu tiên (danh mục sắp xếp mới nhất trước).
    for (const m of [...CURRICULUM].reverse()) {
      const slug = `module-${m.code}-${slugify(m.title)}`;
      if (await db.get('SELECT 1 AS x FROM courses WHERE slug = ?', [slug])) continue;
      await insertModule({ ...m, slug, title: `Module ${m.code} — ${m.title}` });
    }
    console.log(`[demia] Đã nạp chương trình Video AI (${CURRICULUM.length} module).`);
  });
}

async function ensurePromptLibrary() {
  await once('seed:prompts', async () => {
    const { n } = await db.get('SELECT COUNT(*) AS n FROM prompt_categories');
    if (Number(n) > 0) return;
    let position = 1;
    for (const cat of PROMPT_LIBRARY) {
      const { insertId } = await db.run(
        'INSERT INTO prompt_categories (slug, name, color, position) VALUES (?, ?, ?, ?)',
        [slugify(cat.name), cat.name, cat.color, position++],
      );
      for (const p of cat.prompts) {
        await db.run(
          'INSERT INTO prompts (category_id, title, description, content, tool) VALUES (?, ?, ?, ?, ?)',
          [insertId, p.title, p.description, p.content, p.tool],
        );
      }
    }
    console.log('[demia] Đã nạp thư viện prompt mẫu.');
  });
}

// Nạp prompt, tóm tắt, link và file Word cho các bài của Module 15 (Kho Prompt) và 16 (Tài nguyên).
// Chỉ điền vào ô còn trống và chỉ gắn file Word khi bài chưa có tài liệu: không ghi đè nội dung admin đã nhập.
async function ensureLessonMaterials() {
  await once('seed:materials-15-16', async () => {
    let filled = 0;
    for (const [code, lessons] of Object.entries(MATERIALS)) {
      const course = await db.get('SELECT id FROM courses WHERE title LIKE ? ORDER BY id LIMIT 1', [`Module ${code}%`]);
      if (!course) continue;
      const rows = await db.all('SELECT id, title, summary, key_points, resources, prompts FROM lessons WHERE course_id = ?', [course.id]);
      for (const [title, d] of Object.entries(lessons)) {
        const lesson = rows.find(r => String(r.title).trim().toLowerCase() === title.toLowerCase());
        if (!lesson) continue;
        const pick = (current, value) => (String(current || '').trim() ? current : value);
        await db.run(
          'UPDATE lessons SET summary = ?, key_points = ?, resources = ?, prompts = ? WHERE id = ?',
          [
            pick(lesson.summary, d.summary),
            pick(lesson.key_points, d.keyPoints.join('\n')),
            pick(lesson.resources, d.resources.map(([t, u]) => `${t} | ${u}`).join('\n')),
            pick(lesson.prompts, materialPrompts(title, d)),
            lesson.id,
          ],
        );
        const source = path.join(__dirname, 'seed-data', 'docs', `module${code}-${slugify(title)}.docx`);
        const { n } = await db.get('SELECT COUNT(*) AS n FROM lesson_files WHERE lesson_id = ?', [lesson.id]);
        if (!Number(n) && fs.existsSync(source)) {
          const stored = crypto.randomBytes(16).toString('hex') + '.docx';
          fs.mkdirSync(path.dirname(docPath(stored)), { recursive: true });
          fs.copyFileSync(source, docPath(stored));
          await db.run(
            'INSERT INTO lesson_files (lesson_id, position, original_name, stored, size, text_content) VALUES (?, 1, ?, ?, ?, NULL)',
            [lesson.id, `${title}.docx`, stored, fs.statSync(source).size],
          );
        }
        filled++;
      }
    }
    if (filled) console.log(`[demia] Đã nạp nội dung prompt & tài nguyên cho ${filled} bài (Module 15, 16).`);
  });
}

// Bổ sung bản dịch tiếng Việt cho các bài Module 15/16 đã nạp trước đó.
// Chỉ thay khi ô prompt và file Word vẫn đúng bản gốc đã nạp (admin chưa sửa).
async function addMaterialTranslations() {
  await once('seed:materials-15-16-vi', async () => {
    let updated = 0;
    for (const [code, lessons] of Object.entries(MATERIALS)) {
      const course = await db.get('SELECT id FROM courses WHERE title LIKE ? ORDER BY id LIMIT 1', [`Module ${code}%`]);
      if (!course) continue;
      const rows = await db.all('SELECT id, title, prompts FROM lessons WHERE course_id = ?', [course.id]);
      for (const [title, d] of Object.entries(lessons)) {
        const lesson = rows.find(r => String(r.title).trim().toLowerCase() === title.toLowerCase());
        if (!lesson) continue;
        if (String(lesson.prompts || '') === materialPrompts(title, d, false)) {
          await db.run('UPDATE lessons SET prompts = ? WHERE id = ?', [materialPrompts(title, d), lesson.id]);
          updated++;
        }
        const name = `module${code}-${slugify(title)}.docx`;
        const source = path.join(__dirname, 'seed-data', 'docs', name);
        const doc = await db.get('SELECT id, stored, size FROM lesson_files WHERE lesson_id = ? AND original_name = ?', [lesson.id, `${title}.docx`]);
        if (doc && Number(doc.size) === FIRST_DOC_SIZES[name] && docPath(doc.stored) && fs.existsSync(source)) {
          fs.copyFileSync(source, docPath(doc.stored));
          await db.run('UPDATE lesson_files SET size = ? WHERE id = ?', [fs.statSync(source).size, doc.id]);
        }
      }
    }
    if (updated) console.log(`[demia] Đã thêm bản dịch tiếng Việt cho prompt của ${updated} bài (Module 15, 16).`);
  });
}

// Bỏ tham chiếu tới ảnh đã mất (ví dụ ảnh lưu trên ổ đĩa bị xóa khi hosting deploy lại)
// để giao diện quay về ảnh mặc định thay vì hiện ảnh lỗi.
async function clearMissingImages() {
  const exists = async name => Boolean(await db.get('SELECT 1 AS x FROM media WHERE name = ?', [name]))
    || fs.existsSync(path.join(config.uploadDir, 'images', name));
  let cleared = 0;
  for (const [table, column] of [['courses', 'cover_image'], ['lessons', 'thumbnail']]) {
    const rows = await db.all(`SELECT id, ${column} AS img FROM ${table} WHERE ${column} IS NOT NULL AND ${column} <> ''`);
    for (const r of rows) {
      if (await exists(r.img)) continue;
      await db.run(`UPDATE ${table} SET ${column} = NULL WHERE id = ?`, [r.id]);
      cleared++;
    }
  }
  for (const name of ['zalo_qr', 'site_logo']) {
    const row = await db.get('SELECT value FROM settings WHERE name = ?', [name]);
    if (row && row.value && !(await exists(row.value))) {
      await db.run("UPDATE settings SET value = '' WHERE name = ?", [name]);
      cleared++;
    }
  }
  if (cleared) console.log(`[demia] Đã bỏ ${cleared} tham chiếu tới ảnh không còn tồn tại – hãy upload lại các ảnh này.`);
}

async function ensureSeed() {
  await ensureAdmin();
  await ensureCurriculum();
  await ensurePromptLibrary();
  await ensureLessonMaterials();
  await addMaterialTranslations();
  await clearMissingImages();
}

module.exports = { ensureSeed };
