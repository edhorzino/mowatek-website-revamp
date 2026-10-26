import { Resend } from 'resend';
import { services } from '../src/content.mjs';
import config from '../site.config.json' with { type: 'json' };

const buckets = new Map();
const windowMs = 10 * 60 * 1000;
const escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  const origin = req.headers?.origin;
  if (origin) {
    try {
      const host = new URL(origin).host;
      if (host !== new URL(config.siteUrl).host && host !== req.headers.host) {
        return res.status(403).json({ success: false, error: 'Please submit from our website.' });
      }
    } catch { return res.status(403).json({ success: false, error: 'Invalid origin.' }); }
  }
  if (!(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return res.status(415).json({ success: false, error: 'Please submit the form as JSON.' });
  }
  if (Number(req.headers?.['content-length']) > 20000) {
    return res.status(413).json({ success: false, error: 'Your enquiry is too large.' });
  }
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); }
  catch { return res.status(400).json({ success: false, error: 'Invalid request.' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ success: false, error: 'Invalid request.' });
  }
  if (JSON.stringify(body).length > 20000) return res.status(413).json({ success: false, error: 'Your enquiry is too large.' });
  const fields = { name: 120, email: 160, phone: 30, organisation: 160, message: 4000, service: 80, intent: 20, _gotcha: 200, _startedAt: 30 };
  for (const [key, max] of Object.entries(fields)) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > max)) {
      return res.status(422).json({ success: false, error: 'Please check your form fields.' });
    }
  }
  const value = (key) => (body[key] || '').trim();
  const name = value('name'), email = value('email'), phone = value('phone');
  const organisation = value('organisation'), message = value('message'), service = value('service');
  const intent = value('intent') || 'enquiry';
  const selected = services.find((s) => s.slug === service);
  if (name.length < 2 || /[\r\n]/.test(name) || !emailPattern.test(email) || /[\r\n]/.test(email)
      || (phone && !/^\+?[0-9][0-9\s().-]{6,19}$/.test(phone)) || message.length < 10
      || (!selected && service !== 'general') || !['enquiry', 'quote'].includes(intent)) {
    return res.status(422).json({ success: false, error: 'Please check your name, email, phone, service and message.' });
  }
  const now = Date.now(), started = Number(value('_startedAt'));
  if (value('_gotcha') || !started || now - started < config.form.minSecondsBeforeSubmit * 1000 || started > now) {
    return res.status(422).json({ success: false, error: 'Please take a moment to review your enquiry and try again.' });
  }
  // Best-effort per-instance limit; use Vercel Firewall for a shared production limit.
  for (const [key, bucket] of buckets) if (bucket.reset <= now) buckets.delete(key);
  const ip = String(req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
  const bucket = buckets.get(ip) || { count: 0, reset: now + windowMs };
  if (bucket.count >= 5 || buckets.size >= 10000 && !buckets.has(ip)) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.reset - now) / 1000))));
    return res.status(429).json({ success: false, error: 'Too many enquiries. Please try again later or email us directly.' });
  }
  bucket.count++; buckets.set(ip, bucket);
  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ success: false, error: 'Online enquiries are temporarily unavailable. Please email us directly.' });
  }
  try {
    const rows = [['Full name', name], ['Email', email], ['Phone', phone || 'Not provided'], ['Organisation', organisation || 'Not provided'], ['Service', selected?.title || 'General enquiry'], ['Request type', intent], ['Message', message]];
    const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.QUOTE_FROM_EMAIL || 'Mowatek Quotes <enquiries@quotes.mowatek.com>',
      to: [config.contact.email], replyTo: email,
      subject: `Website ${intent === 'quote' ? 'quote request' : 'enquiry'} from ${name}`,
      text: rows.map(([key, val]) => `${key}: ${val}`).join('\n\n'),
      html: `<h2>New website ${intent === 'quote' ? 'quote request' : 'enquiry'}</h2>${rows.map(([key, val]) => `<p><strong>${key}:</strong><br>${escapeHtml(val).replace(/\n/g, '<br>')}</p>`).join('')}`,
    });
    if (result.error || !result.data?.id) {
      console.error('Enquiry email rejected:', result.error?.name || 'missing_email_id');
      return res.status(502).json({ success: false, error: 'Your enquiry could not be sent. Please email us directly.' });
    }
    return res.status(200).json({ success: true, id: result.data.id });
  } catch {
    console.error('Enquiry email request failed.');
    return res.status(502).json({ success: false, error: 'Your enquiry could not be sent. Please email us directly.' });
  }
}
