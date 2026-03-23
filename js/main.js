/* ─────────────────────────────────────────
   Ivan Julia Portfolio — main.js
   ───────────────────────────────────────── */

// ─── HTML escape helper (prevents XSS from projects.json values) ───
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ─── HQ image cache — persists across navigations within the session ───
let _hqLoaded;
function getHqCache() {
  if (!_hqLoaded) {
    try { _hqLoaded = new Set(JSON.parse(sessionStorage.getItem('hq-loaded') || '[]')); }
    catch (e) { _hqLoaded = new Set(); }
  }
  return _hqLoaded;
}
function markHqLoaded(src) {
  const cache = getHqCache();
  cache.add(src);
  try { sessionStorage.setItem('hq-loaded', JSON.stringify([...cache])); } catch (e) {}
}

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
        markHqLoaded(hq.src);
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
            ${p.stills.map((src, i) => {
              const cached = getHqCache().has(src);
              return `
              <div class="still">
                <img class="${cached ? 'hq-ready' : 'lq'}"
                     loading="${i === 0 ? 'eager' : 'lazy'}"
                     src="${esc(cached ? src : src.replace('.webp', '-lq.webp'))}"
                     data-hq="${esc(src)}"
                     alt="${esc(p.title)} — still ${i + 1}" />
              </div>`;}).join('')}
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
  if (!document.querySelector('.projects-section')) return;

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
