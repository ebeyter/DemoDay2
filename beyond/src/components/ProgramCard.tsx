"use client";

import Link from "next/link";
import type { MatchResult } from "@/lib/types";
import { COUNTRIES, FIELDS, TEACHING_LANGUAGE_LABEL } from "@/data/taxonomy";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { BandPill, Button, Card, ProgressBar, VerificationBadge, cx } from "./ui";
import { FreshnessBadge } from "./FreshnessBadge";
import { formatMoney, formatDeadline } from "@/lib/format";

export function ProgramCard({ result, index = 0 }: { result: MatchResult; index?: number }) {
  const { t, locale, pick } = useLocale();
  const { toggleCompare, isComparing, compare, toggleShortlist, isShortlisted } = useStore();
  const { program } = result;

  const country = COUNTRIES[program.country];
  const inCompare = isComparing(program.id);
  const shortlisted = isShortlisted(program.id);
  const compareFull = compare.length >= 4 && !inCompare;

  return (
    <Card
      interactive
      className="p-5 animate-rise"
      // Kartların sırayla belirmesi — "sonuçlar hesaplanıyor" hissini veren şey
      // bu küçük gecikme. 8 karttan sonra sabitleniyor ki bekleme uzamasın.
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] text-ink-faint mb-1">
            <span aria-hidden>{country.flag}</span>
            <span>{pick(country.name)}</span>
            <span aria-hidden>·</span>
            <span>{program.city}</span>
          </div>
          <Link
            href={`/program/${program.id}`}
            className="block text-[16px] font-semibold text-ink hover:text-accent transition-colors leading-snug"
          >
            {program.name}
          </Link>
          <p className="text-sm text-ink-soft mt-0.5">{program.university}</p>
        </div>
        <BandPill band={result.band} className="shrink-0" />
      </div>

      {/* Şart sayacı — "%78 kabul" yerine koyduğumuz dürüst ölçü */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[13px] text-ink-soft">
            {fill(t.checks.metCount, {
              met: result.metMandatory,
              total: result.totalMandatory,
            })}
          </span>
          <span className="text-[13px] text-ink-faint tabular-nums">
            {result.totalMandatory > 0
              ? Math.round((result.metMandatory / result.totalMandatory) * 100)
              : 100}
            %
          </span>
        </div>
        <ProgressBar
          value={result.metMandatory}
          max={Math.max(1, result.totalMandatory)}
          tone={result.band === "reach" ? "reach" : "match"}
        />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] mb-4">
        <div>
          <dt className="text-ink-faint">{t.program.tuitionNonEu}</dt>
          <dd
            className={cx(
              "font-medium tabular-nums",
              result.overBudget ? "text-danger" : "text-ink"
            )}
          >
            {program.tuitionNonEu === undefined ? (
              <span className="text-ink-faint font-normal">{t.program.notStated}</span>
            ) : (
              <>
                {formatMoney(program.tuitionNonEu, locale)}
                <span className="text-ink-faint font-normal">{t.common.perYear}</span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">{t.program.deadline}</dt>
          <dd className="font-medium text-ink tabular-nums">
            {formatDeadline(program.deadline, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">{t.program.teachingLanguage}</dt>
          <dd className="font-medium text-ink">
            {pick(TEACHING_LANGUAGE_LABEL[program.teachingLanguage])}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint">{t.nav.results}</dt>
          <dd className="font-medium text-ink">{pick(FIELDS[program.field].name)}</dd>
        </div>
      </dl>

      {result.overBudget && (
        <p className="text-[12px] text-danger mb-3">⚠ {t.results.overBudget}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line">
        <Link href={`/program/${program.id}`} className="mr-auto">
          <Button size="sm" variant="secondary">
            {locale === "tr" ? "Detay" : "Details"} →
          </Button>
        </Link>

        <button
          onClick={() => toggleShortlist(program.id)}
          className={cx(
            "text-[13px] px-2.5 py-1.5 rounded-lg transition-colors",
            shortlisted
              ? "text-accent bg-accent-soft font-medium"
              : "text-ink-faint hover:text-accent hover:bg-accent-soft"
          )}
        >
          {shortlisted ? "★" : "☆"} {locale === "tr" ? "Takvimim" : "Timeline"}
        </button>

        <button
          onClick={() => toggleCompare(program.id)}
          disabled={compareFull}
          title={compareFull ? t.compare.full : undefined}
          className={cx(
            "text-[13px] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40",
            inCompare
              ? "text-accent bg-accent-soft font-medium"
              : "text-ink-faint hover:text-accent hover:bg-accent-soft"
          )}
        >
          {inCompare ? t.results.inCompare : t.results.addToCompare}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <VerificationBadge status={program.verification} />
        <FreshnessBadge programId={program.id} />
      </div>
    </Card>
  );
}
