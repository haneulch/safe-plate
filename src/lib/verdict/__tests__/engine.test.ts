import { describe, expect, it } from 'vitest';
import { judgeMenu, judgeRestaurant } from '../engine';
import { EMPTY_PROFILE, type Menu, type Profile } from '../../types';
import { reasonText } from '../reasons';

const profile = (p: Partial<Profile>): Profile => ({ ...EMPTY_PROFILE, ...p });
const curated = { source: 'curated', confidence: 'high' } as const;
const menu = (m: Partial<Menu>): Menu => ({ name: { ko: '테스트' }, tags: [], inference: curated, ...m });

const codes = (v: ReturnType<typeof judgeMenu>) => v.reasons.map((r) => r.reason.code);

describe('allergens', () => {
  it('contained allergen → red', () => {
    const v = judgeMenu(profile({ alg: ['peanut'] }), menu({ tags: ['peanut'] }));
    expect(v.level).toBe('r');
    expect(codes(v)).toContain('contain');
  });
  it('adjustable allergen → yellow', () => {
    const v = judgeMenu(profile({ alg: ['egg'] }), menu({ tags: ['egg'], adjustable: ['egg'] }));
    expect(v.level).toBe('y');
    expect(codes(v)).toContain('adjust');
  });
  it('cross-contact allergen → yellow', () => {
    const v = judgeMenu(profile({ alg: ['peanut'] }), menu({ tags: ['soy'], cross: ['peanut'] }));
    expect(v.level).toBe('y');
    expect(codes(v)).toContain('cross');
  });
});

describe('halal', () => {
  it('pork → red', () => {
    expect(judgeMenu(profile({ rel: ['halal'] }), menu({ tags: ['pork'] })).level).toBe('r');
  });
  it('halalOk → green with halalOk reason', () => {
    const v = judgeMenu(profile({ rel: ['halal'] }), menu({ tags: ['chicken'], halalOk: true }));
    expect(v.level).toBe('g');
    expect(codes(v)).toContain('halalOk');
  });
  it('uncertified meat → yellow slaughter check', () => {
    const v = judgeMenu(profile({ rel: ['halal'] }), menu({ tags: ['beef'] }));
    expect(v.level).toBe('y');
    expect(codes(v)).toContain('halalCheck');
  });
});

describe('kosher', () => {
  it('shellfish → red', () => {
    expect(judgeMenu(profile({ rel: ['kosher'] }), menu({ tags: ['shellfish'] })).level).toBe('r');
  });
  it('meat + dairy → red koMix', () => {
    const v = judgeMenu(profile({ rel: ['kosher'] }), menu({ tags: ['beef', 'milk'] }));
    expect(v.level).toBe('r');
    expect(codes(v)).toContain('koMix');
  });
});

describe('buddhist / vegan / vegetarian / pesco', () => {
  it('buddhist: pungent → red', () => {
    expect(judgeMenu(profile({ rel: ['buddhist'] }), menu({ tags: ['pungent'] })).level).toBe('r');
  });
  it('vegan: egg → red', () => {
    expect(judgeMenu(profile({ rel: ['vegan'] }), menu({ tags: ['egg'] })).level).toBe('r');
  });
  it('vegan: veganOk → green', () => {
    expect(judgeMenu(profile({ rel: ['vegan'] }), menu({ tags: [], veganOk: true })).level).toBe('g');
  });
  it('vegi: fish → red', () => {
    expect(judgeMenu(profile({ rel: ['vegi'] }), menu({ tags: ['fish'] })).level).toBe('r');
  });
  it('pesco: seafood → green, land meat → red', () => {
    expect(judgeMenu(profile({ rel: ['pesco'] }), menu({ tags: ['fish'] })).level).toBe('g');
    expect(judgeMenu(profile({ rel: ['pesco'] }), menu({ tags: ['pork'] })).level).toBe('r');
  });
});

describe('conditions', () => {
  it('sodium: high → yellow, low → green note', () => {
    expect(judgeMenu(profile({ cond: ['sodium'] }), menu({ sodium: 'high' })).level).toBe('y');
    const v = judgeMenu(profile({ cond: ['sodium'] }), menu({ sodium: 'low' }));
    expect(v.level).toBe('g');
    expect(codes(v)).toContain('naLow');
  });
  it('gluten: wheat → red, soy → yellow soy-sauce check', () => {
    expect(judgeMenu(profile({ cond: ['gluten'] }), menu({ tags: ['wheat'] })).level).toBe('r');
    const v = judgeMenu(profile({ cond: ['gluten'] }), menu({ tags: ['soy'] }));
    expect(v.level).toBe('y');
    expect(codes(v)).toContain('gluSoy');
  });
  it('gout purine / lipid fat / gerd spicy → yellow', () => {
    expect(judgeMenu(profile({ cond: ['gout'] }), menu({ purine: 'high' })).level).toBe('y');
    expect(judgeMenu(profile({ cond: ['lipid'] }), menu({ fat: 'high' })).level).toBe('y');
    expect(judgeMenu(profile({ cond: ['gerd'] }), menu({ spicy: 'high' })).level).toBe('y');
  });
});

describe('defaults & low confidence', () => {
  it('empty profile → green none', () => {
    const v = judgeMenu(profile({}), menu({ tags: ['pork', 'wheat'] }));
    expect(v.level).toBe('g');
    expect(codes(v)).toEqual(['none']);
  });
  it('inferred (non-high confidence) green is bumped to yellow with lowConfidence', () => {
    const v = judgeMenu(
      profile({ alg: ['peanut'] }),
      menu({ tags: [], inference: { source: 'keyword', confidence: 'low' } }),
    );
    expect(v.level).toBe('y');
    expect(codes(v)).toContain('lowConfidence');
  });
  it('inferred menu with no profile restrictions stays green', () => {
    const v = judgeMenu(profile({}), menu({ tags: [], inference: { source: 'keyword', confidence: 'low' } }));
    expect(v.level).toBe('g');
  });
  it('inferred red stays red (no bump needed)', () => {
    const v = judgeMenu(
      profile({ alg: ['peanut'] }),
      menu({ tags: ['peanut'], inference: { source: 'keyword', confidence: 'medium' } }),
    );
    expect(v.level).toBe('r');
  });
});

describe('judgeRestaurant', () => {
  const menus = [
    menu({ tags: ['pork'] }),
    menu({ tags: [], vegiOk: true, veganOk: true }),
    menu({ tags: ['beef'] }),
  ];
  it('aggregates levels', () => {
    const v = judgeRestaurant(profile({ rel: ['vegan'] }), menus);
    expect(v).toEqual({ level: 'g', safe: 1, cond: 0, avoid: 2 });
  });
  it('no safe menu → overall red', () => {
    const v = judgeRestaurant(profile({ rel: ['vegan'] }), [menu({ tags: ['pork'] })]);
    expect(v.level).toBe('r');
  });
});

describe('reasonText', () => {
  it('resolves parameterized codes in every language', () => {
    for (const lang of ['ko', 'en', 'ja', 'zh', 'ar'] as const) {
      const txt = reasonText({ code: 'contain', tag: 'peanut' }, lang);
      expect(txt.length).toBeGreaterThan(0);
      expect(txt).toContain('<b>');
    }
  });
  it('ko contain includes Korean tag label', () => {
    expect(reasonText({ code: 'contain', tag: 'peanut' }, 'ko')).toContain('땅콩');
  });
});
