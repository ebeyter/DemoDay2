"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BandPill, Button, Card, EmptyState, SectionTitle, VerificationBadge } from "@/components/ui";
import { FitBadge, FitDetail } from "@/components/FitBadge";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { evaluateProgram } from "@/lib/matching";
import { fitSummary, compareByFit } from "@/lib/discover";
import { getProgramById } from "@/data/programs";
import { COUNTRIES, FIELDS } from "@/data/taxonomy";
import { formatDeadline } from "@/lib/format";
import type { CountryCode, MatchResult } from "@/lib/types";

/**
 * Listem — kaydedilen programlar.
 *
 * YENİ STATE YOK: `shortlist` zaten vardı (kalıcı, Supabase'e senkron) ve
 * takvim ekranı da onu kullanıyor. İkinci bir liste açmak, kullanıcının aynı
 * programı iki yerde işaretlemesi gerektiği anlamına gelirdi. Bu yüzden Listem
 * ve takvim AYNI listenin iki görünümü — ve bunu ekranda açıkça yazıyoruz,
 * yoksa kullanıcı iki ayrı liste tuttuğunu sanır.
 */
export default function MyListPage() {
  const router = useRouter();
  const { t, locale, pick } = useLocale();
  const { profile, status, shortlist, toggleShortlist } = useStore();

  useEffect(() => {
    if (status === "loading" || profile) return;
    const timer = setTimeout(() => router.replace("/profile"), 0);
    return () => clearTimeout(timer);
  }, [profile, status, router]);

  /** Ülkeye göre grupla — takvim de ülke/sistem ekseninde çalışıyor. */
  const grouped = useMemo(() => {
    if (!profile) return [];

    const byCountry = new Map<CountryCode, MatchResult[]>();
    for (const id of shortlist) {
      const program = getProgramById(id);
      // Katalogdan kaldırılmış bir program listede kalmış olabilir; sessizce
      // atlıyoruz, çökmüyoruz.
      if (!program) continue;
      const result = evaluateProgram(program, profile);
      const list = byCountry.get(program.country);
      if (list) list.push(result);
      else byCountry.set(program.country, [result]);
    }

    return [...byCountry.entries()]
      .map(([country, results]) => ({ country, results: [...results].sort(compareByFit) }))
      .sort((a, b) => pick(COUNTRIES[a.country].name).localeCompare(pick(COUNTRIES[b.country].name)));
  }, [shortlist, profile, pick]);

  if (status === "loading" || !profile) return null;

  const total = grouped.reduce((sum, g) => sum + g.results.length, 0);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-5 py-10">
        <SectionTitle
          title={t.myList.title}
          subtitle={fill(t.myList.subtitle, { count: total })}
        />

        {total === 0 ? (
          <>
            <EmptyState title={t.myList.empty} hint={t.myList.emptyHint} />
            <div className="mt-6 text-center">
              <Link href="/discover">
                <Button>{t.myList.goDiscover}</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-[12px] text-ink-faint mb-6">ⓘ {t.myList.sharedWithTimeline}</p>

            <div className="space-y-8">
              {grouped.map((group) => {
                const meta = COUNTRIES[group.country];
                return (
                  <section key={group.country}>
                    <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink mb-3">
                      <span aria-hidden>{meta.flag}</span>
                      {pick(meta.name)}
                      <span className="text-ink-faint font-normal text-[13px]">
                        {fill(t.discover.programCount, { count: group.results.length })}
                      </span>
                    </h2>

                    <div className="space-y-3">
                      {group.results.map((result) => {
                        const fit = fitSummary(result);
                        return (
                          <Card key={result.program.id} className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/program/${result.program.id}`}
                                  className="text-[15px] font-medium text-ink hover:text-accent transition-colors"
                                >
                                  {result.program.name}
                                </Link>
                                <p className="text-[13px] text-ink-soft mt-0.5">
                                  {result.program.university} · {result.program.city}
                                </p>
                                <p className="text-[12px] text-ink-faint mt-0.5">
                                  {pick(FIELDS[result.program.field].name)} ·{" "}
                                  {t.program.deadline}: {formatDeadline(result.program.deadline, locale)}
                                </p>
                                <FitDetail fit={fit} className="mt-2" />
                              </div>

                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className="flex items-center gap-2">
                                  <FitBadge fit={fit} size="sm" />
                                  <BandPill band={result.band} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <VerificationBadge status={result.program.verification} />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleShortlist(result.program.id)}
                                  >
                                    {t.myList.remove}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/timeline">
                <Button variant="secondary">{t.nav.timeline} →</Button>
              </Link>
              <Link href="/discover">
                <Button variant="ghost">{t.myList.goDiscover}</Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
