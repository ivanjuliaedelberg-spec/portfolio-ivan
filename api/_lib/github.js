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

/**
 * Commit multiple files in a single GitHub commit using the Git Trees API.
 * files: Array of { path: string, content: Buffer|string }
 * Throws with { conflict: true } if the branch has advanced (race condition).
 */
async function batchCommit(files, message) {
  const headers = githubHeaders();
  const base    = `https://api.github.com/repos/${process.env.GITHUB_REPO}`;
  const branch  = process.env.GITHUB_BRANCH;

  // 1. Get current branch tip
  const refRes = await fetch(`${base}/git/refs/heads/${branch}`, { headers });
  if (!refRes.ok) throw new Error(`GitHub ref GET failed: ${refRes.status}`);
  const currentCommitSha = (await refRes.json()).object.sha;

  // 2. Get base tree SHA from current commit
  const commitRes = await fetch(`${base}/git/commits/${currentCommitSha}`, { headers });
  if (!commitRes.ok) throw new Error(`GitHub commit GET failed: ${commitRes.status}`);
  const baseTreeSha = (await commitRes.json()).tree.sha;

  // 3. Create blobs for every file (in parallel)
  const treeItems = await Promise.all(files.map(async ({ path, content }) => {
    const blobRes = await fetch(`${base}/git/blobs`, {
      method:  'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content: encodeContent(content), encoding: 'base64' }),
    });
    if (!blobRes.ok) throw new Error(`GitHub blob POST failed: ${blobRes.status}`);
    const { sha } = await blobRes.json();
    return { path, mode: '100644', type: 'blob', sha };
  }));

  // 4. Create new tree
  const treeRes = await fetch(`${base}/git/trees`, {
    method:  'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
  });
  if (!treeRes.ok) throw new Error(`GitHub tree POST failed: ${treeRes.status}`);
  const newTreeSha = (await treeRes.json()).sha;

  // 5. Create commit
  const newCommitRes = await fetch(`${base}/git/commits`, {
    method:  'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ message, tree: newTreeSha, parents: [currentCommitSha] }),
  });
  if (!newCommitRes.ok) throw new Error(`GitHub commit POST failed: ${newCommitRes.status}`);
  const newCommitSha = (await newCommitRes.json()).sha;

  // 6. Update branch ref
  const updateRes = await fetch(`${base}/git/refs/heads/${branch}`, {
    method:  'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ sha: newCommitSha }),
  });
  if (updateRes.status === 409 || updateRes.status === 422) {
    const err = new Error('GitHub conflict');
    err.conflict = true;
    throw err;
  }
  if (!updateRes.ok) throw new Error(`GitHub ref PATCH failed: ${updateRes.status}`);
}

module.exports = { buildFileUrl, encodeContent, getFile, putFile, fileExists, batchCommit };
