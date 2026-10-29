import site from '../data/site.json';

/**
 * Link a la ficha con atribución.
 *
 * `referrer` es lo que Play Console usa para atribuir la instalación a la web.
 * Sin esto, el sitio es un agujero negro: no sabés si trajo un jugador.
 */
export function storeLink({ lang = 'en', medium = 'cta', campaign = 'home' } = {}) {
  const url = new URL(site.storeUrl);
  url.searchParams.set('hl', lang);
  url.searchParams.set('referrer', `utm_source=website&utm_medium=${medium}&utm_campaign=${campaign}`);
  return url.toString();
}

/**
 * Link que abre la Play Store **app** en Android, no una pestaña de Chrome.
 * En desktop cae al https normal.
 */
export function storeIntent(httpsUrl) {
  const id = encodeURIComponent(site.packageId);
  return (
    `intent://details?id=${id}#Intent;scheme=market;package=com.android.vending;` +
    `S.browser_fallback_url=${encodeURIComponent(httpsUrl)};end`
  );
}
