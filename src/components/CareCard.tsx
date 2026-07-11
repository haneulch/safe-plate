'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Profile } from '@/lib/types';
import { nationById } from '@/lib/i18n/labels';
import { cardNo, koRestrictions, koSpokenLangs, qrPayload } from '@/lib/careCard';

/** Pure render of Profile → dietary ID card. Korean side is for staff. */
export default function CareCard({ profile }: { profile: Profile }) {
  const nat = nationById(profile.nation);
  const { no, caution } = koRestrictions(profile);
  const langs = koSpokenLangs(profile);
  // Lazy init: runs at first render, which is client-only (mounted inside ClientGate).
  const [issued] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  });

  return (
    <div className="idcard">
      <div className="id-head">
        <div>
          <div className="id-title">식이 제약 안내 카드</div>
          <div className="id-title-en">DIETARY CARE CARD · SAFEPLATE KOREA</div>
        </div>
        <div className="id-emblem">SP</div>
      </div>
      <div className="id-body">
        <div className="id-photo">
          <span className="flag">{nat ? nat.flag : '🌏'}</span>
          <span className="cc">{nat ? nat.id.toUpperCase() : 'INTL'}</span>
        </div>
        <div className="id-fields">
          <div className="id-field">
            <label>국적 / NATIONALITY</label>
            <div className="val">{nat ? `${nat.label.ko} · ${nat.label.en}` : '—'}</div>
          </div>
          {langs.length > 0 && (
            <div className="id-field">
              <label>대화 가능 언어 / LANGUAGES</label>
              <div className="id-lang">
                {langs.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          )}
          <div className="id-field">
            <label>먹을 수 없어요 / CANNOT EAT</label>
            {no.length ? (
              <div className="id-noeat">
                {no.map((x) => (
                  <span key={x}>✕ {x}</span>
                ))}
              </div>
            ) : (
              <div className="val" style={{ opacity: 0.7 }}>
                —
              </div>
            )}
          </div>
          {caution.length > 0 && (
            <div className="id-field">
              <label>주의가 필요해요 / PLEASE BE CAREFUL</label>
              <div className="id-caution">
                {caution.map((x) => (
                  <span key={x}>! {x}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {profile.etc.trim() && (
        <div className="id-field" style={{ marginTop: 11, position: 'relative' }}>
          <label>기타 요청 / OTHER NOTES</label>
          <div className="val" style={{ fontWeight: 500, fontSize: 12, lineHeight: 1.5 }}>
            {profile.etc.trim()}
          </div>
        </div>
      )}
      <div className="id-msg">사장님, 위 재료가 들어가는지 확인 부탁드립니다. 감사합니다 🙏</div>
      <div className="id-foot">
        <div className="meta">
          NO. {cardNo(profile)}
          <br />
          {issued && `ISSUED ${issued} · `}VALID WITH TRAVELER
        </div>
        <div className="id-qr">
          <QRCodeSVG value={qrPayload(profile)} size={46} fgColor="#123B32" bgColor="#F3F8F5" />
        </div>
      </div>
    </div>
  );
}
