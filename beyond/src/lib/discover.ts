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

/** Tek bir programın şart uyumu. */
export interface FitSummary {
  /** 0-100, yuvarlanmış. Kabul olasılığı DEĞİL. */
  percent: number;
  /** Karşılanan zorunlu şart sayısı. */
  met: number;
  /** Yüzdenin paydası: bildiğimiz zorunlu şart sayısı. */
  total: number;
  /** Kaynak sayfanın yayınlamadığı zorunlu şart sayısı — paydaya girmez. */
  unknownFromSource: number;
  /** Öğrencinin bilgi girmediği zorunlu şart sayısı — paydaya girer. */
  unknownFromStudent: number;
  /** Uyum hiç hesaplanamıyor mu (bildiğimiz zorunlu şart yok). */
  unknownOnly: boolean;
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
    unknownFromSource,
    unknownFromStudent,
    unknownOnly: total === 0,
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

  if (fa.unknownOnly !== fb.unknownOnly) return fa.unknownOnly ? 1 : -1;
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
  /**
   * Programların uyum ortalaması. null = hiçbir programın uyumu
   * hesaplanamadı (hepsi `unknownOnly`) — "bilmiyoruz" ile "%0" AYNI ŞEY
   * DEĞİL, o yüzden burada da 0'a düşmüyoruz. Arayüz null'u ayrı göstermeli.
   */
  averagePercent: number | null;
  /**
   * En iyi uyumlu programın yüzdesi — sıralama bunu kullanıyor. null = bu
   * üniversitenin hiçbir programının uyumu hesaplanamadı.
   */
  bestPercent: number | null;
  /** Elimizdeki en iyi kurumsal bağlantı (bkz. dosya başlığı). */
  link?: string;
  verifiedCount: number;
  /** En iyi uyumlu programda kaç zorunlu şartı biliyoruz — eşitlik bozucu. */
  knownAtBest: number;
}

export interface CountryGroup {
  country: CountryCode;
  universities: UniversityGroup[];
  programCount: number;
  /** null = bu ülkedeki hiçbir programın uyumu hesaplanamadı. */
  averagePercent: number | null;
  /** null = bu ülkedeki hiçbir programın uyumu hesaplanamadı. */
  bestPercent: number | null;
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

  // null = hesaplanacak değer yok. 0 dönersek "hesapladık ve sıfır çıktı"
  // ile "hiç hesaplayamadık" karışır — tam da bu dosyanın kaçınmaya
  // çalıştığı hata, burada da yapmıyoruz.
  const average = (values: number[]): number | null =>
    values.length === 0 ? null : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const countries: CountryGroup[] = [];

  for (const [country, universityMap] of byCountry) {
    const universities: UniversityGroup[] = [];

    for (const [university, list] of universityMap) {
      const sorted = [...list].sort(compareByFit);
      // Uyumu HESAPLANAMAYAN programlar ortalamaya girmiyor. Girerse 0 olarak
      // sayılır ve üniversiteyi olduğundan kötü gösterir — oysa bilmediğimiz
      // şey öğrencinin uyumsuzluğu değil, bizim veri boşluğumuz.
      const percents = sorted.map(fitSummary).filter((f) => !f.unknownOnly).map((f) => f.percent);
      const first = sorted[0].program;

      universities.push({
        university,
        universityLocal: first.universityLocal,
        city: first.city,
        country,
        results: sorted,
        averagePercent: average(percents),
        bestPercent: percents.length === 0 ? null : Math.max(...percents),
        // Programların içinde ilk bulunan fakülte bağlantısı.
        link: sorted.find((r) => r.program.facultyUrl)?.program.facultyUrl,
        verifiedCount: sorted.filter((r) => r.program.verification === "verified").length,
        knownAtBest: fitSummary(sorted[0]).total,
      });
    }

    // Aynı gerekçe program sıralamasındaki gibi: eşit uyumda hakkında daha çok
    // şey bildiğimiz üniversite önce. bestPercent null olanlar (hiçbir programı
    // hesaplanamayan üniversiteler) compareByFit'teki unknownOnly gibi en sona.
    universities.sort((a, b) => {
      if (a.bestPercent === null || b.bestPercent === null) {
        if (a.bestPercent === b.bestPercent) return 0;
        return a.bestPercent === null ? 1 : -1;
      }
      return b.bestPercent !== a.bestPercent
        ? b.bestPercent - a.bestPercent
        : b.knownAtBest - a.knownAtBest;
    });

    const allResults = universities.flatMap((u) => u.results);
    const allPercents = allResults
      .map(fitSummary)
      .filter((f) => !f.unknownOnly)
      .map((f) => f.percent);

    countries.push({
      country,
      universities,
      // Program sayısı TÜM programlar — uyumu hesaplanamayanlar da katalogda var
      // ve öğrenci onları da görmeli.
      programCount: allResults.length,
      averagePercent: average(allPercents),
      bestPercent: allPercents.length === 0 ? null : Math.max(...allPercents),
      verifiedCount: universities.reduce((sum, u) => sum + u.verifiedCount, 0),
    });
  }

  // bestPercent null olan ülkeler (hiçbir programı hesaplanamayan) en sona —
  // universities.sort'taki null muamelesiyle aynı gerekçe.
  countries.sort((a, b) => {
    if (a.bestPercent === null || b.bestPercent === null) {
      if (a.bestPercent === b.bestPercent) return 0;
      return a.bestPercent === null ? 1 : -1;
    }
    return b.bestPercent - a.bestPercent;
  });
  return countries;
}
