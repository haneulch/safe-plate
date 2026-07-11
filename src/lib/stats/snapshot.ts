import type { Profile } from '../types';
import { CONDITIONS, ALLERGENS, RELIGIOUS, NATIONS, SPOKEN_LANGS } from '../i18n/labels';

/**
 * Anonymized profile-selection snapshot for aggregate statistics.
 * Whitelist-only: no free text (etc may contain personal info), no location,
 * no identifiers. Field values are validated against the known id sets.
 */
export interface StatsSnapshot {
  v: 1;
  nation: string | null;
  langs: string[];
  cond: string[];
  alg: string[];
  rel: string[];
  /** whether the user wrote free-text notes (content itself is never sent) */
  hasEtc: boolean;
}

const NATION_IDS = new Set(NATIONS.map((n) => n.id));
const LANG_IDS = new Set(SPOKEN_LANGS.map((l) => l.id));
const COND_IDS = new Set(CONDITIONS.map((c) => c.id as string));
const ALG_IDS = new Set(ALLERGENS.map((a) => a.id as string));
const REL_IDS = new Set(RELIGIOUS.map((r) => r.id as string));

export function toSnapshot(profile: Profile): StatsSnapshot {
  return {
    v: 1,
    nation: profile.nation,
    langs: profile.langs,
    cond: profile.cond,
    alg: profile.alg,
    rel: profile.rel,
    hasEtc: profile.etc.trim().length > 0,
  };
}

/** Validate/sanitize an incoming payload. Returns null if unusable. */
export function sanitizeSnapshot(input: unknown): StatsSnapshot | null {
  if (typeof input !== 'object' || input === null) return null;
  const o = input as Record<string, unknown>;
  if (o.v !== 1) return null;
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
  if (nation === undefined || !langs || !cond || !alg || !rel) return null;
  return { v: 1, nation, langs, cond, alg, rel, hasEtc: o.hasEtc === true };
}
