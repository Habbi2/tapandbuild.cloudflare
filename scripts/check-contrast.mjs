/**
 * Valida el contraste de todos los temas y emite src/styles/themes.css.
 *
 * Falla el build si algún tema no llega a AA en texto, texto suave, botón o acción.
 * Corre antes de `astro build` (ver package.json).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildTokens } from '../src/lib/tokens.mjs';

const DATA = resolve('src/data/themes.json');
const CSS = resolve('src/styles/themes.css');

const MIN = { text: 4.5, muted: 4.5, onPrimary: 4.5, action: 4.5, up: 4.5, down: 4.5, onUp: 4.5 };

const { themes } = JSON.parse(await readFile(DATA, 'utf8'));
if (!themes?.length) {
  console.error('themes.json vacío. Corré `npm run sync:themes`.');
  process.exit(1);
}

const rows = [];
const failures = [];
const blocks = [];

for (const theme of themes) {
  const { tokens, diagnostics } = buildTokens(theme);

  const checks = {
    text: diagnostics.textBg,
    muted: diagnostics.mutedBg,
    onPrimary: diagnostics.onPrimaryPrimary,
    action: diagnostics.actionBg,
    up: diagnostics.upBg,
    down: diagnostics.downBg,
    onUp: diagnostics.onUpUp,
  };
  for (const [key, value] of Object.entries(checks)) {
    if (value < MIN[key]) {
      failures.push(`${theme.slug}: ${key} = ${value.toFixed(2)} (< ${MIN[key]})`);
    }
  }

  rows.push({
    slug: theme.slug,
    tier: theme.tier,
    mode: diagnostics.isDark ? 'oscuro' : 'claro',
    texto: checks.text.toFixed(2),
    suave: checks.muted.toFixed(2),
    boton: checks.onPrimary.toFixed(2),
    accion: checks.action.toFixed(2),
  });

  blocks.push({ slug: theme.slug, tokens });
}

const declarations = (tokens) =>
  Object.entries(tokens)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');

const css = [
  '/* Generado por scripts/check-contrast.mjs. No editar a mano. */',
  '',
  `:root,\n[data-theme='${blocks[0].slug}'] {\n${declarations(blocks[0].tokens)}\n}`,
  '',
  ...blocks.slice(1).map(({ slug, tokens }) => `[data-theme='${slug}'] {\n${declarations(tokens)}\n}`),
  '',
].join('\n');

await writeFile(CSS, css, 'utf8');

console.table(rows);
console.log(`\ntemas.css: ${themes.length} temas (default: ${blocks[0].slug})`);

if (failures.length) {
  console.error('\nContraste insuficiente:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('Contraste: todos los temas pasan AA.');
