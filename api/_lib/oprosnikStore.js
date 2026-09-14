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
    const { blobs } = await list({ prefix: pathname, limit: 1, token: privateToken() });
    const match = blobs.find((b) => b.pathname === pathname);
    if (!match) return [];
    const resp = await fetch(match.url, {
      cache: 'no-store',
      headers: privateToken() ? { Authorization: `Bearer ${privateToken()}` } : undefined,
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
async function getDialogHistory(chatId) {
  const map = await readObjectBlob(CONTEXTS_PATH);
  const empty = [];
  if (!map || typeof map !== 'object') return empty;
  // history храним отдельным ключом вида "dialog:<chatId>"
  return (map['dialog:' + chatId] || { msgs: [] }).msgs;
}

async function setDialogHistory(chatId, msgs) {
  const map = await readObjectBlob(CONTEXTS_PATH);
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    await writeJsonBlob(CONTEXTS_PATH, {});
    return setDialogHistory(chatId, msgs);
  }
  const keep = msgs.slice(-40); // разумный предел истории
  map['dialog:' + chatId] = { updatedAt: Date.now(), msgs: keep };
  await writeJsonBlob(CONTEXTS_PATH, map);
}

async function clearDialogHistory(chatId) {
  const map = await readObjectBlob(CONTEXTS_PATH);
  if (!map || typeof map !== 'object') return;
  delete map['dialog:' + chatId];
  await writeJsonBlob(CONTEXTS_PATH, map);
}

// ---- Состояние воронки продаж (этап + ветка) для каждого чата клиента ----
async function getFunnelState(chatId) {
  const map = await readObjectBlob(CONTEXTS_PATH);
  const empty = null;
  if (!map || typeof map !== 'object') return empty;
  // funnel храним отдельным ключом вида "funnel:<chatId>"
  return (map['funnel:' + chatId] || null);
}

async function setFunnelState(chatId, state) {
  const map = await readObjectBlob(CONTEXTS_PATH);
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    await writeJsonBlob(CONTEXTS_PATH, {});
    return setFunnelState(chatId, state);
  }
  const prev = map['funnel:' + chatId] || {};
  map['funnel:' + chatId] = Object.assign({ updatedAt: Date.now() }, prev, state || {});
  await writeJsonBlob(CONTEXTS_PATH, map);
}

// Явная пометка: заявка уже ушла команде (чтобы не дублировать при каждом сообщении)
async function isLeadNotified(chatId) {
  const st = await getFunnelState(chatId);
  return !!(st && st.leadNotified);
}

async function markLeadNotified(chatId, info) {
  await setFunnelState(chatId, Object.assign({ leadNotified: true, leadNotifiedAt: Date.now() }, info || {}));
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
  getFunnelState,
  setFunnelState,
  isLeadNotified,
  markLeadNotified,
  makeLeadCode,
  SUBMISSIONS_PATH,
};
