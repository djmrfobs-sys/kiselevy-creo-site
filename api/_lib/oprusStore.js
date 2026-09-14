// Хранилище модуля «Опрус» - диагностика + реферальная программа KISELEVY CREO.
//
// ВСЕ данные приватные: клиенты, контакты, личные коды, реферальные цепочки,
// накопленные скидки лежат ТОЛЬКО в private Blob (BLOB_READ_WRITE_TOKEN для
// private-record с PRIVATE_READ_WRITE_TOKEN для чтения), как и в основном _lib/store.js.
// Ничего секретного из этих записей массово не отдаём во фронтенд.
//
// Храним один приватный объект-документ в private Blob:
//   data/oprus.json
//   {
//     clients: [ { code, firstName, contact(phone/email/telegram), answers,
//                  questionnaireId, lang, ref (код пригласившего, если пришёл по чужому коду),
//                  createdAt, decoding? , recommendation? } ],
//     referrals: [ { id, referrerCode, friendCode, referredAt, status:'pending'|'confirmed', confirmedAt? } ],
//   }
// Скидка пригласившего = 5% за каждого ПОДТВЕРЖДЁННОГО друга = referrals где
// referrerCode == мой код && status=='confirmed'. Считаем на лету.

const { put } = require('@vercel/blob');

const OPRUS_PATH = 'data/oprus.json';

function privateToken() {
  return process.env.PRIVATE_READ_WRITE_TOKEN;
}

async function readOprus() {
  const token = privateToken();
  // Читаем файл по префиксу (паттерн из _lib/store.js).
  const { list } = require('@vercel/blob');
  try {
    const { blobs } = await list({ prefix: OPRUS_PATH, limit: 1, token });
    const match = blobs.find((b) => b.pathname === OPRUS_PATH);
    if (!match) return { clients: [], referrals: [] };
    const resp = await fetch(match.url, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!resp.ok) return { clients: [], referrals: [] };
    const obj = await resp.json();
    if (!Array.isArray(obj.clients)) obj.clients = [];
    if (!Array.isArray(obj.referrals)) obj.referrals = [];
    return obj;
  } catch (e) {
    console.error('oprusStore.readOprus failed', e);
    return { clients: [], referrals: [] };
  }
}

async function writeOprus(obj) {
  const token = privateToken();
  await put(OPRUS_PATH, JSON.stringify(
    { clients: obj.clients || [], referrals: obj.referrals || [] },
    null, 2
  ), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
}

// ---------- личный код CREO-XXXXX ----------
// 5 символов из безопасного алфавита без похожих 0/O/1/I.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_REGEX = /^CREO-[A-HJ-NP-Z2-9]{5}$/i;

function randomCode() {
  const crypto = require('crypto');
  const chars = [];
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    chars.push(ALPHABET[bytes[i] % ALPHABET.length]);
  }
  return 'CREO-' + chars.join('');
}

async function generateUniqueCode() {
  const { clients } = await readOprus();
  const used = new Set(clients.map((c) => String(c.code || '').toUpperCase()));
  let code = randomCode();
  let guard = 0;
  while (used.has(code.toUpperCase()) && guard < 100) {
    code = randomCode();
    guard += 1;
  }
  return code.toUpperCase();
}

function normalizeCode(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toUpperCase();
  return CODE_REGEX.test(s) ? s.toUpperCase() : null;
}

// ---------- CRUD клиента ----------
function findClient(clients, code) {
  const c = normalizeCode(code);
  return c ? (clients.find((x) => String(x.code).toUpperCase() === c) || null) : null;
}

async function addClient(payload) {
  const { clients, referrals } = await readOprus();
  const code = await generateUniqueCode();
  const client = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    code,
    firstName: String(payload.firstName || '').trim().slice(0, 80),
    contact: String(payload.contact || '').trim().slice(0, 200),
    phone: String(payload.phone || '').trim().slice(0, 60),
    email: String(payload.email || '').trim().slice(0, 120),
    telegram: String(payload.telegram || '').trim().slice(0, 120),
    answers: payload.answers || {},
    questionnaireId: payload.questionnaireId || 'default',
    lang: payload.lang || 'ru',
    ref: null,
    createdAt: Date.now(),
  };
  // Реферальная цепочка: ref-код пригласившего, если он валиден и не равен своему.
  const refCode = normalizeCode(payload.ref);
  if (refCode && refCode !== client.code) {
    const referrer = findClient(clients, refCode);
    if (referrer) {
      client.ref = referrer.code.toUpperCase();
      referrals.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        referrerCode: referrer.code.toUpperCase(),
        friendCode: client.code,
        referredAt: Date.now(),
        status: 'pending',
      });
    }
  }
  clients.push(client);
  await writeOprus({ clients, referrals });
  return { client, refApplied: !!client.ref };
}

function getClientByCode(code) {
  return readOprus().then(({ clients }) => findClient(clients, code));
}

function referralStatsFor(code) {
  return readOprus().then(({ referrals, clients }) => {
    const c = normalizeCode(code);
    if (!c) return { confirmedFriends: [], confirmed: 0, discountPctTotal: 0 };
    const mine = referrals.filter((r) => String(r.referrerCode).toUpperCase() === c);
    const confirmed = mine.filter((r) => r.status === 'confirmed');
    return {
      confirmed: confirmed.length,
      confirmedFriends: confirmed.map((r) => ({
        friendCode: r.friendCode,
        confirmedAt: r.confirmedAt || r.referredAt,
      })),
      // 5% скидки за каждого подтверждённого друга - на следующий продукт пригласившего.
      discountPctTotal: confirmed.length * 5,
    };
  });
}

// Статус друга по коду (для реферера): pending|confirmed|none
async function referralStatus(referrerCode, friendCode) {
  const { referrals } = await readOprus();
  const r = referrals.find(
    (x) => String(x.referrerCode).toUpperCase() === normalizeCode(referrerCode) &&
           String(x.friendCode).toUpperCase() === normalizeCode(friendCode)
  );
  if (!r) return 'none';
  return r.status;
}

// confirm = true подтвердить, false - снять подтверждение.
async function confirmReferral(referrerCode, friendCode, confirm) {
  const { clients, referrals } = await readOprus();
  const ref = referrals.find(
    (x) => String(x.referrerCode).toUpperCase() === normalizeCode(referrerCode) &&
           String(x.friendCode).toUpperCase() === normalizeCode(friendCode)
  );
  if (!ref) return { ok: false, reason: 'referral not found' };
  const wantConfirmed = confirm !== false;
  if (wantConfirmed && ref.status === 'confirmed') return { ok: true, already: true };
  if (!wantConfirmed && ref.status !== 'confirmed') return { ok: true, already: true, unchanged: true };
  ref.status = wantConfirmed ? 'confirmed' : 'pending';
  if (wantConfirmed) ref.confirmedAt = Date.now(); else delete ref.confirmedAt;
  await writeOprus({ clients, referrals });
  return { ok: true, already: false };
}

async function listAll(opts) {
  const { clients, referrals } = await readOprus();
  const limit = opts && opts.limit ? opts.limit : 200;
  const out = clients.slice(0, limit).map((c) => ({
    id: c.id, code: c.code, firstName: c.firstName,
    contact: c.contact, ref: c.ref || null, createdAt: c.createdAt,
    langs: c.lang,
  }));
  return { clients: out, referrals: referrals.slice(0, limit) };
}

module.exports = {
  OPRUS_PATH,
  readOprus,
  writeOprus,
  generateUniqueCode,
  normalizeCode,
  findClient,
  addClient,
  getClientByCode,
  referralStatsFor,
  referralStatus,
  confirmReferral,
  listAll,
};
