const { requireAuth }    = require('./_lib/verify-jwt');
const { getFile, putFile, fileExists } = require('./_lib/github');

const PROJECTS_PATH = 'data/projects.json';

async function readProjects() {
  const file = await getFile(PROJECTS_PATH);
  if (!file) return { projects: [], sha: null };
  return {
    projects: JSON.parse(file.content.toString('utf8')),
    sha:      file.sha,
  };
}

async function writeProjects(projects, sha, message) {
  await putFile(PROJECTS_PATH, JSON.stringify(projects, null, 2), message, sha);
}

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  // ── POST — add project ────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const data = req.body;

    if (!data.id || !data.title || !Array.isArray(data.stills) || data.stills.length !== 3) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { projects, sha } = await readProjects();

    // Uniqueness check
    if (projects.some(p => p.id === data.id)) {
      return res.status(409).json({ error: 'Project ID already exists' });
    }

    // Verify all 6 image files exist in the repo
    const imagePaths = data.stills.flatMap(src => [
      src.replace(/^\//, ''),
      src.replace('.webp', '-lq.webp').replace(/^\//, ''),
    ]);
    const checks = await Promise.all(imagePaths.map(p => fileExists(p)));
    if (checks.some(exists => !exists)) {
      return res.status(422).json({ error: 'Images not found — re-upload and try again' });
    }

    const project = {
      id:           data.id,
      title:        data.title        || '',
      categoryLabel:data.categoryLabel|| '',
      category:     data.category     || '',
      director:     data.director     || '',
      producer:     data.producer     || '',
      dop:          data.dop          || '',
      secdirector:  data.secdirector  || '',
      secdop:       data.secdop       || '',
      year:         data.year         || '',
      videoUrl:     data.videoUrl     || '',
      stills:       data.stills,
    };

    try {
      await writeProjects([...projects, project], sha, `admin: add project ${data.id}`);
    } catch (err) {
      if (err.conflict) return res.status(409).json({ error: 'Conflict — please try again' });
      throw err;
    }

    return res.status(200).json({ ok: true });
  }

  // ── DELETE — remove project ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    const { projects, sha } = await readProjects();
    const filtered = projects.filter(p => p.id !== id);

    try {
      await writeProjects(filtered, sha, `admin: delete project ${id}`);
    } catch (err) {
      if (err.conflict) return res.status(409).json({ error: 'Conflict — please try again' });
      throw err;
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
