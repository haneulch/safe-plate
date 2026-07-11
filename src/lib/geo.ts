'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCATION } from './geo-util';

export type GeoStatus = 'locating' | 'granted' | 'fallback';

export interface GeoState {
  status: GeoStatus;
  lat: number;
  lng: number;
}

const TIMEOUT_MS = 8000;

/**
 * Browser geolocation with graceful fallback to Myeongdong when denied,
 * timed out, or unavailable. Coordinates are used transiently for the
 * restaurant query only — never stored.
 */
export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    status: 'locating',
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
  });

  useEffect(() => {
    let done = false;
    const fallback = () => {
      if (!done) {
        done = true;
        setState({ status: 'fallback', lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng });
      }
    };
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      // async so the state update is not synchronous within the effect
      const t = setTimeout(fallback, 0);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(fallback, TIMEOUT_MS);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!done) {
          done = true;
          clearTimeout(timer);
          setState({ status: 'granted', lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      },
      () => {
        clearTimeout(timer);
        fallback();
      },
      { enableHighAccuracy: false, timeout: TIMEOUT_MS, maximumAge: 5 * 60 * 1000 },
    );
    return () => clearTimeout(timer);
  }, []);

  return state;
}
