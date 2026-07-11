import { NUTRITION_DB, type NutritionGrades } from './db';

/**
 * Longest-match lookup of a menu name against MFDS representative dishes.
 * DB is pre-sorted longest-name-first, so the first hit is the longest.
 */
export function matchNutrition(menuName: string): NutritionGrades | undefined {
  const name = menuName.replace(/\s+/g, '');
  for (const [dish, grades] of NUTRITION_DB) {
    if (name.includes(dish)) return grades;
  }
  return undefined;
}
