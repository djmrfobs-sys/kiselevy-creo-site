const { requireAuth } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const token = process.env.SITE_BOT_TOKEN;
  if (!token) {
    res.status(200).json({ ok: false, error: 'SITE_BOT_TOKEN not set' });
    return;
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    res.status(200).json({ ok: false, error: 'TELEGRAM_WEBHOOK_SECRET not set' });
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = `https://${host}/api/group-reply`;

  try {
    const setResp = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, allowed_updates: ['message'], secret_token: secret }),
    });
    const setData = await setResp.json();

    const infoResp = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const infoData = await infoResp.json();

    res.status(200).json({ ok: true, set: setData, info: infoData });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e) });
  }
};
