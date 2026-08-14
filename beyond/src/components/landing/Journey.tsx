"use client";

import { useLocale } from "@/lib/i18n/context";
import { cx } from "@/components/ui";

/**
 * Rota bölümünün metin tarafı: dört durak, biri açık.
 *
 * Harita artık burada DEĞİL — sayfanın kalıcı sahnesinde duruyor
 * (bkz. LandingStage) ve bölümden bölüme taşınıyor. Bu bileşen yalnızca
 * hangi durağın anlatıldığını gösteriyor; hangi durakta olunduğu bilgisi
 * yukarıdan geliyor ki harita ile liste aynı adımı göstersin.
 *
 * Gövde metni yalnızca aktif durakta açık: dördü birden açık olsaydı bölüm
 * bir ekrana sığmazdı.
 */
export function JourneyStops({
  step,
  onSelect,
}: {
  /** 0 … LEG_COUNT — kaç bacak çizildi. */
  step: number;
  onSelect: (stepIndex: number) => void;
}) {
  const { t } = useLocale();
  const copy = t.landingJourney;

  // 0. adımda henüz yola çıkılmadı; ilk durağı anlatıyoruz.
  const activeIndex = Math.min(Math.max(step - 1, 0), copy.stops.length - 1);

  return (
    <div>
      <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-hero-ink">
        {copy.stopsTitle}
      </h2>

      <ol className="mt-6 space-y-1">
        {copy.stops.map((stop, index) => {
          const isActive = index === activeIndex;

          return (
            <li key={stop.title}>
              <button
                type="button"
                onClick={() => onSelect(index + 1)}
                aria-current={isActive ? "step" : undefined}
                className={cx(
                  "journey-stop w-full rounded-xl border px-4 py-3 text-left",
                  isActive ? "journey-stop-active" : "border-transparent"
                )}
              >
                <span
                  className={cx(
                    "text-[11px] font-semibold uppercase tracking-[0.09em]",
                    isActive ? "text-hero-glow" : "text-hero-ink-soft"
                  )}
                >
                  {stop.tag}
                </span>
                <span
                  className={cx(
                    "mt-1 block text-[17px] font-semibold",
                    isActive ? "text-hero-ink" : "text-hero-ink-soft"
                  )}
                >
                  {stop.title}
                </span>

                {isActive && (
                  <span className="animate-fade mt-2 block text-[14px] leading-relaxed text-hero-ink-soft">
                    {stop.body}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
