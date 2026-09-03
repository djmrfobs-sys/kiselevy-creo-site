const { put, list } = require('@vercel/blob');

const TESTIMONIALS_PATH = 'data/testimonials.json';
const PORTFOLIO_PATH = 'data/portfolio.json';

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

module.exports = {
  TESTIMONIALS_PATH,
  PORTFOLIO_PATH,
  readJson,
  writeJson,
  uploadImage,
};
