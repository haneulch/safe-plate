import { HALAL_SEED, type HalalSeedEntry } from './seed';

/**
 * Normalize a Korean shop name for fuzzy matching:
 * drop parenthesized aliases, spaces, punctuation; lowercase latin.
 */
export function normalizeName(name: string): string {
  return name
    .replace(/\([^)]*\)|（[^）]*）/g, '')
    .replace(/[\s\-·&.,'"!?]/g, '')
    .toLowerCase();
}

interface IndexEntry {
  key: string;
  entry: HalalSeedEntry;
}

const INDEX: IndexEntry[] = HALAL_SEED.flatMap((entry) => {
  const keys = new Set<string>([normalizeName(entry.name)]);
  // Parenthesized alias becomes its own key: "FORTUNE(파르투네)" → fortune, 파르투네
  const alias = entry.name.match(/\(([^)]+)\)/)?.[1];
  if (alias) keys.add(normalizeName(alias));
  return [...keys].filter(Boolean).map((key) => ({ key, entry }));
});

/**
 * Match a TourAPI restaurant against the halal seed.
 * Name must match (normalized, substring either way for 지점명 suffixes);
 * when an address is available it must mention the seed's region (시)
 * to avoid same-name collisions across cities.
 */
export function matchHalalSeed(title: string, address?: string): HalalSeedEntry | undefined {
  const t = normalizeName(title);
  if (t.length < 2) return undefined;
  for (const { key, entry } of INDEX) {
    if (key.length < 2) continue;
    const nameHit = t === key || (key.length >= 3 && t.includes(key)) || (t.length >= 3 && key.includes(t));
    if (!nameHit) continue;
    if (address && !address.includes(entry.region.replace(/시$/, ''))) continue;
    return entry;
  }
  return undefined;
}
