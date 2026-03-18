# Design Spec: Still Lightbox & Generic Video URL

**Date:** 2026-03-18
**Status:** Approved

---

## Overview

Two independent features for the Ivan Julia portfolio:

1. **Still Lightbox** — click any still on the project detail page to view it full-size in an overlay
2. **Generic `videoUrl` field** — replace `vimeoId` with a single `videoUrl` field that supports both Vimeo IDs and YouTube URLs

---

## Feature 1: Still Lightbox

### Scope

Project detail page only (`projects/project.html` + `project.js`). Not on the homepage grid.

### DOM Structure

`project.js` dynamically creates and appends a single `#lightbox` element to `<body>` after building the gallery. No changes to `project.html`.

```html
<div id="lightbox" class="lightbox" hidden>
  <button class="lightbox-close" aria-label="Close">×</button>
  <button class="lightbox-prev" aria-label="Previous">‹</button>
  <button class="lightbox-next" aria-label="Next">›</button>
  <img class="lightbox-img" src="" alt="" />
</div>
```

### CSS (`style.css`)

- `#lightbox`: `position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center`
- `.lightbox-img`: `max-width: 90vw; max-height: 90vh; object-fit: contain`
- `.lightbox-close`: positioned top-right, large click target
- `.lightbox-prev` / `.lightbox-next`: positioned left/right center, hidden when only 1 still
- Lightbox hidden via `hidden` attribute; shown by removing it

### Behavior (`project.js`)

- After gallery HTML is built, attach a `click` handler to each `.gallery-item img`
- Track the current still index; the lightbox opens at the clicked index
- **Prev/next:** cycle through `data.stills` array (wraps around)
- **Close triggers:** click the backdrop (the `#lightbox` element itself, not the image), click ×, or press Escape
- **Keyboard:** `ArrowLeft` / `ArrowRight` navigate; `Escape` closes
- Prev/next buttons are hidden (`display: none`) when there is only 1 still
- Use `data-hq` attribute on gallery images to display the high-quality src in the lightbox

---

## Feature 2: Generic `videoUrl`

### Data Model (`projects-data.js`)

- Rename `vimeoId` → `videoUrl` on all project entries
- Existing Vimeo entries: keep as bare numeric string (e.g. `'1087538165'`)
- `llamalo`: set `videoUrl: 'https://youtu.be/HNaItEaCx0k?si=X8dXHbjPQbZugxxf'`
- Empty entries remain `videoUrl: ''`

### Detection Logic (`project.js`)

```
if videoUrl contains 'youtu.be/' or 'youtube.com/watch'
  → extract YouTube video ID
  → embed: https://www.youtube.com/embed/{id}?autoplay=0
else if videoUrl is non-empty string
  → treat as bare Vimeo ID
  → embed: https://player.vimeo.com/video/{videoUrl}?autoplay=0&title=0&byline=0&portrait=0
else
  → hide #pd-video element
```

**YouTube ID extraction:**
- `youtu.be/{id}` → split on `/`, take last segment, strip query params
- `youtube.com/watch?v={id}` → parse `v` query param

---

## Files Changed

| File | Change |
|------|--------|
| `css/style.css` | Add lightbox styles |
| `js/project.js` | Add lightbox logic + `videoUrl` detection |
| `js/projects-data.js` | Rename `vimeoId` → `videoUrl`, update `llamalo` |
| `projects/project.html` | No changes |
| `index.html` | No changes |
