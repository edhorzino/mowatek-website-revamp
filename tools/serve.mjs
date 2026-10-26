// Minimal static server for local preview and tests: node tools/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { securityHeaders, legacyRedirects } from '../src/hosting.mjs';
import config from '../site.config.json' with { type: 'json' };
const DIST = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml' };
const port = Number(process.argv[2]) || 8080;
const mock = process.argv.includes('--mock-form');
createServer(async (req, res) => {
  for (const [key, value] of Object.entries(securityHeaders(config))) res.setHeader(key, value);
  res.setHeader('Cache-Control', 'no-store');
  let p, url;
  try { url = new URL(req.url, 'http://localhost'); p = decodeURIComponent(url.pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  const redirect = legacyRedirects.find(([from]) => '/' + from.replace(/\/$/, '') === p.replace(/\/$/, ''));
  if (redirect) { res.writeHead(301, { Location: '/' + redirect[1] + url.search }); res.end(); return; }
  if (p === '/api/quote') {
    // Local mock never imports the email provider or sends real enquiries.
    res.setHeader('Content-Type', 'application/json');
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end(JSON.stringify({ success: false })); return; }
    if (!mock) { res.writeHead(503); res.end(JSON.stringify({ success: false, error: 'Local preview does not send emails.' })); return; }
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 20000) { res.writeHead(413); res.end('{}'); return; } }
    try {
      const body = JSON.parse(raw);
      if (body.email === 'reject@example.com') { res.writeHead(502); res.end(JSON.stringify({ success: false, error: 'Simulated provider failure' })); }
      else if (body.email === 'nonjson@example.com') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<p>Not an acceptance response</p>'); }
      else { res.writeHead(200); res.end(JSON.stringify({ success: true, id: 'local-mock-only' })); }
    } catch { res.writeHead(400); res.end(JSON.stringify({ success: false })); }
    return;
  }
  let f = resolve(DIST, '.' + p);
  if (f !== DIST && !f.startsWith(DIST + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch { /* fallthrough */ }
  try { const b = await readFile(f); res.writeHead(200, { 'Content-Type': T[extname(f)] || 'application/octet-stream' }); res.end(b); }
  catch {
    try { const b = await readFile(join(DIST, '404.html')); res.writeHead(404, { 'Content-Type': T['.html'] }); res.end(b); }
    catch { res.writeHead(503, { 'Content-Type': 'text/plain', 'Retry-After': '2' }); res.end('Preview is rebuilding. Please reload shortly.'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`Serving dist/ on http://localhost:${port}${mock ? ' (MOCK FORM ONLY; no emails sent)' : ''}`));
