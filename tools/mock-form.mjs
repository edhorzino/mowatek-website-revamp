// Tiny mock form endpoint for tests: /ok -> 200 {ok:true}, /fail -> 500, /invalid -> 422 with errors, /hang -> never responds
import { createServer } from 'node:http';
createServer((req, res) => {
  const h = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
  if (req.method === 'OPTIONS') { res.writeHead(204, h); return res.end(); }
  let n = 0; req.on('data', (c) => (n += c.length)); req.on('end', () => {
    if (req.url === '/ok') { res.writeHead(200, h); res.end('{"ok":true}'); }
    else if (req.url === '/fail') { res.writeHead(500, h); res.end('{"error":"boom"}'); }
    else if (req.url === '/invalid') { res.writeHead(422, h); res.end('{"errors":[{"message":"email must be a valid email address"}]}'); }
    else if (req.url === '/html500') { res.writeHead(502, { 'Content-Type': 'text/html' }); res.end('<h1>Bad gateway</h1>'); }
  });
}).listen(8091, () => console.log('mock on 8091'));
