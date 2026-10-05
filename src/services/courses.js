const db = require('../db');
const { coursePercent } = require('../helpers');

const COURSE_COLS = 'c.id, c.slug, c.title, c.description, c.level, c.category, c.color, c.cover_image, c.is_premium, c.price, c.published, c.created_at';

// Danh sách khóa học kèm số bài, tổng thời lượng và (nếu có userId) tiến độ của người học.
// premium: 'exclude' (chỉ khóa miễn phí), 'only' (chỉ khóa chuyên sâu) hoặc bỏ trống (tất cả).
async function listCourses({ userId = null, q = '', level = '', publishedOnly = true, premium = '' } = {}) {
  const where = [];
  const params = [];
  if (publishedOnly) where.push('c.published = 1');
  if (premium === 'exclude') where.push('c.is_premium = 0');
  if (premium === 'only') where.push('c.is_premium = 1');
  if (q) {
    const like = `%${q}%`;
    where.push('(c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ?)');
    params.push(like, like, like);
  }
  if (level) {
    where.push('c.level = ?');
    params.push(level);
  }
  const courses = await db.all(
    `SELECT ${COURSE_COLS}, COUNT(l.id) AS lesson_count, COALESCE(SUM(l.duration_sec), 0) AS total_sec
       FROM courses c LEFT JOIN lessons l ON l.course_id = c.id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      GROUP BY ${COURSE_COLS}
      ORDER BY c.created_at DESC, c.id DESC`,
    params,
  );

  const progress = await progressByCourse(userId);
  return courses.map(c => {
    const p = progress[c.id];
    return {
      ...c,
      lesson_count: Number(c.lesson_count),
      total_sec: Number(c.total_sec),
      started: Boolean(p),
      last_at: p ? p.last_at : null,
      percent: p ? coursePercent(p.pct_sum, Number(c.lesson_count)) : 0,
    };
  });
}

async function progressByCourse(userId) {
  if (!userId) return {};
  const rows = await db.all(
    `SELECT l.course_id, SUM(p.percent) AS pct_sum, MAX(p.updated_at) AS last_at
       FROM progress p JOIN lessons l ON l.id = p.lesson_id
      WHERE p.user_id = ?
      GROUP BY l.course_id`,
    [userId],
  );
  return Object.fromEntries(rows.map(r => [r.course_id, r]));
}

async function lessonsWithProgress(courseId, userId) {
  const rows = await db.all(
    `SELECT l.id, l.position, l.title, l.duration_sec, l.video_type,
            COALESCE(p.percent, 0) AS percent, COALESCE(p.completed, 0) AS completed, p.updated_at AS progress_at
       FROM lessons l LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
      WHERE l.course_id = ?
      ORDER BY l.position, l.id`,
    [userId || 0, courseId],
  );
  return rows.map(r => ({ ...r, percent: Number(r.percent), completed: Number(r.completed) === 1 }));
}

// Bài nên học tiếp: bài dở dang gần nhất → bài đầu tiên chưa xong → bài đầu tiên.
function pickResume(lessons) {
  const inProgress = lessons
    .filter(l => l.progress_at && !l.completed)
    .sort((a, b) => String(b.progress_at).localeCompare(String(a.progress_at)))[0];
  return inProgress || lessons.find(l => !l.completed) || lessons[0];
}

async function isBookmarked(userId, courseId) {
  if (!userId) return false;
  return Boolean(await db.get('SELECT 1 AS x FROM bookmarks WHERE user_id = ? AND course_id = ?', [userId, courseId]));
}

// Video mới thêm / mới thay của các khóa học đã xuất bản.
async function latestVideos(limit = 8) {
  return db.all(
    `SELECT l.id, l.title, l.duration_sec, l.video_type, l.video_ref, l.thumbnail, l.created_at,
            COALESCE(l.updated_at, l.created_at) AS updated_at,
            c.slug AS course_slug, c.title AS course_title, c.color, c.cover_image
       FROM lessons l JOIN courses c ON c.id = l.course_id
      WHERE c.published = 1 AND l.video_type <> 'none' AND (l.video_type <> 'upload' OR l.video_ref IS NOT NULL)
      ORDER BY COALESCE(l.updated_at, l.created_at) DESC, l.id DESC
      LIMIT ?`,
    [Number(limit)],
  );
}

module.exports = { listCourses, lessonsWithProgress, pickResume, isBookmarked, latestVideos };
