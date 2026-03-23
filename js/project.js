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
      if (ytId) embedSrc = `https://www.youtube.com/embed/${ytId}?autoplay=0`;
    } else {
      embedSrc = `https://player.vimeo.com/video/${videoUrl}?autoplay=0&title=0&byline=0&portrait=0`;
    }
    if (embedSrc) {
      videoEl.innerHTML = `
        <iframe
          src="${esc(embedSrc)}"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen>
        </iframe>`;
    } else {
      videoEl.style.display = 'none';
    }
  } else {
    videoEl.style.display = 'none';
  }

  const galleryEl = document.getElementById('pd-gallery');
  data.stills.forEach((src, i) => {
    const lqSrc = src.replace('.webp', '-lq.webp');
    const cached = typeof getHqCache === 'function' && getHqCache().has(src);
    galleryEl.insertAdjacentHTML('beforeend', `
      <div class="gallery-item">
        <img class="${cached ? 'hq-ready' : 'lq'}" loading="lazy"
             src="${esc(cached ? src : lqSrc)}" data-hq="${esc(src)}"
             alt="${esc(data.title)} — still ${i + 1}" />
      </div>`);
  });

  if (typeof initProgressiveImages === 'function') initProgressiveImages();

  // ── Lightbox ──
  (function () {
    // Collect HQ src from each gallery image's data-hq attribute
    const galleryImgs = Array.from(document.querySelectorAll('#pd-gallery .gallery-item img'));
    const hqSrcs = galleryImgs.map(img => img.dataset.hq || img.src);

    let currentIndex = 0;

    const lb = document.createElement('div');
    lb.id = 'lightbox';
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
});
