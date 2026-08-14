"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Journey } from "@/components/landing/Journey";
import { Button, Card } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { PROGRAMS } from "@/data/programs";
import { COUNTRIES } from "@/data/taxonomy";
import "./landing.css";

/**
 * Landing — "Türkiye'den Avrupa'ya" rotası üzerine kurulu.
 *
 * TAM SAYFA BÖLÜMLER
 * Sayfa `main` içinde kendi kaydırma bağlamını kuruyor ve her bölüm bir
 * durak noktası (`snap-start`). Kaydırma `proximity`, `mandatory` DEĞİL:
 * zorunlu tutturma, bir bölüm ekrandan uzun olduğunda (küçük telefon, büyük
 * yazı tipi) alt kısmı erişilemez hale getiriyor. Yakınlık modu aynı "yerine
 * oturma" hissini veriyor ama içeriği kilitlemiyor.
 *
 * KOYU AÇILIŞ
 * İlk iki bölüm her iki temada da koyu (`--color-hero-*`). Bilinçli bir
 * sahne: ürün "sınırların ötesi" diyor, açılış gece göğü, rota orada
 * parlıyor. Sayfanın geri kalanı normal tema renklerinde.
 *
 * Sayfadaki hiçbir sayı elle yazılmadı: program, ülke ve başvuru sistemi
 * sayıları katalogdan türetiliyor. Katalog büyüyünce landing de büyür.
 *
 * Sayfada kabul olasılığı veya yüzde vaadi yok. Ürünün duruşu bu; landing
 * de aynı şeyi söylemek zorunda, yoksa ilk ekran ürünün kendisiyle çelişir.
 */
export default function LandingPage() {
  const { t } = useLocale();
  const { profile } = useStore();
  const copy = t.landingJourney;

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

  return (
    <>
      <Header />

      <main className="landing-scroll">
        {/* =================================================================
            1 — Açılış
            ================================================================= */}
        <section className="landing-page landing-dark">
          {/* Işık lekeleri. `aria-hidden` ve pointer-events yok: tamamen
              dekoratif, ekran okuyucuya ve fareye görünmüyor. */}
          <div className="landing-aurora" aria-hidden />

          <div className="landing-inner">
            <p className="landing-eyebrow animate-fade">{copy.eyebrow}</p>

            <h1
              className="animate-rise mt-5 font-display text-[clamp(2.4rem,7vw,5.2rem)] font-bold leading-[0.98] tracking-[-0.035em] text-hero-ink"
              style={{ animationDelay: "60ms" }}
            >
              {copy.title}
            </h1>

            <p
              className="animate-rise mt-7 max-w-2xl text-[17px] leading-relaxed text-hero-ink-soft sm:text-[19px]"
              style={{ animationDelay: "150ms" }}
            >
              {copy.body}
            </p>

            <div
              className="animate-rise mt-10 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <Link href={startHref}>
                <Button size="lg">
                  {startLabel}
                  <span aria-hidden>→</span>
                </Button>
              </Link>
              <a href="#how">
                <Button variant="secondary" size="lg" className="landing-ghost-button">
                  {copy.ctaSecondary}
                </Button>
              </a>
            </div>

            <dl
              className="animate-fade mt-14 flex flex-wrap gap-x-12 gap-y-5"
              style={{ animationDelay: "340ms" }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-[38px] font-bold leading-none tracking-[-0.03em] text-hero-ink tabular-nums">
                    {stat.value}
                  </dt>
                  <dd className="mt-1.5 text-[13px] text-hero-ink-soft">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <a href="#how" className="landing-scroll-cue" aria-label={copy.ctaSecondary}>
            <span aria-hidden>↓</span>
          </a>
        </section>

        {/* =================================================================
            2 — Rota (koyu bölüm, sayfanın kalbi)
            ================================================================= */}
        <Journey />

        {/* =================================================================
            3 — Neden zor?
            ================================================================= */}
        <section className="landing-page">
          <div className="landing-inner">
            <h2 className="font-display text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
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
            4 — Dürüstlük notu: ürünün konumlandırması
            ================================================================= */}
        <section className="landing-page">
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
            5 — Kapanış
            ================================================================= */}
        <section className="landing-page">
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
