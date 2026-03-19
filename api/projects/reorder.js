const { requireAuth } = require('../_lib/verify-jwt');
const { getFile, putFile } = require('../_lib/github');

const PROJECTS_PATH = 'data/projects.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });

  const file = await getFile(PROJECTS_PATH);
  if (!file) return res.status(404).json({ error: 'projects.json not found' });

  const projects = JSON.parse(file.content.toString('utf8'));

  if (ids.length !== projects.length) {
    return res.status(400).json({ error: `Expected ${projects.length} ids, got ${ids.length}` });
  }

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
  const reordered  = ids.map(id => projectMap[id]).filter(Boolean);

  if (reordered.length !== projects.length) {
    return res.status(400).json({ error: 'ids contain unknown project IDs' });
  }

  try {
    await putFile(
      PROJECTS_PATH,
      JSON.stringify(reordered, null, 2),
      'admin: reorder projects',
      file.sha
    );
  } catch (err) {
    if (err.conflict) return res.status(409).json({ error: 'Conflict — please try again' });
    throw err;
  }

  return res.status(200).json({ ok: true });
};
