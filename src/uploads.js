// Upload file: video bài học lưu trên ổ đĩa (UPLOAD_DIR); ảnh (thumbnail, ảnh bìa, logo, QR)
// lưu trong cơ sở dữ liệu để không bị mất khi hosting triển khai lại mã nguồn.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('./config');
const db = require('./db');

const VIDEO_EXT = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/ogg': '.ogv' };
const IMAGE_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const IMAGE_MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const IMAGE_FIELDS = new Set(['cover', 'thumbnail', 'zalo_qr', 'site_logo']);
const MAX_IMAGE_MB = 5;
const imageDir = path.join(config.uploadDir, 'images');
const FILE_RE = /^[a-f0-9]{32}\.(mp4|webm|ogv|jpg|png|webp|pdf|docx|doc|txt|md)$/;
// Tài liệu đính kèm bài học: lưu cùng thư mục an toàn với video (ngoài mã nguồn khi chạy thật).
const DOC_FIELD = 'docs';
const DOC_EXT = ['.pdf', '.docx', '.doc', '.txt', '.md'];
const DOC_RE = /^[a-f0-9]{32}\.(pdf|docx|doc|txt|md)$/;
const MAX_DOC_MB = 25;
const docDir = path.join(config.uploadDir, 'docs');
const docExt = file => path.extname(String(file.originalname || '')).toLowerCase();
const IMAGE_RE = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = file.fieldname === DOC_FIELD ? docDir : IMAGE_FIELDS.has(file.fieldname) ? imageDir : config.uploadDir;
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = file.fieldname === DOC_FIELD ? docExt(file) : (IMAGE_EXT[file.mimetype] || VIDEO_EXT[file.mimetype]);
      cb(null, crypto.randomBytes(16).toString('hex') + ext);
    },
  }),
  limits: { fileSize: Math.max(config.maxUploadMb, MAX_IMAGE_MB, MAX_DOC_MB) * 1024 * 1024, files: 14 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === DOC_FIELD) {
      if (DOC_EXT.includes(docExt(file))) return cb(null, true);
      const err = new Error('Tài liệu phải là PDF, Word (.docx, .doc) hoặc TXT.');
      err.field = DOC_FIELD;
      return cb(err);
    }
    const isImage = IMAGE_FIELDS.has(file.fieldname);
    if (isImage ? IMAGE_EXT[file.mimetype] : VIDEO_EXT[file.mimetype]) return cb(null, true);
    const err = new Error(isImage ? 'Ảnh phải là JPG, PNG hoặc WebP.' : 'Chỉ hỗ trợ video MP4, WebM hoặc OGG.');
    err.field = file.fieldname;
    cb(err);
  },
});

function removeFile(filename) {
  if (!filename || !FILE_RE.test(filename)) return;
  if (DOC_RE.test(filename)) {
    fs.unlink(path.join(docDir, filename), () => {});
    return;
  }
  if (IMAGE_RE.test(filename)) {
    db.run('DELETE FROM media WHERE name = ?', [filename]).catch(() => {});
    fs.unlink(path.join(imageDir, filename), () => {});
    return;
  }
  // Chốt an toàn: chỉ xóa file video khi không còn bài học nào dùng nó.
  db.get('SELECT COUNT(*) AS n FROM lessons WHERE video_ref = ?', [filename])
    .then(r => { if (!Number(r && r.n)) fs.unlink(path.join(config.uploadDir, filename), () => {}); })
    .catch(() => {});
}

// Chép ảnh vừa nhận vào bảng media (MySQL dùng prepared statement để gửi dữ liệu nhị phân gọn hơn).
async function storeImage(file) {
  const data = fs.readFileSync(file.path);
  const mime = IMAGE_MIME[path.extname(file.filename)];
  const sql = 'INSERT INTO media (name, mime, size, data) VALUES (?, ?, ?, ?)';
  if (db.client === 'mysql') await db.pool.execute(sql, [file.filename, mime, data.length, data]);
  else await db.run(sql, [file.filename, mime, data.length, data]);
}

// Middleware nhận các trường file; kết quả nằm ở req.uploaded[field] và lỗi ở req.uploadErrors[field].
function acceptFiles(fields) {
  const mw = upload.fields(fields.map(name => ({ name, maxCount: name === DOC_FIELD ? 10 : 1 })));
  return (req, res, next) => mw(req, res, async err => {
    req.uploaded = {};
    req.uploadErrors = {};
    req.uploadedDocs = [];
    if (err) {
      const field = err.field || fields[0];
      req.uploadErrors[field] = err.code === 'LIMIT_FILE_SIZE' ? `File vượt quá ${config.maxUploadMb} MB.` : err.message;
    }
    // Tài liệu: nhiều file một lần, kiểm tra dung lượng từng file.
    for (const file of (req.files && req.files[DOC_FIELD]) || []) {
      if (file.size > MAX_DOC_MB * 1024 * 1024) {
        fs.unlink(file.path, () => {});
        req.uploadErrors[DOC_FIELD] = `Mỗi tài liệu tối đa ${MAX_DOC_MB} MB.`;
        continue;
      }
      req.uploadedDocs.push({ stored: file.filename, name: fixName(file.originalname), size: file.size, ext: docExt(file) });
    }
    for (const field of fields) {
      if (field === DOC_FIELD) continue;
      const file = req.files && req.files[field] && req.files[field][0];
      if (!file) continue;
      if (!IMAGE_FIELDS.has(field)) {
        req.uploaded[field] = file.filename;
        continue;
      }
      try {
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
          req.uploadErrors[field] = `Ảnh tối đa ${MAX_IMAGE_MB} MB.`;
        } else {
          await storeImage(file);
          req.uploaded[field] = file.filename;
        }
      } catch (e) {
        console.error('[demia] Lưu ảnh vào CSDL thất bại:', e.message);
        req.uploadErrors[field] = 'Không lưu được ảnh, vui lòng thử ảnh nhỏ hơn.';
      } finally {
        fs.unlink(file.path, () => {});
      }
    }
    next();
  });
}

// Phục vụ ảnh từ CSDL; ảnh cũ còn trên ổ đĩa (nếu có) vẫn đọc được.
async function serveImage(req, res, next) {
  const name = req.params.name;
  if (!IMAGE_RE.test(name)) return next();
  const row = await db.get('SELECT mime, data FROM media WHERE name = ?', [name]);
  res.set('Cache-Control', 'public, max-age=2592000, immutable');
  if (row) return res.type(row.mime).send(Buffer.from(row.data));
  res.sendFile(path.join(imageDir, name), err => {
    if (err && !res.headersSent) {
      res.set('Cache-Control', 'no-store');
      next();
    }
  });
}

// Tên file tiếng Việt đôi khi bị đọc sai mã (latin1) khi upload – đổi lại về UTF-8.
function fixName(name) {
  const s = String(name || 'tai-lieu');
  if (!/[ÃÂÄÆ][\x80-\xBF]?/.test(s)) return s.slice(0, 200);
  const fixed = Buffer.from(s, 'latin1').toString('utf8');
  return (fixed.includes('\uFFFD') ? s : fixed).slice(0, 200);
}

function docPath(stored) {
  return DOC_RE.test(stored) ? path.join(docDir, stored) : null;
}

// Đọc chữ trong tài liệu để hiển thị và sao chép trên web: Word (.docx) và TXT/MD. PDF xem trực tiếp.
async function extractDocText(stored) {
  const p = docPath(stored);
  if (!p) return null;
  const ext = path.extname(stored);
  try {
    if (ext === '.docx') {
      const mammoth = require('mammoth');
      const { value } = await mammoth.extractRawText({ path: p });
      return value.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, 500000);
    }
    if (ext === '.txt' || ext === '.md') return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').trim().slice(0, 500000);
  } catch (err) {
    console.error('[demia] Không đọc được nội dung tài liệu:', err.message);
  }
  return null;
}

// Bỏ các file vừa upload khi form bị lỗi validate.
function discardUploads(req) {
  Object.values(req.uploaded || {}).forEach(removeFile);
  (req.uploadedDocs || []).forEach(d => removeFile(d.stored));
}

// Video tự upload còn trên ổ đĩa không (bị mất nếu từng lưu trong thư mục mã nguồn rồi hosting deploy lại).
function videoExists(filename) {
  return Boolean(filename) && FILE_RE.test(filename) && fs.existsSync(path.join(config.uploadDir, filename));
}

module.exports = { DOC_FIELD, MAX_DOC_MB, docPath, extractDocText, videoExists, acceptFiles, discardUploads, removeFile, serveImage, MAX_IMAGE_MB, VIDEO_EXT };
