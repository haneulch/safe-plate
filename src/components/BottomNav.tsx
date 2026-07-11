'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStrings } from '@/lib/i18n';
import { useProfileStore } from '@/lib/store/profile';

export default function BottomNav() {
  const pathname = usePathname();
  const lang = useProfileStore((s) => s.uiLang);
  const s = getStrings(lang);
  const isExplore = pathname.startsWith('/explore') || pathname.startsWith('/restaurant');
  return (
    <nav className="sp-nav">
      <Link href="/explore" className={isExplore ? 'on' : ''}>
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span>{s.nav[0]}</span>
      </Link>
      <Link href="/dishes" className={pathname.startsWith('/dishes') ? 'on' : ''}>
        <svg viewBox="0 0 24 24">
          <path d="M4 3v7c0 1.5 1 2.5 2.5 2.5S9 11.5 9 10V3M6.5 3v18" />
          <path d="M15 3c-1.5 1.5-2 4-2 6 0 2.5 1.5 4 3.5 4V21M16.5 3c1 1.5 1.5 4 1.5 6" />
        </svg>
        <span>{s.nav[1]}</span>
      </Link>
      <Link href="/scan" className={pathname.startsWith('/scan') ? 'on' : ''}>
        <svg viewBox="0 0 24 24">
          <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
          <path d="M7 12h.01M11 12h2M17 12h.01" />
        </svg>
        <span>{s.nav[2]}</span>
      </Link>
      <Link href="/card" className={pathname.startsWith('/card') ? 'on' : ''}>
        <svg viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M7 10h7M7 14h4" />
        </svg>
        <span>{s.nav[3]}</span>
      </Link>
      <Link href="/profile" className={pathname.startsWith('/profile') ? 'on' : ''}>
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
        </svg>
        <span>{s.nav[4]}</span>
      </Link>
    </nav>
  );
}
