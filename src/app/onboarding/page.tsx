'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStrings } from '@/lib/i18n';
import {
  ALLERGENS,
  CONDITIONS,
  NATIONS,
  RELIGIOUS,
  SPOKEN_LANGS,
  nationById,
} from '@/lib/i18n/labels';
import { useProfileStore } from '@/lib/store/profile';
import { toSnapshot } from '@/lib/stats/snapshot';
import Chips from '@/components/Chips';

const OB_STEPS = ['lang', 'cond', 'alg', 'rel', 'etc'] as const;
type ObStep = (typeof OB_STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
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
    completeOnboarding,
  } = useProfileStore();
  const [phase, setPhase] = useState<'welcome' | 'wizard'>('welcome');
  const [step, setStep] = useState(0);
  const s = getStrings(uiLang);

  const pickNation = (id: string) => {
    setNation(id);
    const n = nationById(id);
    if (n) setUiLang(n.lang);
  };

  const next = () => {
    if (step < OB_STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      completeOnboarding();
      // Fire-and-forget anonymous selection stats (whitelisted ids only —
      // free text, location and identifiers are never sent). sendBeacon
      // survives the page navigation below.
      try {
        const payload = JSON.stringify(toSnapshot(profile));
        if (!navigator.sendBeacon?.('/api/stats', new Blob([payload], { type: 'application/json' }))) {
          fetch('/api/stats', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
        }
      } catch {
        /* stats are best-effort */
      }
      router.replace('/card');
    }
  };

  if (phase === 'welcome') {
    return (
      <div className="flex min-h-dvh flex-col">
        <div className="welcome-art">
          <div className="w-kicker">SAFEPLATE KOREA</div>
          <div className="w-title w-line" dangerouslySetInnerHTML={{ __html: s.welcomeTitle }} />
          <div
            className="w-sub w-line"
            style={{ animationDelay: '.12s' }}
            dangerouslySetInnerHTML={{ __html: s.welcomeSub }}
          />
        </div>
        <div className="welcome-body">
          <div className="w-q">{s.welcomeQ}</div>
          <div className="w-note">{s.welcomeNote}</div>
          <div className="nation-grid">
            {NATIONS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`nation-btn ${profile.nation === n.id ? 'on' : ''}`}
                onClick={() => pickNation(n.id)}
              >
                <span className="f">{n.flag}</span>
                <span className="n">{n.label[uiLang] ?? n.label.en}</span>
              </button>
            ))}
          </div>
          {profile.nation && <div className="w-greet">{s.welcomeGreet}</div>}
          <button
            type="button"
            className="cta"
            disabled={!profile.nation}
            onClick={() => {
              setPhase('wizard');
              window.scrollTo(0, 0);
            }}
          >
            {s.continueBtn}
          </button>
        </div>
      </div>
    );
  }

  const key: ObStep = OB_STEPS[step];
  const defs: Record<ObStep, [string, string]> = {
    lang: [s.langT, s.langD],
    cond: [s.condT, s.condD],
    alg: [s.algT, s.algD],
    rel: [s.relT, s.relD],
    etc: [s.etcT, s.etcD],
  };
  const nat = nationById(profile.nation);

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="ob-head">
        <div className="ob-progress">
          {OB_STEPS.map((k, i) => (
            <span key={k} className={`seg ${i <= step ? 'on' : ''}`} />
          ))}
          <span className="cnt">
            {step + 1} / {OB_STEPS.length}
          </span>
        </div>
        <div className="ob-title">{defs[key][0]}</div>
        <div className="ob-sub">{defs[key][1]}</div>
      </div>
      <div className="ob-body">
        {key === 'lang' && (
          <Chips items={SPOKEN_LANGS} selected={profile.langs} onToggle={toggleLang} lang={uiLang} />
        )}
        {key === 'cond' && (
          <Chips items={CONDITIONS} selected={profile.cond} onToggle={toggleCond} lang={uiLang} />
        )}
        {key === 'alg' && (
          <Chips items={ALLERGENS} selected={profile.alg} onToggle={toggleAlg} lang={uiLang} />
        )}
        {key === 'rel' && (
          <>
            <Chips items={RELIGIOUS} selected={profile.rel} onToggle={toggleRel} lang={uiLang} />
            {nat?.suggest && (
              <div className="nat-hint">
                💡 {nat.suggest === 'halal' ? s.suggestHalal : s.suggestVegi}
              </div>
            )}
          </>
        )}
        {key === 'etc' && (
          <textarea
            className="etc-input"
            rows={5}
            placeholder={s.etcPh}
            value={profile.etc}
            onChange={(e) => setEtc(e.target.value)}
          />
        )}
        <div className="ob-nav">
          <button
            type="button"
            className="cta ghost"
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
            onClick={() => setStep(Math.max(0, step - 1))}
          >
            {s.backBtn}
          </button>
          <button type="button" className="cta" onClick={next}>
            {step === OB_STEPS.length - 1 ? s.start : s.nextBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
