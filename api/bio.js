const { requireAuth }    = require('./_lib/verify-jwt');
const { getFile, putFile } = require('./_lib/github');

const BIO_PATH = 'data/bio.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { paragraphs } = req.body || {};
  if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
    return res.status(400).json({ error: 'paragraphs array required' });
  }

  const cleaned = paragraphs.map(p => String(p).trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return res.status(400).json({ error: 'Bio cannot be empty' });
  }

  const file = await getFile(BIO_PATH);

  try {
    await putFile(
      BIO_PATH,
      JSON.stringify(cleaned, null, 2),
      'admin: update bio',
      file?.sha
    );
  } catch (err) {
    if (err.conflict) return res.status(409).json({ error: 'Conflict — please try again' });
    throw err;
  }

  return res.status(200).json({ ok: true });
};
