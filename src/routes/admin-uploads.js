// Trung tâm tải video: nhận file theo từng phần (chunk) để tải được file lớn, tiếp tục được khi
// mạng lỗi, và chạy ở cửa sổ riêng nên admin vẫn làm việc khác trong lúc tải.
// Luồng: init (kiểm tra, trả về vị trí đã tải) → PUT từng phần → complete (ghép xong, gắn vào bài học).
const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('../db');
const config = require('../config');
const h = require('../helpers');
const { removeFile, VIDEO_EXT } = require('../uploads');

const router = express.Router();
const partialDir = path.join(config.uploadDir, '.partial');
const TOKEN_RE = /^[a-f0-9]{32}$/;
const CHUNK_LIMIT = '12mb';

function partPath(token) {
  return path.join(partialDir, `${token}.part`);
}

function partSize(token) {
  try { return fs.statSync(partPath(token)).size; } catch { return 0; }
}

// Dọn các phần tải dở quá 2 ngày (gọi khi mở trung tâm tải).
function cleanStalePartials() {
  fs.readdir(partialDir, (err, files) => {
    if (err) return;
    const cutoff = Date.now() - 2 * 86400000;
    files.forEach(f => fs.stat(path.join(partialDir, f), (e, st) => {
      if (!e && st.mtimeMs < cutoff) fs.unlink(path.join(partialDir, f), () => {});
    }));
  });
}

router.get('/', async (req, res) => {
  cleanStalePartials();
  const lessons = await db.all(
    `SELECT l.id, l.title, l.position, c.id AS course_id, c.title AS course_title
       FROM lessons l JOIN courses c ON c.id = l.course_id
      ORDER BY c.position, c.id, l.position, l.id`,
  );
  res.render('admin/uploads', { title: 'Trung tâm tải video', lessons, maxUploadMb: config.maxUploadMb, preselect: Number(req.query.lesson) || 0 });
});

router.post('/init', async (req, res) => {
  const { token, size, mime, lessonId } = req.body || {};
  if (!TOKEN_RE.test(String(token))) return res.status(400).json({ error: 'Mã tải lên không hợp lệ.' });
  if (!VIDEO_EXT[mime]) return res.status(400).json({ error: 'Chỉ hỗ trợ video MP4, WebM hoặc OGG.' });
  if (!(Number(size) > 0) || Number(size) > config.maxUploadMb * 1024 * 1024) {
    return res.status(400).json({ error: `Video vượt quá ${config.maxUploadMb} MB.` });
  }
  if (!(await db.get('SELECT id FROM lessons WHERE id = ?', [Number(lessonId) || 0]))) {
    return res.status(404).json({ error: 'Bài học không còn tồn tại.' });
  }
  fs.mkdirSync(partialDir, { recursive: true });
  res.json({ offset: partSize(token) });
});

router.put('/:token', express.raw({ type: 'application/octet-stream', limit: CHUNK_LIMIT }), (req, res) => {
  const { token } = req.params;
  if (!TOKEN_RE.test(token)) return res.status(400).json({ error: 'Mã tải lên không hợp lệ.' });
  const offset = Number(req.query.offset);
  const current = partSize(token);
  // Vị trí lệch (ví dụ phần trước đã ghi nhưng phản hồi bị mất): báo vị trí thật để máy khách tải tiếp đúng chỗ.
  if (offset !== current) return res.status(409).json({ offset: current });
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'Phần dữ liệu trống.' });
  if (current + req.body.length > config.maxUploadMb * 1024 * 1024) return res.status(413).json({ error: 'Video quá lớn.' });
  fs.mkdirSync(partialDir, { recursive: true });
  fs.appendFileSync(partPath(token), req.body);
  res.json({ offset: current + req.body.length });
});

router.post('/:token/complete', async (req, res) => {
  const { token } = req.params;
  const { lessonId, mime, size, ratio, duration } = req.body || {};
  if (!TOKEN_RE.test(token) || !VIDEO_EXT[mime]) return res.status(400).json({ error: 'Yêu cầu không hợp lệ.' });
  if (partSize(token) !== Number(size)) return res.status(409).json({ offset: partSize(token), error: 'File chưa tải đủ.' });
  const lesson = await db.get('SELECT * FROM lessons WHERE id = ?', [Number(lessonId) || 0]);
  if (!lesson) return res.status(404).json({ error: 'Bài học không còn tồn tại.' });

  const filename = token + VIDEO_EXT[mime];
  fs.mkdirSync(config.uploadDir, { recursive: true });
  fs.renameSync(partPath(token), path.join(config.uploadDir, filename));

  const durationSec = Math.round(Number(duration) || 0);
  await db.run(
    `UPDATE lessons SET video_type = 'upload', video_ref = ?, video_ratio = ?,
            duration_sec = CASE WHEN ? > 0 THEN ? ELSE duration_sec END, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [filename, h.VIDEO_RATIOS.includes(ratio) ? ratio : null, durationSec, durationSec, lesson.id],
  );
  if (lesson.video_type === 'upload' && lesson.video_ref && lesson.video_ref !== filename) removeFile(lesson.video_ref);
  res.json({ ok: true, lessonId: lesson.id });
});

router.post('/:token/cancel', (req, res) => {
  if (TOKEN_RE.test(req.params.token)) fs.unlink(partPath(req.params.token), () => {});
  res.json({ ok: true });
});

module.exports = router;
