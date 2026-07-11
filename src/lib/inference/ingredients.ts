import type { Menu, MenuTag } from '../types';

/**
 * Parse a processed-food ingredient statement (C002 RAWMTRL_NM / product label)
 * into ingredient tags. Label text is authoritative — Korea mandates labeling
 * of 22 allergens — so confidence is 'high' unless the text is empty.
 */

const INGREDIENT_TAGS: ReadonlyArray<readonly [MenuTag, readonly string[]]> = [
  ['wheat', ['밀', '밀가루', '소맥', '소맥분', '글루텐', '빵가루', '면류']],
  ['buckwheat', ['메밀']],
  ['soy', ['대두', '콩', '두유', '된장', '간장', '춘장', '서리태', '백태']],
  ['peanut', ['땅콩', '낙화생']],
  ['nut', ['호두', '잣', '아몬드', '캐슈', '헤이즐넛', '마카다미아', '피칸', '견과']],
  ['egg', ['계란', '달걀', '난백', '난황', '전란', '알류']],
  ['milk', ['우유', '유청', '유크림', '탈지분유', '전지분유', '치즈', '버터', '연유', '유당', '카제인', '요구르트']],
  ['pork', ['돼지고기', '돈육', '돼지', '베이컨', '햄', '소시지', '라드', '젤라틴(돼지)']],
  ['beef', ['쇠고기', '소고기', '우육', '사골']],
  ['chicken', ['닭고기', '계육', '치킨']],
  ['fish', ['고등어', '멸치', '참치', '연어', '명태', '대구', '어육', '가다랑어', '황태', '북어']],
  ['shellfish', ['새우', '게', '꽃게', '대게', '랍스터', '크릴']],
  ['mollusk', ['오징어', '조개', '굴', '홍합', '전복', '바지락', '문어', '낙지']],
  ['alcohol', ['주정', '알코올', '알콜', '와인', '맥주', '럼']],
  ['pungent', ['마늘', '양파', '대파', '부추', '파분말']],
];

export interface ParsedIngredients {
  tags: MenuTag[];
  /** allergens from a cross-contamination clause ("같은 제조시설…") */
  cross: MenuTag[];
  /** ingredient words that triggered each tag (for display) */
  matched: string[];
}

/** Splits off the cross-contamination advisory clause from the ingredient list. */
const CROSS_CLAUSE = /([^.·]*(?:같은\s*(?:제조\s*)?시설|교차\s*오염|혼입\s*가능)[^.·]*)/;

function scanTags(text: string, tags: Set<MenuTag>, matched: string[]) {
  for (const [tag, words] of INGREDIENT_TAGS) {
    const hit = words.find((w) => text.includes(w));
    if (hit) {
      tags.add(tag);
      matched.push(hit);
    }
  }
}

export function parseIngredients(text: string): ParsedIngredients {
  if (!text.trim()) return { tags: [], cross: [], matched: [] };
  const crossClause = text.match(CROSS_CLAUSE)?.[1] ?? '';
  const mainText = crossClause ? text.replace(crossClause, ' ') : text;

  const tags = new Set<MenuTag>();
  const crossTags = new Set<MenuTag>();
  const matched: string[] = [];
  scanTags(mainText, tags, matched);
  scanTags(crossClause, crossTags, matched);
  // an allergen both contained and in the advisory counts as contained
  const cross = [...crossTags].filter((t) => !tags.has(t));
  return { tags: [...tags], cross, matched };
}

/** Build a judgeable Menu from a product name + ingredient statement. */
export function productToMenu(nameKo: string, ingredientText: string): Menu {
  const { tags, cross, matched } = parseIngredients(ingredientText);
  return {
    name: { ko: nameKo },
    tags,
    cross: cross.length ? cross : undefined,
    inference: {
      source: 'curated', // label-declared, not guessed from a dish name
      confidence: ingredientText.trim() ? 'high' : 'low',
      matched,
    },
  };
}
