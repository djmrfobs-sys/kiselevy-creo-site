const crypto = require('crypto');
const { createSessionCookie } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD || '';
  const provided = String(password || '');

  const maxLen = Math.max(expected.length, provided.length, 1);
  const a = Buffer.from(provided.padEnd(maxLen, '\0'));
  const b = Buffer.from(expected.padEnd(maxLen, '\0'));
  const same = expected.length > 0 && provided.length === expected.length && crypto.timingSafeEqual(a, b);

  if (!same) {
    res.status(401).json({ error: 'wrong password' });
    return;
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  res.status(200).json({ ok: true });
};
