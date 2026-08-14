"use client";

import { Chip, Field, Input, Select, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
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

/**
 * Beyond — profil soruları, tek kaynaktan.
 *
 * NEDEN AYRI DOSYA
 * Aynı sorular iki yerde soruluyor: kayıt sihirbazı (`/profile`, adım adım) ve
 * ayarlardaki "Profilim" sekmesi (`/settings`, hepsi tek sayfada). Soruları
 * kopyalamak, ileride eklenen bir alanın yalnızca bir ekranda görünmesi
 * demekti — profil şeması büyüdükçe kaçınılmaz olarak ayrışırlardı.
 *
 * Bileşenler bilinçli olarak DURUMSUZ: `draft` ile mevcut değeri alıp `update`
 * ile kısmi bir yama gönderiyorlar. Kaydetme, adım yönetimi ve doğrulama
 * çağıran ekranın işi — sihirbaz adım adım kaydediyor, ayarlar tek seferde.
 *
 * Başlıklar sihirbazdaki hâliyle korundu ki `/profile`'ın görünümü bu
 * ayrıştırmadan etkilenmesin.
 */

export const CURRENT_YEAR = 2026;

/** Sihirbazın boş başlangıç profili. */
export function emptyProfile(): StudentProfile {
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

export interface ProfileFieldsProps {
  draft: StudentProfile;
  update: (patch: Partial<StudentProfile>) => void;
}

// ---------------------------------------------------------------------------
// 1 — Temel bilgiler
// ---------------------------------------------------------------------------

export function BasicsFields({
  draft,
  update,
  /**
   * Sihirbaz açılır açılmaz imleci ada koyuyor. Ayarlarda bunu yapmak, sayfayı
   * kaydırıp odağı çalmak demek olurdu — orada kapalı.
   */
  autoFocusFirst = false,
}: ProfileFieldsProps & { autoFocusFirst?: boolean }) {
  const { t, pick } = useLocale();

  return (
    <div className="space-y-5">
      <Field label={t.wizard.basics.fullName}>
        <Input
          value={draft.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          placeholder={t.wizard.basics.fullNamePlaceholder}
          autoFocus={autoFocusFirst}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t.wizard.basics.birthYear}>
          <Input
            type="number"
            inputMode="numeric"
            value={draft.birthYear ?? ""}
            onChange={(e) =>
              update({ birthYear: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="2008"
          />
        </Field>

        <Field label={t.wizard.basics.graduationYear}>
          <Select
            value={draft.graduationYear}
            onChange={(e) => update({ graduationYear: Number(e.target.value) })}
          >
            {[CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2, CURRENT_YEAR - 1].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={t.wizard.basics.schoolType}>
        <Select
          value={draft.schoolType}
          onChange={(e) => update({ schoolType: e.target.value as StudentProfile["schoolType"] })}
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
  );
}

// ---------------------------------------------------------------------------
// 2 — İlgi alanları
// ---------------------------------------------------------------------------

export function InterestFields({ draft, update }: ProfileFieldsProps) {
  const { t, pick } = useLocale();

  return (
    <div>
      <h2 className="text-[17px] font-semibold text-ink mb-1.5">{t.wizard.fields.question}</h2>
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
  );
}

// ---------------------------------------------------------------------------
// 3 — Notlar
// ---------------------------------------------------------------------------

export function GradeFields({ draft, update }: ProfileFieldsProps) {
  const { t, pick } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-semibold text-ink mb-4">{t.wizard.grades.question}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t.wizard.grades.scale}>
            <Select
              value={draft.gpaScale}
              onChange={(e) => update({ gpaScale: e.target.value as StudentProfile["gpaScale"] })}
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
            <span className="text-[13px] text-ink-soft">{t.wizard.grades.converted}</span>
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
  );
}

// ---------------------------------------------------------------------------
// 4 — Dil belgeleri
// ---------------------------------------------------------------------------

export function LanguageFields({ draft, update }: ProfileFieldsProps) {
  const { t, pick } = useLocale();

  return (
    <div>
      <h2 className="text-[17px] font-semibold text-ink mb-1.5">{t.wizard.language.question}</h2>
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
  );
}

// ---------------------------------------------------------------------------
// 5 — Standart sınavlar
// ---------------------------------------------------------------------------

export function TestFields({ draft, update }: ProfileFieldsProps) {
  const { t } = useLocale();

  return (
    <div>
      <h2 className="text-[17px] font-semibold text-ink mb-1.5">{t.wizard.tests.question}</h2>
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
  );
}

// ---------------------------------------------------------------------------
// 6 — Hedefler
// ---------------------------------------------------------------------------

export function TargetFields({ draft, update }: ProfileFieldsProps) {
  const { t, locale, pick } = useLocale();

  return (
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
          {/* accent-color globals.css'te tokena bağlı — burada sabit renk yok. */}
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
            className="flex-1"
            aria-label={t.wizard.targets.budget}
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
        className="w-4 h-4 shrink-0"
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

      {active && scale.levels && <span className="sr-only">{formatTestScore(scale, value)}</span>}
    </div>
  );
}
