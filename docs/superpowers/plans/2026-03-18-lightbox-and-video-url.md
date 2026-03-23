# Lightbox & Generic videoUrl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen still lightbox on the project detail page and replace the `vimeoId` field with a generic `videoUrl` that supports both Vimeo IDs and YouTube URLs.

**Architecture:** Five sequential tasks — data migration first (no logic change), then video embed logic update, then lightbox CSS, then lightbox JS, then admin panel. Each task is independently committable. No new files; all changes land in existing files.

**Tech Stack:** Vanilla JS, CSS, HTML — no build step, no dependencies.

---

## Files to Modify

| File | What changes |
|------|-------------|
| `js/projects-data.js` | Rename `vimeoId` → `videoUrl` on all entries; set `llamalo` YouTube URL; update comment template |
| `data/projects.json` | Rename `vimeoId` → `videoUrl` on all entries; set `llamalo` YouTube URL |
| `js/project.js` | Replace Vimeo-only embed with `videoUrl` detection logic; add lightbox DOM creation and event handlers |
| `css/style.css` | Add lightbox styles at the end of the file |
| `admin/index.html` | Rename "Vimeo ID" field to "Video URL"; update label, placeholder, field ID, and FormData key |
| `api/publish.js` | Read `videoUrl` from form data instead of `vimeoId`; write `videoUrl` to `data/projects.json` |

---

## Task 1: Migrate `vimeoId` → `videoUrl` in projects-data.js

**Files:**
- Modify: `js/projects-data.js`

- [ ] **Step 1: Rename every `vimeoId:` key to `videoUrl:`**

  Do a global find-and-replace of `vimeoId:` → `videoUrl:` across the file. Every entry gets this rename.

- [ ] **Step 2: Set llamalo's YouTube URL**

  Find the `'llamalo'` entry. Change:
  ```js
  videoUrl:       '',
  ```
  To:
  ```js
  videoUrl:       'https://youtu.be/HNaItEaCx0k?si=X8dXHbjPQbZugxxf',
  ```

- [ ] **Step 3: Update the comment template at the bottom**

  Find the template comment block near the bottom of the file. Change:
  ```js
  //   vimeoId:       '123456789',         // dejar '' si no hay video todavía
  ```
  To:
  ```js
  //   videoUrl:      '123456789',         // Vimeo ID, YouTube URL, o '' si no hay video
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add js/projects-data.js
  git commit -m "feat: rename vimeoId to videoUrl, add llamalo YouTube URL"
  ```

---

## Task 2: Update video embed logic in project.js

**Files:**
- Modify: `js/project.js`

- [ ] **Step 1: Replace the video embed block**

  Find and replace the entire `// ── Video embed ──` block (lines 45–56) with:

  ```js
  // ── Video embed ──
  const videoEl = document.getElementById('pd-video');
  const videoUrl = data.videoUrl;
  if (videoUrl) {
    let embedSrc;
    if (/youtu\.be\/|youtube\.com\/watch/.test(videoUrl)) {
      let ytId;
      if (videoUrl.includes('youtu.be/')) {
        ytId = videoUrl.split('youtu.be/')[1].split(/[?&]/)[0];
      } else {
        ytId = new URLSearchParams(videoUrl.split('?')[1]).get('v');
      }
      embedSrc = `https://www.youtube.com/embed/${ytId}?autoplay=0`;
    } else {
      embedSrc = `https://player.vimeo.com/video/${videoUrl}?autoplay=0&title=0&byline=0&portrait=0`;
    }
    videoEl.innerHTML = `
      <iframe
        src="${embedSrc}"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen>
      </iframe>`;
  } else {
    videoEl.style.display = 'none';
  }
  ```

- [ ] **Step 2: Verify Vimeo projects still work**

  Open `projects/project.html?id=violento` — the Vimeo iframe should load.

- [ ] **Step 3: Verify YouTube project works**

  Open `projects/project.html?id=llamalo` — a YouTube iframe should load (not a blank/broken video section).

- [ ] **Step 4: Verify no-video projects hide the section**

  Open `projects/project.html?id=la-biblioteca` — the video section should not be visible.

- [ ] **Step 5: Commit**

  ```bash
  git add js/project.js
  git commit -m "feat: support YouTube and Vimeo URLs via generic videoUrl field"
  ```

---

## Task 3: Add lightbox CSS

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Append lightbox styles to the end of style.css**

  Add after all existing rules:

  ```css
  /* ─── LIGHTBOX ─── */
  #lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #lightbox[hidden] {
    display: none;
  }

  .lightbox-img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    display: block;
  }

  .lightbox-close,
  .lightbox-prev,
  .lightbox-next {
    position: absolute;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 32px;
    cursor: pointer;
    padding: 16px;
    line-height: 1;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
  }

  .lightbox-close:hover,
  .lightbox-prev:hover,
  .lightbox-next:hover {
    color: #fff;
  }

  .lightbox-close {
    top: 16px;
    right: 16px;
    font-size: 28px;
  }

  .lightbox-prev {
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  .lightbox-next {
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add css/style.css
  git commit -m "feat: add lightbox styles"
  ```

---

## Task 4: Add lightbox JS in project.js

**Files:**
- Modify: `js/project.js`

- [ ] **Step 1: Append lightbox logic after the gallery block**

  The gallery block ends with `if (typeof initProgressiveImages === 'function') initProgressiveImages();` on the last line before the closing `});`.

  Insert the following **before** the closing `});` of the `DOMContentLoaded` handler:

  ```js
    // ── Lightbox ──
    (function () {
      const stills = data.stills;
      let currentIndex = 0;

      // Collect HQ src from each gallery image's data-hq attribute
      const galleryImgs = Array.from(document.querySelectorAll('#pd-gallery .gallery-item img'));
      const hqSrcs = galleryImgs.map(img => img.dataset.hq || img.src);

      const lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.setAttribute('hidden', '');
      lb.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&#x2715;</button>
        <button class="lightbox-prev" aria-label="Previous">&#x2039;</button>
        <button class="lightbox-next" aria-label="Next">&#x203A;</button>
        <img class="lightbox-img" src="" alt="" />
      `;
      document.body.appendChild(lb);

      const lbImg = lb.querySelector('.lightbox-img');
      const prevBtn = lb.querySelector('.lightbox-prev');
      const nextBtn = lb.querySelector('.lightbox-next');

      function show(index) {
        currentIndex = index;
        lbImg.src = hqSrcs[currentIndex];
        lbImg.alt = `${data.title} \u2014 still ${currentIndex + 1}`;
        prevBtn.style.display = hqSrcs.length > 1 ? '' : 'none';
        nextBtn.style.display = hqSrcs.length > 1 ? '' : 'none';
        lb.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }

      function close() {
        lb.setAttribute('hidden', '');
        document.body.style.overflow = '';
      }

      function prev() {
        show((currentIndex - 1 + hqSrcs.length) % hqSrcs.length);
      }

      function next() {
        show((currentIndex + 1) % hqSrcs.length);
      }

      galleryImgs.forEach((img, i) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => show(i));
      });

      lb.querySelector('.lightbox-close').addEventListener('click', close);
      prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
      nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

      lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

      document.addEventListener('keydown', (e) => {
        if (lb.hasAttribute('hidden')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      });
    })();
  ```

- [ ] **Step 2: Verify lightbox opens on click**

  Open any project detail page. Click a still image — the lightbox overlay should appear with the full image centered on a dark background.

- [ ] **Step 3: Verify prev/next navigation**

  With lightbox open, click ‹ and › (or press ArrowLeft/ArrowRight). The image should cycle through all stills in order, wrapping around.

- [ ] **Step 4: Verify close behaviors**

  - Click the × button → lightbox closes
  - Click the dark backdrop → lightbox closes
  - Press Escape → lightbox closes
  - In all cases, page scroll is restored (`body overflow` back to normal)

- [ ] **Step 5: Verify single-still project hides nav buttons**

  If any project has only 1 still, open its detail page, click the still — prev/next buttons should not be visible.

- [ ] **Step 6: Commit**

  ```bash
  git add js/project.js
  git commit -m "feat: add still lightbox on project detail page"
  ```

---

## Task 5: Update admin panel and API for videoUrl

**Files:**
- Modify: `admin/index.html`
- Modify: `api/publish.js`
- Modify: `data/projects.json`

- [ ] **Step 1: Update the form field in admin/index.html**

  Find the "Vimeo ID" form group (around line 234):
  ```html
  <div class="form-group full">
    <label class="form-label" for="f-vimeo">Vimeo ID</label>
    <input id="f-vimeo" class="form-input-inline" type="text" placeholder="e.g. 1087538165" />
  </div>
  ```
  Replace with:
  ```html
  <div class="form-group full">
    <label class="form-label" for="f-video">Video URL</label>
    <input id="f-video" class="form-input-inline" type="text" placeholder="Vimeo ID or YouTube URL" />
  </div>
  ```

- [ ] **Step 2: Update resetForm() in admin/index.html**

  Find the `resetForm` function. Change the field list from:
  ```js
  ['f-title','f-id','f-director','f-producer','f-dop','f-year','f-vimeo'].forEach(id => $(id).value = '');
  ```
  To:
  ```js
  ['f-title','f-id','f-director','f-producer','f-dop','f-year','f-video'].forEach(id => $(id).value = '');
  ```

- [ ] **Step 3: Update the publish FormData in admin/index.html**

  Find:
  ```js
  fd.append('vimeoId',       $('f-vimeo').value.trim());
  ```
  Replace with:
  ```js
  fd.append('videoUrl',      $('f-video').value.trim());
  ```

- [ ] **Step 4: Update api/publish.js to use videoUrl**

  Find the project object construction (around line 71):
  ```js
  vimeoId:       get('vimeoId'),
  ```
  Replace with:
  ```js
  videoUrl:      get('videoUrl'),
  ```

- [ ] **Step 5: Migrate data/projects.json**

  In `data/projects.json`, do a global rename of all `"vimeoId"` keys to `"videoUrl"`. Also find the `llamalo` entry and set its value:
  ```json
  "videoUrl": "https://youtu.be/HNaItEaCx0k?si=X8dXHbjPQbZugxxf"
  ```

- [ ] **Step 6: Verify admin form works end-to-end**

  Open the admin panel. Open the "Add Project" form. Confirm:
  - The field is labeled "Video URL" with placeholder "Vimeo ID or YouTube URL"
  - Entering a Vimeo ID or YouTube URL and publishing creates a project with `videoUrl` in `data/projects.json`

- [ ] **Step 7: Commit**

  ```bash
  git add admin/index.html api/publish.js data/projects.json
  git commit -m "feat: rename vimeoId to videoUrl in admin panel and API"
  ```
