import type {
  Level,
  Menu,
  Profile,
  Reason,
  RestaurantVerdict,
  Verdict,
} from '../types';

const LAND = ['pork', 'beef', 'chicken', 'meat'] as const;
const SEA = ['fish', 'shellfish', 'mollusk'] as const;

/**
 * Judge a single menu against a profile. Pure; returns ReasonCodes (no i18n).
 * Ported from the demo's judgeMenu with one addition: menus whose tags were
 * auto-inferred (confidence !== 'high') are never shown as confident green —
 * they get bumped to yellow with a lowConfidence reason.
 */
export function judgeMenu(profile: Profile, m: Menu): Verdict {
  const reasons: Reason[] = [];
  let level: Level = 'g';
  const bump = (l: Level) => {
    if (l === 'r') level = 'r';
    else if (l === 'y' && level !== 'r') level = 'y';
  };
  const has = (x: string) => (m.tags as string[]).includes(x);
  const hasAny = (arr: readonly string[]) => arr.some(has);

  /* allergens: profile ids == ingredient tag ids */
  profile.alg.forEach((a) => {
    if (has(a)) {
      if (m.adjustable && m.adjustable.includes(a)) {
        bump('y');
        reasons.push({ level: 'y', reason: { code: 'adjust', tag: a } });
      } else {
        bump('r');
        reasons.push({ level: 'r', reason: { code: 'contain', tag: a } });
      }
    } else if (m.cross && m.cross.includes(a)) {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'cross', tag: a } });
    }
  });

  /* halal: pork/alcohol out; other meat needs slaughter check */
  if (profile.rel.includes('halal')) {
    if (has('pork') || has('alcohol')) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'pork' } });
    } else if (m.halalOk) {
      reasons.push({ level: 'g', reason: { code: 'halalOk' } });
    } else if (hasAny(LAND)) {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'halalCheck' } });
    }
  }
  /* kosher: pork/shellfish/mollusk out; meat+dairy mix out; meat needs kosher check */
  if (profile.rel.includes('kosher')) {
    if (has('pork') || has('shellfish') || has('mollusk')) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'koNo' } });
    } else if (hasAny(LAND) && has('milk')) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'koMix' } });
    } else if (hasAny(LAND)) {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'koCheck' } });
    }
  }
  /* hindu: beef out; generic meat needs species check */
  if (profile.rel.includes('hindu')) {
    if (has('beef')) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'hindu' } });
    } else if (has('meat')) {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'hinduCheck' } });
    }
  }
  /* buddhist temple diet: no flesh, no pungent vegetables */
  if (profile.rel.includes('buddhist')) {
    if (hasAny(LAND) || hasAny(SEA)) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'flesh' } });
    } else if (has('pungent')) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'pungent' } });
    } else if (m.veganOk) {
      reasons.push({ level: 'g', reason: { code: 'vegiOk' } });
    } else {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'pungentCheck' } });
    }
  }
  /* vegan: no flesh, no egg/dairy */
  if (profile.rel.includes('vegan')) {
    if (hasAny(LAND) || hasAny(SEA)) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'flesh' } });
    } else if (has('egg') || has('milk')) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'veganNo' } });
    } else if (m.veganOk) {
      reasons.push({ level: 'g', reason: { code: 'veganOk' } });
    } else {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'vegiCheck' } });
    }
  }
  /* lacto-ovo vegetarian */
  if (profile.rel.includes('vegi')) {
    if (hasAny(LAND) || hasAny(SEA)) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'flesh' } });
    } else if (m.vegiOk || m.veganOk) {
      reasons.push({ level: 'g', reason: { code: 'vegiOk' } });
    } else {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'vegiCheck' } });
    }
  }
  /* pescatarian: land meat out, seafood fine */
  if (profile.rel.includes('pesco')) {
    if (hasAny(LAND)) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'pescoNo' } });
    } else if (!hasAny(SEA) && !m.vegiOk && !m.veganOk) {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'vegiCheck' } });
    }
  }

  if (profile.cond.includes('sodium')) {
    if (m.sodium === 'high') {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'naHigh' } });
    } else if (m.sodium === 'low') {
      reasons.push({ level: 'g', reason: { code: 'naLow' } });
    }
  }
  if (profile.cond.includes('sugar')) {
    if (m.sugar === 'high') {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'suHigh' } });
    } else if (m.sugar === 'low') {
      reasons.push({ level: 'g', reason: { code: 'suLow' } });
    }
  }
  if (profile.cond.includes('gout') && m.purine === 'high') {
    bump('y');
    reasons.push({ level: 'y', reason: { code: 'purine' } });
  }
  if (profile.cond.includes('lipid') && m.fat === 'high') {
    bump('y');
    reasons.push({ level: 'y', reason: { code: 'fat' } });
  }
  if (profile.cond.includes('gerd') && m.spicy === 'high') {
    bump('y');
    reasons.push({ level: 'y', reason: { code: 'spicy' } });
  }
  if (profile.cond.includes('gluten')) {
    if (has('wheat')) {
      bump('r');
      reasons.push({ level: 'r', reason: { code: 'glu' } });
    } else if (has('soy')) {
      bump('y');
      reasons.push({ level: 'y', reason: { code: 'gluSoy' } });
    }
  }

  /* inferred menus never pass as confident green */
  const inferred = m.inference && m.inference.confidence !== 'high';
  if (inferred && level === 'g' && hasRestrictions(profile)) {
    level = 'y';
    reasons.push({ level: 'y', reason: { code: 'lowConfidence' } });
  }

  if (reasons.length === 0) reasons.push({ level: 'g', reason: { code: 'none' } });
  return { level, reasons };
}

export function hasRestrictions(profile: Profile): boolean {
  return profile.cond.length + profile.alg.length + profile.rel.length > 0;
}

export function judgeRestaurant(profile: Profile, menus: Menu[]): RestaurantVerdict {
  const vs = menus.map((m) => judgeMenu(profile, m));
  const safe = vs.filter((v) => v.level === 'g').length;
  const cond = vs.filter((v) => v.level === 'y').length;
  const avoid = vs.filter((v) => v.level === 'r').length;
  const level: Level = safe > 0 ? 'g' : cond > 0 ? 'y' : 'r';
  return { level, safe, cond, avoid };
}
