"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Button, Card } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { PROGRAMS } from "@/data/programs";
import { COUNTRIES } from "@/data/taxonomy";

export default function LandingPage() {
  const { t, locale } = useLocale();
  const { profile } = useStore();

  const countryCount = Object.keys(COUNTRIES).length;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-5">
        {/* ---------------------------------------------------------------
            Hero
            --------------------------------------------------------------- */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 max-w-3xl">
          <p className="animate-fade text-sm font-medium text-accent mb-4">
            {t.brand.tagline}
          </p>
          <h1
            className="animate-rise text-[38px] sm:text-[52px] leading-[1.08] text-ink"
            style={{ animationDelay: "60ms" }}
          >
            {t.landing.heroTitle}
          </h1>
          <p
            className="animate-rise mt-6 text-[17px] leading-relaxed text-ink-soft max-w-2xl"
            style={{ animationDelay: "140ms" }}
          >
            {t.landing.heroBody}
          </p>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "220ms" }}
          >
            <Link href={profile ? "/results" : "/profile"}>
              <Button size="lg">
                {profile ? t.nav.results : t.landing.ctaPrimary}
                <span aria-hidden>→</span>
              </Button>
            </Link>
            <a href="#how">
              <Button variant="secondary" size="lg">
                {t.landing.ctaSecondary}
              </Button>
            </a>
          </div>

          <dl
            className="animate-fade mt-12 flex flex-wrap gap-x-10 gap-y-4"
            style={{ animationDelay: "320ms" }}
          >
            {[
              { value: String(PROGRAMS.length), label: locale === "tr" ? "program" : "programs" },
              { value: String(countryCount), label: locale === "tr" ? "ülke" : "countries" },
              {
                value: "6",
                label: locale === "tr" ? "başvuru sistemi" : "application systems",
              },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[26px] font-semibold text-ink tabular-nums">{stat.value}</dt>
                <dd className="text-[13px] text-ink-faint">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------------------------------------------------------
            Problem
            --------------------------------------------------------------- */}
        <section className="py-16 border-t border-line">
          <h2 className="text-[26px] text-ink mb-8">{t.landing.problemTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {t.landing.problems.map((problem) => (
              <Card key={problem.title} className="p-6">
                <h3 className="text-[15px] font-semibold text-ink mb-2">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{problem.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------
            Nasıl çalışıyor
            --------------------------------------------------------------- */}
        <section id="how" className="py-16 border-t border-line scroll-mt-20">
          <h2 className="text-[26px] text-ink mb-8">{t.landing.howTitle}</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {t.landing.steps.map((step, index) => (
              <li key={step.title}>
                <Card className="p-6 h-full">
                  <span className="inline-grid place-items-center w-7 h-7 rounded-full bg-accent-soft text-accent text-[13px] font-semibold mb-4">
                    {index + 1}
                  </span>
                  <h3 className="text-[15px] font-semibold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------------------------------------------------------
            Dürüstlük notu — ürünün konumlandırması burada
            --------------------------------------------------------------- */}
        <section className="py-16 border-t border-line">
          <Card className="p-8 sm:p-10 bg-accent-soft border-accent-line max-w-3xl">
            <h2 className="text-[20px] text-ink mb-3">{t.landing.honestyTitle}</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              {t.landing.honestyBody}
            </p>
          </Card>
        </section>

        {/* ---------------------------------------------------------------
            Kapanış
            --------------------------------------------------------------- */}
        <section className="py-20 border-t border-line text-center">
          <h2 className="text-[28px] text-ink mb-6 max-w-xl mx-auto">
            {locale === "tr"
              ? "Bir dakikanı ayır, tercihini veriyle yap."
              : "Give it a minute, then decide on evidence."}
          </h2>
          <Link href={profile ? "/results" : "/profile"}>
            <Button size="lg">
              {profile ? t.nav.results : t.landing.ctaPrimary}
              <span aria-hidden>→</span>
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-6xl px-5 flex flex-wrap justify-between gap-3 text-[13px] text-ink-faint">
          <span>
            {t.brand.name} — Exposure AI Academy Demo Day
          </span>
          <span>
            {locale === "tr"
              ? "Veriler bilgilendirme amaçlıdır; başvurmadan önce kaynağından teyit et."
              : "Data is informational — always confirm at the source before applying."}
          </span>
        </div>
      </footer>
    </>
  );
}
