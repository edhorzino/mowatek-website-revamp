export const legacyRedirects = [
  ['water-treatment.html', 'water-treatment/'],
  ['waste-water-sewage-treatment.html', 'wastewater-effluent-treatment/'],
  ['waste-water-sewage-treatment/', 'wastewater-effluent-treatment/'],
  ['wastewater-effluent-treatment.html', 'wastewater-effluent-treatment/'],
  ['solid-waste-management.html', 'services/'],
  ['solid-waste-management/', 'services/'],
  ['consulting.html', 'consulting/'], ['training.html', 'training/'],
  ['supply-installation-maintenance.html', 'procurement-maintenance/'],
  ['supply-installation-maintenance/', 'procurement-maintenance/'],
  ['procurement-maintenance.html', 'procurement-maintenance/'],
  ['about.html', 'about/'], ['services.html', 'services/'],
  ['projects.html', 'projects/'], ['faq.html', 'faq/'], ['contact.html', 'contact/'],
  ['privacy.html', 'privacy/'], ['index.html', ''], ['consultancy-services/', 'consulting/'],
];

export function securityHeaders(config) {
  const origin = (u) => { try { return new URL(u).origin; } catch { return ''; } };
  const form = origin(config.form.endpoint), analytics = origin(config.analytics.scriptSrc);
  const extra = [...new Set([form, analytics].filter(Boolean))].join(' ');
  const csp = [`default-src 'self'`, `img-src 'self' data:`, `style-src 'self'`, `script-src 'self'${analytics ? ' ' + analytics : ''}`, `font-src 'self'`, `media-src 'self'`, `connect-src 'self'${extra ? ' ' + extra : ''}`, `form-action 'self'${form ? ' ' + form : ''}`, `base-uri 'self'`, `object-src 'none'`, `frame-ancestors 'none'`].join('; ');
  return { 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'X-Frame-Options': 'DENY' };
}

export function vercelConfiguration(config) {
  return {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    framework: null, buildCommand: 'npm run build', outputDirectory: 'dist',
    functions: { 'api/quote.js': { maxDuration: 30 } },
    headers: [
      { source: '/(.*)', headers: Object.entries(securityHeaders(config)).map(([key, value]) => ({ key, value })) },
      { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
    ],
    redirects: [
      { source: '/:path*', has: [{ type: 'host', value: 'www.mowatek.com' }], destination: 'https://mowatek.com/:path*', permanent: true },
      ...legacyRedirects.map(([from, to]) => ({ source: '/' + from.replace(/\/$/, ''), destination: '/' + to, permanent: true })),
    ],
  };
}
