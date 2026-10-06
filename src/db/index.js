// Lớp truy cập dữ liệu dùng chung cho MySQL (production) và SQLite (chạy thử trên máy).
// Mọi câu SQL trong ứng dụng dùng placeholder `?` và cú pháp chung cho cả hai.
const fs = require('fs');
const path = require('path');
const config = require('../config');

let impl = null;

function splitStatements(sql) {
  return sql.split(';').map(s => s.trim()).filter(Boolean);
}

async function initMysql() {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    charset: 'utf8mb4',
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
  });
  // Mọi thời điểm đọc/ghi theo UTC để hiển thị nhất quán (đổi sang giờ Việt Nam khi hiển thị).
  pool.pool.on('connection', conn => conn.query("SET time_zone = '+00:00'"));
  return {
    client: 'mysql',
    pool,
    async all(sql, params = []) {
      const [rows] = await pool.query(sql, params);
      return rows;
    },
    async run(sql, params = []) {
      const [r] = await pool.query(sql, params);
      return { insertId: r.insertId, changes: r.affectedRows };
    },
    async exec(sqlText) {
      for (const stmt of splitStatements(sqlText)) await pool.query(stmt);
    },
  };
}

function initSqlite() {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(path.dirname(config.db.sqliteFile), { recursive: true });
  const db = new DatabaseSync(config.db.sqliteFile);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const norm = params => params.map(v => (v === undefined ? null : typeof v === 'boolean' ? Number(v) : v));
  return {
    client: 'sqlite',
    async all(sql, params = []) {
      return db.prepare(sql).all(...norm(params)).map(row => ({ ...row }));
    },
    async run(sql, params = []) {
      const r = db.prepare(sql).run(...norm(params));
      return { insertId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async exec(sqlText) {
      db.exec(sqlText);
    },
  };
}

async function columnExists(table, column) {
  if (impl.client === 'mysql') {
    const rows = await impl.all(
      'SELECT 1 AS x FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [table, column],
    );
    return rows.length > 0;
  }
  return (await impl.all(`PRAGMA table_info(${table})`)).some(c => c.name === column);
}

// Bổ sung cột mới cho cơ sở dữ liệu tạo từ phiên bản cũ (CREATE TABLE IF NOT EXISTS không tự thêm cột).
// SQLite không cho ADD COLUMN với DEFAULT CURRENT_TIMESTAMP nên điền giá trị sau khi thêm.
const MIGRATIONS = [
  { table: 'courses', column: 'cover_image', mysql: 'VARCHAR(100)', sqlite: 'TEXT' },
  { table: 'lessons', column: 'thumbnail', mysql: 'VARCHAR(100)', sqlite: 'TEXT' },
  { table: 'lessons', column: 'video_ratio', mysql: 'VARCHAR(8)', sqlite: 'TEXT' },
  { table: 'lessons', column: 'prompts', mysql: 'MEDIUMTEXT', sqlite: 'TEXT' },
  { table: 'courses', column: 'is_premium', mysql: 'TINYINT(1) NOT NULL DEFAULT 0', sqlite: 'INTEGER NOT NULL DEFAULT 0' },
  { table: 'courses', column: 'price', mysql: 'INT UNSIGNED NOT NULL DEFAULT 0', sqlite: 'INTEGER NOT NULL DEFAULT 0' },
  {
    table: 'courses', column: 'position', mysql: 'INT NOT NULL DEFAULT 0', sqlite: 'INTEGER NOT NULL DEFAULT 0',
    // Đánh số theo đúng thứ tự trang chủ đang hiển thị để không ai thấy khác đi sau khi cập nhật.
    afterFn: async () => {
      const rows = await impl.all('SELECT id FROM courses ORDER BY created_at DESC, id DESC');
      for (let i = 0; i < rows.length; i++) await impl.run('UPDATE courses SET position = ? WHERE id = ?', [i + 1, rows[i].id]);
    },
  },
  {
    table: 'lessons', column: 'updated_at',
    mysql: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP', sqlite: 'TEXT',
    after: 'UPDATE lessons SET updated_at = created_at WHERE updated_at IS NULL',
  },
];

async function migrate() {
  for (const m of MIGRATIONS) {
    if (await columnExists(m.table, m.column)) continue;
    await impl.run(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m[impl.client]}`);
    if (m.after) await impl.run(m.after);
    if (m.afterFn) await m.afterFn();
  }
}

async function init() {
  impl = config.db.client === 'mysql' ? await initMysql() : initSqlite();
  const schema = fs.readFileSync(path.join(__dirname, `schema.${impl.client}.sql`), 'utf8');
  await impl.exec(schema);
  await migrate();
  return impl;
}

module.exports = {
  init,
  get client() { return impl && impl.client; },
  get pool() { return impl && impl.pool; },
  all: (sql, params) => impl.all(sql, params),
  get: async (sql, params) => (await impl.all(sql, params))[0],
  run: (sql, params) => impl.run(sql, params),
};
