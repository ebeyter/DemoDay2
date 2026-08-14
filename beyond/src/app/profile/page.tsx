"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button, Card, cx } from "@/components/ui";
import {
  PROFILE_STEPS,
  ProfileStep,
  emptyProfile,
  type ProfileStepId,
} from "@/components/ProfileFields";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { overallAverage, type StudentProfile } from "@/lib/types";

/**
 * Kayıt sihirbazı — yedi adım.
 *
 * Soruların kendisi `src/components/ProfileFields.tsx` içinde; bu dosya
 * yalnızca adım yönetimi, ilerleme çubuğu ve kaydetmeyi yapıyor. Aynı sorular
 * ayarlardaki "Profilim" sekmesinde de kullanılıyor — tek kaynak olduğu için
 * yeni bir alan eklendiğinde iki ekranda birden görünüyor.
 */

export default function ProfilePage() {
  const { t } = useLocale();
  const { profile, saveProfile } = useStore();
  const router = useRouter();

  const [draft, setDraft] = useState<StudentProfile>(() => profile ?? emptyProfile());
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const step: ProfileStepId = PROFILE_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / PROFILE_STEPS.length) * 100;

  const update = (patch: Partial<StudentProfile>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  /**
   * Sınıf ortalamalarından türetilen genel ortalama. Hiç sınıf girilmemişse
   * `undefined` — o zaman öğrencinin elle yazdığı `gpa` kullanılıyor.
   */
  const derivedAverage = useMemo(() => overallAverage(draft.gradeYears), [draft.gradeYears]);

  const canContinue = useMemo(() => {
    if (step === "basics") {
      // Lise adı ve diploma da isteniyor: diploma olmadan hangi şart
      // sistemine göre değerlendirileceği belirsiz kalıyor.
      return (
        draft.fullName.trim().length > 0 &&
        draft.highSchoolName.trim().length > 0 &&
        draft.diplomas.length > 0
      );
    }
    if (step === "fields") return draft.fields.length > 0;
    // Sınıf ortalaması ya da elle girilmiş genel ortalama — biri yeterli.
    if (step === "grades") return (derivedAverage ?? draft.gpa) > 0;
    // "subjects" adımı tamamen isteğe bağlı: ders almamış ya da AP'si olmayan
    // öğrenciyi burada tutmak anlamsız.
    return true;
  }, [step, draft, derivedAverage]);

  const isLast = stepIndex === PROFILE_STEPS.length - 1;

  async function handleNext() {
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    setSaving(true);
    // Türetilmiş ortalamayı KAYIT ANINDA yazıyoruz, state'te yansıtmıyoruz.
    // Motor tek bir sayıyla çalışıyor ve profilde iki farklı "ortalama"
    // tutmak hangisinin doğru olduğu belirsiz bir kayıt üretirdi. Effect
    // içinde setState ile aynaya yazmak da gereksiz bir render turuydu.
    await saveProfile(derivedAverage !== undefined ? { ...draft, gpa: derivedAverage } : draft);
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
              {fill(t.wizard.stepOf, { current: stepIndex + 1, total: PROFILE_STEPS.length })}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-soft overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {PROFILE_STEPS.map((id, index) => (
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
          <ProfileStep step={step} draft={draft} update={update} />
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

