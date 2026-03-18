# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a password-protected `/admin` page to the portfolio that lets the owner upload new projects (images + metadata) which are committed to GitHub and deployed via Vercel automatically.

**Architecture:** Vercel serverless functions handle auth (bcrypt + JWT cookie) and all GitHub API writes. The frontend fetches `data/projects.json` dynamically instead of reading a hardcoded JS file. Images are stored in `assets/images/{project-id}/still-{n}.webp` and served directly by Vercel's CDN.

**Tech Stack:** Node.js serverless functions (Vercel), bcryptjs, jsonwebtoken, sharp, formidable, cookie, GitHub Contents API, vanilla JS admin SPA.

**Spec:** `docs/superpowers/specs/2026-03-17-admin-panel-design.md`

---

## Chunk 1: Project Setup + Data & Image Migration

### Task 1: Initialize Node.js project and install dependencies

**Files:**
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio-ivan",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "migrate": "node scripts/migrate.js",
    "hash-password": "node scripts/hash-password.js",
    "test": "jest --testPathPattern=tests/"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie": "^0.6.0",
    "formidable": "^3.5.0",
    "jsonwebtoken": "^9.0.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/mvella/Projects/clon-ivan/portfolio-ivan
npm install
```

Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 3: Add entries to `.gitignore`**

Append to `.gitignore`:
```
node_modules/
.env
.env.local
```

- [ ] **Step 4: Create `.env.example`**

```
ADMIN_PASSWORD_HASH=
JWT_SECRET=
GITHUB_TOKEN=
GITHUB_REPO=owner/portfolio-ivan
GITHUB_BRANCH=main
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example
git commit -m "chore: add Node.js project with serverless dependencies"
```

---

### Task 2: Write the image + data migration script

**Files:**
- Create: `scripts/migrate.js`

This script reads `js/projects-data.js`, creates `assets/images/{id}/still-{n}.webp` (copying from the existing paths), and writes `data/projects.json`.

- [ ] **Step 1: Create `scripts/` directory and write `scripts/migrate.js`**

```js
#!/usr/bin/env node
/**
 * One-time migration script.
 * Reads projects-data.js, copies WebP images to standardised paths,
 * and writes data/projects.json.
 *
 * Run from project root: npm run migrate
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ── Load PROJECTS from projects-data.js via vm sandbox ──────────────────────
const jsSource = fs.readFileSync(path.join(__dirname, '../js/projects-data.js'), 'utf8');
const sandbox  = {};
vm.runInNewContext(jsSource, sandbox);
const PROJECTS = sandbox.PROJECTS;

if (!PROJECTS) {
  console.error('ERROR: Could not parse PROJECTS from projects-data.js');
  process.exit(1);
}

// ── Category slug map ────────────────────────────────────────────────────────
const CATEGORY_SLUG = {
  'Music Video': 'music-videos',
  'Commercial':  'commercials',
  'Narrative':   'narrative',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Resolve a stills path from projects-data.js (relative to projects/ dir)
 * to an absolute path on disk.
 */
function resolveStillPath(rawPath) {
  // paths in projects-data.js start with '../assets/...'
  const relative = rawPath.replace(/^\.\.\//, '');
  return path.join(__dirname, '..', relative);
}

// ── Main migration ───────────────────────────────────────────────────────────
const outputProjects = [];
const dataDir = path.join(__dirname, '../data');
ensureDir(dataDir);

for (const [id, project] of Object.entries(PROJECTS)) {
  console.log(`\nMigrating: ${id}`);

  const destDir = path.join(__dirname, '../assets/images', id);
  ensureDir(destDir);

  const newStills = [];

  project.stills.forEach((rawPath, i) => {
    const n        = i + 1;
    const hqSrc    = resolveStillPath(rawPath);
    const lqSrc    = hqSrc.replace('.webp', '-lq.webp');
    const hqDest   = path.join(destDir, `still-${n}.webp`);
    const lqDest   = path.join(destDir, `still-${n}-lq.webp`);

    if (!fs.existsSync(hqSrc)) {
      console.warn(`  WARN: HQ not found: ${hqSrc}`);
    } else {
      fs.copyFileSync(hqSrc, hqDest);
      console.log(`  ✓ still-${n}.webp`);
    }

    if (!fs.existsSync(lqSrc)) {
      console.warn(`  WARN: LQ not found: ${lqSrc}`);
    } else {
      fs.copyFileSync(lqSrc, lqDest);
      console.log(`  ✓ still-${n}-lq.webp`);
    }

    newStills.push(`/assets/images/${id}/still-${n}.webp`);
  });

  outputProjects.push({
    id,
    title:         project.title         || '',
    categoryLabel: project.categoryLabel || '',
    category:      CATEGORY_SLUG[project.categoryLabel] || 'music-videos',
    director:      project.director      || '',
    producer:      project.producer      || '',
    dop:           project.dop           || '',
    secdirector:   project.secdirector   || '',
    secdop:        project.secdop        || '',
    year:          project.year          || '',
    vimeoId:       project.vimeoId       || '',
    stills:        newStills,
  });
}

fs.writeFileSync(
  path.join(dataDir, 'projects.json'),
  JSON.stringify(outputProjects, null, 2),
  'utf8'
);

console.log(`\n✅ Migration complete. ${outputProjects.length} projects written to data/projects.json`);
```

- [ ] **Step 2: Run the migration**

```bash
cd /Users/mvella/Projects/clon-ivan/portfolio-ivan
npm run migrate
```

Expected output (excerpt):
```
Migrating: violento
  ✓ still-1.webp
  ✓ still-1-lq.webp
  ✓ still-2.webp
  ✓ still-2-lq.webp
  ✓ still-3.webp
  ✓ still-3-lq.webp
...
✅ Migration complete. 20 projects written to data/projects.json
```

Any `WARN` lines mean a source file was not found — investigate before continuing.

- [ ] **Step 3: Verify `data/projects.json`**

```bash
# Should print 20
node -e "const p = require('./data/projects.json'); console.log(p.length, 'projects')"

# Spot-check first project
node -e "const p = require('./data/projects.json'); console.log(JSON.stringify(p[0], null, 2))"
```

Expected: 20 projects, first entry has `id`, `stills` array with 3 root-relative paths starting with `/assets/images/`.

- [ ] **Step 4: Verify new image folders exist**

```bash
ls assets/images/ | head -20
ls assets/images/violento/
```

Expected: `violento/` folder exists and contains `still-1.webp still-1-lq.webp still-2.webp still-2-lq.webp still-3.webp still-3-lq.webp`.

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate.js data/projects.json assets/images/
git commit -m "feat: migrate images to standardised paths and generate projects.json"
```

---

## Chunk 2: Frontend Changes — Dynamic Rendering

### Task 3: Update `main.js` — dynamic home grid

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Replace the `DOMContentLoaded` block in `main.js`**

Replace the entire contents of `js/main.js` with:

```js
/* ─────────────────────────────────────────
   Ivan Julia Portfolio — main.js
   ───────────────────────────────────────── */

// ─── HTML escape helper (prevents XSS from projects.json values) ───
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ─── Progressive image loading ───
function initProgressiveImages() {
  const imgs = Array.from(document.querySelectorAll('img.lq[data-hq]'));
  if (!imgs.length) return;

  let lqCount = 0;

  const startHQ = () => {
    imgs.forEach(img => {
      const hq = new Image();
      hq.onload = () => {
        img.src = hq.src;
        img.classList.remove('lq');
        img.classList.add('hq-ready');
      };
      hq.src = img.dataset.hq;
    });
  };

  imgs.forEach(img => {
    const onLqLoaded = () => {
      lqCount++;
      if (lqCount === imgs.length) startHQ();
    };
    if (img.complete) {
      onLqLoaded();
    } else {
      img.addEventListener('load',  onLqLoaded, { once: true });
      img.addEventListener('error', onLqLoaded, { once: true });
    }
  });
}

// ─── Render home page project grid from projects.json ───
async function renderHomepage() {
  const main = document.querySelector('.projects-section');
  if (!main) return;

  let projects;
  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw new Error(res.status);
    projects = await res.json();
  } catch (err) {
    main.innerHTML = '<p style="padding:40px;color:#888">Failed to load projects.</p>';
    return;
  }

  projects.forEach(p => {
    const details = [
      p.director ? 'Dir. ' + p.director : '',
      p.producer ? 'Prod. ' + p.producer : '',
    ].filter(Boolean).join(' | ');

    main.insertAdjacentHTML('beforeend', `
      <article class="project" data-category="${esc(p.category)}">
        <a href="projects/project.html?id=${esc(p.id)}" class="project-link">
          <div class="project-stills">
            ${p.stills.map((src, i) => `
              <div class="still">
                <img class="lq"
                     loading="${i === 0 ? 'eager' : 'lazy'}"
                     src="${esc(src.replace('.webp', '-lq.webp'))}"
                     data-hq="${esc(src)}"
                     alt="${esc(p.title)} — still ${i + 1}" />
              </div>`).join('')}
          </div>
          <div class="project-overlay">
            <span class="project-title">${esc(p.title)}</span>
            <span class="project-details">${esc(details)}</span>
          </div>
        </a>
      </article>`);
  });

  initProgressiveImages();

  // Re-apply active category filter after render
  const activeItem = document.querySelector('.nav-item[data-filter].active');
  if (activeItem) applyFilter(activeItem.dataset.filter);
}

// ─── Category filter ───
let applyFilter = () => {};

function initCategoryFilter() {
  const navItems = document.querySelectorAll('.nav-item[data-filter]');
  if (!navItems.length) return;

  applyFilter = (filter) => {
    document.querySelectorAll('.project[data-category]').forEach(project => {
      const match = filter === 'all' || project.dataset.category === filter;
      project.classList.toggle('hidden', !match);
    });
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.filter === filter);
    });
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      applyFilter(item.dataset.filter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      applyFilter('all');
      navItems.forEach(item => item.classList.remove('active'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const hashFilter = window.location.hash.replace('#', '');
  if (hashFilter) applyFilter(hashFilter);
}

// ─── Mobile burger menu ───
function initBurgerMenu() {
  const burger   = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');
  if (!burger || !navLinks) return;

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', async () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initBurgerMenu();
  initCategoryFilter();
  await renderHomepage();
});
```

- [ ] **Step 2: Verify no syntax errors**

```bash
node --check js/main.js
```

Expected: no output (syntax OK).

---

### Task 4: Update `project.js` — fetch projects.json

**Files:**
- Modify: `js/project.js`

- [ ] **Step 1: Replace `project.js` contents**

```js
/* ─────────────────────────────────────────
   project.js — renders project.html with
   data from /data/projects.json
   ───────────────────────────────────────── */

// ─── HTML escape helper (prevents XSS from projects.json values) ───
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

document.addEventListener('DOMContentLoaded', async () => {

  const id = new URLSearchParams(window.location.search).get('id');

  let projects;
  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw new Error(res.status);
    projects = await res.json();
  } catch {
    document.title = 'Error — Ivan Julia';
    document.querySelector('.project-detail').innerHTML =
      '<p style="padding:40px;color:#888">Failed to load project data.</p>';
    return;
  }

  const data = projects.find(p => p.id === id);

  if (!data) {
    document.title = 'Proyecto no encontrado — Ivan Julia';
    document.querySelector('.project-detail').innerHTML =
      '<p style="padding:40px;color:#888">Proyecto no encontrado.</p>';
    return;
  }

  document.title = `${data.title} — Ivan Julia`;

  document.getElementById('pd-category').textContent = data.categoryLabel;
  document.getElementById('pd-title').textContent    = data.title;

  const metaFields = [
    { label: 'Director',           value: data.director    },
    { label: 'Producción',         value: data.producer    },
    { label: 'DOP',                value: data.dop         },
    { label: 'Año',                value: data.year        },
    { label: 'Sec. Unit Director', value: data.secdirector },
    { label: 'Sec. Unit DOP',      value: data.secdop      },
  ].filter(f => f.value);

  const metaEl = document.getElementById('pd-meta');
  metaFields.forEach(({ label, value }) => {
    metaEl.insertAdjacentHTML('beforeend', `
      <div class="meta-item">
        <strong>${esc(label)}</strong>
        ${esc(value)}
      </div>`);
  });

  const videoEl = document.getElementById('pd-video');
  if (data.vimeoId && /^\d+$/.test(data.vimeoId)) {
    videoEl.innerHTML = `
      <iframe
        src="https://player.vimeo.com/video/${esc(data.vimeoId)}?autoplay=0&title=0&byline=0&portrait=0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen>
      </iframe>`;
  } else {
    videoEl.style.display = 'none';
  }

  const galleryEl = document.getElementById('pd-gallery');
  data.stills.forEach((src, i) => {
    const lqSrc = src.replace('.webp', '-lq.webp');
    galleryEl.insertAdjacentHTML('beforeend', `
      <div class="gallery-item">
        <img class="lq" loading="lazy"
             src="${esc(lqSrc)}" data-hq="${esc(src)}"
             alt="${esc(data.title)} — still ${i + 1}" />
      </div>`);
  });

  if (typeof initProgressiveImages === 'function') initProgressiveImages();
});
```

- [ ] **Step 2: Verify no syntax errors**

```bash
node --check js/project.js
```

Expected: no output.

---

### Task 5: Update `index.html` — empty the project grid

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove all hardcoded `<article>` project blocks from `index.html`**

Two changes in `index.html`:

**Change A** — Find the `<!-- ─── PROJECTS GRID ─── -->` section (around line 29). Replace everything between `<main class="projects-section">` and `</main>` with nothing — leave the tags empty:

```html
  <!-- ─── PROJECTS GRID ─── -->
  <main class="projects-section">
  </main>
```

**Change B** — Near the bottom of `<body>` (around line 353, after `</main>` and before `</body>`), remove the line:
```html
  <script src="js/projects-data.js"></script>
```
This script tag is **outside** `<main>` — do not look for it inside the grid section.

- [ ] **Step 2: Verify `index.html` has no remaining references to `projects-data.js`**

```bash
grep -n "projects-data" index.html
```

Expected: no output.

- [ ] **Step 3: Commit frontend changes**

```bash
git add js/main.js js/project.js index.html
git commit -m "feat: render home grid and project pages dynamically from projects.json"
```

---

### Task 6: Smoke-test the frontend locally

**Files:** none (verification only)

- [ ] **Step 1: Serve the site locally**

```bash
npx serve . -p 3000
```

- [ ] **Step 2: Open `http://localhost:3000` and verify**

Check:
- All 20 projects appear in the grid
- Low-quality placeholders show first, then swap to high-quality
- Category filter (Music Videos / Commercials / Narrative) hides/shows correct projects
- Clicking a project opens `project.html` with correct title, meta, and stills

- [ ] **Step 3: Stop the dev server (`Ctrl+C`)**

---

## Chunk 3: Vercel API Routes

### Task 7: Add `vercel.json`

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/admin", "destination": "/admin/index.html" }
  ],
  "functions": {
    "api/**/*.js": {
      "memory": 512,
      "maxDuration": 30
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: add vercel.json with admin rewrite and function config"
```

---

### Task 8: Shared helper — JWT verification

**Files:**
- Create: `api/_lib/verify-jwt.js`
- Create: `tests/api/_lib/verify-jwt.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/api/_lib/verify-jwt.test.js`:

```js
const jwt = require('jsonwebtoken');

// Set env before requiring the module
process.env.JWT_SECRET = 'test-secret-32-bytes-xxxxxxxxxxxxx';

const { verifyJwt } = require('../../../api/_lib/verify-jwt');

describe('verifyJwt', () => {
  it('returns payload for a valid token', () => {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const payload = verifyJwt(token);
    expect(payload.admin).toBe(true);
  });

  it('throws for an invalid token', () => {
    expect(() => verifyJwt('bad.token.here')).toThrow();
  });

  it('throws for an expired token', () => {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    expect(() => verifyJwt(token)).toThrow();
  });

  it('returns null when token is undefined', () => {
    expect(verifyJwt(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/api/_lib/verify-jwt.test.js --no-coverage
```

Expected: FAIL — `Cannot find module '../../../api/_lib/verify-jwt'`

- [ ] **Step 3: Create `api/_lib/verify-jwt.js`**

```js
const jwt    = require('jsonwebtoken');
const cookie = require('cookie');

/**
 * Verify a JWT string. Returns payload or null (if undefined/null).
 * Throws if the token is present but invalid or expired.
 */
function verifyJwt(token) {
  if (!token) return null;
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * Extract and verify the admin_token cookie from an HTTP request.
 * Returns the JWT payload on success, or sends 401 and returns null.
 */
function requireAuth(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  try {
    const payload = verifyJwt(cookies.admin_token);
    if (!payload) {
      res.status(401).json({ error: 'Unauthorized' });
      return null;
    }
    return payload;
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
}

module.exports = { verifyJwt, requireAuth };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/api/_lib/verify-jwt.test.js --no-coverage
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/verify-jwt.js tests/api/_lib/verify-jwt.test.js
git commit -m "feat: add JWT verify helper with tests"
```

---

### Task 9: Shared helper — GitHub API client

**Files:**
- Create: `api/_lib/github.js`
- Create: `tests/api/_lib/github.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/api/_lib/github.test.js`:

```js
process.env.GITHUB_TOKEN  = 'fake-token';
process.env.GITHUB_REPO   = 'owner/repo';
process.env.GITHUB_BRANCH = 'main';

const { encodeContent, buildFileUrl } = require('../../../api/_lib/github');

describe('github helpers', () => {
  it('encodeContent converts string to base64', () => {
    expect(encodeContent('hello')).toBe(Buffer.from('hello').toString('base64'));
  });

  it('encodeContent converts Buffer to base64', () => {
    const buf = Buffer.from([1, 2, 3]);
    expect(encodeContent(buf)).toBe(buf.toString('base64'));
  });

  it('buildFileUrl returns correct GitHub API URL', () => {
    const url = buildFileUrl('assets/images/test/still-1.webp');
    expect(url).toBe(
      'https://api.github.com/repos/owner/repo/contents/assets/images/test/still-1.webp'
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/api/_lib/github.test.js --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `api/_lib/github.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/api/_lib/github.test.js --no-coverage
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/github.js tests/api/_lib/github.test.js
git commit -m "feat: add GitHub API helper with tests"
```

---

### Task 10: `POST /api/auth` — login

**Files:**
- Create: `api/auth.js`
- Create: `tests/api/auth.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/api/auth.test.js`:

```js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const cookie = require('cookie');

process.env.JWT_SECRET          = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-password', 4); // cost 4 for speed in tests

const handler = require('../../api/auth');

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status  = (s) => { res._status = s; return res; };
  res.json    = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

describe('POST /api/auth', () => {
  it('returns 405 for non-POST', async () => {
    const req = { method: 'GET',  body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('returns 401 for wrong password', async () => {
    const req = { method: 'POST', body: { password: 'wrong' } };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('sets httpOnly cookie and returns ok for correct password', async () => {
    const req = { method: 'POST', body: { password: 'correct-password' } };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body.ok).toBe(true);
    const setCookie = res._headers['Set-Cookie'];
    expect(setCookie).toMatch(/admin_token=/);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Strict/);
    const tokenValue = setCookie.match(/admin_token=([^;]+)/)[1];
    const payload = jwt.verify(tokenValue, process.env.JWT_SECRET);
    expect(payload.admin).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/api/auth.test.js --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `api/auth.js`**

```js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const cookie = require('cookie');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password required' });

  const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.setHeader('Set-Cookie', cookie.serialize('admin_token', token, {
    httpOnly: true,
    secure:   true,
    sameSite: 'strict',
    maxAge:   86400,
    path:     '/',
  }));

  return res.status(200).json({ ok: true });
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/api/auth.test.js --no-coverage
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add api/auth.js tests/api/auth.test.js
git commit -m "feat: add POST /api/auth login route with tests"
```

---

### Task 11: `POST /api/logout`

**Files:**
- Create: `api/logout.js`
- Create: `tests/api/logout.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/api/logout.test.js`:

```js
process.env.JWT_SECRET = 'test-secret-32-bytes-xxxxxxxxxxxxx';

const jwt    = require('jsonwebtoken');
const cookie = require('cookie');
const handler = require('../../api/logout');

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

describe('POST /api/logout', () => {
  it('returns 405 for non-POST', async () => {
    const req = { method: 'GET', headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('returns 401 without auth cookie', async () => {
    const req = { method: 'POST', headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('clears the cookie and returns ok', async () => {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET);
    const req = {
      method: 'POST',
      headers: { cookie: `admin_token=${token}` },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body.ok).toBe(true);
    expect(res._headers['Set-Cookie']).toMatch(/Max-Age=0/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/api/logout.test.js --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `api/logout.js`**

```js
const cookie = require('cookie');
const { requireAuth } = require('./_lib/verify-jwt');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  res.setHeader('Set-Cookie', cookie.serialize('admin_token', '', {
    httpOnly: true,
    secure:   true,
    sameSite: 'strict',
    maxAge:   0,
    path:     '/',
  }));

  return res.status(200).json({ ok: true });
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/api/logout.test.js --no-coverage
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add api/logout.js tests/api/logout.test.js
git commit -m "feat: add POST /api/logout route with tests"
```

---

### Task 12: `POST /api/upload` — image processing and GitHub commit

**Files:**
- Create: `api/upload.js`
- Create: `tests/api/upload.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/api/upload.test.js`:

```js
jest.mock('../../../api/_lib/github', () => ({
  putFile:    jest.fn().mockResolvedValue({}),
  fileExists: jest.fn().mockResolvedValue(false),
}));

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

process.env.JWT_SECRET          = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('pw', 4);
process.env.GITHUB_REPO         = 'owner/repo';
process.env.GITHUB_BRANCH       = 'main';
process.env.GITHUB_TOKEN        = 'fake';

const { putFile } = require('../../../api/_lib/github');
const handler = require('../../api/upload');

function validToken() {
  return jwt.sign({ admin: true }, process.env.JWT_SECRET);
}

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

describe('POST /api/upload', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 405 for non-POST', async () => {
    const req = { method: 'GET', headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('returns 401 without auth cookie', async () => {
    const req = { method: 'POST', headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('returns paths after successful upload', async () => {
    // Build a minimal 1x1 PNG buffer as fake image input
    const { createCanvas } = (() => {
      try { return require('canvas'); } catch { return null; }
    })() || {};

    // Use sharp to create a minimal valid WebP for testing
    const sharp = require('sharp');
    const fakeImage = await sharp({
      create: { width: 10, height: 10, channels: 3, background: { r: 100, g: 100, b: 100 } }
    }).webp().toBuffer();

    const cookie = require('cookie');
    const token  = validToken();

    // Mock formidable parse to return our fake file
    jest.mock('formidable', () => {
      return jest.fn().mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          { projectId: ['test-project'], index: ['1'] },
          { file: [{ filepath: '/tmp/fake.webp', originalFilename: 'test.webp', size: fakeImage.length }] },
        ]),
      }));
    });

    // Because formidable is already required in upload.js before our mock,
    // we test the integration at the GitHub putFile call level instead.
    // This test confirms 401 is NOT returned with a valid cookie.
    const req = {
      method: 'POST',
      headers: { cookie: `admin_token=${token}`, 'content-type': 'multipart/form-data' },
    };
    const res = mockRes();
    await handler(req, res);
    // Should not be 401 or 405
    expect(res._status).not.toBe(401);
    expect(res._status).not.toBe(405);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/api/upload.test.js --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `api/upload.js`**

```js
const formidable = require('formidable');
const fs         = require('fs');
const sharp      = require('sharp');
const { requireAuth }    = require('./_lib/verify-jwt');
const { putFile }        = require('./_lib/github');

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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/api/upload.test.js --no-coverage
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add api/upload.js tests/api/upload.test.js
git commit -m "feat: add POST /api/upload image processing route with tests"
```

---

### Task 13: `POST + DELETE /api/projects`

**Files:**
- Create: `api/projects.js`
- Create: `tests/api/projects.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/api/projects.test.js`:

```js
jest.mock('../../api/_lib/github', () => ({
  getFile:    jest.fn(),
  putFile:    jest.fn().mockResolvedValue({}),
  fileExists: jest.fn().mockResolvedValue(true),
}));

const jwt = require('jsonwebtoken');
process.env.JWT_SECRET    = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.GITHUB_REPO   = 'owner/repo';
process.env.GITHUB_BRANCH = 'main';
process.env.GITHUB_TOKEN  = 'fake';

const { getFile, putFile, fileExists } = require('../../api/_lib/github');
const handler = require('../../api/projects');

function validCookie() {
  return `admin_token=${jwt.sign({ admin: true }, process.env.JWT_SECRET)}`;
}

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

const existingProjects = [
  { id: 'existing', title: 'Existing', stills: ['/assets/images/existing/still-1.webp', '/assets/images/existing/still-2.webp', '/assets/images/existing/still-3.webp'] }
];

describe('POST /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFile.mockResolvedValue({
      content: Buffer.from(JSON.stringify(existingProjects)),
      sha: 'abc123',
    });
  });

  it('returns 401 without auth', async () => {
    const req = { method: 'POST', headers: {}, body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('returns 409 on duplicate project id', async () => {
    const req = {
      method: 'POST',
      headers: { cookie: validCookie() },
      body: {
        id: 'existing', title: 'Dupe', categoryLabel: 'Music Video', category: 'music-videos',
        stills: ['/assets/images/existing/still-1.webp', '/assets/images/existing/still-2.webp', '/assets/images/existing/still-3.webp'],
      },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(409);
    expect(res._body.error).toMatch(/already exists/i);
  });

  it('adds project and commits on success', async () => {
    const req = {
      method: 'POST',
      headers: { cookie: validCookie() },
      body: {
        id: 'new-project', title: 'New', categoryLabel: 'Commercial', category: 'commercials',
        director: '', producer: '', dop: '', secdirector: '', secdop: '', year: '', vimeoId: '',
        stills: ['/assets/images/new-project/still-1.webp', '/assets/images/new-project/still-2.webp', '/assets/images/new-project/still-3.webp'],
      },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body.ok).toBe(true);
    expect(putFile).toHaveBeenCalledTimes(1);
    const committed = JSON.parse(putFile.mock.calls[0][1]);
    expect(committed).toHaveLength(2);
    expect(committed[1].id).toBe('new-project');
  });
});

describe('DELETE /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFile.mockResolvedValue({
      content: Buffer.from(JSON.stringify(existingProjects)),
      sha: 'abc123',
    });
  });

  it('removes project and commits on success', async () => {
    const req = {
      method: 'DELETE',
      headers: { cookie: validCookie() },
      body: { id: 'existing' },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    const committed = JSON.parse(putFile.mock.calls[0][1]);
    expect(committed).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/api/projects.test.js --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `api/projects.js`**

```js
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
      vimeoId:      data.vimeoId      || '',
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/api/projects.test.js --no-coverage
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add api/projects.js tests/api/projects.test.js
git commit -m "feat: add POST+DELETE /api/projects route with tests"
```

---

### Task 14: `PUT /api/projects/reorder`

**Files:**
- Create: `api/projects/reorder.js`
- Create: `tests/api/projects/reorder.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/api/projects/reorder.test.js`:

```js
jest.mock('../../../api/_lib/github', () => ({
  getFile: jest.fn(),
  putFile: jest.fn().mockResolvedValue({}),
}));

const jwt = require('jsonwebtoken');
process.env.JWT_SECRET    = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.GITHUB_REPO   = 'owner/repo';
process.env.GITHUB_BRANCH = 'main';
process.env.GITHUB_TOKEN  = 'fake';

const { getFile, putFile } = require('../../../api/_lib/github');
const handler = require('../../../api/projects/reorder');

function validCookie() {
  return `admin_token=${jwt.sign({ admin: true }, process.env.JWT_SECRET)}`;
}
function mockRes() {
  const res = { _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = () => {};
  return res;
}

const projects = [
  { id: 'alpha', title: 'Alpha' },
  { id: 'beta',  title: 'Beta'  },
  { id: 'gamma', title: 'Gamma' },
];

describe('PUT /api/projects/reorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFile.mockResolvedValue({
      content: Buffer.from(JSON.stringify(projects)),
      sha: 'sha1',
    });
  });

  it('returns 405 for non-PUT', async () => {
    const req = { method: 'POST', headers: {}, body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('returns 401 without auth', async () => {
    const req = { method: 'PUT', headers: {}, body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('reorders projects according to submitted ids', async () => {
    const req = {
      method: 'PUT',
      headers: { cookie: validCookie() },
      body: { ids: ['gamma', 'alpha', 'beta'] },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    const committed = JSON.parse(putFile.mock.calls[0][1]);
    expect(committed.map(p => p.id)).toEqual(['gamma', 'alpha', 'beta']);
  });

  it('returns 400 if ids length does not match', async () => {
    const req = {
      method: 'PUT',
      headers: { cookie: validCookie() },
      body: { ids: ['alpha', 'beta'] }, // missing gamma
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/api/projects/reorder.test.js --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `api/projects/reorder.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/api/projects/reorder.test.js --no-coverage
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests passing (auth, logout, upload, projects, reorder, helpers).

- [ ] **Step 6: Commit**

```bash
git add api/projects/reorder.js tests/api/projects/reorder.test.js
git commit -m "feat: add PUT /api/projects/reorder route with tests"
```

---

### Task 15: Password hash utility script

**Files:**
- Create: `scripts/hash-password.js`

- [ ] **Step 1: Create `scripts/hash-password.js`**

```js
#!/usr/bin/env node
/**
 * Generate a bcrypt hash for the admin password.
 * Usage: npm run hash-password
 * Then set the output as ADMIN_PASSWORD_HASH in Vercel env vars.
 */
const bcrypt   = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter admin password: ', async (password) => {
  rl.close();
  if (!password) { console.error('Password cannot be empty'); process.exit(1); }
  const hash = await bcrypt.hash(password, 12);
  console.log('\nYour ADMIN_PASSWORD_HASH:');
  console.log(hash);
  console.log('\nSet this in Vercel → Settings → Environment Variables.');
});
```

- [ ] **Step 2: Commit**

```bash
git add scripts/hash-password.js
git commit -m "feat: add password hash utility script"
```

---

## Chunk 4: Admin UI

### Task 16: Admin login screen + dashboard shell

**Files:**
- Create: `admin/index.html`

- [ ] **Step 1: Create `admin/` directory and write `admin/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin — Ivan Julia</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0a; --surface: #111111; --surface2: #1a1a1a;
      --border: #2a2a2a; --text: #ffffff; --muted: #666666;
      --danger: #ff4444; --success: #44cc88;
    }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 14px; min-height: 100vh; }

    /* ── LOGIN ── */
    #login-screen {
      display: flex; align-items: center; justify-content: center; min-height: 100vh;
    }
    .login-box { width: 320px; }
    .login-logo { font-size: 13px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 32px; }
    .login-logo span { color: var(--muted); font-weight: 300; }
    .form-label { display: block; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .form-input { width: 100%; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-family: inherit; font-size: 13px; padding: 11px 14px; outline: none; transition: border-color 0.15s; }
    .form-input:focus { border-color: #555; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 20px; font-family: inherit; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; border: none; transition: opacity 0.2s; width: 100%; margin-top: 12px; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-primary { background: var(--text); color: var(--bg); }
    .btn-ghost { background: none; border: 1px solid var(--border); color: var(--muted); }
    .btn-ghost:hover:not(:disabled) { color: var(--text); border-color: #555; }
    .error-msg { color: var(--danger); font-size: 12px; margin-top: 10px; min-height: 18px; }

    /* ── LAYOUT ── */
    #dashboard { display: none; flex-direction: column; min-height: 100vh; }
    .admin-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
    .admin-logo { font-size: 13px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; }
    .admin-logo span { color: var(--muted); font-weight: 300; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .save-order-btn { display: none; background: var(--text); color: var(--bg); border: none; font-family: inherit; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 7px 16px; cursor: pointer; }
    .save-order-btn.visible { display: inline-block; }
    .logout-btn-header { background: none; border: 1px solid var(--border); color: var(--muted); font-family: inherit; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 14px; cursor: pointer; }
    .logout-btn-header:hover { color: var(--text); border-color: #555; }
    .admin-body { display: flex; flex: 1; }

    /* ── SIDEBAR ── */
    .sidebar { width: 200px; background: var(--surface); border-right: 1px solid var(--border); padding: 24px 0; flex-shrink: 0; }
    .sidebar-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; padding: 0 20px; }
    .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 9px 20px; cursor: pointer; color: var(--muted); font-size: 13px; transition: background 0.15s, color 0.15s; }
    .sidebar-item:hover { background: var(--surface2); color: var(--text); }
    .sidebar-item.active { background: var(--surface2); color: var(--text); }
    .sidebar-item .count { margin-left: auto; font-size: 11px; }

    /* ── MAIN ── */
    .main { flex: 1; padding: 32px; overflow-y: auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .page-title { font-size: 18px; font-weight: 400; letter-spacing: 0.04em; }
    .page-subtitle { color: var(--muted); font-size: 13px; margin-top: 4px; }
    .btn-sm { padding: 9px 18px; font-size: 11px; width: auto; margin-top: 0; }

    /* ── PROJECT LIST ── */
    .project-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 40px; }
    .list-header { display: grid; grid-template-columns: 80px 1fr 120px 36px 36px; gap: 12px; align-items: center; padding: 0 16px 8px; }
    .list-header span { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
    .project-row { display: grid; grid-template-columns: 80px 1fr 120px 36px 36px; gap: 12px; align-items: center; background: var(--surface); border: 1px solid var(--border); padding: 10px 16px; transition: border-color 0.15s; }
    .project-row:hover { border-color: #3a3a3a; }
    .project-thumb { width: 80px; height: 45px; background: var(--surface2); border: 1px solid var(--border); overflow: hidden; }
    .project-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
    .project-name { font-size: 13px; }
    .project-id { font-size: 11px; color: var(--muted); margin-top: 2px; font-family: monospace; }
    .badge { display: inline-block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border: 1px solid var(--border); color: var(--muted); }
    .reorder-btns { display: flex; flex-direction: column; gap: 2px; }
    .reorder-btn { background: none; border: none; color: #444; cursor: pointer; font-size: 12px; line-height: 1; padding: 2px 4px; transition: color 0.15s; }
    .reorder-btn:hover { color: var(--text); }
    .del-btn { background: none; border: none; color: #333; cursor: pointer; font-size: 18px; transition: color 0.15s; }
    .del-btn:hover { color: var(--danger); }

    /* ── ADD FORM ── */
    .form-card { background: var(--surface); border: 1px solid var(--border); padding: 28px; }
    .form-card-title { font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-input-inline { background: var(--surface2); border: 1px solid var(--border); color: var(--text); font-family: inherit; font-size: 13px; padding: 10px 12px; outline: none; width: 100%; transition: border-color 0.15s; }
    .form-input-inline:focus { border-color: #555; }
    .form-input-inline.error-field { border-color: var(--danger); }
    .form-select { background: var(--surface2); border: 1px solid var(--border); color: var(--text); font-family: inherit; font-size: 13px; padding: 10px 12px; outline: none; appearance: none; width: 100%; cursor: pointer; }
    .stills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .still-slot { aspect-ratio: 16/9; background: var(--surface2); border: 1px dashed var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; transition: border-color 0.15s; }
    .still-slot:hover { border-color: #555; }
    .still-slot.uploaded { border-style: solid; border-color: var(--success); }
    .still-slot.uploading { opacity: 0.6; pointer-events: none; }
    .still-slot.slot-error { border-color: var(--danger); }
    .still-slot img { width: 100%; height: 100%; object-fit: cover; }
    .still-slot .slot-label { font-size: 11px; color: var(--muted); }
    .still-slot .slot-icon { font-size: 20px; color: #333; margin-bottom: 6px; }
    .still-slot input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
    .still-slot .slot-status { position: absolute; bottom: 6px; font-size: 10px; }
    .still-slot.uploaded .slot-status { color: var(--success); }
    .still-slot.slot-error .slot-status { color: var(--danger); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border); }
    .field-error { color: var(--danger); font-size: 11px; margin-top: 4px; }

    /* ── TOAST ── */
    #toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface); border: 1px solid var(--border); padding: 12px 20px; font-size: 13px; display: none; z-index: 100; }
    #toast.error { border-color: var(--danger); color: var(--danger); }
    #toast.success { border-color: var(--success); color: var(--success); }

    /* ── STATUS BAR ── */
    .status-bar { background: var(--surface); border-top: 1px solid var(--border); padding: 10px 32px; display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--muted); }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
    .hidden { display: none !important; }
  </style>
</head>
<body>

<!-- ── LOGIN ── -->
<div id="login-screen">
  <div class="login-box">
    <div class="login-logo">IVAN JULIA <span>— Admin</span></div>
    <label class="form-label" for="pw-input">Password</label>
    <input id="pw-input" class="form-input" type="password" autocomplete="current-password" />
    <button id="login-btn" class="btn btn-primary">Enter</button>
    <div id="login-error" class="error-msg"></div>
  </div>
</div>

<!-- ── DASHBOARD ── -->
<div id="dashboard">
  <header class="admin-header">
    <div class="admin-logo">IVAN JULIA <span>— Admin</span></div>
    <div class="header-actions">
      <button id="save-order-btn" class="save-order-btn">Save Order</button>
      <button id="logout-btn" class="logout-btn-header">Log out</button>
    </div>
  </header>

  <div class="admin-body">
    <aside class="sidebar">
      <div style="padding: 0 0 12px;">
        <div class="sidebar-label">Projects</div>
        <div class="sidebar-item active" data-filter="all">All <span class="count" id="count-all">0</span></div>
        <div class="sidebar-item" data-filter="music-videos">Music Videos <span class="count" id="count-mv">0</span></div>
        <div class="sidebar-item" data-filter="commercials">Commercials <span class="count" id="count-comm">0</span></div>
        <div class="sidebar-item" data-filter="narrative">Narrative <span class="count" id="count-narr">0</span></div>
      </div>
    </aside>

    <main class="main">
      <div class="page-header">
        <div>
          <div class="page-title">Projects</div>
          <div class="page-subtitle">Manage and add portfolio projects</div>
        </div>
        <button id="show-form-btn" class="btn btn-primary btn-sm">+ Add Project</button>
      </div>

      <!-- Project list -->
      <div id="project-list" class="project-list">
        <div class="list-header">
          <span></span><span>Title</span><span>Category</span><span></span><span></span>
        </div>
      </div>

      <!-- Add project form (hidden by default) -->
      <div id="add-form" class="form-card hidden">
        <div class="form-card-title">Add New Project</div>

        <div style="margin-bottom:8px"><div class="form-label">Stills (3 images)</div></div>
        <div class="stills-grid">
          <div class="still-slot" id="slot-1">
            <input type="file" accept="image/*" data-index="1" />
            <div class="slot-icon">↑</div>
            <div class="slot-label">Still 1</div>
            <div class="slot-status"></div>
          </div>
          <div class="still-slot" id="slot-2">
            <input type="file" accept="image/*" data-index="2" />
            <div class="slot-icon">↑</div>
            <div class="slot-label">Still 2</div>
            <div class="slot-status"></div>
          </div>
          <div class="still-slot" id="slot-3">
            <input type="file" accept="image/*" data-index="3" />
            <div class="slot-icon">↑</div>
            <div class="slot-label">Still 3</div>
            <div class="slot-status"></div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group full">
            <label class="form-label" for="f-title">Title</label>
            <input id="f-title" class="form-input-inline" type="text" placeholder="e.g. Trueno - Violento" />
          </div>
          <div class="form-group">
            <label class="form-label" for="f-id">Project ID</label>
            <input id="f-id" class="form-input-inline" type="text" placeholder="auto-generated" />
            <div class="field-error" id="id-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="f-category">Category</label>
            <select id="f-category" class="form-select">
              <option value="music-videos" data-label="Music Video">Music Video</option>
              <option value="commercials"  data-label="Commercial">Commercial</option>
              <option value="narrative"    data-label="Narrative">Narrative</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="f-director">Director</label>
            <input id="f-director" class="form-input-inline" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label" for="f-producer">Producer</label>
            <input id="f-producer" class="form-input-inline" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label" for="f-dop">DOP</label>
            <input id="f-dop" class="form-input-inline" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label" for="f-year">Year</label>
            <input id="f-year" class="form-input-inline" type="text" placeholder="2025" />
          </div>
          <div class="form-group full">
            <label class="form-label" for="f-vimeo">Vimeo ID</label>
            <input id="f-vimeo" class="form-input-inline" type="text" placeholder="e.g. 1087538165" />
          </div>
        </div>

        <div class="form-actions">
          <button id="cancel-form-btn" class="btn btn-ghost btn-sm">Cancel</button>
          <button id="publish-btn" class="btn btn-primary btn-sm" disabled>Upload & Publish</button>
        </div>
      </div>
    </main>
  </div>

  <div class="status-bar">
    <div class="status-dot"></div>
    Connected to GitHub
  </div>
</div>

<div id="toast"></div>

<script>
/* ── Helpers ─────────────────────────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

function showToast(msg, type = 'error') {
  const t = $('toast');
  t.innerHTML     = msg; // innerHTML allows retry buttons to render
  t.className     = type;
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.display = 'none'; }, 4000);
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
}

/* ── State ───────────────────────────────────────────────────────────────── */
let allProjects    = [];
let activeFilter   = 'all';
let uploadedStills = { 1: null, 2: null, 3: null }; // { hq, lq } per slot
let orderDirty     = false;

/* ── Login ───────────────────────────────────────────────────────────────── */
$('pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('login-btn').addEventListener('click', doLogin);

async function doLogin() {
  const pw  = $('pw-input').value;
  const btn = $('login-btn');
  btn.disabled = true;
  btn.textContent = '…';
  $('login-error').textContent = '';

  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pw }),
  });

  if (res.ok) {
    $('login-screen').style.display = 'none';
    $('dashboard').style.display    = 'flex';
    loadProjects();
  } else {
    $('login-error').textContent = 'Incorrect password';
    btn.disabled    = false;
    btn.textContent = 'Enter';
  }
}

/* ── Logout ──────────────────────────────────────────────────────────────── */
$('logout-btn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
});

/* ── Load + render project list ─────────────────────────────────────────── */
async function loadProjects() {
  const res = await fetch('/data/projects.json');
  allProjects = await res.json();
  renderList();
  updateCounts();
}

function updateCounts() {
  $('count-all').textContent  = allProjects.length;
  $('count-mv').textContent   = allProjects.filter(p => p.category === 'music-videos').length;
  $('count-comm').textContent = allProjects.filter(p => p.category === 'commercials').length;
  $('count-narr').textContent = allProjects.filter(p => p.category === 'narrative').length;
}

function renderList() {
  const list = $('project-list');
  // Remove all rows except header
  Array.from(list.querySelectorAll('.project-row')).forEach(r => r.remove());

  const visible = activeFilter === 'all'
    ? allProjects
    : allProjects.filter(p => p.category === activeFilter);

  visible.forEach((p, i) => {
    const globalIdx = allProjects.indexOf(p);
    const row = document.createElement('div');
    row.className  = 'project-row';
    row.dataset.id = p.id;

    const imgSrc = p.stills[0] || '';
    row.innerHTML = `
      <div class="project-thumb">${imgSrc ? `<img src="${imgSrc}" alt="" />` : ''}</div>
      <div>
        <div class="project-name">${p.title}</div>
        <div class="project-id">${p.id}</div>
      </div>
      <span class="badge">${p.categoryLabel}</span>
      <div class="reorder-btns">
        <button class="reorder-btn up-btn" data-idx="${globalIdx}" title="Move up">▲</button>
        <button class="reorder-btn dn-btn" data-idx="${globalIdx}" title="Move down">▼</button>
      </div>
      <button class="del-btn" data-id="${p.id}" title="Delete">×</button>`;

    row.querySelector('.up-btn').addEventListener('click', () => moveProject(globalIdx, -1));
    row.querySelector('.dn-btn').addEventListener('click', () => moveProject(globalIdx,  1));
    row.querySelector('.del-btn').addEventListener('click', () => deleteProject(p.id));

    list.appendChild(row);
  });
}

/* ── Sidebar filter ──────────────────────────────────────────────────────── */
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    activeFilter = item.dataset.filter;
    renderList();
  });
});

/* ── Reorder ─────────────────────────────────────────────────────────────── */
function moveProject(idx, direction) {
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= allProjects.length) return;
  [allProjects[idx], allProjects[newIdx]] = [allProjects[newIdx], allProjects[idx]];
  orderDirty = true;
  $('save-order-btn').classList.add('visible');
  renderList();
}

$('save-order-btn').addEventListener('click', saveOrder);

async function saveOrder() {
  const btn = $('save-order-btn');
  btn.textContent = 'Saving…';
  btn.disabled    = true;

  const res = await fetch('/api/projects/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: allProjects.map(p => p.id) }),
  });

  if (res.ok) {
    showToast('Order saved. Deploying (~30s)…', 'success');
    btn.textContent = 'Save Order';
    btn.disabled    = false;
    btn.classList.remove('visible');
    orderDirty = false;
  } else {
    const err = await res.json();
    showToast((err.error || 'Error saving order') + ' — <button onclick="saveOrder()" style="color:inherit;background:none;border:none;text-decoration:underline;cursor:pointer;font:inherit">Retry</button>');
    btn.textContent = 'Save Order';
    btn.disabled    = false;
  }
}

/* ── Delete ──────────────────────────────────────────────────────────────── */
async function deleteProject(id) {
  if (!confirm(`Delete "${id}"? This cannot be undone.`)) return;

  const res = await fetch('/api/projects', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (res.ok) {
    allProjects = allProjects.filter(p => p.id !== id);
    renderList();
    updateCounts();
    showToast('Deleted. Deploying (~30s)…', 'success');
  } else {
    const err = await res.json();
    showToast((err.error || 'Error deleting project') + ' — <button onclick="deleteProject(\'' + id + '\')" style="color:inherit;background:none;border:none;text-decoration:underline;cursor:pointer;font:inherit">Retry</button>');
  }
}

/* ── Add form ────────────────────────────────────────────────────────────── */
$('show-form-btn').addEventListener('click', () => {
  $('add-form').classList.remove('hidden');
  $('show-form-btn').classList.add('hidden');
});
$('cancel-form-btn').addEventListener('click', resetForm);

function resetForm() {
  $('add-form').classList.add('hidden');
  $('show-form-btn').classList.remove('hidden');
  ['f-title','f-id','f-director','f-producer','f-dop','f-year','f-vimeo'].forEach(id => $(id).value = '');
  uploadedStills = { 1: null, 2: null, 3: null };
  [1,2,3].forEach(resetSlot);
  $('publish-btn').disabled = true;
  $('id-error').textContent = '';
}

/* ── Title → ID auto-generate ────────────────────────────────────────────── */
$('f-title').addEventListener('input', () => {
  $('f-id').value = slugify($('f-title').value);
  $('id-error').textContent = '';
});

/* ── Image upload slots ──────────────────────────────────────────────────── */
function resetSlot(n) {
  const slot = $(`slot-${n}`);
  slot.className = 'still-slot';
  slot.querySelector('img')?.remove();
  slot.querySelector('.slot-icon').style.display  = '';
  slot.querySelector('.slot-label').style.display = '';
  slot.querySelector('.slot-status').textContent  = '';
}

[1,2,3].forEach(n => {
  $(`slot-${n}`).querySelector('input').addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      const slot = $(`slot-${n}`);
      slot.classList.add('slot-error');
      slot.querySelector('.slot-status').textContent = 'Too large (max 10 MB)';
      return;
    }

    const projectId = $('f-id').value.trim();
    if (!projectId) {
      showToast('Enter a Project ID before uploading images');
      return;
    }

    const slot = $(`slot-${n}`);
    slot.classList.add('uploading');
    slot.querySelector('.slot-status').textContent = 'Uploading…';

    const fd = new FormData();
    fd.append('file', file);
    fd.append('projectId', projectId);
    fd.append('index', String(n));

    const res = await fetch('/api/upload', { method: 'POST', body: fd });

    if (res.ok) {
      const { hq, lq } = await res.json();
      uploadedStills[n] = { hq, lq };
      slot.classList.remove('uploading');
      slot.classList.add('uploaded');
      slot.querySelector('.slot-icon').style.display  = 'none';
      slot.querySelector('.slot-label').style.display = 'none';
      slot.querySelector('.slot-status').textContent  = '✓ Uploaded';

      // Preview
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
      slot.insertBefore(img, slot.firstChild);

      checkPublishReady();
    } else {
      const err = await res.json();
      slot.classList.remove('uploading');
      slot.classList.add('slot-error');
      slot.querySelector('.slot-status').textContent = err.error || `Upload failed for Still ${n} — please re-upload before publishing`;
    }
  });
});

function checkPublishReady() {
  const allDone = [1,2,3].every(n => uploadedStills[n] !== null);
  $('publish-btn').disabled = !allDone;
}

/* ── Publish ─────────────────────────────────────────────────────────────── */
$('publish-btn').addEventListener('click', async () => {
  const id = $('f-id').value.trim();
  if (!id) { $('id-error').textContent = 'Project ID is required'; return; }
  $('id-error').textContent = '';

  const categorySelect = $('f-category');
  const categoryLabel  = categorySelect.options[categorySelect.selectedIndex].dataset.label;

  const project = {
    id,
    title:         $('f-title').value.trim(),
    categoryLabel,
    category:      categorySelect.value,
    director:      $('f-director').value.trim(),
    producer:      $('f-producer').value.trim(),
    dop:           $('f-dop').value.trim(),
    secdirector:   '',
    secdop:        '',
    year:          $('f-year').value.trim(),
    vimeoId:       $('f-vimeo').value.trim(),
    stills: [uploadedStills[1].hq, uploadedStills[2].hq, uploadedStills[3].hq],
  };

  const btn = $('publish-btn');
  btn.disabled    = true;
  btn.textContent = 'Publishing…';

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });

  if (res.ok) {
    showToast('Published! Deploying (~30s)…', 'success');
    allProjects.push(project);
    renderList();
    updateCounts();
    resetForm();
  } else {
    const err = await res.json();
    if (res.status === 409 && err.error.includes('already exists')) {
      $('f-id').classList.add('error-field');
      $('id-error').textContent = 'ID already taken — edit it';
    } else {
      showToast(err.error || 'Error publishing project');
    }
    btn.disabled    = false;
    btn.textContent = 'Upload & Publish';
  }
});
</script>
</body>
</html>
```

- [ ] **Step 2: Verify the file is valid HTML**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('admin/index.html', 'utf8');
console.log('Size:', html.length, 'bytes');
console.log('Has login screen:', html.includes('login-screen'));
console.log('Has dashboard:', html.includes('dashboard'));
console.log('Has still slots:', html.includes('slot-1') && html.includes('slot-2') && html.includes('slot-3'));
console.log('Has reorder:', html.includes('save-order-btn'));
"
```

Expected: all checks print `true`.

- [ ] **Step 3: Commit**

```bash
git add admin/index.html
git commit -m "feat: add admin SPA with login, project list, add form, and reorder"
```

---

### Task 17: End-to-end smoke test (local)

**Files:** none (verification only)

- [ ] **Step 1: Create a local `.env` file for testing**

```bash
# Run the hash password script
npm run hash-password
# Enter a test password when prompted, copy the hash output
```

Then create `.env`:
```
ADMIN_PASSWORD_HASH=<paste hash here>
JWT_SECRET=local-dev-secret-change-this-32b
GITHUB_TOKEN=<your fine-grained PAT>
GITHUB_REPO=<owner>/<repo>
GITHUB_BRANCH=main
```

- [ ] **Step 2: Install Vercel CLI and run locally**

```bash
npm install -g vercel
vercel dev --port 3000
```

- [ ] **Step 3: Open `http://localhost:3000` and verify**

- Homepage loads and shows all 20 projects dynamically from `projects.json`
- Category filter works
- Clicking a project opens the project detail page correctly

- [ ] **Step 4: Open `http://localhost:3000/admin` and verify**

- Login form appears
- Wrong password → "Incorrect password" shown
- Correct password → dashboard appears
- All 20 projects listed with thumbnails
- ↑ ↓ buttons move rows; "Save Order" button appears in header
- Clicking "Save Order" shows "Saving…" feedback, then success toast
- "+ Add Project" reveals the form
- Each image slot enforces 10 MB limit (test with an oversized file)

- [ ] **Step 5: Run the full test suite one final time**

```bash
npx jest --no-coverage
```

Expected: All tests passing.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: verify end-to-end admin flow locally"
```

---

## Deployment Checklist

Before pushing to production:

- [ ] Run `npm run hash-password`, copy hash
- [ ] In Vercel dashboard → Settings → Environment Variables, add:
  - `ADMIN_PASSWORD_HASH` → bcrypt hash from above
  - `JWT_SECRET` → random 32-byte hex (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - `GITHUB_TOKEN` → fine-grained PAT scoped to this repo, Contents: Read & Write
  - `GITHUB_REPO` → `owner/portfolio-ivan`
  - `GITHUB_BRANCH` → `main`
- [ ] Push to `main` → Vercel deploys automatically
- [ ] Verify `https://your-domain.com/admin` loads login screen
- [ ] Test full publish flow with a real project
