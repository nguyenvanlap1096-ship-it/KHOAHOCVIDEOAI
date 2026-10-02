const config = require('./src/config');
const db = require('./src/db');
const { ensureSeed } = require('./src/db/seed');
const createApp = require('./src/app');

(async () => {
  await db.init();
  await ensureSeed();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[demia] ${config.siteName} đang chạy tại http://localhost:${config.port} (CSDL: ${db.client})`);
  });
})().catch(err => {
  console.error('[demia] Khởi động thất bại:', err);
  process.exit(1);
});
