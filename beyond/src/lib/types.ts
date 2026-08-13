/**
 * Beyond — çekirdek tip modeli.
 *
 * Tasarım ilkesi: her şart makine tarafından kontrol edilebilir olmalı ki
 * eşleştirme motoru "neden" sorusuna satır satır cevap verebilsin.
 * Skor bir kara kutu değil; her bileşeni arayüzde gösterilebilir.
 */

// ---------------------------------------------------------------------------
// Temel enum'lar
// ---------------------------------------------------------------------------

export type CountryCode = "NL" | "DE" | "GB" | "FR" | "CH" | "SE" | "BE" | "DK" | "IT";

export const COUNTRY_CODES: CountryCode[] = [
  "NL",
  "DE",
  "GB",
  "FR",
  "CH",
  "SE",
  "BE",
  "DK",
  "IT",
];

export type FieldId =
  | "cs"
  | "engineering"
  | "business"
  | "economics"
  | "medicine"
  | "psychology"
  | "natural-sciences";

export const FIELD_IDS: FieldId[] = [
  "cs",
  "engineering",
  "business",
  "economics",
  "medicine",
  "psychology",
  "natural-sciences",
];

/** Başvurunun hangi merkezi sistem üzerinden yapıldığı. */
export type ApplicationSystem =
  | "ucas"
  | "studielink"
  | "uni-assist"
  | "parcoursup"
  | "campus-france"
  | "direct";

/** Programın eğitim dili. */
export type TeachingLanguage = "en" | "nl" | "de" | "fr" | "it" | "sv" | "da";

/** Kabul edilen dil sınavları. */
export type LanguageTest =
  | "ielts"
  | "toefl"
  | "duolingo"
  | "cambridge"
  | "delf"
  | "dalf"
  | "tcf"
  | "testdaf"
  | "goethe"
  | "cnasvt"; // İtalyanca (CILS/CELI ailesi için genel kova)

/** Kabul edilen standart sınavlar. */
export type StandardizedTest = "sat" | "ib" | "ap" | "yks";

/** Lise ders alanları — bazı programlar belirli ders/seviye şartı koyar. */
export type Subject = "math" | "physics" | "chemistry" | "biology";

/** Sayısal olarak ölçülemeyen, öğrencinin beyanına dayanan şartlar. */
export type ExtraRequirementKey =
  | "portfolio"
  | "interview"
  | "entrance-exam"
  | "motivation-letter"
  | "numerus-fixus"
  | "recommendation-letter";

/**
 * Verinin ne kadar güvenilir olduğu. Bu alan arayüzde AÇIKÇA gösterilir —
 * doğrulanmamış veriyi doğrulanmış gibi sunmak ürünün tek gerçek değerini,
 * yani güveni, yok eder.
 */
export type VerificationStatus = "verified" | "ai-extracted";

/** Eşleştirme sonucu bandı. */
export type Band = "safety" | "match" | "reach" | "out-of-reach";

// ---------------------------------------------------------------------------
// İki dilli metin
// ---------------------------------------------------------------------------

export interface Bilingual {
  tr: string;
  en: string;
}

// ---------------------------------------------------------------------------
// Program (üniversite + bölüm) modeli
// ---------------------------------------------------------------------------

/** Dil şartı: listedeki sınavlardan HERHANGİ BİRİ eşiği geçerse şart sağlanır. */
export interface LanguageRequirement {
  test: LanguageTest;
  min: number;
}

/** Standart sınav şartı. mandatory=false ise "varsa artı" demektir. */
export interface StandardizedTestRequirement {
  test: StandardizedTest;
  min: number;
  mandatory: boolean;
}

/** Ders şartı. advanced = ileri düzey / sayısal ağırlıklı ders gerekir. */
export interface SubjectRequirement {
  subject: Subject;
  level: "basic" | "advanced";
}

export interface ExtraRequirement {
  key: ExtraRequirementKey;
  mandatory: boolean;
  note?: Bilingual;
}

/**
 * EKSİK VERİ SÖZLEŞMESİ — "yok" ile "bilmiyoruz" aynı şey değil.
 *
 * Üniversite sayfalarının çoğu şartların tamamını yayınlamıyor. Bilinmeyen bir
 * eşik yerine makul bir sayı yazmak, ürünün asla yapmayacağını söylediği şeydir:
 * uydurma veriyi gerçek gibi sunmak. O yüzden model bilmemeyi ifade edebiliyor.
 *
 *   undefined  → kaynak sayfa bunu söylemiyor. Motor `unknown` üretir; öğrenci
 *                cezalandırılmaz ve program `safety` bandına DÜŞEMEZ (eşiği
 *                bilmediğin yerde "rahatça aşıyorsun" demek yanlış olur).
 *   []         → sayfa açıkça "böyle bir şart yok" diyor. Şart üretilmez.
 *   0          → ASLA. Sıfır "eşik yok" demektir; eksik veriyi sıfır gibi
 *                göstermek sessiz bir yalandır.
 */
export interface ProgramRequirements {
  /**
   * Türk lise diploma notu (100'lük sistem) cinsinden alt eşik.
   * Diğer sistemlerden gelen notlar bu ölçeğe çevrilerek karşılaştırılır.
   * undefined = üniversite bir eşik yayınlamıyor.
   */
  minGpa?: number;
  /**
   * anyOf mantığı: biri yeterli.
   * [] = sayfa dil belgesi istemediğini söylüyor · undefined = bilinmiyor.
   */
  language?: LanguageRequirement[];
  standardizedTests?: StandardizedTestRequirement[];
  requiredSubjects?: SubjectRequirement[];
  extras?: ExtraRequirement[];
}

export interface Program {
  id: string;
  university: string;
  /** Üniversitenin kendi dilindeki adı — varsa gösterilir. */
  universityLocal?: string;
  country: CountryCode;
  city: string;
  /** Program adı — kaynak dilinde (İngilizce) tutulur, çeviri yapılmaz. */
  name: string;
  degree: "BSc" | "BA" | "BEng" | "LLB" | "MD" | "Diplôme";
  field: FieldId;
  teachingLanguage: TeachingLanguage;
  /** Normal süre (yıl). */
  durationYears: number;

  requirements: ProgramRequirements;

  /**
   * AB DIŞI öğrenci için yıllık harç (EUR). Hedef kitlemiz Türk öğrenci.
   * undefined = sayfa AB-dışı harcı belirtmiyor. Bütçe kontrolü bu durumda
   * hesap yapmaz; "bilinmiyor" gösterir. 0 yazmak "harç yok" demek olur.
   */
  tuitionNonEu?: number;
  /** AB vatandaşı için yıllık harç (EUR) — karşılaştırma amaçlı referans. */
  tuitionEu?: number;
  /** Tahmini yıllık yaşam maliyeti (EUR). */
  livingCostPerYear: number;

  applicationSystem: ApplicationSystem;
  /** Başvuru son tarihi — "AA-GG" formatı, yıl bağımsız. */
  deadline: string;
  /** Son tarihin hangi akademik yıl için olduğu, insan okunur not. */
  deadlineNote?: Bilingual;

  /** Şartların alındığı sayfa. Her kartta tıklanabilir olarak gösterilir. */
  sourceUrl: string;
  /** Fakülte/bölüm ana sayfası — brief'teki "ek feature". */
  facultyUrl?: string;
  /** ISO tarih (YYYY-MM-DD). */
  lastChecked: string;
  verification: VerificationStatus;
}

// ---------------------------------------------------------------------------
// Öğrenci profili
// ---------------------------------------------------------------------------

export type SchoolType =
  | "anatolian"
  | "science-high-school"
  | "private-turkish"
  | "ib-school"
  | "american-college"
  | "other";

export type GpaScale = "100" | "5" | "4" | "ib45";

export interface LanguageTestScore {
  test: LanguageTest;
  score: number;
}

export interface StandardizedTestScore {
  test: StandardizedTest;
  score: number;
}

export interface StudentProfile {
  /** Supabase auth kullanıcı kimliği — yerel taslakta boş olabilir. */
  userId?: string;
  fullName: string;
  /** Brief'te istenen temel bilgiler. Eşleştirmede KULLANILMAZ, sadece kayıt. */
  birthYear?: number;
  gender?: "female" | "male" | "other" | "prefer-not-to-say";

  schoolType: SchoolType;
  graduationYear: number;

  gpa: number;
  gpaScale: GpaScale;

  /** İlgi duyulan alanlar — en az bir tane. */
  fields: FieldId[];

  languageTests: LanguageTestScore[];
  standardizedTests: StandardizedTestScore[];
  /** Öğrencinin ileri düzey aldığını beyan ettiği dersler. */
  advancedSubjects: Subject[];

  /** Boş dizi = ülke kısıtı yok, hepsine bak. */
  targetCountries: CountryCode[];
  /** Yıllık harç üst sınırı (EUR). undefined = sınır yok. */
  maxTuition?: number;

  /** Beyana dayalı ekstra şartlar — portfolyo hazır mı, mülakata açık mı vb. */
  extrasReady: ExtraRequirementKey[];

  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Eşleştirme sonucu
// ---------------------------------------------------------------------------

/**
 * Tek bir şartın kontrol sonucu.
 * - met      : karşılanıyor
 * - close    : karşılanmıyor ama kapatılabilir mesafede (aksiyon planına girer)
 * - unmet    : karşılanmıyor
 * - unknown  : bilinmiyor — ceza değil uyarı. Kimin bilgisi eksik olduğunu
 *              `unknownReason` söyler; ikisi farklı şeylerdir.
 */
export type CheckStatus = "met" | "close" | "unmet" | "unknown";

/**
 * `unknown` neden oluştu?
 * - "student" : öğrenci bu bilgiyi girmemiş. Girerse çözülür, bizde eksik yok.
 * - "source"  : üniversite bu şartı yayınlamıyor. Öğrencinin yapabileceği bir
 *               şey yok, dolayısıyla bu bir eksiklik olarak ONA yazılamaz —
 *               bandı aşağı çekmemeli. Bizim veri boşluğumuz.
 */
export type UnknownReason = "student" | "source";

export interface RequirementCheck {
  id: string;
  label: Bilingual;
  status: CheckStatus;
  mandatory: boolean;
  /** "6.0 / 6.5 gerekli" gibi kısa karşılaştırma metni. */
  detail: Bilingual;
  /** close/unmet ise ne yapılmalı — eksik analizi ekranını besler. */
  action?: Bilingual;
  /** Yalnızca status === "unknown" iken anlamlı. */
  unknownReason?: UnknownReason;
}

export interface MatchResult {
  program: Program;
  band: Band;
  /** 0-100. Sıralama için; kullanıcıya "kabul olasılığı" olarak SUNULMAZ. */
  fitScore: number;
  checks: RequirementCheck[];
  metMandatory: number;
  totalMandatory: number;
  /** Harç + yaşam maliyeti, öğrencinin bütçesini aşıyorsa true. */
  overBudget: boolean;
}
