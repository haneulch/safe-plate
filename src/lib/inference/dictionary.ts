import type { Grade, MenuTag } from '../types';

export interface DishAttrs {
  tags?: MenuTag[];
  sodium?: Grade;
  sugar?: Grade;
  fat?: Grade;
  purine?: Grade;
  spicy?: Grade;
  vegiOk?: boolean;
  veganOk?: boolean;
}

export interface DishRule extends DishAttrs {
  /** Dish-name keywords, longest matched first. */
  keywords: string[];
}

/**
 * Dish rules: a hit implies the full attribute set of a known Korean dish.
 * Order does not matter — matching sorts by keyword length (longest first)
 * so e.g. '치즈닭갈비' wins over '닭갈비'.
 */
export const DISH_RULES: DishRule[] = [
  // noodles & dumplings
  { keywords: ['칼국수'], tags: ['wheat', 'pungent'], sodium: 'high' },
  { keywords: ['콩국수'], tags: ['wheat', 'soy'], sodium: 'low', vegiOk: true },
  { keywords: ['물냉면', '비빔냉면', '냉면'], tags: ['buckwheat', 'beef', 'egg'], sodium: 'mid' },
  { keywords: ['막국수'], tags: ['buckwheat', 'egg', 'pungent'], sodium: 'mid' },
  { keywords: ['잔치국수', '국수'], tags: ['wheat', 'pungent'], sodium: 'high' },
  { keywords: ['라면', '라멘'], tags: ['wheat', 'egg', 'pungent'], sodium: 'high', spicy: 'high' },
  { keywords: ['우동'], tags: ['wheat', 'fish'], sodium: 'high' },
  { keywords: ['짜장면', '짜장'], tags: ['wheat', 'pork', 'pungent'], sodium: 'mid', sugar: 'high' },
  { keywords: ['짬뽕'], tags: ['wheat', 'shellfish', 'mollusk', 'pork', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high' },
  { keywords: ['만두', '교자', '딤섬'], tags: ['wheat', 'pork', 'pungent'], sodium: 'mid', fat: 'high' },
  { keywords: ['수제비'], tags: ['wheat', 'pungent'], sodium: 'high' },
  { keywords: ['파스타', '스파게티'], tags: ['wheat', 'milk'], sodium: 'mid' },
  // rice
  { keywords: ['산채비빔밥'], tags: ['egg', 'soy'], sodium: 'low', vegiOk: true },
  { keywords: ['육회비빔밥'], tags: ['egg', 'beef', 'pungent'], sodium: 'mid' },
  { keywords: ['비빔밥'], tags: ['egg', 'beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'mid' },
  { keywords: ['김밥'], tags: ['egg', 'fish', 'soy'], sodium: 'mid' },
  { keywords: ['볶음밥'], tags: ['egg', 'pungent'], sodium: 'mid' },
  { keywords: ['돌솥밥'], tags: [], sodium: 'low' },
  { keywords: ['덮밥'], tags: ['egg', 'soy', 'pungent'], sodium: 'mid' },
  { keywords: ['오므라이스'], tags: ['egg', 'wheat', 'milk'], sodium: 'mid', sugar: 'mid' },
  { keywords: ['카레', '커리'], tags: ['wheat', 'pungent'], sodium: 'mid' },
  // soups & stews
  { keywords: ['설렁탕', '곰탕', '사골'], tags: ['beef', 'pungent'], sodium: 'high', purine: 'high' },
  { keywords: ['갈비탕'], tags: ['beef', 'pungent'], sodium: 'high', purine: 'high' },
  { keywords: ['삼계탕'], tags: ['chicken', 'pungent'], sodium: 'mid', purine: 'high' },
  { keywords: ['김치찌개'], tags: ['pork', 'pungent'], sodium: 'high', spicy: 'high', fat: 'high' },
  { keywords: ['된장찌개', '된장국'], tags: ['soy', 'pungent'], sodium: 'high' },
  { keywords: ['순두부찌개', '순두부'], tags: ['soy', 'egg', 'mollusk', 'pungent'], sodium: 'high', spicy: 'high' },
  { keywords: ['부대찌개'], tags: ['pork', 'wheat', 'pungent'], sodium: 'high', spicy: 'high', fat: 'high' },
  { keywords: ['감자탕', '뼈해장국'], tags: ['pork', 'pungent'], sodium: 'high', purine: 'high', spicy: 'high', fat: 'high' },
  { keywords: ['해장국'], tags: ['beef', 'pungent'], sodium: 'high', purine: 'high' },
  { keywords: ['순대국', '순댓국'], tags: ['pork', 'pungent'], sodium: 'high', purine: 'high', fat: 'high' },
  { keywords: ['콩나물국밥'], tags: ['egg', 'soy', 'pungent'], sodium: 'high' },
  { keywords: ['국밥'], tags: ['pork', 'pungent'], sodium: 'high', purine: 'high' },
  { keywords: ['추어탕'], tags: ['fish', 'pungent'], sodium: 'high', purine: 'high' },
  { keywords: ['매운탕'], tags: ['fish', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high' },
  { keywords: ['해물탕'], tags: ['shellfish', 'mollusk', 'fish', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high' },
  { keywords: ['육개장'], tags: ['beef', 'pungent'], sodium: 'high', spicy: 'high' },
  { keywords: ['닭볶음탕', '닭도리탕'], tags: ['chicken', 'pungent'], sodium: 'high', spicy: 'high' },
  { keywords: ['미역국'], tags: ['beef', 'soy'], sodium: 'mid' },
  // meat mains
  { keywords: ['치즈닭갈비'], tags: ['chicken', 'milk', 'pungent'], sodium: 'high', sugar: 'high', fat: 'high', spicy: 'high' },
  { keywords: ['닭갈비'], tags: ['chicken', 'pungent'], sodium: 'mid', sugar: 'high', spicy: 'high' },
  { keywords: ['삼겹살', '오겹살', '목살'], tags: ['pork'], fat: 'high', sodium: 'mid' },
  { keywords: ['제육볶음', '제육', '두루치기'], tags: ['pork', 'pungent'], sodium: 'high', sugar: 'high', spicy: 'high', fat: 'high' },
  { keywords: ['보쌈', '수육'], tags: ['pork', 'pungent'], fat: 'high', sodium: 'mid' },
  { keywords: ['족발'], tags: ['pork', 'soy', 'pungent'], sodium: 'high', fat: 'high', purine: 'high' },
  { keywords: ['불고기'], tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high' },
  { keywords: ['갈비찜'], tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high' },
  { keywords: ['떡갈비'], tags: ['beef', 'pork', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high' },
  { keywords: ['돼지갈비'], tags: ['pork', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high' },
  { keywords: ['소갈비', 'LA갈비', '갈비'], tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high' },
  { keywords: ['치킨', '닭강정', '통닭'], tags: ['chicken', 'wheat'], sodium: 'high', sugar: 'high', fat: 'high' },
  { keywords: ['돈까스', '돈가스', '카츠'], tags: ['pork', 'wheat', 'egg'], sodium: 'mid', fat: 'high' },
  { keywords: ['탕수육'], tags: ['pork', 'wheat'], sugar: 'high', fat: 'high' },
  { keywords: ['곱창', '대창', '막창', '내장'], tags: ['beef', 'pungent'], fat: 'high', purine: 'high' },
  { keywords: ['육회'], tags: ['beef', 'egg', 'pungent'], sodium: 'low' },
  { keywords: ['스테이크'], tags: ['beef'], fat: 'high' },
  { keywords: ['오리'], tags: ['meat', 'pungent'], fat: 'high' },
  { keywords: ['양꼬치', '양고기'], tags: ['meat', 'pungent'], fat: 'high' },
  // seafood
  { keywords: ['해물파전'], tags: ['shellfish', 'mollusk', 'wheat', 'egg', 'pungent'], sodium: 'mid' },
  { keywords: ['파전', '부침개', '빈대떡', '김치전', '감자전', '해물전', '모둠전', '녹두전'], tags: ['wheat', 'egg', 'pungent'], sodium: 'mid' },
  { keywords: ['낙지볶음', '낙지'], tags: ['mollusk', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high' },
  { keywords: ['오징어볶음', '오징어'], tags: ['mollusk', 'pungent'], sodium: 'high', spicy: 'high' },
  { keywords: ['쭈꾸미', '주꾸미'], tags: ['mollusk', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high' },
  { keywords: ['문어'], tags: ['mollusk'], purine: 'high' },
  { keywords: ['새우장'], tags: ['shellfish', 'soy'], sodium: 'high', purine: 'high' },
  { keywords: ['간장게장', '양념게장', '게장'], tags: ['shellfish', 'soy'], sodium: 'high', purine: 'high' },
  { keywords: ['대게', '꽃게', '킹크랩'], tags: ['shellfish'], purine: 'high' },
  { keywords: ['새우'], tags: ['shellfish'], purine: 'high' },
  { keywords: ['조개구이', '조개찜', '조개'], tags: ['mollusk'], purine: 'high' },
  { keywords: ['굴'], tags: ['mollusk'], purine: 'high' },
  { keywords: ['회덮밥'], tags: ['fish', 'egg', 'soy', 'pungent'], sodium: 'mid' },
  { keywords: ['물회'], tags: ['fish', 'pungent'], sodium: 'mid', sugar: 'high' },
  { keywords: ['회', '사시미', '스시', '초밥'], tags: ['fish'], sodium: 'low' },
  { keywords: ['고등어', '갈치', '생선구이', '생선'], tags: ['fish'], sodium: 'mid', purine: 'high' },
  { keywords: ['장어'], tags: ['fish', 'soy'], fat: 'high', purine: 'high' },
  { keywords: ['아구찜', '아귀찜', '해물찜'], tags: ['shellfish', 'mollusk', 'fish', 'pungent'], sodium: 'high', spicy: 'high', purine: 'high' },
  // street & snack
  { keywords: ['떡볶이'], tags: ['wheat', 'fish', 'soy', 'pungent'], sodium: 'high', sugar: 'high', spicy: 'high' },
  { keywords: ['순대'], tags: ['pork'], sodium: 'mid', purine: 'high' },
  { keywords: ['어묵', '오뎅'], tags: ['fish', 'wheat'], sodium: 'high' },
  { keywords: ['튀김'], tags: ['wheat'], fat: 'high' },
  { keywords: ['토스트', '샌드위치'], tags: ['wheat', 'egg', 'milk'], sugar: 'mid' },
  { keywords: ['핫도그'], tags: ['wheat', 'pork', 'milk'], sugar: 'high', fat: 'high' },
  { keywords: ['피자'], tags: ['wheat', 'milk', 'pork'], sodium: 'high', fat: 'high' },
  { keywords: ['햄버거', '버거'], tags: ['wheat', 'beef', 'egg', 'milk'], sodium: 'high', fat: 'high' },
  // desserts & drinks
  { keywords: ['약과'], tags: ['wheat'], sugar: 'high', vegiOk: true },
  { keywords: ['호떡'], tags: ['wheat', 'nut'], sugar: 'high' },
  { keywords: ['붕어빵', '잉어빵'], tags: ['wheat', 'egg', 'milk'], sugar: 'high' },
  { keywords: ['빙수'], tags: ['milk', 'nut'], sugar: 'high', vegiOk: true },
  { keywords: ['와플', '팬케이크', '케이크', '빵', '베이커리'], tags: ['wheat', 'egg', 'milk'], sugar: 'high', vegiOk: true },
  { keywords: ['아이스크림', '젤라또'], tags: ['milk'], sugar: 'high', vegiOk: true },
  { keywords: ['인절미', '떡'], tags: [], sugar: 'mid', vegiOk: true },
  { keywords: ['식혜', '수정과'], tags: [], sugar: 'high', vegiOk: true, veganOk: true },
  { keywords: ['오미자차', '유자차', '대추차', '녹차', '커피'], tags: [], sugar: 'mid', vegiOk: true, veganOk: true },
  // veg
  { keywords: ['산채정식', '산채'], tags: [], sodium: 'low', vegiOk: true, veganOk: true },
  { keywords: ['샐러드'], tags: [], sodium: 'low', vegiOk: true },
  { keywords: ['두부'], tags: ['soy'], sodium: 'low', vegiOk: true, veganOk: true },
  { keywords: ['버섯'], tags: [], sodium: 'low', vegiOk: true, veganOk: true },
];

export interface KeywordRule {
  keywords: string[];
  tag?: MenuTag;
  attrs?: DishAttrs;
}

/**
 * Ingredient keyword rules: substring hits add a tag/attribute but do NOT
 * define the whole dish (lower confidence than a dish rule).
 */
export const KEYWORD_RULES: KeywordRule[] = [
  { keywords: ['돼지', '제육', '삼겹', '족발', '보쌈', '베이컨', '햄', '소시지'], tag: 'pork' },
  { keywords: ['소고기', '쇠고기', '한우', '우육', '차돌', '육회', '사골'], tag: 'beef' },
  { keywords: ['닭', '치킨'], tag: 'chicken' },
  { keywords: ['새우', '게', '꽃게', '대하', '랍스터', '가재'], tag: 'shellfish' },
  { keywords: ['조개', '홍합', '전복', '굴', '바지락', '오징어', '낙지', '문어', '주꾸미'], tag: 'mollusk' },
  { keywords: ['생선', '고등어', '갈치', '연어', '참치', '멸치', '어묵'], tag: 'fish' },
  { keywords: ['계란', '달걀', '에그'], tag: 'egg' },
  { keywords: ['치즈', '우유', '크림', '버터', '요거트'], tag: 'milk' },
  { keywords: ['밀', '면', '국수', '만두', '빵', '튀김', '부침'], tag: 'wheat' },
  { keywords: ['메밀'], tag: 'buckwheat' },
  { keywords: ['콩', '두부', '된장', '간장', '두유'], tag: 'soy' },
  { keywords: ['땅콩'], tag: 'peanut' },
  { keywords: ['호두', '잣', '아몬드', '견과'], tag: 'nut' },
  { keywords: ['마늘', '파', '양파', '부추'], tag: 'pungent' },
  { keywords: ['맥주', '소주', '막걸리', '와인', '주류'], tag: 'alcohol' },
  { keywords: ['매운', '매콤', '불닭', '화끈'], attrs: { spicy: 'high' } },
  /* English / romanized keywords — multilingual TourAPI services return
     translated menu text the Korean rules can't parse. Lowercase only:
     matching lowercases the dish name first. */
  { keywords: ['pork', 'pig', 'jokbal', 'samgyeopsal', 'bossam', 'bacon', 'ham', 'sausage', 'tonkatsu'], tag: 'pork' },
  { keywords: ['beef', 'bulgogi', 'galbi', 'hanwoo', 'steak', 'brisket'], tag: 'beef' },
  { keywords: ['chicken', 'dak', 'samgyetang'], tag: 'chicken' },
  { keywords: ['shrimp', 'prawn', 'crab', 'lobster'], tag: 'shellfish' },
  { keywords: ['squid', 'octopus', 'nakji', 'clam', 'oyster', 'mussel', 'abalone'], tag: 'mollusk' },
  { keywords: ['fish', 'salmon', 'tuna', 'mackerel', 'anchovy', 'eomuk'], tag: 'fish' },
  { keywords: ['egg', 'gyeran'], tag: 'egg' },
  { keywords: ['cheese', 'milk', 'cream', 'butter', 'yogurt'], tag: 'milk' },
  { keywords: ['noodle', 'ramyeon', 'ramen', 'kalguksu', 'mandu', 'dumpling', 'bread', 'pancake', 'fried', 'tteokbokki'], tag: 'wheat' },
  { keywords: ['buckwheat', 'naengmyeon', 'makguksu', 'soba'], tag: 'buckwheat' },
  { keywords: ['tofu', 'soybean', 'doenjang', 'soy'], tag: 'soy' },
  { keywords: ['peanut'], tag: 'peanut' },
  { keywords: ['walnut', 'almond', 'pine nut', 'nut'], tag: 'nut' },
  { keywords: ['garlic', 'onion', 'maneul'], tag: 'pungent' },
  { keywords: ['beer', 'soju', 'makgeolli', 'wine'], tag: 'alcohol' },
  { keywords: ['spicy'], attrs: { spicy: 'high' } },
  /* Japanese keywords (JpnService2 menu text). 牛 alone would false-match 牛乳(milk) → use 牛肉/カルビ. */
  { keywords: ['豚', 'サムギョプサル', 'ポサム', 'チョッパル', 'ハム', 'ベーコン'], tag: 'pork' },
  { keywords: ['牛肉', 'カルビ', 'プルコギ', 'ユッケ'], tag: 'beef' },
  { keywords: ['鶏', 'チキン', 'タッ', 'サムゲタン'], tag: 'chicken' },
  { keywords: ['エビ', '海老', 'カニ', '蟹'], tag: 'shellfish' },
  { keywords: ['イカ', 'タコ', '蛸', 'ナクチ', 'チュクミ', '貝', 'カキ', '牡蠣', 'アワビ'], tag: 'mollusk' },
  { keywords: ['魚', 'サバ', '鯖', 'サーモン', 'どじょう', 'カマボコ'], tag: 'fish' },
  { keywords: ['卵', 'たまご', 'タマゴ'], tag: 'egg' },
  { keywords: ['チーズ', '牛乳', 'クリーム', 'バター'], tag: 'milk' },
  { keywords: ['麺', 'うどん', 'ラーメン', '餃子', 'マンドゥ', 'パン', 'カルグクス', 'トッポッキ', '天ぷら'], tag: 'wheat' },
  { keywords: ['蕎麦', 'そば', '冷麺', 'ネンミョン'], tag: 'buckwheat' },
  { keywords: ['豆腐', '味噌', 'テンジャン', '大豆'], tag: 'soy' },
  { keywords: ['ニンニク', 'にんにく', 'ネギ', '玉ねぎ'], tag: 'pungent' },
  { keywords: ['辛', 'カラい'], attrs: { spicy: 'high' } },
  /* Chinese keywords (ChsService2 menu text). 排骨 is ambiguous (pork/beef ribs) → generic meat. */
  { keywords: ['猪', '五花肉', '香肠', '火腿'], tag: 'pork' },
  { keywords: ['牛肉', '烤牛', '牛排'], tag: 'beef' },
  { keywords: ['鸡', '参鸡汤'], tag: 'chicken' },
  { keywords: ['虾', '螃蟹', '蟹'], tag: 'shellfish' },
  { keywords: ['鱿鱼', '章鱼', '八爪鱼', '蛤', '牡蛎', '鲍鱼', '贝'], tag: 'mollusk' },
  { keywords: ['鱼', '三文鱼', '金枪鱼', '鳕鱼'], tag: 'fish' },
  { keywords: ['蛋', '鸡蛋'], tag: 'egg' },
  { keywords: ['奶酪', '芝士', '牛奶', '奶油', '黄油'], tag: 'milk' },
  { keywords: ['面', '饺子', '煎饼', '面包', '炒年糕', '油炸'], tag: 'wheat' },
  { keywords: ['荞麦', '冷面'], tag: 'buckwheat' },
  { keywords: ['豆腐', '大酱', '酱汤', '大豆'], tag: 'soy' },
  { keywords: ['花生'], tag: 'peanut' },
  { keywords: ['核桃', '杏仁', '坚果'], tag: 'nut' },
  { keywords: ['蒜', '洋葱', '葱'], tag: 'pungent' },
  { keywords: ['辣', '麻辣'], attrs: { spicy: 'high' } },
  { keywords: ['排骨'], tag: 'meat' },
];
