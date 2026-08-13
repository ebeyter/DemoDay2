import checkFile from "@/data/source-checks.json";
import type { SourceCheck, SourceCheckFile } from "./freshness";

/**
 * Beyond — tarama sonuçlarına arayüz erişimi.
 *
 * Veri derleme zamanında JSON olarak paketleniyor: çalışma anında hiçbir
 * ağ isteği veya veritabanı sorgusu yok, yani sayfalar statik kalıyor ve
 * dedektör çöktüğünde bile arayüz etkilenmiyor.
 *
 * Tazelemek için:  npm run check-sources
 */

const data = checkFile as SourceCheckFile;

export function getSourceCheck(programId: string): SourceCheck | null {
  return data.checks[programId] ?? null;
}

export function getScanDate(): string | null {
  return data.generatedAt || null;
}

/** Katalogda kaç kayıtta fark veya değişiklik var — özet rozetleri için. */
export function getFreshnessSummary(): {
  changed: number;
  withDiscrepancies: number;
  unreachable: number;
  total: number;
} {
  const list = Object.values(data.checks);
  return {
    changed: list.filter((c) => c.status === "changed").length,
    withDiscrepancies: list.filter((c) => c.discrepancies.length > 0).length,
    unreachable: list.filter((c) => c.status === "unreachable").length,
    total: list.length,
  };
}

/** ISO tarihi "3 gün önce" gibi göreli metne çevirir. */
export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}
