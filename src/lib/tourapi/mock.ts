import type { RestaurantDetail } from '../types';

const curated = { source: 'curated', confidence: 'high' } as const;

/**
 * Demo dataset ported from docs/demo/safeplate-korea.html, with coordinates
 * added so distance/geolocation flows work without a TourAPI key.
 */
export const MOCK_RESTAURANTS: RestaurantDetail[] = [
  /* ── Myeongdong, Seoul ── */
  {
    id: 'r1',
    foodCat: 'korean',
    name: { ko: '명동손칼국수' },
    cat: { ko: '한식 · 면류', en: 'Korean · Noodles' },
    lat: 37.5637, lng: 126.985,
    source: 'mock',
    menus: [
      { name: { ko: '사골 칼국수', en: 'Beef-bone kalguksu' }, price: '₩11,000', tags: ['wheat', 'beef', 'pungent'], sodium: 'high', sugar: 'low', purine: 'high', cross: ['egg'], inference: curated },
      { name: { ko: '메밀 물냉면', en: 'Buckwheat naengmyeon' }, price: '₩12,000', tags: ['buckwheat', 'beef', 'egg'], sodium: 'mid', sugar: 'low', adjustable: ['egg'], inference: curated },
      { name: { ko: '왕만두 (고기)', en: 'King dumplings (meat)' }, price: '₩9,000', tags: ['wheat', 'pork', 'pungent'], sodium: 'mid', sugar: 'low', fat: 'high', inference: curated },
      { name: { ko: '콩국수', en: 'Cold soy-milk noodles' }, price: '₩12,000', tags: ['wheat', 'soy'], sodium: 'low', sugar: 'low', cross: ['peanut'], vegiOk: true, inference: curated },
    ],
  },
  {
    id: 'r2',
    foodCat: 'korean',
    name: { ko: '남산돌솥밥' },
    cat: { ko: '한식 · 정식', en: 'Korean · Set meals' },
    lat: 37.5608, lng: 126.9862,
    source: 'mock',
    menus: [
      { name: { ko: '영양 돌솥밥 정식', en: 'Nutritious hot-pot rice set (nuts)' }, price: '₩15,000', tags: ['nut'], sodium: 'mid', sugar: 'low', inference: curated },
      { name: { ko: '버섯 돌솥밥', en: 'Mushroom hot-pot rice' }, price: '₩14,000', tags: [], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: curated },
      { name: { ko: '불고기 돌솥밥', en: 'Bulgogi hot-pot rice' }, price: '₩17,000', tags: ['beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'high', fat: 'high', inference: curated },
    ],
  },
  {
    id: 'r3',
    foodCat: 'korean',
    name: { ko: '명동해물포차' },
    cat: { ko: '한식 · 해산물', en: 'Korean · Seafood' },
    lat: 37.5648, lng: 126.9832,
    source: 'mock',
    menus: [
      { name: { ko: '해물파전', en: 'Seafood scallion pancake' }, price: '₩18,000', tags: ['shellfish', 'mollusk', 'wheat', 'egg', 'pungent'], sodium: 'mid', sugar: 'low', inference: curated },
      { name: { ko: '새우장 정식', en: 'Soy-marinated shrimp set' }, price: '₩16,000', tags: ['shellfish', 'soy'], sodium: 'high', sugar: 'mid', purine: 'high', inference: curated },
      { name: { ko: '매운 낙지볶음', en: 'Spicy stir-fried octopus' }, price: '₩17,000', tags: ['mollusk', 'pungent'], sodium: 'high', sugar: 'high', purine: 'high', spicy: 'high', inference: curated },
    ],
  },
  {
    id: 'r4',
    foodCat: 'western',
    name: { ko: '서울그린테이블' },
    cat: { ko: '채식 · 샐러드', en: 'Vegetarian · Salads' },
    lat: 37.5661, lng: 126.9822,
    source: 'mock',
    menus: [
      { name: { ko: '두부 포케볼', en: 'Tofu poke bowl' }, price: '₩13,500', tags: ['soy'], sodium: 'low', sugar: 'low', vegiOk: true, veganOk: true, inference: curated },
      { name: { ko: '곡물 샐러드 (땅콩드레싱)', en: 'Grain salad (peanut dressing)' }, price: '₩12,000', tags: ['peanut', 'soy'], sodium: 'low', sugar: 'mid', vegiOk: true, veganOk: true, inference: curated },
      { name: { ko: '리코타 치즈 샐러드', en: 'Ricotta cheese salad' }, price: '₩13,000', tags: ['milk'], sodium: 'low', sugar: 'mid', vegiOk: true, inference: curated },
    ],
  },
  {
    id: 'r5',
    foodCat: 'unique',
    name: { ko: '할랄가든 명동점' },
    cat: { ko: '할랄인증 · 아시안', en: 'Halal-certified · Asian' },
    lat: 37.5643, lng: 126.9871,
    source: 'mock',
    halalCert: true,
    menus: [
      { name: { ko: '치킨 비리야니', en: 'Chicken biryani' }, price: '₩15,000', tags: ['chicken', 'pungent'], sodium: 'mid', sugar: 'low', halalOk: true, inference: curated },
      { name: { ko: '양고기 커리 & 난', en: 'Lamb curry & naan' }, price: '₩17,000', tags: ['meat', 'wheat', 'milk', 'pungent'], sodium: 'mid', sugar: 'mid', halalOk: true, inference: curated },
      { name: { ko: '야채 커리 (비건)', en: 'Vegetable curry (vegan)' }, price: '₩13,000', tags: ['pungent'], sodium: 'mid', sugar: 'low', halalOk: true, vegiOk: true, veganOk: true, inference: curated },
    ],
  },
  /* ── Jeonju Hanok Village ── */
  {
    id: 'j1',
    foodCat: 'korean',
    name: { ko: '한옥마을 비빔밥집' },
    cat: { ko: '한식 · 전주비빔밥', en: 'Korean · Jeonju bibimbap' },
    lat: 35.8152, lng: 127.1532,
    source: 'mock',
    menus: [
      { name: { ko: '전주비빔밥', en: 'Jeonju bibimbap' }, price: '₩13,000', tags: ['egg', 'beef', 'soy', 'pungent'], sodium: 'mid', sugar: 'mid', inference: curated },
      { name: { ko: '산채비빔밥', en: 'Wild-greens bibimbap (egg removable)' }, price: '₩12,000', tags: ['egg', 'soy'], sodium: 'low', sugar: 'low', vegiOk: true, adjustable: ['egg'], inference: curated },
      { name: { ko: '육회비빔밥', en: 'Beef tartare bibimbap' }, price: '₩16,000', tags: ['egg', 'beef', 'pungent'], sodium: 'mid', sugar: 'mid', inference: curated },
    ],
  },
  {
    id: 'j2',
    foodCat: 'korean',
    name: { ko: '풍남문 콩나물국밥' },
    cat: { ko: '한식 · 국밥', en: 'Korean · Rice soup' },
    lat: 35.8135, lng: 127.1508,
    source: 'mock',
    menus: [
      { name: { ko: '콩나물국밥', en: 'Bean-sprout rice soup (egg removable)' }, price: '₩9,000', tags: ['egg', 'soy', 'pungent'], sodium: 'high', sugar: 'low', adjustable: ['egg'], inference: curated },
      { name: { ko: '오징어 콩나물국밥', en: 'Squid bean-sprout rice soup' }, price: '₩11,000', tags: ['mollusk', 'egg', 'soy', 'pungent'], sodium: 'high', sugar: 'low', purine: 'high', inference: curated },
    ],
  },
  {
    id: 'j3',
    foodCat: 'cafe',
    name: { ko: '한지카페 다과상' },
    cat: { ko: '카페 · 전통디저트', en: 'Cafe · Traditional desserts' },
    lat: 35.8164, lng: 127.1545,
    source: 'mock',
    menus: [
      { name: { ko: '수제 약과 세트', en: 'Handmade yakgwa set' }, price: '₩8,000', tags: ['wheat'], sodium: 'low', sugar: 'high', vegiOk: true, inference: curated },
      { name: { ko: '오미자차', en: 'Omija tea' }, price: '₩6,500', tags: [], sodium: 'low', sugar: 'mid', vegiOk: true, veganOk: true, halalOk: true, inference: curated },
      { name: { ko: '인절미 토스트', en: 'Injeolmi toast' }, price: '₩9,000', tags: ['wheat', 'milk', 'soy'], sodium: 'low', sugar: 'high', cross: ['peanut'], vegiOk: true, inference: curated },
    ],
  },
];

export function isMockId(id: string): boolean {
  return MOCK_RESTAURANTS.some((r) => r.id === id);
}

export function mockById(id: string): RestaurantDetail | undefined {
  return MOCK_RESTAURANTS.find((r) => r.id === id);
}
