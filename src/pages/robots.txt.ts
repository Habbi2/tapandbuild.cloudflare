import type { APIRoute } from 'astro';
import site from '../data/site.json';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

# La página de bio no aporta nada al índice.
Disallow: /go

# Bots de entrenamiento: no.
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

Sitemap: https://${site.domain}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
