import { NextRequest, NextResponse } from 'next/server';
import type { RestaurantDetail, RestaurantDetailResponse, UiLang } from '@/lib/types';
import { isUiLang } from '@/lib/i18n';
import { detailCommon, detailFoodIntro, isTourApiEnabled } from '@/lib/tourapi/client';
import { mapDetail } from '@/lib/tourapi/mapper';
import { mockById } from '@/lib/tourapi/mock';
import { TtlCache } from '@/lib/cache';

export const runtime = 'nodejs';

const detailCache = new TtlCache<RestaurantDetail>(500, 24 * 60 * 60 * 1000);

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const langParam = req.nextUrl.searchParams.get('lang');
  const lang: UiLang = isUiLang(langParam) ? langParam : 'en';
  // 목록이 ko 서비스로 폴백된 항목은 contentId가 ko 서비스 소속 — svc로 그 서비스를 지정한다.
  const svcParam = req.nextUrl.searchParams.get('svc');
  const svc: UiLang = isUiLang(svcParam) ? svcParam : lang;

  // Mock ids resolve directly even in live mode — keeps mixed mode and e2e stable.
  const mock = mockById(id);
  if (mock) {
    const body: RestaurantDetailResponse = { restaurant: mock, source: 'mock' };
    return NextResponse.json(body, { headers: { 'x-safeplate-source': 'mock' } });
  }

  if (!isTourApiEnabled() || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const key = `detail:${svc}:${id}`;
  const cached = detailCache.get(key);
  if (cached) {
    const body: RestaurantDetailResponse = { restaurant: cached, source: 'tourapi' };
    return NextResponse.json(body, {
      headers: { 'x-safeplate-source': 'tourapi', 'x-safeplate-cache': 'hit' },
    });
  }

  try {
    const [common, intro] = await Promise.all([detailCommon(svc, id), detailFoodIntro(svc, id)]);
    if (!common) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const restaurant = await mapDetail(svc, id, common, intro);
    detailCache.set(key, restaurant);
    const body: RestaurantDetailResponse = { restaurant, source: 'tourapi' };
    return NextResponse.json(body, {
      headers: {
        'x-safeplate-source': 'tourapi',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    console.error('TourAPI detail failed:', e);
    return NextResponse.json({ error: 'upstream unavailable', degraded: true }, { status: 502 });
  }
}
