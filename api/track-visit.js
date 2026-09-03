const { recordVisit } = require('./_lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  try {
    await recordVisit();
  } catch (e) {
    console.error('recordVisit failed', e);
  }
  res.status(204).end();
};
