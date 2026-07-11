import type { AllergenId, ConditionId, Menu, MenuTag, ReligiousId, UiLang } from '../types';

type LabelMap = Record<UiLang, string>;

export const TAG_LABEL: Record<MenuTag, LabelMap> = {
  pork: { ko: '돼지고기', en: 'pork', ja: '豚肉', zh: '猪肉', ar: 'لحم خنزير' },
  beef: { ko: '쇠고기', en: 'beef', ja: '牛肉', zh: '牛肉', ar: 'لحم بقري' },
  chicken: { ko: '닭고기', en: 'chicken', ja: '鶏肉', zh: '鸡肉', ar: 'دجاج' },
  meat: { ko: '육류', en: 'meat', ja: '肉類', zh: '肉类', ar: 'لحوم' },
  fish: { ko: '생선', en: 'fish', ja: '魚類', zh: '鱼类', ar: 'سمك' },
  shellfish: { ko: '갑각류', en: 'shellfish', ja: '甲殻類', zh: '甲壳类', ar: 'قشريات' },
  mollusk: { ko: '조개·오징어류', en: 'mollusks/squid', ja: '貝・イカ類', zh: '贝类/鱿鱼', ar: 'محار/حبار' },
  peanut: { ko: '땅콩', en: 'peanut', ja: 'ピーナッツ', zh: '花生', ar: 'فول سوداني' },
  nut: { ko: '견과류(호두·잣)', en: 'tree nuts', ja: 'ナッツ類', zh: '坚果', ar: 'مكسرات' },
  milk: { ko: '우유', en: 'milk', ja: '乳', zh: '牛奶', ar: 'حليب' },
  egg: { ko: '계란', en: 'egg', ja: '卵', zh: '鸡蛋', ar: 'بيض' },
  wheat: { ko: '밀', en: 'wheat', ja: '小麦', zh: '小麦', ar: 'قمح' },
  buckwheat: { ko: '메밀', en: 'buckwheat', ja: 'そば', zh: '荞麦', ar: 'حنطة سوداء' },
  soy: { ko: '대두(콩)', en: 'soy', ja: '大豆', zh: '大豆', ar: 'صويا' },
  alcohol: { ko: '주류', en: 'alcohol', ja: '酒類', zh: '酒类', ar: 'كحول' },
  pungent: {
    ko: '오신채(마늘·파 등)',
    en: 'pungent vegetables (garlic etc.)',
    ja: '五辛（にんにく等）',
    zh: '五辛（蒜等）',
    ar: 'خضروات نفاذة (ثوم)',
  },
};

export function tagLabel(tag: MenuTag, lang: UiLang): string {
  return TAG_LABEL[tag][lang] ?? TAG_LABEL[tag].en;
}

export interface LabeledItem<Id extends string> {
  id: Id;
  label: LabelMap;
}

export const CONDITIONS: LabeledItem<ConditionId>[] = [
  { id: 'sodium', label: { ko: '고혈압·신장질환 (나트륨 제한)', en: 'Hypertension/kidney (low sodium)', ja: '高血圧・腎疾患（減塩）', zh: '高血压/肾病（限钠）', ar: 'ضغط/كلى (صوديوم منخفض)' } },
  { id: 'sugar', label: { ko: '당뇨 (당류 관리)', en: 'Diabetes (sugar control)', ja: '糖尿病（糖質管理）', zh: '糖尿病（控糖）', ar: 'سكري (تحكم بالسكر)' } },
  { id: 'gout', label: { ko: '통풍 (퓨린 제한)', en: 'Gout (low purine)', ja: '痛風（プリン体制限）', zh: '痛风（限嘌呤）', ar: 'نقرس (بيورين منخفض)' } },
  { id: 'lipid', label: { ko: '고지혈증 (포화지방 제한)', en: 'High cholesterol (low sat. fat)', ja: '脂質異常症（飽和脂肪制限）', zh: '高血脂（限饱和脂肪）', ar: 'كوليسترول مرتفع (دهون مشبعة أقل)' } },
  { id: 'gerd', label: { ko: '위염·역류성 식도염 (자극 제한)', en: 'Gastritis/GERD (avoid irritation)', ja: '胃炎・逆流性食道炎（刺激物制限）', zh: '胃炎/反流性食管炎（忌辛辣）', ar: 'التهاب المعدة/الارتجاع (تجنب المهيّجات)' } },
  { id: 'gluten', label: { ko: '셀리악병 (글루텐 제한)', en: 'Celiac (gluten-free)', ja: 'セリアック（グルテンフリー）', zh: '乳糜泻（无麸质）', ar: 'سيلياك (خالٍ من الغلوتين)' } },
];

export const ALLERGENS: LabeledItem<AllergenId>[] = [
  { id: 'peanut', label: { ko: '땅콩', en: 'Peanut', ja: 'ピーナッツ', zh: '花生', ar: 'فول سوداني' } },
  { id: 'nut', label: { ko: '견과류(호두·잣)', en: 'Tree nuts (walnut/pine nut)', ja: 'ナッツ類（くるみ・松の実）', zh: '坚果（核桃/松子）', ar: 'مكسرات (جوز/صنوبر)' } },
  { id: 'shellfish', label: { ko: '갑각류(새우·게)', en: 'Shellfish (shrimp/crab)', ja: '甲殻類（エビ・カニ）', zh: '甲壳类（虾蟹）', ar: 'قشريات (روبيان/سلطعون)' } },
  { id: 'mollusk', label: { ko: '조개·오징어류', en: 'Mollusks (clam/squid)', ja: '貝・イカ類', zh: '贝类/鱿鱼', ar: 'محار وحبار' } },
  { id: 'fish', label: { ko: '생선(고등어 등)', en: 'Fish (mackerel etc.)', ja: '魚（サバ等）', zh: '鱼类（鲭鱼等）', ar: 'سمك (ماكريل)' } },
  { id: 'milk', label: { ko: '우유', en: 'Milk', ja: '乳', zh: '牛奶', ar: 'حليب' } },
  { id: 'egg', label: { ko: '계란(알류)', en: 'Egg', ja: '卵', zh: '鸡蛋', ar: 'بيض' } },
  { id: 'wheat', label: { ko: '밀', en: 'Wheat', ja: '小麦', zh: '小麦', ar: 'قمح' } },
  { id: 'buckwheat', label: { ko: '메밀', en: 'Buckwheat', ja: 'そば', zh: '荞麦', ar: 'حنطة سوداء' } },
  { id: 'soy', label: { ko: '대두(콩)', en: 'Soy', ja: '大豆', zh: '大豆', ar: 'صويا' } },
  { id: 'pork', label: { ko: '돼지고기', en: 'Pork', ja: '豚肉', zh: '猪肉', ar: 'لحم خنزير' } },
  { id: 'beef', label: { ko: '쇠고기', en: 'Beef', ja: '牛肉', zh: '牛肉', ar: 'لحم بقري' } },
  { id: 'chicken', label: { ko: '닭고기', en: 'Chicken', ja: '鶏肉', zh: '鸡肉', ar: 'دجاج' } },
];

export const RELIGIOUS: LabeledItem<ReligiousId>[] = [
  { id: 'halal', label: { ko: '할랄 · 이슬람 (돼지고기·주류 ✕)', en: 'Halal · Islam (no pork/alcohol)', ja: 'ハラール（豚肉・酒✕）', zh: '清真（禁猪肉/酒）', ar: 'حلال (بلا خنزير/كحول)' } },
  { id: 'kosher', label: { ko: '코셔 · 유대교 (돼지·갑각류 ✕, 육류+유제품 혼합 ✕)', en: 'Kosher · Judaism (no pork/shellfish, no meat+dairy)', ja: 'コーシャ（豚・甲殻類✕、肉+乳✕）', zh: '犹太洁食（禁猪/甲壳类，肉奶不混）', ar: 'كوشر (بلا خنزير/قشريات، بلا لحم+ألبان)' } },
  { id: 'hindu', label: { ko: '힌두교 (쇠고기 ✕)', en: 'Hindu (no beef)', ja: 'ヒンドゥー（牛肉✕）', zh: '印度教（禁牛肉）', ar: 'هندوسي (بلا لحم بقري)' } },
  { id: 'buddhist', label: { ko: '사찰식 · 불교 (육류·오신채 ✕)', en: 'Buddhist (no meat, no garlic/onion)', ja: '精進料理（肉・五辛✕）', zh: '素斋（禁肉/五辛）', ar: 'بوذي (بلا لحم/ثوم وبصل)' } },
  { id: 'vegan', label: { ko: '비건 (모든 동물성 ✕)', en: 'Vegan (no animal products)', ja: 'ヴィーガン（動物性すべて✕）', zh: '纯素（禁所有动物性）', ar: 'نباتي صرف (بلا منتجات حيوانية)' } },
  { id: 'vegi', label: { ko: '채식 락토오보 (고기·생선 ✕, 계란·유제품 ○)', en: 'Vegetarian (no meat/fish; egg/dairy OK)', ja: 'ベジタリアン（肉・魚✕、卵乳○）', zh: '蛋奶素（禁肉/鱼）', ar: 'نباتي (بيض/ألبان مسموح)' } },
  { id: 'pesco', label: { ko: '페스코 (육류 ✕, 해산물 ○)', en: 'Pescatarian (no meat; seafood OK)', ja: 'ペスコ（肉✕、魚介○）', zh: '鱼素（禁肉，海鲜可）', ar: 'بيسكاتاري (بلا لحم، مأكولات بحرية مسموحة)' } },
];

export interface SpokenLang {
  id: string;
  label: LabelMap;
  /** Korean label shown on the Care Card. */
  ko: string;
}

export const SPOKEN_LANGS: SpokenLang[] = [
  { id: 'ko', ko: '한국어', label: { ko: '한국어', en: 'Korean', ja: '韓国語', zh: '韩语', ar: 'الكورية' } },
  { id: 'en', ko: '영어', label: { ko: '영어', en: 'English', ja: '英語', zh: '英语', ar: 'الإنجليزية' } },
  { id: 'zh', ko: '중국어', label: { ko: '중국어', en: 'Chinese', ja: '中国語', zh: '中文', ar: 'الصينية' } },
  { id: 'ja', ko: '일본어', label: { ko: '일본어', en: 'Japanese', ja: '日本語', zh: '日语', ar: 'اليابانية' } },
  { id: 'es', ko: '스페인어', label: { ko: '스페인어', en: 'Spanish', ja: 'スペイン語', zh: '西班牙语', ar: 'الإسبانية' } },
  { id: 'fr', ko: '프랑스어', label: { ko: '프랑스어', en: 'French', ja: 'フランス語', zh: '法语', ar: 'الفرنسية' } },
  { id: 'vi', ko: '베트남어', label: { ko: '베트남어', en: 'Vietnamese', ja: 'ベトナム語', zh: '越南语', ar: 'الفيتنامية' } },
  { id: 'th', ko: '태국어', label: { ko: '태국어', en: 'Thai', ja: 'タイ語', zh: '泰语', ar: 'التايلاندية' } },
  { id: 'ru', ko: '러시아어', label: { ko: '러시아어', en: 'Russian', ja: 'ロシア語', zh: '俄语', ar: 'الروسية' } },
  { id: 'ar', ko: '아랍어', label: { ko: '아랍어', en: 'Arabic', ja: 'アラビア語', zh: '阿拉伯语', ar: 'العربية' } },
];

export interface Nation {
  id: string;
  flag: string;
  label: LabelMap;
  lang: UiLang;
  suggest?: 'halal' | 'vegi';
  dishes?: Menu[];
}

const curated = { source: 'curated', confidence: 'high' } as const;

export const DISHES_GLOBAL: Menu[] = [
  { name: { ko: '비빔밥', en: 'Bibimbap' }, tags: ['egg', 'beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'mid', adjustable: ['egg'], inference: curated },
  { name: { ko: '한국식 치킨', en: 'Korean fried chicken' }, tags: ['chicken', 'wheat'], sodium: 'high', sugar: 'high', fat: 'high', inference: curated },
  { name: { ko: '불고기', en: 'Bulgogi' }, tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: curated },
];

export const NATIONS: Nation[] = [
  { id: 'kr', flag: '🇰🇷', label: { ko: '한국', en: 'Korea', ja: '韓国', zh: '韩国', ar: 'كوريا' }, lang: 'ko' },
  {
    id: 'jp', flag: '🇯🇵', label: { ko: '일본', en: 'Japan', ja: '日本', zh: '日本', ar: 'اليابان' }, lang: 'ja',
    dishes: [
      { name: { ko: '삼겹살', en: 'Samgyeopsal' }, tags: ['pork'], sodium: 'mid', sugar: 'low', fat: 'high', inference: curated },
      { name: { ko: '치즈닭갈비', en: 'Cheese dak-galbi' }, tags: ['chicken', 'milk', 'pungent'], sodium: 'high', sugar: 'high', fat: 'high', spicy: 'high', inference: curated },
      { name: { ko: '김밥', en: 'Gimbap' }, tags: ['egg', 'fish', 'soy'], sodium: 'mid', sugar: 'low', adjustable: ['egg'], inference: curated },
    ],
  },
  {
    id: 'cn', flag: '🇨🇳', label: { ko: '중국', en: 'China', ja: '中国', zh: '中国', ar: 'الصين' }, lang: 'zh',
    dishes: [
      { name: { ko: '삼계탕', en: 'Samgye-tang' }, tags: ['chicken', 'pungent'], sodium: 'mid', sugar: 'low', purine: 'high', inference: curated },
      { name: { ko: '불고기', en: 'Bulgogi' }, tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: curated },
      { name: { ko: '해물찜', en: 'Braised seafood' }, tags: ['shellfish', 'mollusk', 'pungent'], sodium: 'high', sugar: 'mid', purine: 'high', spicy: 'high', inference: curated },
    ],
  },
  { id: 'tw', flag: '🇹🇼', label: { ko: '대만', en: 'Taiwan', ja: '台湾', zh: '台湾', ar: 'تايوان' }, lang: 'zh' },
  {
    id: 'us', flag: '🇺🇸', label: { ko: '미국', en: 'USA', ja: 'アメリカ', zh: '美国', ar: 'أمريكا' }, lang: 'en',
    dishes: [
      { name: { ko: '한국식 치킨', en: 'Korean fried chicken' }, tags: ['chicken', 'wheat'], sodium: 'high', sugar: 'high', fat: 'high', inference: curated },
      { name: { ko: '비빔밥', en: 'Bibimbap' }, tags: ['egg', 'beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'mid', adjustable: ['egg'], inference: curated },
      { name: { ko: '김치찌개', en: 'Kimchi stew' }, tags: ['pork', 'pungent'], sodium: 'high', sugar: 'low', spicy: 'high', fat: 'high', inference: curated },
    ],
  },
  { id: 'gb', flag: '🇬🇧', label: { ko: '영국', en: 'UK', ja: 'イギリス', zh: '英国', ar: 'بريطانيا' }, lang: 'en' },
  { id: 'fr', flag: '🇫🇷', label: { ko: '프랑스', en: 'France', ja: 'フランス', zh: '法国', ar: 'فرنسا' }, lang: 'en' },
  { id: 'th', flag: '🇹🇭', label: { ko: '태국', en: 'Thailand', ja: 'タイ', zh: '泰国', ar: 'تايلاند' }, lang: 'en' },
  {
    id: 'id', flag: '🇮🇩', label: { ko: '인도네시아', en: 'Indonesia', ja: 'インドネシア', zh: '印尼', ar: 'إندونيسيا' }, lang: 'en', suggest: 'halal',
    dishes: [
      { name: { ko: '닭갈비', en: 'Dak-galbi' }, tags: ['chicken', 'pungent'], sodium: 'mid', sugar: 'high', spicy: 'high', inference: curated },
      { name: { ko: '비빔밥', en: 'Bibimbap' }, tags: ['egg', 'beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'mid', adjustable: ['egg'], inference: curated },
      { name: { ko: '떡볶이', en: 'Tteokbokki' }, tags: ['wheat', 'fish', 'soy', 'pungent'], sodium: 'high', sugar: 'high', spicy: 'high', inference: curated },
    ],
  },
  {
    id: 'in', flag: '🇮🇳', label: { ko: '인도', en: 'India', ja: 'インド', zh: '印度', ar: 'الهند' }, lang: 'en', suggest: 'vegi',
    dishes: [
      { name: { ko: '산채정식', en: 'Wild-greens set' }, tags: [], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: curated },
      { name: { ko: '비빔밥', en: 'Bibimbap' }, tags: ['egg', 'beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'mid', adjustable: ['egg'], inference: curated },
      { name: { ko: '파전', en: 'Scallion pancake' }, tags: ['wheat', 'egg', 'pungent'], sodium: 'mid', sugar: 'low', inference: curated },
    ],
  },
  {
    id: 'sa', flag: '🇸🇦', label: { ko: '사우디아라비아', en: 'Saudi Arabia', ja: 'サウジアラビア', zh: '沙特', ar: 'السعودية' }, lang: 'ar', suggest: 'halal',
    dishes: [
      { name: { ko: '갈비찜', en: 'Braised short ribs' }, tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: curated },
      { name: { ko: '삼계탕', en: 'Samgye-tang' }, tags: ['chicken', 'pungent'], sodium: 'mid', sugar: 'low', purine: 'high', inference: curated },
      { name: { ko: '잡채', en: 'Japchae' }, tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: curated },
    ],
  },
  { id: 'ae', flag: '🇦🇪', label: { ko: '아랍에미리트', en: 'UAE', ja: 'UAE', zh: '阿联酋', ar: 'الإمارات' }, lang: 'ar', suggest: 'halal' },
];

export function nationById(id: string | null): Nation | undefined {
  return NATIONS.find((n) => n.id === id);
}

/** Care-card note languages selectable below the card. */
export const CARE_LANGS: Partial<Record<UiLang, string>> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
};

export const PROF_HINT: Record<UiLang, string> = {
  ko: '식당에서 사장님께 이 카드를 보여주세요. 재료 확인이 훨씬 쉬워져요.',
  en: 'Show this card to the restaurant owner — it makes checking ingredients so much easier.',
  ja: 'お店でこのカードを見せてください。食材の確認がずっと簡単になります。',
  zh: '在餐厅向老板出示此卡，确认食材会容易得多。',
  ar: 'أظهر هذه البطاقة لصاحب المطعم — سيسهّل ذلك التحقق من المكونات كثيراً.',
};
