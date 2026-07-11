import type { Confidence, Menu, MenuTag } from '../types';
import { DISH_RULES, KEYWORD_RULES, type DishAttrs } from './dictionary';
import { matchNutrition } from '../nutrition/match';

export interface MenuTagInferrer {
  /** Infer menus from raw TourAPI menu text (firstmenu / treatmenu). */
  infer(menuText: string): Promise<Menu[]>;
}

const MAX_MENUS = 10;

/** Split TourAPI menu text into candidate dish names. */
export function splitMenuText(text: string): string[] {
  const seen = new Set<string>();
  return text
    .replace(/[0-9,]+원|₩[0-9,]+/g, ' ') // strip prices before splitting (they contain commas)
    .split(/[,/·|、\n()（）]+/)
    .map((s) => s.replace(/\s{2,}/g, ' ').trim())
    .filter((s) => s.length >= 2 && s.length <= 30)
    .filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    })
    .slice(0, MAX_MENUS);
}

const dishRulesByLength = DISH_RULES.flatMap((rule) =>
  rule.keywords.map((kw) => ({ kw, rule })),
).sort((a, b) => b.kw.length - a.kw.length);

export function inferDish(name: string): Menu {
  const tags = new Set<MenuTag>();
  let attrs: DishAttrs = {};
  let confidence: Confidence = 'low';
  const matched: string[] = [];
  const lower = name.toLowerCase(); // English/romanized keywords are stored lowercase

  const dishHit = dishRulesByLength.find(({ kw }) => lower.includes(kw));
  if (dishHit) {
    confidence = 'medium';
    matched.push(dishHit.kw);
    attrs = { ...dishHit.rule };
    dishHit.rule.tags?.forEach((t) => tags.add(t));
  }

  for (const rule of KEYWORD_RULES) {
    const kw = rule.keywords.find((k) => lower.includes(k));
    if (!kw) continue;
    matched.push(kw);
    if (rule.tag) tags.add(rule.tag);
    if (rule.attrs) attrs = { ...rule.attrs, ...attrs }; // dish rule wins on conflicts
  }

  // MFDS nutrition DB fills grades the hand-tuned rules didn't set
  // (rules keep priority — they encode consumption context, e.g. drinking soup broth).
  const nutri = matchNutrition(name);

  return {
    name: { ko: name },
    tags: [...tags],
    sodium: attrs.sodium ?? nutri?.sodium,
    sugar: attrs.sugar ?? nutri?.sugar,
    fat: attrs.fat ?? nutri?.fat,
    purine: attrs.purine,
    spicy: attrs.spicy,
    vegiOk: attrs.vegiOk,
    veganOk: attrs.veganOk,
    inference: { source: 'keyword', confidence, matched: nutri ? [...matched, 'mfds-db'] : matched },
  };
}

export class KeywordInferrer implements MenuTagInferrer {
  async infer(menuText: string): Promise<Menu[]> {
    return splitMenuText(menuText).map(inferDish);
  }
}

export const defaultInferrer: MenuTagInferrer = new KeywordInferrer();
