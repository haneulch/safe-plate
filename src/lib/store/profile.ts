'use client';

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AllergenId, ConditionId, Profile, ReligiousId, UiLang } from '../types';
import { EMPTY_PROFILE } from '../types';
import { LANG_COOKIE, dirFor } from '../i18n';

interface ProfileState {
  profile: Profile;
  uiLang: UiLang;
  setNation: (id: string | null) => void;
  toggleLang: (id: string) => void;
  toggleCond: (id: ConditionId) => void;
  toggleAlg: (id: AllergenId) => void;
  toggleRel: (id: ReligiousId) => void;
  setEtc: (etc: string) => void;
  setUiLang: (lang: UiLang) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

function syncLangToDocument(lang: UiLang) {
  if (typeof document === 'undefined') return;
  // Non-sensitive preference only — never mirror health data into cookies.
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = lang;
  document.documentElement.dir = dirFor(lang);
}

const toggle = <T,>(arr: T[], id: T): T[] =>
  arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      uiLang: 'en',
      setNation: (id) => set((s) => ({ profile: { ...s.profile, nation: id } })),
      toggleLang: (id) => set((s) => ({ profile: { ...s.profile, langs: toggle(s.profile.langs, id) } })),
      toggleCond: (id) => set((s) => ({ profile: { ...s.profile, cond: toggle(s.profile.cond, id) } })),
      toggleAlg: (id) => set((s) => ({ profile: { ...s.profile, alg: toggle(s.profile.alg, id) } })),
      toggleRel: (id) => set((s) => ({ profile: { ...s.profile, rel: toggle(s.profile.rel, id) } })),
      setEtc: (etc) => set((s) => ({ profile: { ...s.profile, etc } })),
      setUiLang: (lang) => {
        syncLangToDocument(lang);
        set({ uiLang: lang });
      },
      completeOnboarding: () => set((s) => ({ profile: { ...s.profile, onboarded: true } })),
      reset: () => set({ profile: EMPTY_PROFILE }),
    }),
    {
      name: 'safeplate.profile.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ profile: s.profile, uiLang: s.uiLang }),
      onRehydrateStorage: () => (state) => {
        if (state) syncLangToDocument(state.uiLang);
      },
    },
  ),
);

/**
 * True once localStorage has been read — gate profile-dependent UI on this.
 * Server snapshot is always false so SSR/first client render match.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useProfileStore.persist.onFinishHydration(cb),
    () => useProfileStore.persist.hasHydrated(),
    () => false,
  );
}
