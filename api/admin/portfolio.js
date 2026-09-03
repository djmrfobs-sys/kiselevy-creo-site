const { requireAuth } = require('../_lib/auth');
const { PORTFOLIO_PATH, readJson, writeJson, uploadImage } = require('../_lib/store');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const items = await readJson(PORTFOLIO_PATH);
    res.status(200).json({ items });
    return;
  }

  if (req.method === 'POST') {
    const { title, category, description, image } = req.body || {};
    if (!title || !description || !image) {
      res.status(400).json({ error: 'title, description and image required' });
      return;
    }
    if (!image.startsWith('data:image/')) {
      res.status(400).json({ error: 'image must be a data url' });
      return;
    }
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
    if (!id) {
      res.status(400).json({ error: 'id required' });
      return;
    }
    const items = await readJson(PORTFOLIO_PATH);
    const next = items.filter((it) => it.id !== id);
    await writeJson(PORTFOLIO_PATH, next);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
