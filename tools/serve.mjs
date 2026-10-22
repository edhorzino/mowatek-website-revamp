// Minimal static server for local preview and tests: node tools/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const DIST = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml' };
const port = Number(process.argv[2]) || 8080;
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let f = join(DIST, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch { /* fallthrough */ }
  try { const b = await readFile(f); res.writeHead(200, { 'Content-Type': T[extname(f)] || 'application/octet-stream' }); res.end(b); }
  catch { const b = await readFile(join(DIST, '404.html')); res.writeHead(404, { 'Content-Type': T['.html'] }); res.end(b); }
}).listen(port, () => console.log(`Serving dist/ on http://localhost:${port}`));
