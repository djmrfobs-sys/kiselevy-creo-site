// АВТОМАТИЧЕСКИЙ ПРОГРЕВ ЛИДОВ (гибрид: бот доводит сам, до финала).
//
// Что делает: раз в сутки проходит по всем активным чатам воронки и присылает тёплым и
// холодным следующее сообщение серии. Горячих не трогает - их ведёт команда.
//
// Запуск: cron на Vercel (see vercel.json crons) либо вручную GET с секретом.
// Защита: заголовок x-warmup-secret = WARMUP_CRON_SECRET (или ?key=).
//
// Логика на одного человека:
//   - ветка warm/cold, прогрев не закончен;
//   - пришло время следующего шага (day серии <= сколько дней прошло);
//   - человек сам не писал последние 12 часов (иначе он активен - пусть ведёт диалог бот).
// Отправка -> обновляем funnel: warmupStep++, warmupLastAt, иначе человек выпал (done).

const store = require('./_lib/oprosnikStore');
const warmup = require('./_lib/warmupTemplates');

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// Не пишем, если человек сам недавно писал - он активен в диалоге.
const QUIET_HOURS = 12;

function daysBetween(fromMs, toMs) {
  return Math.floor((toMs - fromMs) / DAY);
}

// Ссылки в прогреве тоже должны быть кликабельными - оборачиваем в HTML-тег <a>.
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function linkify(text) {
  return escapeHtml(text).replace(/(https?:\/\/[^\s<>()]+)/g, '<a href="$1">$1</a>');
}

async function sendMessage(token, chatId, text) {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: linkify(text),
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    }),
  });
  try {
    const d = await r.json();
    if (d && d.ok) return true;
    // если разметка не прошла - отправляем как есть
    const r2 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    const d2 = await r2.json();
    return !!(d2 && d2.ok);
  } catch (e) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  const secret = process.env.WARMUP_CRON_SECRET;
  if (secret) {
    const provided = req.headers['x-warmup-secret'] || (req.query && req.query.key);
    if (provided !== secret) {
      res.status(401).json({ ok: false, error: 'unauthorized' });
      return;
    }
  }

  const token = process.env.SITE_BOT_TOKEN;
  if (!token) {
    res.status(200).json({ ok: false, error: 'no bot token' });
    return;
  }

  const now = Date.now();
  let states = [];
  try {
    states = await store.listFunnelStates();
  } catch (e) {
    res.status(200).json({ ok: false, error: 'store read failed' });
    return;
  }

  const stats = { checked: 0, sent: 0, skipped: 0, finished: 0, errors: 0 };
  const log = [];

  for (const st of states) {
    stats.checked += 1;
    try {
      const branch = st.branch || st.stage;
      if (branch !== 'warm' && branch !== 'cold') { stats.skipped += 1; continue; }
      if (st.warmupDone) { stats.skipped += 1; continue; }
      if (st.warmupPaused) { stats.skipped += 1; continue; }

      const series = warmup.seriesFor(branch);
      if (!series || !series.length) { stats.skipped += 1; continue; }

      const stepIndex = st.warmupStep || 0;
      const startAt = st.warmupStartAt || st.branchAt || st.updatedAt || now;
      const elapsedDays = daysBetween(startAt, now);

      // последнее касание диалога - если человек писал недавно, не мешаем ему
      const hist = await store.getDialogHistory(st.chatId);
      const lastUserTs = (hist || [])
        .filter((m) => m && m.role === 'user')
        .reduce((acc, m) => Math.max(acc, m.ts || 0), 0);
      if (lastUserTs && now - lastUserTs < QUIET_HOURS * HOUR) { stats.skipped += 1; continue; }

      // пришло ли время следующего шага
      const next = series[stepIndex];
      if (!next) {
        await store.patchFunnelState(st.chatId, { warmupDone: true, warmupFinishedAt: now });
        stats.finished += 1;
        continue;
      }
      if (elapsedDays < next.day) { stats.skipped += 1; continue; }

      const text = warmup.buildStepText(next, st.name || '');
      if (!text) { stats.skipped += 1; continue; }

      const ok = await sendMessage(token, st.chatId, text);
      if (!ok) { stats.errors += 1; continue; }

      stats.sent += 1;
      log.push({ chatId: st.chatId, branch, step: stepIndex, day: next.day });

      const isLast = stepIndex >= series.length - 1;
      await store.patchFunnelState(st.chatId, {
        warmupStep: stepIndex + 1,
        warmupLastAt: now,
        warmupStartAt: startAt,
        warmupDone: isLast,
        warmupFinishedAt: isLast ? now : undefined,
      });
      if (isLast) stats.finished += 1;
    } catch (e) {
      stats.errors += 1;
      console.error('warmup step failed', st && st.chatId, e);
    }
  }

  res.status(200).json({ ok: true, stats, log: log.slice(0, 50) });
};
