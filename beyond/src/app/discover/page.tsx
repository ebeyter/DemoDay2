"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, EmptyState, SectionTitle, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { matchAll } from "@/lib/matching";
import { groupByCountry } from "@/lib/discover";
import { PROGRAMS } from "@/data/programs";
import { COUNTRIES } from "@/data/taxonomy";

/**
 * Keşfet — birinci seviye: ülkeler.
 *
 * SONUÇLAR EKRANINDAN FARKI: /results öğrencinin FİLTRELERİNE uyan programları
 * bant bant gösteriyor. Keşfet ise KATALOĞUN TAMAMINI gösteriyor — ülke kısıtı
 * ve alan kısıtı uygulanmıyor, `includeOutOfReach` açık. Sebep: bu ekranın işi
 * eşleştirmek değil, gezdirmek. Öğrenci "Hollanda'da ne var?" diye bakarken
 * profilindeki alan seçimi yüzünden yarı listeyi kaçırmamalı.
 */
export default function DiscoverPage() {
  const { t, pick } = useLocale();
  const { profile, status } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || profile) return;
    // /results ile aynı desen: profil yoksa sihirbaza gönder.
    const timer = setTimeout(() => router.replace("/profile"), 0);
    return () => clearTimeout(timer);
  }, [profile, status, router]);

  const countries = useMemo(() => {
    if (!profile) return [];
    return groupByCountry(
      matchAll(PROGRAMS, profile, {
        fields: [],
        countries: [],
        includeOutOfReach: true,
      })
    );
  }, [profile]);

  if (status === "loading" || !profile) return null;

  const programTotal = countries.reduce((sum, c) => sum + c.programCount, 0);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-5xl px-5 py-10">
        <SectionTitle
          title={t.discover.title}
          subtitle={fill(t.discover.subtitle, {
            count: programTotal,
            countries: countries.length,
          })}
        />

        <p className="text-[13px] text-ink-soft mb-6 max-w-2xl">{t.discover.countryHint}</p>

        {countries.length === 0 ? (
          <EmptyState title={t.discover.empty} hint={t.discover.emptyHint} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {countries.map((group, index) => {
              const meta = COUNTRIES[group.country];
              return (
                <Link key={group.country} href={`/discover/${group.country}`} className="block">
                  <Card
                    interactive
                    className="p-5 h-full animate-rise"
                    style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span aria-hidden className="text-[20px]">
                            {meta.flag}
                          </span>
                          <h2 className="text-[17px] font-semibold text-ink truncate">
                            {pick(meta.name)}
                          </h2>
                        </div>
                        <p className="text-[13px] text-ink-faint mt-1">
                          {fill(t.discover.universityCount, {
                            count: group.universities.length,
                          })}
                          {" · "}
                          {fill(t.discover.programCount, { count: group.programCount })}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={cx(
                            "text-[22px] font-bold tabular-nums leading-none",
                            group.bestPercent >= 80
                              ? "text-band-match"
                              : group.bestPercent >= 50
                                ? "text-band-reach"
                                : "text-ink-faint"
                          )}
                        >
                          %{group.bestPercent}
                        </div>
                        <div className="text-[11px] text-ink-faint mt-1">
                          {t.discover.bestFit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[12px] text-ink-faint pt-3 border-t border-line">
                      <span className="tabular-nums">
                        {t.discover.averageFit} %{group.averagePercent}
                      </span>
                      {group.verifiedCount > 0 && (
                        <span>
                          ✓ {fill(t.discover.verifiedCount, { count: group.verifiedCount })}
                        </span>
                      )}
                    </div>

                    {/* Ülkeye özgü uyarı — Almanya'da YKS şartı gibi şeyler
                        öğrencinin planını baştan değiştiriyor, kartta görünsün. */}
                    <p className="text-[12px] text-ink-soft mt-3 line-clamp-2">
                      {pick(meta.nonEuNote)}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-[12px] text-ink-faint mt-8 max-w-2xl leading-relaxed">
          {t.discover.fitExplain}
        </p>
      </main>
    </>
  );
}
