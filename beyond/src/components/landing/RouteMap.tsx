"use client";

import { useId } from "react";
import { COUNTRIES } from "@/data/taxonomy";
import { fill } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/context";
import { cx } from "@/components/ui";
import {
  COMPACT_BOX,
  FULL_BOX,
  LEGS,
  MERIDIANS,
  PARALLELS,
  STOPS,
  STOP_POINTS,
  VIEW_H,
  VIEW_W,
  bezierPoint,
  clamp,
  programCountFor,
  viewBoxAttr,
} from "./route";
import { useCompactMap } from "./use-route-progress";

/**
 * İstanbul'dan Avrupa üniversite şehirlerine rota — tamamen SVG.
 *
 * Renk yok: her şey tema tokenlarından (`stroke-accent`, `fill-surface`…)
 * geliyor, sabit hex yazılmadı. Koyu tema `globals.css`'te açıldığında harita
 * da onunla birlikte döner.
 *
 * ŞEHİR ETİKETLERİ HTML, SVG DEĞİL. SVG içindeki `font-size` viewBox ile
 * birlikte ölçekleniyor: 375px'lik bir ekranda 8px'e inip okunmaz hale
 * gelirdi. HTML etiketler yüzdeyle konumlanıyor ama punto gerçek px —
 * her ekranda aynı boyutta.
 */

export function RouteMap({
  progress,
  reduced,
  className,
}: {
  /** 0 … LEGS.length — bkz. useRouteProgress. */
  progress: number;
  /** Hareket azaltma açıksa rota tamamen çizili gelir. */
  reduced: boolean;
  className?: string;
}) {
  const { t, pick } = useLocale();
  const copy = t.landingJourney;
  const titleId = useId();
  const descId = useId();

  // O an vurgulanan durak: gidilen şehir, yani bacağın varış ucu.
  const activeLeg = clamp(Math.floor(progress), 0, LEGS.length - 1);
  const activeStop = activeLeg + 1;
  const active = STOPS[activeStop];
  const activeCountry = active.country ? COUNTRIES[active.country] : null;

  // Dar ekranda çerçeve rotaya kırpılıyor. Aynı genişlikte daha az alan
  // gösterildiği için her şey büyür; kalınlıkları geri küçültmek gerekiyor,
  // yoksa çizgiler kabalaşır.
  const compact = useCompactMap();
  // Çerçeve ve etiket konumları AYNI kutudan türüyor. Ayrı kaynaklardan
  // gelseydi, biri kırpılmış çerçeveyi diğeri tam çerçeveyi kullanır ve
  // etiketler düğümlerden kayardı.
  const box = compact ? COMPACT_BOX : FULL_BOX;
  const size = compact
    ? { leg: 2.4, ghost: 1.6, node: 4.6, active: 6, marker: 3.6, halo: 10, grid: 0.8 }
    : { leg: 3, ghost: 2, node: 6.5, active: 8, marker: 5, halo: 14, grid: 1 };

  // İlerleme işaretçisi yalnızca yarısı çizilmiş bacakta anlamlı.
  const legFraction = reduced ? 1 : clamp(progress - activeLeg, 0, 1);
  const marker =
    reduced || legFraction <= 0 || legFraction >= 1
      ? null
      : bezierPoint(LEGS[activeLeg], legFraction);

  return (
    <figure className={cx("m-0", className)}>
      <div className="relative overflow-hidden rounded-card border border-line bg-surface">
        <svg
          viewBox={viewBoxAttr(box)}
          className="block h-auto w-full"
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
        >
          <title id={titleId}>{copy.mapTitle}</title>
          <desc id={descId}>{copy.mapDesc}</desc>

          {/* Enlem/boylam ızgarası — gerçek meridyen ve paraleller.
              Kesik çizgi, düz çizginin tablo gibi görünmemesi için. */}
          <g className="stroke-line" strokeWidth={size.grid} strokeDasharray="3 7" aria-hidden>
            {MERIDIANS.map((x) => (
              <line key={`m${x}`} x1={x} y1={0} x2={x} y2={VIEW_H} />
            ))}
            {PARALLELS.map((y) => (
              <line key={`p${y}`} x1={0} y1={y} x2={VIEW_W} y2={y} />
            ))}
          </g>

          {/* Henüz çizilmemiş rota — nereye gidileceği baştan belli olsun. */}
          <g
            className="stroke-line-strong"
            fill="none"
            strokeWidth={size.ghost}
            strokeLinecap="round"
            strokeDasharray="1 9"
            aria-hidden
          >
            {LEGS.map((leg, index) => (
              <path key={`ghost${index}`} d={leg.d} />
            ))}
          </g>

          {/* Çizilen rota. Kesik desen bacağın gerçek uzunluğunda: tek bir
              tire tüm yayı kaplıyor, `dashoffset` de "ne kadarı henüz
              çizilmedi" oluyor. */}
          <g
            className="stroke-accent"
            fill="none"
            strokeWidth={size.leg}
            strokeLinecap="round"
            aria-hidden
          >
            {LEGS.map((leg, index) => {
              const drawn = reduced ? 1 : clamp(progress - index, 0, 1);
              return (
                <path
                  key={`leg${index}`}
                  className="route-leg"
                  d={leg.d}
                  strokeDasharray={leg.length}
                  strokeDashoffset={leg.length * (1 - drawn)}
                />
              );
            })}
          </g>

          {/* İlerleme işaretçisi — yolculuğun "şu an burada" noktası. */}
          {marker && (
            <circle
              className="fill-accent route-marker"
              cx={marker.x}
              cy={marker.y}
              r={size.marker}
              aria-hidden
            />
          )}

          {/* Duraklar. */}
          <g aria-hidden>
            {STOP_POINTS.map((point, index) => {
              const isOrigin = index === 0;
              const reached = reduced || progress >= index;
              const isActive = !isOrigin && index === activeStop;

              return (
                <g key={STOPS[index].city}>
                  {isActive && (
                    <circle
                      className="fill-accent route-halo"
                      cx={point.x}
                      cy={point.y}
                      r={size.halo}
                    />
                  )}
                  <circle
                    className={cx(
                      "route-node",
                      isOrigin
                        ? "fill-accent stroke-surface"
                        : reached
                          ? "fill-surface stroke-accent"
                          : "fill-surface stroke-line-strong"
                    )}
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? size.active : size.node}
                    strokeWidth={size.ghost * 1.5}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Şehir etiketleri — dar ekranda gizleniyor, altındaki şerit anlatıyor. */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
          {STOPS.map((stop, index) => {
            const point = STOP_POINTS[index];
            const count = programCountFor(stop);
            const reached = reduced || progress >= index;
            const isActive = index === activeStop;

            return (
              <div
                key={stop.city}
                className={cx(
                  "route-label absolute whitespace-nowrap leading-tight",
                  stop.label.align === "start"
                    ? "translate-x-3 -translate-y-1/2"
                    : "-translate-x-[calc(100%+0.75rem)] -translate-y-1/2 text-right"
                )}
                style={{
                  left: `${((point.x - box.x) / box.width) * 100}%`,
                  top: `${((point.y + stop.label.dy - box.y) / box.height) * 100}%`,
                }}
              >
                <span
                  className={cx(
                    "block text-[13px] font-semibold",
                    isActive ? "text-accent" : reached ? "text-ink" : "text-ink-faint"
                  )}
                >
                  {/* Katalog şehirleri iki dilde de katalogdaki gibi yazılır
                      (Delft, Milano). Başlangıç noktası katalogda yok, adı
                      sözlükten geliyor: EN'de "Istanbul". */}
                  {stop.country ? stop.city : copy.originLabel}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink-faint">
                  {stop.country ? fill(copy.stopPrograms, { count }) : copy.originNote}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Şerit: haritanın söylediğini yazıyla da söylüyor. Dar ekranda tek
          okunur kaynak, geniş ekranda "şu an neredeyiz" özeti. */}
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px]">
        <span className="text-ink-faint">{copy.originLabel}</span>
        <span className="text-ink-faint" aria-hidden>
          →
        </span>
        <span className="font-semibold text-accent">{active.city}</span>
        {activeCountry && (
          <span className="text-ink-faint">
            {pick(activeCountry.name)} · {fill(copy.stopPrograms, { count: programCountFor(active) })}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
