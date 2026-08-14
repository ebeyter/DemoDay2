import { describe, expect, it } from "vitest";
import { evaluateProgram } from "@/lib/matching";
import { fitSummary, groupByCountry } from "@/lib/discover";
import { makeProfile, makeProgram } from "./fixtures";

// "Hiçbir zorunlu şartını bilmiyoruz" (kaynak sayfa hem not eşiğini hem dil
// şartını hiç belirtmiyor, başka zorunlu şart da yok) — unknownOnly=true.
function unknownOnlyResult(id: string, university: string) {
  const program = {
    ...makeProgram({ requirements: { minGpa: undefined, language: undefined } }),
    id,
    university,
  };
  return evaluateProgram(program, makeProfile({ gpa: 90 }));
}

// Gerçekten hesaplanabilir ve gerçekten %0 (tek zorunlu şart: not ortalaması,
// öğrenci çok uzak) — unknownOnly=false, percent=0.
function realZeroResult(id: string, university: string) {
  const program = {
    ...makeProgram({ requirements: { minGpa: 95, language: [] } }),
    id,
    university,
  };
  return evaluateProgram(program, makeProfile({ gpa: 10 }));
}

describe("fitSummary — unknownOnly ile gerçek %0 birbirine karışmıyor", () => {
  it("hiçbir zorunlu şartı bilinmeyen programda unknownOnly true, percent 0'a zorlanmaz ama total da 0 olur", () => {
    const result = unknownOnlyResult("u-1", "Bilinmeyen Üniversite");
    const summary = fitSummary(result);
    expect(summary.unknownOnly).toBe(true);
    expect(summary.total).toBe(0);
  });

  it("gerçekten hesaplanabilir bir %0 sonuçta unknownOnly false'tur", () => {
    const result = realZeroResult("r-1", "Gerçek Üniversite");
    const summary = fitSummary(result);
    expect(summary.unknownOnly).toBe(false);
    expect(summary.percent).toBe(0);
  });
});

describe("groupByCountry — bilinmeyen (null) ile gerçek %0 aynı sayı olarak görünmüyor", () => {
  it("tüm programları unknownOnly olan üniversitenin bestPercent/averagePercent'i null'dur, 0 değil", () => {
    const results = [unknownOnlyResult("u-1", "Bilinmeyen Üniversite")];
    const [country] = groupByCountry(results);
    const [university] = country.universities;

    expect(university.bestPercent).toBeNull();
    expect(university.averagePercent).toBeNull();
    expect(country.bestPercent).toBeNull();
    expect(country.averagePercent).toBeNull();
  });

  it("gerçekten %0 olan bir üniversitenin bestPercent'i sayısal 0'dır (null değil)", () => {
    const results = [realZeroResult("r-1", "Gerçek Üniversite")];
    const [country] = groupByCountry(results);
    const [university] = country.universities;

    expect(university.bestPercent).toBe(0);
    expect(university.averagePercent).toBe(0);
    expect(country.bestPercent).toBe(0);
  });

  it("sıralamada bestPercent'i null olan üniversite/ülke, sayısal (0 dahil) bir bestPercent'i olandan sonra gelir", () => {
    // Aynı ülkede iki üniversite: biri gerçekten %0, diğeri hiç hesaplanamıyor.
    const results = [
      { ...unknownOnlyResult("u-1", "Bilinmeyen Üniversite") },
      { ...realZeroResult("r-1", "Gerçek Üniversite") },
    ];
    const [country] = groupByCountry(results);

    expect(country.universities.map((u) => u.university)).toEqual([
      "Gerçek Üniversite",
      "Bilinmeyen Üniversite",
    ]);
  });
});
