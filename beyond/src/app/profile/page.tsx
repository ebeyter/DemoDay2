"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button, Card, Chip, Field, Input, Select, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { toHundredScale } from "@/lib/matching";
import { COUNTRIES, FIELDS } from "@/data/taxonomy";
import {
  EXTRAS,
  GENDERS,
  GPA_SCALES,
  LANGUAGE_TEST_GROUPS,
  LANGUAGE_TEST_SCALES,
  SCHOOL_TYPES,
  STANDARDIZED_TEST_SCALES,
  SUBJECTS,
  formatTestScore,
} from "@/data/options";
import {
  COUNTRY_CODES,
  FIELD_IDS,
  type CountryCode,
  type ExtraRequirementKey,
  type FieldId,
  type LanguageTest,
  type StandardizedTest,
  type StudentProfile,
  type Subject,
} from "@/lib/types";

const STEPS = ["basics", "fields", "grades", "language", "tests", "targets"] as const;
type StepId = (typeof STEPS)[number];

const CURRENT_YEAR = 2026;

function emptyProfile(): StudentProfile {
  return {
    fullName: "",
    schoolType: "anatolian",
    graduationYear: CURRENT_YEAR,
    gpa: 80,
    gpaScale: "100",
    fields: [],
    languageTests: [],
    standardizedTests: [],
    advancedSubjects: [],
    targetCountries: [],
    extrasReady: [],
  };
}

export default function ProfilePage() {
  const { t, locale, pick } = useLocale();
  const { profile, saveProfile } = useStore();
  const router = useRouter();

  const [draft, setDraft] = useState<StudentProfile>(() => profile ?? emptyProfile());
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const step: StepId = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const update = (patch: Partial<StudentProfile>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const canContinue = useMemo(() => {
    if (step === "basics") return draft.fullName.trim().length > 0;
    if (step === "fields") return draft.fields.length > 0;
    if (step === "grades") return draft.gpa > 0;
    return true;
  }, [step, draft]);

  const isLast = stepIndex === STEPS.length - 1;

  async function handleNext() {
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    setSaving(true);
    await saveProfile(draft);
    router.push("/results");
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
        {/* İlerleme — "az kaldı" hissini veren asıl öğe */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h1 className="text-[24px] text-ink">{t.wizard.title}</h1>
            <span className="text-[13px] text-ink-faint tabular-nums">
              {fill(t.wizard.stepOf, { current: stepIndex + 1, total: STEPS.length })}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-soft overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {STEPS.map((id, index) => (
              <button
                key={id}
                type="button"
                onClick={() => index <= stepIndex && setStepIndex(index)}
                disabled={index > stepIndex}
                className={cx(
                  "text-[12px] transition-colors",
                  index === stepIndex
                    ? "text-accent font-medium"
                    : index < stepIndex
                      ? "text-ink-faint hover:text-accent"
                      : "text-line-strong cursor-default"
                )}
              >
                {t.wizard.steps[id]}
              </button>
            ))}
          </div>
        </div>

        <Card key={step} className="p-6 sm:p-8 animate-rise">
          {/* -------------------------------------------------------------
              1 — Temel bilgiler
              ------------------------------------------------------------- */}
          {step === "basics" && (
            <div className="space-y-5">
              <Field label={t.wizard.basics.fullName}>
                <Input
                  value={draft.fullName}
                  onChange={(e) => update({ fullName: e.target.value })}
                  placeholder={t.wizard.basics.fullNamePlaceholder}
                  autoFocus
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t.wizard.basics.birthYear}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={draft.birthYear ?? ""}
                    onChange={(e) =>
                      update({
                        birthYear: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="2008"
                  />
                </Field>

                <Field label={t.wizard.basics.graduationYear}>
                  <Select
                    value={draft.graduationYear}
                    onChange={(e) => update({ graduationYear: Number(e.target.value) })}
                  >
                    {[CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2, CURRENT_YEAR - 1].map(
                      (year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    )}
                  </Select>
                </Field>
              </div>

              <Field label={t.wizard.basics.schoolType}>
                <Select
                  value={draft.schoolType}
                  onChange={(e) =>
                    update({ schoolType: e.target.value as StudentProfile["schoolType"] })
                  }
                >
                  {SCHOOL_TYPES.map((school) => (
                    <option key={school.id} value={school.id}>
                      {pick(school.label)}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label={t.wizard.basics.gender} hint={t.wizard.basics.genderNote}>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((option) => (
                    <Chip
                      key={option.id}
                      selected={draft.gender === option.id}
                      onClick={() =>
                        update({ gender: draft.gender === option.id ? undefined : option.id })
                      }
                    >
                      {pick(option.label)}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* -------------------------------------------------------------
              2 — İlgi alanları
              ------------------------------------------------------------- */}
          {step === "fields" && (
            <div>
              <h2 className="text-[17px] font-semibold text-ink mb-1.5">
                {t.wizard.fields.question}
              </h2>
              <p className="text-sm text-ink-soft mb-5">{t.wizard.fields.hint}</p>
              <div className="flex flex-wrap gap-2">
                {FIELD_IDS.map((id: FieldId) => (
                  <Chip
                    key={id}
                    selected={draft.fields.includes(id)}
                    onClick={() =>
                      update({
                        fields: draft.fields.includes(id)
                          ? draft.fields.filter((f) => f !== id)
                          : [...draft.fields, id],
                      })
                    }
                  >
                    <span className="mr-1.5 opacity-60" aria-hidden>
                      {FIELDS[id].icon}
                    </span>
                    {pick(FIELDS[id].name)}
                  </Chip>
                ))}
              </div>
              {draft.fields.length === 0 && (
                <p className="text-[13px] text-ink-faint mt-4">{t.wizard.fields.empty}</p>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------
              3 — Notlar
              ------------------------------------------------------------- */}
          {step === "grades" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[17px] font-semibold text-ink mb-4">
                  {t.wizard.grades.question}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={t.wizard.grades.scale}>
                    <Select
                      value={draft.gpaScale}
                      onChange={(e) =>
                        update({ gpaScale: e.target.value as StudentProfile["gpaScale"] })
                      }
                    >
                      {GPA_SCALES.map((scale) => (
                        <option key={scale.id} value={scale.id}>
                          {pick(scale.label)}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label={t.wizard.grades.question}>
                    <Input
                      type="number"
                      step="0.01"
                      value={draft.gpa}
                      onChange={(e) => update({ gpa: Number(e.target.value) })}
                    />
                  </Field>
                </div>

                {/* Çevrilmiş notu anında göstermek güven veriyor —
                    öğrenci neyle karşılaştırıldığını görüyor. */}
                <div className="mt-4 p-4 rounded-xl bg-accent-soft border border-accent-line">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-ink-soft">
                      {t.wizard.grades.converted}
                    </span>
                    <span className="text-[22px] font-semibold text-accent tabular-nums">
                      {toHundredScale(draft.gpa, draft.gpaScale).toFixed(0)}
                      <span className="text-[13px] font-normal text-ink-faint">/100</span>
                    </span>
                  </div>
                  <p className="text-[12px] text-ink-faint mt-2 leading-relaxed">
                    {t.wizard.grades.convertedNote}
                  </p>
                </div>
              </div>

              <Field
                label={t.wizard.grades.advancedSubjects}
                hint={t.wizard.grades.advancedSubjectsHint}
              >
                <div className="flex flex-wrap gap-2 mt-1">
                  {SUBJECTS.map((subject) => (
                    <Chip
                      key={subject.id}
                      selected={draft.advancedSubjects.includes(subject.id)}
                      onClick={() =>
                        update({
                          advancedSubjects: draft.advancedSubjects.includes(subject.id)
                            ? draft.advancedSubjects.filter((s) => s !== subject.id)
                            : [...draft.advancedSubjects, subject.id as Subject],
                        })
                      }
                    >
                      {pick(subject.label)}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* -------------------------------------------------------------
              4 — Dil belgeleri
              ------------------------------------------------------------- */}
          {step === "language" && (
            <div>
              <h2 className="text-[17px] font-semibold text-ink mb-1.5">
                {t.wizard.language.question}
              </h2>
              <p className="text-sm text-ink-soft mb-5">{t.wizard.language.hint}</p>

              <div className="space-y-5">
                {LANGUAGE_TEST_GROUPS.map((group) => (
                  <div key={group.language.en}>
                    <p className="text-[12px] font-medium uppercase tracking-wider text-ink-faint mb-2">
                      {pick(group.language)}
                    </p>
                    <div className="space-y-2">
                      {group.tests.map((test) => (
                        <ScoreRow
                          key={test}
                          testId={test}
                          scale={LANGUAGE_TEST_SCALES[test]}
                          value={draft.languageTests.find((s) => s.test === test)?.score}
                          onChange={(score) =>
                            update({
                              languageTests:
                                score === undefined
                                  ? draft.languageTests.filter((s) => s.test !== test)
                                  : [
                                      ...draft.languageTests.filter((s) => s.test !== test),
                                      { test: test as LanguageTest, score },
                                    ],
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              5 — Standart sınavlar
              ------------------------------------------------------------- */}
          {step === "tests" && (
            <div>
              <h2 className="text-[17px] font-semibold text-ink mb-1.5">
                {t.wizard.tests.question}
              </h2>
              <p className="text-sm text-ink-soft mb-5">{t.wizard.tests.hint}</p>

              <div className="space-y-2">
                {(Object.keys(STANDARDIZED_TEST_SCALES) as StandardizedTest[]).map((test) => (
                  <ScoreRow
                    key={test}
                    testId={test}
                    scale={STANDARDIZED_TEST_SCALES[test]}
                    value={draft.standardizedTests.find((s) => s.test === test)?.score}
                    onChange={(score) =>
                      update({
                        standardizedTests:
                          score === undefined
                            ? draft.standardizedTests.filter((s) => s.test !== test)
                            : [
                                ...draft.standardizedTests.filter((s) => s.test !== test),
                                { test, score },
                              ],
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              6 — Hedefler
              ------------------------------------------------------------- */}
          {step === "targets" && (
            <div className="space-y-6">
              <Field label={t.wizard.targets.countries} hint={t.wizard.targets.countriesHint}>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COUNTRY_CODES.map((code: CountryCode) => (
                    <Chip
                      key={code}
                      selected={draft.targetCountries.includes(code)}
                      onClick={() =>
                        update({
                          targetCountries: draft.targetCountries.includes(code)
                            ? draft.targetCountries.filter((c) => c !== code)
                            : [...draft.targetCountries, code],
                        })
                      }
                    >
                      <span className="mr-1.5" aria-hidden>
                        {COUNTRIES[code].flag}
                      </span>
                      {pick(COUNTRIES[code].name)}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label={t.wizard.targets.budget} hint={t.wizard.targets.budgetHint}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={55000}
                    step={500}
                    value={draft.maxTuition ?? 55000}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      update({ maxTuition: value >= 55000 ? undefined : value });
                    }}
                    className="flex-1 accent-[#3730a3]"
                  />
                  <span className="w-32 text-right text-sm font-medium text-ink tabular-nums">
                    {draft.maxTuition === undefined
                      ? t.wizard.targets.budgetNoLimit
                      : `€${draft.maxTuition.toLocaleString(locale === "tr" ? "tr-TR" : "en-GB")}`}
                  </span>
                </div>
              </Field>

              <Field label={t.wizard.targets.extras} hint={t.wizard.targets.extrasHint}>
                <div className="flex flex-wrap gap-2 mt-1">
                  {EXTRAS.map((extra) => (
                    <Chip
                      key={extra.id}
                      selected={draft.extrasReady.includes(extra.id)}
                      onClick={() =>
                        update({
                          extrasReady: draft.extrasReady.includes(extra.id)
                            ? draft.extrasReady.filter((e) => e !== extra.id)
                            : [...draft.extrasReady, extra.id as ExtraRequirementKey],
                        })
                      }
                    >
                      {pick(extra.label)}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}
        </Card>

        {/* Gezinme */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
          >
            ← {t.common.back}
          </Button>

          <Button onClick={() => void handleNext()} disabled={!canContinue || saving} size="lg">
            {saving ? t.common.loading : isLast ? t.wizard.finish : t.common.continue}
            {!saving && <span aria-hidden>→</span>}
          </Button>
        </div>
      </main>
    </>
  );
}

/**
 * Tek bir sınav satırı: aç/kapa + puan girişi.
 * Kapalıyken profilde hiç yok sayılır — "girmedim" ile "düşük puanım var"
 * ayrımı eşleştirme motorunda farklı sonuç veriyor, o yüzden önemli.
 */
function ScoreRow({
  testId,
  scale,
  value,
  onChange,
}: {
  testId: string;
  scale: (typeof LANGUAGE_TEST_SCALES)[LanguageTest];
  value: number | undefined;
  onChange: (score: number | undefined) => void;
}) {
  const { pick } = useLocale();
  const active = value !== undefined;

  return (
    <div
      className={cx(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-colors",
        active ? "border-accent-line bg-accent-soft" : "border-line bg-surface"
      )}
    >
      <input
        type="checkbox"
        id={`test-${testId}`}
        checked={active}
        onChange={(e) =>
          onChange(e.target.checked ? Math.round((scale.min + scale.max) / 2) : undefined)
        }
        className="w-4 h-4 accent-[#3730a3] shrink-0"
      />
      <label htmlFor={`test-${testId}`} className="flex-1 text-sm text-ink cursor-pointer">
        {scale.label}
        {scale.hint && !active && (
          <span className="block text-[12px] text-ink-faint">{pick(scale.hint)}</span>
        )}
      </label>

      {active && (
        <div className="flex items-center gap-2 animate-fade">
          {scale.levels ? (
            <Select
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-28 py-1.5"
            >
              {scale.levels.map((level, index) => (
                <option key={level} value={index + 1}>
                  {level}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              type="number"
              min={scale.min}
              max={scale.max}
              step={scale.step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-24 py-1.5 text-right"
            />
          )}
        </div>
      )}

      {active && scale.levels && (
        <span className="sr-only">{formatTestScore(scale, value)}</span>
      )}
    </div>
  );
}
