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
 * Sayfadaki hiçbir sayı elle yazılmadı: program, ülke ve başvuru sistemi
 * sayıları katalogdan türetiliyor. Katalog büyüyünce landing de büyür,
 * kimsenin bir metni güncellemesi gerekmez.
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

      <main className="mx-auto max-w-6xl px-5">
        {/* -----------------------------------------------------------------
            Hero
            ----------------------------------------------------------------- */}
        <section className="max-w-3xl pt-16 pb-14 sm:pt-24 sm:pb-20">
          <p className="animate-fade mb-4 text-sm font-medium text-accent">{copy.eyebrow}</p>
          <h1
            className="animate-rise text-[34px] leading-[1.1] text-ink sm:text-[52px] sm:leading-[1.08]"
            style={{ animationDelay: "60ms" }}
          >
            {copy.title}
          </h1>
          <p
            className="animate-rise mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft"
            style={{ animationDelay: "140ms" }}
          >
            {copy.body}
          </p>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "220ms" }}
          >
            <Link href={startHref}>
              <Button size="lg">
                {startLabel}
                <span aria-hidden>→</span>
              </Button>
            </Link>
            <a href="#how">
              <Button variant="secondary" size="lg">
                {copy.ctaSecondary}
              </Button>
            </a>
          </div>

          <dl
            className="animate-fade mt-12 flex flex-wrap gap-x-10 gap-y-4"
            style={{ animationDelay: "320ms" }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[26px] font-semibold text-ink tabular-nums">{stat.value}</dt>
                <dd className="text-[13px] text-ink-faint">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* -----------------------------------------------------------------
            Problem — demo akışının 1. adımı bu üç kartı gösteriyor,
            README'deki sahne notuyla birebir duruyor.
            ----------------------------------------------------------------- */}
        <section className="border-t border-line py-14 sm:py-16">
          <h2 className="mb-8 text-[26px] text-ink">{t.landing.problemTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {t.landing.problems.map((problem) => (
              <Card key={problem.title} className="p-6">
                <h3 className="mb-2 text-[15px] font-semibold text-ink">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{problem.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* -----------------------------------------------------------------
            Rota — sayfanın kalbi
            ----------------------------------------------------------------- */}
        <Journey />

        {/* -----------------------------------------------------------------
            Dürüstlük notu — ürünün konumlandırması burada
            ----------------------------------------------------------------- */}
        <section className="border-t border-line py-14 sm:py-16">
          <Card className="max-w-3xl border-accent-line bg-accent-soft p-8 sm:p-10">
            <h2 className="mb-3 text-[20px] text-ink">{t.landing.honestyTitle}</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">{t.landing.honestyBody}</p>
          </Card>
        </section>

        {/* -----------------------------------------------------------------
            Kapanış
            ----------------------------------------------------------------- */}
        <section className="border-t border-line py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-xl text-[26px] text-ink sm:text-[28px]">
            {copy.closingTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            {copy.closingBody}
          </p>
          <Link href={startHref} className="mt-8 inline-block">
            <Button size="lg">
              {startLabel}
              <span aria-hidden>→</span>
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 text-[13px] text-ink-faint">
          <span>{t.brand.name} — Exposure AI Academy Demo Day</span>
          <span>{copy.footerNote}</span>
        </div>
      </footer>
    </>
  );
}
