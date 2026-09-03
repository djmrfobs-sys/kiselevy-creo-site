const { requireAuth } = require('../_lib/auth');
const { readLeads, writeLeads } = require('../_lib/store');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const items = await readLeads();
    res.status(200).json({ items });
    return;
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: 'id required' });
      return;
    }
    const items = await readLeads();
    const next = items.filter((it) => it.id !== id);
    await writeLeads(next);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
