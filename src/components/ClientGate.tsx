'use client';

import { useHydrated } from '@/lib/store/profile';

/**
 * Renders children only after the profile store has rehydrated from
 * localStorage — prevents hydration mismatches and flash-of-wrong-verdict.
 */
export default function ClientGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hydrated = useHydrated();
  if (!hydrated) return <>{fallback}</>;
  return <>{children}</>;
}
