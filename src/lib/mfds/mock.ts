/**
 * Demo products for testing the scan flow without the MFDS API
 * (and as degrade target when the API is down). Barcodes are fictional.
 */
export interface MockProduct {
  barcode: string;
  name: string;
  maker: string;
  category: string;
  ingredients: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    barcode: '8801234500011',
    name: '데모 참치마요 삼각김밥',
    maker: 'SafePlate Demo',
    category: '즉석섭취식품',
    ingredients: '백미(국산), 참치(가다랑어), 마요네즈[대두유, 난황, 정제수], 김, 간장(대두, 밀 함유), 참기름',
  },
  {
    barcode: '8801234500028',
    name: '데모 초코 쿠키',
    maker: 'SafePlate Demo',
    category: '과자',
    ingredients: '밀가루(밀:미국산), 설탕, 식물성유지, 코코아분말, 전지분유(우유), 계란, 대두레시틴 · 이 제품은 땅콩, 호두를 사용한 제품과 같은 제조시설에서 제조하고 있습니다',
  },
  {
    barcode: '8801234500035',
    name: '데모 야채주스',
    maker: 'SafePlate Demo',
    category: '음료',
    ingredients: '토마토농축액(이스라엘산), 당근즙, 셀러리즙, 정제수, 비타민C',
  },
];

export function mockProductByBarcode(barcode: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.barcode === barcode);
}
