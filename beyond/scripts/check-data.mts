/**
 * Beyond — katalog bekçisi.
 *
 *   npm run check:data
 *
 * `check-sources` KAYNAK SAYFAYI katalogla karşılaştırır (ağ ister, sonucu
 * rozete yazar). Bu betik ise KATALOGUN KENDİ İÇİNİ kontrol eder: ağ yok,
 * yorum yok, sadece değişmezler. İkisi farklı iş, biri diğerini kapsamıyor.
 *
 * 36 kayıt elle sürdürülüyor; buradaki kurallar sessiz bozulmayı yakalamak
 * için. İhlal varsa çıkış kodu 1 — commit'ten önce çalıştır.
 *
 * KURAL SEÇİMİNİN MANTIĞI: her kontrol, arayüzde ya da motorda gerçekten
 * kırılan bir şeyi koruyor. "Güzel olurdu" diye kural eklenmedi; eklenirse
 * betik gürültü üretir ve insanlar onu çalıştırmayı bırakır.
 */

import { PROGRAMS } from "../src/data/programs.js";
import {
  APPLICATION_SYSTEMS,
  COUNTRIES,
  FIELDS,
  TEACHING_LANGUAGE_LABEL,
} from "../src/data/taxonomy.js";
import {
  LANGUAGE_TEST_SCALES,
  STANDARDIZED_TEST_SCALES,
} from "../src/data/options.js";
import type {
  Bilingual,
  Currency,
  ExtraRequirementKey,
  Program,
  ScholarshipKind,
  Subject,
} from "../src/lib/types.js";

// ---------------------------------------------------------------------------
// Taksonomide karşılığı olmayan birlikler
//
// COUNTRIES/FIELDS gibi bir kayıt tablosu olmayan union'lar için geçerli
// değerleri burada sayıyoruz. `Record<Birlik, true>` yazmanın sebebi:
// types.ts'e yeni bir anahtar eklenirse buradaki tablo eksik kalır ve
// `npm run build` (tsconfig `**/*.mts`'yi de derliyor) hata verir. Yani liste
// sessizce eskiyemez.
// ---------------------------------------------------------------------------

const EXTRA_KEYS: Record<ExtraRequirementKey, true> = {
  portfolio: true,
  interview: true,
  "entrance-exam": true,
  "motivation-letter": true,
  "numerus-fixus": true,
  "recommendation-letter": true,
};

const DEGREES: Record<Program["degree"], true> = {
  BSc: true,
  BA: true,
  BEng: true,
  LLB: true,
  MD: true,
  "Diplôme": true,
};

const CURRENCIES: Record<Currency, true> = {
  EUR: true,
  GBP: true,
  SEK: true,
  DKK: true,
  CHF: true,
};

const SCHOLARSHIP_KINDS: Record<ScholarshipKind, true> = {
  "tuition-waiver": true,
  grant: true,
  merit: true,
  "need-based": true,
};

const SUBJECTS: Record<Subject, true> = {
  math: true,
  physics: true,
  chemistry: true,
  biology: true,
};

// ---------------------------------------------------------------------------
// İhlal toplayıcı
// ---------------------------------------------------------------------------

interface Problem {
  programId: string;
  field: string;
  message: string;
}

const problems: Problem[] = [];

function fail(programId: string, field: string, message: string) {
  problems.push({ programId, field, message });
}

/** Kullanıcıya görünen her metin TR ve EN dolu olmalı — yarım çeviri boş hücre. */
function checkBilingual(
  programId: string,
  field: string,
  value: Bilingual | undefined
) {
  if (!value) return;
  if (!value.tr?.trim()) fail(programId, field, "TR metni boş");
  if (!value.en?.trim()) fail(programId, field, "EN metni boş");
}

/** http(s) ile başlıyor mu ve ayrıştırılabiliyor mu. */
function checkUrl(programId: string, field: string, url: string): URL | null {
  if (!/^https?:\/\//.test(url)) {
    fail(programId, field, `http(s):// ile başlamıyor — "${url}"`);
    return null;
  }
  try {
    return new URL(url);
  } catch {
    fail(programId, field, `geçersiz URL — "${url}"`);
    return null;
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_DAY = /^\d{2}-\d{2}$/;

/** Betiğin çalıştığı gün, YYYY-MM-DD (yerel saat). */
function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const TODAY = today();

// ---------------------------------------------------------------------------
// Kontroller
// ---------------------------------------------------------------------------

const seenIds = new Map<string, number>();

PROGRAMS.forEach((program, index) => {
  const id = program.id || `#${index}`;

  // --- id ------------------------------------------------------------------
  // Aynı id iki kayıtta olursa /program/[id] yanlış kaydı açar; sessiz hata.
  if (!program.id?.trim()) {
    fail(id, "id", "boş");
  } else if (seenIds.has(program.id)) {
    fail(id, "id", `tekrar ediyor (ilk görüldüğü sıra: ${seenIds.get(program.id)})`);
  } else {
    seenIds.set(program.id, index);
  }

  // --- taksonomi -----------------------------------------------------------
  // Tanımsız değer arayüzde boş hücre bırakır: bayrak, alan ikonu ve başvuru
  // sistemi kartı bu tablolardan okunuyor.
  if (!COUNTRIES[program.country]) {
    fail(id, "country", `taksonomide yok — "${program.country}"`);
  }
  if (!FIELDS[program.field]) {
    fail(id, "field", `taksonomide yok — "${program.field}"`);
  }
  if (!APPLICATION_SYSTEMS[program.applicationSystem]) {
    fail(id, "applicationSystem", `taksonomide yok — "${program.applicationSystem}"`);
  }
  if (!TEACHING_LANGUAGE_LABEL[program.teachingLanguage]) {
    fail(id, "teachingLanguage", `etiketi yok — "${program.teachingLanguage}"`);
  }
  if (!DEGREES[program.degree]) {
    fail(id, "degree", `tanımlı değil — "${program.degree}"`);
  }

  // id öneki ülke koduyla uyuşmalı: `it-` ile başlayan kaydın country'si IT
  // olmalı. Yeni kayıtlar mevcut bir kaydı kopyalayarak ekleniyor ve country
  // güncellenmeden kalırsa program yanlış ülkenin listesinde çıkar — ülke
  // filtresi ve senaryo modu sessizce yanlış çalışır.
  const idPrefix = program.id?.split("-")[0]?.toUpperCase();
  if (idPrefix && program.country && idPrefix !== program.country) {
    fail(
      id,
      "id",
      `öneki "${idPrefix.toLowerCase()}" ama country "${program.country}" — kopyalanan kayıtta ülke güncellenmemiş olabilir`
    );
  }

  // Eğitim dili ile dil şartı çelişmemeli.
  //
  // GERÇEK VAKA: be-ghent-engineering katalogda "en" + IELTS 6.5 olarak
  // duruyordu, program sayfası ise "taught in Dutch" diyor. Türk öğrenci
  // İngilizce sanıp başvuracaktı. Kural yalnızca GÜÇLÜ sinyali yakalıyor —
  // listedeki sınavların TAMAMI ters dildeyse. Karma liste (İngilizce program
  // yerel dil sınavını da kabul ediyor) meşru, o yüzden işaretlenmiyor.
  const ENGLISH_TESTS = new Set(["ielts", "toefl", "duolingo", "cambridge"]);
  const tests = program.requirements.language ?? [];
  if (tests.length > 0) {
    const englishCount = tests.filter((t) => ENGLISH_TESTS.has(t.test)).length;
    if (program.teachingLanguage === "en" && englishCount === 0) {
      fail(
        id,
        "requirements.language",
        `eğitim dili İngilizce ama listedeki sınavların hiçbiri İngilizce değil — track karışmış olabilir`
      );
    }
    if (program.teachingLanguage !== "en" && englishCount === tests.length) {
      fail(
        id,
        "requirements.language",
        `eğitim dili "${program.teachingLanguage}" ama yalnızca İngilizce sınav isteniyor — Ghent'te tam bu hata vardı`
      );
    }
  }

  // --- metin alanları ------------------------------------------------------
  for (const field of ["university", "city", "name"] as const) {
    if (!program[field]?.trim()) fail(id, field, "boş");
  }
  if (!(program.durationYears > 0)) {
    fail(id, "durationYears", `pozitif olmalı — ${program.durationYears}`);
  }

  // --- kaynak linki --------------------------------------------------------
  const source = checkUrl(id, "sourceUrl", program.sourceUrl);
  if (source) {
    // ⭐ En az iki yol segmenti. Sebep: üniversite ana sayfası ya da "tüm
    // lisans programları" liste sayfası 200 döner, link "çalışıyor" görünür —
    // ama o sayfada bu programın not eşiği, dil barajı ve harcı YAZMAZ.
    // Doğrulama iddiası fiziken imkânsız hale gelir ve dedektör sayfadaki
    // başka programların sayılarını fark sanır. Bu kural o tuzağın tekrarını
    // engelliyor.
    const segments = source.pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
      fail(
        id,
        "sourceUrl",
        `programa özel değil, ${segments.length} yol segmenti — "${program.sourceUrl}"`
      );
    }
  }
  if (program.facultyUrl !== undefined) {
    checkUrl(id, "facultyUrl", program.facultyUrl);
  }

  // --- doğrulama rozeti ----------------------------------------------------
  if (!ISO_DATE.test(program.lastChecked)) {
    fail(id, "lastChecked", `YYYY-MM-DD bekleniyor — "${program.lastChecked}"`);
  } else if (program.lastChecked > TODAY) {
    // Kopyala-yapıştır hatası: gelecekteki tarih "daha yeni doğrulanmış" gibi
    // görünür ve rozet yalan söyler.
    fail(id, "lastChecked", `gelecek tarih — ${program.lastChecked} > ${TODAY}`);
  }
  if (program.verification === "verified" && !program.lastChecked?.trim()) {
    fail(id, "lastChecked", "verified kayıtta tarih yok — rozetin arkası boş");
  }

  // --- son tarih -----------------------------------------------------------
  // matching ve timeline bu formatı varsayıyor; bozuk değer sessizce yanlış
  // sıralanır.
  if (!MONTH_DAY.test(program.deadline)) {
    fail(id, "deadline", `AA-GG bekleniyor — "${program.deadline}"`);
  } else {
    const [month, day] = program.deadline.split("-").map(Number);
    if (month < 1 || month > 12) fail(id, "deadline", `ay geçersiz — ${month}`);
    if (day < 1 || day > 31) fail(id, "deadline", `gün geçersiz — ${day}`);
  }
  checkBilingual(id, "deadlineNote", program.deadlineNote);

  // --- para ----------------------------------------------------------------
  // ⭐ tuitionNonEu'da 0 yasak: eksik veriyi sıfır gibi göstermek sessiz bir
  // yalan olur ("Türk öğrenci harç ödemiyor" katalogdaki hiçbir kaynağın
  // söylemediği bir iddia). Bilinmiyorsa alan undefined kalır — bkz. types.ts
  // eksik veri sözleşmesi.
  //
  // tuitionEu'da 0 SERBEST, çünkü orada gerçek bir olgu: İsveç ve
  // Danimarka'da AB/AEA vatandaşı harç ödemiyor ve kayıtlar bunu kaynağından
  // söylüyor. Aynı sayı iki alanda iki farklı şey demek.
  if (program.tuitionNonEu !== undefined) {
    if (program.tuitionNonEu === 0) {
      fail(id, "tuitionNonEu", "0 yazılmış — bilinmiyorsa alanı undefined bırak");
    } else if (!(program.tuitionNonEu > 0) || !Number.isFinite(program.tuitionNonEu)) {
      fail(id, "tuitionNonEu", `pozitif sayı olmalı — ${program.tuitionNonEu}`);
    }
  }
  if (program.tuitionEu !== undefined) {
    if (!(program.tuitionEu >= 0) || !Number.isFinite(program.tuitionEu)) {
      fail(id, "tuitionEu", `0 veya pozitif olmalı — ${program.tuitionEu}`);
    }
  }
  if (!(program.livingCostPerYear > 0)) {
    fail(id, "livingCostPerYear", `pozitif olmalı — ${program.livingCostPerYear}`);
  }
  if (program.tuitionCurrency !== undefined && !CURRENCIES[program.tuitionCurrency]) {
    fail(id, "tuitionCurrency", `tanımlı değil — "${program.tuitionCurrency}"`);
  }

  // --- şartlar -------------------------------------------------------------
  const req = program.requirements;

  if (req.minGpa !== undefined) {
    if (req.minGpa === 0) {
      fail(id, "requirements.minGpa", "0 yazılmış — eşik yoksa alanı undefined bırak");
    } else if (!(req.minGpa > 0) || req.minGpa > 100) {
      // Ölçek karışması: 4'lük GPA ya da IB toplamı buraya yazılmış demektir.
      fail(id, "requirements.minGpa", `100'lük ölçekte 0-100 olmalı — ${req.minGpa}`);
    }
  }

  for (const lang of req.language ?? []) {
    const scale = LANGUAGE_TEST_SCALES[lang.test];
    if (!scale) {
      fail(id, "requirements.language", `bilinmeyen sınav — "${lang.test}"`);
      continue;
    }
    // IELTS'e 90 (TOEFL puanı) yazmayı yakalar.
    if (lang.min < scale.min || lang.min > scale.max) {
      fail(
        id,
        "requirements.language",
        `${scale.label} ölçeği ${scale.min}-${scale.max}, yazılan ${lang.min}`
      );
    } else if (lang.min <= 0) {
      fail(id, "requirements.language", `${scale.label} eşiği 0 — şart yoksa listeye yazma`);
    }
  }

  for (const test of req.standardizedTests ?? []) {
    const scale = STANDARDIZED_TEST_SCALES[test.test];
    if (!scale) {
      fail(id, "requirements.standardizedTests", `bilinmeyen sınav — "${test.test}"`);
      continue;
    }
    if (test.min < scale.min || test.min > scale.max) {
      fail(
        id,
        "requirements.standardizedTests",
        `${scale.label} ölçeği ${scale.min}-${scale.max}, yazılan ${test.min}`
      );
    }
  }

  for (const subject of req.requiredSubjects ?? []) {
    if (!SUBJECTS[subject.subject]) {
      fail(id, "requirements.requiredSubjects", `bilinmeyen ders — "${subject.subject}"`);
    }
    if (subject.level !== "basic" && subject.level !== "advanced") {
      fail(id, "requirements.requiredSubjects", `seviye basic/advanced olmalı — "${subject.level}"`);
    }
  }

  for (const extra of req.extras ?? []) {
    if (!EXTRA_KEYS[extra.key]) {
      fail(id, "requirements.extras", `bilinmeyen şart — "${extra.key}"`);
    }
    checkBilingual(id, `requirements.extras[${extra.key}].note`, extra.note);
  }

  // --- burslar -------------------------------------------------------------
  for (const [i, scholarship] of (program.scholarships ?? []).entries()) {
    const where = `scholarships[${i}]`;
    if (!scholarship.name?.trim()) fail(id, `${where}.name`, "boş");
    if (!SCHOLARSHIP_KINDS[scholarship.kind]) {
      fail(id, `${where}.kind`, `tanımlı değil — "${scholarship.kind}"`);
    }
    // Kaynaksız burs iddiası = uydurma veri. Öğrenci var olmayan bir paraya
    // güvenerek plan yapar; bu, yanlış harçtan daha pahalıya patlar.
    if (!scholarship.sourceUrl?.trim()) {
      fail(id, `${where}.sourceUrl`, "boş — kaynaksız burs kaydı olamaz");
    } else {
      checkUrl(id, `${where}.sourceUrl`, scholarship.sourceUrl);
    }
    if (scholarship.amountPerYear !== undefined && !(scholarship.amountPerYear > 0)) {
      fail(
        id,
        `${where}.amountPerYear`,
        `pozitif olmalı, tutar belirsizse alanı boş bırak — ${scholarship.amountPerYear}`
      );
    }
    checkBilingual(id, `${where}.note`, scholarship.note);
  }
});

// ---------------------------------------------------------------------------
// Rapor
// ---------------------------------------------------------------------------

if (problems.length > 0) {
  let current = "";
  for (const problem of problems) {
    if (problem.programId !== current) {
      current = problem.programId;
      console.error(`\n  ${current}`);
    }
    console.error(`    ✗ ${problem.field}: ${problem.message}`);
  }
  const affected = new Set(problems.map((p) => p.programId)).size;
  console.error(
    `\n${problems.length} ihlal · ${affected}/${PROGRAMS.length} kayıt etkilendi\n`
  );
  process.exit(1);
}

const verified = PROGRAMS.filter((p) => p.verification === "verified").length;
console.log(
  `✓ ${PROGRAMS.length} kayıt, ihlal yok · ${verified} tanesi kaynağından doğrulanmış`
);
