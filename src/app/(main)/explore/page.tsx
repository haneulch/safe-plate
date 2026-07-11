'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  FoodCat,
  RestaurantDetailResponse,
  RestaurantsResponse,
  RestaurantVerdict,
} from '@/lib/types';
import { FOOD_CAT_FILTERS, FOOD_CAT_LABEL } from '@/lib/tourapi/foodCat';
import { getStrings, loc } from '@/lib/i18n';
import { useGeolocation } from '@/lib/geo';
import { useProfileStore, useHydrated } from '@/lib/store/profile';
import { judgeRestaurant } from '@/lib/verdict/engine';
import RecoSection from '@/components/RecoSection';
import ClientGate from '@/components/ClientGate';

const PLATE_ICON = { g: '✓', y: '!', r: '✕' } as const;
const PREFETCH_DETAILS = 8;

const HERE_LABEL = { ko: '현재 위치', en: 'you', ja: '現在地', zh: '当前位置', ar: 'موقعك' } as const;
const FALLBACK_AREA = { ko: '서울 명동', en: 'Myeongdong', ja: 'ソウル明洞', zh: '首尔明洞', ar: 'ميونغدونغ' } as const;

export default function ExplorePage() {
  const router = useRouter();
  const geo = useGeolocation();
  const hydrated = useHydrated();
  const lang = useProfileStore((s) => s.uiLang);
  const profile = useProfileStore((s) => s.profile);
  const s = getStrings(lang);

  const [data, setData] = useState<RestaurantsResponse | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, RestaurantVerdict>>({});
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [catFilter, setCatFilter] = useState<FoodCat | null>(null);

  useEffect(() => {
    if (geo.status === 'locating' || !hydrated) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve(); // yield so state resets are not synchronous in the effect
      if (cancelled) return;
      setError(false);
      setData(null);
      try {
        const res = await fetch(
          `/api/restaurants?lat=${geo.lat}&lng=${geo.lng}&radius=2000&lang=${lang}`,
        );
        if (!res.ok) throw new Error(String(res.status));
        const body: RestaurantsResponse = await res.json();
        if (cancelled) return;
        setData(body);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [geo.status, geo.lat, geo.lng, lang, hydrated, reload]);

  // Lazily fetch details for the top N to compute list verdicts client-side.
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    (async () => {
      const targets = data.restaurants.slice(0, PREFETCH_DETAILS);
      await Promise.all(
        targets.map(async (r) => {
          try {
            const res = await fetch(`/api/restaurants/${r.id}?lang=${lang}`);
            if (!res.ok) return;
            const body: RestaurantDetailResponse = await res.json();
            if (cancelled || !body.restaurant.menus.length) return;
            setVerdicts((v) => ({
              ...v,
              [r.id]: judgeRestaurant(profile, body.restaurant.menus),
            }));
          } catch {
            /* verdict stays unknown */
          }
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [data, lang, profile]);

  const verdictText = (v: RestaurantVerdict) =>
    v.level === 'g' ? s.vSafe(v.safe, v.cond) : v.level === 'y' ? s.vCond(v.cond) : s.vNone;

  return (
    <>
      <ClientGate>
        <RecoSection />
      </ClientGate>

      {geo.status === 'fallback' && (
        <div className="caveat-banner" role="status">
          📍 {s.locationFallback}
        </div>
      )}
      {data?.degraded && <div className="caveat-banner">⚠️ {s.loadError} — {s.demoDataBadge}</div>}

      <div className="legend">
        <div>
          <span className="dot g" /> {s.legend[0]}
        </div>
        <div>
          <span className="dot y" /> {s.legend[1]}
        </div>
        <div>
          <span className="dot r" /> {s.legend[2]}
        </div>
      </div>

      {geo.status === 'locating' || (!data && !error) ? (
        <div className="rest-list">
          <div className="section-label" style={{ padding: '10px 0 0' }}>
            {geo.status === 'locating' ? s.locating : ''}
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 92 }} />
          ))}
        </div>
      ) : error ? (
        <div className="empty-note" style={{ margin: '14px 18px' }}>
          {s.loadError}
          <br />
          <button className="cta" style={{ maxWidth: 200 }} onClick={() => setReload((x) => x + 1)}>
            {s.retry}
          </button>
        </div>
      ) : (
        <>
          <div className="chips" style={{ padding: '10px 18px 0' }}>
            {FOOD_CAT_FILTERS.filter((c) => data!.restaurants.some((r) => r.foodCat === c)).map(
              (c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${catFilter === c ? 'on' : ''}`}
                  style={{ padding: '6px 11px', fontSize: 12 }}
                  onClick={() => setCatFilter(catFilter === c ? null : c)}
                >
                  {FOOD_CAT_LABEL[c][lang]}
                </button>
              ),
            )}
          </div>
          <div className="section-label">
            {s.restCount(
              geo.status === 'granted' ? HERE_LABEL[lang] : FALLBACK_AREA[lang],
              data!.restaurants.filter((r) => !catFilter || r.foodCat === catFilter).length,
            )}
            {data!.source === 'mock' && <span className="demo-badge" style={{ marginInlineStart: 8 }}>{s.demoDataBadge}</span>}
          </div>
          <div className="rest-list">
            {data!.restaurants
              .filter((r) => !catFilter || r.foodCat === catFilter)
              .map((r) => {
              const v = verdicts[r.id];
              return (
                <button
                  key={r.id}
                  type="button"
                  className="rest-card"
                  onClick={() => router.push(`/restaurant/${r.id}`)}
                >
                  <div className={`plate ${v ? v.level : 'n'}`}>{v ? PLATE_ICON[v.level] : '···'}</div>
                  <div className="rest-info">
                    <div className="rest-name">
                      {loc(r.name, lang)}
                      {r.halalCert && <span className="halal-badge">HALAL</span>}
                    </div>
                    <div className="rest-cat">
                      {loc(r.cat, lang)}
                      {r.distanceM != null && ` · ${r.distanceM >= 1000 ? `${(r.distanceM / 1000).toFixed(1)}km` : `${r.distanceM}m`}`}
                    </div>
                    {v && <div className={`rest-verdict ${v.level}`}>{verdictText(v)}</div>}
                    <div className="rest-meta">{s.srcTour}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="source-note" dangerouslySetInnerHTML={{ __html: s.exploreNote }} />
    </>
  );
}
