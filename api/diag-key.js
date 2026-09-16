module.exports = async (req, res) => {
  const k = process.env.GEMINI_API_KEY || '';
  const t = process.env.VOICE_TEST_TOKEN || '';
  return res.status(200).json({
    gemini: { present: !!k, length: k.length, prefix: k.slice(0,3), suffix: k.slice(-3),
              hasWhitespace: /\s/.test(k), firstCode: k.charCodeAt(0), lastCode: k.charCodeAt(k.length-1) },
    token:  { present: !!t, length: t.length, prefix: t.slice(0,3) }
  });
};
