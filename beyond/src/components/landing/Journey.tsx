"use client";

import { useRef } from "react";
import { useLocale } from "@/lib/i18n/context";
import { cx } from "@/components/ui";
import { RouteMap } from "./RouteMap";
import { LEG_COUNT, clamp } from "./route";
import { usePrefersReducedMotion, useRouteProgress } from "./use-route-progress";

/**
 * Rota bölümü: solda yapışkan harita, sağda duraklar.
 * Kaydırdıkça bir sonraki bacak çiziliyor ve o durağın metni öne çıkıyor.
 *
 * Harita geniş ekranda yanda, dar ekranda başlıkların üstünde yapışıyor.
 * İki düzende de metin haritanın söylediğinin tamamını taşıyor — harita
 * görünmese bile bölüm anlamlı.
 */
export function Journey() {
  const { t } = useLocale();
  const copy = t.landingJourney;

  const sections = useRef<Array<HTMLElement | null>>([]);
  const reduced = usePrefersReducedMotion();
  const progress = useRouteProgress(sections, LEG_COUNT);

  const activeIndex = clamp(Math.floor(progress), 0, LEG_COUNT - 1);

  return (
    <section id="how" className="scroll-mt-20 border-t border-line py-14 sm:py-20">
      <h2 className="text-[26px] text-ink">{copy.stopsTitle}</h2>

      <div className="mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-14">
        {/* Yapışkan harita. Dar ekranda -mx-5 ile kenarlara taşıyor; ana
            kapsayıcı zaten px-5 verdiği için yatay taşma olmuyor. */}
        <div className="sticky top-16 z-10 -mx-5 bg-canvas px-5 pt-3 pb-4 lg:top-24 lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0">
          {/* Yığılmış düzende harita genişlemesin: yapışkan blok ekranın
              yarısını yerse altındaki metne yer kalmıyor. */}
          <RouteMap
            progress={progress}
            reduced={reduced}
            className="mx-auto max-w-[560px] lg:max-w-none"
          />
        </div>

        <ol className="mt-8 lg:mt-0">
          {copy.stops.map((stop, index) => {
            const isActive = index === activeIndex;

            return (
              <li
                key={stop.title}
                // React 19: ok fonksiyonunun gövdesi süslü parantezle sarılı.
                // `ref={(el) => (dizi[i] = el)}` atamanın DEĞERİNİ döndürür,
                // React 19 bunu temizleme fonksiyonu sanıp hata verir.
                ref={(element) => {
                  sections.current[index] = element;
                }}
                className={cx(
                  "flex min-h-[58vh] flex-col justify-center py-6 lg:min-h-[78vh] lg:py-0",
                  "route-stop",
                  isActive ? "route-stop-active" : undefined
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
                  {stop.tag}
                </span>
                <h3 className="mt-3 text-[22px] text-ink sm:text-[26px]">{stop.title}</h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                  {stop.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
