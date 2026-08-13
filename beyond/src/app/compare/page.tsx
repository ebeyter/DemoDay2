"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import {
  BandPill,
  Button,
  CheckIcon,
  EmptyState,
  SectionTitle,
  VerificationBadge,
  cx,
} from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { evaluateProgram } from "@/lib/matching";
import { getProgramById } from "@/data/programs";
import { APPLICATION_SYSTEMS, COUNTRIES, TEACHING_LANGUAGE_LABEL } from "@/data/taxonomy";
import { formatDeadline, formatMoney } from "@/lib/format";
import type { MatchResult, Program } from "@/lib/types";

export default function ComparePage() {
  const { t, locale, pick } = useLocale();
  const { compare, toggleCompare, profile } = useStore();

  const rows = useMemo(() => {
    return compare
      .map((id) => getProgramById(id))
      .filter((p): p is Program => Boolean(p))
      .map((program) => ({
        program,
        result: profile ? evaluateProgram(program, profile) : null,
      }));
  }, [compare, profile]);

  /**
   * Karşılaştırmanın asıl değeri farkları göstermesinde.
   * Tüm programlarda aynı olan bir satır kullanıcıya hiçbir şey söylemiyor,
   * o yüzden farklı olan satırları işaretliyoruz.
   */
  function differs(values: string[]): boolean {
    return new Set(values).size > 1;
  }

  if (rows.length === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-5 py-10">
          <SectionTitle title={t.compare.title} subtitle={t.compare.subtitle} />
          <EmptyState title={t.compare.empty} hint={t.compare.emptyHint} />
          <div className="mt-6 text-center">
            <Link href="/results">
              <Button variant="secondary">{t.nav.results} →</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const cells = rows.map(({ program, result }) => ({ program, result }));

  const ROWS: {
    label: string;
    render: (item: { program: Program; result: MatchResult | null }) => React.ReactNode;
    raw: (item: { program: Program; result: MatchResult | null }) => string;
    emphasis?: boolean;
  }[] = [
    {
      label: t.checks.metCount.replace("{met}/{total} ", ""),
      render: ({ result }) =>
        result ? (
          <span className="font-semibold tabular-nums">
            {result.metMandatory}/{result.totalMandatory}
          </span>
        ) : (
          "—"
        ),
      raw: ({ result }) => (result ? `${result.metMandatory}/${result.totalMandatory}` : "—"),
      emphasis: true,
    },
    {
      label: t.program.tuitionNonEu,
      render: ({ program }) => formatMoney(program.tuitionNonEu, locale),
      raw: ({ program }) => String(program.tuitionNonEu),
      emphasis: true,
    },
    {
      label: t.program.livingCost,
      render: ({ program }) => formatMoney(program.livingCostPerYear, locale),
      raw: ({ program }) => String(program.livingCostPerYear),
    },
    {
      label: t.program.totalCost,
      render: ({ program }) => (
        <span className="font-semibold">
          {formatMoney(program.tuitionNonEu + program.livingCostPerYear, locale)}
        </span>
      ),
      raw: ({ program }) => String(program.tuitionNonEu + program.livingCostPerYear),
      emphasis: true,
    },
    {
      label: t.program.teachingLanguage,
      render: ({ program }) => pick(TEACHING_LANGUAGE_LABEL[program.teachingLanguage]),
      raw: ({ program }) => program.teachingLanguage,
    },
    {
      label: t.program.system,
      render: ({ program }) => APPLICATION_SYSTEMS[program.applicationSystem].name,
      raw: ({ program }) => program.applicationSystem,
    },
    {
      label: t.program.deadline,
      render: ({ program }) => (
        <span className="font-medium">{formatDeadline(program.deadline, locale)}</span>
      ),
      raw: ({ program }) => program.deadline,
      emphasis: true,
    },
    {
      label: t.program.duration,
      render: ({ program }) => `${program.durationYears} ${t.program.durationYears}`,
      raw: ({ program }) => String(program.durationYears),
    },
  ];

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <SectionTitle
          title={t.compare.title}
          subtitle={t.compare.subtitle}
          action={
            <Link href="/results">
              <Button variant="ghost" size="sm">
                + {t.nav.results}
              </Button>
            </Link>
          }
        />

        <div className="overflow-x-auto thin-scroll -mx-5 px-5">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-40 sticky left-0 bg-canvas z-10" />
                {cells.map(({ program, result }) => (
                  <th
                    key={program.id}
                    className="text-left align-top p-4 bg-surface border border-line rounded-t-card min-w-[200px]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {result && <BandPill band={result.band} />}
                      <button
                        onClick={() => toggleCompare(program.id)}
                        className="text-ink-faint hover:text-danger text-sm leading-none p-1"
                        aria-label={t.common.remove}
                      >
                        ✕
                      </button>
                    </div>
                    <Link
                      href={`/program/${program.id}`}
                      className="block text-[14px] font-semibold text-ink hover:text-accent leading-snug"
                    >
                      {program.name}
                    </Link>
                    <p className="text-[13px] text-ink-soft font-normal mt-0.5">
                      {program.university}
                    </p>
                    <p className="text-[12px] text-ink-faint font-normal mt-1">
                      {COUNTRIES[program.country].flag} {pick(COUNTRIES[program.country].name)}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row) => {
                const raws = cells.map(row.raw);
                const isDifferent = differs(raws);

                return (
                  <tr key={row.label}>
                    <th
                      scope="row"
                      className={cx(
                        "text-left text-[13px] font-normal p-4 align-top sticky left-0 bg-canvas z-10",
                        isDifferent ? "text-ink" : "text-ink-faint"
                      )}
                    >
                      {row.label}
                      {isDifferent && (
                        <span
                          className="ml-1.5 text-accent"
                          title={locale === "tr" ? "Programlar arasında farklı" : "Differs across programs"}
                          aria-hidden
                        >
                          •
                        </span>
                      )}
                    </th>
                    {cells.map((item) => (
                      <td
                        key={item.program.id}
                        className={cx(
                          "p-4 text-sm align-top bg-surface border-x border-b border-line tabular-nums",
                          isDifferent ? "text-ink" : "text-ink-faint"
                        )}
                      >
                        {row.render(item)}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Şart kırılımı — asıl karar burada veriliyor */}
              <tr>
                <th
                  scope="row"
                  className="text-left text-[13px] font-normal p-4 align-top sticky left-0 bg-canvas z-10 text-ink"
                >
                  {t.program.requirements}
                </th>
                {cells.map(({ program, result }) => (
                  <td
                    key={program.id}
                    className="p-4 align-top bg-surface border-x border-b border-line rounded-b-card"
                  >
                    {result ? (
                      <ul className="space-y-2">
                        {result.checks.map((check) => (
                          <li key={check.id} className="flex items-start gap-2">
                            <CheckIcon status={check.status} />
                            <span className="text-[12px] text-ink-soft leading-tight">
                              {pick(check.label)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-ink-faint">—</span>
                    )}
                    <div className="mt-3">
                      <VerificationBadge status={program.verification} />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[13px] text-ink-faint mt-6">
          <span className="text-accent">•</span>{" "}
          {locale === "tr"
            ? "İşaretli satırlar programlar arasında farklılık gösteriyor — kararını genelde bunlar belirler."
            : "Marked rows differ across programs — these usually decide it."}
        </p>
      </main>
    </>
  );
}
