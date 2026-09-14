// api/oprus/[...seg].js - единый роутер модуля «Опрус» (консолидировано из 4 файлов: start, chat, cabinet, admin).
// Сохранены прежние адреса: /api/oprus/start, /api/oprus/chat, /api/oprus/cabinet, /api/oprus/admin.
// Бэкап оригиналов: backup/api_backup_20260909-131923.tar.gz

const { limit } = require('../_lib/rate-limit');
const { requireAuth } = require('../_lib/auth');
const { addClient, referralStatus, referralStatsFor, getClientByCode, listAll, confirmReferral } = require('../_lib/oprusStore');
const { generateDecoding, inviteLink, chatMessage } = require('../_lib/oprusAi');

function segOf(req) {
  try {
    const p = new URL(req.url, 'http://x').pathname.replace(/\/+$/, '');
    const parts = p.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch (e) {
    return '';
  }
}

function answersToMap(list) {
  const m = {};
  (list || []).forEach((a) => {
    if (a && a.q) m[a.q] = Array.isArray(a.a) ? a.a.join('; ') : String(a.a || '');
  });
  return m;
}

function qMapToArray(map) {
  return Object.keys(map || {}).map((q) => ({ q, a: map[q] }));
}

function defaultDecodingFallback(lang, name) {
  if (lang === 'en') return 'Thank you, ' + (name || 'friend') + '! Your answers are saved. Our assistant CREO will prepare your full personalized breakdown and a product recommendation - you can also message him right in the chat.';
  if (lang === 'sr') return 'Hvala, ' + (name || 'prijatelju') + '! Vaši odgovori su sačuvani. Naš asistent CREO će vam uskoro pripremiti lični pregled i preporuku - možete mu pisati i direktno u ćaskanju.';
  return 'Спасибо, ' + (name || 'друг') + '! Ваши ответы сохранены. Помощник CREO подготовил персональную расшифровку и рекомендацию выше - а здесь, в чате, вы можете задать ему любой вопрос по этой диагностике и услугам.';
}

module.exports = async function handler(req, res) {
  const seg = segOf(req);

  // ---- POST /api/oprus/start ----
  if (seg === 'start') {
    if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
    const rl = limit(req, { limit: 12, windowMs: 60 * 1000 });
    if (!rl.allowed) { res.status(429).json({ error: 'too many requests', retryAfterMs: rl.retryAfterMs }); return; }
    const body = req.body || {};
    const firstName = String(body.firstName || '').trim().slice(0, 80);
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const telegram = String(body.telegram || '').trim();
    const contactParts = [phone && ('тел: ' + phone), email && ('email: ' + email), telegram && ('telegram: ' + telegram)].filter(Boolean);
    const contact = contactParts.join(', ');
    const answersArr = Array.isArray(body.answers) ? body.answers : [];
    const lang = ['ru', 'en', 'sr'].includes(body.lang) ? body.lang : 'ru';
    const ref = String(body.ref || '').trim().toUpperCase();
    if (!firstName || !contact) { res.status(400).json({ error: 'name and at least one contact required' }); return; }
    if (!answersArr.length) { res.status(400).json({ error: 'answers required' }); return; }
    try {
      const record = await addClient({ firstName, contact, phone, email, telegram, answers: answersToMap(answersArr), answersRaw: answersArr, lang, ref: ref || null });
      const code = record.client.code.toUpperCase();
      let decoding = '';
      try {
        decoding = await generateDecoding({ firstName: record.client.firstName, answers: answersArr, lang: lang === 'ru' ? 'ru' : (lang === 'en' ? 'en' : 'sr') });
      } catch (e) { console.error('oprus decode failed', e); decoding = ''; }
      let stats = { code, confirmed: 0, discountPctTotal: 0 };
      try { stats = await referralStatsFor(code); } catch (e) { /* ignore */ }
      res.status(200).json({ ok: true, code, inviteLink: inviteLink(code), refApplied: record.refApplied, stats: stats || { code, confirmed: 0, discountPctTotal: 0 }, decoding: decoding || defaultDecodingFallback(lang, record.client.firstName) });
    } catch (e) {
      console.error('oprus start failed', e);
      res.status(500).json({ error: 'internal' });
    }
    return;
  }

  // ---- POST /api/oprus/chat ----
  if (seg === 'chat') {
    if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
    const rl = limit(req, { limit: 60, windowMs: 60 * 1000 });
    if (!rl.allowed) { res.status(429).json({ error: 'too many requests', retryAfterMs: rl.retryAfterMs }); return; }
    const body = req.body || {};
    const code = String(body.code || '').trim().toUpperCase();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lang = ['ru', 'en', 'sr'].includes(body.lang) ? body.lang : 'ru';
    const client = await getClientByCode(code);
    if (!client) {
      res.status(200).json({ reply: 'Продолжить диалог с расшифровкой можно из личного кабинета по вашему коду CREO-XXXXX.' });
      return;
    }
    const safeMessages = messages
      .slice(-16)
      .filter((m) => m && typeof m.text === 'string' && (m.actor === 'user' || m.actor === 'bot'))
      .map((m) => ({ role: m.actor === 'user' ? 'user' : 'assistant', content: m.text.slice(0, 2000) }));
    try {
      const reply = await chatMessage({ messages: safeMessages, answers: client.answers ? qMapToArray(client.answers) : null, firstName: client.firstName || null, lang });
      res.status(200).json({ reply: reply || 'Помощник временно молчит. Напишите нам в Telegram - @KISELEVY_CREO.' });
    } catch (e) {
      console.error('oprus chat failed', e);
      res.status(200).json({ reply: 'Маленький сбой, попробуйте ещё раз чуть позже или напишите нам в Telegram - @KISELEVY_CREO.' });
    }
    return;
  }

  // ---- POST /api/oprus/cabinet ----
  if (seg === 'cabinet') {
    if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
    const body = req.body || {};
    const code = String(body.code || '').trim().toUpperCase();
    if (!code || !/^CREO-[A-HJ-NP-Z2-9]{5}$/i.test(code)) { res.status(404).json({ error: 'not found' }); return; }
    const client = await getClientByCode(code);
    if (!client) { res.status(404).json({ error: 'not found' }); return; }
    const stats = await referralStatsFor(code);
    res.status(200).json({
      ok: true,
      profile: { code: client.code.toUpperCase(), firstName: client.firstName, referredByCode: client.ref || null, createdAt: client.createdAt },
      invite: { link: inviteLink(client.code.toUpperCase()), code: client.code.toUpperCase() },
      referrals: { confirmed: stats.confirmed, confirmedFriends: stats.confirmedFriends, discountPctTotal: stats.discountPctTotal },
    });
    return;
  }

  // ---- /api/oprus/admin ----
  if (seg === 'admin') {
    if (!requireAuth(req, res)) return;
    if (req.method === 'GET') {
      const data = await listAll({ limit: 500 });
      res.status(200).json(data);
      return;
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      const action = b.action || 'confirm';
      const referrerCode = String(b.referrerCode || '').trim().toUpperCase();
      const friendCode = String(b.friendCode || '').trim().toUpperCase();
      if (!referrerCode || !friendCode) { res.status(400).json({ error: 'referrerCode and friendCode required' }); return; }
      if (action === 'confirm') {
        const r = await confirmReferral(referrerCode, friendCode, true);
        if (!r.ok) { res.status(404).json({ error: r.reason || 'referral not found' }); return; }
        res.status(200).json({ ok: true, already: !!r.already });
        return;
      }
      if (action === 'unconfirm') {
        const r = await confirmReferral(referrerCode, friendCode, false);
        if (!r.ok) { res.status(404).json({ error: r.reason || 'referral not found' }); return; }
        res.status(200).json({ ok: true, already: !!r.already });
        return;
      }
      res.status(400).json({ error: 'unknown action' });
      return;
    }
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  // задел под будущее: referralStatus не используется напрямую, но подключён через oprusStore
  void referralStatus;
  res.status(404).json({ error: 'not found' });
};
