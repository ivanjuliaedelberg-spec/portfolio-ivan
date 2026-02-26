/* ─────────────────────────────────────────
   Ivan Julia Portfolio — main.js
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Year in footer ───
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── Populate overlay details from PROJECTS data ───
  if (typeof PROJECTS !== 'undefined') {
    document.querySelectorAll('.project').forEach(article => {
      const link = article.querySelector('.project-link');
      if (!link) return;
      const href = link.getAttribute('href');
      const id = new URLSearchParams(href.split('?')[1]).get('id');
      const data = PROJECTS[id];
      if (!data) return;
      const detailsEl = article.querySelector('.project-details');
      if (!detailsEl) return;
      const parts = [];
      if (data.director) parts.push(`Dir. ${data.director}`);
      if (data.producer) parts.push(`Prod. ${data.producer}`);
      detailsEl.textContent = parts.join(' | ');
    });
  }

  // ─── Mobile burger menu ───
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Category filter ───
  const navItems = document.querySelectorAll('.nav-item[data-filter]');
  const projects = document.querySelectorAll('.project[data-category]');

  if (navItems.length && projects.length) {
    let activeFilter = 'all';

    const applyFilter = (filter) => {
      activeFilter = filter;
      projects.forEach(project => {
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

    // Logo click — clear filter and deselect all nav items
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        applyFilter('all');
        navItems.forEach(item => item.classList.remove('active'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Set initial filter from URL hash (e.g. #music-videos)
    const hashFilter = window.location.hash.replace('#', '');
    if (hashFilter) applyFilter(hashFilter);
  }

});
