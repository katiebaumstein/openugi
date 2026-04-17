export const locales = ["en", "zh", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (locales as readonly string[]).includes(x);
}

export const localeNames: Record<Locale, string> = {
  en: "🇬🇧 English",
  zh: "🇨🇳 中文",
  ar: "🇸🇦 العربية",
};

export const LOCALE_COOKIE = "openugi-locale";

export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}
