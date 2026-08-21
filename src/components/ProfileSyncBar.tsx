'use client';

// 프로필 페이지 상단: 로그인 상태 + 기기 간 프로필 동기화.
// 시맨틱: 로그인 시 서버 프로필이 있으면 그걸 적용, 없으면 로컬을 업로드.
//         이후 로컬 변경은 1.5s 디바운스로 자동 저장 (last-write-wins).
// Supabase env가 빌드에 없으면 아무것도 렌더하지 않는다.
import { useEffect, useRef, useState } from 'react';
import { getStrings } from '@/lib/i18n';
import { useProfileStore } from '@/lib/store/profile';
import type { Profile } from '@/lib/types';
import { createBrowserSupabase, isSupabaseAuthConfigured } from '@/lib/supabase/browser';

type SessionUser = { id: string; name: string } | null;

export default function ProfileSyncBar() {
  const uiLang = useProfileStore((st) => st.uiLang);
  const s = getStrings(uiLang);
  const [user, setUser] = useState<SessionUser>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const enabled = isSupabaseAuthConfigured();
  const applyingRemote = useRef(false);

  // 세션 확인 + 최초 동기화
  useEffect(() => {
    if (!enabled) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setReady(true);
      if (!u) return;
      setUser({
        id: u.id,
        name: (u.user_metadata?.full_name as string) ?? u.email ?? 'User',
      });
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const { profile } = (await res.json()) as { profile: Profile | null };
        if (profile) {
          // 서버 프로필 적용 — subscribe 루프 방지 플래그
          applyingRemote.current = true;
          useProfileStore.setState({ profile });
          applyingRemote.current = false;
        } else {
          const local = useProfileStore.getState().profile;
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ profile: local }),
          });
        }
      } catch {
        /* 네트워크 실패 시 로컬로 계속 동작 */
      }
    });
  }, [enabled]);

  // 로그인 상태에서 프로필 변경 → 디바운스 저장
  useEffect(() => {
    if (!enabled || !user) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useProfileStore.subscribe((st, prev) => {
      if (st.profile === prev.profile || applyingRemote.current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fetch('/api/profile', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profile: useProfileStore.getState().profile }),
        }).catch(() => {});
      }, 1500);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [enabled, user]);

  if (!enabled || !ready) return null;

  const signIn = async () => {
    setBusy(true);
    await createBrowserSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    setBusy(true);
    await createBrowserSupabase().auth.signOut();
    window.location.reload();
  };

  return (
    <div className="syncbar">
      {user ? (
        <>
          <span className="syncbar-label">{s.pfSignedAs.replace('{name}', user.name)}</span>
          <button className="syncbar-btn" onClick={signOut} disabled={busy}>
            {s.pfSignOut}
          </button>
        </>
      ) : (
        <>
          <span className="syncbar-label">{s.pfSyncHint}</span>
          <button className="syncbar-btn" onClick={signIn} disabled={busy}>
            {s.pfSignIn}
          </button>
        </>
      )}
    </div>
  );
}
