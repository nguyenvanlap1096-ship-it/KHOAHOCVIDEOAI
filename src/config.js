require('dotenv').config({ quiet: true });
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const env = process.env;
const root = path.resolve(__dirname, '..');
const isProd = env.NODE_ENV === 'production';

// Nơi lưu video tự upload. Hosting (Hostinger) thay toàn bộ thư mục mã nguồn mỗi lần deploy, nên khi chạy
// thật mặc định lưu ra NGOÀI mã nguồn: <thư mục home>/demia-uploads – video được giữ qua mọi lần cập nhật.
// Có thể chỉ định bằng biến UPLOAD_DIR. Nếu thư mục ngoài không ghi được thì quay về <mã nguồn>/uploads.
function resolveUploadDir() {
  if (env.UPLOAD_DIR) return { dir: path.resolve(root, env.UPLOAD_DIR), persistent: !path.resolve(root, env.UPLOAD_DIR).startsWith(root + path.sep) };
  const local = path.join(root, 'uploads');
  if (!isProd) return { dir: local, persistent: false };
  const home = os.homedir();
  const outside = home && !root.startsWith(path.join(home, 'demia-uploads')) ? path.join(home, 'demia-uploads') : null;
  if (outside && !outside.startsWith(root + path.sep)) {
    try {
      fs.mkdirSync(outside, { recursive: true });
      fs.accessSync(outside, fs.constants.W_OK);
      return { dir: outside, persistent: true };
    } catch (err) {
      console.warn('[demia] Không ghi được thư mục lưu video ngoài mã nguồn (' + outside + '): ' + err.message);
    }
  }
  console.warn('[demia] Video đang lưu trong thư mục mã nguồn – sẽ bị xóa mỗi lần deploy. Hãy đặt biến UPLOAD_DIR.');
  return { dir: local, persistent: false };
}
const upload = resolveUploadDir();

let sessionSecret = env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProd) throw new Error('Thiếu biến môi trường SESSION_SECRET.');
  sessionSecret = crypto.randomBytes(32).toString('hex');
  console.warn('[demia] Chưa đặt SESSION_SECRET – dùng khóa tạm, phiên đăng nhập sẽ mất khi khởi động lại.');
}

module.exports = {
  root,
  isProd,
  port: Number(env.PORT) || 3000,
  siteName: env.SITE_NAME || 'Demia',
  sessionSecret,
  db: {
    client: env.DB_CLIENT || (env.DB_HOST ? 'mysql' : 'sqlite'),
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT) || 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    sqliteFile: path.resolve(root, env.SQLITE_FILE || 'data/dev.sqlite'),
  },
  uploadDir: upload.dir,
  uploadPersistent: upload.persistent,
  maxUploadMb: Number(env.MAX_UPLOAD_MB) || 500,
  admin: {
    name: env.ADMIN_NAME || 'Quản trị viên',
    email: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: env.ADMIN_PASSWORD || '',
  },
};
