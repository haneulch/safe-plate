'use client';

import { getStrings } from '@/lib/i18n';
import { DISHES_GLOBAL, nationById } from '@/lib/i18n/labels';
import { judgeMenu } from '@/lib/verdict/engine';
import { reasonText } from '@/lib/verdict/reasons';
import { useProfileStore } from '@/lib/store/profile';

const stripTags = (html: string) => html.replace(/<[^>]+>/g, '');

export default function RecoSection() {
  const lang = useProfileStore((s) => s.uiLang);
  const profile = useProfileStore((s) => s.profile);
  const s = getStrings(lang);
  const nat = nationById(profile.nation);
  if (!nat || nat.id === 'kr') return null;
  const dishes = nat.dishes ?? DISHES_GLOBAL;

  return (
    <div>
      <div className="section-label">{s.recoTitle(nat.flag, nat.label[lang] ?? nat.label.en)}</div>
      <div className="reco-scroll">
        {dishes.map((d, i) => {
          const v = judgeMenu(profile, d);
          const first = v.reasons[0] ? stripTags(reasonText(v.reasons[0].reason, lang)) : '';
          return (
            <div key={d.name.ko} className="reco-card">
              <div className="reco-rank">{s.recoRank(i + 1)}</div>
              <div className="reco-name">
                {d.name.ko}
                {lang !== 'ko' && <small>{d.name.en}</small>}
              </div>
              <span className={`reco-badge ${v.level}`}>{s.badge[v.level]}</span>
              <div className="reco-note">{first}</div>
            </div>
          );
        })}
      </div>
      <div className="reco-src">{s.recoSrc}</div>
    </div>
  );
}
