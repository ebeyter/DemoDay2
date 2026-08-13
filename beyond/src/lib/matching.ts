/**
 * Beyond — eşleştirme motoru.
 *
 * Burada AI YOK. Bilerek. Skorun her bileşeni deterministik ve açıklanabilir
 * olmalı ki "neden REACH?" sorusuna satır satır cevap verebilelim.
 *
 * Ayrıca bilerek YAPMADIĞIMIZ şey: "%78 kabul edilirsin" demek.
 * Avrupa sistemi eşik bazlı ve kabul istatistikleri kamuya açık değil;
 * olasılık uydurmak ürünün güvenilirliğini bitirir. Bunun yerine
 * "9 şartın 7'sini karşılıyorsun" diyoruz.
 */

import type {
  Band,
  CheckStatus,
  LanguageRequirement,
  LanguageTest,
  MatchResult,
  Program,
  RequirementCheck,
  StudentProfile,
  Subject,
} from "./types";

// ---------------------------------------------------------------------------
// Not ölçeği çevrimi
// ---------------------------------------------------------------------------

/** İki nokta arasında doğrusal ara değer. */
function interpolate(value: number, points: [number, number][]): number {
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  if (value <= sorted[0][0]) return sorted[0][1];
  if (value >= sorted[sorted.length - 1][0]) return sorted[sorted.length - 1][1];
  for (let i = 0; i < sorted.length - 1; i++) {
    const [x1, y1] = sorted[i];
    const [x2, y2] = sorted[i + 1];
    if (value >= x1 && value <= x2) {
      const t = (value - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return sorted[sorted.length - 1][1];
}

/**
 * Öğrencinin notunu 100'lük Türk lise diploma ölçeğine çevirir.
 * Dayanak: YÖK'ün yaygın kullanılan dönüşüm tablosu (4'lük) ve
 * IB toplam puanının genel kabul gören yüzdelik karşılıkları.
 * Yaklaşık bir dönüşümdür — arayüzde bu not kullanıcıya belirtilir.
 */
export function toHundredScale(gpa: number, scale: StudentProfile["gpaScale"]): number {
  switch (scale) {
    case "100":
      return clamp(gpa, 0, 100);
    case "5":
      // Türk 5'lik sistem: 5 = 100, 1 = 20
      return clamp(gpa * 20, 0, 100);
    case "4":
      return clamp(
        interpolate(gpa, [
          [2.0, 55],
          [2.5, 66],
          [3.0, 77],
          [3.5, 88],
          [4.0, 100],
        ]),
        0,
        100
      );
    case "ib45":
      return clamp(
        interpolate(gpa, [
          [24, 55],
          [30, 70],
          [35, 82],
          [40, 92],
          [45, 100],
        ]),
        0,
        100
      );
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

// ---------------------------------------------------------------------------
// "Kapatılabilir mesafe" eşikleri
// ---------------------------------------------------------------------------

/**
 * Bir şartın "close" (az kaldı) sayılması için gereken maksimum açık.
 * Bu değerler aksiyon planının tonunu belirliyor: kapatılabilir bir açık
 * öğrenciyi motive eder, kapatılamaz bir açık boşuna umut verir.
 */
const CLOSE_MARGIN: Record<LanguageTest, number> = {
  ielts: 0.5,
  toefl: 7,
  duolingo: 10,
  cambridge: 8,
  delf: 0, // seviye bazlı (B2 → C1), ara değer yok
  dalf: 0,
  tcf: 50,
  testdaf: 0,
  goethe: 0,
  cnasvt: 0,
};

/** GPA'de 100'lük ölçekte kaç puan açık "az kaldı" sayılır. */
const GPA_CLOSE_MARGIN = 5;

/** GPA'de kaç puan fazlalık "rahat geçiyorsun" (safety) sayılır. */
const GPA_COMFORT_MARGIN = 8;

const SAT_CLOSE_MARGIN = 60;
const IB_CLOSE_MARGIN = 2;
const AP_CLOSE_MARGIN = 1;

// ---------------------------------------------------------------------------
// Tekil şart kontrolleri
// ---------------------------------------------------------------------------

function checkGpa(program: Program, profile: StudentProfile): RequirementCheck {
  const student = toHundredScale(profile.gpa, profile.gpaScale);
  const required = program.requirements.minGpa;
  const gap = required - student;

  let status: CheckStatus;
  if (gap <= 0) status = "met";
  else if (gap <= GPA_CLOSE_MARGIN) status = "close";
  else status = "unmet";

  const studentStr = student.toFixed(0);
  return {
    id: "gpa",
    label: { tr: "Not ortalaması", en: "Grade average" },
    status,
    mandatory: true,
    detail: {
      tr: `${studentStr}/100 · en az ${required} gerekiyor`,
      en: `${studentStr}/100 · minimum ${required} required`,
    },
    action:
      status === "met"
        ? undefined
        : {
            tr:
              status === "close"
                ? `Ortalamanı ${(gap).toFixed(1)} puan yükseltmen yeterli — son dönem notların hâlâ etkileyebilir.`
                : `Ortalaman eşiğin ${gap.toFixed(1)} puan altında. Bu programda not şartı esnetilmiyor; benzer ama eşiği daha düşük programlara bakmalısın.`,
            en:
              status === "close"
                ? `Raising your average by ${gap.toFixed(1)} points is enough — your final term still counts.`
                : `You are ${gap.toFixed(1)} points below the threshold. This requirement is not flexible; look at similar programs with a lower cut-off.`,
          },
  };
}

/** Dil sınavı adının insan okunur hali. */
const TEST_LABEL: Record<LanguageTest, string> = {
  ielts: "IELTS",
  toefl: "TOEFL iBT",
  duolingo: "Duolingo",
  cambridge: "Cambridge",
  delf: "DELF",
  dalf: "DALF",
  tcf: "TCF",
  testdaf: "TestDaF",
  goethe: "Goethe",
  cnasvt: "CILS/CELI",
};

function checkLanguage(program: Program, profile: StudentProfile): RequirementCheck | null {
  const reqs = program.requirements.language;
  if (reqs.length === 0) return null;

  const accepted = reqs.map((r) => `${TEST_LABEL[r.test]} ${r.min}`).join(" · ");

  // anyOf: kabul edilen sınavlardan herhangi biri eşiği geçerse şart sağlanır.
  let best: { req: LanguageRequirement; score: number; gap: number } | null = null;
  for (const req of reqs) {
    const owned = profile.languageTests.find((t) => t.test === req.test);
    if (!owned) continue;
    const gap = req.min - owned.score;
    if (!best || gap < best.gap) best = { req, score: owned.score, gap };
  }

  // Öğrenci kabul edilen sınavlardan hiçbirine sahip değil → eksik bilgi.
  if (!best) {
    return {
      id: "language",
      label: { tr: "Dil belgesi", en: "Language certificate" },
      status: "unknown",
      mandatory: true,
      detail: {
        tr: `Henüz belgen yok · kabul edilenler: ${accepted}`,
        en: `No certificate yet · accepted: ${accepted}`,
      },
      action: {
        tr: `Bu programın istediği sınavlardan birine gir: ${accepted}. Sonuçlar genelde 2-4 haftada çıkıyor, başvuru tarihinden önce planla.`,
        en: `Take one of the accepted tests: ${accepted}. Results usually take 2-4 weeks — plan before the deadline.`,
      },
    };
  }

  const margin = CLOSE_MARGIN[best.req.test];
  let status: CheckStatus;
  if (best.gap <= 0) status = "met";
  else if (best.gap <= margin) status = "close";
  else status = "unmet";

  const label = TEST_LABEL[best.req.test];
  return {
    id: "language",
    label: { tr: "Dil belgesi", en: "Language certificate" },
    status,
    mandatory: true,
    detail: {
      tr: `${label} ${best.score} · en az ${best.req.min} gerekiyor`,
      en: `${label} ${best.score} · minimum ${best.req.min} required`,
    },
    action:
      status === "met"
        ? undefined
        : {
            tr:
              status === "close"
                ? `${label} puanını ${best.score}'dan ${best.req.min}'a çıkarman gerekiyor — tek bir sınav tekrarıyla kapanabilecek bir fark.`
                : `${label} puanın ${best.req.min} eşiğinin altında. Hazırlık süresi ayır ya da kabul edilen diğer sınavları dene: ${accepted}.`,
            en:
              status === "close"
                ? `Raise your ${label} from ${best.score} to ${best.req.min} — one retake can close this gap.`
                : `Your ${label} is below the ${best.req.min} threshold. Allow preparation time or try another accepted test: ${accepted}.`,
          },
  };
}

function checkStandardizedTests(program: Program, profile: StudentProfile): RequirementCheck[] {
  const reqs = program.requirements.standardizedTests ?? [];
  const out: RequirementCheck[] = [];

  for (const req of reqs) {
    const owned = profile.standardizedTests.find((t) => t.test === req.test);
    const name = req.test.toUpperCase();
    const margin =
      req.test === "sat" ? SAT_CLOSE_MARGIN : req.test === "ib" ? IB_CLOSE_MARGIN : AP_CLOSE_MARGIN;

    if (!owned) {
      out.push({
        id: `test-${req.test}`,
        label: {
          tr: req.mandatory ? `${name} (zorunlu)` : `${name} (isteğe bağlı)`,
          en: req.mandatory ? `${name} (required)` : `${name} (optional)`,
        },
        status: req.mandatory ? "unknown" : "unknown",
        mandatory: req.mandatory,
        detail: {
          tr: `Puanın yok · en az ${req.min} isteniyor`,
          en: `No score · minimum ${req.min} expected`,
        },
        action: {
          tr: req.mandatory
            ? `${name} bu program için zorunlu. En az ${req.min} hedefle ve sınav takvimini başvuru tarihine göre planla.`
            : `${name} zorunlu değil ama ${req.min}+ bir puan başvurunu güçlendirir.`,
          en: req.mandatory
            ? `${name} is required here. Target at least ${req.min} and plan the test date around the deadline.`
            : `${name} is not required, but a score of ${req.min}+ strengthens your application.`,
        },
      });
      continue;
    }

    const gap = req.min - owned.score;
    let status: CheckStatus;
    if (gap <= 0) status = "met";
    else if (gap <= margin) status = "close";
    else status = "unmet";

    out.push({
      id: `test-${req.test}`,
      label: {
        tr: req.mandatory ? `${name} (zorunlu)` : `${name} (isteğe bağlı)`,
        en: req.mandatory ? `${name} (required)` : `${name} (optional)`,
      },
      status,
      mandatory: req.mandatory,
      detail: {
        tr: `${owned.score} · en az ${req.min} isteniyor`,
        en: `${owned.score} · minimum ${req.min} expected`,
      },
      action:
        status === "met"
          ? undefined
          : {
              tr: `${name} puanını ${owned.score}'dan ${req.min}'a çıkarman gerekiyor.`,
              en: `Raise your ${name} score from ${owned.score} to ${req.min}.`,
            },
    });
  }

  return out;
}

const SUBJECT_LABEL: Record<Subject, { tr: string; en: string }> = {
  math: { tr: "Matematik", en: "Mathematics" },
  physics: { tr: "Fizik", en: "Physics" },
  chemistry: { tr: "Kimya", en: "Chemistry" },
  biology: { tr: "Biyoloji", en: "Biology" },
};

function checkSubjects(program: Program, profile: StudentProfile): RequirementCheck[] {
  const reqs = program.requirements.requiredSubjects ?? [];
  return reqs.map((req) => {
    const label = SUBJECT_LABEL[req.subject];
    // "basic" seviye Türk lise müfredatında zaten karşılanıyor kabul edilir.
    if (req.level === "basic") {
      return {
        id: `subject-${req.subject}`,
        label: {
          tr: `${label.tr} dersi`,
          en: `${label.en} coursework`,
        },
        status: "met" as CheckStatus,
        mandatory: true,
        detail: {
          tr: "Temel seviye · Türk lise müfredatı karşılıyor",
          en: "Basic level · covered by the Turkish curriculum",
        },
      };
    }

    const has = profile.advancedSubjects.includes(req.subject);
    return {
      id: `subject-${req.subject}`,
      label: {
        tr: `${label.tr} (ileri düzey)`,
        en: `${label.en} (advanced)`,
      },
      status: has ? ("met" as CheckStatus) : ("unmet" as CheckStatus),
      mandatory: true,
      detail: has
        ? { tr: "İleri düzey aldığını belirttin", en: "You reported advanced level" }
        : { tr: "İleri düzey ders gerekiyor", en: "Advanced-level coursework required" },
      action: has
        ? undefined
        : {
            tr: `${label.tr} dersini ileri düzeyde almadıysan transkriptinde bu eksik görünür. Sayısal ağırlıklı bir programdaysan genelde sorun olmaz — okul müdürlüğünden ders içeriği belgesi isteyerek seviyeni belgeleyebilirsin.`,
            en: `If you did not take advanced ${label.en}, this shows as a gap on your transcript. A course-content letter from your school can document your actual level.`,
          },
    };
  });
}

const EXTRA_LABEL: Record<
  string,
  { tr: string; en: string; actionTr: string; actionEn: string }
> = {
  portfolio: {
    tr: "Portfolyo",
    en: "Portfolio",
    actionTr: "Çalışmalarından 8-12 parçalık bir portfolyo hazırla. Hazırlığı haftalar alır, erken başla.",
    actionEn: "Prepare a portfolio of 8-12 pieces. This takes weeks — start early.",
  },
  interview: {
    tr: "Mülakat",
    en: "Interview",
    actionTr: "Program çevrimiçi mülakat yapıyor. Motivasyonunu ve alan bilgini anlatmaya hazırlan.",
    actionEn: "The program holds an online interview. Prepare to discuss your motivation and subject knowledge.",
  },
  "entrance-exam": {
    tr: "Giriş sınavı",
    en: "Entrance exam",
    actionTr: "Programın kendi giriş sınavı var. Kayıt tarihleri başvurudan ayrı ilerliyor, ayrıca takip et.",
    actionEn: "This program has its own entrance exam with a separate registration timeline.",
  },
  "motivation-letter": {
    tr: "Niyet mektubu",
    en: "Motivation letter",
    actionTr: "Neden bu program sorusuna somut cevap veren 1 sayfalık bir mektup yaz.",
    actionEn: "Write a one-page letter answering concretely why this program.",
  },
  "numerus-fixus": {
    tr: "Sınırlı kontenjan",
    en: "Limited places",
    actionTr: "Kontenjan sınırlı ve seçim/kura ile belirleniyor. Şartları karşılamak kabul garantisi vermiyor — yedek tercih bulundur.",
    actionEn: "Places are capped and allocated by selection or lottery. Meeting the requirements does not guarantee a place — keep a backup.",
  },
  "recommendation-letter": {
    tr: "Referans mektubu",
    en: "Recommendation letter",
    actionTr: "Öğretmeninden referans mektubu iste. Hocalara en az 3 hafta süre tanı.",
    actionEn: "Ask a teacher for a recommendation letter. Give them at least three weeks.",
  },
};

function checkExtras(program: Program, profile: StudentProfile): RequirementCheck[] {
  const extras = program.requirements.extras ?? [];
  return extras.map((extra) => {
    const meta = EXTRA_LABEL[extra.key];
    const ready = profile.extrasReady.includes(extra.key);

    // Sınırlı kontenjan öğrencinin kapatabileceği bir açık değil — bilgi notu.
    if (extra.key === "numerus-fixus") {
      return {
        id: `extra-${extra.key}`,
        label: { tr: meta.tr, en: meta.en },
        status: "met" as CheckStatus,
        mandatory: false,
        detail: {
          tr: extra.note?.tr ?? "Kontenjan sınırlı",
          en: extra.note?.en ?? "Limited places",
        },
        action: { tr: meta.actionTr, en: meta.actionEn },
      };
    }

    return {
      id: `extra-${extra.key}`,
      label: { tr: meta.tr, en: meta.en },
      status: ready ? ("met" as CheckStatus) : ("unmet" as CheckStatus),
      mandatory: extra.mandatory,
      detail: ready
        ? { tr: "Hazır olduğunu belirttin", en: "You marked this as ready" }
        : {
            tr: extra.note?.tr ?? (extra.mandatory ? "Zorunlu" : "İsteğe bağlı"),
            en: extra.note?.en ?? (extra.mandatory ? "Required" : "Optional"),
          },
      action: ready ? undefined : { tr: meta.actionTr, en: meta.actionEn },
    };
  });
}

// ---------------------------------------------------------------------------
// Bant ve skor
// ---------------------------------------------------------------------------

function decideBand(
  checks: RequirementCheck[],
  program: Program,
  profile: StudentProfile
): Band {
  const mandatory = checks.filter((c) => c.mandatory);
  const hardMisses = mandatory.filter((c) => c.status === "unmet").length;
  const softMisses = mandatory.filter((c) => c.status === "close").length;
  const unknowns = mandatory.filter((c) => c.status === "unknown").length;
  const misses = hardMisses + softMisses + unknowns;

  if (misses === 0) {
    // Tüm zorunlu şartlar karşılanıyor. Rahat mı geçiyor, kıl payı mı?
    const studentGpa = toHundredScale(profile.gpa, profile.gpaScale);
    const gpaComfort = studentGpa >= program.requirements.minGpa + GPA_COMFORT_MARGIN;

    const langReqs = program.requirements.language;
    let langComfort = langReqs.length === 0;
    for (const req of langReqs) {
      const owned = profile.languageTests.find((t) => t.test === req.test);
      if (owned && owned.score >= req.min + (CLOSE_MARGIN[req.test] || 0.5)) {
        langComfort = true;
        break;
      }
    }

    return gpaComfort && langComfort ? "safety" : "match";
  }

  // Bir zorunlu şart tamamen kapalıysa ve başka açıklar da varsa erişilmez.
  if (hardMisses <= 1 && misses <= 2) return "reach";
  return "out-of-reach";
}

function computeFitScore(checks: RequirementCheck[], band: Band): number {
  const weight: Record<CheckStatus, number> = {
    met: 1,
    close: 0.6,
    unknown: 0.35,
    unmet: 0,
  };

  const mandatory = checks.filter((c) => c.mandatory);
  const optional = checks.filter((c) => !c.mandatory);

  const mandatoryScore =
    mandatory.length === 0
      ? 1
      : mandatory.reduce((sum, c) => sum + weight[c.status], 0) / mandatory.length;

  const optionalScore =
    optional.length === 0
      ? 0.5
      : optional.reduce((sum, c) => sum + weight[c.status], 0) / optional.length;

  // Zorunlu şartlar ezici ağırlıkta; isteğe bağlılar sadece sıralamayı ayırır.
  const raw = mandatoryScore * 0.85 + optionalScore * 0.15;

  // Bant içi sıralamanın bantlar arası sıralamayı bozmaması için hafif kaydırma.
  const bandFloor: Record<Band, number> = {
    safety: 0,
    match: 0,
    reach: 0,
    "out-of-reach": 0,
  };

  return Math.round(clamp(raw * 100 + bandFloor[band], 0, 100));
}

// ---------------------------------------------------------------------------
// Dış API
// ---------------------------------------------------------------------------

export function evaluateProgram(program: Program, profile: StudentProfile): MatchResult {
  const checks: RequirementCheck[] = [];

  checks.push(checkGpa(program, profile));
  const lang = checkLanguage(program, profile);
  if (lang) checks.push(lang);
  checks.push(...checkStandardizedTests(program, profile));
  checks.push(...checkSubjects(program, profile));
  checks.push(...checkExtras(program, profile));

  const band = decideBand(checks, program, profile);
  const mandatory = checks.filter((c) => c.mandatory);

  return {
    program,
    band,
    fitScore: computeFitScore(checks, band),
    checks,
    metMandatory: mandatory.filter((c) => c.status === "met").length,
    totalMandatory: mandatory.length,
    overBudget:
      profile.maxTuition !== undefined && program.tuitionNonEu > profile.maxTuition,
  };
}

const BAND_ORDER: Record<Band, number> = {
  match: 0,
  reach: 1,
  safety: 2,
  "out-of-reach": 3,
};

export interface MatchOptions {
  /** Senaryo modu bu alanları geçici olarak ezer. */
  fields?: StudentProfile["fields"];
  countries?: StudentProfile["targetCountries"];
  maxTuition?: number;
  /** Bütçeyi aşan programları tamamen gizle (varsayılan: göster ama işaretle). */
  hideOverBudget?: boolean;
  /** Erişilmez bantını listeye dahil et. */
  includeOutOfReach?: boolean;
}

/**
 * Tüm katalogu öğrenci profiline göre değerlendirir ve sıralar.
 * Senaryo modu için `options` ile profil geçici olarak ezilebilir —
 * böylece "ya Almanya deseydim?" sorusu profili bozmadan cevaplanır.
 */
export function matchAll(
  programs: Program[],
  profile: StudentProfile,
  options: MatchOptions = {}
): MatchResult[] {
  const fields = options.fields ?? profile.fields;
  const countries = options.countries ?? profile.targetCountries;
  const maxTuition = options.maxTuition ?? profile.maxTuition;

  const effectiveProfile: StudentProfile = { ...profile, maxTuition };

  const results = programs
    .filter((p) => fields.length === 0 || fields.includes(p.field))
    .filter((p) => countries.length === 0 || countries.includes(p.country))
    .map((p) => evaluateProgram(p, effectiveProfile))
    .filter((r) => (options.includeOutOfReach ? true : r.band !== "out-of-reach"))
    .filter((r) => (options.hideOverBudget ? !r.overBudget : true));

  return results.sort((a, b) => {
    const byBand = BAND_ORDER[a.band] - BAND_ORDER[b.band];
    if (byBand !== 0) return byBand;
    return b.fitScore - a.fitScore;
  });
}

/**
 * Eksik analizi: tüm sonuçlardaki kapatılabilir açıkları toplayıp
 * "bunu düzeltirsen şu kadar program açılır" listesine çevirir.
 * Ürünün en motive edici ekranı bunu kullanıyor.
 */
export interface GapAction {
  checkId: string;
  label: { tr: string; en: string };
  action: { tr: string; en: string };
  /** Bu açığı kapatmanın etkilediği program sayısı. */
  affectedPrograms: number;
  severity: "close" | "unmet" | "unknown";
}

export function buildGapPlan(results: MatchResult[]): GapAction[] {
  const bucket = new Map<string, GapAction>();

  for (const result of results) {
    for (const check of result.checks) {
      if (check.status === "met" || !check.action) continue;

      const key = `${check.id}:${check.action.tr}`;
      const existing = bucket.get(key);
      if (existing) {
        existing.affectedPrograms += 1;
        continue;
      }
      bucket.set(key, {
        checkId: check.id,
        label: check.label,
        action: check.action,
        affectedPrograms: 1,
        severity: check.status,
      });
    }
  }

  const severityRank: Record<GapAction["severity"], number> = {
    close: 0,
    unknown: 1,
    unmet: 2,
  };

  // Önce en kolay kapanacak ve en çok programı açan adımlar.
  return [...bucket.values()].sort((a, b) => {
    const bySeverity = severityRank[a.severity] - severityRank[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return b.affectedPrograms - a.affectedPrograms;
  });
}
