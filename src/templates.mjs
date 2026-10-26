import { readFileSync, existsSync } from 'node:fs';
import { photos, services, faqs, process as steps } from './content.mjs';

const manifest = JSON.parse(readFileSync(new URL('./image-manifest.json', import.meta.url)));
export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const digits = (s = '') => String(s).replace(/[^\d]/g, '');

// ---------- context ----------
export function ctxFor(config, path, extra = {}) {
  const depth = path === '' ? 0 : path.split('/').filter(Boolean).length;
  const up = depth === 0 ? './' : '../'.repeat(depth);
  const rootAbs = !!extra.rootAbsolute; // used by 404.html which can be served from any path
  const href = (to = '') => (rootAbs ? '/' + to : up + to);
  const c = config.contact;
  const contacts = {
    email: c.email ? { label: c.email, href: `mailto:${c.email}` } : null,
    phone: c.phone ? { label: c.phone, href: `tel:+${digits(c.phone)}` } : null,
    whatsapp: c.whatsapp ? { label: 'WhatsApp', href: `https://wa.me/${digits(c.whatsapp)}?text=${encodeURIComponent(c.whatsappMessage || '')}` } : null,
    address: c.addressLines?.length ? c.addressLines : null,
  };
  return { config, path, depth, href, contacts, rootAbs, ...extra };
}

// ---------- primitives ----------
export const icon = (id, cls = 'ico') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;

export function img(ctx, id, { sizes = '100vw', cls = '', alt, loading = 'lazy', priority = false } = {}) {
  const m = manifest[id], ph = photos[id];
  if (!m) throw new Error(`Unknown photo ${id}`);
  const last = m.widths[m.widths.length - 1];
  const srcset = m.widths.map((w) => `${ctx.href(`assets/img/p${id}-${w}.webp`)} ${w}w`).join(', ');
  const a = alt === undefined ? ph.alt : alt;
  return `<img class="ph ph-${id} ${cls}" src="${ctx.href(`assets/img/p${id}-${m.widths.includes(800) ? 800 : last}.webp`)}" srcset="${srcset}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(a)}" ${priority ? 'fetchpriority="high" decoding="async"' : `loading="${loading}" decoding="async"`}>`;
}

export const btn = (label, href, kind = 'primary', ic = 'arrow') =>
  `<a class="btn btn--${kind}" href="${href}">${esc(label)}${ic ? icon(ic) : ''}</a>`;
export const quoteHref = (ctx, slug = '') => ctx.href(`contact/?intent=quote${slug ? `&service=${slug}` : ''}#enquiry`);
const eyebrow = (t, cls = '') => `<span class="eyebrow ${cls}">${esc(t)}</span>`;
export const sectionHead = (eb, title, lead = '', center = false) =>
  `<div class="section-head reveal${center ? ' center' : ''}">${eyebrow(eb)}<h2>${title}</h2>${lead ? `<p>${lead}</p>` : ''}</div>`;

// ---------- sprite ----------
const P = {
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  flask: '<path d="M10 2v7.5a2 2 0 0 1-.2.9L4.7 20.5a1 1 0 0 0 .9 1.5h12.8a1 1 0 0 0 .9-1.5l-5.1-10.1a2 2 0 0 1-.2-.9V2M8.5 2h7M7 16h10"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.500 20.500 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.500-1.200 6.200-2.700a1.200 1.200 0 0 1 1.500 0C14.500 3.800 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.600 1.600a1 1 0 0 0 1.400 0l3.800-3.800a6 6 0 0 1-7.900 7.900l-6.900 6.900a2.100 2.100 0 0 1-3-3l6.900-6.900a6 6 0 0 1 7.900-7.900z"/>',
  factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
  trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>',
  recycle: '<path d="M7 19H4.800a1.800 1.800 0 0 1-1.600-2.700L5 13.500M11 19h6.200a1.800 1.800 0 0 0 1.600-2.700L17 13.500M14 16l-3 3 3 3M8.500 8.500 5.700 4.700a1.800 1.800 0 0 1 3.100-.2L10 6.500M10.500 5.500l3.500-.5a1.800 1.800 0 0 1 1.700 1l1.300 2.500M17.700 6 20 9.500l-3.500.5"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  cap: '<path d="M21.400 10.900a1 1 0 0 0 0-1.800L12.800 5.200a2 2 0 0 0-1.600 0L2.600 9.100a1 1 0 0 0 0 1.800l8.600 3.900a2 2 0 0 0 1.600 0z"/><path d="M22 10v6M6 12.500V16a6 3 0 0 0 12 0v-3.500"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.700a1 1 0 0 0-.2-.6l-3.500-4.400A1 1 0 0 0 17.500 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  up: '<path d="M7 7h10v10M7 17 17 7"/>',
  phone: '<path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.5c.9.3 1.800.6 2.800.7a2 2 0 0 1 1.700 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.970 5.700a1.940 1.940 0 0 1-2.060 0L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  chat: '<path d="M21 11.500a8.400 8.400 0 0 1-12.400 7.300L3 20.500l1.800-5.300A8.400 8.400 0 1 1 21 11.500z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M6.300 17.700l-1.400 1.400M19.100 4.900l-1.400 1.400"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.300-4.300"/>',
  layers: '<path d="m12.800 2.200a2 2 0 0 0-1.600 0L2.600 6.100a1 1 0 0 0 0 1.800l8.600 3.900a2 2 0 0 0 1.600 0l8.600-3.900a1 1 0 0 0 0-1.800z"/><path d="m22 17.700-9.200 4.200a2 2 0 0 1-1.600 0L2 17.700M22 12.700l-9.200 4.200a2 2 0 0 1-1.600 0L2 12.700"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16M7 16V9M12 16V5M17 16v-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.900M16 3.100a4 4 0 0 1 0 7.800"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.1a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.1a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.1a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.1a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>',
  wave: '<path d="M2 6c.6.5 1.200 1 2.500 1C7 7 7 5 9.500 5c2.600 0 2.400 2 5 2 2.500 0 2.500-2 5-2 1.300 0 1.900.5 2.500 1M2 12c.6.5 1.200 1 2.500 1 2.500 0 2.500-2 5-2 2.600 0 2.400 2 5 2 2.500 0 2.500-2 5-2 1.300 0 1.900.5 2.500 1M2 18c.6.5 1.200 1 2.500 1 2.500 0 2.500-2 5-2 2.600 0 2.400 2 5 2 2.500 0 2.500-2 5-2 1.300 0 1.900.5 2.500 1"/>',
};
export const sprite = () => `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>${Object.entries(P).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('')}</defs></svg>`;

// ---------- head / header / footer ----------
const nav = (ctx) => [['about/', 'About'], ['projects/', 'Projects'], ['faq/', 'FAQ'], ['contact/', 'Contact']];

export function head(ctx, { title, description, path = ctx.path, ogImage = 'assets/img/og-image.jpg', noindex = false, jsonld = [], extraJs = [] }) {
  const { config } = ctx;
  const abs = (p) => (config.siteUrl ? config.siteUrl.replace(/\/$/, '') + '/' + p : null);
  const canonical = abs(path);
  const og = abs(ogImage);
  const full = title.includes('Mowatek') ? title : `${title} | Mowatek Nigeria Limited`;
  return `<!doctype html>
<html lang="en-NG">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0e2f5e">
${noindex ? '<meta name="robots" content="noindex">' : ''}${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(config.companyName)}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}">${canonical ? `<meta property="og:url" content="${canonical}">` : ''}${og ? `<meta property="og:image" content="${og}"><meta name="twitter:card" content="summary_large_image">` : ''}
<link rel="icon" href="${ctx.href('favicon.ico')}" sizes="48x48"><link rel="icon" type="image/png" href="${ctx.href('assets/img/mark-192.png')}" sizes="192x192"><link rel="apple-touch-icon" href="${ctx.href('assets/img/mark-180.png')}">
<link rel="preload" href="${ctx.href('assets/fonts/manrope-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${ctx.href('assets/fonts/dm-sans-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ctx.href('assets/css/site.css')}"><link rel="stylesheet" href="${ctx.href('assets/css/photos.css')}">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>`;
}

export function header(ctx, active = '') {
  const sub = services.map((s) => `<li><a href="${ctx.href(s.slug + '/')}"${active === s.slug ? ' aria-current="page"' : ''}>${esc(s.nav)}</a></li>`).join('');
  const links = nav(ctx).map(([p, l]) => `<li><a href="${ctx.href(p)}"${active === p.replace('/', '') ? ' aria-current="page"' : ''}>${l}</a></li>`);
  return `<a class="skip" href="#main">Skip to content</a>
<header class="header" id="top"><div class="container nav">
<a class="brand" href="${ctx.href('')}" aria-label="${esc(ctx.config.companyName)}: home"><img src="${ctx.href('assets/img/logo-360.webp')}" srcset="${ctx.href('assets/img/logo-360.webp')} 360w, ${ctx.href('assets/img/logo-720.webp')} 720w" sizes="190px" width="360" height="131" alt="${esc(ctx.config.companyName)}: ${esc(ctx.config.tagline)}"></a>
<button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="siteNav" aria-label="Open menu">${icon('menu', 'ico ico--open')}${icon('x', 'ico ico--close')}</button>
<nav class="site-nav" id="siteNav" aria-label="Main"><ul>
<li><a href="${ctx.href('')}"${active === 'home' ? ' aria-current="page"' : ''}>Home</a></li>
${links[0]}
<li class="has-sub"><a href="${ctx.href('services/')}"${active === 'services' ? ' aria-current="page"' : ''}>Services</a><button class="sub-toggle" aria-expanded="false" aria-controls="subServices" aria-label="Show services menu">${icon('down')}</button><ul class="sub" id="subServices">${sub}</ul></li>
${links.slice(1).join('\n')}
<li class="nav-cta"><a class="btn btn--primary btn--sm" href="${quoteHref(ctx)}">Request a quote</a></li>
</ul></nav></div></header>`;
}

export function footer(ctx) {
  const { config, contacts } = ctx;
  const items = [
    contacts.phone && `<li>${icon('phone')}<a href="${contacts.phone.href}">${esc(contacts.phone.label)}</a></li>`,
    contacts.email && `<li>${icon('mail')}<a href="${contacts.email.href}">${esc(contacts.email.label)}</a></li>`,
    contacts.whatsapp && `<li>${icon('chat')}<a href="${contacts.whatsapp.href}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li>`,
    contacts.address && `<li>${icon('pin')}<span>${contacts.address.map(esc).join('<br>')}</span></li>`,
  ].filter(Boolean);
  const soc = Object.entries(config.social).filter(([k, v]) => v && !k.startsWith('_')).map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener noreferrer">${k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1)}</a>`);
  return `<footer class="footer"><div class="container">
<div class="footer-grid">
<div><div class="footer-logo"><img src="${ctx.href('assets/img/logo-360.webp')}" width="360" height="131" loading="lazy" alt="${esc(config.companyName)}"></div>
<p>Engineering, procurement, construction, operations and maintenance for water and wastewater treatment.</p>${soc.length ? `<p class="social">${soc.join(' · ')}</p>` : ''}</div>
<div><h3>Services</h3><ul class="flinks">${services.map((s) => `<li><a href="${ctx.href(s.slug + '/')}">${esc(s.nav)}</a></li>`).join('')}</ul></div>
<div><h3>Company</h3><ul class="flinks"><li><a href="${ctx.href('about/')}">About</a></li><li><a href="${ctx.href('projects/')}">Projects</a></li><li><a href="${ctx.href('faq/')}">FAQ</a></li><li><a href="${ctx.href('contact/')}">Contact</a></li><li><a href="${ctx.href('privacy/')}">Privacy</a></li></ul></div>
<div><h3>Get in touch</h3>${items.length ? `<ul class="fcontact">${items.join('')}</ul>` : ''}<a class="btn btn--primary btn--sm" href="${quoteHref(ctx)}">Request a quote</a></div>
</div>
<div class="copyright"><span>© ${new Date().getFullYear()} ${esc(config.companyName)}. All rights reserved.</span><span>Water &amp; wastewater engineering</span></div>
</div></footer>`;
}

export function floatingActions(ctx) {
  const w = ctx.contacts.whatsapp;
  return w ? `<a class="fab" href="${w.href}" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp (opens in a new tab)">${icon('chat')}<span>WhatsApp</span></a>` : '';
}

export function page(ctx, headOpts, active, body, extraJs = []) {
  const analytics = ctx.config.analytics.scriptSrc;
  const js = ['assets/js/site.js', ...extraJs].map((s) => `<script src="${ctx.href(s)}" defer></script>`).join('\n');
  const an = analytics ? `<script src="${esc(analytics)}" defer ${ctx.config.analytics.domain ? `data-domain="${esc(ctx.config.analytics.domain)}"` : ''}></script>` : '';
  return `${head(ctx, headOpts)}
<body>
${sprite()}
${header(ctx, active)}
<main id="main">
${body}
</main>
${footer(ctx)}
${floatingActions(ctx)}
${js}
${an}
</body></html>`;
}

// ---------- components ----------
export function serviceCard(ctx, s) {
  return `<article class="card reveal"><a class="card-media" href="${ctx.href(s.slug + '/')}" tabindex="-1" aria-hidden="true">${img(ctx, s.cardPhoto, { sizes: '(min-width:1000px) 360px, (min-width:640px) 50vw, 100vw' })}<span class="card-num">${s.num} / ${esc(s.tag)}</span></a>
<div class="card-body"><h3><a href="${ctx.href(s.slug + '/')}">${esc(s.title)}</a></h3><p>${esc(s.card)}</p><a class="text-link" href="${ctx.href(s.slug + '/')}" aria-label="Explore ${esc(s.title)}">Explore service ${icon('arrow')}</a></div></article>`;
}

export function faqList(items = faqs) {
  return `<div class="faq">${items.map(([q, a]) => `<details class="reveal"><summary>${esc(q)}${icon('down', 'ico chev')}</summary><div class="faq-a"><p>${esc(a)}</p></div></details>`).join('')}</div>`;
}

export function ctaBand(ctx, { title = 'Let’s talk about the challenge you’re trying to solve.', text = 'Tell us about your water and wastewater treatment requirements and the team will follow up.', slug = '' } = {}) {
  const { phone, whatsapp } = ctx.contacts;
  return `<section class="cta"><div class="container"><div class="cta-panel reveal"><div><span class="eyebrow">Have a project in mind?</span><h2>${title}</h2><p>${esc(text)}</p></div>
<div class="cta-actions">${btn('Request a quote', quoteHref(ctx, slug), 'primary', 'up')}${phone ? btn('Call us', phone.href, 'outline', 'phone') : ''}${whatsapp ? `<a class="btn btn--outline" href="${whatsapp.href}" target="_blank" rel="noopener noreferrer">WhatsApp${icon('chat')}</a>` : ''}</div></div></div></section>`;
}

export function partners(ctx) {
  const list = ctx.config.partners.filter((p) => p.name);
  if (!list.length) return '';
  const reps = Math.max(2, Math.ceil(3000 / (list.length * 260)));
  const item = (p, hidden) => {
    const logoFile = p.logo && existsSync(new URL(`../public/assets/partners/${p.logo}`, import.meta.url));
    const inner = logoFile ? `<img src="${ctx.href('assets/partners/' + p.logo)}" alt="${hidden ? '' : esc(p.name) + ' logo'}" width="160" height="40" loading="lazy">` : `<span class="partner-name">${esc(p.name)}</span>`;
    return `<li><a class="partner" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"${hidden ? ' tabindex="-1" aria-hidden="true"' : ` aria-label="${esc(p.name)} (opens ${esc(p.url.replace(/^https?:\/\//, ''))} in a new tab)"`}>${inner}</a></li>`;
  };
  const group = (hidden) => `<ul class="marquee-group"${hidden ? ' aria-hidden="true"' : ''}>${Array.from({ length: reps }, (_, i) => list.map((p) => item(p, hidden || i > 0)).join('')).join('')}</ul>`;
  return `<section class="partners" aria-labelledby="partners-h"><div class="container"><h2 id="partners-h" class="partners-title">Our partners</h2></div>
<div class="marquee"><div class="marquee-track">${group(false)}${group(true)}</div></div></section>`;
}

export function clients(ctx) {
  const list = (ctx.config.clients || []).filter((c) => c.name && c.logo);
  if (!list.length) return '';
  return `<section class="partners clients" aria-labelledby="clients-h"><div class="container"><h2 id="clients-h" class="partners-title">Our clients</h2>
<div class="client-controls" hidden><button type="button" class="btn btn--ghost btn--sm" data-client-prev aria-label="Previous client logos" aria-controls="client-track">${icon('left')}</button><button type="button" class="btn btn--ghost btn--sm" data-client-pause aria-pressed="false">Pause movement</button><button type="button" class="btn btn--ghost btn--sm" data-client-next aria-label="Next client logos" aria-controls="client-track">${icon('right')}</button></div>
<ul class="client-track" id="client-track" tabindex="0" aria-label="Client logos; scroll to view more">${list.map((c) => `<li><div class="partner client-logo"><img src="${ctx.href('assets/clients/' + c.logo)}" width="180" height="88" loading="lazy" alt="${esc(c.name)}"></div></li>`).join('')}</ul></div></section>`;
}

export function testimonials(ctx) {
  const t = ctx.config.testimonials.filter((x) => x.quote && x.name);
  if (!t.length) return '';
  return `<section class="section section--paper"><div class="container">${sectionHead('Testimonials', 'What clients say')}<div class="t-grid">${t.map((x) => `<figure class="t-card reveal"><blockquote><p>${esc(x.quote)}</p></blockquote><figcaption><strong>${esc(x.name)}</strong>${x.role || x.organisation ? `<span>${esc([x.role, x.organisation].filter(Boolean).join(', '))}</span>` : ''}</figcaption></figure>`).join('')}</div></div></section>`;
}

export function pageHero(ctx, { crumbs, eyebrowText, title, lead, photo, actions = '' }) {
  return `<section class="page-hero"><div class="container page-hero-grid"><div>
<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([l, h], i) => `<li>${h && i < crumbs.length - 1 ? `<a href="${h}">${esc(l)}</a>` : `<span${i === crumbs.length - 1 ? ' aria-current="page"' : ''}>${esc(l)}</span>`}</li>`).join('')}</ol></nav>
${eyebrow(eyebrowText)}<h1>${title}</h1><p class="lead">${lead}</p>${actions ? `<div class="hero-actions">${actions}</div>` : ''}</div>
${photo ? `<div class="frame">${img(ctx, photo, { sizes: '(min-width:900px) 520px, 100vw', loading: 'eager', priority: true })}</div>` : ''}</div></section>`;
}

export function processBand(ctx) {
  return `<section class="section section--navy"><div class="container">${sectionHead('How we work', 'Dependable solutions start with understanding the problem.')}<ol class="steps">${steps.map(([t, d], i) => `<li class="reveal"><span class="step-n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol></div></section>`;
}

export function orgJsonLd(ctx) {
  const { config, contacts } = ctx;
  const o = { '@context': 'https://schema.org', '@type': 'Organization', name: config.companyName, foundingDate: String(config.foundingYear), description: 'Water and wastewater treatment, procurement, maintenance, consulting and training in Nigeria.', areaServed: 'NG' };
  if (config.siteUrl) { o.url = config.siteUrl; o.logo = config.siteUrl.replace(/\/$/, '') + '/assets/img/mark-512.png'; }
  if (contacts.email) o.email = config.contact.email;
  if (contacts.phone) o.telephone = config.contact.phone;
  if (contacts.address) o.address = { '@type': 'PostalAddress', streetAddress: config.contact.addressLines.join(', '), addressCountry: 'NG' };
  const sameAs = Object.values(config.social).filter((v) => v && String(v).startsWith('http')); if (sameAs.length) o.sameAs = sameAs;
  return o;
}
