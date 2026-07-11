import type { Localized, Menu, UiLang } from '../types';

export type DishCategory =
  | 'rice'
  | 'noodle'
  | 'soup'
  | 'meat'
  | 'seafood'
  | 'snack'
  | 'veggie'
  | 'dessert';

export const DISH_CATEGORIES: DishCategory[] = [
  'rice',
  'noodle',
  'soup',
  'meat',
  'seafood',
  'snack',
  'veggie',
  'dessert',
];

export const CATEGORY_LABEL: Record<DishCategory, Record<UiLang, string>> = {
  rice: { ko: '밥류', en: 'Rice', ja: 'ご飯もの', zh: '米饭类', ar: 'أطباق الأرز' },
  noodle: { ko: '면류', en: 'Noodles', ja: '麺類', zh: '面类', ar: 'المعكرونة' },
  soup: { ko: '국·탕·찌개', en: 'Soups & Stews', ja: 'スープ・鍋', zh: '汤·炖菜', ar: 'الشوربات' },
  meat: { ko: '고기 요리', en: 'Meat', ja: '肉料理', zh: '肉类', ar: 'اللحوم' },
  seafood: { ko: '해산물', en: 'Seafood', ja: '海鮮', zh: '海鲜', ar: 'المأكولات البحرية' },
  snack: { ko: '분식·간식', en: 'Street Food', ja: '軽食・屋台', zh: '小吃', ar: 'وجبات خفيفة' },
  veggie: { ko: '채소·사찰', en: 'Vegetable', ja: '野菜・精進', zh: '蔬菜类', ar: 'الخضروات' },
  dessert: { ko: '디저트·음료', en: 'Dessert & Drinks', ja: 'デザート・飲み物', zh: '甜点·饮品', ar: 'الحلويات والمشروبات' },
};

export interface CatalogDish extends Menu {
  cat: DishCategory;
  name: Localized; // ko required; ar falls back to en automatically
}

const c = { source: 'curated', confidence: 'high' } as const;

/**
 * Curated catalog of common Korean dishes for the "what can I eat" screen.
 * Tags/grades hand-checked against the inference dictionary and MFDS DB.
 */
export const DISH_CATALOG: CatalogDish[] = [
  /* ── rice ── */
  { cat: 'rice', name: { ko: '비빔밥', en: 'Bibimbap', ja: 'ビビンバ', zh: '拌饭' }, tags: ['egg', 'beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'mid', adjustable: ['egg', 'beef'], inference: c },
  { cat: 'rice', name: { ko: '산채비빔밥', en: 'Wild-greens bibimbap', ja: '山菜ビビンバ', zh: '山菜拌饭' }, tags: ['egg', 'soy'], sodium: 'low', sugar: 'low', vegiOk: true, adjustable: ['egg'], inference: c },
  { cat: 'rice', name: { ko: '김밥', en: 'Gimbap', ja: 'キンパ', zh: '紫菜包饭' }, tags: ['egg', 'fish', 'soy'], sodium: 'mid', sugar: 'low', adjustable: ['egg'], inference: c },
  { cat: 'rice', name: { ko: '버섯 돌솥밥', en: 'Mushroom hot-pot rice', ja: 'キノコ釜飯', zh: '蘑菇石锅饭' }, tags: [], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: c },
  { cat: 'rice', name: { ko: '콩나물국밥', en: 'Bean-sprout rice soup', ja: '豆もやしクッパ', zh: '豆芽汤饭' }, tags: ['egg', 'soy', 'pungent'], sodium: 'high', sugar: 'low', adjustable: ['egg'], inference: c },
  { cat: 'rice', name: { ko: '전복죽', en: 'Abalone porridge', ja: 'アワビ粥', zh: '鲍鱼粥' }, tags: ['mollusk'], sodium: 'low', sugar: 'low', purine: 'high', inference: c },
  { cat: 'rice', name: { ko: '야채죽', en: 'Vegetable porridge', ja: '野菜粥', zh: '蔬菜粥' }, tags: [], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: c },
  { cat: 'rice', name: { ko: '김치볶음밥', en: 'Kimchi fried rice', ja: 'キムチチャーハン', zh: '泡菜炒饭' }, tags: ['egg', 'pork', 'pungent'], sodium: 'high', sugar: 'low', spicy: 'high', adjustable: ['egg', 'pork'], inference: c },
  /* ── noodle ── */
  { cat: 'noodle', name: { ko: '칼국수', en: 'Kalguksu (knife-cut noodles)', ja: 'カルグクス', zh: '刀削面' }, tags: ['wheat', 'pungent'], sodium: 'high', sugar: 'low', inference: c },
  { cat: 'noodle', name: { ko: '콩국수', en: 'Cold soy-milk noodles', ja: '豆乳素麺', zh: '豆浆面' }, tags: ['wheat', 'soy'], sodium: 'low', sugar: 'low', vegiOk: true, inference: c },
  { cat: 'noodle', name: { ko: '물냉면', en: 'Cold buckwheat noodles', ja: '水冷麺', zh: '冷面' }, tags: ['buckwheat', 'beef', 'egg'], sodium: 'mid', sugar: 'low', adjustable: ['egg'], inference: c },
  { cat: 'noodle', name: { ko: '막국수', en: 'Makguksu (buckwheat noodles)', ja: 'マッククス', zh: '荞麦凉面' }, tags: ['buckwheat', 'egg', 'pungent'], sodium: 'mid', sugar: 'mid', adjustable: ['egg'], inference: c },
  { cat: 'noodle', name: { ko: '잔치국수', en: 'Banquet noodles', ja: 'にゅうめん', zh: '喜面' }, tags: ['wheat', 'egg', 'pungent'], sodium: 'high', sugar: 'low', inference: c },
  { cat: 'noodle', name: { ko: '짜장면', en: 'Jjajangmyeon (black-bean noodles)', ja: 'ジャージャー麺', zh: '炸酱面' }, tags: ['wheat', 'pork', 'pungent'], sodium: 'mid', sugar: 'high', inference: c },
  { cat: 'noodle', name: { ko: '짬뽕', en: 'Jjamppong (spicy seafood noodles)', ja: 'チャンポン', zh: '什锦海鲜面' }, tags: ['wheat', 'shellfish', 'mollusk', 'pork', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high', inference: c },
  { cat: 'noodle', name: { ko: '우동', en: 'Udon', ja: 'うどん', zh: '乌冬面' }, tags: ['wheat', 'fish'], sodium: 'high', sugar: 'low', inference: c },
  /* ── soup ── */
  { cat: 'soup', name: { ko: '삼계탕', en: 'Samgye-tang (ginseng chicken soup)', ja: '参鶏湯', zh: '参鸡汤' }, tags: ['chicken', 'pungent'], sodium: 'mid', sugar: 'low', purine: 'high', inference: c },
  { cat: 'soup', name: { ko: '설렁탕', en: 'Seolleongtang (ox-bone soup)', ja: 'ソルロンタン', zh: '牛骨汤' }, tags: ['beef', 'pungent'], sodium: 'high', purine: 'high', inference: c },
  { cat: 'soup', name: { ko: '갈비탕', en: 'Galbi-tang (short-rib soup)', ja: 'カルビタン', zh: '排骨汤' }, tags: ['beef', 'pungent'], sodium: 'high', purine: 'high', inference: c },
  { cat: 'soup', name: { ko: '미역국', en: 'Seaweed soup', ja: 'わかめスープ', zh: '海带汤' }, tags: ['beef', 'soy'], sodium: 'mid', sugar: 'low', adjustable: ['beef'], inference: c },
  { cat: 'soup', name: { ko: '된장찌개', en: 'Doenjang-jjigae (soybean-paste stew)', ja: 'テンジャンチゲ', zh: '大酱汤' }, tags: ['soy', 'pungent'], sodium: 'high', sugar: 'low', vegiOk: true, inference: c },
  { cat: 'soup', name: { ko: '김치찌개', en: 'Kimchi-jjigae (kimchi stew)', ja: 'キムチチゲ', zh: '泡菜汤' }, tags: ['pork', 'pungent'], sodium: 'high', spicy: 'high', fat: 'high', inference: c },
  { cat: 'soup', name: { ko: '순두부찌개', en: 'Sundubu-jjigae (soft-tofu stew)', ja: 'スンドゥブチゲ', zh: '嫩豆腐汤' }, tags: ['soy', 'egg', 'mollusk', 'pungent'], sodium: 'high', spicy: 'high', adjustable: ['egg', 'mollusk'], inference: c },
  { cat: 'soup', name: { ko: '부대찌개', en: 'Budae-jjigae (sausage stew)', ja: 'プデチゲ', zh: '部队锅' }, tags: ['pork', 'wheat', 'pungent'], sodium: 'high', spicy: 'high', fat: 'high', inference: c },
  { cat: 'soup', name: { ko: '감자탕', en: 'Gamja-tang (pork-back-bone stew)', ja: 'カムジャタン', zh: '土豆猪骨汤' }, tags: ['pork', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high', fat: 'high', inference: c },
  { cat: 'soup', name: { ko: '육개장', en: 'Yukgaejang (spicy beef soup)', ja: 'ユッケジャン', zh: '辣牛肉汤' }, tags: ['beef', 'pungent'], sodium: 'high', spicy: 'high', inference: c },
  /* ── meat ── */
  { cat: 'meat', name: { ko: '불고기', en: 'Bulgogi', ja: 'プルコギ', zh: '烤牛肉' }, tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: c },
  { cat: 'meat', name: { ko: '삼겹살', en: 'Samgyeopsal (pork belly BBQ)', ja: 'サムギョプサル', zh: '烤五花肉' }, tags: ['pork'], sodium: 'mid', sugar: 'low', fat: 'high', inference: c },
  { cat: 'meat', name: { ko: '갈비찜', en: 'Braised short ribs', ja: 'カルビチム', zh: '炖排骨' }, tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: c },
  { cat: 'meat', name: { ko: '닭갈비', en: 'Dak-galbi (spicy chicken)', ja: 'タッカルビ', zh: '铁板鸡' }, tags: ['chicken', 'pungent'], sodium: 'mid', sugar: 'high', spicy: 'high', inference: c },
  { cat: 'meat', name: { ko: '한국식 치킨', en: 'Korean fried chicken', ja: '韓国チキン', zh: '韩式炸鸡' }, tags: ['chicken', 'wheat'], sodium: 'high', sugar: 'high', fat: 'high', inference: c },
  { cat: 'meat', name: { ko: '제육볶음', en: 'Spicy stir-fried pork', ja: '豚肉炒め', zh: '辣炒猪肉' }, tags: ['pork', 'pungent'], sodium: 'high', sugar: 'high', spicy: 'high', fat: 'high', inference: c },
  { cat: 'meat', name: { ko: '보쌈', en: 'Bossam (boiled pork wraps)', ja: 'ポッサム', zh: '菜包肉' }, tags: ['pork', 'pungent'], sodium: 'mid', fat: 'high', inference: c },
  { cat: 'meat', name: { ko: '떡갈비', en: 'Tteok-galbi (grilled patties)', ja: 'トックカルビ', zh: '年糕排骨' }, tags: ['beef', 'pork', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: c },
  /* ── seafood ── */
  { cat: 'seafood', name: { ko: '해물파전', en: 'Seafood scallion pancake', ja: '海鮮チヂミ', zh: '海鲜葱饼' }, tags: ['shellfish', 'mollusk', 'wheat', 'egg', 'pungent'], sodium: 'mid', inference: c },
  { cat: 'seafood', name: { ko: '생선구이', en: 'Grilled fish', ja: '焼き魚', zh: '烤鱼' }, tags: ['fish'], sodium: 'mid', purine: 'high', inference: c },
  { cat: 'seafood', name: { ko: '회 (생선회)', en: 'Hoe (raw fish)', ja: '刺身', zh: '生鱼片' }, tags: ['fish'], sodium: 'low', inference: c },
  { cat: 'seafood', name: { ko: '낙지볶음', en: 'Spicy stir-fried octopus', ja: 'ナクチポックム', zh: '辣炒章鱼' }, tags: ['mollusk', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high', inference: c },
  { cat: 'seafood', name: { ko: '간장게장', en: 'Soy-marinated crab', ja: 'カンジャンケジャン', zh: '酱蟹' }, tags: ['shellfish', 'soy'], sodium: 'high', purine: 'high', inference: c },
  /* ── snack ── */
  { cat: 'snack', name: { ko: '떡볶이', en: 'Tteokbokki (spicy rice cakes)', ja: 'トッポッキ', zh: '辣炒年糕' }, tags: ['wheat', 'fish', 'soy', 'pungent'], sodium: 'high', sugar: 'high', spicy: 'high', inference: c },
  { cat: 'snack', name: { ko: '순대', en: 'Sundae (blood sausage)', ja: 'スンデ', zh: '血肠' }, tags: ['pork'], sodium: 'mid', purine: 'high', inference: c },
  { cat: 'snack', name: { ko: '고기만두', en: 'Meat dumplings', ja: '肉まんじゅう', zh: '肉饺子' }, tags: ['wheat', 'pork', 'pungent'], sodium: 'mid', fat: 'high', inference: c },
  { cat: 'snack', name: { ko: '호떡', en: 'Hotteok (sweet pancake)', ja: 'ホットク', zh: '糖饼' }, tags: ['wheat', 'nut'], sugar: 'high', vegiOk: true, inference: c },
  { cat: 'snack', name: { ko: '붕어빵', en: 'Bungeoppang (fish-shaped bun)', ja: 'たい焼き', zh: '鲫鱼饼' }, tags: ['wheat', 'egg', 'milk'], sugar: 'high', vegiOk: true, inference: c },
  /* ── veggie ── */
  { cat: 'veggie', name: { ko: '산채정식', en: 'Wild-greens set meal', ja: '山菜定食', zh: '山菜套餐' }, tags: [], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: c },
  { cat: 'veggie', name: { ko: '사찰음식', en: 'Temple cuisine', ja: '精進料理', zh: '寺庙素斋' }, tags: [], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: c },
  { cat: 'veggie', name: { ko: '두부조림', en: 'Braised tofu', ja: '豆腐の煮付け', zh: '烧豆腐' }, tags: ['soy', 'pungent'], sodium: 'mid', sugar: 'low', vegiOk: true, veganOk: true, inference: c },
  { cat: 'veggie', name: { ko: '버섯전골', en: 'Mushroom hot pot', ja: 'キノコ鍋', zh: '蘑菇火锅' }, tags: ['pungent'], sodium: 'mid', sugar: 'low', vegiOk: true, inference: c },
  { cat: 'veggie', name: { ko: '나물비빔밥 (계란 제외)', en: 'Namul bibimbap (no egg)', ja: 'ナムルビビンバ（卵抜き）', zh: '素拌饭（无蛋）' }, tags: ['soy', 'pungent'], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: c },
  /* ── dessert ── */
  { cat: 'dessert', name: { ko: '팥빙수', en: 'Patbingsu (shaved ice)', ja: 'パッピンス', zh: '红豆刨冰' }, tags: ['milk'], sugar: 'high', vegiOk: true, inference: c },
  { cat: 'dessert', name: { ko: '약과', en: 'Yakgwa (honey cookie)', ja: '薬菓', zh: '药果' }, tags: ['wheat'], sugar: 'high', vegiOk: true, inference: c },
  { cat: 'dessert', name: { ko: '인절미', en: 'Injeolmi (soybean rice cake)', ja: 'きなこ餅', zh: '黄豆糕' }, tags: ['soy'], sugar: 'mid', vegiOk: true, veganOk: true, inference: c },
  { cat: 'dessert', name: { ko: '식혜', en: 'Sikhye (sweet rice drink)', ja: 'シッケ', zh: '甜米露' }, tags: [], sugar: 'high', vegiOk: true, veganOk: true, halalOk: true, inference: c },
  { cat: 'dessert', name: { ko: '오미자차', en: 'Omija tea', ja: '五味子茶', zh: '五味子茶' }, tags: [], sugar: 'mid', vegiOk: true, veganOk: true, halalOk: true, inference: c },
  { cat: 'dessert', name: { ko: '유자차', en: 'Yuja (citron) tea', ja: 'ゆず茶', zh: '柚子茶' }, tags: [], sugar: 'high', vegiOk: true, veganOk: true, halalOk: true, inference: c },
];
