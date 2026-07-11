import type { ReasonCode, UiLang } from '../types';
import { getStrings } from '../i18n';
import { tagLabel } from '../i18n/labels';

/**
 * Resolve a ReasonCode to a localized string. May contain <b> markup
 * (static app-owned content only — see Strings doc).
 */
export function reasonText(reason: ReasonCode, lang: UiLang): string {
  const s = getStrings(lang);
  switch (reason.code) {
    case 'contain':
      return s.r_contain(tagLabel(reason.tag, lang));
    case 'adjust':
      return s.r_adjust(tagLabel(reason.tag, lang));
    case 'cross':
      return s.r_cross(tagLabel(reason.tag, lang));
    case 'pork': return s.r_pork;
    case 'halalOk': return s.r_halalOk;
    case 'halalCheck': return s.r_halalCheck;
    case 'koNo': return s.r_koNo;
    case 'koMix': return s.r_koMix;
    case 'koCheck': return s.r_koCheck;
    case 'hindu': return s.r_hindu;
    case 'hinduCheck': return s.r_hinduCheck;
    case 'flesh': return s.r_flesh;
    case 'pungent': return s.r_pungent;
    case 'pungentCheck': return s.r_pungentCheck;
    case 'veganNo': return s.r_veganNo;
    case 'veganOk': return s.r_veganOk;
    case 'vegiOk': return s.r_vegiOk;
    case 'vegiCheck': return s.r_vegiCheck;
    case 'pescoNo': return s.r_pescoNo;
    case 'naHigh': return s.r_naHigh;
    case 'naLow': return s.r_naLow;
    case 'suHigh': return s.r_suHigh;
    case 'suLow': return s.r_suLow;
    case 'purine': return s.r_purine;
    case 'fat': return s.r_fat;
    case 'spicy': return s.r_spicy;
    case 'glu': return s.r_glu;
    case 'gluSoy': return s.r_gluSoy;
    case 'none': return s.r_none;
    case 'lowConfidence': return s.r_lowConfidence;
  }
}
