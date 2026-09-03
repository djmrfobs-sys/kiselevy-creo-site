const { put, list } = require('@vercel/blob');

const TESTIMONIALS_PATH = 'data/testimonials.json';
const PORTFOLIO_PATH = 'data/portfolio.json';
const LEADS_PATH = 'data/leads.json';
const VISITS_PATH = 'data/visits.json';

async function readJson(pathname) {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const match = blobs.find((b) => b.pathname === pathname);
    if (!match) return [];
    const resp = await fetch(match.url, { cache: 'no-store' });
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('readJson failed', pathname, e);
    return [];
  }
}

async function writeJson(pathname, data) {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function uploadImage(base64DataUrl, filenameHint) {
  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(base64DataUrl || '');
  if (!match) throw new Error('invalid image data url');
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = contentType.split('/')[1].replace('jpeg', 'jpg');
  const safeName = (filenameHint || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const pathname = `uploads/${Date.now()}-${safeName}.${ext}`;
  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

async function readObject(pathname) {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const match = blobs.find((b) => b.pathname === pathname);
    if (!match) return {};
    const resp = await fetch(match.url, { cache: 'no-store' });
    if (!resp.ok) return {};
    return await resp.json();
  } catch (e) {
    console.error('readObject failed', pathname, e);
    return {};
  }
}

async function addLead(lead) {
  const leads = await readJson(LEADS_PATH);
  leads.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    ...lead,
    createdAt: Date.now(),
  });
  await writeJson(LEADS_PATH, leads.slice(0, 500));
}

async function recordVisit() {
  const day = new Date().toISOString().slice(0, 10);
  const visits = await readObject(VISITS_PATH);
  visits[day] = (visits[day] || 0) + 1;
  await put(VISITS_PATH, JSON.stringify(visits, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

module.exports = {
  TESTIMONIALS_PATH,
  PORTFOLIO_PATH,
  LEADS_PATH,
  VISITS_PATH,
  readJson,
  writeJson,
  readObject,
  uploadImage,
  addLead,
  recordVisit,
};
