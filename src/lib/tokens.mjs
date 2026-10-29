/**
 * Matemática de color y derivación de tokens semánticos.
 *
 * La idea: el juego define 19 colores con nombres de juego (prestige, gold...).
 * El sitio sólo necesita roles. Acá se traduce, se corrige el contraste y se
 * calcula lo que el juego no define (tinta del botón, color de acción, bordes).
 */

const hex = (h) => h.replace('#', '').toUpperCase();

export function parse(h) {
  const s = hex(h);
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}

export function toHex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export function luminance(color) {
  const [r, g, b] = parse(color).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla lineal en sRGB. t=0 deja a, t=1 devuelve b. */
export function mix(a, b, t) {
  const A = parse(a);
  const B = parse(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}

const INK_DARK = '#141008';
const INK_LIGHT = '#FFFFFF';

/** Empuja `color` hacia el extremo opuesto al fondo hasta llegar al mínimo. */
export function readable(color, background, min = 4.5) {
  if (contrast(color, background) >= min) return color;
  const target = luminance(background) > 0.35 ? '#000000' : '#FFFFFF';
  for (let t = 0.05; t <= 1; t += 0.05) {
    const candidate = mix(color, target, t);
    if (contrast(candidate, background) >= min) return candidate;
  }
  return target;
}

/** Tinta con más contraste sobre un relleno. */
export function bestInk(fill) {
  return contrast(INK_DARK, fill) >= contrast(INK_LIGHT, fill) ? INK_DARK : INK_LIGHT;
}

/**
 * Construye los tokens semánticos del sitio a partir de un tema del juego.
 * Devuelve { tokens, diagnostics }.
 */
export function buildTokens(theme) {
  const c = theme.colors;
  const bg = c.background;
  const isDark = luminance(bg) < 0.2;

  const text = readable(c.text ?? (isDark ? '#FFFFFF' : '#111111'), bg, 7);
  const muted = readable(c.textMuted ?? mix(text, bg, 0.45), bg, 4.5);
  const primary = c.primary;
  const onPrimary = bestInk(primary);
  const action = readable(primary, bg, 4.5);
  const actionHover = mix(action, isDark ? '#FFFFFF' : '#000000', 0.16);
  const upColor = isDark ? '#4ADE80' : '#0F7B3F';

  const tokens = {
    bg,
    surface: c.backgroundCard ?? mix(bg, text, isDark ? 0.06 : 0.04),
    'surface-2': c.surface ?? mix(bg, text, isDark ? 0.1 : 0.07),
    text,
    muted,
    border: mix(text, bg, 0.82),
    primary,
    'on-primary': onPrimary,
    action,
    'action-hover': actionHover,
    focus: action,
    up: upColor,
    'on-up': bestInk(upColor),
    down: isDark ? '#F87171' : '#B42318',
  };

  const diagnostics = {
    isDark,
    textBg: contrast(text, bg),
    mutedBg: contrast(muted, bg),
    onPrimaryPrimary: contrast(onPrimary, primary),
    actionBg: contrast(action, bg),
    upBg: contrast(tokens.up, bg),
    onUpUp: contrast(tokens['on-up'], tokens.up),
    downBg: contrast(tokens.down, bg),
  };

  return { tokens, diagnostics };
}

/** Nombre de archivo seguro para el atributo data-theme. */
export const themeSlug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
