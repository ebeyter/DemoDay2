"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePersistent, writePersistent } from "../persistent-state";
import { DICTIONARY, type Locale } from "./dictionary";

const STORAGE_KEY = "beyond.locale";
const DEFAULT_LOCALE: Locale = "tr";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (typeof DICTIONARY)["tr"];
  /** İki dilli veri alanlarını (Bilingual) aktif dile indirger. */
  pick: (value: { tr: string; en: string }) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Dil tercihi localStorage'da; sunucu render'ı varsayılanla başlar ve
  // hydration sırasında kayıtlı değere geçer (bkz. persistent-state.ts).
  const stored = usePersistent<Locale>(STORAGE_KEY, DEFAULT_LOCALE);

  // Elle kurcalanmış bir değere karşı koruma — sözlükte olmayan bir dil
  // gelirse varsayılana düş.
  const locale: Locale = stored === "en" ? "en" : "tr";

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writePersistent(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "tr" ? "en" : "tr"),
      t: DICTIONARY[locale],
      pick: (v) => v[locale],
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
