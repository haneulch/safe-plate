import { NextRequest, NextResponse } from 'next/server';
import type { RestaurantsResponse, RestaurantSummary, UiLang } from '@/lib/types';
import { isUiLang } from '@/lib/i18n';
import { isTourApiEnabled, locationBasedFood } from '@/lib/tourapi/client';
import { mapListItem } from '@/lib/tourapi/mapper';
import { MOCK_RESTAURANTS } from '@/lib/tourapi/mock';
import { haversineM } from '@/lib/geo-util';
import { TtlCache } from '@/lib/cache';

export const runtime = 'nodejs';

const listCache = new TtlCache<RestaurantSummary[]>(200, 10 * 60 * 1000);

function mockList(lat: number, lng: number): RestaurantSummary[] {
  return MOCK_RESTAURANTS.map((r) => {
    const { menus, ...summary } = r;
    void menus; // list responses never include menus
    return { ...summary, distanceM: haversineM(lat, lng, summary.lat, summary.lng) };
  }).sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = parseFloat(sp.get('lat') ?? '');
  const lng = parseFloat(sp.get('lng') ?? '');
  const radius = Math.min(Math.max(parseInt(sp.get('radius') ?? '2000', 10) || 2000, 100), 5000);
  const langParam = sp.get('lang');
  const lang: UiLang = isUiLang(langParam) ? langParam : 'en';

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 });
  }

  if (!isTourApiEnabled()) {
    const body: RestaurantsResponse = { restaurants: mockList(lat, lng), source: 'mock' };
    return NextResponse.json(body, { headers: { 'x-safeplate-source': 'mock' } });
  }

  // ~110m grid so nearby users share cache entries (TourAPI daily quota is small)
  const key = `list:${lang}:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`;
  const cached = listCache.get(key);
  if (cached) {
    const body: RestaurantsResponse = { restaurants: cached, source: 'tourapi' };
    return NextResponse.json(body, {
      headers: { 'x-safeplate-source': 'tourapi', 'x-safeplate-cache': 'hit' },
    });
  }

  try {
    const items = await locationBasedFood(lang, lat, lng, radius);
    const restaurants = items.map((i) => mapListItem(i, lang));
    listCache.set(key, restaurants);
    const body: RestaurantsResponse = { restaurants, source: 'tourapi' };
    return NextResponse.json(body, {
      headers: {
        'x-safeplate-source': 'tourapi',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    });
  } catch (e) {
    console.error('TourAPI list failed, degrading to mock:', e);
    const body: RestaurantsResponse = { restaurants: mockList(lat, lng), source: 'mock', degraded: true };
    return NextResponse.json(body, { headers: { 'x-safeplate-source': 'mock' } });
  }
}
