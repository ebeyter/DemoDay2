"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  BandPill,
  Button,
  Card,
  CheckIcon,
  ProgressBar,
  VerificationBadge,
  cx,
} from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { evaluateProgram } from "@/lib/matching";
import { getProgramById } from "@/data/programs";
import { APPLICATION_SYSTEMS, COUNTRIES, FIELDS, TEACHING_LANGUAGE_LABEL } from "@/data/taxonomy";
import { formatDeadline, formatMoney, daysUntilDeadline } from "@/lib/format";
import { FreshnessBadge, FreshnessPanel } from "@/components/FreshnessBadge";

export default function ProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale, pick } = useLocale();
  const { profile, toggleShortlist, isShortlisted, toggleCompare, isComparing } = useStore();

  const program = getProgramById(params.id);

  const result = useMemo(
    () => (program && profile ? evaluateProgram(program, profile) : null),
    [program, profile]
  );

  if (!program) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <p className="text-ink-soft">
            {locale === "tr" ? "Program bulunamadı." : "Program not found."}
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => router.push("/results")}>
            ← {t.nav.results}
          </Button>
        </main>
      </>
    );
  }

  const country = COUNTRIES[program.country];
  const system = APPLICATION_SYSTEMS[program.applicationSystem];
  const shortlisted = isShortlisted(program.id);
  const inCompare = isComparing(program.id);
  const days = daysUntilDeadline(program.deadline);

  // Kapatılması gereken açıklar — bu sayfanın duygusal merkezi burası.
  const gaps = result?.checks.filter((c) => c.status !== "met" && c.action) ?? [];

  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/results"
          className="inline-block text-[13px] text-ink-faint hover:text-accent mb-6 transition-colors"
        >
          ← {t.nav.results}
        </Link>

        {/* ---------------------------------------------------------------
            Başlık
            --------------------------------------------------------------- */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-ink-faint mb-2">
              <span aria-hidden>{country.flag}</span>
              <span>{pick(country.name)}</span>
              <span aria-hidden>·</span>
              <span>{program.city}</span>
              <span aria-hidden>·</span>
              <span>{pick(FIELDS[program.field].name)}</span>
            </div>
            <h1 className="text-[30px] leading-tight text-ink">{program.name}</h1>
            <p className="text-[15px] text-ink-soft mt-1">
              {program.university}
              {program.universityLocal && program.universityLocal !== program.university && (
                <span className="text-ink-faint"> · {program.universityLocal}</span>
              )}
            </p>
          </div>
          {result && <BandPill band={result.band} />}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Button
            variant={shortlisted ? "primary" : "secondary"}
            size="sm"
            onClick={() => toggleShortlist(program.id)}
          >
            {shortlisted ? "★" : "☆"} {locale === "tr" ? "Takvimime ekle" : "Add to timeline"}
          </Button>
          <Button
            variant={inCompare ? "primary" : "secondary"}
            size="sm"
            onClick={() => toggleCompare(program.id)}
          >
            {inCompare ? t.results.inCompare : t.results.addToCompare}
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <FreshnessBadge programId={program.id} />
            <VerificationBadge status={program.verification} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          {/* -------------------------------------------------------------
              Şart kontrol listesi
              ------------------------------------------------------------- */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-baseline justify-between gap-3 mb-5">
                <h2 className="text-[18px] text-ink">{t.program.requirements}</h2>
                {result && (
                  <span className="text-[13px] text-ink-soft">
                    {fill(t.checks.metCount, {
                      met: result.metMandatory,
                      total: result.totalMandatory,
                    })}
                  </span>
                )}
              </div>

              {result && (
                <ProgressBar
                  value={result.metMandatory}
                  max={Math.max(1, result.totalMandatory)}
                  tone={result.band === "reach" ? "reach" : "match"}
                  className="mb-5"
                />
              )}

              {result ? (
                <ul className="space-y-3">
                  {result.checks.map((check, index) => (
                    <li
                      key={check.id}
                      className="flex gap-3 animate-rise"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <CheckIcon status={check.status} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-medium text-ink">
                            {pick(check.label)}
                          </span>
                          {!check.mandatory && (
                            <span className="text-[11px] text-ink-faint">
                              ({t.common.optional})
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-ink-soft mt-0.5">{pick(check.detail)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-soft">
                  {locale === "tr"
                    ? "Şartların sana göre değerlendirilmesi için profilini oluştur."
                    : "Create your profile to see these requirements checked against you."}
                </p>
              )}

              <a
                href={program.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-5 pt-4 border-t border-line text-[13px] text-accent hover:underline"
              >
                {t.program.sourceLink} ↗
              </a>
            </Card>

            {/* ---------------------------------------------------------
                Eksik planı — "olamazsın" değil "şunu yaparsan olursun"
                --------------------------------------------------------- */}
            {result && (
              <Card
                className={cx(
                  "p-6",
                  gaps.length > 0 ? "border-accent-line bg-accent-soft/50" : ""
                )}
              >
                <h2 className="text-[18px] text-ink mb-4">{t.program.gapTitle}</h2>
                {gaps.length === 0 ? (
                  <p className="text-sm text-ink-soft">{t.program.gapEmpty}</p>
                ) : (
                  <ol className="space-y-4">
                    {gaps.map((gap, index) => (
                      <li key={gap.id} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-white grid place-items-center text-[12px] font-semibold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">{pick(gap.label)}</p>
                          <p className="text-[13px] text-ink-soft leading-relaxed mt-0.5">
                            {gap.action && pick(gap.action)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            )}
          </div>

          {/* -------------------------------------------------------------
              Yan sütun: maliyet, başvuru, ülke notu
              ------------------------------------------------------------- */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-[16px] text-ink mb-4">{t.program.costs}</h2>
              <dl className="space-y-3 text-sm">
                <Row
                  label={t.program.tuitionNonEu}
                  value={
                    program.tuitionNonEu === undefined
                      ? t.program.notStated
                      : formatMoney(program.tuitionNonEu, locale, program.tuitionCurrency)
                  }
                  emphasis
                />
                <Row
                  label={t.program.tuitionEu}
                  value={
                    program.tuitionEu === undefined
                      ? t.program.notStated
                      : formatMoney(program.tuitionEu, locale, program.tuitionCurrency)
                  }
                  muted
                />
                <Row
                  label={t.program.livingCost}
                  value={formatMoney(program.livingCostPerYear, locale)}
                />
                <div className="pt-3 border-t border-line">
                  {/* Toplam iki koşulda hesaplanır: harç biliniyor OLACAK ve
                      harç EUR cinsinden OLACAK. Yaşam maliyeti her zaman EUR;
                      £45.500 ile 20.400 EUR'u toplamak sessizce anlamsız bir
                      sayı üretir. Harç bilinmiyorsa yaşam maliyetini tek başına
                      "toplam yıllık" diye göstermek de gerçeğin çok altında
                      kalır. İkisinde de hesap yapmıyoruz. */}
                  <Row
                    label={t.program.totalCost}
                    value={
                      program.tuitionNonEu === undefined ||
                      (program.tuitionCurrency ?? "EUR") !== "EUR"
                        ? t.program.notStated
                        : formatMoney(
                            program.tuitionNonEu + program.livingCostPerYear,
                            locale
                          )
                    }
                    emphasis
                  />
                </div>
              </dl>
              <p className="text-[12px] text-ink-faint mt-4 leading-relaxed">
                {program.tuitionNonEu === undefined
                  ? t.program.notStatedNote
                  : (program.tuitionCurrency ?? "EUR") !== "EUR"
                    ? t.program.currencyNote
                    : t.program.tuitionEuNote}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-[16px] text-ink mb-4">{t.program.application}</h2>
              <dl className="space-y-3 text-sm">
                <Row label={t.program.system} value={system.name} />
                <Row
                  label={t.program.deadline}
                  value={formatDeadline(program.deadline, locale)}
                  emphasis
                />
                <Row
                  label={t.program.teachingLanguage}
                  value={pick(TEACHING_LANGUAGE_LABEL[program.teachingLanguage])}
                />
                <Row
                  label={t.program.duration}
                  value={`${program.durationYears} ${t.program.durationYears}`}
                />
              </dl>

              <p className="text-[13px] text-ink-soft mt-4 leading-relaxed">
                {pick(system.description)}
              </p>

              <p className="text-[13px] font-medium text-accent mt-3">
                {fill(t.timeline.daysLeft, { days })}
              </p>

              {program.deadlineNote && (
                <p className="text-[12px] text-ink-faint mt-3 leading-relaxed border-t border-line pt-3">
                  {pick(program.deadlineNote)}
                </p>
              )}

              {program.facultyUrl && (
                <a
                  href={program.facultyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-[13px] text-accent hover:underline"
                >
                  {t.program.facultyLink} ↗
                </a>
              )}
            </Card>

            {/* Ülke notu — brief'teki "sistemler farklı" acısının cevabı */}
            <Card className="p-6 bg-surface-soft">
              <h2 className="text-[16px] text-ink mb-2">
                {country.flag} {t.program.countryNote}
              </h2>
              <p className="text-[13px] text-ink-soft leading-relaxed">
                {pick(country.nonEuNote)}
              </p>
            </Card>

            <FreshnessPanel programId={program.id} />

            <p className="text-[12px] text-ink-faint px-1">
              {t.common.lastChecked}: {program.lastChecked}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function Row({
  label,
  value,
  emphasis,
  muted,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd
        className={cx(
          "tabular-nums text-right",
          emphasis ? "font-semibold text-ink" : muted ? "text-ink-faint" : "text-ink"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
