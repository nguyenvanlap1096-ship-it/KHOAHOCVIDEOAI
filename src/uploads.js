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
const FILE_RE = /^[a-f0-9]{32}\.(mp4|webm|ogv|jpg|png|webp)$/;
const IMAGE_RE = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = IMAGE_FIELDS.has(file.fieldname) ? imageDir : config.uploadDir;
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, crypto.randomBytes(16).toString('hex') + (IMAGE_EXT[file.mimetype] || VIDEO_EXT[file.mimetype]));
    },
  }),
  limits: { fileSize: Math.max(config.maxUploadMb, MAX_IMAGE_MB) * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => {
    const isImage = IMAGE_FIELDS.has(file.fieldname);
    if (isImage ? IMAGE_EXT[file.mimetype] : VIDEO_EXT[file.mimetype]) return cb(null, true);
    const err = new Error(isImage ? 'Ảnh phải là JPG, PNG hoặc WebP.' : 'Chỉ hỗ trợ video MP4, WebM hoặc OGG.');
    err.field = file.fieldname;
    cb(err);
  },
});

function removeFile(filename) {
  if (!filename || !FILE_RE.test(filename)) return;
  if (IMAGE_RE.test(filename)) {
    db.run('DELETE FROM media WHERE name = ?', [filename]).catch(() => {});
    fs.unlink(path.join(imageDir, filename), () => {});
    return;
  }
  fs.unlink(path.join(config.uploadDir, filename), () => {});
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
  const mw = upload.fields(fields.map(name => ({ name, maxCount: 1 })));
  return (req, res, next) => mw(req, res, async err => {
    req.uploaded = {};
    req.uploadErrors = {};
    if (err) {
      const field = err.field || fields[0];
      req.uploadErrors[field] = err.code === 'LIMIT_FILE_SIZE' ? `File vượt quá ${config.maxUploadMb} MB.` : err.message;
    }
    for (const field of fields) {
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

// Bỏ các file vừa upload khi form bị lỗi validate.
function discardUploads(req) {
  Object.values(req.uploaded || {}).forEach(removeFile);
}

module.exports = { acceptFiles, discardUploads, removeFile, serveImage, MAX_IMAGE_MB };
