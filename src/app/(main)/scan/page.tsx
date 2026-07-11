'use client';

import { useEffect, useRef, useState } from 'react';
import type { Menu } from '@/lib/types';
import { getStrings } from '@/lib/i18n';
import { judgeMenu } from '@/lib/verdict/engine';
import { reasonText } from '@/lib/verdict/reasons';
import { useProfileStore } from '@/lib/store/profile';
import ClientGate from '@/components/ClientGate';

interface ProductResult {
  product: { barcode: string; name: string; maker?: string; category?: string; ingredients?: string };
  menu: Menu;
  source: 'mfds' | 'mock';
}

/** Minimal typing for the (Chromium-only) BarcodeDetector API. */
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

export default function ScanPage() {
  const lang = useProfileStore((s) => s.uiLang);
  const profile = useProfileStore((s) => s.profile);
  const s = getStrings(lang);

  const [input, setInput] = useState('');
  const [result, setResult] = useState<ProductResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canScanCamera = typeof window !== 'undefined' && !!window.BarcodeDetector;

  async function lookup(barcode: string) {
    const code = barcode.replace(/\D/g, '');
    if (code.length < 8) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await fetch(`/api/products/${code}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function startCamera() {
    if (!window.BarcodeDetector || !videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraOn(true);
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128'] });
      const tick = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            stopCamera();
            setInput(codes[0].rawValue);
            lookup(codes[0].rawValue);
            return;
          }
        } catch {
          /* frame not ready */
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch {
      setCameraOn(false);
    }
  }

  useEffect(() => stopCamera, []);

  const verdict = result ? judgeMenu(profile, result.menu) : null;

  return (
    <div className="prof-wrap">
      <div className="prof-title">{s.scanTitle}</div>
      <div className="prof-sub">{s.scanSub}</div>

      <ClientGate>
        {canScanCamera && (
          <button
            type="button"
            className="cta ghost"
            style={{ flex: 'none', width: '100%', marginTop: 14 }}
            onClick={cameraOn ? stopCamera : startCamera}
          >
            {cameraOn ? s.scanCameraStop : s.scanCameraBtn}
          </button>
        )}
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            display: cameraOn ? 'block' : 'none',
            width: '100%',
            borderRadius: 14,
            marginTop: 10,
          }}
        />

        <form
          style={{ display: 'flex', gap: 8, marginTop: 14 }}
          onSubmit={(e) => {
            e.preventDefault();
            lookup(input);
          }}
        >
          <input
            className="etc-input"
            style={{ minHeight: 0, flex: 1 }}
            inputMode="numeric"
            placeholder={s.scanManualPh}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="cta" style={{ width: 'auto', marginTop: 0, padding: '0 18px' }}>
            {s.scanBtn}
          </button>
        </form>
        <div className="card-hint" style={{ textAlign: 'start' }}>
          {s.scanDemoHint}
        </div>

        {loading && <div className="skeleton" style={{ height: 120, marginTop: 14 }} />}
        {notFound && (
          <div className="caveat-banner" style={{ margin: '14px 0 0' }}>
            {s.scanNotFound}
          </div>
        )}

        {result && verdict && (
          <div className="menu-item" style={{ marginTop: 16 }}>
            <div className="menu-top">
              <div>
                <div className="menu-name">
                  {result.product.name}
                  <small>
                    {[result.product.maker, result.product.category].filter(Boolean).join(' · ')}
                  </small>
                </div>
                <div className="menu-price">{result.product.barcode}</div>
              </div>
              <span className={`mbadge ${verdict.level}`}>{s.badge[verdict.level]}</span>
            </div>
            <div className="menu-reasons">
              {verdict.reasons.map((rs, i) => (
                <div key={i} className={`reason ${rs.level}`}>
                  ·&nbsp;
                  <span dangerouslySetInnerHTML={{ __html: reasonText(rs.reason, lang) }} />
                </div>
              ))}
            </div>
            <div className="prof-group" style={{ marginTop: 12 }}>
              <h3>{s.scanIngredientsT}</h3>
              <p style={{ marginBottom: 0 }}>{result.product.ingredients || s.scanNoInfo}</p>
            </div>
            {result.source === 'mock' && (
              <span className="demo-badge" style={{ display: 'inline-block', marginTop: 8 }}>
                {s.demoDataBadge}
              </span>
            )}
          </div>
        )}
      </ClientGate>
    </div>
  );
}
