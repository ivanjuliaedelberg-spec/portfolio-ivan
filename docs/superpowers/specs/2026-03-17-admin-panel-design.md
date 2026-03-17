# Admin Panel — Design Spec
**Date:** 2026-03-17
**Status:** Approved

---

## Overview

Add a password-protected `/admin` page to the Ivan Julia portfolio that allows uploading new projects (stills + metadata) without touching code. Images and project data are committed to the GitHub repo via the GitHub API, triggering an automatic Vercel redeploy (~30s).

No external services beyond GitHub and Vercel are required.

---

## Architecture

```
/admin/index.html         → Admin SPA (static HTML/JS)
/api/auth.js              → Vercel serverless: login, issues JWT cookie
/api/logout.js            → Vercel serverless: expires JWT cookie
/api/upload.js            → Vercel serverless: receives image, converts to WebP + lq, commits to GitHub
/api/projects.js          → Vercel serverless: add/delete project in projects.json via GitHub commit
/data/projects.json       → Source of truth for all project data (replaces projects-data.js)
/assets/images/{id}/      → Standardized image folders per project
```

### Request flow — adding a project

1. Admin POSTs credentials to `/api/auth` → receives httpOnly JWT cookie (24h expiry, SameSite=Strict)
2. Admin uploads 3 images one at a time to `/api/upload`:
   - Client enforces 10 MB max per file before sending
   - Server rejects files over 10 MB with 413 and a descriptive error message
   - Server converts each to WebP at quality 80, max 1920px (`sharp`)
   - Server generates lq version at quality 15, max 400px
   - Both files committed to `assets/images/{project-id}/still-{n}.webp` and `still-{n}-lq.webp` via GitHub Contents API
   - Returns `{ hq: "/assets/images/{id}/still-{n}.webp", lq: "/assets/images/{id}/still-{n}-lq.webp" }`
   - Client stores returned paths; all 3 hq paths are included in the final project submission
3. Admin submits project form to `/api/projects` (POST):
   - Body includes the 3 `stills` paths (root-relative) returned by `/api/upload` — not derived server-side
   - Server checks for project ID uniqueness; returns 409 if collision detected
   - Server verifies all 6 image files (3 hq + 3 lq) exist in the repo via GitHub API before writing
   - Server reads current `data/projects.json` SHA and content via GitHub API
   - Appends new project entry and commits with the current SHA (GitHub rejects with 409 if SHA is stale)
   - On GitHub 409 conflict: returns 409 to client with message "Conflict — please try again"
   - Returns `{ ok: true }` on success
4. Vercel detects the commit and redeploys — live in ~30 seconds

---

## Data Model

### `data/projects.json`

Replaces `js/projects-data.js`. Same structure, standard JSON array:

```json
[
  {
    "id": "violento",
    "title": "Trueno - Violento",
    "categoryLabel": "Music Video",
    "category": "music-videos",
    "director": "Lautaro Furiolo",
    "producer": "Rebolución",
    "dop": "",
    "secdirector": "",
    "secdop": "",
    "year": "",
    "vimeoId": "1087538165",
    "stills": [
      "/assets/images/violento/still-1.webp",
      "/assets/images/violento/still-2.webp",
      "/assets/images/violento/still-3.webp"
    ]
  }
]
```

Array (not object) so insertion order is preserved for display on the homepage.

All `stills` paths are **root-relative** (prefixed with `/`). This ensures they resolve correctly from both `index.html` (root) and `projects/project.html` (one level deep).

### Image file convention

```
/assets/images/{project-id}/still-1.webp      ← high quality (q80, max 1920px)
/assets/images/{project-id}/still-1-lq.webp   ← low quality placeholder (q15, max 400px)
/assets/images/{project-id}/still-2.webp
/assets/images/{project-id}/still-2-lq.webp
/assets/images/{project-id}/still-3.webp
/assets/images/{project-id}/still-3-lq.webp
```

Project ID is auto-generated from the title: lowercase, spaces → hyphens, special chars stripped, accents removed. Example: "Trueno - Violento" → `trueno-violento`. The field is editable before submitting.

---

## API Routes

All mutation routes require a valid JWT in the `admin_token` httpOnly cookie. Return 401 if missing or expired.

### `POST /api/auth`
- Body: `{ password: string }`
- Compares against `bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)`
- On success: sets `admin_token` httpOnly cookie (`SameSite=Strict; HttpOnly; Secure; Max-Age=86400`), returns `{ ok: true }`
- On failure: returns 401

### `POST /api/logout`
- Requires valid JWT cookie
- Clears `admin_token` by setting `Max-Age=0` on the cookie
- Returns `{ ok: true }`

### `POST /api/upload`
- Requires valid JWT cookie
- Body: `multipart/form-data` with fields `file` (image, max 10 MB), `projectId` (string), `index` (1|2|3)
- Returns 413 with `{ error: "File too large. Maximum size is 10 MB." }` if file exceeds 10 MB
- Converts image to WebP (q80, 1920px max) using `sharp`
- Generates lq version (q15, 400px max)
- Commits both files to GitHub via Contents API
- Returns `{ hq: "/assets/images/{id}/still-{n}.webp", lq: "/assets/images/{id}/still-{n}-lq.webp" }`

### `POST /api/projects`
- Requires valid JWT cookie
- Body: full project object including `stills` array (3 root-relative paths as returned by `/api/upload`)
- Validates: all required fields present, `stills` has exactly 3 entries
- Checks for ID uniqueness in current `projects.json`; returns 409 `{ error: "Project ID already exists" }` if duplicate
- Verifies all 6 image paths exist in the repo via GitHub API; returns 422 `{ error: "Images not found — re-upload and try again" }` if any are missing
- Fetches `data/projects.json` current content + SHA via GitHub API
- Appends new entry and commits with that SHA
- On GitHub 409 (SHA conflict): returns 409 `{ error: "Conflict — please try again" }`
- Returns `{ ok: true }` on success

### `DELETE /api/projects`
- Requires valid JWT cookie
- Body: `{ id: string }`
- Fetches `data/projects.json` current content + SHA via GitHub API
- Removes entry by id, commits with that SHA
- On GitHub 409 (SHA conflict): returns 409 `{ error: "Conflict — please try again" }`
- Does NOT delete image files (kept for safety; can be cleaned up manually in repo)
- Returns `{ ok: true }`
- UI: on 409, shows a toast error "Conflict — please try again" with a retry button next to the project row

---

## Admin UI

Single-page app at `/admin/index.html`. No framework — vanilla JS.

### Login screen
- Centered form with password input and submit button
- On success: stores nothing (JWT is httpOnly cookie), renders dashboard

### Dashboard
- **Header:** "IVAN JULIA — Admin" + logout button (calls `POST /api/logout`, then redirects to login)
- **Sidebar:** project count by category (All / Music Videos / Commercials / Narrative)
- **Project list:** thumbnail, title, project ID, category badge, Vimeo ID, delete button
- **Add project form:**
  - 3 image upload slots (click to pick file) — each slot uploads immediately on file selection via `POST /api/upload`; shows preview on success, error message on failure
  - Client validates file size ≤ 10 MB before sending; shows inline error if exceeded
  - Fields: Title, Project ID (auto-generated from title, editable), Category (select), Director, Producer, DOP, Year, Vimeo ID
  - "Upload & Publish" button — disabled until all 3 image slots show a successful upload
  - On submit: POST to `/api/projects` with stored image paths, shows "Publishing… (~30s)" feedback
  - On 409 ID conflict: highlights the Project ID field with "ID already taken — edit it"
  - On 409 GitHub conflict: shows "Conflict — please try again" with a retry button
  - On partial upload failure: shows "Upload failed for Still {n} — please re-upload before publishing"

---

## Frontend Changes

### Dynamic rendering of `index.html` home grid

`index.html` currently has every project hard-coded as a static `<article>`. Replace the entire grid with a single empty `<main class="projects-section"></main>` and render it dynamically from `projects.json`:

```js
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function renderHomepage() {
  const projects = await fetch('/data/projects.json').then(r => r.json());
  const main = document.querySelector('.projects-section');
  projects.forEach(p => {
    const details = [
      p.director ? 'Dir. ' + p.director : '',
      p.producer ? 'Prod. ' + p.producer : ''
    ].filter(Boolean).join(' | ');

    main.insertAdjacentHTML('beforeend', `
      <article class="project" data-category="${esc(p.category)}">
        <a href="projects/project.html?id=${esc(p.id)}" class="project-link">
          <div class="project-stills">
            ${p.stills.map((src, i) => `
              <div class="still">
                <img class="lq" loading="${i === 0 ? 'eager' : 'lazy'}"
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
}
```

All interpolated values are passed through `esc()` before insertion into HTML.

The category filter, burger menu, and logo click logic in `main.js` remain unchanged — they query `.project[data-category]` after rendering.

### `project.html` / `project.js`

Replace the `<script src="../js/projects-data.js">` tag with a `fetch('/data/projects.json')` call. Change `PROJECTS[id]` lookup to `projects.find(p => p.id === id)`.

### Progressive image loading
Already implemented (`lq` / `hq-ready` CSS classes + `initProgressiveImages()` in `main.js`). No changes needed — new projects follow the same `still-{n}.webp` / `still-{n}-lq.webp` convention and root-relative paths.

---

## Image Migration

One-time migration: rename all existing images to the new convention and update `data/projects.json`.

**Naming map (existing → new):**
```
assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /1 - Violento - Stills - 9.webp  → assets/images/violento/still-1.webp
assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /1 - Violento - Stills - 11.webp → assets/images/violento/still-2.webp
... (all 20 projects)
```

All migrated paths in `projects.json` use the root-relative `/assets/images/{id}/still-{n}.webp` format.

A migration script will be written as part of implementation to handle all 20 projects automatically.

---

## Security

| Concern | Mitigation |
|---|---|
| Password brute force | bcrypt cost 12 |
| JWT theft via JS | httpOnly cookie (inaccessible to JS) |
| CSRF | `SameSite=Strict` on cookie — browser won't send it cross-origin |
| GitHub token leak | Stored in Vercel env var, never sent to browser |
| Unauthorized API calls | All mutation routes verify JWT before any GitHub API call |
| Malicious file upload | `sharp` re-encodes all uploads — original bytes discarded; 10 MB hard limit |
| Duplicate project IDs | Server-side uniqueness check before commit; returns 409 |
| GitHub write conflicts | SHA-based optimistic concurrency; returns 409 on mismatch |
| Session after logout | `POST /api/logout` sets `Max-Age=0` to expire cookie server-side |

---

## Environment Variables (Vercel)

```
ADMIN_PASSWORD_HASH    bcrypt hash of admin password (cost 12)
JWT_SECRET             random 32-byte hex string
GITHUB_TOKEN           fine-grained PAT: this repo only, Contents: Read & Write
GITHUB_REPO            owner/repo  (e.g. mvella/portfolio-ivan)
GITHUB_BRANCH          main
```

---

## Dependencies (new)

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "sharp": "^0.33.0",
  "cookie": "^0.6.0",
  "formidable": "^3.5.0"
}
```

`sharp` has native binaries — Vercel supports it out of the box.
`formidable` handles `multipart/form-data` parsing in the upload route.

---

## Out of Scope

- Editing existing projects (delete + re-add as workaround)
- Reordering projects (manual edit of `projects.json` in GitHub)
- Multiple admin users
- Video hosting (Vimeo ID is still entered manually)
- Deleting orphaned image files from repo after project deletion
