// 브라우저용 Supabase 클라이언트 — 로그인/로그아웃 전용.
// NEXT_PUBLIC_* 값은 빌드 시점에 인라인된다 (Docker build args로 주입).
import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseAuthConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
