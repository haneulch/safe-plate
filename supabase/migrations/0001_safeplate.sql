-- SafePlate 익명 프로필 통계: data/profile-stats.jsonl → Postgres 이전.
-- 컬럼은 src/lib/stats/snapshot.ts 의 StatsSnapshot 그대로.
-- 설계 원칙 유지: 식별자 없음(IP·user id·자유텍스트·위치 없음), ts는 시간 단위 절사.
-- 접근은 서버(service role)만 — RLS 활성 + 정책 없음 = anon 차단.

create table if not exists public.safeplate_stats (
  id      bigint generated always as identity primary key,
  ts      timestamptz not null,          -- 시간 단위 절사된 타임스탬프
  nation  text,
  langs   text[] not null default '{}',
  cond    text[] not null default '{}',
  alg     text[] not null default '{}',
  rel     text[] not null default '{}',
  has_etc boolean not null default false,
  v       int not null default 1
);

alter table public.safeplate_stats enable row level security;
-- 정책 의도적으로 없음: service role만 통과.
