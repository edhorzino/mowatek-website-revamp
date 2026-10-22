(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile menu
  const btn = $('#menuBtn'), nav = $('#siteNav');
  const setMenu = (open) => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  if (btn && nav) {
    btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); closeSubs(); } });
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => { if (!nav.contains(e.target) && !btn.contains(e.target)) { setMenu(false); } if (!e.target.closest('.has-sub')) closeSubs(); });
  }
  // Services submenu toggle
  function closeSubs() { $$('.sub-toggle').forEach((t) => t.setAttribute('aria-expanded', 'false')); }
  $$('.sub-toggle').forEach((t) => t.addEventListener('click', () => { const o = t.getAttribute('aria-expanded') === 'true'; closeSubs(); t.setAttribute('aria-expanded', String(!o)); }));

  // Scroll reveal (content stays visible without JS / reduced motion)
  const items = $$('.reveal');
  if ('IntersectionObserver' in window && items.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  // Gallery filter + lightbox
  const gal = $('#gallery');
  if (gal) {
    const lis = $$('li', gal), chips = $$('.chip'), count = $('#gallery-count');
    const apply = (k) => { let n = 0; lis.forEach((li) => { const show = k === 'all' || li.dataset.cat === k; li.hidden = !show; if (show) n++; }); chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === k))); if (count) count.textContent = `Showing ${n} photograph${n === 1 ? '' : 's'}`; };
    chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter)));
    const lb = $('#lightbox');
    if (lb && typeof lb.showModal === 'function') {
      const im = $('img', lb), cap = $('figcaption', lb); let idx = 0, opener = null;
      const vis = () => $$('.g-item', gal).filter((a) => !a.closest('li').hidden);
      const show = (i) => { const l = vis(); if (!l.length) return; idx = (i + l.length) % l.length; const a = l[idx]; im.src = a.href; im.alt = $('img', a).alt; cap.textContent = a.dataset.caption || ''; };
      gal.addEventListener('click', (e) => { const a = e.target.closest('.g-item'); if (!a) return; e.preventDefault(); opener = a; show(vis().indexOf(a)); lb.showModal(); });
      $('.lb-close', lb).addEventListener('click', () => lb.close());
      $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
      $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
      lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
      lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
      lb.addEventListener('close', () => { if (opener) opener.focus(); });
    }
    apply('all');
  }
})();
