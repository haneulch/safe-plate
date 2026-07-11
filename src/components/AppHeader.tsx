'use client';

import { getStrings } from '@/lib/i18n';
import { ALLERGENS, CONDITIONS, RELIGIOUS, nationById } from '@/lib/i18n/labels';
import { useProfileStore } from '@/lib/store/profile';
import ClientGate from './ClientGate';

const stripParen = (s: string) => s.split(' (')[0].split('（')[0];

export default function AppHeader() {
  const lang = useProfileStore((s) => s.uiLang);
  const profile = useProfileStore((s) => s.profile);
  const s = getStrings(lang);
  const nat = nationById(profile.nation);
  const tags = [
    ...(nat ? [`${nat.flag} ${nat.label[lang] ?? nat.label.en}`] : []),
    ...profile.cond.map((i) => {
      const item = CONDITIONS.find((x) => x.id === i);
      return item ? stripParen(item.label[lang] ?? item.label.en) : '';
    }),
    ...profile.alg.map((i) => {
      const item = ALLERGENS.find((x) => x.id === i);
      return item ? (item.label[lang] ?? item.label.en) : '';
    }),
    ...profile.rel.map((i) => {
      const item = RELIGIOUS.find((x) => x.id === i);
      return item ? stripParen(item.label[lang] ?? item.label.en) : '';
    }),
  ].filter(Boolean);

  return (
    <header className="sp-header">
      <div className="brand-row">
        <div className="brand">
          SafePlate <small>KOREA</small>
        </div>
      </div>
      <ClientGate fallback={<div className="profile-strip" />}>
        <div className="profile-strip">
          {tags.length ? (
            tags.map((t) => (
              <span key={t} className="ptag">
                {t}
              </span>
            ))
          ) : (
            <span className="ptag empty">{s.empty}</span>
          )}
        </div>
      </ClientGate>
    </header>
  );
}
