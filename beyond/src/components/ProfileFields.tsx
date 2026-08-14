"use client";

import { useMemo } from "react";
import { Button, Chip, Field, Input, Select, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { toHundredScale } from "@/lib/matching";
import { COUNTRIES, FIELDS, fieldProgramCounts } from "@/data/taxonomy";
import { PROGRAMS } from "@/data/programs";
import {
  DIPLOMAS,
  EXTRAS,
  GENDERS,
  GPA_SCALES,
  LANGUAGE_TEST_GROUPS,
  LANGUAGE_TEST_SCALES,
  STANDARDIZED_TEST_SCALES,
  SUBJECTS,
  formatTestScore,
} from "@/data/options";
import {
  COUNTRY_CODES,
  FIELD_IDS,
  GRADE_YEARS,
  overallAverage,
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
 * demekti — profil şeması büyüdükçe kaçınılmaz olarak ayrışırlardı. Nitekim
 * bir kere ayrıştılar da: "dersler" adımı ve sınıf sınıf not sihirbaza
 * eklenince ayarlar eski alan kümesinde kaldı. Tek kaynak bunu imkânsız
 * kılıyor.
 *
 * Bileşen bilinçli olarak DURUMSUZ: `draft` ile mevcut değeri alıp `update`
 * ile kısmi bir yama gönderiyor. Kaydetme, adım yönetimi ve doğrulama çağıran
 * ekranın işi — sihirbaz adım adım ilerliyor, ayarlar tek seferde kaydediyor.
 */

/**
 * "subjects" AYRI BİR ADIM olarak eklendi.
 *
 * Önceden ileri düzey ders seçimi not ortalaması adımının altına sıkışmıştı ve
 * gözden kaçıyordu. Oysa katalogdaki 20+ programda `requiredSubjects` var
 * (TU Delft matematik ileri düzey, DTU kimya gibi) ve bu kutu boş kalınca o
 * şartlar "bilgi eksik" olarak duruyor — öğrenci farkında olmadan uyumunu
 * düşürüyor. Kendi adımı olunca hem görünür hem açıklanabilir oluyor.
 */
export const PROFILE_STEPS = ["basics", "fields", "grades", "subjects", "language", "tests", "targets"] as const;
export type ProfileStepId = (typeof PROFILE_STEPS)[number];

/**
 * Mezuniyet yılı seçenekleri.
 *
 * 2027'den başlıyor: katalogdaki son tarihler 2026-27 başvuru dönemine ait,
 * yani şu an lisede olan ve 2027 ve sonrasında mezun olacak öğrenciler için
 * anlamlı. Daha eski bir yıl seçilebilse öğrenci geçmiş bir dönemin
 * tarihlerine göre plan yapardı.
 */

const GRADUATION_YEARS = [2027, 2028, 2029, 2030, 2031];

/** Sihirbazın boş başlangıç profili. */
export function emptyProfile(): StudentProfile {
  return {
    fullName: "",
    highSchoolName: "",
    diplomas: [],
    graduationYear: GRADUATION_YEARS[0],
    gradeYears: [],
    gpa: 0,
    gpaScale: "100",
    fields: [],
    languageTests: [],
    standardizedTests: [],
    advancedSubjects: [],
    apCourses: [],
    targetCountries: [],
    extrasReady: [],
  };
}

export interface ProfileStepProps {
  step: ProfileStepId;
  draft: StudentProfile;
  update: (patch: Partial<StudentProfile>) => void;
}

/** Tek bir adımın soruları. Hangi adımın çizileceğini çağıran ekran söylüyor. */
export function ProfileStep({ step, draft, update }: ProfileStepProps) {
  const { t, locale, pick } = useLocale();

  /** Katalogda her alanda kaç program var — sıfır olanı önceden söylemek için. */
  const fieldCounts = useMemo(() => fieldProgramCounts(PROGRAMS), []);

  /**
   * Sınıf ortalamalarından türetilen genel ortalama. Hiç sınıf girilmemişse
   * `undefined` — o zaman öğrencinin elle yazdığı `gpa` kullanılıyor.
   */
  const derivedAverage = useMemo(() => overallAverage(draft.gradeYears), [draft.gradeYears]);

  return (
    <>
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
                <Field label={t.wizard.basics.highSchoolName}>
                  <Input
                    value={draft.highSchoolName}
                    onChange={(e) => update({ highSchoolName: e.target.value })}
                    placeholder={t.wizard.basics.highSchoolPlaceholder}
                  />
                </Field>

                <Field label={t.wizard.basics.graduationYear}>
                  <Select
                    value={draft.graduationYear}
                    onChange={(e) => update({ graduationYear: Number(e.target.value) })}
                  >
                    {GRADUATION_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* Lise TÜRÜ değil, alınan DİPLOMA. Üniversiteler "Anadolu Lisesi"
                  bilgisine göre şart koymuyor; "IB 38 puan", "A-level A*AA"
                  diye koyuyor. Çoktan seçmeli, çünkü bir öğrenci aynı anda
                  Türk lise diploması + AP dersleri taşıyabiliyor. */}
              <Field label={t.wizard.basics.diplomas} hint={t.wizard.basics.diplomasHint}>
                <div className="flex flex-wrap gap-2">
                  {DIPLOMAS.map((option) => (
                    <Chip
                      key={option.id}
                      selected={draft.diplomas.includes(option.id)}
                      onClick={() =>
                        update({
                          diplomas: draft.diplomas.includes(option.id)
                            ? draft.diplomas.filter((d) => d !== option.id)
                            : [...draft.diplomas, option.id],
                        })
                      }
                    >
                      {pick(option.label)}
                    </Chip>
                  ))}
                </div>
              </Field>

              {draft.diplomas.includes("other") && (
                <Field label={t.wizard.basics.diplomaOther}>
                  <Input
                    value={draft.diplomaOther ?? ""}
                    onChange={(e) => update({ diplomaOther: e.target.value })}
                    placeholder={t.wizard.basics.diplomaOtherPlaceholder}
                  />
                </Field>
              )}

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
              {/* Her alanın yanında KATALOGDAKİ PROGRAM SAYISI yazıyor.
                  Sebep: alan listesi katalogdan bağımsız genişletildi (hukuk,
                  mimarlık, tasarım…) ve karşılığı olmayan bir alanı seçen
                  öğrenci boş sonuç ekranıyla karşılaşıyor — "formu doldurdum,
                  eşleşme gelmedi" şikâyetinin sebebi tam olarak bu. Sayıyı
                  önceden göstermek o sürprizi kaldırıyor. Sayı koddan geliyor,
                  katalog büyüdükçe kendiliğinden güncelleniyor. */}
              <div className="flex flex-wrap gap-2">
                {FIELD_IDS.map((id: FieldId) => {
                  const count = fieldCounts[id];
                  return (
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
                      <span
                        className={cx(
                          "ml-1.5 text-[11px]",
                          count === 0 ? "text-danger" : "opacity-60"
                        )}
                      >
                        {count === 0 ? t.wizard.fields.noPrograms : count}
                      </span>
                    </Chip>
                  );
                })}
              </div>

              {/* Sıfır programlı bir alan seçildiyse, sonuç ekranına gitmeden
                  söylüyoruz. Sürpriz boş ekran yerine önceden uyarı. */}
              {draft.fields.some((id) => fieldCounts[id] === 0) && (
                <p className="text-[13px] text-danger mt-4">{t.wizard.fields.emptyFieldWarning}</p>
              )}

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

                  <Field
                    label={t.wizard.grades.overall}
                    hint={
                      derivedAverage !== undefined
                        ? t.wizard.grades.overallDerived
                        : t.wizard.grades.overallManual
                    }
                  >
                    <Input
                      type="number"
                      step="0.001"
                      value={derivedAverage !== undefined ? derivedAverage.toFixed(3) : draft.gpa || ""}
                      // Sınıf ortalamaları girildiyse bu alan onlardan
                      // TÜRETİLİYOR ve elle değiştirilemiyor: iki farklı sayı
                      // tutmak, hangisinin doğru olduğu belirsiz bir profil
                      // üretir. Hiç sınıf girilmediyse öğrenci genel
                      // ortalamasını doğrudan yazabiliyor.
                      readOnly={derivedAverage !== undefined}
                      onChange={(e) => update({ gpa: Number(e.target.value) })}
                    />
                  </Field>
                </div>

                {/* SINIF SINIF ORTALAMA — her yıl İSTEĞE BAĞLI.
                    Öğrenci kaç yıl okuduysa o kadarını giriyor; 11. sınıftaki
                    birinden 12. sınıf notu istemek anlamsız. Genel ortalama
                    girilenlerin düz ortalaması (kredi ağırlığını bilmiyoruz,
                    uydurmuyoruz). */}
                <Field
                  label={t.wizard.grades.byYear}
                  hint={t.wizard.grades.byYearHint}
                  className="mt-5"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                    {GRADE_YEARS.map((year) => {
                      const entry = draft.gradeYears?.find((g) => g.year === year);
                      return (
                        <div key={year}>
                          <label
                            htmlFor={`grade-${year}`}
                            className="block text-[12px] text-ink-faint mb-1"
                          >
                            {fill(t.wizard.grades.yearLabel, { year })}
                          </label>
                          <Input
                            id={`grade-${year}`}
                            type="number"
                            step="0.001"
                            inputMode="decimal"
                            placeholder="—"
                            value={entry?.average ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const others = (draft.gradeYears ?? []).filter(
                                (g) => g.year !== year
                              );
                              // Boş bırakmak = "bu yılı okumadım/girmiyorum".
                              // Kaydı diziden çıkarıyoruz ki ortalamaya 0
                              // olarak katılmasın.
                              const next =
                                raw === ""
                                  ? others
                                  : [...others, { year, average: Number(raw) }];
                              next.sort((a, b) => a.year - b.year);
                              update({ gradeYears: next });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Field>

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

            </div>
          )}

          {/* -------------------------------------------------------------
              4 — Dersler ve sınavlar (kendi adımı)

              Önceden ileri düzey ders seçimi not adımının altına sıkışmıştı ve
              gözden kaçıyordu. Oysa katalogdaki 20+ programda `requiredSubjects`
              var; bu kutu boş kalınca o şartlar "bilgi eksik" olarak duruyor ve
              öğrenci farkında olmadan uyumunu düşürüyor.
              ------------------------------------------------------------- */}
          {step === "subjects" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[17px] font-semibold text-ink mb-1.5">
                  {t.wizard.subjects.question}
                </h2>
                <p className="text-sm text-ink-soft mb-5">{t.wizard.subjects.hint}</p>

                <div className="flex flex-wrap gap-2">
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
                <p className="text-[12px] text-ink-faint mt-3 leading-relaxed">
                  {t.wizard.subjects.whyItMatters}
                </p>
              </div>

              {/* AP DERSLERİ TEK TEK. Önceden tek bir "AP (en yüksek notun)"
                  puanı vardı; bir öğrenci AP Calculus'tan 5, AP Biology'den 3
                  alabiliyor ve tek sayı bunu temsil etmiyor. */}
              <Field label={t.wizard.subjects.apCourses} hint={t.wizard.subjects.apCoursesHint}>
                <div className="space-y-2 mt-1">
                  {(draft.apCourses ?? []).map((course, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={course.course}
                        placeholder={t.wizard.subjects.apCoursePlaceholder}
                        onChange={(e) => {
                          const next = [...(draft.apCourses ?? [])];
                          next[index] = { ...next[index], course: e.target.value };
                          update({ apCourses: next });
                        }}
                      />
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        className="w-20 shrink-0"
                        value={course.score || ""}
                        placeholder="5"
                        onChange={(e) => {
                          const next = [...(draft.apCourses ?? [])];
                          next[index] = { ...next[index], score: Number(e.target.value) };
                          update({ apCourses: next });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          update({
                            apCourses: (draft.apCourses ?? []).filter((_, i) => i !== index),
                          })
                        }
                      >
                        {t.common.remove}
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      update({ apCourses: [...(draft.apCourses ?? []), { course: "", score: 0 }] })
                    }
                  >
                    + {t.wizard.subjects.addApCourse}
                  </Button>
                </div>
              </Field>

              {/* YKS SİHİRBAZIN ÖNÜNDEN KALKTI ama silinmedi: Almanya'nın kapı
                  şartı bu. `de-tum-informatics` ve `de-rwth-mechanical`
                  kayıtlarında zorunlu ve COUNTRIES.DE notu da bunu söylüyor.
                  Tamamen kaldırsak öğrenci Almanya'nın en kritik detayını hiç
                  görmezdi; burada isteğe bağlı duruyor. */}
              <Field label={t.wizard.subjects.yks} hint={t.wizard.subjects.yksHint}>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="—"
                  value={
                    draft.standardizedTests.find((test) => test.test === "yks")?.score ?? ""
                  }
                  onChange={(e) => {
                    const others = draft.standardizedTests.filter((s) => s.test !== "yks");
                    update({
                      standardizedTests:
                        e.target.value === ""
                          ? others
                          : [...others, { test: "yks", score: Number(e.target.value) }],
                    });
                  }}
                />
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

              {/* YKS ve AP bu listeden ÇIKARILDI, silinmedi:
                  - YKS "Dersler ve sınavlar" adımına taşındı (Almanya kapı
                    şartı olduğu için orada bağlamıyla duruyor)
                  - AP artık ders ders giriliyor, tek "en yüksek notun" puanı
                    bir öğrencinin AP profilini temsil etmiyordu
                  Burada SAT ve IB toplam puanı kalıyor. */}
              <div className="space-y-2">
                {(["sat", "ib"] as StandardizedTest[]).map((test) => (
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

