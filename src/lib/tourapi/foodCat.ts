import type { FoodCat, Localized, UiLang } from '../types';

/** TourAPI 음식점 소분류(cat3) → app food category. Shared taxonomy across language services. */
const CAT3_MAP: Record<string, FoodCat> = {
  A05020100: 'korean',
  A05020200: 'western',
  A05020300: 'japanese',
  A05020400: 'chinese',
  A05020700: 'unique',
  A05020900: 'cafe',
};

export function foodCatFromCat3(cat3?: string): FoodCat {
  return (cat3 && CAT3_MAP[cat3]) || 'etc';
}

export const FOOD_CAT_LABEL: Record<FoodCat, Record<UiLang, string>> = {
  korean: { ko: '한식', en: 'Korean', ja: '韓国料理', zh: '韩餐', ar: 'كوري' },
  western: { ko: '양식', en: 'Western', ja: '洋食', zh: '西餐', ar: 'غربي' },
  japanese: { ko: '일식', en: 'Japanese', ja: '和食', zh: '日餐', ar: 'ياباني' },
  chinese: { ko: '중식', en: 'Chinese', ja: '中華', zh: '中餐', ar: 'صيني' },
  unique: { ko: '이색·아시안', en: 'Ethnic & Fusion', ja: 'エスニック', zh: '特色·亚洲', ar: 'أطباق عالمية' },
  cafe: { ko: '카페·베이커리', en: 'Cafe & Bakery', ja: 'カフェ・ベーカリー', zh: '咖啡·烘焙', ar: 'مقهى ومخبز' },
  etc: { ko: '음식점', en: 'Restaurant', ja: '飲食店', zh: '餐厅', ar: 'مطعم' },
};

/** Filterable categories shown as chips (etc excluded — it's the unlabeled bucket). */
export const FOOD_CAT_FILTERS: FoodCat[] = ['korean', 'cafe', 'japanese', 'chinese', 'western', 'unique'];

export function foodCatLocalized(cat: FoodCat): Localized {
  return { ...FOOD_CAT_LABEL[cat] };
}
