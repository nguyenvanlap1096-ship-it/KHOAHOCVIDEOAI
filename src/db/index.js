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

async function init() {
  impl = config.db.client === 'mysql' ? await initMysql() : initSqlite();
  const schema = fs.readFileSync(path.join(__dirname, `schema.${impl.client}.sql`), 'utf8');
  await impl.exec(schema);
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
