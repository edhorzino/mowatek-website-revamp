(() => {
  'use strict';
  const form = document.getElementById('enquiryForm');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const getEndpoint = () => (form.dataset.endpoint || '').trim();
  const minMs = (Number(form.dataset.minSeconds) || 0) * 1000;
  const loadedAt = Date.now();
  const btn = $('submitBtn'), lbl = btn.querySelector('.lbl'), errBox = $('form-error'), errText = $('form-error-text'), ok = $('form-success');
  let busy = false;

  // Preselect service / intent from the URL (?service=slug&intent=quote)
  const q = new URLSearchParams(location.search);
  const svc = q.get('service'); if (svc && [...$('f-service').options].some((o) => o.value === svc)) $('f-service').value = svc;
  if (q.get('intent') === 'quote') { $('f-intent').value = 'quote'; $('form-title').textContent = 'Request a quote'; lbl.textContent = 'Request quote'; $('f-message').placeholder = 'Tell us about your site, what you need and your timeline.'; }

  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your full name.' : ''),
    email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : ''),
    phone: (v) => (v.trim() && !/^\+?[0-9][0-9\s().-]{6,19}$/.test(v.trim()) ? 'Please enter a valid phone number, or leave it blank.' : ''),
    service: (v) => (!v ? 'Please choose a service.' : ''),
    message: (v) => (v.trim().length < 10 ? 'Please tell us a little more (at least 10 characters).' : ''),
  };
  const fieldOf = (n) => form.elements[n];
  function setErr(n, msg) { const f = fieldOf(n), e = $('e-' + n); if (!e) return; e.textContent = msg; e.hidden = !msg; if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); }
  function validate(names = Object.keys(rules)) { let first = null; names.forEach((n) => { const m = rules[n](fieldOf(n).value); setErr(n, m); if (m && !first) first = fieldOf(n); }); return first; }
  Object.keys(rules).forEach((n) => { fieldOf(n).addEventListener('blur', () => { if (fieldOf(n).value || fieldOf(n).hasAttribute('aria-invalid')) validate([n]); }); fieldOf(n).addEventListener('input', () => { if (fieldOf(n).hasAttribute('aria-invalid')) validate([n]); }); });

  function showError(msg) { errText.textContent = msg; errBox.hidden = false; errBox.focus(); }
  function setBusy(b) { busy = b; btn.disabled = b; btn.setAttribute('aria-busy', String(b)); lbl.textContent = b ? 'Sending…' : (form.elements.intent.value === 'quote' ? 'Request quote' : 'Send enquiry'); }

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); if (busy) return; errBox.hidden = true;
    const bad = validate(); if (bad) { bad.focus(); return; }
    if (form.elements._gotcha.value) { showError('We could not process this submission.'); return; }          // honeypot: never reports success
    if (Date.now() - loadedAt < minMs) { showError('Please take a moment to review your message, then press send again.'); return; }
    const endpoint = getEndpoint();
    if (!endpoint) { showError('Online enquiries are not switched on for this website yet.'); return; }          // never fake success
    setBusy(true);
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: ctl.signal });
      let data = null; try { data = await res.json(); } catch (_) { /* non-JSON response */ }
      const success = res.ok && !(data && (data.ok === false || data.success === false || data.error || data.errors));
      if (!success) {
        const detail = data && Array.isArray(data.errors) && data.errors.length ? data.errors.map((x) => x.message).filter(Boolean).join(' ') : (data && (data.message || data.error)) || '';
        showError(detail ? String(detail) : `The service responded with an error (${res.status}). Please try again shortly.`);
      } else { form.hidden = true; $('form-title').hidden = true; ok.hidden = false; ok.focus(); form.reset(); }
    } catch (err) {
      showError(err.name === 'AbortError' ? 'The request timed out. Please check your connection and try again.' : 'We could not reach the server. Please check your connection and try again.');
    } finally { clearTimeout(timer); setBusy(false); }
  });
  $('again')?.addEventListener('click', () => { ok.hidden = true; form.hidden = false; $('form-title').hidden = false; fieldOf('name').focus(); });
})();
