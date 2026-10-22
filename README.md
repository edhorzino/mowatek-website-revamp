# Mowatek Nigeria Limited: website

Static website (no framework, no runtime dependencies, no backend). A small Node script (Node 18+) assembles shared templates into plain HTML in `dist/`, which can be uploaded to any web host.

## Quick start
```bash
node build.mjs          # builds ./dist  (or: npm run build)
node tools/serve.mjs    # preview at http://localhost:8080
node tools/check.mjs    # link / asset / SEO / CSP checks (npm test = build + check)
```
`dist/` is already built and ready to upload. Rebuild after editing anything below.

## Where to edit
| What | File |
|---|---|
| Phone, email, WhatsApp, address, RC number, social links, domain, form endpoint, partners, testimonials | `site.config.json` |
| Page copy, services, FAQ, gallery captions, photo alt text | `src/content.mjs` |
| Header, footer, cards and other components | `src/templates.mjs` |
| Page layouts and the contact form | `build.mjs` |
| Styling (colours are CSS variables at the top) | `public/assets/css/site.css` |
| Original photos and logos (untouched) | `source-assets/originals/` |

Empty config values are never rendered, so nothing placeholder-like can leak onto the live site.

## Pages and URLs
`/`, `/about/`, `/services/`, `/water-treatment/`, `/waste-water-sewage-treatment/`, `/solid-waste-management/`, `/consulting/`, `/training/`, `/supply-installation-maintenance/`, `/projects/`, `/faq/`, `/contact/`, `/privacy/`, `404.html`. Existing service URLs are kept. Old `*.html` URLs and the broken `/consultancy-services/` link redirect to the canonical pages (`_redirects` for Netlify/Cloudflare Pages, `.htaccess` for Apache/cPanel).

## Enquiry form
The form posts JSON/FormData from the browser to an endpoint you configure in `form.endpoint` (e.g. a Formspree form URL, `https://formspree.io/f/xxxxxxxx`). The endpoint is public by design; **do not put secrets in this repo**. Behaviour:
- Client-side validation with accessible error messages.
- Spam protection: hidden honeypot field, minimum time-on-page, and double-submit lock. For stronger protection, enable the captcha/spam filter in your form provider's dashboard.
- Success is shown **only** when the provider returns a successful response. Network failures, timeouts, non-2xx responses and an unset endpoint all show an error (with phone/email/WhatsApp fallbacks when configured), and the user's text is kept.
- Providers that need a public access key (e.g. Web3Forms) can be supported by adding `"hiddenFields": {"access_key": "..."}` under `form`.
- Quote buttons link to `/contact/?intent=quote&service=<slug>` and preselect the service.

## Partner carousel
Partners are listed in `site.config.json`. Official logos could not be downloaded or verified in the build environment, so the carousel currently shows the partner **names as plain text**, linked to jetincorp.com and nov.com. To use logos: save the official files from each company's brand/media page into `public/assets/partners/` (SVG preferred), set `"logo": "filename.svg"` for that partner, and rebuild. Check each company's logo-usage terms and confirm permission to display them.

## Hosting requirements
Any static host works. Recommended: Netlify, Cloudflare Pages or Vercel (security headers and redirects are generated in `dist/_headers` and `dist/_redirects`), or Apache/cPanel (`dist/.htaccess` handles redirects, headers, compression and caching; requires mod_headers/mod_rewrite). Serve over HTTPS. The Content-Security-Policy allows only same-origin assets plus your form endpoint (and analytics script, if configured), so rebuild after changing either.

## Images
`python3 tools/optimize-images.py` (needs Pillow) regenerates responsive WebP sizes, logo crops, favicons and the social image from `source-assets/originals/`. Add new photos there, register them in `src/content.mjs`, then run it.

## Hero video
The hero currently uses a CSS crossfade/zoom of site photographs. To use real footage, add MP4/WebM files to `public/assets/video/` and set `heroVideo` in `site.config.json`.

## Tests
`tools/check.mjs` (static) and `tools/test-browser.py` (Playwright: three viewports, navigation, gallery, form success/failure states; needs `node tools/serve.mjs` and `node tools/mock-form.mjs` running).
