"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { JourneyStops } from "@/components/landing/Journey";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingStage } from "@/components/landing/LandingStage";
import { LEG_COUNT } from "@/components/landing/route";
import { usePrefersReducedMotion } from "@/components/landing/use-route-progress";
import { Button, Card } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { PROGRAMS } from "@/data/programs";
import { COUNTRIES } from "@/data/taxonomy";
import "./landing.css";

/**
 * Landing — beş tam ekran bölüm, tek kalıcı görsel.
 *
 * YAPI
 * `main` kendi kaydırma bağlamını kuruyor ve her bölüm bir durak noktası
 * (`scroll-snap`). Harita sayfayla birlikte akmıyor: sabit duruyor ve
 * bölümden bölüme taşınıp ölçekleniyor (bkz. LandingStage). Böylece sayfa
 * slayt gösterisi değil, tek bir nesnenin etrafında dönen bir anlatı oluyor.
 *
 * TUTTURMA `proximity`, `mandatory` DEĞİL — bir bölüm ekrandan uzun olduğunda
 * (küçük telefon, büyük yazı tipi, uzun çeviri) zorunlu tutturma alt kısmı
 * erişilemez hale getiriyor.
 *
 * KOYU AÇILIŞ. İlk iki bölüm her iki temada da koyu; ürün "sınırların ötesi"
 * diyor, açılış gece göğü ve rota orada parlıyor.
 *
 * Sayfadaki hiçbir sayı elle yazılmadı: program, ülke ve başvuru sistemi
 * sayıları katalogdan türetiliyor. Kabul olasılığı veya yüzde vaadi yok —
 * ürünün duruşu bu, landing de aynı şeyi söylemek zorunda.
 */

/** Rota bölümünün indeksi — sahne duruşları ve adım animasyonu buna bakıyor. */
const ROUTE_SECTION = 1;

/**
 * Rota duraklarının otomatik ilerleme aralığı. Yayın çizilme süresinden
 * (bkz. landing.css `.route-leg`) biraz uzun: bir bacak bitmeden diğeri
 * başlarsa rota tek bir bulanık hareket gibi görünüyor.
 */
const STEP_MS = 1250;

export default function LandingPage() {
  const { t } = useLocale();
  const { profile } = useStore();
  const copy = t.landingJourney;
  const reduced = usePrefersReducedMotion();

  const countryCount = Object.keys(COUNTRIES).length;
  // Başvuru sistemi sayısı da katalogdan: ülkelerin sistemlerinin birleşimi.
  const systemCount = new Set(Object.values(COUNTRIES).flatMap((country) => country.systems)).size;

  const stats = [
    { value: PROGRAMS.length, label: copy.statPrograms },
    { value: countryCount, label: copy.statCountries },
    { value: systemCount, label: copy.statSystems },
  ];

  const startHref = profile ? "/results" : "/profile";
  const startLabel = profile ? t.nav.results : copy.ctaPrimary;

  const navLabels = [
    copy.navSections.hero,
    copy.navSections.route,
    copy.navSections.problem,
    copy.navSections.honesty,
    copy.navSections.close,
  ];

  // --- Aktif bölüm ---------------------------------------------------------
  const scrollRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const elements = sectionRefs.current.filter((element): element is HTMLElement =>
      Boolean(element)
    );
    if (elements.length === 0) return;

    // Ekranın ortasındaki bölüm aktif sayılıyor: eşik tabanlı bir ölçüm,
    // ekrandan uzun bölümlerde hiç tetiklenmeyebiliyordu.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = elements.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  /**
   * Bölüme git.
   *
   * DOĞRUDAN ATAMA, YUMUŞAK KAYDIRMA DEĞİL. Bu kap bir `scroll-snap`
   * konteyneri ve Chrome, yumuşak kaydırma animasyonu sürerken tutturmayı
   * yeniden uygulayıp hareketi başladığı yere geri alıyor: `scrollIntoView`,
   * `scrollTo({behavior:"smooth"})` ve CSS `scroll-behavior: smooth` — üçü de
   * denendi, `scrollTop` 0'da kaldı. Kare kare `requestAnimationFrame` ile
   * yumuşatmak da güvenilir değil; sekme ön planda değilken rAF kısıtlanıyor
   * ve düğme hiç çalışmıyor.
   *
   * Anlık atlama her koşulda çalışıyor. Zaten bir "şu bölüme git" düğmesi;
   * asıl gezinme tekerlekle ve orada tutturma kendi yumuşaklığını veriyor.
   */
  const goTo = useCallback((index: number) => {
    const container = scrollRef.current;
    const target = sectionRefs.current[index];
    if (!container || !target) return;
    container.scrollTop = target.offsetTop;
  }, []);

  /**
   * BİR KAYDIRMA = BİR BÖLÜM.
   *
   * `scroll-snap` tek başına yetmiyor: tek bir tekerlek hareketi 800-1000px
   * ilerletebiliyor ve tutturma en yakın noktaya çekince ikinci bölüm
   * atlanıp üçüncüye geçiliyordu. Burada hareketi biz alıyoruz ve her
   * jestte tam bir bölüm ilerliyoruz.
   *
   * İKİ İSTİSNA — kaydırmayı ele geçirmek kolayca düşmanca bir davranışa
   * dönüşüyor, o yüzden:
   *   1. Bölüm ekrandan uzunsa karışmıyoruz; kullanıcının o bölümün alt
   *      kısmına ulaşabilmesi gerekiyor.
   *   2. Hareket azaltma açıksa karışmıyoruz.
   *
   * Bekleme süresi, dokunmatik yüzeylerin tek bir jestte onlarca olay
   * üretmesi için: onu almazsak bir parmak hareketi üç bölüm birden atlıyor.
   */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || reduced) return;

    let locked = false;
    let unlockTimer = 0;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 4) return;

      const current = sectionRefs.current[active];
      if (!current) return;

      const down = event.deltaY > 0;

      /**
       * Bölüm ekrandan uzunsa (küçük pencere, uzun çeviri, büyük yazı tipi)
       * önce o bölümün içi okunabilmeli. O yönde sonuna gelmeden karışmıyoruz;
       * gelince normal "bir jest = bir bölüm" davranışına dönüyoruz.
       */
      if (current.offsetHeight > container.clientHeight + 4) {
        const top = current.offsetTop;
        const bottom = top + current.offsetHeight;
        const viewTop = container.scrollTop;
        const viewBottom = viewTop + container.clientHeight;

        if (down && viewBottom < bottom - 2) return;
        if (!down && viewTop > top + 2) return;
      }

      event.preventDefault();
      if (locked) return;

      const next = active + (down ? 1 : -1);
      if (next < 0 || next >= sectionRefs.current.length) return;

      locked = true;
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        locked = false;
      }, 620);

      goTo(next);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      window.clearTimeout(unlockTimer);
    };
  }, [active, goTo, reduced]);

  // --- Rota adımları -------------------------------------------------------
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (reduced || pinned) return;
    if (active !== ROUTE_SECTION) return;
    if (step >= LEG_COUNT) return;

    const timer = window.setTimeout(() => setStep((current) => current + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [active, step, pinned, reduced]);

  const progress = reduced ? LEG_COUNT : step;

  return (
    <>
      <Header />

      <main ref={scrollRef} className="landing-scroll">
        {/* Kalıcı görsel: bölümden bölüme taşınan harita. */}
        <LandingStage active={active} progress={progress} reduced={reduced} />

        <LandingNav labels={navLabels} active={active} onSelect={goTo} />

        {/* =================================================================
            0 — Açılış
            ================================================================= */}
        <section ref={(element) => {
            sectionRefs.current[0] = element;
          }} className="landing-page landing-dark">
          <div className="landing-aurora" aria-hidden />
          <div className="landing-scrim" aria-hidden />

          <div className="landing-inner">
            <div className="max-w-xl">
              <p className="landing-eyebrow animate-fade">{copy.eyebrow}</p>

              <h1
                className="animate-rise mt-5 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.035em] text-hero-ink"
                style={{ animationDelay: "60ms" }}
              >
                {copy.title}
              </h1>

              <p
                className="animate-rise mt-6 text-[16px] leading-relaxed text-hero-ink-soft sm:text-[17px]"
                style={{ animationDelay: "150ms" }}
              >
                {copy.body}
              </p>

              <div
                className="animate-rise mt-9 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <Link href={startHref}>
                  <Button size="lg">
                    {startLabel}
                    <span aria-hidden>→</span>
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="lg"
                  className="landing-ghost-button"
                  onClick={() => goTo(ROUTE_SECTION)}
                >
                  {copy.ctaSecondary}
                </Button>
              </div>

              <dl
                className="animate-fade mt-10 flex flex-wrap gap-x-10 gap-y-4"
                style={{ animationDelay: "340ms" }}
              >
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-hero-ink tabular-nums">
                      {stat.value}
                    </dt>
                    <dd className="mt-1.5 text-[13px] text-hero-ink-soft">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goTo(ROUTE_SECTION)}
            className="landing-scroll-cue"
            aria-label={copy.ctaSecondary}
          >
            <span aria-hidden>↓</span>
          </button>
        </section>

        {/* =================================================================
            1 — Rota (sayfanın kalbi; harita bu bölümde tam görünür)
            ================================================================= */}
        <section ref={(element) => {
            sectionRefs.current[1] = element;
          }} id="how" className="landing-page landing-dark">
          <div className="landing-inner">
            <div className="ml-auto w-full max-w-md lg:max-w-lg">
              <JourneyStops
                step={step}
                onSelect={(next) => {
                  setPinned(true);
                  setStep(next);
                }}
              />
            </div>
          </div>
        </section>

        {/* =================================================================
            2 — Neden zor?
            ================================================================= */}
        <section ref={(element) => {
            sectionRefs.current[2] = element;
          }} className="landing-page landing-tint">
          <div className="landing-inner">
            <h2 className="max-w-2xl font-display text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
              {t.landing.problemTitle}
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {t.landing.problems.map((problem, index) => (
                <Card
                  key={problem.title}
                  className="landing-reveal p-6 sm:p-7"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <span className="font-display text-[13px] font-bold text-accent tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[16px] font-semibold text-ink">{problem.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{problem.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            3 — Dürüstlük notu: ürünün konumlandırması
            ================================================================= */}
        <section ref={(element) => {
            sectionRefs.current[3] = element;
          }} className="landing-page landing-tint landing-tint-strong">
          <div className="landing-inner max-w-3xl">
            <h2 className="font-display text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
              {t.landing.honestyTitle}
            </h2>
            <p className="mt-7 text-[17px] leading-relaxed text-ink-soft sm:text-[19px]">
              {t.landing.honestyBody}
            </p>
          </div>
        </section>

        {/* =================================================================
            4 — Kapanış
            ================================================================= */}
        <section ref={(element) => {
            sectionRefs.current[4] = element;
          }} className="landing-page landing-dark">
          <div className="landing-aurora" aria-hidden />
          <div className="landing-scrim landing-scrim-center" aria-hidden />
          <div className="landing-inner max-w-2xl text-center">
            <h2 className="font-display text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
              {copy.closingTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-ink-soft">
              {copy.closingBody}
            </p>
            <Link href={startHref} className="mt-9 inline-block">
              <Button size="lg">
                {startLabel}
                <span aria-hidden>→</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
