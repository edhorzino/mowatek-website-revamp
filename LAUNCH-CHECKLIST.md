# Launch checks after this update

- [x] Added both supplied phone numbers and the corrected address. WhatsApp remains optional and unconfigured.
- [ ] Confirm RESEND_API_KEY is configured in the Vercel project and the sender domain quotes.mowatek.com is verified, or supply a verified QUOTE_FROM_EMAIL.
- [ ] After deployment, send a real enquiry and confirm inbox delivery and all notification fields. The local tests use simulated provider responses.
- [ ] Confirm Vercel uses the committed vercel.json, Node 22.x, build command npm run build and output directory dist.
- [ ] Verify the security headers, old-service redirects, www redirect, custom 404 and sitemap on the deployed site. Both www and apex domains must be assigned in the dashboard.
- [ ] Submit https://mowatek.com/sitemap.xml in Google Search Console if not already done.
- [ ] Configure a shared Vercel Firewall rate limit if needed; the API's memory-based limit is per function instance.
- [ ] Confirm privacy retention wording matches actual record-handling practice.
- [ ] Replace the blank twentieth client image if another logo was intended; 19 identified logos are displayed.

The revised site uses five service areas to match the supplied service list. Existing colours, typography, header, hero, page layouts and footer styling are retained. No Git commit, push or production deployment is performed by this update.
