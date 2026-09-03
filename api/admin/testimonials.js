const { requireAuth } = require('../_lib/auth');
const { TESTIMONIALS_PATH, readJson, writeJson, uploadImage } = require('../_lib/store');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const items = await readJson(TESTIMONIALS_PATH);
    res.status(200).json({ items });
    return;
  }

  if (req.method === 'POST') {
    const { name, role, text, rating, photo } = req.body || {};
    if (!name || !text) {
      res.status(400).json({ error: 'name and text required' });
      return;
    }
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
    if (!id) {
      res.status(400).json({ error: 'id required' });
      return;
    }
    const items = await readJson(TESTIMONIALS_PATH);
    const next = items.filter((it) => it.id !== id);
    await writeJson(TESTIMONIALS_PATH, next);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
