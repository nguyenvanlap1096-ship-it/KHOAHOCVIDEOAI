const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');

const config = require('./config');
const db = require('./db');
const h = require('./helpers');
const { loadUser } = require('./middleware/auth');
const csrf = require('./middleware/csrf');

function sessionStore() {
  if (db.client !== 'mysql') return undefined; // MemoryStore khi chạy thử với SQLite
  const MySQLStore = require('express-mysql-session')(session);
  return new MySQLStore({ createDatabaseTable: true, clearExpired: true }, db.pool);
}

async function sidebarData(userId) {
  if (!userId) return { saved: [], learning: [] };
  const [saved, learning] = await Promise.all([
    db.all(
      `SELECT c.slug, c.title, c.color FROM bookmarks b JOIN courses c ON c.id = b.course_id
        WHERE b.user_id = ? AND c.published = 1 ORDER BY b.created_at DESC LIMIT 6`,
      [userId],
    ),
    db.all(
      `SELECT c.slug, c.title, c.color, MAX(p.updated_at) AS last_at
         FROM progress p JOIN lessons l ON l.id = p.lesson_id JOIN courses c ON c.id = l.course_id
        WHERE p.user_id = ? AND c.published = 1
        GROUP BY c.id, c.slug, c.title, c.color ORDER BY last_at DESC LIMIT 5`,
      [userId],
    ),
  ]);
  return { saved, learning };
}

module.exports = function createApp() {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(config.root, 'views'));
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': ["'self'", 'https://www.youtube.com', 'https://s.ytimg.com'],
        'frame-src': ['https://www.youtube-nocookie.com', 'https://www.youtube.com'],
        'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'https://i.ytimg.com'],
        'media-src': ["'self'", 'blob:'],
        'upgrade-insecure-requests': config.isProd ? [] : null,
      },
    },
    strictTransportSecurity: config.isProd ? { maxAge: 15552000 } : false,
  }));
  app.use(compression());
  app.use(express.static(path.join(config.root, 'public'), { maxAge: config.isProd ? '7d' : 0 }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(express.json({ limit: '100kb' }));

  app.use(session({
    name: 'demia.sid',
    secret: config.sessionSecret,
    store: sessionStore(),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: config.isProd, maxAge: 14 * 24 * 3600 * 1000 },
  }));

  app.use(loadUser);

  app.use(async (req, res, next) => {
    req.flash = (type, message) => { req.session.flash = { type, message }; };
    if (req.path.startsWith('/api/') || req.path.startsWith('/media/')) return next();
    res.locals.siteName = config.siteName;
    res.locals.path = req.path;
    res.locals.h = h;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    res.locals.sidebar = await sidebarData(req.user && req.user.id);
    next();
  });
  app.use(csrf);

  app.use('/', require('./routes/auth'));
  app.use('/', require('./routes/public'));
  app.use('/api', require('./routes/api'));
  app.use('/admin', require('./routes/admin'));

  app.use((req, res) => {
    res.status(404).render('error', { title: 'Không tìm thấy trang', status: 404, message: 'Trang bạn tìm không tồn tại hoặc đã bị gỡ.' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.locals.siteName ??= config.siteName;
    res.locals.h ??= h;
    res.locals.sidebar ??= { saved: [], learning: [] };
    res.locals.csrf ??= '';
    const message = status >= 500 ? 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' : err.message;
    if (req.originalUrl.startsWith('/api/')) return res.status(status).json({ error: message });
    res.status(status).render('error', { title: 'Lỗi', status, message });
  });

  return app;
};
