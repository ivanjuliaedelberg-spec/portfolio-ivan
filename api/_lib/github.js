/**
 * Thin wrapper around the GitHub Contents API.
 * All functions use process.env.GITHUB_TOKEN / GITHUB_REPO / GITHUB_BRANCH.
 */

function buildFileUrl(filePath) {
  const repo = process.env.GITHUB_REPO;
  return `https://api.github.com/repos/${repo}/contents/${filePath}`;
}

function encodeContent(content) {
  if (Buffer.isBuffer(content)) return content.toString('base64');
  return Buffer.from(content).toString('base64');
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept:        'application/vnd.github+json',
    'User-Agent':  'portfolio-ivan-admin',
  };
}

/**
 * Get a file's content and SHA from GitHub.
 * Returns { content: Buffer, sha: string } or null if 404.
 */
async function getFile(filePath) {
  const res = await fetch(buildFileUrl(filePath), { headers: githubHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  return {
    content: Buffer.from(data.content, 'base64'),
    sha:     data.sha,
  };
}

/**
 * Commit a file to GitHub. Pass sha when updating an existing file.
 * Throws on GitHub 409 (SHA conflict) with { conflict: true }.
 */
async function putFile(filePath, content, message, sha) {
  const body = {
    message,
    content: encodeContent(content),
    branch:  process.env.GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(buildFileUrl(filePath), {
    method:  'PUT',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (res.status === 409 || res.status === 422) {
    const err = new Error('GitHub conflict');
    err.conflict = true;
    throw err;
  }
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
  return res.json();
}

/**
 * Check whether a file exists in the repo.
 */
async function fileExists(filePath) {
  const res = await fetch(buildFileUrl(filePath), { headers: githubHeaders() });
  return res.status === 200;
}

module.exports = { buildFileUrl, encodeContent, getFile, putFile, fileExists };
