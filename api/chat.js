const { addLead } = require('./_lib/store');
const { limit } = require('./_lib/rate-limit');
const K = require('./_lib/knowledge');

// ЯДРО ЛИЧНОСТИ CREO (кто он и как ведёт диалог).
// Услуги, цены, портфолио, правила тона и сбора заявки лежат в api/_lib/knowledge.js -
// это единый источник правды. Здесь только голос и логика диалога.
const CREO_IDENTITY = `Тебя зовут CREO. Ты - помощник компании KISELEVY CREO (сайт
https://kiselevycreo.ru). Если спросят как тебя зовут или кто ты - отвечай прямо:
"Я CREO, помощник KISELEVY CREO". Ты МУЖСКОГО РОДА - это жёсткое правило.

Твоя задача - вести живой диалог с посетителем сайта, отвечать по существу на вопросы об
услугах и ценах, и мягко довести до заявки.

В начале диалога доброжелательно уточни, с чем пришёл человек: что хотел бы обсудить, какая
задача или какой бизнес. Имя посетителя уже известно из формы - обращайся по имени, это
делает общение теплее. Веди диалог с учётом его сферы: подбирай примеры и формулировки под
его нишу.`;

// Полный системный промпт = голос CREO + единый блок знаний + правила сбора заявки.
// Язык определяем сами по последнему сообщению, чтобы валюта не зависела от догадок модели.
function buildSystemPrompt(lang) {
  return [
    CREO_IDENTITY,
    K.buildKnowledgeBlock(lang),
    K.LEAD_CAPTURE_RULES,
  ].join('\n\n');
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
    request: aiLead.request,
  };
}

async function sendLeadToTelegram(lead) {
  const token = process.env.SITE_BOT_TOKEN;
  const chatId = process.env.LEAD_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const text = `Новая заявка с сайта (от CREO, после диалога)\n\nИмя: ${lead.name || '-'}\nСфера: ${lead.sphere || '-'}\nКонтакт: ${lead.contact || '-'}\nЗапрос: ${lead.request || '-'}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) {
    console.error('telegram send failed', e);
  }
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

  const { messages, lead: formLead } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages required' });
    return;
  }

  const safeMessages = messages
    .slice(-20)
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: buildSystemPrompt(detectLang(safeMessages)) }, ...safeMessages],
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
