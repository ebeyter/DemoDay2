import { describe, expect, it } from "vitest";
import { compareByFit, fitSummary, groupByCountry } from "@/lib/discover";
import { evaluateProgram } from "@/lib/matching";
import { makeProfile, makeProgram } from "./fixtures";
import type { MatchResult } from "@/lib/types";

/**
 * Keşfet'in yüzdesi ürünün en kolay yanlış okunan sayısı: çıplak bir yüzde
 * kaçınılmaz olarak "kabul şansı" gibi okunuyor. Buradaki testler yüzdenin
 * NE ZAMAN GÖSTERİLMEDİĞİNİ sabitliyor — gösterildiği durumdan daha önemli
 * olan bu.
 */

/** Verilen şart yapısıyla tek bir programı değerlendirir. */
function evaluate(overrides: Parameters<typeof makeProgram>[0], profile = makeProfile()) {
  return evaluateProgram(makeProgram(overrides), profile);
}

describe("fitSummary — kaynak boşluğu paydadan düşer", () => {
  it("kaynağın yayınlamadığı şart paydaya girmez ama sayılır", () => {
    // minGpa biliniyor (öğrenci karşılıyor), dil şartı kaynakta yok.
    const result = evaluate(
      { requirements: { minGpa: 60, language: undefined } },
      makeProfile({ gpa: 90 })
    );
    const fit = fitSummary(result);
    expect(fit.unknownFromSource).toBeGreaterThan(0);
    // Payda yalnızca bildiğimiz şartlar.
    expect(fit.total).toBe(fit.mandatoryTotal - fit.unknownFromSource);
  });
});

describe("fitSummary — yüzde ne zaman GÖSTERİLMEZ", () => {
  it("tek bilinen şart varken güvenilir değil: '1/1 → %100' ekranda sayı olarak çıkmaz", () => {
    // Üç zorunlu şarttan ikisi kaynakta yok → 1/1 = %100 ama anlamı yok.
    const result = evaluate(
      {
        requirements: {
          minGpa: 60,
          language: undefined,
          standardizedTests: undefined,
        },
      },
      makeProfile({ gpa: 90 })
    );
    const fit = fitSummary(result);
    expect(fit.percent).toBe(100);
    // Yüzde doğru ama gösterilemez: arayüz "veri yetersiz" yazıyor.
    expect(fit.reliable).toBe(false);
  });

  it("zorunlu şartların yarısını biliyorsak yüzde gösterilir", () => {
    const result = evaluate(
      { requirements: { minGpa: 60, language: [{ test: "ielts", min: 6 }] } },
      makeProfile({ gpa: 90, languageTests: [{ test: "ielts", score: 7 }] })
    );
    const fit = fitSummary(result);
    expect(fit.total).toBeGreaterThanOrEqual(2);
    expect(fit.reliable).toBe(true);
    expect(fit.percent).toBe(100);
  });

  it("hiç bilinen zorunlu şart yoksa unknownOnly, yüzde 0 ve güvenilir değil", () => {
    const result = evaluate(
      { requirements: { minGpa: undefined, language: undefined } },
      makeProfile()
    );
    const fit = fitSummary(result);
    expect(fit.unknownOnly).toBe(true);
    expect(fit.reliable).toBe(false);
    // 0 yazmak "hiçbir şartı karşılamıyorsun" demek olurdu; arayüz sayı basmıyor.
    expect(fit.percent).toBe(0);
  });
});

describe("compareByFit — ölçülmüş uyum, ölçülmemişin önünde", () => {
  it("6/6 karşılayan program, 1/1 ile %100 görünen programın ÖNÜNE geçer", () => {
    const wellKnown = evaluate(
      { requirements: { minGpa: 60, language: [{ test: "ielts", min: 6 }] } },
      makeProfile({ gpa: 90, languageTests: [{ test: "ielts", score: 7 }] })
    );
    const barelyKnown = evaluate(
      { requirements: { minGpa: 60, language: undefined, standardizedTests: undefined } },
      makeProfile({ gpa: 90 })
    );

    expect(fitSummary(wellKnown).percent).toBe(100);
    expect(fitSummary(barelyKnown).percent).toBe(100);
    // İkisi de %100; sıralamayı bilgi miktarı belirliyor.
    expect(compareByFit(wellKnown, barelyKnown)).toBeLessThan(0);
    expect(compareByFit(barelyKnown, wellKnown)).toBeGreaterThan(0);
  });
});

describe("groupByCountry — güvenilmez yüzde ortalamayı ve 'en iyi'yi kirletmez", () => {
  /** Aynı üniversiteye ait iki program üretir. */
  function resultsFor(): MatchResult[] {
    const strongProfile = makeProfile({ gpa: 90, languageTests: [{ test: "ielts", score: 7 }] });
    const barely = evaluateProgram(
      {
        ...makeProgram({
          requirements: { minGpa: 60, language: undefined, standardizedTests: undefined },
        }),
        id: "nl-x-barely",
      },
      strongProfile
    );
    return [barely];
  }

  it("tek programı da güvenilmezse üniversite yüzdesi gösterilmiyor (null)", () => {
    const [country] = groupByCountry(resultsFor());
    const uni = country.universities[0];

    // AYRI BİR `hasReliableFit` BAYRAĞI YOK: güvenilmezlik `null` ile ifade
    // ediliyor. İki ayrı gösterge (bayrak + sayı) tutmak, bir gün birinin
    // diğerini yalanlaması demekti — 0 ile "bilmiyoruz"un karışması zaten
    // tam olarak bu dosyanın önlediği hata.
    expect(uni.bestPercent).toBeNull();
    expect(uni.averagePercent).toBeNull();
    expect(country.bestPercent).toBeNull();

    // Program yine listede — gizlemiyoruz, yalnızca yüzde iddia etmiyoruz.
    expect(country.programCount).toBe(1);
  });

  it("gerçekten %0 karşılayan program null DEĞİL, sayısal 0 döner", () => {
    // Ayrımın kendisi: "hiçbir şartı karşılamıyor" ölçülmüş bir sonuç,
    // "bilmiyoruz" ise bizim boşluğumuz. İkisi aynı sayıya düşerse ürün
    // katalog eksiğini öğrencinin başarısızlığı gibi gösterir.
    const zero = evaluateProgram(
      makeProgram({
        requirements: { minGpa: 95, language: [{ test: "ielts", min: 8 }] },
      }),
      makeProfile({ gpa: 10, languageTests: [{ test: "ielts", score: 1 }] })
    );
    const [country] = groupByCountry([zero]);

    expect(fitSummary(zero).reliable).toBe(true);
    expect(country.universities[0].bestPercent).toBe(0);
  });
});
