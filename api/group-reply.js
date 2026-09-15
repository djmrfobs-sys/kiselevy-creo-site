// Webhook бота заявок сайта KISELEVY CREO (@Site_zayavki_creo_bot).
//
// ДВА РЕЖИМА:
//  1) Внутренняя группа команды (LEAD_TELEGRAM_CHAT_ID) - остаётся прежним помощником
//     для Артура и Кети по ведению заявок.
//  2) Приватный чат с клиентом (мыло диплинка с опросника или простое обращение) -
//     бот ведёт клиента как CREO: знает имя и ответы из опросника, продолжает диалог,
//     подводит к заявке. Ответ уходит в личку клиента.
//
// Запуск 24/7: Vercel serverless / webhook от Telegram (см. setup-webhook.js).

const store = require('./_lib/oprosnikStore');
const K = require('./_lib/knowledge');
const questions = require('./_lib/oprosnikQuestions');
const brain = require('./_lib/creo-brain');

// ОБЩИЙ МОЗГ CREO: личность, знания, воронка, язык и история живут в api/_lib/creo-brain.js.
// Этот файл - только Telegram-вход: вебхук, отправка, режим команды и рассылка заявки.
const FUNNEL_STAGE_HINT = brain.FUNNEL_STAGE_HINT;
const TEAM_PROMPT = brain.TEAM_PROMPT;
const decideBranch = brain.decideBranch;
const guessLang = brain.guessLang;
const makeHello = brain.makeHello;

// ------------------------------------------------------------------
// СОСТОЯНИЕ ВОРОНКИ описано в creo-brain.js (FUNNEL_STAGE_HINT).
// клиентский системный промпт тоже собирает общий мозг.
// Клиентский системный промпт собирает общий мозг (creo-brain.js) - один голос
// и одни знания для сайта, Telegram и группы команды.
function clientSystemPrompt(leadCtx, lang, funnel) {
  return brain.clientSystemPrompt(leadCtx, lang, funnel);
}

// ------------------------------------------------------------------
function isFromBot(update) {
  const msg = update.message;
  return !!(msg && msg.from && msg.from.is_bot);
}

// Превращает голые ссылки в кликабельные. Telegram делает кликабельной ссылку только
// если её обернуть в HTML-тег <a href>, иначе текстовая ссылка на некоторых клиентах
// остаётся невыделенной. Экранируем HTML, затем оборачиваем URL.
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function linkify(text) {
  const safe = escapeHtml(text);
  return safe.replace(/(https?:\/\/[^\s<>()]+)/g, '<a href="$1">$1</a>');
}

// отправка ответа в конкретный чат (группу или личку)
async function sendMessage(token, chatId, text, opts) {
  const payload = {
    chat_id: chatId,
    text: linkify(text),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  };
  if (opts && opts.reply_markup) payload.reply_markup = opts.reply_markup;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // если Telegram отклонил разметку - отправляем без неё, чтобы клиент не остался без ответа
  if (!r.ok) {
    const body = await r.text();
    console.error('sendMessage HTML failed', r.status, body);
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  }
}

async function askDeepSeek(apiKey, systemPrompt, userText) {
  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText.slice(0, 3000) },
      ],
      temperature: 0.6,
      max_tokens: 500,
    }),
  });
  if (!upstream.ok) return null;
  const data = await upstream.json();
  return data?.choices?.[0]?.message?.content || null;
}

// распарсить /start с диплинком вида ?start=s<code>
function parseStartPayload(text) {
  const m = /^\/start\s*(?:s?([A-Za-z0-9_-]+))?/.exec(text || '');
  return m ? (m[1] || null) : null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Отправка уведомления о горячем лиде в рабочий чат команды.
async function notifyTeamHotLead({ token, apiKey, chatId, funnel, dialog, reply }) {
  const groupChatId = process.env.LEAD_TELEGRAM_CHAT_ID;
  if (!groupChatId) return;

  // 1) достаём расшифровку ответов опросника из system-сообщения (блок "ОТВЕТЫ ЧЕЛОВЕКА")
  let answersBlock = '';
  let leadCtxJson = null;
  for (const m of dialog || []) {
    if (m && m.role === 'system' && typeof m.content === 'string') {
      const ai = m.content.indexOf('ОТВЕТЫ ЧЕЛОВЕКА ИЗ ОПРОСНИКА');
      if (ai !== -1) {
        const start = m.content.indexOf('\n', ai) + 1;
        let end = m.content.indexOf('СЫРОЙ КОНТЕКСТ', start);
        if (end === -1) end = start + 1200;
        answersBlock = m.content.slice(start, end).trim();
      }
      const j = m.content.match(/\{["\s\S]*\}\s*$/);
      if (j) { try { leadCtxJson = JSON.parse(j[0]); } catch (e) {} }
      break;
    }
  }

  const dialogText = (dialog || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => (m.role === 'user' ? 'Клиент: ' : 'CREO: ') + String(m.content || '').slice(0, 800))
    .join('\n');

  const sum = (await extractLeadSummary(apiKey, leadCtxJson, dialogText)) || {};
  const name = sum.name || (funnel && funnel.name) || (leadCtxJson && leadCtxJson.name) || 'не указано';
  const contact = sum.contact || (leadCtxJson && leadCtxJson.contact) || 'в Telegram (чат с ботом)';

  const text = [
    '🔥 ГОРЯЧИЙ ЛИД из бота сайта - ГОТОВ КУПИТЬ',
    '',
    'Имя: ' + name,
    'Контакт: ' + contact,
    'Telegram chat_id: ' + chatId,
    'Телефон: ' + ((leadCtxJson && leadCtxJson.contact) ? leadCtxJson.contact : (sum.contact || 'нет')),
    'Продукт: ' + (funnel && funnel.product ? funnel.product : (sum.product || 'не указано')),
    '',
    'Ответы из опросника:',
    (answersBlock || '(нет)'),
    '',
    'Суть заявки: сфера - ' + (sum.sphere || 'не указано') + '; задача - ' + (sum.need || 'не указано') + '; бюджет/сроки - ' + (sum.budget || 'не указано'),
    '',
    'Следующий шаг: человек подтвердил покупку. НАПИШИТЕ ЕМУ САМИ по контактам выше (телефон / email / Telegram) - закрыть сделку и детали внедрения. В чате на сайте писать НЕЛЬЗЯ: команда его не видит.',
    'Последний ответ клиента: ' + String(reply || '').slice(0, 300),
  ].join('\n');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: groupChatId, text: text.slice(0, 3900) }),
  });
  await store.markLeadNotified(chatId, { product: sum.product || null });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true });
    return;
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const providedSecret = req.headers['x-telegram-bot-api-secret-token'];
  if (!expectedSecret || providedSecret !== expectedSecret) {
    res.status(401).json({ ok: false });
    return;
  }

  const token = process.env.SITE_BOT_TOKEN;
  const groupChatId = process.env.LEAD_TELEGRAM_CHAT_ID;
  const apiKey = process.env.DEEPSEEK_API_KEY;

  const update = req.body || {};
  const msg = update.message;

  // сразу отвечаем 200, дальше работаем в фоне
  res.status(200).json({ ok: true });

  if (!token || !apiKey || !msg || !msg.text) return;
  if (isFromBot(update)) return;

  const isCommand = msg.text.startsWith('/');
  const isGroup = String(msg.chat && msg.chat.id) === String(groupChatId);
  const chatId = String(msg.chat && msg.chat.id);

  // -------------------------------------------------------------
  // РЕЖИМ КОМАНДЫ: только сообщения из внутренней группы заявок
  // -------------------------------------------------------------
  if (isGroup) {
    if (isCommand) return; // слэш-команды в группе не трогаем ботом
    try {
      const reply = await askDeepSeek(apiKey, TEAM_PROMPT, msg.text);
      if (reply) await sendMessage(token, groupChatId, reply);
    } catch (e) {
      console.error('team mode failed', e);
    }
    return;
  }

  // не команда и не группа - игнорируем (например, групповые чаты без нас)
  if (msg.chat && msg.chat.type !== 'private') return;

  // -------------------------------------------------------------
  // РЕЖИМ КЛИЕНТА: приватный чат
  // -------------------------------------------------------------
  try {
    const firstNameVal = (msg.from && msg.from.first_name) || '';
    const senderName = (msg.from && (msg.from.first_name + ' ' + (msg.from.last_name || '')).trim()) || '';

    // 1) Обработка /start: если пришёл диплинк с кодом опросника - грузим контекст лида.
    // Бот ОБЯЗАН поздороваться первым и назвать человека по имени - всегда.
    if (msg.text.startsWith('/start')) {
      const code = parseStartPayload(msg.text);
      let leadCtx = null;
      if (code) {
        // опросник мог записаться в хранилище на мгновение позже перехода в бота -
        // ждём контекст короткими попытками, чтобы не потерять имя и ответы
        for (let attempt = 0; attempt < 4 && !leadCtx; attempt++) {
          leadCtx = await store.getLeadContext(code);
          if (!leadCtx) await sleep(700);
        }
      }

      // имя: сначала из опросника, иначе из Telegram-профиля (есть всегда)
      const ctxName = (leadCtx && leadCtx.name) || '';
      const name = ctxName || senderName || firstNameVal || '';

      // новый вход - начинаем разговор заново (только живой разговор, без инструкции)
      const lang = guessLang(msg.text, leadCtx);
      const hello = makeHello(name, code ? true : false, leadCtx && leadCtx.answers, lang);
      await sendMessage(token, chatId, hello);
      // стартовый этап воронки: есть ответы опросника - сразу подбор, иначе диагностика
      const startStage = leadCtx && leadCtx.answers && leadCtx.answers.length >= 3 ? 'match' : 'diag';
      await store.setFunnelState(chatId, { stage: startStage, branch: null, product: null, leadNotified: false });
      // в историю кладём только приветствие. Ответы опросника и системный промпт
      // подтянутся из состояния воронки на каждом следующем шаге.
      await store.setDialogHistory(chatId, [
        { role: 'assistant', content: hello },
      ]);
      // если пришёл по диплинку с опросником - запоминаем контекст в воронке,
      // чтобы дальше он подмешивался в системный промпт
      if (leadCtx) {
        await store.patchFunnelState(chatId, {
          name: name || '',
          leadName: (leadCtx && leadCtx.name) || '',
          leadContact: (leadCtx && leadCtx.contact) || '',
          leadAnswers: (leadCtx && leadCtx.answers) || [],
        });
      } else {
        await store.patchFunnelState(chatId, { name: name || '' });
      }
      // связка с сайтом: теперь чат на сайте найдёт этот диалог по нику
      if (msg.from && msg.from.username) {
        await store.linkTelegramHandle(chatId, msg.from.username).catch(() => {});
      }
      return;
    }

    // 2) Обычное сообщение клиента: тянем историю и состояние воронки из store
    const hist = await store.getDialogHistory(chatId);
    let funnel = await store.getFunnelState(chatId);
    if (!funnel) {
      funnel = { stage: 'diag', branch: null, product: null };
      await store.setFunnelState(chatId, funnel);
    }

    // Если человек пришёл по диплинку из опросника - имя и ответы лежат в состоянии
    // воронки. Собираем из них контекст для промпта, чтобы CREO помнил их весь диалог.
    const leadCtx = (funnel && (funnel.leadName || (funnel.leadAnswers && funnel.leadAnswers.length)))
      ? { name: funnel.leadName || '', contact: funnel.leadContact || '', answers: funnel.leadAnswers || [] }
      : null;

    // 2a) Определяем ветку по ответу человека и ведём этап дальше
    let repliedText = '';
    if (funnel.stage === 'filter' || funnel.stage === 'match') {
      const branch = decideBranch(msg.text);
      if (branch) {
        funnel = Object.assign({}, funnel, { stage: branch, branch: branch });
        // ставим прогреВ в расписание: с этого момента идёт серия warmup
        await store.setFunnelState(chatId, {
          stage: branch,
          branch: branch,
          branchAt: Date.now(),
          warmupStartAt: branch === 'warm' || branch === 'cold' ? Date.now() : undefined,
          warmupStep: 0,
          warmupDone: false,
        });
      } else if (funnel.stage === 'match') {
        // ответил не по шаблону - остаёмся в фильтре и просим выбрать
        await store.setFunnelState(chatId, { stage: 'filter' });
        funnel = Object.assign({}, funnel, { stage: 'filter' });
      }
    }

    // Системный промпт собирается ЗАНОВО на каждый запрос и живёт отдельно от истории.
    // В историю он не пишется: иначе он раздувал каждый запрос (~18 000 знаков) и ронял ответы.
    const sysFresh = clientSystemPrompt(leadCtx, guessLang(msg.text, leadCtx), funnel);
    const msgs = brain.buildMessages(sysFresh, hist, msg.text);

    const reply = brain.cleanReply(await askDeepSeekRaw(apiKey, msgs));
    if (reply) {
      // В историю кладём только разговор: прошлые реплики + это сообщение + ответ.
      const keep = brain.cleanHistory(hist)
        .concat([{ role: 'user', content: msg.text.slice(0, 3000) }])
        .concat([{ role: 'assistant', content: reply }]);
      await store.setDialogHistory(chatId, keep);
      await sendMessage(token, chatId, reply);
      repliedText = reply;
    }

    // 2b) Горячий лид: человек выбрал "обсудить" - извлекаем заявку и уведомляем команду
    if (funnel.stage === 'hot' && !(await store.isLeadNotified(chatId))) {
      await notifyTeamHotLead({
        token, apiKey, chatId, leadCtx, funnel,
        dialog: brain.cleanHistory(hist).concat([{ role: 'user', content: msg.text }]),
        reply: repliedText,
      }).catch((e) => console.error('notifyTeamHotLead failed', e));
    }
  } catch (e) {
    console.error('client mode failed', e);
    try { await sendMessage(token, chatId, 'Маленький сбой, попробуй ещё раз чуть позже.'); } catch (_) {}
  }
};

// отдельный вызов DeepSeek по уже готовому массиву messages (с системой)
async function askDeepSeekRaw(apiKey, messages) {
  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.6,
      max_tokens: 500,
    }),
  });
  if (!upstream.ok) return null;
  const data = await upstream.json();
  return data?.choices?.[0]?.message?.content || null;
}


