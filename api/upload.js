const formidable = require('formidable').default || require('formidable');
const fs         = require('fs');
const sharp      = require('sharp');
const { requireAuth } = require('./_lib/verify-jwt');
const { putFile }     = require('./_lib/github');

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  // Parse multipart form
  const form = formidable({ maxFileSize: MAX_FILE_BYTES });
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    if (err.code === 1009) {
      return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
    }
    return res.status(400).json({ error: 'Invalid form data' });
  }

  const projectId = Array.isArray(fields.projectId) ? fields.projectId[0] : fields.projectId;
  const index     = Array.isArray(fields.index)     ? fields.index[0]     : fields.index;
  const file      = Array.isArray(files.file)       ? files.file[0]       : files.file;

  if (!projectId || !index || !file) {
    return res.status(400).json({ error: 'Missing projectId, index, or file' });
  }

  const n = parseInt(index, 10);
  if (![1, 2, 3].includes(n)) {
    return res.status(400).json({ error: 'index must be 1, 2, or 3' });
  }

  // Read uploaded file
  const inputBuffer = fs.readFileSync(file.filepath);
  fs.unlinkSync(file.filepath); // clean up tmp file

  // Convert to HQ WebP
  const hqBuffer = await sharp(inputBuffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Generate LQ placeholder
  const lqBuffer = await sharp(inputBuffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 15 })
    .toBuffer();

  const hqPath = `assets/images/${projectId}/still-${n}.webp`;
  const lqPath = `assets/images/${projectId}/still-${n}-lq.webp`;

  try {
    await putFile(hqPath, hqBuffer, `admin: upload ${projectId} still-${n}`);
    await putFile(lqPath, lqBuffer, `admin: upload ${projectId} still-${n} lq`);
  } catch (err) {
    if (err.conflict) return res.status(409).json({ error: 'Conflict — please try again' });
    throw err;
  }

  return res.status(200).json({
    hq: `/${hqPath}`,
    lq: `/${lqPath}`,
  });
};
