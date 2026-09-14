// api/data/[...seg].js - единый публичный роутер данных (консолидировано из 2 файлов: portfolio, testimonials).
// Сохранены прежние адреса: /api/data/portfolio, /api/data/testimonials.
// Бэкап оригиналов: backup/api_backup_20260909-131923.tar.gz

const { PORTFOLIO_PATH, TESTIMONIALS_PATH, readJson } = require('../_lib/store');

function segOf(req) {
  try {
    const p = new URL(req.url, 'http://x').pathname.replace(/\/+$/, '');
    const parts = p.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch (e) {
    return '';
  }
}

module.exports = async function handler(req, res) {
  const seg = segOf(req);
  let path = null;
  if (seg === 'portfolio') path = PORTFOLIO_PATH;
  else if (seg === 'testimonials') path = TESTIMONIALS_PATH;
  if (!path) { res.status(404).json({ error: 'not found' }); return; }
  const items = await readJson(path);
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
  res.status(200).json({ items });
};
