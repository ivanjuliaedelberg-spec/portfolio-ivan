const { requireAuth }      = require('./_lib/verify-jwt');
const { getFile, putFile } = require('./_lib/github');

const CONTACT_PATH = 'data/contact.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { groups } = req.body || {};
  if (!Array.isArray(groups)) {
    return res.status(400).json({ error: 'groups array required' });
  }

  const file = await getFile(CONTACT_PATH);

  try {
    await putFile(
      CONTACT_PATH,
      JSON.stringify(groups, null, 2),
      'admin: update contact info',
      file?.sha
    );
  } catch (err) {
    if (err.conflict) return res.status(409).json({ error: 'Conflict — please try again' });
    throw err;
  }

  return res.status(200).json({ ok: true });
};
