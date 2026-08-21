import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createAuthClient, isSupabaseAuthConfigured } from '@/lib/supabase/server';
import { sanitizeProfile } from '@/lib/stats/profile-validate';

export const runtime = 'nodejs';

/**
 * 로그인 사용자의 식이 프로필 저장/복원 (기기 간 동기화).
 * 세션은 쿠키(anon key)로 확인하고, 데이터 접근은 service role로 수행.
 * 익명 통계(/api/stats)와 분리 — 여기 데이터는 통계에 쓰지 않는다.
 */
let db: SupabaseClient | null = null;
const getDb = () => {
  if (!db) {
    db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return db;
};

const enabled = () =>
  isSupabaseAuthConfigured() &&
  !!process.env.SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sessionUserId(): Promise<string | null> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  if (!enabled()) return NextResponse.json({ error: 'not configured' }, { status: 501 });
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await getDb()
    .from('safeplate_profiles')
    .select('profile, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('profile get failed:', error.message);
    return NextResponse.json({ error: 'read failed' }, { status: 500 });
  }
  return NextResponse.json({ profile: data?.profile ?? null, updatedAt: data?.updated_at ?? null });
}

export async function PUT(req: NextRequest) {
  if (!enabled()) return NextResponse.json({ error: 'not configured' }, { status: 501 });
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const profile = sanitizeProfile(body?.profile);
  if (!profile) return NextResponse.json({ error: 'invalid profile' }, { status: 400 });

  const { error } = await getDb()
    .from('safeplate_profiles')
    .upsert({ user_id: userId, profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) {
    console.error('profile put failed:', error.message);
    return NextResponse.json({ error: 'write failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
