require('dotenv').config({ quiet: true });
const path = require('path');
const crypto = require('crypto');

const env = process.env;
const root = path.resolve(__dirname, '..');
const isProd = env.NODE_ENV === 'production';

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
  uploadDir: path.resolve(root, env.UPLOAD_DIR || 'uploads'),
  maxUploadMb: Number(env.MAX_UPLOAD_MB) || 500,
  admin: {
    name: env.ADMIN_NAME || 'Quản trị viên',
    email: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: env.ADMIN_PASSWORD || '',
  },
};
