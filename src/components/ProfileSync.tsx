'use client';

// 로그인 상태의 로컬 프로필 ↔ Supabase 동기화. 루트 레이아웃에 상주 (UI 없음).
// 시맨틱: 최초 세션 확인 시 서버 프로필이 있으면 적용하되, 조회 중 로컬이 수정됐다면
//         로컬 우선으로 업로드. 이후 로컬 변경은 1.5s 디바운스 저장(last-write-wins),
//         페이지 이탈/숨김 시 대기 중인 저장을 즉시 flush해 유실을 막는다.
// Supabase env가 빌드에 없으면 아무것도 하지 않는다.
import { useEffect } from 'react';
import { useProfileStore } from '@/lib/store/profile';
import type { Profile } from '@/lib/types';
import { createBrowserSupabase, isSupabaseAuthConfigured } from '@/lib/supabase/browser';

const SAVE_DEBOUNCE_MS = 1500;

export default function ProfileSync() {
  const enabled = isSupabaseAuthConfigured();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let signedIn = false;
    let applyingRemote = false;
    let pendingSave = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const put = (keepalive = false) =>
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile: useProfileStore.getState().profile }),
        keepalive,
      }).catch(() => {});

    // 탭 종료/이동 직전 호출될 수 있으므로 keepalive로 전송
    const flush = () => {
      if (!pendingSave) return;
      pendingSave = false;
      if (timer) clearTimeout(timer);
      timer = null;
      void put(true);
    };

    const unsub = useProfileStore.subscribe((st, prev) => {
      if (!signedIn || applyingRemote || st.profile === prev.profile) return;
      pendingSave = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        pendingSave = false;
        timer = null;
        void put();
      }, SAVE_DEBOUNCE_MS);
    });

    (async () => {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      // localStorage 리하이드 완료 후에만 로컬/서버 비교
      if (!useProfileStore.persist.hasHydrated()) {
        await new Promise<void>((resolve) => {
          const off = useProfileStore.persist.onFinishHydration(() => {
            off();
            resolve();
          });
        });
      }
      if (cancelled) return;

      const localBefore = useProfileStore.getState().profile;
      signedIn = true;
      try {
        const res = await fetch('/api/profile');
        if (!res.ok || cancelled) return;
        const { profile } = (await res.json()) as { profile: Profile | null };
        // 조회하는 사이 사용자가 수정했다면 서버 응답으로 덮어쓰지 않는다
        const editedMeanwhile = useProfileStore.getState().profile !== localBefore;
        if (profile && !editedMeanwhile) {
          applyingRemote = true;
          useProfileStore.setState({ profile });
          applyingRemote = false;
        } else if (!editedMeanwhile) {
          await put();
        }
        // editedMeanwhile이면 디바운스 저장이 이미 예약돼 있음
      } catch {
        /* 네트워크 실패 시 로컬로 계속 동작 */
      }
    })();

    window.addEventListener('pagehide', flush);
    return () => {
      cancelled = true;
      unsub();
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [enabled]);

  return null;
}
