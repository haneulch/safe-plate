'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated, useProfileStore } from '@/lib/store/profile';

export default function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useProfileStore((s) => s.profile.onboarded);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(onboarded ? '/explore' : '/onboarding');
  }, [hydrated, onboarded, router]);

  return (
    <div className="p-[18px]">
      <div className="skeleton" style={{ height: 120, marginTop: 16 }} />
      <div className="skeleton" style={{ height: 80, marginTop: 12 }} />
      <div className="skeleton" style={{ height: 80, marginTop: 12 }} />
    </div>
  );
}
