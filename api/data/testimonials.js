const { TESTIMONIALS_PATH, readJson } = require('../_lib/store');

module.exports = async function handler(req, res) {
  const items = await readJson(TESTIMONIALS_PATH);
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
  res.status(200).json({ items });
};
