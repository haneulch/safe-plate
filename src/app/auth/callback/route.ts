import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** GET /auth/callback?code=... — Google OAuth 리다이렉트 처리 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  if (code) {
    const supabase = await createAuthClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  // 상대 Location: 터널 뒤에서 request.url host가 0.0.0.0:3000으로 보이므로
  // 절대 URL 생성 금지 (sanneomeo 6ae7816과 동일한 이유).
  return new NextResponse(null, { status: 302, headers: { Location: '/profile' } });
}
