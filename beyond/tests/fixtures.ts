import type { Program, ProgramRequirements, StudentProfile } from "@/lib/types";

/**
 * Minimum geçerli bir Program üretir; testler sadece ilgilendikleri
 * alanı override eder, geri kalanı nötr (hiçbir şartı etkilemeyen) kalır.
 */
export function makeProgram(overrides: {
  requirements?: Partial<ProgramRequirements>;
  tuitionNonEu?: number;
} = {}): Program {
  return {
    id: "test-program",
    university: "Test University",
    country: "NL",
    city: "Test City",
    name: "Test Program",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 70,
      language: [],
      ...overrides.requirements,
    },
    // "tuitionNonEu" in overrides: undefined'ı da açıkça geçirebilmek için
    // (kaynak sayfa harcı belirtmiyor durumunu test edebilmek adına) ?? yerine.
    tuitionNonEu: "tuitionNonEu" in overrides ? overrides.tuitionNonEu : 10000,
    tuitionEu: 2000,
    livingCostPerYear: 10000,
    applicationSystem: "direct",
    deadline: "01-05",
    sourceUrl: "https://example.com",
    lastChecked: "2026-01-01",
    verification: "ai-extracted",
  };
}

/**
 * Minimum geçerli bir StudentProfile üretir; hiçbir zorunlu şartı
 * karşılamayan/karşılamayı etkilemeyen nötr varsayılanlarla.
 */
export function makeProfile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    fullName: "Test Student",
    highSchoolName: "Test High School",
    diplomas: ["turkish-high-school"],
    graduationYear: 2027,
    gpa: 70,
    gpaScale: "100",
    fields: [],
    languageTests: [],
    standardizedTests: [],
    advancedSubjects: [],
    targetCountries: [],
    extrasReady: [],
    ...overrides,
  };
}
