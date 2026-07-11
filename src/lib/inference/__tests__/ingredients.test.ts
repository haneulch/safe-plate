import { describe, expect, it } from 'vitest';
import { parseIngredients, productToMenu } from '../ingredients';
import { judgeMenu } from '../../verdict/engine';
import { EMPTY_PROFILE } from '../../types';

describe('parseIngredients', () => {
  it('tags labeled allergens', () => {
    const p = parseIngredients('밀가루(밀:미국산), 설탕, 전지분유(우유), 계란, 대두레시틴');
    expect(p.tags).toEqual(expect.arrayContaining(['wheat', 'milk', 'egg', 'soy']));
    expect(p.cross).toEqual([]);
  });
  it('cross-contamination clause → cross, not contain', () => {
    const p = parseIngredients(
      '밀가루, 설탕 · 이 제품은 땅콩, 호두를 사용한 제품과 같은 제조시설에서 제조하고 있습니다',
    );
    expect(p.tags).toContain('wheat');
    expect(p.tags).not.toContain('peanut');
    expect(p.cross).toEqual(expect.arrayContaining(['peanut', 'nut']));
  });
  it('contained allergen wins over advisory mention', () => {
    const p = parseIngredients('땅콩버터, 설탕 · 땅콩을 사용한 제품과 같은 제조시설');
    expect(p.tags).toContain('peanut');
    expect(p.cross).not.toContain('peanut');
  });
  it('empty text → nothing', () => {
    expect(parseIngredients('')).toEqual({ tags: [], cross: [], matched: [] });
  });
});

describe('productToMenu + judge', () => {
  it('peanut-allergy profile: cross-contact product → yellow cross reason', () => {
    const menu = productToMenu('데모 초코 쿠키', '밀가루, 우유 · 땅콩을 사용한 제품과 같은 제조시설에서 제조');
    const v = judgeMenu({ ...EMPTY_PROFILE, alg: ['peanut'] }, menu);
    expect(v.level).toBe('y');
    expect(v.reasons.some((r) => r.reason.code === 'cross')).toBe(true);
  });
  it('milk allergy: contains 전지분유 → red', () => {
    const menu = productToMenu('쿠키', '밀가루, 전지분유(우유)');
    expect(judgeMenu({ ...EMPTY_PROFILE, alg: ['milk'] }, menu).level).toBe('r');
  });
  it('empty ingredients → low confidence menu', () => {
    expect(productToMenu('미상 제품', '').inference?.confidence).toBe('low');
  });
});
