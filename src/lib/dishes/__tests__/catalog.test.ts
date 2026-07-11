import { describe, expect, it } from 'vitest';
import { DISH_CATALOG, DISH_CATEGORIES } from '../catalog';
import { judgeMenu } from '../../verdict/engine';
import { EMPTY_PROFILE } from '../../types';

describe('DISH_CATALOG integrity', () => {
  it('every dish has ko+en names, valid category, curated inference', () => {
    DISH_CATALOG.forEach((d) => {
      expect(d.name.ko.length).toBeGreaterThan(0);
      expect(d.name.en && d.name.en.length).toBeTruthy();
      expect(DISH_CATEGORIES).toContain(d.cat);
      expect(d.inference?.confidence).toBe('high');
    });
  });
  it('has no duplicate ko names', () => {
    const names = DISH_CATALOG.map((d) => d.name.ko);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('catalog judgments', () => {
  it('vegan profile: temple cuisine green, samgyeopsal red', () => {
    const vegan = { ...EMPTY_PROFILE, rel: ['vegan' as const] };
    const temple = DISH_CATALOG.find((d) => d.name.ko === '사찰음식')!;
    const pork = DISH_CATALOG.find((d) => d.name.ko === '삼겹살')!;
    expect(judgeMenu(vegan, temple).level).toBe('g');
    expect(judgeMenu(vegan, pork).level).toBe('r');
  });
  it('vegan profile has at least 5 safe dishes', () => {
    const vegan = { ...EMPTY_PROFILE, rel: ['vegan' as const] };
    const safe = DISH_CATALOG.filter((d) => judgeMenu(vegan, d).level === 'g');
    expect(safe.length).toBeGreaterThanOrEqual(5);
  });
  it('halal profile has safe drink options (halalOk)', () => {
    const halal = { ...EMPTY_PROFILE, rel: ['halal' as const] };
    const safe = DISH_CATALOG.filter((d) => judgeMenu(halal, d).level === 'g');
    expect(safe.some((d) => d.name.ko === '식혜')).toBe(true);
  });
});
