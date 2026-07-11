import { NextResponse } from 'next/server';
import { isTourApiEnabled } from '@/lib/tourapi/client';
import { isMfdsEnabled } from '@/lib/mfds/client';

export const runtime = 'nodejs';

/** Liveness + integration mode probe for container orchestration. */
export function GET() {
  return NextResponse.json({
    status: 'ok',
    tourapi: isTourApiEnabled() ? 'live' : 'mock',
    mfds: isMfdsEnabled() ? 'live' : 'mock',
  });
}
