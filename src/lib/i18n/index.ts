import type { UiLang, Localized } from '../types';
import type { Strings } from './strings';
import { ko } from './ko';
import { en } from './en';
import { ja } from './ja';
import { zh } from './zh';
import { ar } from './ar';

export type { Strings };

export const STRINGS: Record<UiLang, Strings> = { ko, en, ja, zh, ar };

export const UI_LANGS: UiLang[] = ['ko', 'en', 'ja', 'zh', 'ar'];

export function isUiLang(x: string | undefined | null): x is UiLang {
  return !!x && (UI_LANGS as string[]).includes(x);
}

export function getStrings(lang: UiLang): Strings {
  return STRINGS[lang] ?? STRINGS.en;
}

export function dirFor(lang: UiLang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Resolve a Localized object for the given UI language (en → ko fallback). */
export function loc(obj: Localized, lang: UiLang): string {
  return obj[lang] ?? obj.en ?? obj.ko;
}

export const LANG_COOKIE = 'safeplate.lang';
