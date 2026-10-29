import locales from '../data/locales.json';
import routes from '../data/routes.json';
import en from '../data/copy/en.json';
import es from '../data/copy/es.json';
import de from '../data/copy/de.json';
import ru from '../data/copy/ru.json';
import pt from '../data/copy/pt.json';

export const LOCALES = locales;
export const LOCALE_CODES = locales.map((locale) => locale.code);
export const DEFAULT_LOCALE = 'en';

const COPY = { en, es, de, ru, pt };

export function getCopy(code) {
  return COPY[code] ?? COPY[DEFAULT_LOCALE];
}

export function localeMeta(code) {
  return locales.find((locale) => locale.code === code) ?? locales[0];
}

export function pathFor(pageKey, code) {
  return routes[pageKey]?.[code] ?? routes[pageKey]?.[DEFAULT_LOCALE] ?? '/';
}

/** Todos los alternates de una página, incluido el x-default. */
export function alternates(pageKey) {
  return LOCALE_CODES.map((code) => ({ code, path: pathFor(pageKey, code) }));
}
