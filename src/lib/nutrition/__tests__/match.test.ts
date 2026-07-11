import { describe, expect, it } from 'vitest';
import { matchNutrition } from '../match';
import { NUTRITION_DB } from '../db';
import { inferDish } from '../../inference/menuTags';

describe('NUTRITION_DB', () => {
  it('has entries sorted longest-first (longest-match invariant)', () => {
    for (let i = 1; i < NUTRITION_DB.length; i++) {
      expect(NUTRITION_DB[i - 1][0].length).toBeGreaterThanOrEqual(NUTRITION_DB[i][0].length);
    }
  });
  it('every entry has at least one grade', () => {
    NUTRITION_DB.forEach(([, g]) => {
      expect(g.sodium || g.sugar || g.fat).toBeTruthy();
    });
  });
});

describe('matchNutrition', () => {
  it('matches known dishes ignoring spaces', () => {
    expect(matchNutrition('김치찌개')).toBeDefined();
    expect(matchNutrition('사골 칼국수')).toBeDefined();
  });
  it('unknown dish → undefined', () => {
    expect(matchNutrition('완전히없는요리명xyz')).toBeUndefined();
  });
});

describe('inferDish + nutrition fill', () => {
  it('hand-tuned rule grades keep priority over DB', () => {
    // dish rule sets 칼국수 sodium:'high' (broth consumption context)
    expect(inferDish('칼국수').sodium).toBe('high');
  });
  it('DB fills grades for dishes without rule grades', () => {
    const m = inferDish('피자');
    // dish rule 피자 sets sodium/fat high already — check matched marker instead on rule-less dish
    const noRule = inferDish('갈비탕집 갈비탕');
    expect(noRule.sodium).toBeDefined();
    expect(m.fat).toBe('high');
  });
  it('marks mfds-db in matched when DB used', () => {
    const m = inferDish('김치찌개');
    expect(m.inference?.matched).toContain('mfds-db');
  });
});
