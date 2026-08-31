'use client';

// 프로필 페이지 상단: 로그인 상태 표시 + 로그인/로그아웃 버튼.
// 실제 프로필 동기화 로직은 루트 레이아웃의 <ProfileSync />가 담당한다.
// Supabase env가 빌드에 없으면 아무것도 렌더하지 않는다.
import { useEffect, useState } from 'react';
import { getStrings } from '@/lib/i18n';
import { useProfileStore } from '@/lib/store/profile';
import { createBrowserSupabase, isSupabaseAuthConfigured } from '@/lib/supabase/browser';

type SessionUser = { id: string; name: string } | null;

export default function ProfileSyncBar() {
  const uiLang = useProfileStore((st) => st.uiLang);
  const s = getStrings(uiLang);
  const [user, setUser] = useState<SessionUser>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const enabled = isSupabaseAuthConfigured();

  useEffect(() => {
    if (!enabled) return;
    createBrowserSupabase()
      .auth.getUser()
      .then(({ data: { user: u } }) => {
        setReady(true);
        if (!u) return;
        setUser({
          id: u.id,
          name: (u.user_metadata?.full_name as string) ?? u.email ?? 'User',
        });
      });
  }, [enabled]);

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
