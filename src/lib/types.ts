export type UiLang = 'ko' | 'en' | 'ja' | 'zh' | 'ar';
export type Level = 'g' | 'y' | 'r';
export type Grade = 'low' | 'mid' | 'high';

export type MenuTag =
  | 'pork'
  | 'beef'
  | 'chicken'
  | 'meat'
  | 'fish'
  | 'shellfish'
  | 'mollusk'
  | 'egg'
  | 'milk'
  | 'wheat'
  | 'buckwheat'
  | 'soy'
  | 'peanut'
  | 'nut'
  | 'alcohol'
  | 'pungent';

export type ConditionId = 'sodium' | 'sugar' | 'gout' | 'lipid' | 'gerd' | 'gluten';
export type ReligiousId = 'halal' | 'kosher' | 'hindu' | 'buddhist' | 'vegan' | 'vegi' | 'pesco';
/** Invariant inherited from the demo: allergen ids are ingredient tag ids. */
export type AllergenId = Extract<
  MenuTag,
  | 'peanut' | 'nut' | 'shellfish' | 'mollusk' | 'fish' | 'milk' | 'egg'
  | 'wheat' | 'buckwheat' | 'soy' | 'pork' | 'beef' | 'chicken'
>;

export interface Profile {
  nation: string | null;
  langs: string[];
  cond: ConditionId[];
  alg: AllergenId[];
  rel: ReligiousId[];
  etc: string;
  onboarded: boolean;
}

export const EMPTY_PROFILE: Profile = {
  nation: null,
  langs: [],
  cond: [],
  alg: [],
  rel: [],
  etc: '',
  onboarded: false,
};

export type Localized = Partial<Record<UiLang, string>> & { ko: string };

export type InferenceSource = 'curated' | 'keyword' | 'ai';
export type Confidence = 'high' | 'medium' | 'low';

export interface MenuInference {
  source: InferenceSource;
  confidence: Confidence;
  matched?: string[];
}

export interface Menu {
  name: Localized;
  price?: string;
  tags: MenuTag[];
  sodium?: Grade;
  sugar?: Grade;
  fat?: Grade;
  purine?: Grade;
  spicy?: Grade;
  adjustable?: MenuTag[];
  cross?: MenuTag[];
  halalOk?: boolean;
  vegiOk?: boolean;
  veganOk?: boolean;
  inference?: MenuInference;
}

/** TourAPI cat3-based food category (A0502xx). */
export type FoodCat = 'korean' | 'western' | 'japanese' | 'chinese' | 'unique' | 'cafe' | 'etc';

export interface RestaurantSummary {
  id: string;
  name: Localized;
  cat: Localized;
  foodCat?: FoodCat;
  lat: number;
  lng: number;
  distanceM?: number;
  imageUrl?: string;
  source: 'tourapi' | 'mock';
  halalCert?: boolean;
  /** TourAPI service the record came from. Multilingual services are sparse
   *  outside tourist zones, so lists may fall back to the ko service —
   *  detail fetches must then use the same service (contentIds differ). */
  svcLang?: UiLang;
}

export interface RestaurantDetail extends RestaurantSummary {
  address?: Localized;
  tel?: string;
  overview?: Localized;
  menus: Menu[];
}

export type ReasonCode =
  | { code: 'contain' | 'adjust' | 'cross'; tag: MenuTag }
  | {
      code:
        | 'pork' | 'halalOk' | 'halalCheck'
        | 'koNo' | 'koMix' | 'koCheck'
        | 'hindu' | 'hinduCheck'
        | 'flesh' | 'pungent' | 'pungentCheck'
        | 'veganNo' | 'veganOk' | 'vegiOk' | 'vegiCheck' | 'pescoNo'
        | 'naHigh' | 'naLow' | 'suHigh' | 'suLow'
        | 'purine' | 'fat' | 'spicy' | 'glu' | 'gluSoy'
        | 'none' | 'lowConfidence';
    };

export interface Reason {
  level: Level;
  reason: ReasonCode;
}

export interface Verdict {
  level: Level;
  reasons: Reason[];
}

export interface RestaurantVerdict {
  level: Level;
  safe: number;
  cond: number;
  avoid: number;
}

export interface RestaurantsResponse {
  restaurants: RestaurantSummary[];
  source: 'tourapi' | 'mock';
  degraded?: boolean;
}

export interface RestaurantDetailResponse {
  restaurant: RestaurantDetail;
  source: 'tourapi' | 'mock';
  degraded?: boolean;
}
