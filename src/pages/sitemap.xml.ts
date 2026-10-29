import type { APIRoute } from 'astro';
import routes from '../data/routes.json';
import site from '../data/site.json';

export const prerender = true;

const origin = `https://${site.domain}`;
const lastmod = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = () => {
  const urls: string[] = [];

  for (const [pageKey, byLocale] of Object.entries(routes)) {
    for (const [lang, path] of Object.entries(byLocale)) {
      const loc = new URL(path, origin).href;
      const alternates = Object.entries(byLocale)
        .map(
          ([code, altPath]) =>
            `    <xhtml:link rel="alternate" hreflang="${code}" href="${new URL(altPath, origin).href}"/>`
        )
        .join('\n');

      urls.push(
        [
          '  <url>',
          `    <loc>${loc}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          `    <changefreq>${pageKey === 'home' ? 'weekly' : 'monthly'}</changefreq>`,
          `    <priority>${pageKey === 'home' ? '1.0' : pageKey === 'press' ? '0.6' : '0.4'}</priority>`,
          alternates,
          '  </url>',
        ].join('\n')
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
