'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated, useProfileStore } from '@/lib/store/profile';

/* 브랜딩이 인지될 만큼만 잡아두는 최소 노출 시간 */
const SPLASH_MIN_MS = 1100;

export default function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useProfileStore((s) => s.profile.onboarded);
  const [holding, setHolding] = useState(true);

  useEffect(() => {
    router.prefetch('/explore');
    router.prefetch('/onboarding');
    const t = setTimeout(() => setHolding(false), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    if (!hydrated || holding) return;
    router.replace(onboarded ? '/explore' : '/onboarding');
  }, [hydrated, holding, onboarded, router]);

  return (
    <div className="splash">
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 아이콘, 최적화 불필요 */}
      <img src="/icons/icon-192.png" alt="" className="splash-icon" width={88} height={88} />
      <div className="splash-brand">
        SafePlate <small>KOREA</small>
      </div>
      <div className="splash-tag">Eat safely in Korea</div>
      <div className="splash-spinner" aria-hidden />
    </div>
  );
}
