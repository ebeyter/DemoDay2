"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import bundled from "@/data/source-checks.json";
import type { SourceCheck, SourceCheckFile } from "./freshness";

/**
 * Beyond — tarama sonuçlarının iki katmanlı kaynağı.
 *
 *  1. Pakete gömülü JSON (`npm run check-sources` üretir) — ilk render'da
 *     anında hazır, ağ gerektirmiyor, çevrimdışı çalışıyor.
 *  2. /api/freshness (Supabase) — otomatik cron'un yazdığı güncel sonuçlar,
 *     yüklenince gömülü veriyi eziyor.
 *
 * Bu sıra bilinçli: Supabase erişilemese, cron hiç kurulmasa veya tablo boş
 * olsa bile rozetler kaybolmuyor — sadece tazeliğini yitiriyor. Tazelik
 * göstergesinin kendisi tek bir servise bağımlı olmamalı.
 */

const bundledChecks = (bundled as SourceCheckFile).checks;

interface FreshnessValue {
  checks: Record<string, SourceCheck>;
  /** Veri Supabase'den mi geldi, pakete gömülü mü? */
  live: boolean;
}

const FreshnessContext = createContext<FreshnessValue>({
  checks: bundledChecks,
  live: false,
});

export function FreshnessProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<FreshnessValue>({
    checks: bundledChecks,
    live: false,
  });

  useEffect(() => {
    let active = true;

    // setState burada eşzamanlı değil — söz geri çağrısının içinde,
    // yani dış sistemden gelen bir bildirim.
    fetch("/api/freshness")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active || !data?.checks) return;
        const count = Object.keys(data.checks).length;
        // Boş tablo gömülü veriyi ezmemeli — cron henüz çalışmamış olabilir.
        if (count > 0) setValue({ checks: data.checks, live: true });
      })
      .catch(() => {
        // Ağ hatası — gömülü veriyle devam, kullanıcıya yansımıyor.
      });

    return () => {
      active = false;
    };
  }, []);

  return <FreshnessContext.Provider value={value}>{children}</FreshnessContext.Provider>;
}

export function useSourceCheck(programId: string): SourceCheck | null {
  return useContext(FreshnessContext).checks[programId] ?? null;
}

export function useFreshnessSource(): { live: boolean } {
  return { live: useContext(FreshnessContext).live };
}
