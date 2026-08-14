"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { cx } from "@/components/ui";
import { RouteMap } from "./RouteMap";
import { LEG_COUNT } from "./route";
import { usePrefersReducedMotion } from "./use-route-progress";

/**
 * Rota bölümü — TEK EKRAN.
 *
 * Önceki sürümde rota kaydırmaya bağlıydı ve bölüm dört ekran boyu sürüyordu.
 * Sayfa tam sayfa bölümlere geçince o düzen çalışmıyor: bir bölüm bir ekran.
 * Şimdi rota, bölüm görüş alanına girdiğinde kendi kendine çiziliyor ve
 * duraklar sırayla öne çıkıyor.
 *
 * KAYDIRMA YERİNE ZAMAN, ama kontrol kullanıcıda: bir durağa tıklanınca
 * otomatik ilerleme kapanıyor. Kendiliğinden oynayan bir şey, durdurulabildiği
 * sürece iyi bir açılış.
 *
 * Hareket azaltma açıksa rota baştan tamamen çizili geliyor ve hiçbir şey
 * kendiliğinden oynamıyor — bilgi kaybolmuyor, sadece hareket gidiyor.
 */

/** Duraklar arası bekleme. Metni okumaya yetecek kadar uzun, sıkmayacak kadar kısa. */
const STEP_MS = 3400;

export function Journey() {
  const { t } = useLocale();
  const copy = t.landingJourney;
  const reduced = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Bölüm görüş alanına girdi mi? Rota, kimse bakmıyorken çizilip bitmesin.
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Otomatik ilerleme. Son durakta duruyor: başa sarmak, okunan metnin
  // altından kayması demek olurdu.
  useEffect(() => {
    if (!inView || pinned || reduced) return;
    if (step >= LEG_COUNT) return;

    const timer = window.setTimeout(() => setStep((current) => current + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [inView, pinned, reduced, step]);

  // Haritanın beklediği ilerleme: 0 … LEG_COUNT.
  const progress = reduced ? LEG_COUNT : step;
  // Vurgulanan durak metni. 0. adımda henüz yola çıkılmadı, ilk durağı göster.
  const activeIndex = Math.min(Math.max(step - 1, 0), copy.stops.length - 1);

  return (
    <section id="how" ref={sectionRef} className="landing-page landing-dark scroll-mt-16">
      <div className="landing-inner w-full">
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-12">
          <RouteMap progress={progress} reduced={reduced} className="min-w-0" />

          <div>
            <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-hero-ink">
              {copy.stopsTitle}
            </h2>

            <ol className="mt-6 space-y-1">
              {copy.stops.map((stop, index) => {
                const isActive = index === activeIndex;

                return (
                  <li key={stop.title}>
                    <button
                      type="button"
                      onClick={() => {
                        setPinned(true);
                        setStep(index + 1);
                      }}
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

                      {/* Gövde yalnızca aktif durakta. Dördü birden açık
                          olsaydı bölüm bir ekrana sığmazdı. */}
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
        </div>
      </div>
    </section>
  );
}
