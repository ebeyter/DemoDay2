import type {
  Bilingual,
  ExtraRequirementKey,
  GpaScale,
  LanguageTest,
  DiplomaId,
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
  // DELF ile DALF AYNI ÖLÇEĞİN İKİ FARKLI PARÇASI, ikisi de 1-6 değil:
  // DELF sınavı A1-B2 seviyelerini, DALF ise C1-C2'yi belgeliyor. Önceden
  // ikisi de 1-6 tanımlıydı ve "DALF A1" gibi var olmayan bir kombinasyon
  // seçilebiliyordu. Aralıklar gerçek sınav kapsamına çekildi.
  delf: {
    label: "DELF (A1–B2)",
    min: 1,
    max: 4,
    step: 1,
    levels: CEFR_LEVELS,
    hint: {
      tr: "Fransa'daki Fransızca programlar genelde B2 istiyor — DELF'in en üst seviyesi",
      en: "French-taught programs in France usually ask for B2 — the top DELF level",
    },
  },
  dalf: {
    label: "DALF (C1–C2)",
    min: 5,
    max: 6,
    step: 1,
    levels: CEFR_LEVELS,
    hint: {
      tr: "B2 ve altı için DELF'i kullan; DALF yalnızca C1 ve C2'yi belgeliyor",
      en: "Use DELF for B2 and below; DALF only certifies C1 and C2",
    },
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

/**
 * Alınan diploma ve programlar. `SCHOOL_TYPES`'ın yerine geçti.
 *
 * Neden değişti: üniversiteler lise TÜRÜNE göre şart koymuyor. "Anadolu
 * Lisesi" bilgisi başvuruda hiçbir kapıyı açıp kapatmıyor; "IB Diploma"
 * ya da "3 AP dersi" açıyor. Çoktan seçmeli olması da bu yüzden — bir
 * öğrenci aynı anda Türk lise diploması taşıyıp AP dersi de almış olabilir.
 *
 * `SCHOOL_TYPES` şimdilik duruyor; eski profillerin okunabilmesi için
 * `SchoolType` tipi henüz kaldırılmadı.
 */
export const DIPLOMAS: { id: DiplomaId; label: Bilingual; hint?: Bilingual }[] = [
  {
    id: "turkish-high-school",
    label: { tr: "Türk lise diploması", en: "Turkish high school diploma" },
  },
  {
    id: "ib-diploma",
    label: { tr: "IB Diploma (tam program)", en: "IB Diploma (full programme)" },
  },
  {
    id: "ib-courses",
    label: { tr: "IB dersleri (tam diploma değil)", en: "IB courses (not full diploma)" },
  },
  { id: "ap-courses", label: { tr: "AP dersleri", en: "AP courses" } },
  { id: "a-level", label: { tr: "A-Level", en: "A-Level" } },
  { id: "abitur", label: { tr: "Abitur", en: "Abitur" } },
  { id: "french-bac", label: { tr: "Fransız Bakaloryası", en: "French Baccalauréat" } },
  {
    id: "american-diploma",
    label: { tr: "Amerikan lise diploması", en: "US high school diploma" },
  },
  { id: "other", label: { tr: "Diğer", en: "Other" } },
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
