const formidable   = require('formidable').default || require('formidable');
const fs           = require('fs');
const sharp        = require('sharp');
const { requireAuth }            = require('./_lib/verify-jwt');
const { getFile, batchCommit }   = require('./_lib/github');

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const form = formidable({ maxFileSize: MAX_FILE_BYTES, maxFiles: 3 });
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    if (err.code === 1009) {
      return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
    }
    return res.status(400).json({ error: 'Invalid form data' });
  }

  const get = (key) => Array.isArray(fields[key]) ? fields[key][0] : (fields[key] || '');

  const id = get('id');
  if (!id) return res.status(400).json({ error: 'Project ID required' });

  // Validate all 3 files are present
  for (let n = 1; n <= 3; n++) {
    const f = Array.isArray(files[`file${n}`]) ? files[`file${n}`][0] : files[`file${n}`];
    if (!f) return res.status(400).json({ error: `Missing file${n}` });
  }

  // Read current projects.json
  const projectsFile = await getFile('data/projects.json');
  const projects     = projectsFile ? JSON.parse(projectsFile.content.toString('utf8')) : [];

  if (projects.some(p => p.id === id)) {
    return res.status(409).json({ error: 'Project ID already exists' });
  }

  // Process all 3 images with sharp
  const stills       = [];
  const filesToCommit = [];

  for (let n = 1; n <= 3; n++) {
    const file        = Array.isArray(files[`file${n}`]) ? files[`file${n}`][0] : files[`file${n}`];
    const inputBuffer = fs.readFileSync(file.filepath);
    fs.unlinkSync(file.filepath);

    const hqBuffer = await sharp(inputBuffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const lqBuffer = await sharp(inputBuffer)
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 15 })
      .toBuffer();

    const hqPath = `assets/images/${id}/still-${n}.webp`;
    const lqPath = `assets/images/${id}/still-${n}-lq.webp`;

    filesToCommit.push({ path: hqPath, content: hqBuffer });
    filesToCommit.push({ path: lqPath, content: lqBuffer });
    stills.push(`/${hqPath}`);
  }

  // Append new project to projects.json
  const project = {
    id,
    title:         get('title'),
    categoryLabel: get('categoryLabel'),
    category:      get('category'),
    director:      get('director'),
    producer:      get('producer'),
    dop:           get('dop'),
    secdirector:   get('secdirector'),
    secdop:        get('secdop'),
    year:          get('year'),
    vimeoId:       get('vimeoId'),
    stills,
  };

  filesToCommit.push({
    path:    'data/projects.json',
    content: JSON.stringify([...projects, project], null, 2),
  });

  // Single commit: 6 image files + projects.json
  try {
    await batchCommit(filesToCommit, `admin: add project ${id}`);
  } catch (err) {
    if (err.conflict) return res.status(409).json({ error: 'Conflict — please try again' });
    throw err;
  }

  return res.status(200).json({ ok: true, project });
};
