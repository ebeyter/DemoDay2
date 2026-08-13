import { describe, expect, it } from "vitest";
import { buildGapPlan, evaluateProgram, matchAll, toHundredScale } from "@/lib/matching";
import type { MatchResult } from "@/lib/types";
import { makeProfile, makeProgram } from "./fixtures";

// ---------------------------------------------------------------------------
// Not çevrimi (toHundredScale)
// ---------------------------------------------------------------------------

describe("toHundredScale — not ölçeği çevrimi", () => {
  it("100'lük ölçekte notu olduğu gibi döner", () => {
    expect(toHundredScale(85, "100")).toBe(85);
  });

  it("100'lük ölçekte sınırların dışını 0-100'e kelepçeler", () => {
    expect(toHundredScale(105, "100")).toBe(100);
    expect(toHundredScale(-5, "100")).toBe(0);
  });

  it("5'lik ölçekte alt sınır (1) 20 verir", () => {
    expect(toHundredScale(1, "5")).toBe(20);
  });

  it("5'lik ölçekte üst sınır (5) 100 verir", () => {
    expect(toHundredScale(5, "5")).toBe(100);
  });

  it("5'lik ölçekte ara değeri doğrusal çevirir", () => {
    expect(toHundredScale(3, "5")).toBe(60);
  });

  it("4'lük ölçekte alt sınır (2.0) 55 verir", () => {
    expect(toHundredScale(2.0, "4")).toBe(55);
  });

  it("4'lük ölçekte üst sınır (4.0) 100 verir", () => {
    expect(toHundredScale(4.0, "4")).toBe(100);
  });

  it("4'lük ölçekte iki nokta arasını doğrusal ara değerle çevirir", () => {
    // 2.5->66 ile 3.0->77 arasında tam ortada: 66 + 0.5*11 = 71.5
    expect(toHundredScale(2.75, "4")).toBe(71.5);
  });

  it("4'lük ölçekte tablonun altındaki/üstündeki değerleri uç noktaya kelepçeler", () => {
    expect(toHundredScale(1.0, "4")).toBe(55);
    expect(toHundredScale(4.5, "4")).toBe(100);
  });

  it("IB45 ölçekte alt sınır (24) 55 verir", () => {
    expect(toHundredScale(24, "ib45")).toBe(55);
  });

  it("IB45 ölçekte üst sınır (45) 100 verir", () => {
    expect(toHundredScale(45, "ib45")).toBe(100);
  });

  it("IB45 ölçekte iki nokta arasını doğrusal ara değerle çevirir", () => {
    // 24->55 ile 30->70 arasında tam ortada: 55 + 0.5*15 = 62.5
    expect(toHundredScale(27, "ib45")).toBe(62.5);
  });
});

// ---------------------------------------------------------------------------
// Not ortalaması şartı (checkGpa, evaluateProgram üzerinden)
// ---------------------------------------------------------------------------

describe("Not ortalaması şartı — bant sınırları", () => {
  it("tam eşikte (gap=0) met döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70 } }),
      makeProfile({ gpa: 70 })
    );
    const gpaCheck = result.checks.find((c) => c.id === "gpa")!;
    expect(gpaCheck.status).toBe("met");
  });

  it("kapatılabilir marj sınırında (gap=5) close döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70 } }),
      makeProfile({ gpa: 65 })
    );
    const gpaCheck = result.checks.find((c) => c.id === "gpa")!;
    expect(gpaCheck.status).toBe("close");
  });

  it("kapatılabilir marjın bir tık ötesinde (gap=5.1) unmet döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70 } }),
      makeProfile({ gpa: 64.9 })
    );
    const gpaCheck = result.checks.find((c) => c.id === "gpa")!;
    expect(gpaCheck.status).toBe("unmet");
  });
});

// ---------------------------------------------------------------------------
// Dil şartı — anyOf, close/unmet/unknown ayrımı, boş dizi
// ---------------------------------------------------------------------------

describe("Dil şartı — close vs unknown ayrımı", () => {
  it("IELTS 6.0 varken 6.5 isteniyorsa close döner (gap marja eşit)", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { language: [{ test: "ielts", min: 6.5 }] } }),
      makeProfile({ languageTests: [{ test: "ielts", score: 6.0 }] })
    );
    const langCheck = result.checks.find((c) => c.id === "language")!;
    expect(langCheck.status).toBe("close");
  });

  it("IELTS 5.9 varken 6.5 isteniyorsa unmet döner (gap marjın bir tık üstü)", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { language: [{ test: "ielts", min: 6.5 }] } }),
      makeProfile({ languageTests: [{ test: "ielts", score: 5.9 }] })
    );
    const langCheck = result.checks.find((c) => c.id === "language")!;
    expect(langCheck.status).toBe("unmet");
  });

  it("öğrenci hiç dil sınavı girmemişse unknown döner (unmet değil)", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { language: [{ test: "ielts", min: 6.5 }] } }),
      makeProfile({ languageTests: [] })
    );
    const langCheck = result.checks.find((c) => c.id === "language")!;
    expect(langCheck.status).toBe("unknown");
  });

  it("anyOf: kabul edilen sınavlardan biri (TOEFL) eşiği geçerse IELTS'e sahip olmasa da met döner", () => {
    const result = evaluateProgram(
      makeProgram({
        requirements: {
          language: [
            { test: "ielts", min: 6.5 },
            { test: "toefl", min: 90 },
          ],
        },
      }),
      makeProfile({ languageTests: [{ test: "toefl", score: 95 }] })
    );
    const langCheck = result.checks.find((c) => c.id === "language")!;
    expect(langCheck.status).toBe("met");
    expect(langCheck.detail.en).toContain("TOEFL");
  });

  it("boş dizi (dil belgesi istenmiyor) hiç RequirementCheck üretmez", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { language: [] } }),
      makeProfile({ languageTests: [] })
    );
    expect(result.checks.find((c) => c.id === "language")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Standart sınavlar (SAT / IB / AP) — marj sınırları
// ---------------------------------------------------------------------------

describe("Standart sınav şartları — marj sınırları", () => {
  it("SAT marjı (60) sınırında close döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { standardizedTests: [{ test: "sat", min: 1200, mandatory: true }] } }),
      makeProfile({ standardizedTests: [{ test: "sat", score: 1140 }] })
    );
    const check = result.checks.find((c) => c.id === "test-sat")!;
    expect(check.status).toBe("close");
  });

  it("SAT marjının bir tık ötesinde unmet döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { standardizedTests: [{ test: "sat", min: 1200, mandatory: true }] } }),
      makeProfile({ standardizedTests: [{ test: "sat", score: 1130 }] })
    );
    const check = result.checks.find((c) => c.id === "test-sat")!;
    expect(check.status).toBe("unmet");
  });

  it("IB marjı (2) sınırında close döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { standardizedTests: [{ test: "ib", min: 38, mandatory: true }] } }),
      makeProfile({ standardizedTests: [{ test: "ib", score: 36 }] })
    );
    const check = result.checks.find((c) => c.id === "test-ib")!;
    expect(check.status).toBe("close");
  });

  it("AP marjı (1) sınırında close, bir tık ötesinde unmet döner", () => {
    const closeResult = evaluateProgram(
      makeProgram({ requirements: { standardizedTests: [{ test: "ap", min: 4, mandatory: true }] } }),
      makeProfile({ standardizedTests: [{ test: "ap", score: 3 }] })
    );
    const unmetResult = evaluateProgram(
      makeProgram({ requirements: { standardizedTests: [{ test: "ap", min: 4, mandatory: true }] } }),
      makeProfile({ standardizedTests: [{ test: "ap", score: 2 }] })
    );
    expect(closeResult.checks.find((c) => c.id === "test-ap")!.status).toBe("close");
    expect(unmetResult.checks.find((c) => c.id === "test-ap")!.status).toBe("unmet");
  });

  it("zorunlu standart sınav puanı yoksa unknown döner (eksik veri, ceza değil)", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { standardizedTests: [{ test: "yks", min: 300, mandatory: true }] } }),
      makeProfile({ standardizedTests: [] })
    );
    const check = result.checks.find((c) => c.id === "test-yks")!;
    expect(check.status).toBe("unknown");
    expect(check.mandatory).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Ders şartları — temel seviye otomatik met, ileri seviye ikili (met/unmet)
// ---------------------------------------------------------------------------

describe("Ders şartları", () => {
  it("temel seviye ders şartı öğrencinin beyanından bağımsız her zaman met döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { requiredSubjects: [{ subject: "math", level: "basic" }] } }),
      makeProfile({ advancedSubjects: [] })
    );
    expect(result.checks.find((c) => c.id === "subject-math")!.status).toBe("met");
  });

  it("ileri seviye ders şartı: öğrenci beyan etmişse met, etmemişse unmet döner (close/unknown yok)", () => {
    const met = evaluateProgram(
      makeProgram({ requirements: { requiredSubjects: [{ subject: "physics", level: "advanced" }] } }),
      makeProfile({ advancedSubjects: ["physics"] })
    );
    const unmet = evaluateProgram(
      makeProgram({ requirements: { requiredSubjects: [{ subject: "physics", level: "advanced" }] } }),
      makeProfile({ advancedSubjects: [] })
    );
    expect(met.checks.find((c) => c.id === "subject-physics")!.status).toBe("met");
    expect(unmet.checks.find((c) => c.id === "subject-physics")!.status).toBe("unmet");
  });
});

// ---------------------------------------------------------------------------
// Ekstra şartlar — numerus fixus özel durumu
// ---------------------------------------------------------------------------

describe("Ekstra şartlar", () => {
  it("numerus fixus öğrencinin beyanından bağımsız her zaman met ve isteğe bağlıdır (bandı düşürmez)", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { extras: [{ key: "numerus-fixus", mandatory: false }] } }),
      makeProfile({ extrasReady: [] })
    );
    const check = result.checks.find((c) => c.id === "extra-numerus-fixus")!;
    expect(check.status).toBe("met");
    expect(check.mandatory).toBe(false);
  });

  it("zorunlu diğer ekstra şart (niyet mektubu) beyan edilmemişse unmet döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { extras: [{ key: "motivation-letter", mandatory: true }] } }),
      makeProfile({ extrasReady: [] })
    );
    expect(result.checks.find((c) => c.id === "extra-motivation-letter")!.status).toBe("unmet");
  });

  it("zorunlu diğer ekstra şart beyan edilmişse met döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { extras: [{ key: "motivation-letter", mandatory: true }] } }),
      makeProfile({ extrasReady: ["motivation-letter"] })
    );
    expect(result.checks.find((c) => c.id === "extra-motivation-letter")!.status).toBe("met");
  });
});

// ---------------------------------------------------------------------------
// Bant kararı — sınır vakaları
// ---------------------------------------------------------------------------

/** Dört bağımsız zorunlu şartlı bir program: gpa, dil, iki ileri ders. */
function bandTestProgram() {
  return makeProgram({
    requirements: {
      minGpa: 70,
      language: [{ test: "ielts", min: 6.5 }],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
    },
  });
}

describe("Bant kararı — match/safety sınırı", () => {
  it("tüm zorunlu şartlar tam eşikte karşılanıyorsa (rahat değil) match döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70 } }),
      makeProfile({ gpa: 70 }) // gap=0 met, ama comfort marjı (8) karşılanmıyor
    );
    expect(result.band).toBe("match");
  });

  it("comfort marjının (8 puan) bir eksiğinde hâlâ match döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70 } }),
      makeProfile({ gpa: 77 }) // gap=7, comfort=8 gerekli
    );
    expect(result.band).toBe("match");
  });

  it("comfort marjı tam sağlanınca (8 puan fazla) safety döner", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70 } }),
      makeProfile({ gpa: 78 })
    );
    expect(result.band).toBe("safety");
  });
});

describe("Bant kararı — reach/out-of-reach sınırı", () => {
  it("1 zorunlu şart tamamen kapalı + 1 kapatılabilir açık (misses=2) → reach (tam sınırda)", () => {
    const result = evaluateProgram(
      bandTestProgram(),
      makeProfile({
        gpa: 68, // close (gap=2)
        languageTests: [{ test: "ielts", score: 7.0 }], // met
        advancedSubjects: ["math"], // physics unmet
      })
    );
    expect(result.band).toBe("reach");
  });

  it("aynı vakaya bir eksik daha eklenince (misses=3) → out-of-reach (bir fazlası)", () => {
    const result = evaluateProgram(
      bandTestProgram(),
      makeProfile({
        gpa: 68, // close
        languageTests: [], // unknown (ek bir miss)
        advancedSubjects: ["math"], // physics unmet
      })
    );
    expect(result.band).toBe("out-of-reach");
  });

  it("2 zorunlu şart tamamen kapalıysa (hardMisses=2) toplam miss sayısı 2 olsa bile out-of-reach döner", () => {
    const result = evaluateProgram(
      bandTestProgram(),
      makeProfile({
        gpa: 70, // met
        languageTests: [{ test: "ielts", score: 7.0 }], // met
        advancedSubjects: [], // math VE physics unmet -> hardMisses=2
      })
    );
    expect(result.band).toBe("out-of-reach");
  });
});

describe("Bant kararı — unknown cezalandırılmıyor ama safety'e de düşmüyor", () => {
  it("zorunlu şartı unknown olan program safety/match bandına düşmez, reach'e düşer", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70, language: [{ test: "ielts", min: 6.5 }] } }),
      makeProfile({ gpa: 85, languageTests: [] }) // gpa çok rahat, dil sınavı hiç girilmemiş
    );
    expect(result.band).toBe("reach");
  });

  it("kapı şartı (ileri ders) eksikse gpa ne kadar rahat olursa olsun safety'e düşmez", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70, requiredSubjects: [{ subject: "physics", level: "advanced" }] } }),
      makeProfile({ gpa: 90, advancedSubjects: [] })
    );
    expect(result.band).toBe("reach");
  });

  it("kapı şartı (zorunlu YKS) eksikse gpa rahat olsa da safety'e düşmez", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70, standardizedTests: [{ test: "yks", min: 300, mandatory: true }] } }),
      makeProfile({ gpa: 90, standardizedTests: [] })
    );
    expect(result.band).toBe("reach");
  });

  it("numerus fixus varlığı tek başına bandı reach'in altına düşürmez (safety kalabilir)", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70, extras: [{ key: "numerus-fixus", mandatory: false }] } }),
      makeProfile({ gpa: 90, extrasReady: [] })
    );
    expect(result.band).toBe("safety");
  });
});

// ---------------------------------------------------------------------------
// fitScore — unknown, close, unmet farklı ağırlıklandırılır
// ---------------------------------------------------------------------------

describe("fitScore — unknown cezalandırılmıyor ama met de sayılmıyor", () => {
  function scoreWithLanguageStatus(languageTests: { test: "ielts"; score: number }[]) {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70, language: [{ test: "ielts", min: 6.5 }] } }),
      makeProfile({ gpa: 70, languageTests })
    );
    return result.fitScore;
  }

  it("unmet < unknown < close < met sıralamasını korur", () => {
    const unmetScore = scoreWithLanguageStatus([{ test: "ielts", score: 5.0 }]); // gap 1.5 -> unmet
    const unknownScore = scoreWithLanguageStatus([]); // unknown
    const closeScore = scoreWithLanguageStatus([{ test: "ielts", score: 6.0 }]); // gap 0.5 -> close
    const metScore = scoreWithLanguageStatus([{ test: "ielts", score: 6.5 }]); // met

    expect(unmetScore).toBeLessThan(unknownScore);
    expect(unknownScore).toBeLessThan(closeScore);
    expect(closeScore).toBeLessThan(metScore);
  });

  it("ağırlık formülüne göre tam sayısal değerleri üretir (mandatoryScore*0.85 + 0.5*0.15)", () => {
    expect(scoreWithLanguageStatus([{ test: "ielts", score: 5.0 }])).toBe(50); // weight 0
    expect(scoreWithLanguageStatus([])).toBe(65); // weight 0.35
    expect(scoreWithLanguageStatus([{ test: "ielts", score: 6.0 }])).toBe(76); // weight 0.6, round(75.5)
    expect(scoreWithLanguageStatus([{ test: "ielts", score: 6.5 }])).toBe(93); // weight 1
  });
});

// ---------------------------------------------------------------------------
// Bütçe (overBudget)
// ---------------------------------------------------------------------------

describe("Bütçe şartı", () => {
  it("harç üst sınırı aşılırsa overBudget true döner", () => {
    const result = evaluateProgram(
      makeProgram({ tuitionNonEu: 20000 }),
      makeProfile({ gpa: 70, maxTuition: 10000 })
    );
    expect(result.overBudget).toBe(true);
  });

  it("harç üst sınırı tanımsızsa (sınır yok) overBudget her zaman false döner", () => {
    const result = evaluateProgram(
      makeProgram({ tuitionNonEu: 999999 }),
      makeProfile({ gpa: 70, maxTuition: undefined })
    );
    expect(result.overBudget).toBe(false);
  });

  it("bütçe aşımı bandı etkilemez, sadece işaretler", () => {
    const result = evaluateProgram(
      makeProgram({ requirements: { minGpa: 70 }, tuitionNonEu: 20000 }),
      makeProfile({ gpa: 78, maxTuition: 10000 })
    );
    expect(result.overBudget).toBe(true);
    expect(result.band).toBe("safety");
  });
});

// ---------------------------------------------------------------------------
// matchAll — filtreleme, sıralama, senaryo modu
// ---------------------------------------------------------------------------

describe("matchAll — filtreleme ve sıralama", () => {
  it("sadece profildeki alanlara (fields) uyan programları döner", () => {
    const csProgram = makeProgram({ requirements: { minGpa: 10 } });
    const businessProgram = { ...makeProgram({ requirements: { minGpa: 10 } }), id: "biz", field: "business" as const };
    const results = matchAll([csProgram, businessProgram], makeProfile({ gpa: 50, fields: ["cs"] }));
    expect(results.map((r) => r.program.id)).toEqual([csProgram.id]);
  });

  it("sadece profildeki ülkelere (targetCountries) uyan programları döner", () => {
    const nlProgram = makeProgram({ requirements: { minGpa: 10 } });
    const deProgram = { ...makeProgram({ requirements: { minGpa: 10 } }), id: "de-1", country: "DE" as const };
    const results = matchAll([nlProgram, deProgram], makeProfile({ gpa: 50, targetCountries: ["DE"] }));
    expect(results.map((r) => r.program.id)).toEqual([deProgram.id]);
  });

  it("varsayılan olarak out-of-reach bandındaki programları listeden çıkarır", () => {
    // İki zorunlu şart da tamamen kapalı (hardMisses=2) -> out-of-reach.
    const hopeless = makeProgram({ requirements: { minGpa: 99, language: [{ test: "ielts", min: 9 }] } });
    const results = matchAll([hopeless], makeProfile({ gpa: 30, languageTests: [{ test: "ielts", score: 1 }] }));
    expect(results).toHaveLength(0);
  });

  it("includeOutOfReach:true verilince out-of-reach programları da döner", () => {
    const hopeless = makeProgram({ requirements: { minGpa: 99, language: [{ test: "ielts", min: 9 }] } });
    const results = matchAll([hopeless], makeProfile({ gpa: 30, languageTests: [{ test: "ielts", score: 1 }] }), {
      includeOutOfReach: true,
    });
    expect(results).toHaveLength(1);
    expect(results[0].band).toBe("out-of-reach");
  });

  it("hideOverBudget:true bütçeyi aşan programları listeden çıkarır", () => {
    const expensive = makeProgram({ requirements: { minGpa: 10 }, tuitionNonEu: 30000 });
    const withoutHide = matchAll([expensive], makeProfile({ gpa: 50, maxTuition: 10000 }));
    const withHide = matchAll([expensive], makeProfile({ gpa: 50, maxTuition: 10000 }), {
      hideOverBudget: true,
    });
    expect(withoutHide).toHaveLength(1);
    expect(withHide).toHaveLength(0);
  });

  it("bantlara göre sıralar: önce match, sonra reach, sonra safety (BAND_ORDER)", () => {
    const matchProgram = { ...makeProgram({ requirements: { minGpa: 70 } }), id: "match-p" };
    const reachProgram = {
      ...makeProgram({ requirements: { minGpa: 70, requiredSubjects: [{ subject: "physics" as const, level: "advanced" as const }] } }),
      id: "reach-p",
    };
    // Tek profil (gpa=70) altında üç programı da farklı bantlara düşürüyoruz:
    // match-p tam eşikte (comfort yok), reach-p'de kapı şartı eksik,
    // safety-p'nin eşiği düşük tutulduğu için aynı gpa onu rahat geçiyor (comfort marjı 8).
    const safetyProgram = { ...makeProgram({ requirements: { minGpa: 62 } }), id: "safety-p" };

    const profile = makeProfile({ gpa: 70, advancedSubjects: [] });
    const results = matchAll([matchProgram, reachProgram, safetyProgram], profile);
    expect(results.map((r) => r.band)).toEqual(["match", "reach", "safety"]);
  });

  it("senaryo modu (options) profili bozmadan geçici olarak eziyor", () => {
    const csProgram = makeProgram({ requirements: { minGpa: 10 } });
    const profile = makeProfile({ gpa: 50, fields: ["business"] });
    matchAll([csProgram], profile, { fields: ["cs"] });
    expect(profile.fields).toEqual(["business"]); // orijinal profil değişmedi
  });
});

// ---------------------------------------------------------------------------
// buildGapPlan — eksik analizi
// ---------------------------------------------------------------------------

describe("buildGapPlan", () => {
  function resultWithLanguageStatus(score: number | null): MatchResult {
    return evaluateProgram(
      makeProgram({ requirements: { minGpa: 70, language: [{ test: "ielts", min: 6.5 }] } }),
      makeProfile({ gpa: 70, languageTests: score === null ? [] : [{ test: "ielts", score }] })
    );
  }

  it("met durumundaki veya action'ı olmayan şartları listeye almaz", () => {
    const metResult = resultWithLanguageStatus(6.5);
    const plan = buildGapPlan([metResult]);
    expect(plan).toHaveLength(0);
  });

  it("aynı eksiği paylaşan birden çok programı tek GapAction altında toplar (affectedPrograms)", () => {
    const a = resultWithLanguageStatus(6.0);
    const b = resultWithLanguageStatus(6.0);
    const plan = buildGapPlan([a, b]);
    const languageAction = plan.find((g) => g.checkId === "language")!;
    expect(languageAction.affectedPrograms).toBe(2);
  });

  it("önceliği close > unknown > unmet sırasına göre verir (severityRank)", () => {
    const closeResult = resultWithLanguageStatus(6.0); // close
    const unknownResult = resultWithLanguageStatus(null); // unknown
    const unmetResult = resultWithLanguageStatus(5.0); // unmet

    const plan = buildGapPlan([unmetResult, unknownResult, closeResult]);
    expect(plan.map((g) => g.severity)).toEqual(["close", "unknown", "unmet"]);
  });
});
