const router = require('express').Router();
const db = require('../db');
const { coursePercent } = require('../helpers');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Lưu tiến độ xem bài học. Phần trăm chỉ tăng, không bao giờ giảm.
router.post('/progress', async (req, res) => {
  const body = req.body || {};
  const lesson = await db.get(
    `SELECT l.id, l.course_id, l.duration_sec FROM lessons l JOIN courses c ON c.id = l.course_id
      WHERE l.id = ? AND (c.published = 1 OR ? = 1)`,
    [Number(body.lessonId) || 0, req.user.role === 'admin' ? 1 : 0],
  );
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

  const position = Math.max(0, Math.floor(Number(body.position) || 0));
  const duration = Number(body.duration) > 0 ? Number(body.duration) : Number(lesson.duration_sec);
  let percent = body.completed ? 100 : duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  if (percent >= 95) percent = 100;

  const existing = await db.get('SELECT percent FROM progress WHERE user_id = ? AND lesson_id = ?', [req.user.id, lesson.id]);
  const newPercent = Math.max(percent, existing ? Number(existing.percent) : 0);
  const completed = newPercent >= 100 ? 1 : 0;
  if (existing) {
    await db.run(
      'UPDATE progress SET percent = ?, position_sec = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND lesson_id = ?',
      [newPercent, position, completed, req.user.id, lesson.id],
    );
  } else {
    await db.run(
      'INSERT INTO progress (user_id, lesson_id, percent, position_sec, completed) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, lesson.id, newPercent, position, completed],
    );
  }

  // Lần đầu biết thời lượng thật của video thì lưu lại cho bài học.
  if (!Number(lesson.duration_sec) && Number(body.duration) > 0) {
    await db.run('UPDATE lessons SET duration_sec = ? WHERE id = ? AND duration_sec = 0', [Math.round(body.duration), lesson.id]);
  }

  const agg = await db.get(
    `SELECT COUNT(l.id) AS n, COALESCE(SUM(p.percent), 0) AS s
       FROM lessons l LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
      WHERE l.course_id = ?`,
    [req.user.id, lesson.course_id],
  );
  res.json({ percent: newPercent, completed: Boolean(completed), coursePercent: coursePercent(agg.s, Number(agg.n)) });
});

router.post('/bookmarks/:courseId', async (req, res) => {
  const courseId = Number(req.params.courseId) || 0;
  const course = await db.get('SELECT id FROM courses WHERE id = ? AND published = 1', [courseId]);
  if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
  const { changes } = await db.run('DELETE FROM bookmarks WHERE user_id = ? AND course_id = ?', [req.user.id, courseId]);
  if (!changes) await db.run('INSERT INTO bookmarks (user_id, course_id) VALUES (?, ?)', [req.user.id, courseId]);
  res.json({ bookmarked: !changes });
});

module.exports = router;
