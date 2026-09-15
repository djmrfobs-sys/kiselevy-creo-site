// Хранилище опросника на сайте (KISELEVY CREO)
// Хранит: лидов с ответами + контексты диалогов бота заявок с клиентами (приватный режим).
// Полагается на Vercel Blob как и остальной сайт (_lib/store.js).
const { put, list } = require('@vercel/blob');

const CONTEXTS_PATH = 'data/oprosnik-contexts.json';
const SUBMISSIONS_PATH = 'data/oprosnik-submissions.json';

function privateToken() {
  return process.env.PRIVATE_READ_WRITE_TOKEN || '';
}

async function readJsonBlob(pathname) {
  try {
    // cache: 'no-store' + обход кэша CDN: после записи в blob по старому адресу
    // может отдаваться старая версия. Поэтому запрашиваем свежий url списком,
    // а к ответу добавляем метку времени.
    const { blobs } = await list({ prefix: pathname, limit: 1, token: privateToken() });
    const match = blobs.find((b) => b.pathname === pathname);
    if (!match) return [];
    const bust = (match.uploadedAt ? new Date(match.uploadedAt).getTime() : Date.now());
    const url = match.url + (match.url.includes('?') ? '&' : '?') + 'v=' + bust;
    const resp = await fetch(url, {
      cache: 'no-store',
      headers: Object.assign(
        { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        privateToken() ? { Authorization: `Bearer ${privateToken()}` } : {},
      ),
    });
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('oprosnikStore readJsonBlob failed', pathname, e);
    return [];
  }
}

async function readObjectBlob(pathname) {
  const arr = await readJsonBlob(pathname);
  return Array.isArray(arr) ? arr[0] : arr || {};
}

async function writeJsonBlob(pathname, data) {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: privateToken(),
  });
}

// ---- Заявки из опросника (для команды/просмотра) ----
async function addSubmission(sub) {
  const subs = await readJsonBlob(SUBMISSIONS_PATH);
  subs.unshift({ id: newId(), createdAt: Date.now(), ...sub });
  await writeJsonBlob(SUBMISSIONS_PATH, subs.slice(0, 2000));
  return subs[0];
}

async function readSubmissions() {
  return readJsonBlob(SUBMISSIONS_PATH);
}

// ---- Контекст лида: имя, контакт, ответы опросника по коду (диплинк start) ----
async function saveLeadContext(lead) {
  const map = await readObjectBlob(CONTEXTS_PATH);
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    // на случай если файл оказался массивом - пересоздаём как объект
    await writeJsonBlob(CONTEXTS_PATH, {});
    return saveLeadContext(lead);
  }
  map[lead.code] = {
    code: lead.code,
    id: lead.id,
    name: lead.name,
    contact: lead.contact || '',
    leadMessage: lead.leadMessage || '',
    answers: lead.answers || [],
    createdAt: Date.now(),
  };
  await writeJsonBlob(CONTEXTS_PATH, map);
  return map[lead.code];
}

async function getLeadContext(code) {
  if (!code) return null;
  const map = await readObjectBlob(CONTEXTS_PATH);
  if (!map || typeof map !== 'object') return null;
  const ctx = map[code];
  if (!ctx) return null;
  // выдача с рассрочкой: диплинк может прийти в вебхук немного позже отправки
  return ctx;
}

// Тяжёлые ответы не тащим в память навсегда - лимит записей в контекстах
async function pruneLeadContexts(limit) {
  limit = limit || 3000;
  const map = await readObjectBlob(CONTEXTS_PATH);
  if (!map || typeof map !== 'object') return;
  const keys = Object.keys(map);
  if (keys.length <= limit) return;
  const sorted = keys.sort((a, b) => (map[b].createdAt || 0) - (map[a].createdAt || 0));
  const toDrop = sorted.slice(limit);
  toDrop.forEach((k) => delete map[k]);
  await writeJsonBlob(CONTEXTS_PATH, map);
}

// ---- История приватного диалога бота с конкретным чатом ----
// ВАЖНО ПО НАДЁЖНОСТИ: каждый диалог живёт в ОТДЕЛЬНОМ файле. Раньше всё лежало
// в одном общем файле, который на каждое сообщение читался и переписывался целиком.
// Когда человек писал подряд, запросы шли одновременно и затирали друг друга -
// история пропадала, и диалог обрывался. Теперь у каждого чата свой файл.
function dialogPath(chatId) {
  const safe = String(chatId).replace(/[^0-9A-Za-z_-]/g, '');
  return 'data/dialogs/' + safe + '.json';
}

async function readDialogDoc(chatId) {
  const doc = await readObjectBlob(dialogPath(chatId));
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { msgs: [], funnel: null };
  return {
    msgs: Array.isArray(doc.msgs) ? doc.msgs : [],
    funnel: doc.funnel && typeof doc.funnel === 'object' ? doc.funnel : null,
  };
}

async function writeDialogDoc(chatId, doc) {
  await writeJsonBlob(dialogPath(chatId), {
    msgs: Array.isArray(doc.msgs) ? doc.msgs : [],
    funnel: doc.funnel || null,
    updatedAt: Date.now(),
  });
}

async function getDialogHistory(chatId) {
  const doc = await readDialogDoc(chatId);
  return doc.msgs;
}

async function setDialogHistory(chatId, msgs) {
  // В истории живёт ТОЛЬКО разговор (user/assistant). Системный промпт собирается
  // заново на каждый запрос и здесь не хранится - иначе он раздувает каждый запрос
  // и роняет ответы (это и была причина обрыва диалога).
  const keep = (Array.isArray(msgs) ? msgs : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .filter((m) => m.content.trim().length > 0)
    .slice(-40); // разумный предел истории
  const doc = await readDialogDoc(chatId);
  doc.msgs = keep;
  await writeDialogDoc(chatId, doc);
}

// ---- Связка сайт <-> Telegram ----
// Человек оставил в форме @ник. Кладём рядом с диалогом, чтобы чат на сайте
// мог подхватить ту же нить разговора из Telegram.
async function linkTelegramHandle(chatId, handle) {
  const h = String(handle || '').trim().replace(/^@/, '').toLowerCase();
  if (!h) return null;
  const map = await readObjectBlob(CONTEXTS_PATH);
  const safe = (map && typeof map === 'object' && !Array.isArray(map)) ? map : {};
  safe['tg:' + h] = { chatId: String(chatId), handle: h, updatedAt: Date.now() };
  await writeJsonBlob(CONTEXTS_PATH, safe);
  return h;
}

// Ищем диалог по нику: возвращаем историю разговора и состояние воронки.
async function findChatByTelegram(handle) {
  const h = String(handle || '').trim().replace(/^@/, '').toLowerCase();
  if (!h) return null;
  const map = await readObjectBlob(CONTEXTS_PATH);
  if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
  const link = map['tg:' + h];
  if (!link || !link.chatId) return null;
  const chatId = link.chatId;
  return {
    chatId: chatId,
    handle: h,
    history: await getDialogHistory(chatId),
    funnel: await getFunnelState(chatId),
  };
}

async function clearDialogHistory(chatId) {
  const doc = await readDialogDoc(chatId);
  doc.msgs = [];
  await writeDialogDoc(chatId, doc);
}

// ---- Состояние воронки продаж (этап + ветка) для каждого чата клиента ----
async function getFunnelState(chatId) {
  const doc = await readDialogDoc(chatId);
  return doc.funnel || null;
}

async function setFunnelState(chatId, state) {
  const doc = await readDialogDoc(chatId);
  const prev = doc.funnel || {};
  doc.funnel = Object.assign({ updatedAt: Date.now() }, prev, state || {});
  await writeDialogDoc(chatId, doc);
  return doc.funnel;
}

// Явная пометка: заявка уже ушла команде (чтобы не дублировать при каждом сообщении)
async function isLeadNotified(chatId) {
  const st = await getFunnelState(chatId);
  return !!(st && st.leadNotified);
}

async function markLeadNotified(chatId, info) {
  await setFunnelState(chatId, Object.assign({ leadNotified: true, leadNotifiedAt: Date.now() }, info || {}));
}

// ------------------------------------------------------------------
// РАССЫЛКА ПРОГРЕВА (гибрид: бот доводит сам, без участия команды).
// Активные чаты находим перебором файлов диалогов: у каждого свой файл.

// Собрать все состояния воронки (для рассылки по расписанию).
async function listFunnelStates() {
  const out = [];
  try {
    const { blobs } = await list({ prefix: 'data/dialogs/', limit: 1000, token: privateToken() });
    for (const b of blobs) {
      if (!b.pathname.endsWith('.json')) continue;
      const chatId = b.pathname.replace('data/dialogs/', '').replace('.json', '');
      const doc = await readDialogDoc(chatId);
      if (doc.funnel && typeof doc.funnel === 'object') {
        out.push(Object.assign({ chatId: chatId }, doc.funnel));
      }
    }
  } catch (e) {
    console.error('listFunnelStates failed', e);
  }
  return out;
}

// Точечно обновить поля состояния воронки по chatId (для рассылки).
async function patchFunnelState(chatId, patch) {
  return setFunnelState(chatId, patch || {});
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function makeLeadCode(id) {
  // код для диплинка: короткий, безопасный
  return (id || newId()).toString();
}

module.exports = {
  addSubmission,
  readSubmissions,
  saveLeadContext,
  getLeadContext,
  pruneLeadContexts,
  getDialogHistory,
  setDialogHistory,
  clearDialogHistory,
  linkTelegramHandle,
  findChatByTelegram,
  getFunnelState,
  setFunnelState,
  isLeadNotified,
  markLeadNotified,
  listFunnelStates,
  patchFunnelState,
  makeLeadCode,
  SUBMISSIONS_PATH,
};
