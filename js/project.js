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
