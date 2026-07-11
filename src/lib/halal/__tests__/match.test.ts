import { describe, expect, it } from 'vitest';
import { matchHalalSeed, normalizeName } from '../match';
import { HALAL_SEED } from '../seed';

describe('normalizeName', () => {
  it('drops spaces, punctuation, parenthesized aliases', () => {
    expect(normalizeName('할랄 인디안 레스토랑')).toBe('할랄인디안레스토랑');
    expect(normalizeName('FORTUNE(파르투네)')).toBe('fortune');
    expect(normalizeName('KB케밥&닭강정')).toBe('kb케밥닭강정');
  });
});

describe('matchHalalSeed', () => {
  it('exact seed name matches', () => {
    expect(matchHalalSeed('할랄 인디안 레스토랑')?.region).toBe('김포시');
  });
  it('parenthesized alias matches', () => {
    expect(matchHalalSeed('파르투네')?.name).toContain('FORTUNE');
  });
  it('branch-suffix name still matches (substring)', () => {
    expect(matchHalalSeed('안나푸르나 레스토랑 부천점')?.region).toBe('부천시');
  });
  it('address region gate blocks cross-city collision', () => {
    expect(matchHalalSeed('뉴델리', '서울시 중구 어딘가 1')).toBeUndefined();
    expect(matchHalalSeed('뉴델리', '고양시 덕양구 화신로272번길 29')?.cuisine).toBe('인도식');
  });
  it('no address → name-only match allowed', () => {
    expect(matchHalalSeed('뉴델리')).toBeDefined();
  });
  it('unrelated name → no match', () => {
    expect(matchHalalSeed('명동손칼국수')).toBeUndefined();
  });
  it('seed has all 51 entries with required fields', () => {
    expect(HALAL_SEED).toHaveLength(51);
    HALAL_SEED.forEach((e) => {
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.region.endsWith('시')).toBe(true);
    });
  });
});
