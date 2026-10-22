// Static checks on dist/: links, anchors, assets, SEO basics, accessibility basics, CSP-compatibility. Exit 1 on failure.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const DIST = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(DIST), htmls = files.filter((f) => f.endsWith('.html'));
const errs = [], titles = new Map(), descs = new Map();
const err = (f, m) => errs.push(`${relative(DIST, f)}: ${m}`);
const ids = {}; for (const f of htmls) ids[f] = new Set([...readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const resolveFile = (from, ref, root404) => {
  const base = root404 ? DIST : dirname(from);
  let p = ref.startsWith('/') ? join(DIST, ref) : resolve(base, ref);
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  return p;
};
let linkCount = 0, imgCount = 0;
for (const f of htmls) {
  const h = readFileSync(f, 'utf8'), is404 = f.endsWith('404.html');
  const t = (h.match(/<title>(.*?)<\/title>/s) || [])[1], d = (h.match(/name="description" content="([^"]*)"/) || [])[1];
  if (!t) err(f, 'missing <title>'); if (!d) err(f, 'missing meta description');
  if (t && titles.has(t)) err(f, `duplicate title with ${titles.get(t)}`); titles.set(t, relative(DIST, f));
  if (d && descs.has(d)) err(f, `duplicate description with ${descs.get(d)}`); descs.set(d, relative(DIST, f));
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) err(f, 'page must have exactly one <h1>');
  if (!/<main id="main"/.test(h)) err(f, 'missing <main id="main">');
  if (/\sstyle="/.test(h.replace(/<svg class="sprite"[\s\S]*?<\/svg>/, ''))) err(f, 'inline style attribute (blocked by CSP)');
  if (/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/.test(h)) err(f, 'inline script (blocked by CSP)');
  if (/\son[a-z]+="/.test(h)) err(f, 'inline event handler');
  if (/href="#"/.test(h)) err(f, 'dead href="#"');
  if (/555\) 123|Business St|Tech City|lorem ipsum|digital excellence/i.test(h)) err(f, 'placeholder content');
  for (const m of h.matchAll(/<img\b[^>]*>/g)) { imgCount++; const tag = m[0]; if (!/\salt="/.test(tag)) err(f, `img without alt: ${tag.slice(0, 80)}`); if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) err(f, 'img without width/height'); }
  for (const m of h.matchAll(/<label[^>]*for="([^"]+)"/g)) if (!ids[f].has(m[1])) err(f, `label for missing id ${m[1]}`);
  for (const m of h.matchAll(/aria-controls="([^"]+)"/g)) if (!ids[f].has(m[1])) err(f, `aria-controls missing id ${m[1]}`);
  for (const m of h.matchAll(/<(?:a|link|script|img|source)\b[^>]*?\s(?:href|src|srcset)="([^"]*)"/g)) {
    const refs = m[0].includes('srcset=') && !m[0].includes(' src="') ? m[1].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]];
    for (let ref of refs) {
      if (!ref || /^(https?:|mailto:|tel:|data:)/.test(ref)) { if (/^http:/.test(ref)) err(f, `insecure link ${ref}`); continue; }
      linkCount++;
      const [path, hash] = ref.split('#'); const clean = path.split('?')[0];
      const target = clean === '' ? f : resolveFile(f, clean, is404);
      if (!existsSync(target)) { err(f, `broken reference -> ${ref}`); continue; }
      if (hash && target.endsWith('.html') && !(ids[target] || new Set()).has(hash)) err(f, `missing anchor #${hash} in ${relative(DIST, target)}`);
    }
  }
  for (const m of h.matchAll(/\ssrcset="([^"]+)"/g)) for (const s of m[1].split(',')) { const u = s.trim().split(/\s+/)[0]; if (u && !/^https?:/.test(u) && !existsSync(resolveFile(f, u, is404))) err(f, `broken srcset -> ${u}`); }
}
// css url() references
for (const f of files.filter((x) => x.endsWith('.css'))) for (const m of readFileSync(f, 'utf8').matchAll(/url\(([^)]+)\)/g)) { const u = m[1].replace(/["']/g, ''); if (!/^(data:|https?:)/.test(u) && !existsSync(resolve(dirname(f), u))) err(f, `css url missing ${u}`); }
// weight report
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
const size = (p) => statSync(join(DIST, p)).size;
console.log(`Checked ${htmls.length} HTML files, ${linkCount} references, ${imgCount} <img> tags.`);
console.log(`CSS ${kb(size('assets/css/site.css'))}, JS ${kb(size('assets/js/site.js') + size('assets/js/contact.js'))}, largest page ${kb(Math.max(...htmls.map((f) => statSync(f).size)))}.`);
if (errs.length) { console.error(`\n${errs.length} problem(s):\n` + errs.map((e) => ' ✗ ' + e).join('\n')); process.exit(1); }
console.log('All static checks passed.');
