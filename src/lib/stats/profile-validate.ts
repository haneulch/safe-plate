import type { Profile } from '../types';
import { CONDITIONS, ALLERGENS, RELIGIOUS, NATIONS, SPOKEN_LANGS } from '../i18n/labels';

/**
 * /api/profile PUT 입력 검증. snapshot.ts와 같은 whitelist 방식.
 * etc는 사용자가 자기 프로필에 보관하는 자유텍스트라 허용하되 길이만 제한.
 */
const NATION_IDS = new Set(NATIONS.map((n) => n.id));
const LANG_IDS = new Set(SPOKEN_LANGS.map((l) => l.id));
const COND_IDS = new Set(CONDITIONS.map((c) => c.id as string));
const ALG_IDS = new Set(ALLERGENS.map((a) => a.id as string));
const REL_IDS = new Set(RELIGIOUS.map((r) => r.id as string));
const MAX_ETC = 500;

export function sanitizeProfile(input: unknown): Profile | null {
  if (typeof input !== 'object' || input === null) return null;
  const o = input as Record<string, unknown>;
  const pick = (val: unknown, allowed: Set<string>, max: number): string[] | null => {
    if (!Array.isArray(val) || val.length > max) return null;
    const out = val.filter((x): x is string => typeof x === 'string' && allowed.has(x));
    return out.length === val.length ? [...new Set(out)] : null;
  };
  const nation =
    o.nation === null ? null : typeof o.nation === 'string' && NATION_IDS.has(o.nation) ? o.nation : undefined;
  const langs = pick(o.langs, LANG_IDS, 10);
  const cond = pick(o.cond, COND_IDS, 6);
  const alg = pick(o.alg, ALG_IDS, 13);
  const rel = pick(o.rel, REL_IDS, 7);
  const etc = typeof o.etc === 'string' && o.etc.length <= MAX_ETC ? o.etc : null;
  if (nation === undefined || !langs || !cond || !alg || !rel || etc === null) return null;
  return {
    nation,
    langs,
    cond: cond as Profile['cond'],
    alg: alg as Profile['alg'],
    rel: rel as Profile['rel'],
    etc,
    onboarded: o.onboarded === true,
  };
}
