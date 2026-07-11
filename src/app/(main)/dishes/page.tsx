'use client';

import { useState } from 'react';
import { getStrings, loc } from '@/lib/i18n';
import { CATEGORY_LABEL, DISH_CATALOG, DISH_CATEGORIES } from '@/lib/dishes/catalog';
import { judgeMenu } from '@/lib/verdict/engine';
import { reasonText } from '@/lib/verdict/reasons';
import { useProfileStore } from '@/lib/store/profile';
import ClientGate from '@/components/ClientGate';

export default function DishesPage() {
  const lang = useProfileStore((s) => s.uiLang);
  const profile = useProfileStore((s) => s.profile);
  const s = getStrings(lang);
  const [safeOnly, setSafeOnly] = useState(false);

  return (
    <div className="prof-wrap">
      <div className="prof-title">{s.dishesTitle}</div>
      <div className="prof-sub">{s.dishesSub}</div>

      <ClientGate fallback={<div className="skeleton" style={{ height: 240, marginTop: 16 }} />}>
        <div className="chips" style={{ marginTop: 14 }}>
          <button type="button" className={`chip ${!safeOnly ? 'on' : ''}`} onClick={() => setSafeOnly(false)}>
            {s.dishesAll}
          </button>
          <button type="button" className={`chip ${safeOnly ? 'on' : ''}`} onClick={() => setSafeOnly(true)}>
            {s.dishesSafeOnly}
          </button>
        </div>

        {DISH_CATEGORIES.map((cat) => {
          const judged = DISH_CATALOG.filter((d) => d.cat === cat)
            .map((d) => ({ dish: d, v: judgeMenu(profile, d) }))
            .filter(({ v }) => (safeOnly ? v.level === 'g' : true))
            .sort((a, b) => LEVEL_ORDER[a.v.level] - LEVEL_ORDER[b.v.level]);
          if (!judged.length) return null;
          return (
            <div key={cat} className="prof-group">
              <h3>{CATEGORY_LABEL[cat][lang]}</h3>
              <div className="menu-list" style={{ padding: 0 }}>
                {judged.map(({ dish, v }) => (
                  <div key={dish.name.ko} className="menu-item">
                    <div className="menu-top">
                      <div>
                        <div className="menu-name">
                          {dish.name.ko}
                          {lang !== 'ko' && <small>{loc(dish.name, lang)}</small>}
                        </div>
                      </div>
                      <span className={`mbadge ${v.level}`}>{s.badge[v.level]}</span>
                    </div>
                    <div className="menu-reasons">
                      {v.reasons.slice(0, 3).map((rs, i) => (
                        <div key={i} className={`reason ${rs.level}`}>
                          ·&nbsp;
                          <span dangerouslySetInnerHTML={{ __html: reasonText(rs.reason, lang) }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {safeOnly &&
          !DISH_CATALOG.some((d) => judgeMenu(profile, d).level === 'g') && (
            <div className="empty-note">{s.dishesEmpty}</div>
          )}
      </ClientGate>
    </div>
  );
}

const LEVEL_ORDER = { g: 0, y: 1, r: 2 } as const;
