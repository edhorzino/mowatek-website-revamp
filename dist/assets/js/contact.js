
(() => {
  'use strict';

  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const getEndpoint = () => (form.dataset.endpoint || '').trim();
  const minMs = (Number(form.dataset.minSeconds) || 0) * 1000;
  const loadedAt = Date.now();

  const btn = $('submitBtn');
  const lbl = btn.querySelector('.lbl');
  const errBox = $('form-error');
  const errText = $('form-error-text');
  const ok = $('form-success');

  let busy = false;

  // Email fallback for failed online submissions.
  const contactEmail = 'info@mowatek.com';

  // Preselect service / intent from the URL.
  const q = new URLSearchParams(location.search);
  const svc = q.get('service');

  if (
    svc &&
    [...$('f-service').options].some((o) => o.value === svc)
  ) {
    $('f-service').value = svc;
  }

  if (q.get('intent') === 'quote') {
    $('f-intent').value = 'quote';
    $('form-title').textContent = 'Request a quote';
    lbl.textContent = 'Request quote';
    $('f-message').placeholder =
      'Tell us about your site, what you need and your timeline.';
  }

  const rules = {
    name: (v) =>
      v.trim().length < 2
        ? 'Please enter your full name.'
        : '',

    email: (v) =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? 'Please enter a valid email address.'
        : '',

    phone: (v) =>
      v.trim() && !/^\+?[0-9][0-9\s().-]{6,19}$/.test(v.trim())
        ? 'Please enter a valid phone number, or leave it blank.'
        : '',

    service: (v) =>
      !v ? 'Please choose a service.' : '',

    message: (v) =>
      v.trim().length < 10
        ? 'Please tell us a little more (at least 10 characters).'
        : '',
  };

  const fieldOf = (name) => form.elements[name];

  function setErr(name, message) {
    const field = fieldOf(name);
    const error = $('e-' + name);

    if (!error) return;

    error.textContent = message;
    error.hidden = !message;

    if (message) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
  }

  function validate(names = Object.keys(rules)) {
    let first = null;

    names.forEach((name) => {
      const message = rules[name](fieldOf(name).value);
      setErr(name, message);

      if (message && !first) {
        first = fieldOf(name);
      }
    });

    return first;
  }

  Object.keys(rules).forEach((name) => {
    fieldOf(name).addEventListener('blur', () => {
      if (
        fieldOf(name).value ||
        fieldOf(name).hasAttribute('aria-invalid')
      ) {
        validate([name]);
      }
    });

    fieldOf(name).addEventListener('input', () => {
      if (fieldOf(name).hasAttribute('aria-invalid')) {
        validate([name]);
      }
    });
  });

  // Show a polished fallback with a copyable email address.
  function showContactFallback() {
    errBox.replaceChildren();

    const heading = document.createElement('strong');
    heading.textContent =
      "We're having trouble receiving your enquiry";

    const message = document.createElement('p');
    message.textContent =
      "We're sorry, but your request could not be submitted online at this time. Please email our team directly, and we'll be happy to assist you with your enquiry or quote.";

    const emailLabel = document.createElement('p');
    emailLabel.textContent = 'Email Mowatek:';

    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${contactEmail}`;
    emailLink.textContent = contactEmail;

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy email address';

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(contactEmail);
        copyButton.textContent = 'Email address copied!';
      } catch (_) {
        // Fallback for browsers that block clipboard access.
        const temporaryInput = document.createElement('input');
        temporaryInput.value = contactEmail;
        temporaryInput.readOnly = true;
        temporaryInput.style.position = 'absolute';
        temporaryInput.style.left = '-9999px';

        document.body.appendChild(temporaryInput);
        temporaryInput.select();

        let copied = false;

        try {
          copied = document.execCommand('copy');
        } catch (_) {
          copied = false;
        }

        temporaryInput.remove();

        copyButton.textContent = copied
          ? 'Email address copied!'
          : 'Please copy the email address above';
      }
    });

    const note = document.createElement('p');
    note.textContent =
      'Your enquiry has not been submitted. Please contact us by email instead.';

    errBox.append(heading, message, emailLabel, emailLink, copyButton, note);
    errBox.hidden = false;
    errBox.focus();
  }

  function showError(message) {
    errText.textContent = message;
    errBox.hidden = false;
    errBox.focus();
  }

  function setBusy(isBusy) {
    busy = isBusy;
    btn.disabled = isBusy;
    btn.setAttribute('aria-busy', String(isBusy));

    lbl.textContent = isBusy
      ? 'Sending…'
      : form.elements.intent.value === 'quote'
        ? 'Request quote'
        : 'Send enquiry';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (busy) return;

    errBox.hidden = true;

    const invalidField = validate();

    if (invalidField) {
      invalidField.focus();
      return;
    }

    if (form.elements._gotcha.value) {
      showError('We could not process this submission.');
      return;
    }

    if (Date.now() - loadedAt < minMs) {
      showError(
        'Please take a moment to review your message, then press send again.'
      );
      return;
    }

    const endpoint = getEndpoint();

    if (!endpoint) {
      showContactFallback();
      return;
    }

    setBusy(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      let data = null;

      try {
        data = await response.json();
      } catch (_) {
        // The server did not return JSON.
      }

      const success =
        response.ok &&
        !(
          data &&
          (
            data.ok === false ||
            data.success === false ||
            data.error ||
            data.errors
          )
        );

      if (!success) {
        showContactFallback();
      } else {
        form.hidden = true;
        $('form-title').hidden = true;
        ok.hidden = false;
        ok.focus();
        form.reset();
      }
    } catch (_) {
      // Includes network errors and request timeouts.
      showContactFallback();
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  });

  $('again')?.addEventListener('click', () => {
    ok.hidden = true;
    form.hidden = false;
    $('form-title').hidden = false;
    fieldOf('name').focus();
  });
})();
