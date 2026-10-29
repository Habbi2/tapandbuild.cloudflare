/**
 * Prueba de humo de las interacciones: switcher de temas, popover y tabs del tour.
 * Corre contra el build servido en http://127.0.0.1:4321 (astro preview).
 *
 *   node scripts/smoke.mjs
 */
import { chromium } from 'playwright-core';

const URL = process.env.SMOKE_URL ?? 'http://127.0.0.1:4321/';
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto(URL, { waitUntil: 'networkidle' });

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

// Tema por defecto
const initial = await page.getAttribute('html', 'data-theme');
check('tema por defecto = cream-vanilla', initial === null || initial === 'cream-vanilla', `data-theme=${initial}`);

// Popover
await page.click('[data-theme-toggle]');
const popVisible = await page.isVisible('#theme-pop');
check('el popover abre', popVisible);

// Elegir un tema desde el popover
await page.click('#theme-pop [data-theme-set="royal-gold"]');
const afterClick = await page.getAttribute('html', 'data-theme');
check('el tema cambia a royal-gold', afterClick === 'royal-gold', `data-theme=${afterClick}`);

// Persistencia
await page.reload({ waitUntil: 'networkidle' });
const persisted = await page.getAttribute('html', 'data-theme');
check('el tema persiste al recargar', persisted === 'royal-gold', `data-theme=${persisted}`);

// Contraste real del body tras el cambio
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check('el fondo cambió con el tema', bg === 'rgb(10, 10, 18)', bg);

// Galería
await page.click('.theme-grid [data-theme-set="sky-pop"]');
const afterGallery = await page.getAttribute('html', 'data-theme');
check('la galería también cambia el tema', afterGallery === 'sky-pop', `data-theme=${afterGallery}`);

// Tabs del tour
await page.click('[data-tab="market"]');
const activePanel = await page.getAttribute('[data-panel="market"]', 'class');
const caption = await page.textContent('[data-caption]');
check('el tab cambia el panel', activePanel.includes('is-active'), activePanel);
check('la caption cambia', (caption ?? '').length > 10, caption.trim().slice(0, 50));

// Teclado en el tablist
await page.focus('[data-tab="market"]');
await page.keyboard.press('ArrowRight');
const wrapped = await page.getAttribute('[data-tab="tap"]', 'aria-selected');
check('las flechas mueven el foco entre tabs', wrapped === 'true', `aria-selected=${wrapped}`);

// Links a la store con referrer
const storeHref = await page.getAttribute('.hero a[data-store]', 'href');
check('el CTA lleva referrer', (storeHref ?? '').includes('referrer='), storeHref?.slice(0, 80));

// Sin errores de consola
check('sin errores de JS', errors.length === 0, errors.slice(0, 2).join(' | '));

await browser.close();

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  [${r.detail}]` : ''}`);
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} ok`);
process.exit(failed.length ? 1 : 0);
