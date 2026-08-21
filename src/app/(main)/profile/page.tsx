'use client';

import { getStrings } from '@/lib/i18n';
import {
  ALLERGENS,
  CONDITIONS,
  NATIONS,
  PROF_HINT,
  RELIGIOUS,
  SPOKEN_LANGS,
  nationById,
} from '@/lib/i18n/labels';
import { hasRestrictions } from '@/lib/verdict/engine';
import { useProfileStore } from '@/lib/store/profile';
import CareCard from '@/components/CareCard';
import Chips from '@/components/Chips';
import ClientGate from '@/components/ClientGate';
import ProfileSyncBar from '@/components/ProfileSyncBar';

export default function ProfilePage() {
  const {
    profile,
    uiLang,
    setNation,
    setUiLang,
    toggleLang,
    toggleCond,
    toggleAlg,
    toggleRel,
    setEtc,
  } = useProfileStore();
  const s = getStrings(uiLang);
  const nat = nationById(profile.nation);

  const pickNation = (id: string) => {
    const next = profile.nation === id ? null : id;
    setNation(next);
    const n = nationById(next);
    if (n) setUiLang(n.lang);
  };

  return (
    <div className="prof-wrap">
      <div className="prof-title">{s.pfTitle}</div>
      <div className="prof-sub">{s.pfSub}</div>
      <ProfileSyncBar />

      <ClientGate fallback={<div className="skeleton" style={{ height: 200, marginTop: 16 }} />}>
        {(hasRestrictions(profile) || profile.etc.trim()) && (
          <div className="pf-card-slot">
            <CareCard profile={profile} />
            <div className="pf-card-hint">💳 {PROF_HINT[uiLang] ?? PROF_HINT.en}</div>
          </div>
        )}

        <div className="prof-group">
          <h3>
            {s.natT} <span>{s.optional}</span>
          </h3>
          <p>{s.natD}</p>
          <div className="chips">
            {NATIONS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`chip ${profile.nation === n.id ? 'on' : ''}`}
                onClick={() => pickNation(n.id)}
              >
                {n.flag} {n.label[uiLang] ?? n.label.en}
              </button>
            ))}
          </div>
          {nat?.suggest && (
            <div className="nat-hint">
              💡 {nat.suggest === 'halal' ? s.suggestHalal : s.suggestVegi}
            </div>
          )}
        </div>

        <div className="prof-group">
          <h3>{s.langT}</h3>
          <p>{s.langD}</p>
          <Chips items={SPOKEN_LANGS} selected={profile.langs} onToggle={toggleLang} lang={uiLang} />
        </div>

        <div className="prof-group">
          <h3>{s.condT}</h3>
          <p>{s.condD}</p>
          <Chips items={CONDITIONS} selected={profile.cond} onToggle={toggleCond} lang={uiLang} />
        </div>

        <div className="prof-group">
          <h3>{s.algT}</h3>
          <p>{s.algD}</p>
          <Chips items={ALLERGENS} selected={profile.alg} onToggle={toggleAlg} lang={uiLang} />
        </div>

        <div className="prof-group">
          <h3>{s.relT}</h3>
          <p>{s.relD}</p>
          <Chips items={RELIGIOUS} selected={profile.rel} onToggle={toggleRel} lang={uiLang} />
        </div>

        <div className="prof-group">
          <h3>{s.etcT}</h3>
          <p>{s.etcD}</p>
          <textarea
            className="etc-input"
            rows={4}
            placeholder={s.etcPh}
            value={profile.etc}
            onChange={(e) => setEtc(e.target.value)}
          />
        </div>
      </ClientGate>
    </div>
  );
}
