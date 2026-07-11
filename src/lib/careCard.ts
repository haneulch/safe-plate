import type { Profile } from './types';
import { ALLERGENS, SPOKEN_LANGS } from './i18n/labels';

export interface KoRestrictions {
  no: string[];
  caution: string[];
}

/** Korean restriction chips shown to restaurant staff (ported from demo). */
export function koRestrictions(profile: Profile): KoRestrictions {
  const no: string[] = [];
  const caution: string[] = [];
  profile.alg.forEach((a) => {
    const item = ALLERGENS.find((x) => x.id === a);
    if (item) no.push(item.label.ko.split('(')[0].trim());
  });
  if (profile.rel.includes('halal')) no.push('돼지고기', '술(요리술 포함)');
  if (profile.rel.includes('kosher')) {
    no.push('돼지고기', '새우·게·조개');
    caution.push('고기+유제품 함께 ✕');
  }
  if (profile.rel.includes('hindu')) no.push('쇠고기');
  if (profile.rel.includes('buddhist')) no.push('고기', '생선', '마늘·파(오신채)');
  if (profile.rel.includes('vegan')) no.push('고기', '생선', '계란', '우유·유제품');
  if (profile.rel.includes('vegi')) no.push('고기', '생선', '고기 육수');
  if (profile.rel.includes('pesco')) no.push('고기(생선은 괜찮아요)');
  if (profile.cond.includes('sodium')) caution.push('짠 음식 · 국물 (나트륨)');
  if (profile.cond.includes('sugar')) caution.push('단 음식 (당류)');
  if (profile.cond.includes('gout')) caution.push('내장 · 진한 육수 · 해산물 (퓨린)');
  if (profile.cond.includes('lipid')) caution.push('기름진 음식 · 튀김');
  if (profile.cond.includes('gerd')) caution.push('맵고 자극적인 음식');
  if (profile.cond.includes('gluten')) no.push('밀가루(글루텐)');
  return { no: [...new Set(no)], caution };
}

/** Korean labels of the traveler's spoken languages. */
export function koSpokenLangs(profile: Profile): string[] {
  return profile.langs
    .map((id) => SPOKEN_LANGS.find((l) => l.id === id)?.ko)
    .filter((x): x is string => !!x);
}

/** Stable pseudo card number derived from the profile (client-side flourish). */
export function cardNo(profile: Profile): string {
  const seed = [profile.nation ?? '', ...profile.alg, ...profile.rel, ...profile.cond].join('');
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return 'SP-2026-' + String(1000 + (h % 9000));
}

/** Plain-text payload for the card QR — the Korean restrictions themselves (no URL, nothing leaves the device). */
export function qrPayload(profile: Profile): string {
  const { no, caution } = koRestrictions(profile);
  const parts = ['SafePlate 식이 제약'];
  if (no.length) parts.push('먹을 수 없어요: ' + no.join(', '));
  if (caution.length) parts.push('주의: ' + caution.join(', '));
  if (profile.etc.trim()) parts.push('기타: ' + profile.etc.trim());
  return parts.join('\n');
}
