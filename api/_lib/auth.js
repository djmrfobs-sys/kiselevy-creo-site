const crypto = require('crypto');

const COOKIE_NAME = 'creo_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 часов - обычная сессия
const REMEMBER_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 дней - "запомнить меня"

function getAuthSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return null;
  }
  return secret;
}

function sign(payloadB64) {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not set');
  }
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');
}

function createSessionCookie(remember) {
  const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  const payload = JSON.stringify({ exp: Date.now() + ttl });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  let sig;
  try {
    sig = sign(payloadB64);
  } catch (e) {
    return null;
  }
  const token = `${payloadB64}.${sig}`;
  const maxAge = Math.floor(ttl / 1000);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  });
  return out;
}

function isBotAuthenticated(req) {
  const expected = process.env.PORTFOLIO_BOT_TOKEN || '';
  if (!expected) return false;
  const header = req.headers.authorization || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!provided || provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

function isAuthenticated(req) {
  if (isBotAuthenticated(req)) return true;
  const secret = getAuthSecret();
  if (!secret) return false;
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token || !token.includes('.')) return false;
  const [payloadB64, sig] = token.split('.');
  let expectedSig;
  try {
    expectedSig = sign(payloadB64);
  } catch (e) {
    return false;
  }
  const sigBuf = Buffer.from(sig || '', 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}

function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

module.exports = { createSessionCookie, clearSessionCookie, isAuthenticated, requireAuth };
