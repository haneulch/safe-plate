import 'server-only';
import type { UiLang } from '../types';
import type {
  TourApiCommonItem,
  TourApiFoodIntroItem,
  TourApiListBody,
  TourApiListItem,
} from './types';

const BASE = 'https://apis.data.go.kr/B551011';

/**
 * TourAPI has no Arabic service; ar falls back to English data while the UI
 * chrome stays Arabic/RTL. Multilingual services have their own contentids —
 * list and detail must always use the same service.
 */
const SERVICE: Record<UiLang, string> = {
  ko: 'KorService2',
  en: 'EngService2',
  ja: 'JpnService2',
  zh: 'ChsService2',
  ar: 'EngService2',
};

/** Restaurant contentTypeId differs per service: 39 on KorService2, 82 on multilingual services. */
const FOOD_TYPE: Record<UiLang, string> = {
  ko: '39',
  en: '82',
  ja: '82',
  zh: '82',
  ar: '82',
};

export function isTourApiEnabled(): boolean {
  return !!process.env.TOUR_API_KEY;
}

export class TourApiError extends Error {}

async function call<T>(
  lang: UiLang,
  operation: string,
  params: Record<string, string>,
  revalidate: number,
): Promise<TourApiListBody<T>> {
  const key = process.env.TOUR_API_KEY;
  if (!key) throw new TourApiError('TOUR_API_KEY not configured');
  const qs = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'SafePlate',
    _type: 'json',
    ...params,
  });
  // serviceKey appended raw: data.go.kr keys are already URL-encoded.
  const url = `${BASE}/${SERVICE[lang]}/${operation}?serviceKey=${key}&${qs.toString()}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new TourApiError(`TourAPI HTTP ${res.status}`);
  const text = await res.text();
  let body: TourApiListBody<T>;
  try {
    // Key errors return XML even with _type=json — treat parse failure as upstream failure.
    body = JSON.parse(text);
  } catch {
    throw new TourApiError(`TourAPI non-JSON response: ${text.slice(0, 120)}`);
  }
  const code = body.response?.header?.resultCode;
  if (code && code !== '0000') {
    throw new TourApiError(`TourAPI error ${code}: ${body.response?.header?.resultMsg}`);
  }
  return body;
}

function items<T>(body: TourApiListBody<T>): T[] {
  const it = body.response?.body?.items;
  if (!it || typeof it === 'string') return [];
  return it.item ?? [];
}

export async function locationBasedFood(
  lang: UiLang,
  lat: number,
  lng: number,
  radiusM: number,
): Promise<TourApiListItem[]> {
  const body = await call<TourApiListItem>(
    lang,
    'locationBasedList2',
    {
      mapX: String(lng),
      mapY: String(lat),
      radius: String(radiusM),
      contentTypeId: FOOD_TYPE[lang],
      arrange: 'E', // distance
      numOfRows: '30',
      pageNo: '1',
    },
    600,
  );
  return items(body);
}

export async function detailCommon(lang: UiLang, contentId: string): Promise<TourApiCommonItem | undefined> {
  const body = await call<TourApiCommonItem>(lang, 'detailCommon2', { contentId }, 86400);
  return items(body)[0];
}

export async function detailFoodIntro(lang: UiLang, contentId: string): Promise<TourApiFoodIntroItem | undefined> {
  const body = await call<TourApiFoodIntroItem>(
    lang,
    'detailIntro2',
    { contentId, contentTypeId: FOOD_TYPE[lang] },
    86400,
  );
  return items(body)[0];
}
