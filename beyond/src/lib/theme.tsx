"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePersistent, writePersistent } from "./persistent-state";

/**
 * Beyond — tema katmanı.
 *
 * Renklerin kendisi burada DEĞİL, `src/app/globals.css` içinde CSS
 * değişkenleri olarak duruyor. Bu dosyanın tek işi `<html>` üzerindeki
 * `data-theme` ve `data-accent` niteliklerini doğru tutmak; boyamayı CSS
 * yapıyor. Böylece yeni bir renk eklemek için TypeScript'e dokunmak
 * gerekmiyor ve hiçbir bileşen sabit renk taşımıyor.
 *
 * SEÇİM SUNUCUYA GİTMİYOR. Tema tercihi kişisel veri sayılabilecek bir şey
 * değil ama hesaba yazmanın da bir faydası yok: aynı kişinin telefonu ile
 * masaüstü farklı tercih isteyebiliyor. localStorage'da tutuyoruz ve gizlilik
 * ekranında bunu açıkça söylüyoruz.
 *
 * İLK BOYAMADA FLASH YOK
 * Nitelikleri asıl olarak `src/app/layout.tsx` içindeki satır içi script
 * koyuyor; o script HTML ayrıştırılırken, React yüklenmeden çalışıyor.
 * Buradaki `useLayoutEffect` iki işi görüyor: (1) kullanıcı seçim değiştirince
 * niteliği günceller, (2) geliştirme modunda React'ın StrictMode yeniden
 * bağlanmasında `<html>` niteliklerini sıfırlamasını telafi eder.
 */

export type ThemeMode = "light" | "dark" | "system";
export type AccentId = "indigo" | "teal" | "violet" | "rose";

/** Sıra arayüzdeki düğme sırasıdır. */
export const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

/**
 * DİKKAT: bu liste `layout.tsx`'teki satır içi script'te de geçiyor. Yeni bir
 * aksan eklerken üç yeri birlikte güncelle: burası, o script ve globals.css.
 */
export const ACCENTS: AccentId[] = ["indigo", "teal", "violet", "rose"];

export const THEME_KEY = "beyond.theme";
export const ACCENT_KEY = "beyond.accent";

const DEFAULT_MODE: ThemeMode = "system";
const DEFAULT_ACCENT: AccentId = "indigo";

interface ThemeValue {
  /** Kullanıcının seçtiği şey — "system" de bir seçim. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** "system" çözümlendikten sonra fiilen uygulanan tema. */
  resolved: "light" | "dark";
  accent: AccentId;
  setAccent: (accent: AccentId) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

// --- İşletim sistemi tercihi ------------------------------------------------
// Dış bir sistem (matchMedia) olduğu için useSyncExternalStore ile okunuyor:
// kullanıcı sistem temasını değiştirdiği anda uygulama da değişiyor.

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeSystem(onChange: () => void): () => void {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSystemSnapshot(): "light" | "dark" {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** Sunucuda matchMedia yok; satır içi script zaten ilk boyamada düzeltiyor. */
function getServerSystemSnapshot(): "light" | "dark" {
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedMode = usePersistent<ThemeMode>(THEME_KEY, DEFAULT_MODE);
  const storedAccent = usePersistent<AccentId>(ACCENT_KEY, DEFAULT_ACCENT);

  // Elle kurcalanmış localStorage değerine karşı koruma — bilinmeyen bir değer
  // `data-theme` niteliğine yazılıp CSS'i sessizce bozmasın.
  const mode = THEME_MODES.includes(storedMode) ? storedMode : DEFAULT_MODE;
  const accent = ACCENTS.includes(storedAccent) ? storedAccent : DEFAULT_ACCENT;

  const system = useSyncExternalStore(
    subscribeSystem,
    getSystemSnapshot,
    getServerSystemSnapshot
  );

  const resolved: "light" | "dark" = mode === "system" ? system : mode;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-accent", accent);
  }, [resolved, accent]);

  const setMode = useCallback((next: ThemeMode) => {
    writePersistent(THEME_KEY, next);
  }, []);

  const setAccent = useCallback((next: AccentId) => {
    writePersistent(ACCENT_KEY, next);
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({ mode, setMode, resolved, accent, setAccent }),
    [mode, setMode, resolved, accent, setAccent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
