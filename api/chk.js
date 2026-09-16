// Диагностика воронки: читает состояние диалога по chat_id
const store = require('./_lib/oprosnikStore');
module.exports = async function handler(req, res) {
  const out = { ok: true };
  try {
    const ids = String(req.query.ids || '998877003,998877002,998877001').split(',');
    out.dialogs = {};
    for (const id of ids) {
      const h = await store.getDialogHistory(id).catch(e => 'ERR ' + e.message);
      const f = await store.getFunnelState(id).catch(e => 'ERR ' + e.message);
      out.dialogs[id] = {
        msgs: Array.isArray(h) ? h.length : h,
        last: Array.isArray(h) && h.length ? h.slice(-2) : null,
        funnel: f,
      };
    }
  } catch (e) { out.ok = false; out.error = String(e && e.message || e); }
  res.status(200).json(out);
};
