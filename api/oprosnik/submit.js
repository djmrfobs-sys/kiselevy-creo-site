// Публичный endpoint: страница /oprosnik на сайте шлёт сюда ответы после «Отправить».
// Сохраняем лида + ответы (контекст), кидаем уведомление в рабочий чат и возвращаем
// готовую ссылку на бота заявок с диплинком, чтобы человек продолжил в Telegram.
const { requireAuth } = require('../_lib/auth'); // не используется: endpoint публичный
const store = require('../_lib/oprosnikStore');

const SITE_URL = process.env.SITE_URL || 'https://kiselevycreo.ru';

function sanitize(s, len) {
  return String(s == null ? '' : s).trim().slice(0, len || 4000);
}

// Все поля опросника (по 25 вопросам, ключи 1..25) приводим к компактному списку
function collectAnswers(body) {
  const raw = body.answers || {};
  const out = [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map((a) => String(a).trim());
  // объект вида { "1": "текст", ... } или { "q1": "..." }
  Object.keys(raw || {})
    .sort((a, b) => {
      const na = parseInt(String(a).replace(/\D/g, ''), 10);
      const nb = parseInt(String(b).replace(/\D/g, ''), 10);
      return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
    })
    .forEach((k) => {
      const v = String(raw[k] || '').trim();
      if (v) out.push(v);
    });
  return out;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  try {
    const body = req.body || {};

    const name = sanitize(body.name, 200);
    let contactRaw = ''; // телефон / email / telegram
    if (body.contact) {
      contactRaw = sanitize(body.contact, 500);
    } else {
      // поддержка отдельных полей phone/email/telegram
      const parts = [];
      if (body.phone) parts.push('тел: ' + sanitize(body.phone, 60));
      if (body.email) parts.push('email: ' + sanitize(body.email, 120));
      if (body.telegram) parts.push('telegram: ' + sanitize(body.telegram, 120));
      contactRaw = parts.join(', ');
    }
    const lang = ['ru', 'en', 'sr'].includes(body.lang) ? body.lang : 'ru';
    const mark = body.note || ''; // короткая пометка/рекламный источник

    // количество отвеченных
    const answersArr = collectAnswers(body);
    const answeredCount = answersArr.length;

    // Обязательное: имя + контакт, иначе нет смысла собирать
    if (!name || !contactRaw) {
      res.status(400).json({ error: 'need name and contact' });
      return;
    }

    // аггрегированное сообщение для рабочих/чата (команда)
    const leadText = `📋 Опросник с сайта (${lang.toUpperCase()})\n` +
      `Имя: ${name}\nКонтакт: ${contactRaw}\n` +
      `Отвечено: ${answeredCount} из 25\n` +
      (mark ? `Источник/пометка: ${mark}\n` : '') +
      `Ответы:\n` +
      (answersArr.map((a, i) => `${i + 1}. ${a}`).join('\n').slice(0, 3500) || '(пусто)');

    const leadId = store.makeLeadCode();
    const code = leadId;

    // сохранить лида в подборку + контекст по коду для диплинка бота
    const submission = {
      id: leadId,
      code,
      name,
      contact: contactRaw,
      lang,
      mark,
      answeredCount,
      answers: answersArr,
    };
    await store.addSubmission(submission);
    await store.saveLeadContext(submission);
    await store.pruneLeadContexts().catch(() => {});

    // уведомление в рабочий чат делаем без await и без фатала, чтобы не блокировать ответ
    forwardToTeam(leadText).catch((e) => console.error('forwardToTeam failed', e));

    // Весь диалог (опросник -> Опрус -> заявки) идёт через ОДИН живой бот сайта.
    const botUsername = process.env.SITE_ZAYAVKI_BOT_USERNAME || 'Site_Kiselevy_Creo_bot';
    const botLink = `https://t.me/${botUsername}?start=s${code}`;

    res.status(200).json({
      ok: true,
      code,
      name,
      contact: contactRaw,
      answeredCount,
      botLink,
      // текст, который страница покажет как «первый ответ CREO после опросника»
      introReply: makeIntroReply(lang, name, answeredCount),
    });
  } catch (e) {
    console.error('oprosnik submit failed', e);
    res.status(200).json({
      ok: false,
      error: 'server_error',
      introReply:
        'Спасибо! Получил твои ответы. Напиши мне в Telegram, чтобы продолжить удобно. - CREO',
    });
  }
};

function makeIntroReply(lang, name, answeredCount) {
  const first = name.split(' ')[0] || '';
  if (lang === 'en') {
    return `Thanks${first ? ', ' + first : ''}! I got your answers (${answeredCount} questions). Tap the button below to continue with me in Telegram - I already know your answers, so we can move straight to your task.`;
  }
  if (lang === 'sr') {
    return `Hvala${first ? ', ' + first : ''}! Dobio sam tvoje odgovore (${answeredCount} pitanja). Klikni dugme ispod da nastavimo u Telegramu - već znam tvoje odgovore, pa odmah prelazimo na tvoj zadatak.`;
  }
  return `Спасибо${first ? ', ' + first : ''}! Получил твои ответы (${answeredCount} вопросов). Жми кнопку ниже, чтобы продолжить со мной в Telegram - я уже знаю твои ответы и сразу перейдём к твоей задаче.`;
}

// Отправка лида в рабочий чат команды тем же ботом заявок (SITE_BOT_TOKEN)
async function forwardToTeam(text) {
  const token = process.env.SITE_BOT_TOKEN;
  const chatId = process.env.LEAD_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const limit = 3900;
  for (let i = 0; i < text.length; i += limit) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(i, i + limit) }),
    });
  }
}
