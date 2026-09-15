const { addLead } = require('./_lib/store');
const { limit } = require('./_lib/rate-limit');
const K = require('./_lib/knowledge');
const brain = require('./_lib/creo-brain');
const store = require('./_lib/oprosnikStore');

// ЯДРО ЛИЧНОСТИ CREO живёт в api/_lib/creo-brain.js - один общий мозг для сайта,
// Telegram-лички и внутренней группы команды. Здесь только сайтовый вход.
// Если посетитель пришёл из Telegram-бота, подхватываем ту же нить разговора.

// Полный системный промпт собирает общий мозг + правила сбора заявки.
// Язык определяем сами по последнему сообщению, чтобы валюта не зависела от догадок модели.
function buildSystemPrompt(lang, leadCtx, funnel) {
  return [
    brain.clientSystemPrompt(leadCtx || null, lang, funnel || { stage: 'diag' }),
    K.LEAD_CAPTURE_RULES,
  ].join('\n\n');
}

// Связка сайт <-> Telegram: посетитель вводит свой Telegram (@ник или ссылку),
// мы находим его диалог с ботом и продолжаем разговор с того же места.
function normalizeTelegramHandle(raw) {
  if (!raw) return '';
  return String(raw).trim().replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '').replace(/\/.*$/, '').toLowerCase();
}

// chat_id может прийти только числом (внутренний ключ). Наружу его не отдаём.
async function findLinkedDialog(formLead) {
  const handle = normalizeTelegramHandle(formLead && formLead.telegram);
  if (!handle) return null;
  try {
    return await store.findChatByTelegram(handle);
  } catch (e) {
    console.error('findLinkedDialog failed', e);
    return null;
  }
}

// Определяем язык по последнему сообщению пользователя.
// Есть кириллица - русский. Иначе, если латиница с сербскими признаками (č, ć, š, ž, đ и
// частые сербские слова) - сербский. Иначе - английский. По умолчанию русский.
function detectLang(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const text = (lastUser && lastUser.content) || '';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  const lower = text.toLowerCase();
  if (/[čćšžđ]/.test(lower) || /\b(koliko|kosta|kolika|cena|želim|zelim|kako|sta|šta|radite|mogu|treba|vase|vaše)\b/.test(lower)) return 'sr';
  if (/[a-z]/.test(lower)) return 'en';
  return 'ru';
}

function extractLead(text) {
  const match = text.match(/<<<LEAD>>>([\s\S]*?)<<<END>>>/);
  if (!match) return { clean: text, lead: null };
  const clean = text.replace(match[0], '').trim();
  try {
    const lead = JSON.parse(match[1]);
    return { clean, lead };
  } catch (e) {
    return { clean, lead: null };
  }
}

function mergeLeadWithForm(aiLead, formLead) {
  if (!formLead) return aiLead;
  const name = [formLead.firstName, formLead.lastName].filter(Boolean).join(' ').trim();
  const contactParts = [];
  if (formLead.phone) contactParts.push(formLead.phone);
  if (formLead.email) contactParts.push(formLead.email);
  if (formLead.telegram) contactParts.push(`Telegram: ${formLead.telegram}`);
  return {
    name: name || aiLead.name,
    sphere: aiLead.sphere,
    contact: contactParts.length ? contactParts.join(', ') : aiLead.contact,
    phone: formLead.phone || '',
    email: formLead.email || '',
    telegram: formLead.telegram || '',
    request: aiLead.request,
    product: aiLead.product || '',
  };
}

async function sendTelegram(text) {
  const token = process.env.SITE_BOT_TOKEN;
  const chatId = process.env.LEAD_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return r.ok;
  } catch (e) {
    console.error('telegram send failed', e);
    return false;
  }
}

async function sendLeadToTelegram(lead) {
  const name = lead.name || '-';
  const lines = [
    '🔥 ГОТОВЫЙ КЛИЕНТ - ГОТОВ КУПИТЬ',
    '',
    'Имя: ' + name,
    'Сфера: ' + (lead.sphere || '-'),
    'Телефон: ' + (lead.phone || '-'),
    'Email: ' + (lead.email || '-'),
    'Telegram: ' + (lead.telegram || '-'),
    '',
    'Продукт: ' + (lead.product || '-'),
    'Запрос: ' + (lead.request || '-'),
    '',
    'Свяжитесь с ним сами - по телефону, email или в Telegram. Он ждёт звонка.',
  ];
  await sendTelegram(lines.join('\n'));
}

// Раньше: контакт из формы уходил команде только в самом конце диалога. Если человек
// заполнил форму и закрыл вкладку - тёплый лид молча терялся. Теперь шлём упрощённое
// уведомление сразу при появлении контакта, с защитой от повторов по хешу контакта.
const warmLeadsSent = new Map();
const WARM_LEAD_TTL = 6 * 60 * 60 * 1000;

function warmLeadKey(formLead) {
  const c = [formLead && formLead.phone, formLead && formLead.email, formLead && formLead.telegram]
    .filter(Boolean).join('|').toLowerCase().replace(/[^a-z0-9@.|]/g, '');
  return c || '';
}

function hasContact(formLead) {
  return !!(formLead && (formLead.phone || formLead.email || formLead.telegram));
}

async function notifyWarmLead(formLead) {
  if (!hasContact(formLead)) return;
  const key = warmLeadKey(formLead);
  if (!key) return;
  const last = warmLeadsSent.get(key);
  const now = Date.now();
  if (last && now - last < WARM_LEAD_TTL) return;
  warmLeadsSent.set(key, now);
  if (warmLeadsSent.size > 500) {
    for (const [k, t] of warmLeadsSent) {
      if (now - t > WARM_LEAD_TTL) warmLeadsSent.delete(k);
    }
  }
  const name = [formLead.firstName, formLead.lastName].filter(Boolean).join(' ').trim();
  const contact = [formLead.phone, formLead.email, formLead.telegram && `Telegram: ${formLead.telegram}`]
    .filter(Boolean).join(', ');
  const text =
    `Тёплый лид: начал чат на сайте, ещё не договорил\n\n` +
    `Имя: ${name || '-'}\n` +
    `Контакт: ${contact || '-'}\n` +
    (formLead.request ? `Запрос: ${formLead.request}\n` : '') +
    `\nЧеловек оставил контакт, но не дошёл до конца диалога. Можно дожать вручную.`;
  await sendTelegram(text);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const rl = limit(req, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    res.status(429).json({ error: 'too many requests', retryAfterMs: rl.retryAfterMs });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      reply: 'Ассистент временно на техобслуживании. Напишите нам напрямую в Telegram - @KISELEVY_CREO.',
    });
    return;
  }

  const { messages, lead: formLead, warmLead } = req.body || {};

  // Отдельный сигнал от формы: человек оставил контакт. Сообщаем команде сразу же,
  // не дожидаясь, пока он дойдёт до конца диалога (раньше такие лиды терялись молча).
  if (warmLead) {
    await notifyWarmLead(formLead).catch((e) => console.error('warm lead notify failed', e));
    res.status(200).json({ ok: true });
    return;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages required' });
    return;
  }

  // Вторая страховка: если контакт пришёл обычным путём вместе с первым сообщением.
  if (messages.length === 1) {
    await notifyWarmLead(formLead).catch((e) => console.error('warm lead notify failed', e));
  }

  const safeMessages = messages
    .slice(-20)
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  // Связка с Telegram: если человек уже писал боту, история его диалога лежит в общем
  // хранилище. Подмешиваем её перед ходом с сайта - CREO продолжает ту же нить,
  // а не начинает разговор заново.
  let funnel = null;
  let systemHistory = [];
  const linked = await findLinkedDialog(formLead);
  if (linked && linked.chatId) {
    funnel = linked.funnel || null;
    systemHistory = brain.cleanHistory(linked.history || []);
  }

  const lang = detectLang(safeMessages);
  // первый ход с сайта без истории в Telegram - это диагностика, иначе продолжаем как есть
  if (!funnel) funnel = { stage: systemHistory.length ? 'diag' : 'diag' };

  const merged = brain.buildMessages(
    buildSystemPrompt(lang, null, funnel),
    systemHistory,
    null,
  ).concat(safeMessages.map((m) => ({ role: m.role, content: m.content })));

  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: merged,
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('deepseek error', upstream.status, errText);
      res.status(200).json({
        reply: 'Не получилось ответить, попробуйте ещё раз чуть позже или напишите нам в Telegram - @KISELEVY_CREO.',
      });
      return;
    }

    const data = await upstream.json();
    const rawReply = data?.choices?.[0]?.message?.content || '';
    const { clean, lead } = extractLead(rawReply);

    if (lead) {
      const finalLead = mergeLeadWithForm(lead, formLead);
      await sendLeadToTelegram(finalLead);
      await addLead(finalLead).catch((e) => console.error('addLead failed', e));
    }

    res.status(200).json({ reply: clean || 'Извините, не понял вопрос - расскажите подробнее?' });
  } catch (e) {
    console.error('chat handler failed', e);
    res.status(200).json({
      reply: 'Технический сбой. Напишите нам напрямую в Telegram - @KISELEVY_CREO.',
    });
  }
}
