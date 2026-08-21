// 서버(라우트 핸들러)용 Supabase 클라이언트 — 쿠키 세션 기반 (Auth 용도).
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function isSupabaseAuthConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component에서는 set 불가 — middleware가 세션을 갱신하므로 무시.
          }
        },
      },
    },
  );
}
