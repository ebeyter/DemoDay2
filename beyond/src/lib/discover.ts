/**
 * Beyond — Keşfet ekranının hesap katmanı.
 *
 * Üç kırılım: ülke → üniversite → program. Her seviyede "şart uyumu" var.
 *
 * ŞART UYUMU NEDİR, NE DEĞİLDİR:
 *   karşılanan zorunlu şart / toplam zorunlu şart
 *
 * Bu bir KABUL OLASILIĞI DEĞİL ve öyle sunulmamalı. Avrupa'da kabul eşik
 * bazlı ve kabul istatistikleri kamuya açık değil; "%78 kabul edilirsin"
 * demek uydurma olur. "%78 şart uyumu" ise doğrulanabilir bir ölçü: 9 zorunlu
 * şartın 7'sini karşılıyorsun demek. Arayüzde her zaman sayaçla birlikte
 * gösteriliyor (7/9) ki yüzdenin nereden geldiği görünsün.
 *
 * İKİ TÜR BİLİNMEYEN, İKİ FARKLI MUAMELE — bu ayrım ürünün her yerinde aynı:
 *
 *   Öğrenci kaynaklı ("dil belgen yok")  → PAYDADA KALIR.
 *       Öğrencinin kapatabileceği bir açık; sayması doğru, aksiyon üretiyor.
 *
 *   Kaynak kaynaklı ("üniversite eşik yayınlamıyor") → PAYDADAN DÜŞER.
 *       Bizim katalog boşluğumuz. Paydada bırakmak, kendi eksiğimizin cezasını
 *       öğrenciye kesmek olur: az dokümante edilmiş bir program, öğrenci hiçbir
 *       şey yapmadan daha düşük uyum gösterir. Aynı hatayı bugün üç yerde
 *       düzelttik (bant kararı, eksik planı, bütçe kıyası) — burada da
 *       düşürüyoruz ve ayrıca "2 şart bilinmiyor" diye söylüyoruz.
 *
 * Yüzde bu yüzden "bildiğimiz şartların ne kadarını karşılıyorsun" demek.
 *
 * ÜNİVERSİTE VARLIĞI YOK. Katalog program bazlı; üniversite bilgisi buradaki
 * gruplamayla türetiliyor (ad, şehir, program sayısı, ortalama uyum). Bu
 * yüzden üniversite düzeyinde tanıtım metni ve resmî site adresi de yok —
 * elimizdeki en iyi bağlantı programların `facultyUrl`'ü. Gerçek bir
 * `universities` tablosu eklenene kadar bu böyle.
 */

import type { CountryCode, MatchResult } from "./types";
import { getUniversity } from "@/data/universities";
import type { University } from "@/data/universities";

/**
 * YÜZDE GÖSTERMEK İÇİN GEREKEN EN AZ BİLİNEN ŞART SAYISI.
 *
 * Neden bir eşik var: kaynak boşluklarını paydadan düşürdüğümüz için, üç
 * zorunlu şartından yalnızca birini bildiğimiz bir program "1/1 → %100"
 * yazıyordu. Yüzde teknik olarak doğruydu ama ekranda, altı şartın altısını
 * bildiğimiz bir programın "%100"ü ile AYNI görünüyordu — oysa biri ölçüm,
 * öbürü tahmin bile değil. Bu somut olarak yaşandı: Alp'in profilinde
 * Keşfet 27 program için %100 gösteriyordu ve bunların dördü tek bilinen
 * şarta dayanıyordu (nl-uva-economics, de-tum-informatics,
 * it-sapienza-acsai, it-polito-computer-engineering).
 *
 * İki koşul birlikte: en az iki şart bilinecek VE zorunlu şartların en az
 * yarısı bilinecek. Yarı oranı, çok şartlı programlarda iki bilinen şartın
 * yeterli sayılmasını engelliyor (6 şartlı bir programda 2 bilinen = %33,
 * yüzde göstermeye yetmez).
 */
export const MIN_KNOWN_CHECKS = 2;

/** Tek bir programın şart uyumu. */
export interface FitSummary {
  /** 0-100, yuvarlanmış. Kabul olasılığı DEĞİL. `reliable` false ise gösterilmez. */
  percent: number;
  /** Karşılanan zorunlu şart sayısı. */
  met: number;
  /** Yüzdenin paydası: bildiğimiz zorunlu şart sayısı. */
  total: number;
  /** Programın TÜM zorunlu şart sayısı (bilinmeyenler dahil) — oran için. */
  mandatoryTotal: number;
  /** Kaynak sayfanın yayınlamadığı zorunlu şart sayısı — paydaya girmez. */
  unknownFromSource: number;
  /** Öğrencinin bilgi girmediği zorunlu şart sayısı — paydaya girer. */
  unknownFromStudent: number;
  /** Uyum hiç hesaplanamıyor mu (bildiğimiz zorunlu şart yok). */
  unknownOnly: boolean;
  /**
   * Yüzde gösterilebilir mi? Şartların çok azını biliyorsak false olur ve
   * arayüz sayı yerine "veri yetersiz" gösterir. Ortalamalar da bu programı
   * dışarıda bırakıyor.
   */
  reliable: boolean;
}

export function fitSummary(result: MatchResult): FitSummary {
  const mandatory = result.checks.filter((c) => c.mandatory);

  const unknownFromSource = mandatory.filter(
    (c) => c.status === "unknown" && c.unknownReason === "source"
  ).length;
  const unknownFromStudent = mandatory.filter(
    (c) => c.status === "unknown" && c.unknownReason !== "source"
  ).length;

  // Payda: bildiğimiz şartlar. Kaynak boşlukları dışarıda.
  const total = mandatory.length - unknownFromSource;
  const met = mandatory.filter((c) => c.status === "met").length;

  return {
    // Bildiğimiz hiç zorunlu şart kalmadıysa yüzde uydurmuyoruz; arayüz
    // "hesaplanamıyor" gösteriyor. 100 demek "her şeyi karşılıyorsun" olurdu.
    percent: total === 0 ? 0 : Math.round((met / total) * 100),
    met,
    total,
    mandatoryTotal: mandatory.length,
    unknownFromSource,
    unknownFromStudent,
    unknownOnly: total === 0,
    reliable: total >= MIN_KNOWN_CHECKS && total * 2 >= mandatory.length,
  };
}

/**
 * Uyuma göre sırala; EŞİTLİKTE DAHA ÇOK ŞARTINI BİLDİĞİMİZ ÖNE GEÇER.
 *
 * Neden gerekli: kaynak boşluklarını paydadan düşürdüğümüz için, şartlarının
 * yalnızca ikisini bildiğimiz bir program "2/2 → %100" olabiliyor ve hakkında
 * neredeyse hiçbir şey bilmediğimiz hâlde listenin başına çıkıyor. Yüzde
 * dürüst ama sıralama yanıltıcı olur. İkinci ölçüt bunu düzeltiyor: aynı
 * yüzdede, hakkında daha çok şey bildiğimiz program önce gelir.
 *
 * Uyumu hiç hesaplanamayanlar (bildiğimiz zorunlu şart yok) en sona.
 */
export function compareByFit(a: MatchResult, b: MatchResult): number {
  const fa = fitSummary(a);
  const fb = fitSummary(b);

  // Yüzdesi gösterilemeyen programlar (hiç bilinen şart yok ya da çok az)
  // listenin sonuna. Aksi hâlde "1/1 → %100" bir program, altı şartın altısını
  // karşılayan programın ÜSTÜNE çıkıyordu — ölçülmüş bir uyumun önüne
  // ölçülmemiş bir tahmin geçmiş olurdu.
  if (fa.reliable !== fb.reliable) return fa.reliable ? -1 : 1;
  if (fb.percent !== fa.percent) return fb.percent - fa.percent;
  return fb.total - fa.total;
}

export interface UniversityGroup {
  university: string;
  universityLocal?: string;
  city: string;
  country: CountryCode;
  /** Bu üniversitenin katalogdaki programları, uyuma göre azalan. */
  results: MatchResult[];
  /** Programların uyum ortalaması. */
  averagePercent: number;
  /** En iyi uyumlu programın yüzdesi — sıralama bunu kullanıyor. */
  bestPercent: number;
  /**
   * Yüzdeyi GÖSTEREBİLİR MİYİZ? Hiçbir programın şartlarını yeterince
   * bilmiyorsak false ve arayüz sayı yerine "—" koyuyor. `bestPercent === 0`
   * ile ayırt etmek gerekiyordu: sıfır, "hiçbir şartı karşılamıyor" da
   * olabilir ve ikisini aynı göstermek öğrenci hakkında yanlış bir iddia.
   */
  hasReliableFit: boolean;
  /**
   * Üniversite kaydı: resmî site adresi ve kısa tanıtım (`universities.ts`).
   * Adı katalogda olup burada karşılığı olmayan bir üniversite kalırsa
   * undefined gelir — `npm run check:data` bunu ihlal olarak yakalıyor.
   */
  meta?: University;
  /** Fakülte/bölüm sayfası — kurumun kendisi değil, programlardan geliyor. */
  facultyLink?: string;
  verifiedCount: number;
  /** En iyi uyumlu programda kaç zorunlu şartı biliyoruz — eşitlik bozucu. */
  knownAtBest: number;
}

export interface CountryGroup {
  country: CountryCode;
  universities: UniversityGroup[];
  programCount: number;
  averagePercent: number;
  bestPercent: number;
  /** bkz. UniversityGroup.hasReliableFit */
  hasReliableFit: boolean;
  verifiedCount: number;
}

/**
 * Sonuçları ülke → üniversite → program olarak grupla.
 *
 * SIRALAMA KARARI: hem ülkeler hem üniversiteler EN İYİ uyuma göre sıralanıyor,
 * ortalamaya göre değil. Sebep: öğrenci "bu ülkede bana en uygun şey ne?"
 * sorusunu soruyor. Ortalamaya göre sıralamak, içinde bir mükemmel eşleşme
 * olan ülkeyi zayıf programları yüzünden aşağı iter — tam olarak öğrencinin
 * görmek istediği şeyi saklar. Ortalama yine gösteriliyor, sadece sıralamayı
 * belirlemiyor.
 */
export function groupByCountry(results: MatchResult[]): CountryGroup[] {
  const byCountry = new Map<CountryCode, Map<string, MatchResult[]>>();

  for (const result of results) {
    const { country, university } = result.program;
    let universities = byCountry.get(country);
    if (!universities) {
      universities = new Map();
      byCountry.set(country, universities);
    }
    const list = universities.get(university);
    if (list) list.push(result);
    else universities.set(university, [result]);
  }

  const average = (values: number[]) =>
    values.length === 0 ? 0 : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const countries: CountryGroup[] = [];

  for (const [country, universityMap] of byCountry) {
    const universities: UniversityGroup[] = [];

    for (const [university, list] of universityMap) {
      const sorted = [...list].sort(compareByFit);
      // Uyumu HESAPLANAMAYAN programlar ortalamaya girmiyor. Girerse 0 olarak
      // sayılır ve üniversiteyi olduğundan kötü gösterir — oysa bilmediğimiz
      // şey öğrencinin uyumsuzluğu değil, bizim veri boşluğumuz.
      // Yalnızca GÜVENİLİR yüzdeler ortalamaya ve "en iyi"ye giriyor. Tek
      // bilinen şarta dayanan bir %100, üniversitenin başlığında dev puntoyla
      // "%100" yazdırıyordu; o sayı ölçüm değil gürültüydü.
      const percents = sorted.map(fitSummary).filter((f) => f.reliable).map((f) => f.percent);
      const first = sorted[0].program;

      universities.push({
        university,
        universityLocal: first.universityLocal,
        city: first.city,
        country,
        results: sorted,
        averagePercent: average(percents),
        bestPercent: percents.length === 0 ? 0 : Math.max(...percents),
        hasReliableFit: percents.length > 0,
        meta: getUniversity(university),
        // Programların içinde ilk bulunan fakülte bağlantısı. Resmî kurum
        // adresi `meta.officialUrl`'de; bu ikisi farklı şeyler.
        facultyLink: sorted.find((r) => r.program.facultyUrl)?.program.facultyUrl,
        verifiedCount: sorted.filter((r) => r.program.verification === "verified").length,
        knownAtBest: fitSummary(sorted[0]).total,
      });
    }

    // Aynı gerekçe program sıralamasındaki gibi: eşit uyumda hakkında daha çok
    // şey bildiğimiz üniversite önce.
    universities.sort((a, b) =>
      b.bestPercent !== a.bestPercent
        ? b.bestPercent - a.bestPercent
        : b.knownAtBest - a.knownAtBest
    );

    const allResults = universities.flatMap((u) => u.results);
    const allPercents = allResults
      .map(fitSummary)
      .filter((f) => f.reliable)
      .map((f) => f.percent);

    countries.push({
      country,
      universities,
      // Program sayısı TÜM programlar — uyumu hesaplanamayanlar da katalogda var
      // ve öğrenci onları da görmeli.
      programCount: allResults.length,
      averagePercent: average(allPercents),
      bestPercent: allPercents.length === 0 ? 0 : Math.max(...allPercents),
      hasReliableFit: allPercents.length > 0,
      verifiedCount: universities.reduce((sum, u) => sum + u.verifiedCount, 0),
    });
  }

  countries.sort((a, b) => b.bestPercent - a.bestPercent);
  return countries;
}
