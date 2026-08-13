import type {
  Bilingual,
  ExtraRequirementKey,
  GpaScale,
  LanguageTest,
  SchoolType,
  StandardizedTest,
  Subject,
} from "@/lib/types";

/**
 * Sihirbazdaki seçenek listeleri ve sınav ölçekleri.
 *
 * Sınav ölçeklerini tek yerde tutmak önemli: hem giriş alanının sınırlarını
 * hem de eşleştirme motorunun karşılaştırdığı sayıların anlamını buradan
 * okuyoruz. CEFR seviyeli sınavlar (DELF, Goethe, CILS) ortak 1-6 ölçeğine
 * oturtuldu ki farklı diller aynı mantıkla karşılaştırılabilsin.
 */

export interface TestScale {
  label: string;
  min: number;
  max: number;
  step: number;
  /** Sayı yerine gösterilecek etiketler (CEFR gibi seviyeli sınavlar için). */
  levels?: string[];
  hint?: Bilingual;
}

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const LANGUAGE_TEST_SCALES: Record<LanguageTest, TestScale> = {
  ielts: { label: "IELTS Academic", min: 0, max: 9, step: 0.5 },
  toefl: { label: "TOEFL iBT", min: 0, max: 120, step: 1 },
  duolingo: { label: "Duolingo English Test", min: 10, max: 160, step: 5 },
  cambridge: { label: "Cambridge C1/C2", min: 100, max: 230, step: 1 },
  delf: {
    label: "DELF (Fransızca)",
    min: 1,
    max: 6,
    step: 1,
    levels: CEFR_LEVELS,
    hint: {
      tr: "Fransa'daki Fransızca programlar genelde B2 istiyor",
      en: "French-taught programs in France usually ask for B2",
    },
  },
  dalf: {
    label: "DALF (Fransızca, ileri)",
    min: 1,
    max: 6,
    step: 1,
    levels: CEFR_LEVELS,
  },
  tcf: {
    label: "TCF (Fransızca)",
    min: 100,
    max: 699,
    step: 1,
    hint: { tr: "B2 ≈ 400 ve üzeri", en: "B2 ≈ 400 and above" },
  },
  testdaf: {
    label: "TestDaF (Almanca)",
    min: 3,
    max: 5,
    step: 1,
    hint: {
      tr: "TDN 4 çoğu lisans programının eşiği",
      en: "TDN 4 is the usual bachelor threshold",
    },
  },
  goethe: {
    label: "Goethe-Zertifikat (Almanca)",
    min: 1,
    max: 6,
    step: 1,
    levels: CEFR_LEVELS,
    hint: { tr: "Almanca programlar genelde C1 istiyor", en: "German-taught programs usually ask for C1" },
  },
  cnasvt: {
    label: "CILS / CELI (İtalyanca)",
    min: 1,
    max: 6,
    step: 1,
    levels: CEFR_LEVELS,
  },
};

export const STANDARDIZED_TEST_SCALES: Record<StandardizedTest, TestScale> = {
  sat: { label: "SAT", min: 400, max: 1600, step: 10 },
  ib: { label: "IB Diploma (toplam)", min: 24, max: 45, step: 1 },
  ap: {
    label: "AP (en yüksek notun)",
    min: 1,
    max: 5,
    step: 1,
    hint: {
      tr: "İngiltere birçok programda 2-3 AP sınavında 4-5 bekliyor",
      en: "UK programs often expect 4-5 across two or three AP exams",
    },
  },
  yks: {
    label: "YKS yerleştirme puanın",
    min: 100,
    max: 560,
    step: 1,
    hint: {
      tr: "Almanya için kritik: bir üniversiteye yerleşmiş olman isteniyor",
      en: "Critical for Germany: you need an actual university placement",
    },
  },
};

/** Sınavın hangi dile ait olduğu — sihirbazda gruplama için. */
export const LANGUAGE_TEST_GROUPS: { language: Bilingual; tests: LanguageTest[] }[] = [
  {
    language: { tr: "İngilizce", en: "English" },
    tests: ["ielts", "toefl", "duolingo", "cambridge"],
  },
  { language: { tr: "Fransızca", en: "French" }, tests: ["delf", "dalf", "tcf"] },
  { language: { tr: "Almanca", en: "German" }, tests: ["testdaf", "goethe"] },
  { language: { tr: "İtalyanca", en: "Italian" }, tests: ["cnasvt"] },
];

export const SCHOOL_TYPES: { id: SchoolType; label: Bilingual }[] = [
  { id: "anatolian", label: { tr: "Anadolu Lisesi", en: "Anatolian High School" } },
  { id: "science-high-school", label: { tr: "Fen Lisesi", en: "Science High School" } },
  { id: "private-turkish", label: { tr: "Özel Türk Lisesi", en: "Private Turkish School" } },
  { id: "ib-school", label: { tr: "IB Programı", en: "IB Programme" } },
  { id: "american-college", label: { tr: "Kolej / Yabancı Lise", en: "International School" } },
  { id: "other", label: { tr: "Diğer", en: "Other" } },
];

export const GPA_SCALES: { id: GpaScale; label: Bilingual }[] = [
  { id: "100", label: { tr: "100'lük (Türk lise diploması)", en: "100-point (Turkish diploma)" } },
  { id: "5", label: { tr: "5'lik", en: "5-point" } },
  { id: "4", label: { tr: "4'lük (GPA)", en: "4-point GPA" } },
  { id: "ib45", label: { tr: "IB toplam (45)", en: "IB total (45)" } },
];

export const SUBJECTS: { id: Subject; label: Bilingual }[] = [
  { id: "math", label: { tr: "Matematik", en: "Mathematics" } },
  { id: "physics", label: { tr: "Fizik", en: "Physics" } },
  { id: "chemistry", label: { tr: "Kimya", en: "Chemistry" } },
  { id: "biology", label: { tr: "Biyoloji", en: "Biology" } },
];

export const EXTRAS: { id: ExtraRequirementKey; label: Bilingual }[] = [
  { id: "motivation-letter", label: { tr: "Niyet mektubu yazabilirim", en: "I can write a motivation letter" } },
  { id: "recommendation-letter", label: { tr: "Referans mektubu alabilirim", en: "I can get a recommendation letter" } },
  { id: "portfolio", label: { tr: "Portfolyom hazır", en: "My portfolio is ready" } },
  { id: "interview", label: { tr: "Mülakata girebilirim", en: "I can attend an interview" } },
  { id: "entrance-exam", label: { tr: "Giriş sınavına girebilirim", en: "I can sit an entrance exam" } },
];

export const GENDERS: { id: NonNullable<import("@/lib/types").StudentProfile["gender"]>; label: Bilingual }[] =
  [
    { id: "female", label: { tr: "Kadın", en: "Female" } },
    { id: "male", label: { tr: "Erkek", en: "Male" } },
    { id: "other", label: { tr: "Diğer", en: "Other" } },
    { id: "prefer-not-to-say", label: { tr: "Belirtmek istemiyorum", en: "Prefer not to say" } },
  ];

/** Bir sınav puanını insan okunur hale getirir (CEFR seviyeleri dahil). */
export function formatTestScore(scale: TestScale, score: number): string {
  if (scale.levels) {
    const index = Math.round(score) - 1;
    return scale.levels[index] ?? String(score);
  }
  return String(score);
}
