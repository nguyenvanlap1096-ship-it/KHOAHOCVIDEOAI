// Upload file: video bài học (thư mục UPLOAD_DIR) và ảnh thumbnail/QR (UPLOAD_DIR/images, công khai).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('./config');

const VIDEO_EXT = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/ogg': '.ogv' };
const IMAGE_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const IMAGE_FIELDS = new Set(['cover', 'thumbnail', 'zalo_qr']);
const MAX_IMAGE_MB = 5;
const imageDir = path.join(config.uploadDir, 'images');
const FILE_RE = /^[a-f0-9]{32}\.(mp4|webm|ogv|jpg|png|webp)$/;

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
  const dir = /\.(jpg|png|webp)$/.test(filename) ? imageDir : config.uploadDir;
  fs.unlink(path.join(dir, filename), () => {});
}

// Middleware nhận các trường file; kết quả nằm ở req.uploaded[field] và lỗi ở req.uploadErrors[field].
function acceptFiles(fields) {
  const mw = upload.fields(fields.map(name => ({ name, maxCount: 1 })));
  return (req, res, next) => mw(req, res, err => {
    req.uploaded = {};
    req.uploadErrors = {};
    if (err) {
      const field = err.field || fields[0];
      req.uploadErrors[field] = err.code === 'LIMIT_FILE_SIZE' ? `File vượt quá ${config.maxUploadMb} MB.` : err.message;
    }
    for (const field of fields) {
      const file = req.files && req.files[field] && req.files[field][0];
      if (!file) continue;
      if (IMAGE_FIELDS.has(field) && file.size > MAX_IMAGE_MB * 1024 * 1024) {
        removeFile(file.filename);
        req.uploadErrors[field] = `Ảnh tối đa ${MAX_IMAGE_MB} MB.`;
      } else {
        req.uploaded[field] = file.filename;
      }
    }
    next();
  });
}

// Bỏ các file vừa upload khi form bị lỗi validate.
function discardUploads(req) {
  Object.values(req.uploaded || {}).forEach(removeFile);
}

module.exports = { acceptFiles, discardUploads, removeFile, imageDir, MAX_IMAGE_MB };
