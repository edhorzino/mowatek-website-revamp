#!/usr/bin/env node
// Dependency-free static site generator. Usage: node build.mjs  ->  writes ./dist
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { securityHeaders, legacyRedirects } from './src/hosting.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { photos, services, faqs, gallery, galleryFilters, company } from './src/content.mjs';
import { ctxFor, esc, icon, img, btn, quoteHref, sectionHead, page, serviceCard, faqList, ctaBand, partners, clients, testimonials, pageHero, processBand, orgJsonLd } from './src/templates.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const config = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/image-manifest.json'), 'utf8'));
const warnings = [];
const write = (p, c) => { const f = join(DIST, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, c); };

if (config.siteUrl && !/^https:\/\/[^/\s]+$/.test(config.siteUrl.replace(/\/$/, ''))) throw new Error('siteUrl must look like https://www.example.com');

rmSync(DIST, { recursive: true, force: true });
cpSync(join(ROOT, 'public'), DIST, { recursive: true });
write('assets/css/photos.css', Object.entries(photos).map(([k, v]) => `.ph-${k}{object-position:${v.pos}}`).join('\n') + '\n');

const pages = []; // [path, priority]
const emit = (path, html, prio = 0.7) => { write(path === '' ? 'index.html' : `${path}index.html`, html); pages.push([path, prio]); };
const largest = (id) => manifest[id].widths[manifest[id].widths.length - 1];

// ---------- HOME ----------
{
  const ctx = ctxFor(config, '');
  const slides = ['41', '91', '43', '29'];
  const hv = config.heroVideo;
  const media = hv.mp4 || hv.webm
    ? `<video class="hero-video" autoplay muted loop playsinline ${hv.poster ? `poster="${esc(hv.poster)}"` : ''}>${hv.webm ? `<source src="${esc(hv.webm)}" type="video/webm">` : ''}${hv.mp4 ? `<source src="${esc(hv.mp4)}" type="video/mp4">` : ''}</video>`
    : slides.map((id, i) => `<div class="slide s${i + 1}">${img(ctx, id, { alt: '', sizes: '(min-width:900px) 62vw, 100vw', loading: i ? 'lazy' : 'eager', priority: i === 0 })}</div>`).join('');
  const body = `
<section class="hero" id="home"><div class="hero-media" aria-hidden="true">${media}</div><div class="hero-shade" aria-hidden="true"></div>
<div class="container hero-inner"><div class="hero-copy">
<span class="eyebrow">Water &amp; wastewater engineering · Nigeria</span>
<h1>Water. Industry.<br><span>Treatment solutions.</span></h1>
<p>Mowatek Nigeria Limited delivers practical engineering and technical services across water treatment, wastewater/effluent treatment, procurement, maintenance, consulting and training.</p>
<div class="hero-actions">${btn('Request a quote', quoteHref(ctx), 'primary', 'up')}${btn('Explore our services', '#services', 'outline')}</div></div></div>
<svg class="hero-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path class="w1" d="M0 50c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0v40H0z"/><path class="w2" d="M0 62c120-26 240-26 360 0s240 26 360 0 240-26 360 0 240 26 360 0v28H0z"/></svg></section>
<div class="trust"><div class="container trust-grid">
${[['drop', 'Water and wastewater expertise'], ['factory', 'Industrial and site-based solutions'], ['shield', 'Safety-conscious technical delivery'], ['clipboard', 'Established in Nigeria in 1983']].map(([i, t]) => `<div class="trust-item">${icon(i, 'ico ico--lg')}<span>${t}</span></div>`).join('')}</div></div>

<section class="section" id="about"><div class="container split">
<div class="split-media reveal">${img(ctx, '91', { sizes: '(min-width:900px) 520px, 100vw' })}<div class="badge"><strong>1983</strong>Incorporated in Nigeria</div></div>
<div class="reveal"><span class="eyebrow">Who we are</span><h2>Engineering that works in the real world.</h2>
<p>Mowatek Nigeria Limited is an engineering, procurement, construction, operations, and maintenance (EPCOM) company specializing in water and wastewater treatment solutions. Incorporated in Nigeria in 1983 as a limited liability company.</p>
<p>Over the years, we have built a reputation for engineering excellence through strong partnerships with globally renowned OEMs and a track record of serving diverse industries.</p>
<ul class="ticks"><li>${icon('check')}Solutions shaped around client and site requirements</li><li>${icon('check')}Technical support across project delivery</li><li>${icon('check')}A commitment to communication, innovation and service</li></ul>
${btn('More about Mowatek', ctx.href('about/'), 'blue')}</div></div></section>

<section class="section section--paper" id="services"><div class="container">${sectionHead('What we do', 'Specialist services. Connected thinking.', 'From treatment systems to procurement and maintenance, we bring together technical knowledge and hands-on implementation support.')}
<div class="card-grid">${services.map((s) => serviceCard(ctx, s)).join('')}</div></div></section>

<section class="section section--navy"><div class="container band">
<div class="reveal"><span class="eyebrow">Our approach</span><h2>Dependable solutions start with understanding the problem.</h2><p>Every site has its own constraints. We focus on understanding the need, working with technical partners where appropriate, and helping clients find a fit-for-purpose way forward.</p>${btn('Start a conversation', quoteHref(ctx), 'primary')}</div>
<ol class="steps steps--compact">${[['Understand', 'Your site, constraints and goals.'], ['Define', 'A fit-for-purpose approach.'], ['Deliver', 'Equipment, installation and support.'], ['Support', 'Clear communication throughout.']].map(([t, d], i) => `<li class="reveal"><span class="step-n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol></div>
<div class="container"><dl class="facts reveal"><div><dt>1983</dt><dd>Incorporated in Nigeria</dd></div><div><dt>${services.length}</dt><dd>Service areas</dd></div><div><dt>4</dt><dd>Original disciplines: mechanical, electrical, civil and marine</dd></div></dl></div></section>

<section class="section" id="projects"><div class="container">${sectionHead('Selected work', 'A closer look at site activity.', 'Photographs from Mowatek project and site work.')}
<ul class="mosaic">${['41', '56', '82', '67', '16'].map((id, i) => `<li class="m${i + 1} reveal"><a href="${ctx.href('projects/')}" aria-label="View project gallery">${img(ctx, id, { sizes: i === 0 ? '(min-width:900px) 560px, 100vw' : '(min-width:900px) 300px, 50vw' })}</a></li>`).join('')}</ul>
<p class="center-cta">${btn('View the full gallery', ctx.href('projects/'), 'blue')}</p></div></section>

${testimonials(ctx)}
<section class="section section--paper" id="faq"><div class="container narrow">${sectionHead('FAQ', 'Common questions.', '', true)}${faqList(faqs.slice(0, 4))}<p class="center-cta">${btn('See all questions', ctx.href('faq/'), 'blue')}</p></div></section>
${ctaBand(ctx)}
${partners(ctx)}
${clients(ctx)}`;
  emit('', page(ctx, { title: 'Mowatek Nigeria Limited | Water & Wastewater Engineering', description: 'Mowatek Nigeria Limited provides water and wastewater/effluent treatment, procurement, maintenance, consulting and training in Nigeria.', path: '', jsonld: [orgJsonLd(ctx)] }, 'home', body), 1.0);
}

// ---------- SERVICES INDEX ----------
{
  const ctx = ctxFor(config, 'services/');
  const body = `${pageHero(ctx, { crumbs: [['Home', ctx.href('')], ['Services']], eyebrowText: 'What we do', title: 'Five service areas. One practical approach.', lead: 'From treatment systems to procurement and maintenance, we bring together technical knowledge and hands-on implementation support.', photo: '43', actions: btn('Request a quote', quoteHref(ctx), 'primary', 'up') })}
<section class="section"><div class="container"><div class="card-grid">${services.map((s) => serviceCard(ctx, s)).join('')}</div></div></section>${ctaBand(ctx)}`;
  emit('services/', page(ctx, { title: 'Services', description: 'Water treatment, wastewater/effluent treatment, procurement and maintenance, consulting and training from Mowatek Nigeria Limited.', path: 'services/' }, 'services', body), 0.9);
}

// ---------- SERVICE PAGES ----------
for (const s of services) {
  const ctx = ctxFor(config, `${s.slug}/`);
  const others = services.filter((o) => o.slug !== s.slug).slice(0, 3);
  const body = `${pageHero(ctx, { crumbs: [['Home', ctx.href('')], ['Services', ctx.href('services/')], [s.title]], eyebrowText: `${s.num} / ${s.tag}`, title: esc(s.title), lead: esc(s.lead), photo: s.hero, actions: btn('Request a quote', quoteHref(ctx, s.slug), 'primary', 'up') + btn('Ask a question', ctx.href('contact/?service=' + s.slug + '#enquiry'), 'ghost', '') })}
<section class="section"><div class="container split split--text"><div class="reveal"><span class="eyebrow">Overview</span><h2>${esc(s.title)} with Mowatek</h2>${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<aside class="panel reveal"><h3>${esc(s.appsTitle)}</h3><ul class="ticks ticks--tight">${s.apps.map((a) => `<li>${icon('check')}${esc(a)}</li>`).join('')}</ul></aside></div></section>
<section class="section section--paper"><div class="container">${sectionHead(s.coverTitle, 'What this includes', 'Scope is confirmed with you for each project.')}
<div class="cap-grid">${s.covers.map(([i, t, d]) => `<div class="cap reveal"><span class="cap-ico">${icon(i, 'ico ico--lg')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div></div></section>
<section class="section"><div class="container">${sectionHead('From site', 'Mowatek at work.')}<ul class="strip">${s.gallery.map((id) => `<li class="reveal">${img(ctx, id, { sizes: '(min-width:900px) 360px, 100vw' })}</li>`).join('')}</ul></div></section>
${processBand(ctx)}
<section class="section"><div class="container">${sectionHead('Related', 'Other services')}<div class="card-grid">${others.map((o) => serviceCard(ctx, o)).join('')}</div></div></section>
${ctaBand(ctx, { title: `Discuss your ${esc(s.title.toLowerCase())} requirements.`, slug: s.slug })}`;
  const svcLd = { '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.card, provider: { '@type': 'Organization', name: config.companyName }, areaServed: 'NG' };
  emit(`${s.slug}/`, page(ctx, { title: s.title, description: s.meta, path: `${s.slug}/`, jsonld: [svcLd] }, s.slug, body), 0.9);
}

// ---------- ABOUT ----------
{
  const ctx = ctxFor(config, 'about/'); const c = config.contact;
  const rows = [['Registered name', config.companyName], ['Incorporated', `${config.foundingYear}, Nigeria`], ['Company type', 'Limited liability company'], c.rcNumber && ['RC number', c.rcNumber], c.addressLines?.length && ['Address', c.addressLines.join(', ')]].filter(Boolean);
  if (!c.rcNumber) warnings.push('contact.rcNumber is empty: registration number not shown on About page.');
  const body = `${pageHero(ctx, { crumbs: [['Home', ctx.href('')], ['About']], eyebrowText: 'About Mowatek', title: 'Practical engineering. Dependable delivery.', lead: 'A Nigerian engineering company with a strong focus on water and wastewater treatment.', photo: '56', actions: btn('Request a quote', quoteHref(ctx), 'primary', 'up') })}
<section class="section"><div class="container split split--text"><div class="reveal"><span class="eyebrow">Our story</span><h2>Built on technical collaboration and long-term relationships.</h2>
<p>Mowatek Nigeria Limited is an engineering, procurement, construction, operations, and maintenance (EPCOM) company specializing in water and wastewater treatment solutions. Incorporated in Nigeria in 1983 as a limited liability company.</p>
<p>Over the years, we have built a reputation for engineering excellence through strong partnerships with globally renowned OEMs and a track record of serving diverse industries.</p>
<p>Our operations are structured into five key service areas, spanning water and wastewater treatment systems, consulting, equipment procurement, installation, operations and maintenance, and specialized technical training.</p></div>
<aside class="panel reveal"><h3>Company information</h3><dl class="info">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></aside></div></section>
<section class="section section--paper"><div class="container">${sectionHead('How we work', 'What clients can expect.')}<div class="cap-grid cap-grid--3">${company.values.map(([t, d]) => `<div class="cap reveal"><span class="cap-ico">${icon('check', 'ico ico--lg')}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
${processBand(ctx)}
<section class="section"><div class="container">${sectionHead('Services', 'Five areas of work.')}<div class="card-grid">${services.map((s) => serviceCard(ctx, s)).join('')}</div></div></section>
${testimonials(ctx)}${ctaBand(ctx)}`;
  emit('about/', page(ctx, { title: 'About Mowatek', description: 'Mowatek Nigeria Limited was incorporated in Nigeria in 1983 and focuses strongly on water and wastewater treatment, with dependable, collaborative engineering.', path: 'about/', jsonld: [orgJsonLd(ctx)] }, 'about', body), 0.8);
}

// ---------- PROJECTS ----------
{
  const ctx = ctxFor(config, 'projects/');
  const body = `${pageHero(ctx, { crumbs: [['Home', ctx.href('')], ['Projects']], eyebrowText: 'Project gallery', title: 'A closer look at site activity.', lead: 'Selected photographs from Mowatek project and site work.', photo: '45' })}
<section class="section"><div class="container">
<div class="filters" role="group" aria-label="Filter photographs">${galleryFilters.map(([k, l], i) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div>
<ul class="gallery" id="gallery">${gallery.map(([id, cat, cap]) => `<li data-cat="${cat}"><a class="g-item" href="${ctx.href(`assets/img/p${id}-${largest(id)}.webp`)}" data-caption="${esc(cap)}">${img(ctx, id, { alt: photos[id].alt, sizes: '(min-width:1000px) 280px, (min-width:600px) 33vw, 50vw' })}<span class="g-cap">${esc(cap)}</span></a></li>`).join('')}</ul>
<p class="muted small" id="gallery-count" aria-live="polite"></p></div></section>
<dialog class="lightbox" id="lightbox" aria-label="Image viewer"><figure><img alt="" width="1200" height="900" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><figcaption></figcaption></figure>
<button type="button" class="lb-btn lb-close" aria-label="Close viewer">${icon('x')}</button><button type="button" class="lb-btn lb-prev" aria-label="Previous photograph">${icon('left')}</button><button type="button" class="lb-btn lb-next" aria-label="Next photograph">${icon('right')}</button></dialog>
${ctaBand(ctx, { title: 'Have a similar requirement?' })}`;
  emit('projects/', page(ctx, { title: 'Project Gallery', description: 'Photographs from Mowatek water and wastewater engineering site work in Nigeria.', path: 'projects/' }, 'projects', body), 0.7);
}

// ---------- FAQ ----------
{
  const ctx = ctxFor(config, 'faq/');
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const body = `${pageHero(ctx, { crumbs: [['Home', ctx.href('')], ['FAQ']], eyebrowText: 'FAQ', title: 'Common questions.', lead: 'Quick answers about Mowatek and how to work with us. Can’t find what you need? Send us an enquiry.', photo: '84', actions: btn('Ask a question', ctx.href('contact/#enquiry'), 'primary', 'arrow') })}
<section class="section"><div class="container narrow">${faqList()}</div></section>${ctaBand(ctx)}`;
  emit('faq/', page(ctx, { title: 'FAQ', description: 'Answers to common questions about Mowatek Nigeria Limited, requesting a quote, and our water and wastewater services.', path: 'faq/', jsonld: [ld] }, 'faq', body), 0.6);
}

// ---------- CONTACT ----------
{
  const ctx = ctxFor(config, 'contact/'); const { contacts } = ctx; const c = config.contact;
  if (!config.form.endpoint) warnings.push('form.endpoint is empty: the enquiry form will show an error on submit until a delivery endpoint is configured.');
  for (const k of ['email', 'phone', 'whatsapp']) if (!c[k]) warnings.push(`contact.${k} is empty: related links and buttons are hidden.`);
  if (!c.addressLines?.length) warnings.push('contact.addressLines is empty: address hidden.');
  const direct = [
    ...contacts.phones.map(p => `<li>${icon('phone', 'ico ico--lg')}<div><strong>Call</strong><a href="${p.href}">${esc(p.label)}</a></div></li>`),
    contacts.whatsapp && `<li>${icon('chat', 'ico ico--lg')}<div><strong>WhatsApp</strong><a href="${contacts.whatsapp.href}" target="_blank" rel="noopener noreferrer">Start a chat<span class="sr"> (opens in a new tab)</span></a></div></li>`,
    contacts.email && `<li>${icon('mail', 'ico ico--lg')}<div><strong>Email</strong><a href="${contacts.email.href}">${esc(contacts.email.label)}</a></div></li>`,
    contacts.address && `<li>${icon('pin', 'ico ico--lg')}<div><strong>Address</strong><span>${contacts.address.map(esc).join('<br>')}</span></div></li>`,
    c.openingHours && `<li>${icon('clipboard', 'ico ico--lg')}<div><strong>Hours</strong><span>${esc(c.openingHours)}</span></div></li>`,
  ].filter(Boolean);
  const fallback = [contacts.phone && `call <a href="${contacts.phone.href}">${esc(contacts.phone.label)}</a>`, contacts.email && `email <a href="${contacts.email.href}">${esc(contacts.email.label)}</a>`, contacts.whatsapp && `<a href="${contacts.whatsapp.href}" target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>`].filter(Boolean);
  const opts = services.map((s) => `<option value="${s.slug}">${esc(s.title)}</option>`).join('');
  const hidden = Object.entries(config.form.hiddenFields || {}).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('');
  const body = `${pageHero(ctx, { crumbs: [['Home', ctx.href('')], ['Contact']], eyebrowText: 'Contact', title: 'Let’s talk about your project.', lead: 'Tell us what you need and the team will follow up to discuss your requirements.', photo: '92' })}
<section class="section"><div class="container contact-grid">
<div class="reveal"><span class="eyebrow">Get in touch</span><h2>How can we help?</h2>
${direct.length ? `<ul class="direct">${direct.join('')}</ul>` : '<p>Use the enquiry form and the team will get back to you.</p>'}
<div class="panel"><h3>Helpful to include</h3><ul class="ticks ticks--tight"><li>${icon('check')}Your location and the type of site</li><li>${icon('check')}The water or effluent involved and approximate volumes</li><li>${icon('check')}Existing equipment, timeline and any quality or regulatory targets</li></ul></div></div>
<div class="form-card reveal" id="enquiry"><h2 id="form-title">Send an enquiry</h2>
<form id="enquiryForm" method="post" action="${esc(config.form.endpoint)}" novalidate data-endpoint="${esc(config.form.endpoint)}" data-min-seconds="${Number(config.form.minSecondsBeforeSubmit) || 0}" data-contact-email="${esc(c.email)}" aria-labelledby="form-title">
<div class="hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>${hidden}
<input type="hidden" name="_startedAt" id="f-started-at" value="">
<input type="hidden" name="_subject" value="Website enquiry: Mowatek"><input type="hidden" name="intent" value="enquiry" id="f-intent">
<div class="row"><div class="field"><label for="f-name">Full name <span class="req" aria-hidden="true">*</span></label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120" aria-describedby="e-name"><p class="err" id="e-name" hidden></p></div>
<div class="field"><label for="f-org">Organisation</label><input id="f-org" name="organisation" type="text" autocomplete="organization" maxlength="160"></div></div>
<div class="row"><div class="field"><label for="f-email">Email <span class="req" aria-hidden="true">*</span></label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="160" aria-describedby="e-email"><p class="err" id="e-email" hidden></p></div>
<div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30" inputmode="tel" aria-describedby="e-phone"><p class="err" id="e-phone" hidden></p></div></div>
<div class="field"><label for="f-service">Service <span class="req" aria-hidden="true">*</span></label><select id="f-service" name="service" required aria-describedby="e-service"><option value="">Select a service</option>${opts}<option value="general">Not sure / general enquiry</option></select><p class="err" id="e-service" hidden></p></div>
<div class="field"><label for="f-message">Message <span class="req" aria-hidden="true">*</span></label><textarea id="f-message" name="message" rows="6" required minlength="10" maxlength="4000" aria-describedby="e-message"></textarea><p class="err" id="e-message" hidden></p></div>
<p class="small muted">We use your details only to respond to your enquiry. See our <a href="${ctx.href('privacy/')}">privacy notice</a>.</p>
<div id="form-error" class="notice notice--error" role="alert" tabindex="-1" hidden><strong>Your enquiry was not sent.</strong> <span id="form-error-text"></span>${fallback.length ? `<span id="form-fallback"> You can also ${fallback.join(', or ')}.</span>` : ''}</div>
<button class="btn btn--primary" type="submit" id="submitBtn"><span class="lbl">Send enquiry</span>${icon('arrow')}</button></form>
<div id="form-success" class="notice notice--ok" role="status" tabindex="-1" hidden><h3>Thank you. Your enquiry has been sent.</h3><p>The team will follow up to discuss your requirements.</p><p><button type="button" class="btn btn--ghost btn--sm" id="again">Send another enquiry</button></p></div></div>
</div></section>`;
  emit('contact/', page(ctx, { title: 'Contact & Request a Quote', description: 'Contact Mowatek Nigeria Limited or request a quote for water treatment, wastewater, environmental, consulting, training or equipment services.', path: 'contact/' }, 'contact', body, ['assets/js/contact.js']), 0.9);
}

// ---------- PRIVACY ----------
{
  const ctx = ctxFor(config, 'privacy/'); const em = ctx.contacts.email;
  const body = `<section class="page-hero page-hero--plain"><div class="container"><h1>Privacy notice</h1><p class="lead">How we handle information you send through this website.</p></div></section>
<section class="section"><div class="container narrow prose">
<h2>What we collect</h2><p>When you submit the enquiry form we receive the details you enter: your name, organisation, email address, phone number, selected service and message.</p>
<h2>How we use it</h2><p>We use these details to respond to your enquiry and to discuss your requirements. We do not use the form to send unrelated marketing.</p>
<h2>Form delivery</h2><p>Enquiries are securely submitted to our website and sent to our team using Resend, our email delivery provider. Our website hosting and email providers process information needed to operate this service.</p>
<h2>Keeping your information</h2><p>We keep enquiry information for as long as it is needed to respond, manage related project discussions and meet applicable record-keeping requirements. Contact us to ask about information relating to your enquiry.</p>
<h2>Cookies and analytics</h2><p>${config.analytics.scriptSrc ? 'This website uses a privacy-focused analytics script to understand how pages are used.' : 'This website does not set advertising cookies and does not currently use analytics.'}</p>
<h2>Your choices</h2><p>You can ask us to access, correct or delete the information you have sent us${em ? ` by emailing <a href="${em.href}">${esc(em.label)}</a>` : ' using the contact details on this website'}.</p>
<p class="muted small">For questions about this notice or your personal information, please contact our team using the email address above.</p></div></section>`;
  emit('privacy/', page(ctx, { title: 'Privacy notice', description: 'How Mowatek Nigeria Limited handles information submitted through this website.', path: 'privacy/' }, 'privacy', body), 0.2);
}

// ---------- 404 ----------
{
  const ctx = ctxFor(config, '', { rootAbsolute: true });
  const body = `<section class="page-hero page-hero--plain"><div class="container"><span class="eyebrow">Error 404</span><h1>That page can’t be found.</h1><p class="lead">The page may have moved. Try one of these instead.</p><div class="hero-actions">${btn('Go to homepage', '/', 'primary')}${btn('View services', '/services/', 'ghost', '')}${btn('Contact us', '/contact/', 'ghost', '')}</div></div></section>`;
  write('404.html', page(ctx, { title: 'Page not found', description: 'Page not found.', path: '404.html', noindex: true }, '', body));
}

// ---------- SEO / hosting files ----------
const base = config.siteUrl.replace(/\/$/, '');
if (base) {
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([p, pr]) => `<url><loc>${base}/${p}</loc><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);
} else warnings.push('siteUrl is empty: canonical tags, Open Graph URLs and sitemap.xml were skipped.');
write('robots.txt', `User-agent: *\nAllow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}`);

const sec = securityHeaders(config);
const legacy = legacyRedirects;
write('_headers', `/*\n${Object.entries(sec).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n/assets/*\n  Cache-Control: public, max-age=0, must-revalidate\n`);
write('_redirects', legacy.map(([a, b]) => `/${a} /${b} 301`).join('\n') + '\n');
write('.htaccess', `# Apache hosting (cPanel etc.). Ignored by other servers.\nErrorDocument 404 /404.html\nDirectoryIndex index.html\n<IfModule mod_headers.c>\n${Object.entries(sec).map(([k, v]) => `  Header always set ${k} "${v}"`).join('\n')}\n</IfModule>\n<IfModule mod_rewrite.c>\nRewriteEngine On\n${legacy.map(([a, b]) => `${a.endsWith('.html') ? "RewriteCond %{THE_REQUEST} \\s/+\\S*\\.html(?:[?\\s]) [NC]\n" : ''}RewriteRule ^${a.replaceAll('.', '\\.').replace(/\/$/, '/?')}$ /${b} [R=301,L]`).join('\n')}\n</IfModule>\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml\n</IfModule>\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType image/webp "access plus 1 year"\n  ExpiresByType image/png "access plus 1 year"\n  ExpiresByType font/woff2 "access plus 1 year"\n  ExpiresByType text/css "access plus 1 month"\n  ExpiresByType application/javascript "access plus 1 month"\n</IfModule>\n`);

console.log(`Built ${pages.length} pages + 404 to dist/`);
if (warnings.length) console.log('\nConfig notes (see LAUNCH-CHECKLIST.md):\n' + warnings.map((w) => ' - ' + w).join('\n'));
