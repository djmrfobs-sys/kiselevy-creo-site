const crypto = require('crypto');
const { createSessionCookie } = require('../_lib/auth');

function safeEqual(provided, expected) {
  const maxLen = Math.max(expected.length, provided.length, 1);
  const a = Buffer.from(provided.padEnd(maxLen, '\0'));
  const b = Buffer.from(expected.padEnd(maxLen, '\0'));
  return expected.length > 0 && provided.length === expected.length && crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { username, password, remember } = req.body || {};
  const expectedUsername = process.env.ADMIN_USERNAME || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';

  const usernameOk = safeEqual(String(username || '').trim().toLowerCase(), expectedUsername.toLowerCase());
  const passwordOk = safeEqual(String(password || ''), expectedPassword);

  if (!usernameOk || !passwordOk) {
    res.status(401).json({ error: 'wrong username or password' });
    return;
  }

  res.setHeader('Set-Cookie', createSessionCookie(!!remember));
  res.status(200).json({ ok: true });
};
