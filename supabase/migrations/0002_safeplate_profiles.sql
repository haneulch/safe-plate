-- 로그인 사용자의 식이 프로필 저장 (기기 간 동기화용).
-- 익명 통계(safeplate_stats)와 의도적으로 분리 — 통계에는 user id가 없고,
-- 이 테이블은 사용자가 자기 프로필을 스스로 보관하는 용도다.
-- 접근은 서버(service role)만 — RLS 활성 + 정책 없음 = anon 차단.

create table if not exists public.safeplate_profiles (
  user_id    uuid primary key,             -- Supabase Auth 사용자 id
  profile    jsonb not null,               -- src/lib/types.ts 의 Profile (서버에서 whitelist 검증)
  updated_at timestamptz not null default now()
);

alter table public.safeplate_profiles enable row level security;
-- 정책 의도적으로 없음: service role만 통과.
