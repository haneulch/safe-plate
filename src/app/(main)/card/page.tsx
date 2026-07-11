'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UiLang } from '@/lib/types';
import { getStrings } from '@/lib/i18n';
import { CARE_LANGS } from '@/lib/i18n/labels';
import { hasRestrictions } from '@/lib/verdict/engine';
import { useProfileStore } from '@/lib/store/profile';
import CareCard from '@/components/CareCard';
import ClientGate from '@/components/ClientGate';

export default function CardPage() {
  const router = useRouter();
  const lang = useProfileStore((s) => s.uiLang);
  const profile = useProfileStore((s) => s.profile);
  const s = getStrings(lang);
  const [noteLang, setNoteLang] = useState<UiLang>(lang === 'ko' ? 'en' : lang);
  const sub = getStrings(noteLang);

  const empty = !hasRestrictions(profile) && !profile.etc.trim();

  return (
    <div className="card-wrap">
      <ClientGate fallback={<div className="skeleton" style={{ height: 260 }} />}>
        {empty ? (
          <div className="empty-note">
            <span dangerouslySetInnerHTML={{ __html: s.cardEmpty }} />
            <br />
            <button
              type="button"
              className="cta"
              style={{ maxWidth: 230 }}
              onClick={() => router.push('/profile')}
            >
              {s.cardRegister}
            </button>
          </div>
        ) : (
          <>
            <div className="card-intro">{s.cardIntro}</div>
            <CareCard profile={profile} />
            <div className="lang-row">
              {(Object.entries(CARE_LANGS) as [UiLang, string][]).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  className={`lang-btn ${k === noteLang ? 'on' : ''}`}
                  onClick={() => setNoteLang(k)}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="card-intro" dir="auto" style={{ marginTop: 4 }}>
              {sub.cardSub} {sub.cardQ}
            </div>
            <div className="card-hint">{s.cardHint}</div>
          </>
        )}
      </ClientGate>
    </div>
  );
}
