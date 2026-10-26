(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile menu
  const btn = $('#menuBtn'), nav = $('#siteNav');
  const setMenu = (open) => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  if (btn && nav) {
    btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const wasOpen = nav.classList.contains('open'); setMenu(false); closeSubs(); if (wasOpen) btn.focus(); } });
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => { if (!nav.contains(e.target) && !btn.contains(e.target)) { setMenu(false); } if (!e.target.closest('.has-sub')) closeSubs(); });
  }
  // Services submenu toggle
  function closeSubs() { $$('.sub-toggle').forEach((t) => t.setAttribute('aria-expanded', 'false')); }
  $$('.sub-toggle').forEach((t) => t.addEventListener('click', () => { const o = t.getAttribute('aria-expanded') === 'true'; closeSubs(); t.setAttribute('aria-expanded', String(!o)); }));

  // Client logos: the native scroll list works without JavaScript.
  const track = $('#client-track');
  if (track) {
    const section = track.closest('.clients'), pause = $('[data-client-pause]', section);
    $('.client-controls', section).hidden = false;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches, hovering = false, direction = 1, previous = 0, lastManual = 0;
    const updatePause = () => { pause.setAttribute('aria-pressed', String(paused)); pause.textContent = paused ? 'Start movement' : 'Pause movement'; };
    updatePause();
    pause.addEventListener('click', () => { paused = !paused; updatePause(); });
    motion.addEventListener('change', () => { if (motion.matches) { paused = true; updatePause(); } });
    section.addEventListener('mouseenter', () => { hovering = true; });
    section.addEventListener('mouseleave', () => { hovering = false; });
    const move = (step) => { lastManual = performance.now(); const max = track.scrollWidth - track.clientWidth; let left = track.scrollLeft + step * track.clientWidth * .8; if (left < 0) left = max; if (left > max) left = 0; track.scrollTo({ left, behavior: motion.matches ? 'instant' : 'smooth' }); };
    $('[data-client-prev]', section).addEventListener('click', () => move(-1));
    $('[data-client-next]', section).addEventListener('click', () => move(1));
    track.addEventListener('pointerdown', () => { lastManual = performance.now(); });
    track.addEventListener('wheel', () => { lastManual = performance.now(); }, { passive: true });
    track.addEventListener('keydown', () => { lastManual = performance.now(); });
    const animate = (time) => {
      const dt = previous ? Math.min(time - previous, 50) : 0; previous = time;
      if (!paused && !hovering && !section.contains(document.activeElement) && !document.hidden && time - lastManual > 4000) {
        const max = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= max - 1) direction = -1;
        else if (track.scrollLeft <= 1) direction = 1;
        track.scrollLeft += direction * dt * .035;
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

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
