/**
 * Katalogun İÇ TUTARLILIĞINI denetler.
 *
 * `check-sources` sayfayı katalogla karşılaştırır — dışa bakar.
 * Bu betik katalogun kendi içine bakar: ölçek dışı puan, tanımsız taksonomi
 * değeri, tekrar eden id, gelecek tarihli doğrulama, yüzeysel kaynak linki.
 *
 * 42 kayıt elle sürdürülüyor ve bugüne kadar bulunan hataların hepsi
 * (yanlış son tarih, yanlış para birimi, yanlış eğitim dili) TEK TEK GÖZLE
 * bulundu. Gözle bulunan hata tekrar eder; betikle bulunan etmez.
 *
 *   npm run check-data
 *
 * İhlal varsa sıfırdan farklı çıkar, böylece CI'da da kullanılabilir.
 */
import { PROGRAMS } from "../src/data/programs.js";
import { LANGUAGE_TEST_SCALES, STANDARDIZED_TEST_SCALES } from "../src/data/options.js";
import { COUNTRIES, FIELDS, APPLICATION_SYSTEMS } from "../src/data/taxonomy.js";

const errors: string[] = [];
const warnings: string[] = [];

const err = (id: string, msg: string) => errors.push(`${id}: ${msg}`);
const warn = (id: string, msg: string) => warnings.push(`${id}: ${msg}`);

const TODAY = "2026-08-14"; // sabit: Date.now() kullanmıyoruz, çıktı deterministik kalsın

const seen = new Set<string>();

for (const p of PROGRAMS) {
  // --- kimlik -------------------------------------------------------------
  if (seen.has(p.id)) err(p.id, "id TEKRAR EDİYOR — program/[id] yanlış kaydı açar");
  seen.add(p.id);

  // id öneki ülke koduyla uyuşmalı: it-* kaydı IT olmalı. Kopyala-yapıştırla
  // eklenen kayıtta en sık kaçan hata bu.
  const prefix = p.id.split("-")[0]?.toUpperCase();
  if (prefix && prefix !== p.country) {
    err(p.id, `id öneki "${prefix.toLowerCase()}" ama country "${p.country}"`);
  }

  // --- taksonomi ----------------------------------------------------------
  if (!COUNTRIES[p.country]) err(p.id, `country "${p.country}" taksonomide yok`);
  if (!FIELDS[p.field]) err(p.id, `field "${p.field}" taksonomide yok`);
  if (!APPLICATION_SYSTEMS[p.applicationSystem]) {
    err(p.id, `applicationSystem "${p.applicationSystem}" taksonomide yok`);
  }

  // --- kaynak linki -------------------------------------------------------
  // Demo 4. adımında jüri bu linke tıklıyor. Üniversite ana sayfasına düşen
  // link, rozetten daha kötü: iddiayı çürütüyor.
  for (const [field, url] of [
    ["sourceUrl", p.sourceUrl],
    ["facultyUrl", p.facultyUrl],
  ] as const) {
    if (!url) continue;
    if (!/^https:\/\//.test(url)) err(p.id, `${field} https ile başlamıyor: ${url}`);
    try {
      const segs = new URL(url).pathname.split("/").filter(Boolean);
      if (field === "sourceUrl" && segs.length < 2) {
        err(p.id, `sourceUrl programa özel değil (yol ${segs.length} parça): ${url}`);
      }
    } catch {
      err(p.id, `${field} geçerli bir adres değil: ${url}`);
    }
  }

  // --- doğrulama rozeti ---------------------------------------------------
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.lastChecked)) {
    err(p.id, `lastChecked YYYY-AA-GG formatında değil: ${p.lastChecked}`);
  } else if (p.lastChecked > TODAY) {
    err(p.id, `lastChecked gelecekte: ${p.lastChecked}`);
  }

  // --- son tarih ----------------------------------------------------------
  const m = /^(\d{2})-(\d{2})$/.exec(p.deadline);
  if (!m) {
    err(p.id, `deadline AA-GG formatında değil: ${p.deadline}`);
  } else {
    const mo = Number(m[1]);
    const day = Number(m[2]);
    const maxDay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
    if (mo < 1 || mo > 12) err(p.id, `deadline ayı geçersiz: ${p.deadline}`);
    else if (day < 1 || day > maxDay) err(p.id, `deadline günü geçersiz: ${p.deadline}`);
  }

  // --- notlar ve para ------------------------------------------------------
  const gpa = p.requirements.minGpa;
  if (gpa !== undefined && (gpa < 0 || gpa > 100)) {
    err(p.id, `minGpa 0-100 dışında: ${gpa} (bu alan 100'lük ölçek bekliyor)`);
  }
  if (gpa === 0) err(p.id, "minGpa 0 — eksik veriyi sıfır gibi göstermek sessiz yalan, undefined kullan");

  for (const [field, v] of [
    ["tuitionNonEu", p.tuitionNonEu],
    ["tuitionEu", p.tuitionEu],
  ] as const) {
    if (v !== undefined && v < 0) err(p.id, `${field} negatif: ${v}`);
  }
  if (p.livingCostPerYear <= 0) err(p.id, "livingCostPerYear pozitif olmalı");

  // Para birimi yazılmış ama iki harç da boşsa bilgi taşımıyor — hata değil,
  // ama kaydın eksik olduğunu hatırlatıyor.
  if (p.tuitionCurrency && p.tuitionNonEu === undefined && p.tuitionEu === undefined) {
    warn(p.id, `tuitionCurrency ${p.tuitionCurrency} yazılı ama harç alanları boş`);
  }
  // EUR dışı harç varken toplam maliyet ve bütçe kıyası hesaplanamıyor.
  if (p.tuitionCurrency && p.tuitionCurrency !== "EUR" && p.tuitionNonEu !== undefined) {
    warn(p.id, `harç ${p.tuitionCurrency} — toplam maliyet ve bütçe filtresi bu kayıtta çalışmaz`);
  }

  if (p.durationYears <= 0 || p.durationYears > 7) {
    err(p.id, `durationYears şüpheli: ${p.durationYears}`);
  }

  // --- sınav puanları ölçek içinde mi -------------------------------------
  for (const req of p.requirements.language ?? []) {
    const scale = LANGUAGE_TEST_SCALES[req.test];
    if (!scale) {
      err(p.id, `bilinmeyen dil sınavı: ${req.test}`);
    } else if (req.min < scale.min || req.min > scale.max) {
      err(
        p.id,
        `${req.test} puanı ${req.min}, ölçek ${scale.min}-${scale.max} (${scale.label}) — ölçek karışmış olabilir`
      );
    }
  }
  for (const req of p.requirements.standardizedTests ?? []) {
    const scale = STANDARDIZED_TEST_SCALES[req.test];
    if (!scale) {
      err(p.id, `bilinmeyen standart sınav: ${req.test}`);
    } else if (req.min < scale.min || req.min > scale.max) {
      err(
        p.id,
        `${req.test} puanı ${req.min}, ölçek ${scale.min}-${scale.max} (${scale.label})`
      );
    }
  }

  // --- burs ---------------------------------------------------------------
  // Kaynaksız burs iddiası uydurma veridir; burs tam olarak öğrencinin karar
  // değiştireceği bilgi.
  for (const sc of p.scholarships ?? []) {
    if (!sc.sourceUrl || !/^https:\/\//.test(sc.sourceUrl)) {
      err(p.id, `burs "${sc.name}" kaynak linki yok ya da geçersiz`);
    }
    if (sc.amountPerYear !== undefined && sc.amountPerYear <= 0) {
      err(p.id, `burs "${sc.name}" tutarı pozitif olmalı`);
    }
  }

  // --- dil tutarlılığı ----------------------------------------------------
  // İngilizce öğretim yapan bir programda Almanca/Fransızca şartı, ya da
  // tersi, kopyala-yapıştır hatasının tipik izi.
  const langTests = (p.requirements.language ?? []).map((l) => l.test);
  const ENGLISH_TESTS = ["ielts", "toefl", "duolingo", "cambridge"];
  if (p.teachingLanguage === "en" && langTests.length > 0) {
    const nonEnglish = langTests.filter((t) => !ENGLISH_TESTS.includes(t));
    if (nonEnglish.length > 0) {
      warn(p.id, `eğitim dili İngilizce ama dil şartı ${nonEnglish.join(", ")}`);
    }
  }
  if (p.teachingLanguage !== "en" && langTests.some((t) => ENGLISH_TESTS.includes(t))) {
    warn(
      p.id,
      `eğitim dili ${p.teachingLanguage} ama dil şartı İngilizce sınavı — track karışmış olabilir`
    );
  }
}

// ---------------------------------------------------------------------------

const verified = PROGRAMS.filter((p) => p.verification === "verified").length;
console.log(`\n${PROGRAMS.length} kayıt denetlendi · ${verified} doğrulanmış\n`);

if (warnings.length) {
  console.log(`⚠ ${warnings.length} uyarı (engellemiyor):`);
  warnings.forEach((w) => console.log(`  · ${w}`));
  console.log();
}

if (errors.length) {
  console.error(`✗ ${errors.length} ihlal:`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  console.error();
  process.exit(1);
}

console.log("✓ İhlal yok.\n");
