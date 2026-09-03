function escapeText(value) {
  return String(value || '-').slice(0, 300);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { firstName, lastName, phone, email, telegram } = req.body || {};
  if (!firstName || !lastName || !phone || !email || !telegram) {
    res.status(400).json({ error: 'all fields required' });
    return;
  }

  const token = process.env.SITE_BOT_TOKEN;
  const chatId = process.env.LEAD_TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    res.status(200).json({ ok: true });
    return;
  }

  const text = `Новая заявка с сайта (форма перед чатом)\n\nИмя: ${escapeText(firstName)}\nФамилия: ${escapeText(lastName)}\nТелефон: ${escapeText(phone)}\nEmail: ${escapeText(email)}\nTelegram: ${escapeText(telegram)}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) {
    console.error('telegram send failed', e);
  }

  res.status(200).json({ ok: true });
};
