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

/**
 * İlgi alanları.
 *
 * DİKKAT: bu liste katalogdan BAĞIMSIZ genişletilebilir — öğrenci ilgi
 * duyduğu alanı dürüstçe seçebilmeli. Ama karşılığı olmayan alanı seçince
 * ekranın boş kalması, tam olarak "formu doldurdum eşleşme gelmedi"
 * şikâyetine yol açıyor. Bu yüzden sihirbaz her alanın yanında katalogdaki
 * program sayısını gösteriyor ve sıfır olanı açıkça söylüyor
 * (bkz. `fieldProgramCounts`, src/data/taxonomy.ts).
 */
export type FieldId =
  | "cs"
  | "data-science"
  | "engineering"
  | "business"
  | "economics"
  | "political-science"
  | "law"
  | "medicine"
  | "psychology"
  | "natural-sciences"
  | "mathematics"
  | "architecture"
  | "design"
  | "communication";

export const FIELD_IDS: FieldId[] = [
  "cs",
  "data-science",
  "engineering",
  "mathematics",
  "natural-sciences",
  "medicine",
  "psychology",
  "business",
  "economics",
  "political-science",
  "law",
  "architecture",
  "design",
  "communication",
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

/**
 * Harçların yayınlandığı para birimleri. Kaynak sayfa hangi birimde
 * yazıyorsa o birimde saklıyoruz — çevirmiyoruz. Bkz. `Program.tuitionCurrency`.
 */
export type Currency = "EUR" | "GBP" | "SEK" | "DKK" | "CHF";

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
   * AB DIŞI öğrenci için yıllık harç. Hedef kitlemiz Türk öğrenci.
   * Para birimi `tuitionCurrency` ile belirtilir (yoksa EUR).
   * undefined = sayfa AB-dışı harcı belirtmiyor. Bütçe kontrolü bu durumda
   * hesap yapmaz; "bilinmiyor" gösterir. 0 yazmak "harç yok" demek olur.
   */
  tuitionNonEu?: number;
  /** AB vatandaşı için yıllık harç — karşılaştırma amaçlı referans. */
  tuitionEu?: number;
  /**
   * Harç alanlarının para birimi. Belirtilmezse EUR.
   *
   * NEDEN VAR: üniversitelerin çoğu harcı kendi para biriminde yayınlıyor —
   * Imperial £, Lund SEK. Bunları EUR'a çevirip yazmak, sayfada olmayan bir
   * sayıyı kaynağa mal etmek olur; kur da her gün değişir. Kaynağın söylediği
   * sayı, kaynağın para biriminde duruyor.
   *
   * BEDELİ: farklı para birimindeki tutarlar toplanamaz ve
   * karşılaştırılamaz. `livingCostPerYear` her zaman EUR olduğu için "toplam
   * yıllık maliyet" yalnızca harç da EUR ise hesaplanır; bütçe kontrolü de
   * aynı şekilde yalnızca EUR kayıtlarda çalışır. Uydurma çevrim yerine
   * "hesaplanamıyor" demeyi seçtik.
   */
  tuitionCurrency?: Currency;
  /** Tahmini yıllık yaşam maliyeti — HER ZAMAN EUR. */
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

  /**
   * Bu programa başvuran AB-dışı öğrencinin yararlanabileceği burslar.
   *
   * Alanın YOK olması "burs yok" demek DEĞİL, "bakmadık" demek — eksik veri
   * sözleşmesinin aynısı burada da geçerli. Boş dizi ise "baktık, AB-dışına
   * açık burs bulamadık" anlamına gelir.
   */
  scholarships?: Scholarship[];
}

// ---------------------------------------------------------------------------
// Öğrenci profili
// ---------------------------------------------------------------------------

/**
 * Aldığı diploma / program türleri. Çoktan seçmeli.
 *
 * `SchoolType`'ın ("Anadolu Lisesi" gibi) yerine geçti. Sebep: üniversiteler
 * lise TÜRÜNE göre şart koymuyor, aldığın DİPLOMAYA göre koyuyor — "IB 38
 * puan", "A-level A*AA", "Abitur 2,5" hepsi diploma şartı. Lise türü ise
 * yalnızca Türkiye içinde anlamlı bir ayrım.
 */
export type DiplomaId =
  | "turkish-high-school"
  | "ib-diploma"
  | "ib-courses"
  | "ap-courses"
  | "a-level"
  | "abitur"
  | "french-bac"
  | "american-diploma"
  | "other";

export const DIPLOMA_IDS: DiplomaId[] = [
  "turkish-high-school",
  "ib-diploma",
  "ib-courses",
  "ap-courses",
  "a-level",
  "abitur",
  "french-bac",
  "american-diploma",
  "other",
];

/** Bir sınıfın yıl sonu ortalaması. */
export interface GradeYearAverage {
  /** Lise kaçıncı sınıf: 9, 10, 11, 12. */
  year: 9 | 10 | 11 | 12;
  /** Ondalıklı olabilir (örn. 90.095). Ölçek `gpaScale` ile aynı. */
  average: number;
}

export const GRADE_YEARS: GradeYearAverage["year"][] = [9, 10, 11, 12];

/** Tek bir AP dersi ve notu. */
export interface ApCourseScore {
  /** Ders adı — AP ders listesi çok uzun ve değişken, serbest metin. */
  course: string;
  /** AP ölçeği 1-5. */
  score: number;
}

/**
 * Girilen sınıf ortalamalarından genel ortalama.
 *
 * DÜZ ORTALAMA, ağırlıklı değil: sınıfların kredi ağırlığını bilmiyoruz ve
 * uydurmak istemiyoruz. Girilmeyen yıl hesaba katılmıyor — öğrenci kaç yıl
 * okuduysa o kadarı üzerinden ortalama alınıyor.
 *
 * Hiç yıl girilmemişse `undefined` döner; çağıran taraf o zaman kullanıcının
 * doğrudan girdiği genel ortalamayı kullanır.
 */
export function overallAverage(years: GradeYearAverage[] | undefined): number | undefined {
  if (!years || years.length === 0) return undefined;
  const sum = years.reduce((total, entry) => total + entry.average, 0);
  return sum / years.length;
}

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
  gender?: "female" | "male" | "other" | "prefer-not-to-say";

  /**
   * Lisenin adı. Eşleştirmede KULLANILMAZ — üniversiteler lise adına göre
   * eşik koymuyor, o yüzden bir şart üretmiyor. Profilde duruyor çünkü
   * öğrencinin kendi kaydını tanıması ve danışmanla konuşurken referans
   * vermesi için gerekiyor.
   */
  highSchoolName: string;
  /**
   * Aldığı diploma ve programlar. `schoolType`'ın yerine geçti: "Anadolu
   * Lisesi" bilgisi başvuruda işe yaramıyor, "IB Diploma aldım" ya da
   * "3 AP dersi aldım" yarıyor. Çoktan seçmeli, çünkü öğrenci aynı anda
   * Türk lise diploması + AP dersleri taşıyabiliyor.
   */
  diplomas: DiplomaId[];
  /** `diplomas` içinde "other" seçiliyse serbest metin. */
  diplomaOther?: string;
  graduationYear: number;

  /**
   * Sınıf sınıf not ortalaması. HER YIL İSTEĞE BAĞLI — öğrenci kaç yıl
   * okuduysa o kadarını giriyor; 11. sınıftaki bir öğrenciden 12. sınıf notu
   * istemek anlamsız.
   */
  gradeYears?: GradeYearAverage[];

  /**
   * Karşılaştırmada kullanılan genel ortalama.
   *
   * `gradeYears` doluysa ONDAN TÜRETİLİR (bkz. overallAverage). Ayrı alan
   * olarak duruyor çünkü eşleştirme motoru tek bir sayı ile çalışıyor ve
   * ölçek çevrimi de burada yapılıyor; motoru sınıf sınıf veriye bağlamak
   * her kontrolü karmaşıklaştırırdı.
   */
  gpa: number;
  gpaScale: GpaScale;

  /** İlgi duyulan alanlar — en az bir tane. */
  fields: FieldId[];

  languageTests: LanguageTestScore[];
  standardizedTests: StandardizedTestScore[];
  /**
   * Öğrencinin ileri düzey aldığını beyan ettiği dersler.
   *
   * Bu alan MOTORUN GİRDİSİ: katalogdaki 20+ programda `requiredSubjects`
   * var (TU Delft matematik ileri düzey, DTU kimya gibi) ve kontrol buradan
   * okunuyor. Sihirbazda artık kendi adımında sorulyor.
   */
  advancedSubjects: Subject[];
  /**
   * AP dersleri, ders ders ve notuyla. `standardizedTests` içindeki tek
   * "ap" puanının yerine geçiyor: bir öğrenci AP Calculus'tan 5, AP
   * Biology'den 3 alabilir ve tek bir sayı bunu temsil etmiyor.
   */
  apCourses?: ApCourseScore[];

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
  /** Karşılanan zorunlu şart sayısı. */
  metMandatory: number;
  /**
   * Sayacın paydası: BİLDİĞİMİZ zorunlu şart sayısı.
   *
   * Üniversitenin yayınlamadığı şartlar (`unknownReason: "source"`) paydaya
   * GİRMEZ — bkz. discover.ts'teki "iki tür bilinmeyen" kuralı. Aksi hâlde
   * kendi katalog boşluğumuz öğrenciye eksiklik olarak yazılır ve ekranda
   * "tüm zorunlu şartları karşılıyorsun" rozetinin yanında "3/4" gibi
   * kendini yalanlayan bir sayaç çıkar.
   */
  totalMandatory: number;
  /**
   * Kaynak yayınlamadığı için paydadan düşülen zorunlu şart sayısı.
   * Arayüz bunu "N şart bilinmiyor" olarak ayrıca söyleyebilir; sayacın
   * neden `totalMandatory` kadar olduğu böylece görünür kalıyor.
   */
  unknownFromSource: number;
  /** Harç + yaşam maliyeti, öğrencinin bütçesini aşıyorsa true. */
  overBudget: boolean;
}

// ---------------------------------------------------------------------------
// Burslar
// ---------------------------------------------------------------------------

export type ScholarshipKind = "tuition-waiver" | "grant" | "merit" | "need-based";

/**
 * Tek bir burs kaydı.
 *
 * Türk öğrenci için harç + yaşam maliyeti yılda 15-25 bin EUR; burs bilgisi
 * olmadan maliyet tablosu yarım kalıyor. Bu yüzden her kaydın `sourceUrl`'ü
 * ZORUNLU — burs bilgisi uydurmanın bedeli, öğrencinin var olmayan bir paraya
 * güvenerek plan yapması olur.
 */
export interface Scholarship {
  name: string;
  /**
   * Yıllık tutar (EUR). Harç muafiyetiyse programın tuitionNonEu değeri kadar
   * yazılır. Tutar kaynakta belirtilmiyorsa (ör. "kısmi muafiyet") boş bırakılır
   * — sıfır yazmak "para vermiyor" demek olurdu.
   */
  amountPerYear?: number;
  kind: ScholarshipKind;
  /** AB-dışı öğrenciye açık mı — hedef kitlemiz için belirleyici alan. */
  openToNonEu: boolean;
  /** Bursun ilan edildiği sayfa. Arayüzde tıklanabilir gösterilir. */
  sourceUrl: string;
  note?: Bilingual;
}
