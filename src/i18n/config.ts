// Временно только английский (ru и kk отложены)
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  // ru: 'Русский',    // отложено
  // kk: 'Қазақша',    // отложено
};
