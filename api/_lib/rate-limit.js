// Простой in-memory rate limiter по IP (на одно серверное инстанс Vercel).
// Надёжно защищает от накрутки платного API и перебора пароля в рамках одного
// инстанса. Для полного охвата требуется внешнее хранилище (KV/blob), но даже
// in-memory резко снижает риск скриптовой атаки.

const buckets = new Map();

// Периодически чистим устаревшие записи, чтобы Map не рос бесконечно.
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of buckets) {
    if (now > rec.resetAt) buckets.delete(key);
  }
}, 60 * 1000).unref();

/**
 * @param {{headers: {[k:string]: string|string[]|undefined}}} req
 * @param {{limit: number, windowMs: number}} opts
 * @returns {{allowed: boolean, retryAfterMs: number, remaining: number}}
 */
function limit(req, { limit, windowMs }) {
  const xff = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(xff) ? xff[0] : (xff || '').split(',')[0]).trim() || 'unknown';
  const key = `${ip}`;

  const now = Date.now();
  let rec = buckets.get(key);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + windowMs };
    buckets.set(key, rec);
  }

  rec.count += 1;
  const remaining = Math.max(0, limit - rec.count);
  const allowed = rec.count <= limit;
  return { allowed, retryAfterMs: Math.max(0, rec.resetAt - now), remaining };
}

module.exports = { limit };
