import { createHash } from "node:crypto";
import type { Program } from "./types";

/**
 * Beyond — kaynak sayfa değişiklik dedektörü.
 *
 * Amaç: üniversite sayfasındaki şartlar değiştiğinde bunu FARK ETMEK.
 *
 * Bilinçli olarak AI kullanmıyor. İki sebep:
 *  1. Ücretsiz ve kotasız çalışıyor, demo sırasında hiçbir şeye bağımlı değil.
 *  2. Daha dürüst: "sayfa değişti, katalogdaki 6.5 artık sayfada geçmiyor"
 *     doğrulanabilir bir iddia. AI'ın "şart 7.0 oldu" demesi ise güven ister.
 *
 * Dedektör HİÇBİR ZAMAN katalogu kendiliğinden değiştirmez. Yalnızca
 * "burada bir fark var, kontrol et" der. Otomatik güncelleme, yanlış
 * okunan bir sayfanın sessizce yanlış veri yazması demek olurdu.
 */

// ---------------------------------------------------------------------------
// Sayfa parmak izi
// ---------------------------------------------------------------------------

/**
 * Sayfanın şartlarla ilgili kısmının kararlı bir özeti.
 *
 * Ham metnin hash'ini almak işe yaramaz: tarih damgaları, çerez metinleri,
 * "şu an X kişi bakıyor" gibi öğeler her istekte değişir ve her seferinde
 * "değişti" alarmı üretir. O yüzden önce gürültüyü temizliyoruz.
 */
export function fingerprint(text: string): string {
  const normalized = text
    .toLowerCase()
    // Tarih ve saat damgaları
    .replace(/\d{1,2}[:.]\d{2}(:\d{2})?/g, " ")
    .replace(/\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}/g, " ")
    // Oturum kimlikleri / uzun rakam dizileri
    .replace(/\b[a-f0-9]{16,}\b/g, " ")
    // Çerez ve gezinme gürültüsü
    .replace(/cookie[s]?[^\n]{0,120}/g, " ")
    .replace(/\b(menu|navigation|skip to|search|login|share|print)\b/g, " ")
    .replace(/[^a-z0-9€£$.,%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

// ---------------------------------------------------------------------------
// Sayısal sinyaller
// ---------------------------------------------------------------------------

export interface PageSignals {
  ielts: number[];
  toefl: number[];
  /** EUR/GBP/CHF cinsinden bulunan tutarlar (yaklaşık, para birimi ayrımı yok). */
  amounts: number[];
  /** "15 January", "1 March" gibi bulunan tarihler — "AA-GG" biçiminde. */
  dates: string[];
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

/**
 * Sayfadan kalıplı değerleri çeker.
 *
 * Bu alanlar bilinçli seçildi: dil sınavı puanları, para tutarları ve
 * tarihler kalıplı yazılıyor, yani serbest metin yorumu gerektirmiyor.
 * "Motivasyon mektubu isteniyor mu" gibi alanlar düzenli ifadeyle
 * güvenilir çıkarılamaz, o yüzden hiç denemiyoruz.
 */
export function extractSignals(text: string): PageSignals {
  const ielts: number[] = [];
  // "IELTS ... 6.5" — arada "Academic", "overall", "minimum" gibi kelimeler olabilir.
  for (const m of text.matchAll(/IELTS[^\d\n]{0,60}?(\d(?:[.,]\d)?)/gi)) {
    const value = Number(m[1].replace(",", "."));
    if (value >= 4 && value <= 9) ielts.push(value);
  }

  const toefl: number[] = [];
  for (const m of text.matchAll(/TOEFL[^\d\n]{0,60}?(\d{2,3})/gi)) {
    const value = Number(m[1]);
    if (value >= 40 && value <= 120) toefl.push(value);
  }

  const amounts: number[] = [];
  // "€ 12.345", "EUR 12,345", "12.345 EUR", "£33,000"
  const moneyPatterns = [
    /(?:€|EUR|£|GBP|CHF|SEK|DKK)\s?([\d][\d.,]{2,12})/gi,
    /([\d][\d.,]{2,12})\s?(?:€|EUR|£|GBP|CHF|SEK|DKK)/gi,
  ];
  for (const pattern of moneyPatterns) {
    for (const m of text.matchAll(pattern)) {
      // "12.345" (Avrupa binlik) ve "12,345" (İngiliz binlik) ikisi de olabilir.
      const raw = m[1].replace(/[.,](?=\d{3}\b)/g, "");
      const value = Number(raw.replace(",", "."));
      if (Number.isFinite(value) && value >= 100 && value <= 200_000) {
        amounts.push(Math.round(value));
      }
    }
  }

  const dates: string[] = [];
  // "15 January" ve "January 15"
  for (const m of text.matchAll(
    /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi
  )) {
    dates.push(`${String(MONTHS[m[2].toLowerCase()]).padStart(2, "0")}-${m[1].padStart(2, "0")}`);
  }
  for (const m of text.matchAll(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/gi
  )) {
    dates.push(`${String(MONTHS[m[1].toLowerCase()]).padStart(2, "0")}-${m[2].padStart(2, "0")}`);
  }

  return {
    ielts: uniqueSorted(ielts),
    toefl: uniqueSorted(toefl),
    amounts: uniqueSorted(amounts),
    dates: [...new Set(dates)].sort(),
  };
}

// ---------------------------------------------------------------------------
// Katalog ile karşılaştırma
// ---------------------------------------------------------------------------

export interface Discrepancy {
  field: "ielts" | "toefl" | "tuition" | "deadline";
  /** Katalogdaki değer. */
  catalog: string;
  /** Sayfada bulunan değerler. */
  found: string[];
}

/**
 * Katalog değerini sayfada bulunan değerlerle karşılaştırır.
 *
 * Kural bilinçli olarak zayıf: sadece "katalogdaki değer sayfada HİÇ geçmiyor"
 * durumunu bildiriyoruz. "Sayfada 7.0 var, demek ki şart 7.0 oldu" demiyoruz —
 * sayfada birden fazla program veya birden fazla sınav türü olabilir.
 * Bu, yanlış alarmı azaltıyor ve iddiayı doğrulanabilir tutuyor.
 */
export function findDiscrepancies(program: Program, signals: PageSignals): Discrepancy[] {
  const out: Discrepancy[] = [];

  // Katalogda değer yoksa karşılaştırılacak bir iddia da yok. Bilinmeyen alan
  // için "sayfada farklı yazıyor" demek anlamsız — neyden farklı olduğunu
  // bilmiyoruz. Bu alanlar dedektörün değil, doğrulama turunun işi.
  const langReqs = program.requirements.language ?? [];

  const ieltsReq = langReqs.find((l) => l.test === "ielts");
  if (ieltsReq && signals.ielts.length > 0 && !signals.ielts.includes(ieltsReq.min)) {
    out.push({
      field: "ielts",
      catalog: String(ieltsReq.min),
      found: signals.ielts.map(String),
    });
  }

  const toeflReq = langReqs.find((l) => l.test === "toefl");
  if (toeflReq && signals.toefl.length > 0 && !signals.toefl.includes(toeflReq.min)) {
    out.push({
      field: "toefl",
      catalog: String(toeflReq.min),
      found: signals.toefl.map(String),
    });
  }

  // Harçta tam eşleşme aramak gerçekçi değil (yuvarlama, farklı yıl tarifeleri).
  // %10 tolerans içinde bir tutar varsa sorun yok sayıyoruz.
  const target = program.tuitionNonEu;
  if (signals.amounts.length > 0 && target !== undefined) {
    const close = signals.amounts.some((a) => Math.abs(a - target) <= target * 0.1);
    if (!close) {
      // Sadece harca benzer büyüklükteki tutarları göster; 100 EUR'luk
      // başvuru ücretleri gürültü yaratmasın.
      const plausible = signals.amounts.filter((a) => a >= 500);
      if (plausible.length > 0) {
        out.push({
          field: "tuition",
          catalog: String(target),
          found: plausible.map(String),
        });
      }
    }
  }

  // Tarihte yalnızca ODAKLI sayfalarda uyarı veriyoruz.
  //
  // Katalog/liste sayfalarında onlarca tarih geçiyor (haberler, etkinlikler,
  // başka programların dönemleri) ve hepsini "son tarih değişmiş olabilir"
  // diye bildirmek kullanıcıyı gürültüye boğuyor — ilk taramada tam da bu
  // oldu. Sayfada en fazla iki farklı tarih varsa o sayfa tek bir programa
  // odaklıdır ve bulunan tarih anlamlı bir sinyaldir.
  const FOCUSED_PAGE_MAX_DATES = 2;
  if (
    signals.dates.length > 0 &&
    signals.dates.length <= FOCUSED_PAGE_MAX_DATES &&
    !signals.dates.includes(program.deadline)
  ) {
    out.push({
      field: "deadline",
      catalog: program.deadline,
      found: signals.dates,
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Kayıt biçimi (src/data/source-checks.json)
// ---------------------------------------------------------------------------

export type CheckStatus = "ok" | "changed" | "unreachable";

export interface SourceCheck {
  programId: string;
  status: CheckStatus;
  /** Sayfa parmak izi — bir sonraki taramada bununla karşılaştırılıyor. */
  fingerprint: string;
  /**
   * Parmak izinin ALINDIĞI adres.
   *
   * Parmak izi tek başına anlamlı değil: katalogdaki sourceUrl değişirse yeni
   * sayfanın parmak izi eskisinden zorunlu olarak farklı çıkar ve dedektör
   * bunu "üniversite sayfasını güncelledi" sanır. Oysa değişen şey bizim
   * linkimiz. Adresi de saklayıp karşılaştırma yaparak bu yalancı alarmı
   * kesiyoruz — link düzeltme turunda 21 kayıt birden "Kaynak sayfa değişti"
   * rozeti göstermesin.
   */
  sourceUrl?: string;
  /** Parmak izinin en son değiştiği tarih (ISO). */
  changedAt: string | null;
  /** Son tarama tarihi (ISO). */
  checkedAt: string;
  discrepancies: Discrepancy[];
  /** Sayfaya ulaşılamadıysa sebebi. */
  error?: string;
}

export interface SourceCheckFile {
  generatedAt: string;
  checks: Record<string, SourceCheck>;
}
