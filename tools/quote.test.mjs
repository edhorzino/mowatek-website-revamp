import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/quote.js';

let number = 0;
const valid = () => ({ name: 'Test User', email: 'test@example.com', phone: '+234 801 234 5678', organisation: 'Test Organisation', service: 'water-treatment', message: 'Please quote for our water treatment project.', intent: 'quote', _gotcha: '', _startedAt: String(Date.now() - 10000) });
async function call(body = valid(), overrides = {}) {
  const req = { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': `test-${number++}`, origin: 'https://mowatek.com', host: 'mowatek.com' }, body, ...overrides };
  const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(body) { this.body = body; return this; } };
  await handler(req, response); return response;
}

test('enquiry handler validates inputs and requires provider acceptance', async (t) => {
  const savedKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_fake_test_key';
  let sent = [], providerStatus = 200, providerBody = { id: 'test-email-id' }, networkFailure = false;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    sent.push(JSON.parse(options.body));
    if (networkFailure) throw Error('Simulated network failure');
    return new Response(JSON.stringify(providerBody), { status: providerStatus, headers: { 'Content-Type': 'application/json' } });
  });
  const rejects = async (name, body, status, overrides) => t.test(name, async () => {
    const count = sent.length, result = await call(body, overrides);
    assert.equal(result.code, status); assert.equal(result.body.success, false); assert.equal(sent.length, count);
  });
  try {
    await rejects('rejects unsupported methods', valid(), 405, { method: 'GET' });
    await rejects('rejects multipart rather than dropping enquiry fields', 'multipart body', 415, { headers: { 'content-type': 'multipart/form-data' } });
    await rejects('rejects malformed JSON', '{', 400);
    await rejects('rejects missing body', null, 400);
    await rejects('rejects empty enquiry', {}, 422);
    await rejects('rejects field type mismatch', { ...valid(), message: {} }, 422);
    await rejects('rejects oversized input', { ...valid(), message: 'a'.repeat(4001) }, 422);
    await rejects('rejects oversized body', { ...valid(), extra: 'a'.repeat(21000) }, 413);
    await rejects('rejects invalid email', { ...valid(), email: 'invalid' }, 422);
    await rejects('rejects invalid phone', { ...valid(), phone: 'invalid' }, 422);
    await rejects('rejects removed service', { ...valid(), service: 'solid-waste-management' }, 422);
    await rejects('rejects invalid intent', { ...valid(), intent: 'arbitrary' }, 422);
    await rejects('enforces honeypot on server', { ...valid(), _gotcha: 'bot' }, 422);
    await rejects('enforces minimum submission time', { ...valid(), _startedAt: String(Date.now()) }, 422);
    await rejects('requires submission timestamp', { ...valid(), _startedAt: '' }, 422);
    await rejects('rejects foreign browser origin', valid(), 403, { headers: { 'content-type': 'application/json', origin: 'https://example.com', host: 'mowatek.com' } });
    await t.test('successful JSON submission preserves and escapes all details', async () => {
      const result = await call({ ...valid(), organisation: '<b>ACME & Co</b>', message: '<a href="https://example.com">Test message</a>\nLine two' });
      assert.equal(result.code, 200); assert.equal(result.body.id, 'test-email-id');
      const email = sent.at(-1); assert.equal(email.reply_to, 'test@example.com');
      assert.match(email.html, /&lt;b&gt;ACME &amp; Co&lt;\/b&gt;/); assert.doesNotMatch(email.html, /<a href/);
      assert.match(email.text, /Water Treatment/); assert.match(email.text, /Request type: quote/); assert.match(email.text, /ACME & Co/);
    });
    await t.test('accepts parsed and unparsed JSON and the general service', async () => {
      assert.equal((await call(JSON.stringify({ ...valid(), service: 'general' }))).code, 200);
    });
    await t.test('provider rejection never returns success', async () => {
      providerStatus = 422; providerBody = { name: 'validation_error', message: 'Rejected' };
      const result = await call(); assert.equal(result.code, 502); assert.equal(result.body.success, false);
    });
    await t.test('provider response without email ID is failure', async () => {
      providerStatus = 200; providerBody = {};
      assert.equal((await call()).code, 502);
    });
    await t.test('provider network failure is failure', async () => {
      networkFailure = true; assert.equal((await call()).code, 502); networkFailure = false;
    });
    await t.test('missing configuration fails without calling provider', async () => {
      delete process.env.RESEND_API_KEY; const count = sent.length;
      assert.equal((await call()).code, 503); assert.equal(sent.length, count); process.env.RESEND_API_KEY = 're_fake_test_key';
    });
    await t.test('limits repeated sends from the same client', async () => {
      providerBody = { id: 'rate-test' };
      const overrides = { headers: { 'content-type': 'application/json', 'x-real-ip': 'rate-test-client' } };
      for (let i = 0; i < 5; i++) assert.equal((await call(valid(), overrides)).code, 200);
      const count = sent.length, result = await call(valid(), overrides);
      assert.equal(result.code, 429); assert.equal(sent.length, count); assert.ok(Number(result.headers['Retry-After']) > 0);
    });
  } finally { if (savedKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = savedKey; }
});
