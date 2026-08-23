'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { RestaurantDetailResponse } from '@/lib/types';
import { getStrings, loc } from '@/lib/i18n';
import { useProfileStore } from '@/lib/store/profile';
import { judgeMenu, judgeRestaurant } from '@/lib/verdict/engine';
import { reasonText } from '@/lib/verdict/reasons';
import ClientGate from '@/components/ClientGate';

const PLATE_ICON = { g: '✓', y: '!', r: '✕' } as const;

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const svc = useSearchParams().get('svc');
  const lang = useProfileStore((s) => s.uiLang);
  const profile = useProfileStore((s) => s.profile);
  const s = getStrings(lang);

  const [data, setData] = useState<RestaurantDetailResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/restaurants/${id}?lang=${lang}${svc ? `&svc=${svc}` : ''}`);
        if (!res.ok) throw new Error(String(res.status));
        const body: RestaurantDetailResponse = await res.json();
        if (!cancelled) setData(body);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, lang, svc]);

  if (error) {
    return (
      <div className="empty-note" style={{ margin: '20px 18px' }}>
        {s.loadError}
        <br />
        <button className="cta" style={{ maxWidth: 200 }} onClick={() => router.push('/explore')}>
          {s.back}
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div style={{ padding: 18 }}>
        <div className="skeleton" style={{ height: 120 }} />
        <div className="skeleton" style={{ height: 90, marginTop: 12 }} />
        <div className="skeleton" style={{ height: 90, marginTop: 12 }} />
      </div>
    );
  }

  const r = data.restaurant;
  const hasInferred = r.menus.some((m) => m.inference && m.inference.confidence !== 'high');
  const v = judgeRestaurant(profile, r.menus);
  const verdictText =
    v.level === 'g' ? s.vSafe(v.safe, v.cond) : v.level === 'y' ? s.vCond(v.cond) : s.vNone;

  return (
    <ClientGate>
      <>
        <div className="detail-hero">
          <button type="button" className="back-btn" onClick={() => router.push('/explore')}>
            {s.back}
          </button>
          <div className="detail-name">{loc(r.name, lang)}</div>
          <div className="detail-sub">
            {loc(r.cat, lang)} ·{' '}
            {r.address ? s.detailSub(loc(r.address, lang)) : s.srcTour}
            {r.tel && (
              <>
                <br />☎ {r.tel}
              </>
            )}
          </div>
          {r.menus.length > 0 && (
            <span className={`detail-badge ${v.level}`}>
              {PLATE_ICON[v.level]} {verdictText}
            </span>
          )}
        </div>

        {hasInferred && <div className="caveat-banner">🤖 {stripB(s.r_lowConfidence)}</div>}
        {data!.source === 'mock' && (
          <div className="section-label">
            <span className="demo-badge">{s.demoDataBadge}</span>
          </div>
        )}

        {r.menus.length === 0 ? (
          <div className="empty-note" style={{ margin: '16px 18px' }}>
            {s.menuUnknown}
          </div>
        ) : (
          <div className="menu-list">
            {r.menus.map((m) => {
              const mv = judgeMenu(profile, m);
              return (
                <div key={m.name.ko} className="menu-item">
                  <div className="menu-top">
                    <div>
                      <div className="menu-name">
                        {m.name.ko}
                        {lang !== 'ko' && m.name.en && <small>{m.name.en}</small>}
                      </div>
                      {m.price && <div className="menu-price">{m.price}</div>}
                    </div>
                    <span className={`mbadge ${mv.level}`}>{s.badge[mv.level]}</span>
                  </div>
                  <div className="menu-reasons">
                    {mv.reasons.map((rs, i) => (
                      <div key={i} className={`reason ${rs.level}`}>
                        ·&nbsp;
                        <span dangerouslySetInnerHTML={{ __html: reasonText(rs.reason, lang) }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="source-note" dangerouslySetInnerHTML={{ __html: s.detailNote }} />
      </>
    </ClientGate>
  );
}

const stripB = (html: string) => html.replace(/<[^>]+>/g, '');
