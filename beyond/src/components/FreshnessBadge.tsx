"use client";

import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { daysSince, getSourceCheck } from "@/lib/freshness-data";
import type { Discrepancy } from "@/lib/freshness";
import { cx } from "./ui";

/**
 * Beyond — kaynak takibi göstergeleri.
 *
 * İki biçimi var: kartlarda küçük bir rozet, detay sayfasında açık bir panel.
 *
 * Dedektörün iddiası bilinçli olarak zayıf tutuluyor: "katalogdaki değer
 * sayfada geçmiyor" diyoruz, "şart değişti" demiyoruz. Sayfada birden fazla
 * program veya sınav türü olabilir. Zayıf ama doğrulanabilir bir iddia,
 * güçlü ama yanlış olabilecek bir iddiadan iyidir.
 */

function useCheck(programId: string) {
  return getSourceCheck(programId);
}

// ---------------------------------------------------------------------------
// Kart rozeti
// ---------------------------------------------------------------------------

export function FreshnessBadge({ programId }: { programId: string }) {
  const { t } = useLocale();
  const check = useCheck(programId);
  if (!check) return null;

  const hasDiff = check.discrepancies.length > 0;
  if (check.status === "ok" && !hasDiff) return null;

  const label =
    check.status === "unreachable"
      ? t.freshness.unreachableBadge
      : check.status === "changed"
        ? t.freshness.changedBadge
        : t.freshness.diffBadge;

  const tone =
    check.status === "unreachable"
      ? "border-line bg-surface-soft text-ink-faint"
      : "border-band-reach/25 bg-band-reach-soft text-band-reach";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-pill border",
        tone
      )}
    >
      <span aria-hidden>{check.status === "unreachable" ? "?" : "⚠"}</span>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detay paneli
// ---------------------------------------------------------------------------

export function FreshnessPanel({ programId }: { programId: string }) {
  const { t, locale } = useLocale();
  const check = useCheck(programId);
  if (!check) return null;

  const hasDiff = check.discrepancies.length > 0;
  const days = daysSince(check.checkedAt);

  const scanLine =
    days === null
      ? ""
      : days === 0
        ? `${t.freshness.lastScan}: ${t.freshness.today}`
        : `${t.freshness.lastScan}: ${fill(t.freshness.daysAgo, { days })}`;

  // Hiçbir sinyal yoksa sessiz kal — "her şey yolunda" rozetleri gürültü yapar.
  if (check.status === "ok" && !hasDiff) {
    return <p className="text-[12px] text-ink-faint px-1">{scanLine}</p>;
  }

  return (
    <div
      className={cx(
        "rounded-card border p-5",
        check.status === "unreachable"
          ? "border-line bg-surface-soft"
          : "border-band-reach/25 bg-band-reach-soft"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-[16px] text-ink">{t.freshness.panelTitle}</h2>
        <FreshnessBadge programId={programId} />
      </div>

      {check.status === "unreachable" ? (
        <p className="text-[13px] text-ink-soft leading-relaxed">{check.error}</p>
      ) : (
        <>
          {check.status === "changed" && (
            <p className="text-[13px] text-ink-soft leading-relaxed mb-3">
              {locale === "tr"
                ? "Kaynak sayfanın içeriği son taramadan bu yana değişti."
                : "The source page content changed since the previous scan."}
            </p>
          )}

          {hasDiff && (
            <ul className="space-y-3">
              {check.discrepancies.map((d: Discrepancy) => (
                <li key={d.field} className="text-[13px]">
                  <p className="font-medium text-ink">{t.freshness.fields[d.field]}</p>
                  <p className="text-ink-soft mt-0.5">
                    {t.freshness.catalogLabel}:{" "}
                    <span className="font-medium tabular-nums">{d.catalog}</span>
                    {" · "}
                    {t.freshness.pageLabel}:{" "}
                    <span className="font-medium tabular-nums">{d.found.join(", ")}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="text-[11px] text-ink-faint leading-relaxed mt-4 pt-3 border-t border-line/60">
        {t.freshness.scanNote}
      </p>
      {scanLine && <p className="text-[11px] text-ink-faint mt-2">{scanLine}</p>}
    </div>
  );
}
