import { NextRequest, NextResponse } from 'next/server';
import type { Menu } from '@/lib/types';
import { ingredientsByReportNo, isMfdsEnabled, productByBarcode } from '@/lib/mfds/client';
import { mockProductByBarcode } from '@/lib/mfds/mock';
import { productToMenu } from '@/lib/inference/ingredients';
import { TtlCache } from '@/lib/cache';

export const runtime = 'nodejs';

export interface ProductResponse {
  product: {
    barcode: string;
    name: string;
    maker?: string;
    category?: string;
    ingredients?: string;
  };
  menu: Menu;
  source: 'mfds' | 'mock';
}

const cache = new TtlCache<ProductResponse>(500, 24 * 60 * 60 * 1000);

export async function GET(req: NextRequest, ctx: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await ctx.params;
  if (!/^\d{8,14}$/.test(barcode)) {
    return NextResponse.json({ error: 'invalid barcode' }, { status: 400 });
  }

  const mock = mockProductByBarcode(barcode);
  if (mock) {
    const body: ProductResponse = {
      product: {
        barcode,
        name: mock.name,
        maker: mock.maker,
        category: mock.category,
        ingredients: mock.ingredients,
      },
      menu: productToMenu(mock.name, mock.ingredients),
      source: 'mock',
    };
    return NextResponse.json(body, { headers: { 'x-safeplate-source': 'mock' } });
  }

  if (!isMfdsEnabled()) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const cached = cache.get(barcode);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'x-safeplate-source': 'mfds', 'x-safeplate-cache': 'hit' },
    });
  }

  try {
    const c005 = await productByBarcode(barcode);
    if (!c005) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const c002 = await ingredientsByReportNo(c005.PRDLST_REPORT_NO);
    const ingredients = c002?.RAWMTRL_NM ?? '';
    const body: ProductResponse = {
      product: {
        barcode,
        name: c005.PRDLST_NM,
        maker: c005.BSSH_NM,
        category: c005.PRDLST_DCNM,
        ingredients: ingredients || undefined,
      },
      menu: productToMenu(c005.PRDLST_NM, ingredients),
      source: 'mfds',
    };
    cache.set(barcode, body);
    return NextResponse.json(body, { headers: { 'x-safeplate-source': 'mfds' } });
  } catch (e) {
    console.error('MFDS lookup failed:', e);
    return NextResponse.json({ error: 'upstream unavailable', degraded: true }, { status: 502 });
  }
}
