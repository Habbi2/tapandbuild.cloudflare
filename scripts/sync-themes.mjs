/**
 * Extrae las paletas del juego y genera src/data/themes.json.
 *
 * Fuente: <juego>/src/constants/theme.ts  (GAME_THEME_PATH o el path por defecto)
 *
 * Uso: npm run sync:themes
 *
 * Por qué así: el sitio no inventa colores. Si el juego cambia una paleta,
 * se corre esto y el sitio se entera. El JSON generado se commitea para que
 * el build no dependa del repo del juego.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const GAME_THEME =
  process.env.GAME_THEME_PATH ??
  'C:\\Users\\javie\\Desktop\\proyectos\\tap-and-build\\src\\constants\\theme.ts';

const OUT = resolve('src/data/themes.json');

/** Los 8 que van al sitio: máximamente distintos y con marca coherente. */
// Orden: claros arriba, oscuros abajo. El primero es el default del sitio.
const SELECTION = [
  { name: 'Cream Vanilla', slug: 'cream-vanilla', tier: 'free' },
  { name: 'Sky Pop', slug: 'sky-pop', tier: 'free' },
  { name: 'Mint Bubble', slug: 'mint-bubble', tier: 'free' },
  { name: 'Solar Flare', slug: 'solar-flare', tier: 'referral' },
  { name: 'Royal Gold', slug: 'royal-gold', tier: 'free' },
  { name: 'Sunset Orange', slug: 'sunset-orange', tier: 'supporter' },
  { name: 'Midnight Purple', slug: 'midnight-purple', tier: 'supporter' },
  { name: 'Cyber Executive', slug: 'cyber-executive', tier: 'builder' },
];

const WANTED_COLORS = [
  'background',
  'backgroundCard',
  'surface',
  'primary',
  'text',
  'textMuted',
  'secondary',
];

const src = await readFile(GAME_THEME, 'utf8');
const blocks = [...src.matchAll(/export const (THEME_[A-Z_]+): Theme = \{([\s\S]*?)\n\};/g)];

/** Cuántos temas expone el juego (ALL_THEMES), no cuántos pude parsear. */
const allThemesBlock = src.match(/export const ALL_THEMES: Theme\[\] = \[([\s\S]*?)\];/)?.[1] ?? '';
const totalInGame = [...allThemesBlock.matchAll(/THEME_[A-Z_]+/g)].length;

const byName = new Map();
for (const [, , body] of blocks) {
  const name = body.match(/name:\s*'([^']+)'/)?.[1];
  if (!name) continue;
  const colors = Object.fromEntries(
    [...body.matchAll(/(\w+):\s*'(#[0-9A-Fa-f]{6})'/g)].map(([, k, v]) => [k, v])
  );
  if (!colors.background || !colors.primary) continue;
  const picked = {};
  for (const key of WANTED_COLORS) if (colors[key]) picked[key] = colors[key].toUpperCase();
  byName.set(name, picked);
}

const missing = SELECTION.filter((s) => !byName.has(s.name)).map((s) => s.name);
if (missing.length) {
  console.error(`No encontré en el juego: ${missing.join(', ')}`);
  process.exit(1);
}

const themes = SELECTION.map(({ name, slug, tier }) => ({
  name,
  slug,
  tier,
  colors: byName.get(name),
}));

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ source: GAME_THEME, totalInGame, themes }, null, 2) + '\n',
  'utf8'
);

console.log(`themes.json: ${themes.length} temas del sitio, ${totalInGame} en el juego`);
for (const t of themes) console.log(`  ${t.slug.padEnd(18)} ${t.colors.background} ${t.colors.primary}`);
