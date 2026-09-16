// /api/voice-token - выдаёт эфемерный токен для Gemini Live.
// Ключ Gemini живёт только здесь (env), в браузер не уходит.
// Защита: токен доступа из query, плюс rate-limit по IP.

const { limit } = require('./_lib/rate-limit');

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const ACCESS_TOKEN = process.env.VOICE_TEST_TOKEN || '';

// Эфемерные токены Gemini (v1alpha auth_tokens)
const EPHEMERAL_URL = 'https://generativelanguage.googleapis.com/v1alpha/auth_tokens';
const DEFAULT_MODEL = 'models/gemini-3.1-flash-live-preview';
const ALLOWED_MODELS = new Set([
  'models/gemini-3.1-flash-live-preview',
  'models/gemini-3.8-live',
  'models/gemini-3.8-live-extended-thinking',
  'models/gemini-2.5-flash-native-audio-latest',
]);

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Rate-limit: 10 запусков сессии на IP за 10 минут.
  const rl = limit(req, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    res.setHeader('Retry-After', Math.ceil(rl.retryAfterMs / 1000));
    return res.status(429).json({ error: 'rate_limited' });
  }

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'server_not_configured' });
  }

  // Доступ по токену: либо из query, либо из тела.
  const urlToken = (req.query && req.query.t) || '';
  const bodyToken = (req.body && req.body.t) || '';
  const provided = String(urlToken || bodyToken || '');
  if (ACCESS_TOKEN && !timingSafeEqual(provided, ACCESS_TOKEN)) {
    return res.status(403).json({ error: 'forbidden' });
  }

  // Модель - только из белого списка.
  const requested = (req.body && req.body.model) || DEFAULT_MODEL;
  const model = ALLOWED_MODELS.has(requested) ? requested : DEFAULT_MODEL;

  // Время жизни эфемерного токена: 30 минут.
  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  try {
    // Поставим таймаут на запрос к upstream (8s).
    const controller = new AbortController();
    const id = setTimeout(()=>controller.abort(), 8000);
    try {
      const r = await fetch(EPHEMERAL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_KEY,
        },
        body: JSON.stringify({
          uses: 1,
          expireTime,
          newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        }),
        signal: controller.signal
      });
      clearTimeout(id);

      const text = await r.text();
      if (!r.ok) {
        console.error('ephemeral token failed', r.status, text.slice(0, 400));
        // Пробрасываем код назад клиенту для более точной диагностики
        return res.status(502).json({ error: 'token_issue_failed', status: r.status, body: text.slice(0,400) });
      }

      let data;
      try { data = JSON.parse(text); } catch (e) {
        console.error('bad upstream json', text.slice(0,400));
        return res.status(502).json({ error: 'bad_upstream_response' });
      }

      const token = data.name || data.token;
      if (!token) {
        console.error('no token in upstream response', data);
        return res.status(502).json({ error: 'no_token_returned' });
      }

      return res.status(200).json({ token, model, expiresAt: expireTime });
    } catch (e) {
      if (e && e.name === 'AbortError'){
        console.error('ephemeral token request timed out');
        return res.status(504).json({ error: 'upstream_timeout' });
      }
      console.error('voice-token error', e);
      return res.status(500).json({ error: 'internal_error' });
    }
  } catch (e) {
    console.error('voice-token error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
};
