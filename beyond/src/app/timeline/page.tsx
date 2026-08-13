"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Button, Card, EmptyState, SectionTitle, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { getProgramById } from "@/data/programs";
import { APPLICATION_SYSTEMS, COUNTRIES } from "@/data/taxonomy";
import { daysUntilDeadline, formatDeadline } from "@/lib/format";
import { VISA_STEPS, type VisaStep } from "@/lib/visa-steps";
import type { ApplicationSystem, CountryCode, Program } from "@/lib/types";

interface TimelineItem {
  program: Program;
  days: number;
}

export default function TimelinePage() {
  const { t, locale, pick } = useLocale();
  const { shortlist, toggleShortlist } = useStore();

  /**
   * Başvuru sistemine göre gruplama, brief'teki "her ülkenin sistemi farklı"
   * probleminin doğrudan cevabı: öğrenci beş ayrı portalı beş ayrı takvimle
   * takip etmek yerine tek ekranda görüyor.
   */
  const groups = useMemo(() => {
    const items: TimelineItem[] = shortlist
      .map((id) => getProgramById(id))
      .filter((p): p is Program => Boolean(p))
      .map((program) => ({ program, days: daysUntilDeadline(program.deadline) }));

    const bySystem = new Map<ApplicationSystem, TimelineItem[]>();
    for (const item of items) {
      const list = bySystem.get(item.program.applicationSystem) ?? [];
      list.push(item);
      bySystem.set(item.program.applicationSystem, list);
    }

    // Her grup içinde en yakın tarih önce; gruplar da en acil olana göre sıralı.
    const sorted = [...bySystem.entries()].map(([system, list]) => ({
      system,
      items: [...list].sort((a, b) => a.days - b.days),
    }));
    sorted.sort((a, b) => a.items[0].days - b.items[0].days);
    return sorted;
  }, [shortlist]);

  const allItems = groups.flatMap((g) => g.items);
  const nearest = allItems.length > 0 ? Math.min(...allItems.map((i) => i.days)) : null;

  /**
   * Vize/oturum izni adımları — başvuru takviminden AYRI ve görsel olarak
   * ayrışan bir grup (brief'in isteği). Sadece takvimdeki ülkeler için, ve
   * sadece o ülke için araştırılmış, kaynaklı bir adım varsa gösterilir.
   */
  const visaGroups = useMemo(() => {
    const countries = new Set<CountryCode>();
    for (const id of shortlist) {
      const program = getProgramById(id);
      if (program) countries.add(program.country);
    }
    return [...countries]
      .map((country) => ({ country, steps: VISA_STEPS[country] }))
      .filter(
        (g): g is { country: CountryCode; steps: VisaStep[] } =>
          Array.isArray(g.steps) && g.steps.length > 0
      );
  }, [shortlist]);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-3xl px-5 py-10">
        <SectionTitle
          title={t.timeline.title}
          subtitle={t.timeline.subtitle}
          action={
            <Link href="/results">
              <Button variant="ghost" size="sm">
                + {t.nav.results}
              </Button>
            </Link>
          }
        />

        {groups.length === 0 ? (
          <EmptyState title={t.timeline.empty} />
        ) : (
          <>
            {/* En acil tarih — takvimin tepesinde tek bir uyarı */}
            {nearest !== null && (
              <Card className="p-5 mb-8 bg-accent-soft border-accent-line">
                <p className="text-[13px] text-ink-soft">
                  {locale === "tr" ? "En yakın son tarihin" : "Your nearest deadline"}
                </p>
                <p className="text-[26px] font-semibold text-accent tabular-nums mt-0.5">
                  {fill(t.timeline.daysLeft, { days: nearest })}
                </p>
              </Card>
            )}

            <div className="space-y-8">
              {groups.map(({ system, items }) => {
                const meta = APPLICATION_SYSTEMS[system];
                return (
                  <section key={system}>
                    <div className="mb-3">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="text-[16px] font-semibold text-ink">{meta.name}</h3>
                        {meta.url && (
                          <a
                            href={meta.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-accent hover:underline"
                          >
                            {locale === "tr" ? "siteye git" : "open site"} ↗
                          </a>
                        )}
                      </div>
                      <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
                        {pick(meta.description)}
                      </p>
                    </div>

                    <ol className="space-y-2">
                      {items.map(({ program, days }, index) => {
                        const urgent = days <= 45;
                        return (
                          <li key={program.id}>
                            <Card
                              className="p-4 animate-rise"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="flex items-center gap-4">
                                {/* Tarih sütunu */}
                                <div
                                  className={cx(
                                    "shrink-0 w-20 text-center py-2 rounded-xl",
                                    urgent
                                      ? "bg-band-reach-soft text-band-reach"
                                      : "bg-surface-soft text-ink-soft"
                                  )}
                                >
                                  <div className="text-[15px] font-semibold tabular-nums leading-tight">
                                    {formatDeadline(program.deadline, locale)}
                                  </div>
                                  <div className="text-[11px] tabular-nums opacity-80">
                                    {fill(t.timeline.daysLeft, { days })}
                                  </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <Link
                                    href={`/program/${program.id}`}
                                    className="block text-[14px] font-semibold text-ink hover:text-accent leading-snug"
                                  >
                                    {program.name}
                                  </Link>
                                  <p className="text-[13px] text-ink-soft">
                                    {COUNTRIES[program.country].flag} {program.university}
                                  </p>
                                  {program.deadlineNote && (
                                    <p className="text-[12px] text-ink-faint mt-1 leading-relaxed">
                                      {pick(program.deadlineNote)}
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => toggleShortlist(program.id)}
                                  className="shrink-0 text-ink-faint hover:text-danger text-sm p-1"
                                  aria-label={t.common.remove}
                                >
                                  ✕
                                </button>
                              </div>
                            </Card>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                );
              })}
            </div>

            {/* -----------------------------------------------------------
                Vize / oturum izni adımları — başvuru takviminden ayrı,
                görsel olarak ayrışan bir grup.
                ----------------------------------------------------------- */}
            {visaGroups.length > 0 && (
              <div className="mt-10 pt-8 border-t-2 border-dashed border-line-strong">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg" aria-hidden>
                    🛂
                  </span>
                  <h2 className="text-[17px] font-semibold text-ink">{t.timeline.visaTitle}</h2>
                </div>
                <p className="text-[13px] text-ink-soft mb-6 leading-relaxed max-w-2xl">
                  {t.timeline.visaSubtitle}
                </p>

                <div className="space-y-8">
                  {visaGroups.map(({ country, steps }) => (
                    <section key={country}>
                      <h3 className="text-[15px] font-semibold text-ink mb-3">
                        <span className="mr-1.5" aria-hidden>
                          {COUNTRIES[country].flag}
                        </span>
                        {pick(COUNTRIES[country].name)}
                      </h3>

                      <ol className="space-y-3">
                        {steps.map((step, index) => (
                          <li key={step.id}>
                            <Card className="p-4 border-band-safety-soft bg-band-safety-soft/30">
                              <div className="flex items-start gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-band-safety text-white grid place-items-center text-[12px] font-semibold mt-0.5">
                                  {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-[14px] font-semibold text-ink">
                                      {pick(step.label)}
                                    </h4>
                                    <span className="text-[11px] px-2 py-0.5 rounded-pill font-medium bg-band-safety-soft text-band-safety">
                                      {step.timing
                                        ? step.timing.minWeeks !== undefined
                                          ? fill(t.timeline.visaWeeksRange, {
                                              min: step.timing.minWeeks,
                                              max: step.timing.maxWeeks,
                                            })
                                          : fill(t.timeline.visaWeeksMax, {
                                              max: step.timing.maxWeeks,
                                            })
                                        : t.timeline.visaWeeksUnknown}
                                    </span>
                                  </div>
                                  <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
                                    {pick(step.description)}
                                  </p>
                                  {step.caveat && (
                                    <p className="text-[12px] text-ink-faint mt-1.5 leading-relaxed">
                                      ⚠ {pick(step.caveat)}
                                    </p>
                                  )}
                                  <a
                                    href={step.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-[12px] text-accent hover:underline mt-1.5"
                                  >
                                    {t.common.source} ↗
                                  </a>
                                </div>
                              </div>
                            </Card>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>

                <p className="text-[12px] text-ink-faint mt-5 leading-relaxed max-w-2xl">
                  {t.timeline.visaDisclaimer}
                </p>
              </div>
            )}

            <p className="text-[13px] text-ink-faint mt-8 leading-relaxed">
              {locale === "tr"
                ? "Tarihler her akademik yıl için tekrarlanır; geçmiş tarihler otomatik olarak gelecek döneme taşınır. Başvurmadan önce mutlaka programın kendi sayfasından teyit et."
                : "Deadlines repeat each academic year; past dates roll forward automatically. Always confirm on the program's own page before applying."}
            </p>
          </>
        )}
      </main>
    </>
  );
}
