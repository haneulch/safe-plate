import { describe, expect, it } from 'vitest';
import { inferDish, splitMenuText, KeywordInferrer } from '../menuTags';

describe('splitMenuText', () => {
  it('splits on commas, slashes and middle dots', () => {
    expect(splitMenuText('사골 칼국수, 왕만두 / 콩국수 · 비빔밥')).toEqual([
      '사골 칼국수',
      '왕만두',
      '콩국수',
      '비빔밥',
    ]);
  });
  it('drops prices, dedups, caps at 10', () => {
    const out = splitMenuText('칼국수 9,000원, 칼국수, ' + Array.from({ length: 15 }, (_, i) => `메뉴${i}`).join(', '));
    expect(out[0]).toBe('칼국수');
    expect(out.filter((x) => x === '칼국수')).toHaveLength(1);
    expect(out.length).toBeLessThanOrEqual(10);
  });
  it('tolerates empty input', () => {
    expect(splitMenuText('')).toEqual([]);
  });
});

describe('inferDish', () => {
  it('dish rule: 칼국수 → wheat, medium confidence', () => {
    const m = inferDish('사골 칼국수');
    expect(m.tags).toContain('wheat');
    expect(m.inference?.confidence).toBe('medium');
    expect(m.inference?.source).toBe('keyword');
  });
  it('dish rule: 왕만두 → wheat + pork', () => {
    const m = inferDish('왕만두');
    expect(m.tags).toEqual(expect.arrayContaining(['wheat', 'pork']));
  });
  it('longest match wins: 치즈닭갈비 gets milk, 닭갈비 does not', () => {
    expect(inferDish('치즈닭갈비').tags).toContain('milk');
    expect(inferDish('닭갈비').tags).not.toContain('milk');
  });
  it('keyword-only match → low confidence', () => {
    const m = inferDish('훈제 연어 플래터');
    expect(m.tags).toContain('fish');
    expect(m.inference?.confidence).toBe('low');
  });
  it('ingredient keywords add tags on top of dish rule', () => {
    const m = inferDish('치즈 돈까스');
    expect(m.tags).toEqual(expect.arrayContaining(['pork', 'wheat', 'egg', 'milk']));
  });
  it('unknown dish → no tags, low confidence', () => {
    const m = inferDish('오늘의 스페셜');
    expect(m.tags).toEqual([]);
    expect(m.inference?.confidence).toBe('low');
  });
  it('English menu text from multilingual services gets tags', () => {
    expect(inferDish("Braised pigs' feet").tags).toContain('pork');
    expect(inferDish('Real garlic jokbal').tags).toEqual(expect.arrayContaining(['pork', 'pungent']));
    expect(inferDish('Chicken biryani').tags).toContain('chicken');
    expect(inferDish('Cheese tteokbokki').tags).toEqual(expect.arrayContaining(['milk', 'wheat']));
  });
  it('Japanese menu text gets tags; 牛乳 is milk not beef', () => {
    expect(inferDish('サムギョプサルなど').tags).toContain('pork');
    expect(inferDish('硫黄鴨燻製しゃぶしゃぶ').tags).toEqual([]); // duck: no false tags
    expect(inferDish('どじょうスープ').tags).toContain('fish');
    const gyunyu = inferDish('牛乳プリン');
    expect(gyunyu.tags).toContain('milk');
    expect(gyunyu.tags).not.toContain('beef');
  });
  it('Chinese menu text gets tags; 排骨 → generic meat', () => {
    expect(inferDish('辣炖排骨').tags).toContain('meat');
    expect(inferDish('辣炖排骨').spicy).toBe('high');
    expect(inferDish('海鲜葱煎饼').tags).toEqual(expect.arrayContaining(['wheat', 'pungent']));
    expect(inferDish('参鸡汤').tags).toContain('chicken');
  });
  it('전복죽 does not false-match 전(pancake) rule', () => {
    const m = inferDish('전복죽');
    expect(m.tags).not.toContain('wheat');
    expect(m.tags).toContain('mollusk');
  });
});

describe('KeywordInferrer', () => {
  it('infers a full menu text', async () => {
    const menus = await new KeywordInferrer().infer('칼국수, 왕만두, 낙지볶음');
    expect(menus).toHaveLength(3);
    expect(menus[2].tags).toContain('mollusk');
    expect(menus[2].spicy).toBe('high');
  });
});
