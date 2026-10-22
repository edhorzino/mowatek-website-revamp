# Launch checklist: items needing Mowatek input

Nothing below has been invented; each item is hidden or neutral on the site until supplied.

## Must do before launch
- [ ] **Form delivery:** create a Formspree (or similar) form, paste its URL into `form.endpoint`, rebuild, and send a real test enquiry. *Until then the form honestly reports that it can't send.*
- [ ] **Contact details** in `site.config.json`: `email`, `phone`, `whatsapp` (international format), `addressLines`, optional `openingHours`. These enable the click-to-call, WhatsApp, email and address blocks automatically.
- [ ] **Domain:** set `siteUrl` (e.g. `https://www.mowatek.com`) to enable canonical tags, social previews and `sitemap.xml`. Then submit the sitemap in Google Search Console.
- [ ] **Partner logos:** obtain the official Jet Incorp and NOV logo files and usage permission (see README). Currently text names only.
- [ ] **Confirm service scope:** the capability lists and "typical applications" on each service page are neutral descriptions adapted from the previous site. Remove anything Mowatek does not offer. Marketing claims from the old pages were removed (free consultations/UV/parts, 24/7, certified technicians, "up to 99%" figures, pricing tiers, GPS/smart-sensor/waste-to-energy items, "leading manufacturers worldwide").
- [ ] **Confirm company facts:** incorporated 1983; limited liability company; mechanical, electrical, civil and marine mandate. Add `rcNumber` if it should be displayed.
- [ ] **Photos:** confirm Mowatek owns the rights and that people shown consent to publication; check the visual-only alt text/captions in `src/content.mjs` and add real project names/locations if wanted. The casual group selfie (`project-11`), a duplicate (`32`), a very dark image (`39`) and a near-duplicate (`53`) are not used.
- [ ] **Privacy notice** (`/privacy/`): have it reviewed (e.g. against the Nigeria Data Protection Act) and add the data controller's contact details.

## Optional
- [ ] **Testimonials:** add genuine ones to `testimonials` (`quote`, `name`, optional `role`, `organisation`) with the client's permission. The section appears only when entries exist.
- [ ] **Real hero video**, social links, analytics script (privacy-friendly), a vector (SVG) logo, certifications/accreditations and named clients if Mowatek wishes to show them.
- [ ] Review typography/colour tweaks (CSS variables at the top of `site.css`).

## Known limitations
- Hosted-service form delivery could not be tested end-to-end here (no credentials); success/error handling was tested against a local mock server.
- The 404 page uses root-absolute links, so it assumes the site is served from the domain root.
- Fonts (Manrope, DM Sans) are self-hosted, so no third-party font requests.
