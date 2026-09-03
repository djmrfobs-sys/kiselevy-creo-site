const { requireAuth } = require('../_lib/auth');
const { readVisits, readLeads } = require('../_lib/store');

function lastNDays(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const [visits, leads] = await Promise.all([readVisits(), readLeads()]);
  const days = lastNDays(30);
  const daily = days.map((day) => ({ day, count: visits[day] || 0 }));
  const totalVisits30d = daily.reduce((sum, d) => sum + d.count, 0);
  const totalVisitsAll = Object.values(visits).reduce((sum, v) => sum + v, 0);

  res.status(200).json({
    visitsDaily: daily,
    totalVisits30d,
    totalVisitsAll,
    totalLeads: leads.length,
  });
};
