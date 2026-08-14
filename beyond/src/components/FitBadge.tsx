"use client";

import type { FitSummary } from "@/lib/discover";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { cx } from "./ui";

/**
 * Şart uyumu göstergesi.
 *
 * TASARIM KARARI: yüzde ASLA tek başına görünmüyor. Her zaman yanında sayaç
 * (7/9) var ve bilinmeyen şartlar ayrıca yazılıyor. Sebep: çıplak bir yüzde
 * kaçınılmaz olarak "kabul şansı" gibi okunur ve bu ürünün vermemeye söz
 * verdiği tek şey o. Sayaç yüzdenin nereden geldiğini gösteriyor.
 *
 * Uyum hesaplanamıyorsa yüzde göstermiyoruz — 0 yazmak "hiçbir şartı
 * karşılamıyorsun" demek olurdu, oysa bilmediğimiz şey öğrencinin durumu
 * değil, programın şartları.
 */

/**
 * Renk eşiği bant renkleriyle AYNI paleti kullanıyor (globals.css'teki
 * --color-band-*). Böylece Keşfet'teki yüzde ile sonuç kartlarındaki bant
 * görsel olarak aynı dili konuşuyor; kullanıcı iki ayrı ölçü sanmıyor.
 */
function toneFor(percent: number): string {
  if (percent >= 80) return "bg-band-match-soft text-band-match";
  if (percent >= 50) return "bg-band-reach-soft text-band-reach";
  return "bg-band-far-soft text-band-far";
}

export function FitBadge({
  fit,
  size = "md",
  className,
}: {
  fit: FitSummary;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t } = useLocale();

  if (fit.unknownOnly) {
    return (
      <span
        title={t.discover.fitUncomputableHint}
        className={cx(
          "inline-flex items-center rounded-lg bg-surface-soft text-ink-faint font-medium",
          size === "sm" ? "text-[11px] px-2 py-0.5" : "text-[12px] px-2.5 py-1",
          className
        )}
      >
        {t.discover.fitUncomputable}
      </span>
    );
  }

  return (
    <span
      title={t.discover.fitExplain}
      className={cx(
        "inline-flex items-baseline gap-1.5 rounded-lg font-semibold tabular-nums",
        toneFor(fit.percent),
        size === "sm" ? "text-[12px] px-2 py-0.5" : "text-[14px] px-2.5 py-1",
        className
      )}
    >
      %{fit.percent}
      <span className="font-normal opacity-70 text-[0.85em]">{t.discover.fitLabel}</span>
    </span>
  );
}

/** Sayaç + bilinmeyen şart açıklamaları. Yüzdenin altına konuluyor. */
export function FitDetail({ fit, className }: { fit: FitSummary; className?: string }) {
  const { t } = useLocale();

  return (
    <div className={cx("flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]", className)}>
      {!fit.unknownOnly && (
        <span className="text-ink-soft tabular-nums">
          {fill(t.discover.fitCounter, { met: fit.met, total: fit.total })}
        </span>
      )}
      {fit.unknownFromSource > 0 && (
        <span className="text-ink-faint" title={t.discover.unknownFromSourceHint}>
          ⓘ {fill(t.discover.unknownFromSource, { count: fit.unknownFromSource })}
        </span>
      )}
      {fit.unknownFromStudent > 0 && (
        <span className="text-ink-faint" title={t.discover.unknownFromStudentHint}>
          ⓘ {fill(t.discover.unknownFromStudent, { count: fit.unknownFromStudent })}
        </span>
      )}
    </div>
  );
}
