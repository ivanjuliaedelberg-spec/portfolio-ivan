/* ─────────────────────────────────────────
   project.js — renderiza project.html con
   los datos de projects-data.js según ?id=
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  const id = new URLSearchParams(window.location.search).get('id');
  const data = PROJECTS[id];

  if (!data) {
    document.title = 'Proyecto no encontrado — Ivan Julia';
    document.querySelector('.project-detail').innerHTML =
      '<p style="padding:40px;color:#888">Proyecto no encontrado.</p>';
    return;
  }

  // ── Título de la pestaña ──
  document.title = `${data.title} — Ivan Julia`;

  // ── Categoría y título ──
  document.getElementById('pd-category').textContent = data.categoryLabel;
  document.getElementById('pd-title').textContent = data.title;

  // ── Meta (director, productora, dop, año) ──
  const metaFields = [
    { label: 'Director',              value: data.director },
    { label: 'Producción',            value: data.producer },
    { label: 'DOP',                   value: data.dop },
    { label: 'Año',                   value: data.year },
    { label: 'Sec. Unit Director',    value: data.secdirector },
    { label: 'Sec. Unit DOP',         value: data.secdop },
  ].filter(f => f.value);

  const metaEl = document.getElementById('pd-meta');
  metaFields.forEach(({ label, value }) => {
    metaEl.insertAdjacentHTML('beforeend', `
      <div class="meta-item">
        <strong>${label}</strong>
        ${value}
      </div>
    `);
  });

  // ── Video embed ──
  const videoEl = document.getElementById('pd-video');
  if (data.vimeoId) {
    videoEl.innerHTML = `
      <iframe
        src="https://player.vimeo.com/video/${data.vimeoId}?autoplay=0&title=0&byline=0&portrait=0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen>
      </iframe>`;
  } else {
    videoEl.style.display = 'none';
  }

  // ── Gallery de stills ──
  const galleryEl = document.getElementById('pd-gallery');
  data.stills.forEach((src, i) => {
    galleryEl.insertAdjacentHTML('beforeend', `
      <div class="gallery-item">
        <img src="${src}" alt="${data.title} — still ${i + 1}" />
      </div>
    `);
  });

});
