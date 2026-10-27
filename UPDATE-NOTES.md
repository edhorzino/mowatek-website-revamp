# Website update handover

## Changes ready for manual Git review and push

- Preserved the site's existing design, colours, fonts and page structures.
- Replaced the service list with Water Treatment, Wastewater/Effluent Treatment, Procurement & Maintenance, Consulting and Training; updated navigation, cards, service pages, footer, form choices, FAQ and metadata.
- Replaced About copy with the supplied EPCOM description, using five service areas to match the revised list.
- Published info@mowatek.com and 35, Ajose Street, Off Jubril Martins Street, Surulere, Lagos, Nigeria. Published both phone numbers: +234 807 409 5025 and +234 803 205 8073. WhatsApp remains unconfigured.
- Added NOV, Jet Incorporated and Cerafiltec logos from their official sites; see PARTNER-LOGOS.md.
- Added 19 named client logos with automatic movement, previous/next controls, pause and reduced-motion support. The blank twentieth image is retained but excluded.
- Fixed JSON form delivery, provider rejection handling, validation, spam checks, notification field loss and HTML escaping. Errors retain the enquiry and show the direct email fallback.
- Added canonical URLs, social preview images and sitemap, plus Vercel redirects and security headers. Legacy static-host redirect files are also updated.
- Finished privacy copy and refreshed tests, local preview behaviour, environment examples and deployment instructions.

## Verification

- Build succeeded: 12 content pages plus custom 404.
- Static checks passed: 13 HTML files, 751 references and 157 image elements; canonical and social preview requirements, sitemap and Vercel configuration consistency are checked.
- Email-handler tests passed: 24 tests, using a mocked provider; no real emails sent.
- Interactive browser checks: form validation, failure fallback, non-JSON rejection, simulated acceptance, mobile service menu, client carousel controls and gallery filter/lightbox.
- Mobile layout: all 12 content pages checked at 390px with no horizontal overflow or broken loaded images. Tablet samples: home, services, About and Contact at 820px passed. Desktop homepage/logo sections inspected visually.
- npm production dependency audit: zero reported vulnerabilities.
- No Lighthouse/Core Web Vitals score is claimed. Real inbox delivery and Vercel routing/headers must be checked after deployment.

## Rollback copy

The pre-update snapshot is saved outside the repository at:

`C:\Users\hp\.codex\visualizations\2026\10\25\01a17410-910c-7240-9721-f79b2072214c\mowatek-before-update`

It includes the original source, public assets, dist and Git metadata; reinstallable node_modules is excluded. Restore working files from that directory if needed. Preserve the current .git directory when only reverting website files.

## Remaining deployment checks

Confirm Vercel's RESEND_API_KEY and a verified sender domain, then submit one real enquiry after deployment and confirm receipt. Configure a shared Vercel Firewall limit if needed; the code's request limit is per server instance. See LAUNCH-CHECKLIST.md.

No Git staging, commit, push or production deployment was performed.
