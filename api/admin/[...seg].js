// api/admin/[...seg].js - единый админ-роутер (консолидировано из 6 файлов, чтобы уложиться в лимит Vercel Hobby 12 функций).
// Сохранены те же публичные адреса: /api/admin/login, /api/admin/logout, /api/admin/leads,
// /api/admin/portfolio, /api/admin/stats, /api/admin/testimonials.
// Оригиналы разложены: backup/api_backup_20260909-131923.tar.gz

const crypto = require('crypto');
const { requireAuth, createSessionCookie, clearSessionCookie } = require('../_lib/auth');
const { limit } = require('../_lib/rate-limit');
const { readLeads, writeLeads, readVisits, PORTFOLIO_PATH, TESTIMONIALS_PATH, readJson, writeJson, uploadImage } = require('../_lib/store');

function segOf(req) {
  try {
    const p = new URL(req.url, 'http://x').pathname.replace(/\/+$/, '');
    const parts = p.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch (e) {
    return '';
  }
}

function safeEqual(provided, expected) {
  const maxLen = Math.max(expected.length, provided.length, 1);
  const a = Buffer.from(provided.padEnd(maxLen, '\0'));
  const b = Buffer.from(expected.padEnd(maxLen, '\0'));
  return expected.length > 0 && provided.length === expected.length && crypto.timingSafeEqual(a, b);
}

function lastNDays(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

module.exports = async function handler(req, res) {
  const seg = segOf(req);

  // ---- POST /api/admin/login ----
  if (seg === 'login' && req.method === 'POST') {
    const rl = limit(req, { limit: 6, windowMs: 10 * 60 * 1000 });
    if (!rl.allowed) {
      res.status(429).json({ error: 'too many attempts, try again later', retryAfterMs: rl.retryAfterMs });
      return;
    }
    const { username, password, remember } = req.body || {};
    const eu = process.env.ADMIN_USERNAME || '';
    const ep = process.env.ADMIN_PASSWORD || '';
    const uOk = safeEqual(String(username || '').trim().toLowerCase(), eu.toLowerCase());
    const pOk = safeEqual(String(password || ''), ep);
    if (!uOk || !pOk) { res.status(401).json({ error: 'wrong username or password' }); return; }
    res.setHeader('Set-Cookie', createSessionCookie(!!remember));
    res.status(200).json({ ok: true });
    return;
  }

  // ---- POST /api/admin/logout ----
  if (seg === 'logout') {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.status(200).json({ ok: true });
    return;
  }

  if (!requireAuth(req, res)) return;

  // ---- /api/admin/leads ----
  if (seg === 'leads') {
    if (req.method === 'GET') {
      const items = await readLeads();
      res.status(200).json({ items });
      return;
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) { res.status(400).json({ error: 'id required' }); return; }
      const items = await readLeads();
      const next = items.filter((it) => it.id !== id);
      await writeLeads(next);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  // ---- /api/admin/portfolio ----
  if (seg === 'portfolio') {
    if (req.method === 'GET') {
      const items = await readJson(PORTFOLIO_PATH);
      res.status(200).json({ items });
      return;
    }
    if (req.method === 'POST') {
      const { title, category, description, image } = req.body || {};
      if (!title || !description || !image) { res.status(400).json({ error: 'title, description and image required' }); return; }
      if (!image.startsWith('data:image/')) { res.status(400).json({ error: 'image must be a data url' }); return; }
      const imageUrl = await uploadImage(image, title);
      const items = await readJson(PORTFOLIO_PATH);
      const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title: String(title).slice(0, 120),
        category: String(category || 'other').slice(0, 40),
        description: String(description).slice(0, 3000),
        image: imageUrl,
        createdAt: Date.now(),
      };
      items.unshift(item);
      await writeJson(PORTFOLIO_PATH, items);
      res.status(200).json({ ok: true, item });
      return;
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) { res.status(400).json({ error: 'id required' }); return; }
      const items = await readJson(PORTFOLIO_PATH);
      const next = items.filter((it) => it.id !== id);
      await writeJson(PORTFOLIO_PATH, next);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  // ---- /api/admin/stats ----
  if (seg === 'stats') {
    if (req.method !== 'GET') { res.status(405).json({ error: 'method not allowed' }); return; }
    const [visits, leads] = await Promise.all([readVisits(), readLeads()]);
    const days = lastNDays(30);
    const daily = days.map((day) => ({ day, count: visits[day] || 0 }));
    const totalVisits30d = daily.reduce((sum, d) => sum + d.count, 0);
    const totalVisitsAll = Object.values(visits).reduce((sum, v) => sum + v, 0);
    res.status(200).json({ visitsDaily: daily, totalVisits30d, totalVisitsAll, totalLeads: leads.length });
    return;
  }

  // ---- /api/admin/testimonials ----
  if (seg === 'testimonials') {
    if (req.method === 'GET') {
      const items = await readJson(TESTIMONIALS_PATH);
      res.status(200).json({ items });
      return;
    }
    if (req.method === 'POST') {
      const { name, role, text, rating, photo } = req.body || {};
      if (!name || !text) { res.status(400).json({ error: 'name and text required' }); return; }
      const items = await readJson(TESTIMONIALS_PATH);
      let photoUrl = '';
      if (photo && photo.startsWith('data:image/')) {
        photoUrl = await uploadImage(photo, name);
      }
      const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: String(name).slice(0, 100),
        role: String(role || '').slice(0, 100),
        text: String(text).slice(0, 2000),
        rating: Math.max(1, Math.min(5, parseInt(rating, 10) || 5)),
        photo: photoUrl,
        createdAt: Date.now(),
      };
      items.unshift(item);
      await writeJson(TESTIMONIALS_PATH, items);
      res.status(200).json({ ok: true, item });
      return;
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) { res.status(400).json({ error: 'id required' }); return; }
      const items = await readJson(TESTIMONIALS_PATH);
      const next = items.filter((it) => it.id !== id);
      await writeJson(TESTIMONIALS_PATH, next);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  res.status(404).json({ error: 'not found' });
};
