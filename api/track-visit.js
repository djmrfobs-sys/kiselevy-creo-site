const { recordVisit } = require('./_lib/store');
const { limit } = require('./_lib/rate-limit');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  // Защита от накрутки счётчика посещений: не более 60 визитов/мин с одного IP.
  const rl = limit(req, { limit: 60, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    res.status(204).end();
    return;
  }

  try {
    await recordVisit();
  } catch (e) {
    console.error('recordVisit failed', e);
  }
  res.status(204).end();
};
