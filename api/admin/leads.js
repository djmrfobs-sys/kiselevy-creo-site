const { requireAuth } = require('../_lib/auth');
const { LEADS_PATH, readJson, writeJson } = require('../_lib/store');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const items = await readJson(LEADS_PATH);
    res.status(200).json({ items });
    return;
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: 'id required' });
      return;
    }
    const items = await readJson(LEADS_PATH);
    const next = items.filter((it) => it.id !== id);
    await writeJson(LEADS_PATH, next);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
