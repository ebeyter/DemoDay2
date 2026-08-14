"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BandPill, Button, Card, EmptyState, SectionTitle, VerificationBadge, cx } from "@/components/ui";
import { FitBadge, FitDetail } from "@/components/FitBadge";
import { RequirementChecklist } from "@/components/RequirementChecklist";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { matchAll } from "@/lib/matching";
import { fitPercentTone, fitSummary, formatFitPercent, groupByCountry } from "@/lib/discover";
import { PROGRAMS } from "@/data/programs";
import { COUNTRIES, FIELDS } from "@/data/taxonomy";
import type { CountryCode } from "@/lib/types";

/**
 * Keşfet — ikinci seviye: bir ülkenin üniversiteleri ve bölümleri.
 *
 * AKIŞ KARARI: üniversite başlığına tıklayınca program listesi AÇILIYOR,
 * ayrı bir sayfaya gitmiyor. Sebep: öğrenci "hangi üniversitede bana uygun
 * bölüm var?" diye tarıyor ve her üniversite için sayfa değiştirmek bu taramayı
 * bitiriyor. Programa tıklayınca ise sayfa değişiyor — orada okunacak çok şey
 * var (şart şart checklist, eksik planı, kaynak linki).
 */
export default function DiscoverCountryPage() {
  const params = useParams<{ country: string }>();
  const router = useRouter();
  const { t, pick } = useLocale();
  const { profile, status, toggleShortlist, isShortlisted } = useStore();

  const code = params.country?.toUpperCase() as CountryCode | undefined;
  const meta = code ? COUNTRIES[code] : undefined;

  /**
   * `undefined` = kullanıcı henüz bir şey açıp kapamadı → en iyi uyumlu
   * üniversite açık başlıyor. `null` = kullanıcı bilinçli olarak hepsini kapattı.
   *
   * Bu ayrım olmadan "varsayılanı aç" işini bir effect içinde setState ile
   * yapmak gerekiyordu; React 19 lint kuralı da haklı olarak buna itiraz ediyor.
   * Türetmek hem kuralı sağlıyor hem bir render turu kazandırıyor.
   */
  const [openUniversity, setOpenUniversity] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (status === "loading" || profile) return;
    const timer = setTimeout(() => router.replace("/profile"), 0);
    return () => clearTimeout(timer);
  }, [profile, status, router]);

  const group = useMemo(() => {
    if (!profile || !code) return undefined;
    return groupByCountry(
      matchAll(PROGRAMS, profile, {
        fields: [],
        countries: [code],
        includeOutOfReach: true,
      })
    )[0];
  }, [profile, code]);

  // En iyi uyumlu üniversite açık başlasın — öğrencinin aradığı şey orada.
  const effectiveOpen =
    openUniversity === undefined ? (group?.universities[0]?.university ?? null) : openUniversity;

  if (status === "loading" || !profile) return null;

  if (!meta || !group) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-5 py-20">
          <EmptyState title={t.discover.empty} hint={t.discover.emptyHint} />
          <div className="mt-6 text-center">
            <Link href="/discover">
              <Button variant="secondary">{t.discover.backToCountries}</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/discover"
          className="inline-block text-[13px] text-ink-faint hover:text-accent mb-6 transition-colors"
        >
          {t.discover.backToCountries}
        </Link>

        <SectionTitle
          title={`${meta.flag} ${pick(meta.name)}`}
          subtitle={
            fill(t.discover.universityCount, { count: group.universities.length }) +
            " · " +
            fill(t.discover.programCount, { count: group.programCount })
          }
        />

        <Card className="p-4 mb-6">
          <p className="text-[13px] text-ink-soft leading-relaxed">{pick(meta.nonEuNote)}</p>
        </Card>

        <div className="space-y-3">
          {group.universities.map((uni) => {
            const open = effectiveOpen === uni.university;
            const bestTone = fitPercentTone(uni.bestPercent);
            return (
              <Card key={uni.university} className="overflow-hidden">
                <button
                  onClick={() => setOpenUniversity(open ? null : uni.university)}
                  aria-expanded={open}
                  className="w-full text-left p-5 hover:bg-surface-soft transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-[16px] font-semibold text-ink">{uni.university}</h2>
                      {uni.meta?.nameLocal && uni.meta.nameLocal !== uni.university && (
                        <p className="text-[12px] text-ink-faint">{uni.meta.nameLocal}</p>
                      )}
                      <p className="text-[13px] text-ink-faint mt-1">
                        {uni.city}
                        {" · "}
                        {fill(t.discover.programCount, { count: uni.results.length })}
                        {uni.verifiedCount > 0 &&
                          " · ✓ " + fill(t.discover.verifiedCount, { count: uni.verifiedCount })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        title={uni.bestPercent === null ? t.discover.fitUncomputableHint : undefined}
                        className={cx(
                          "text-[18px] font-bold tabular-nums",
                          bestTone === "match"
                            ? "text-band-match"
                            : bestTone === "reach"
                              ? "text-band-reach"
                              : "text-ink-faint"
                        )}
                      >
                        {formatFitPercent(uni.bestPercent)}
                      </span>
                      <span aria-hidden className="text-ink-faint text-[12px]">
                        {open ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-line">
                    {/* Üniversite hakkında bilgi + resmî site.
                        Tanıtımı BİZ yazdık; bunu söylemek zorundayız, yoksa
                        kullanıcı üniversitenin kendi metni sanır. */}
                    {uni.meta && (
                      <div className="px-5 py-4 bg-surface-soft">
                        <p className="text-[13px] text-ink-soft leading-relaxed">
                          {pick(uni.meta.description)}
                        </p>
                        <p className="text-[11px] text-ink-faint mt-2">
                          {t.discover.descriptionNote}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <a
                            href={uni.meta.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-accent hover:underline"
                          >
                            {t.discover.officialSite} ↗
                          </a>
                          {uni.facultyLink && (
                            <a
                              href={uni.facultyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[13px] text-accent hover:underline"
                            >
                              {t.discover.facultyPage} ↗
                            </a>
                          )}
                        </div>
                        {uni.meta.urlNote && (
                          <p className="text-[11px] text-ink-faint mt-2">
                            ⓘ {pick(uni.meta.urlNote)}
                          </p>
                        )}
                      </div>
                    )}

                    <ul className="divide-y divide-line">
                      {uni.results.map((result) => {
                        const fit = fitSummary(result);
                        const inList = isShortlisted(result.program.id);
                        return (
                          <li key={result.program.id} className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/program/${result.program.id}`}
                                  className="text-[15px] font-medium text-ink hover:text-accent transition-colors"
                                >
                                  {result.program.name}
                                </Link>
                                <p className="text-[12px] text-ink-faint mt-0.5">
                                  {pick(FIELDS[result.program.field].name)} · {result.program.degree}
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
                                    variant={inList ? "primary" : "secondary"}
                                    onClick={() => toggleShortlist(result.program.id)}
                                  >
                                    {inList ? `★ ${t.discover.inList}` : `☆ ${t.discover.addToList}`}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Şart şart neyi karşılıyor, neyi karşılamıyor.
                                Yüzde ve sayaç "ne kadarını" söylüyordu;
                                öğrencinin asıl sorusu "hangisini" — cevabı
                                bir tık ötede, program detayında bırakmak
                                bu ekranı yarım bırakıyordu. */}
                            <RequirementChecklist
                              result={result}
                              className="mt-3 pl-0.5"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
