"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ProgramCard } from "@/components/ProgramCard";
import { Button, Card, Chip, EmptyState, SectionTitle, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { matchAll } from "@/lib/matching";
import { PROGRAMS } from "@/data/programs";
import { COUNTRIES, FIELDS } from "@/data/taxonomy";
import { COUNTRY_CODES, FIELD_IDS, type Band, type CountryCode, type FieldId } from "@/lib/types";

const BAND_ORDER: Band[] = ["match", "reach", "safety", "out-of-reach"];

export default function ResultsPage() {
  const { t, locale, pick } = useLocale();
  const { profile, status } = useStore();
  const router = useRouter();

  // --- Senaryo modu -------------------------------------------------------
  // Profili BOZMADAN geçici olarak ezer. Brief'teki "kararı 100 kez değiştirdik"
  // probleminin doğrudan karşılığı: denemek ucuz olmalı.
  const [scenarioFields, setScenarioFields] = useState<FieldId[] | null>(null);
  const [scenarioCountries, setScenarioCountries] = useState<CountryCode[] | null>(null);
  const [scenarioBudget, setScenarioBudget] = useState<number | null | undefined>(undefined);
  const [showOutOfReach, setShowOutOfReach] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const scenarioActive =
    scenarioFields !== null || scenarioCountries !== null || scenarioBudget !== undefined;

  function resetScenario() {
    setScenarioFields(null);
    setScenarioCountries(null);
    setScenarioBudget(undefined);
  }

  useEffect(() => {
    if (status !== "loading" && !profile) router.replace("/profile");
  }, [profile, status, router]);

  const results = useMemo(() => {
    if (!profile) return [];
    return matchAll(PROGRAMS, profile, {
      fields: scenarioFields ?? undefined,
      countries: scenarioCountries ?? undefined,
      maxTuition: scenarioBudget === undefined ? undefined : (scenarioBudget ?? undefined),
      includeOutOfReach: showOutOfReach,
    });
  }, [profile, scenarioFields, scenarioCountries, scenarioBudget, showOutOfReach]);

  const grouped = useMemo(() => {
    const map = new Map<Band, typeof results>();
    for (const band of BAND_ORDER) map.set(band, []);
    for (const result of results) map.get(result.band)?.push(result);
    return map;
  }, [results]);

  if (!profile) return null;

  const activeFields = scenarioFields ?? profile.fields;
  const activeCountries = scenarioCountries ?? profile.targetCountries;
  const activeBudget = scenarioBudget === undefined ? profile.maxTuition : scenarioBudget;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <SectionTitle
          title={t.results.title}
          subtitle={fill(t.results.subtitle, { count: results.length })}
          action={
            <div className="flex items-center gap-2">
              <Link href="/gap-plan">
                <Button variant="secondary" size="sm">
                  {t.nav.gapPlan}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  {t.common.edit}
                </Button>
              </Link>
            </div>
          }
        />

        {/* -----------------------------------------------------------------
            Senaryo paneli
            ----------------------------------------------------------------- */}
        <Card
          className={cx(
            "mb-8 overflow-hidden transition-colors",
            scenarioActive && "border-accent-line bg-accent-soft/40"
          )}
        >
          <button
            onClick={() => setPanelOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
            aria-expanded={panelOpen}
          >
            <div className="min-w-0">
              <span className="text-sm font-medium text-ink">{t.results.scenarioTitle}</span>
              <p className="text-[13px] text-ink-soft mt-0.5 truncate">
                {scenarioActive ? t.results.scenarioActive : t.results.scenarioHint}
              </p>
            </div>
            <span
              className={cx(
                "shrink-0 text-ink-faint transition-transform duration-200",
                panelOpen && "rotate-180"
              )}
              aria-hidden
            >
              ▾
            </span>
          </button>

          {panelOpen && (
            <div className="px-5 pb-5 pt-1 space-y-5 border-t border-line animate-fade">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-ink-faint mb-2 mt-4">
                  {pick({ tr: "Alan", en: "Field" })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {FIELD_IDS.map((id) => (
                    <Chip
                      key={id}
                      selected={activeFields.includes(id)}
                      onClick={() =>
                        setScenarioFields(
                          activeFields.includes(id)
                            ? activeFields.filter((f) => f !== id)
                            : [...activeFields, id]
                        )
                      }
                    >
                      {pick(FIELDS[id].name)}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-ink-faint mb-2">
                  {pick({ tr: "Ülke", en: "Country" })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {COUNTRY_CODES.map((code) => (
                    <Chip
                      key={code}
                      selected={activeCountries.includes(code)}
                      onClick={() =>
                        setScenarioCountries(
                          activeCountries.includes(code)
                            ? activeCountries.filter((c) => c !== code)
                            : [...activeCountries, code]
                        )
                      }
                    >
                      <span className="mr-1.5" aria-hidden>
                        {COUNTRIES[code].flag}
                      </span>
                      {pick(COUNTRIES[code].name)}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-ink-faint mb-2">
                  {pick({ tr: "Yıllık harç üst sınırı", en: "Max yearly tuition" })}
                </p>
                <div className="flex items-center gap-3 max-w-md">
                  <input
                    type="range"
                    min={0}
                    max={55000}
                    step={500}
                    value={activeBudget ?? 55000}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setScenarioBudget(value >= 55000 ? null : value);
                    }}
                    className="flex-1 accent-[#3730a3]"
                  />
                  <span className="w-28 text-right text-sm font-medium text-ink tabular-nums">
                    {activeBudget === undefined || activeBudget === null
                      ? t.wizard.targets.budgetNoLimit
                      : `€${activeBudget.toLocaleString(locale === "tr" ? "tr-TR" : "en-GB")}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOutOfReach}
                    onChange={(e) => setShowOutOfReach(e.target.checked)}
                    className="w-4 h-4 accent-[#3730a3]"
                  />
                  {t.results.showOutOfReach}
                </label>

                {scenarioActive && (
                  <Button variant="ghost" size="sm" onClick={resetScenario}>
                    ↺ {t.results.scenarioReset}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* -----------------------------------------------------------------
            Sonuçlar — bantlara ayrılmış
            ----------------------------------------------------------------- */}
        {results.length === 0 ? (
          <EmptyState title={t.results.empty} hint={t.results.emptyHint} />
        ) : (
          <div className="space-y-10">
            {BAND_ORDER.map((band) => {
              const items = grouped.get(band) ?? [];
              if (items.length === 0) return null;

              return (
                <section key={band}>
                  <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="text-[17px] font-semibold text-ink">{t.bands[band]}</h3>
                    <span className="text-[13px] text-ink-faint">
                      {items.length} {locale === "tr" ? "program" : "programs"}
                    </span>
                    <span className="text-[13px] text-ink-faint ml-auto hidden sm:block">
                      {t.bands[`${band}Desc` as keyof typeof t.bands]}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((result, index) => (
                      <ProgramCard key={result.program.id} result={result} index={index} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
