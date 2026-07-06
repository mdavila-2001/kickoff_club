import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Registro idempotente: garantiza los locales aunque este módulo
// sea el primero en usarse (p. ej. entrando directo a /matches).
countries.registerLocale(esLocale);
countries.registerLocale(enLocale);

const UK_COUNTRIES_MAP: Record<string, { es: string; en: string; code: string }> = {
  inglaterra: { es: 'Inglaterra', en: 'England', code: 'GB-ENG' },
  england: { es: 'Inglaterra', en: 'England', code: 'GB-ENG' },
  escocia: { es: 'Escocia', en: 'Scotland', code: 'GB-SCT' },
  scotland: { es: 'Escocia', en: 'Scotland', code: 'GB-SCT' },
  gales: { es: 'Gales', en: 'Wales', code: 'GB-WLS' },
  wales: { es: 'Gales', en: 'Wales', code: 'GB-WLS' },
  'irlanda del norte': { es: 'Irlanda del Norte', en: 'Northern Ireland', code: 'GB-NIR' },
  'northern ireland': { es: 'Irlanda del Norte', en: 'Northern Ireland', code: 'GB-NIR' },
};

export function getCountryCode(name: string, lang: 'es' | 'en'): string | undefined {
  const normalized = name.trim().toLowerCase();
  if (UK_COUNTRIES_MAP[normalized]) {
    return UK_COUNTRIES_MAP[normalized].code;
  }
  return countries.getAlpha2Code(name, lang);
}

export function getCountryName(code: string, lang: 'es' | 'en'): string | undefined {
  const normalizedCode = code.toUpperCase();
  const found = Object.values(UK_COUNTRIES_MAP).find((c) => c.code === normalizedCode);
  if (found) {
    return lang === 'es' ? found.es : found.en;
  }
  return countries.getName(code, lang);
}

/**
 * Traduce el nombre de un país (normalmente en inglés, como lo entrega
 * la API) a español. Si no se reconoce, devuelve el nombre original.
 */
export function getSpanishCountryName(name: string): string {
  const code = getCountryCode(name, 'en') ?? getCountryCode(name, 'es');
  if (!code) return name;
  return getCountryName(code, 'es') ?? name;
}
