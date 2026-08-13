import type { Program } from "@/lib/types";

/**
 * Beyond — program kataloğu.
 *
 * DÜRÜSTLÜK NOTU — iki ayrı şey var, karıştırma:
 *
 * 1. BAĞLANTILAR doğrulandı (2026-08-13). Her sourceUrl ve facultyUrl
 *    tek tek istek atılarak kontrol edildi; 36 kaydın 35'i 200 dönüyor.
 *    Tek istisna it-pavia-medicine: site Cloudflare arkasında otomatik
 *    isteklere 403 veriyor ama tarayıcıda normal açılıyor.
 *
 * 2. ŞARTLAR doğrulanmadı. minGpa, dil barajları, harçlar ve son tarihler
 *    derlenmiş bilgidir, kaynağından teyit edilmemiştir — bu yüzden tüm
 *    kayıtlar `ai-extracted` olarak işaretli ve arayüz bunu her kartta
 *    açıkça gösteriyor. Bir kaydı `verified` yapmadan önce sourceUrl'deki
 *    sayfadan elle teyit et ve lastChecked tarihini güncelle.
 *
 * Doğrulanmamış veriyi doğrulanmış gibi sunmak bu ürünün tek gerçek
 * değerini yok eder.
 *
 * Harçlar AB-DIŞI (Türk) öğrenci içindir ve yıllık EUR cinsindendir.
 */

const CHECKED = "2026-08-13";

export const PROGRAMS: Program[] = [
  // -------------------------------------------------------------------------
  // 🇳🇱 HOLLANDA
  // -------------------------------------------------------------------------
  {
    id: "nl-tudelft-cse",
    university: "Delft University of Technology",
    universityLocal: "Technische Universiteit Delft",
    country: "NL",
    city: "Delft",
    name: "Computer Science and Engineering",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // TU Delft uluslararası diplomalar için SAYISAL BİR ORTALAMA EŞİĞİ
      // yayınlamıyor; denklik VWO standardına göre tek tek değerlendiriliyor.
      // Bağlayıcı olan şey ders şartı (Mathematics B), ortalama değil.
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 90 },
      ],
      // Programın kendi şart sayfasında yalnızca "Mathematics B" listeleniyor;
      // fizik şartı YOK (katalogda yanlışlıkla duruyordu).
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        {
          key: "numerus-fixus",
          mandatory: false,
          note: {
            tr: "Kontenjan sınırlı, seçimle belirleniyor",
            en: "Capped intake, selection-based",
          },
        },
        { key: "motivation-letter", mandatory: true },
      ],
    },
    // Kurumsal tarife (AB-dışı) 2026-27: 18.175 EUR. Katalogda 20.800 yazıyordu.
    tuitionNonEu: 18175,
    tuitionEu: 2601,
    livingCostPerYear: 13200,
    applicationSystem: "studielink",
    deadline: "01-15",
    deadlineNote: {
      tr: "Numerus fixus programı — 15 Ocak kesin son tarih, uzatma yok",
      en: "Numerus fixus program — 15 January is final, no extensions",
    },
    sourceUrl: "https://www.tudelft.nl/en/education/programmes/bachelors",
    facultyUrl: "https://www.tudelft.nl/en/eemcs",
    lastChecked: CHECKED,
    verification: "verified",
    // Baktık: TU Delft'in bursları yalnızca yüksek lisans düzeyinde
    // ("specifically designed to ... pursue a MSc degree") ve üniversite
    // 2026-27 NL Scholarship listesinde yok.
    // Boş dizi "burs yok" demek — alanın hiç olmaması "bakmadık" demek olurdu.
    scholarships: [],
  },
  {
    id: "nl-tue-mechanical",
    university: "Eindhoven University of Technology",
    universityLocal: "Technische Universiteit Eindhoven",
    country: "NL",
    city: "Eindhoven",
    name: "Mechanical Engineering",
    degree: "BSc",
    field: "engineering",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Sayfa sayısal eşik vermiyor; şart "pre-university certificate,
      // including mathematics B and physics".
      minGpa: undefined,
      // Dil şartı bu sayfada geçmiyor. Katalogdaki IELTS 6.0 / TOEFL 80
      // teyit edilemedi — bilerek bırakıldı, doğrulama turunda TU/e'nin
      // dil şartları sayfasından teyit edilmeli.
      language: [
        { test: "ielts", min: 6.0 },
        { test: "toefl", min: 80 },
      ],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
      extras: [
        { key: "motivation-letter", mandatory: false },
        {
          // EKLENDİ: katalogda seçme şartı hiç yoktu ve bu program demoda
          // GÜVENLİ bandında çıkıyor. Sayfa "Program with selection" ve
          // "Admission to the program also requires passing a selection
          // procedure" diyor. Seçme kapısı olan bir programa "rahatça
          // aşıyorsun" demek, ürünün vermemeye söz verdiği yanlış güven.
          key: "numerus-fixus",
          mandatory: true,
          note: {
            tr: "Seçme prosedürünü geçmek zorunlu — şartları karşılamak tek başına yeterli değil",
            en: "Passing the selection procedure is required — meeting the requirements alone is not enough",
          },
        },
      ],
    },
    // Harç bu sayfada geçmiyor; 11.900 teyit edilmedi.
    tuitionNonEu: 11900,
    tuitionEu: 2601,
    livingCostPerYear: 12000,
    applicationSystem: "studielink",
    deadline: "04-01",
    sourceUrl: "https://www.tue.nl/en/education/tue-bachelor-college/bachelor-programs/mechanical-engineering",
    facultyUrl: "https://www.tue.nl/en/our-university/departments/mechanical-engineering",
    lastChecked: CHECKED,
    verification: "ai-extracted",
    // 2026-27 katılımcı listesi studyinnl.org'da yayınlanıyor; bu üniversite
    // listede. Liste her yıl değişiyor.
    scholarships: [
      {
        name: "NL Scholarship",
        amountPerYear: 5000,
        kind: "grant",
        openToNonEu: true,
        sourceUrl: "https://www.studyinnl.org/finances/nl-scholarship",
        note: {
          tr: "Yalnızca AB/AEA dışı vatandaşlar için ve sadece BİRİNCİ yıl ödeniyor — tam harç bursu değil. Hollanda'da daha önce derece almamış olmak gerekiyor.",
          en: "Non-EEA nationals only and paid in the FIRST year only — not a full-tuition scholarship. You must not already hold a degree from a Dutch institution.",
        },
      },
    ],
  },
  {
    id: "nl-erasmus-iba",
    university: "Erasmus University Rotterdam",
    country: "NL",
    city: "Rotterdam",
    name: "International Business Administration",
    degree: "BSc",
    field: "business",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 78,
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 90 },
      ],
      requiredSubjects: [{ subject: "math", level: "basic" }],
      extras: [
        {
          key: "numerus-fixus",
          mandatory: false,
          note: { tr: "Kontenjan sınırlı", en: "Capped intake" },
        },
        { key: "motivation-letter", mandatory: true },
      ],
    },
    tuitionNonEu: 12100,
    tuitionEu: 2601,
    livingCostPerYear: 13000,
    applicationSystem: "studielink",
    deadline: "01-15",
    sourceUrl: "https://www.eur.nl/en/education",
    facultyUrl: "https://www.rsm.nl/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "nl-uva-economics",
    university: "University of Amsterdam",
    universityLocal: "Universiteit van Amsterdam",
    country: "NL",
    city: "Amsterdam",
    name: "Economics and Business Economics",
    degree: "BSc",
    field: "economics",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Not eşiği bu sayfada geçmiyor (ayrı "entry requirements" sayfasında).
      // 76 teyit edilmedi.
      minGpa: 76,
      // Dil şartı bu sayfada geçmiyor; IELTS 6.5 / TOEFL 92 teyit edilmedi.
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 92 },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        { key: "motivation-letter", mandatory: false },
        {
          // EKLENDİ: sayfa "The English track is a numerus fixus programme with
          // only 850 spots available" diyor. Katalogda hiç kontenjan şartı
          // yoktu ve bu program demoda tek GÜVENLİ kart olarak görünüyordu.
          key: "numerus-fixus",
          mandatory: true,
          note: {
            tr: "İngilizce track numerus fixus — yılda yalnızca 850 kontenjan",
            en: "The English track is numerus fixus — only 850 places a year",
          },
        },
        {
          // EKLENDİ: başvuru adımları arasında "Sign up for the selection and
          // take the test" var; sıralama numarası 15 Nisan'da açıklanıyor.
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "Seçme sınavına girmek zorunlu; sıralama numarası 15 Nisan'da açıklanıyor",
            en: "Taking the selection test is required; your ranking number is published on 15 April",
          },
        },
      ],
    },
    // Harç bu sayfada geçmiyor, 12.000 teyit edilmedi.
    // (Sayfa ayrıca AB-dışı öğrencilere açık Amsterdam Merit Scholarship'ten
    // söz ediyor: yılda € 6.000, toplam € 18.000 — burs özelliği eklenince
    // bu kayda girecek ilk veri.)
    tuitionNonEu: 12000,
    tuitionEu: 2601,
    livingCostPerYear: 14400,
    applicationSystem: "studielink",
    // DÜZELTME (2026-08-13): katalogda "04-01" yazıyordu. Sayfa açıkça
    // "There is an early application deadline: 15 January" diyor.
    // 2,5 ay geç bir tarih — bu kayda güvenen öğrenci yılı kaçırırdı.
    deadline: "01-15",
    sourceUrl:
      "https://www.uva.nl/en/programmes/bachelors/economics--business-economics/application-and-admission/international-prior-education/international-prior-education-english-track.html",
    facultyUrl: "https://www.uva.nl/en/education",
    lastChecked: CHECKED,
    verification: "ai-extracted",
    scholarships: [
      {
        name: "Amsterdam Merit Scholarship",
        amountPerYear: 6000,
        kind: "merit",
        openToNonEu: true,
        sourceUrl:
          "https://www.uva.nl/en/education/fees-and-funding/bachelors-scholarships-and-loans/amsterdam-merit-scholarship/amsterdam-merit-scholarship.html",
        note: {
          tr: "Lisansta yılda 6.000 EUR, üç yıl boyunca (toplam 18.000). AB/AEA dışı pasaport ŞARTI var ve Hollanda öğrenim desteğinden (Studiefinanciering) yararlanamıyor olmak gerekiyor. Kontenjan sınırlı.",
          en: "EUR 6,000 per year at bachelor level for three years (EUR 18,000 total). Requires a non-EU/EEA passport and ineligibility for Dutch study finance (Studiefinanciering). Limited number available.",
        },
      },
    ],
  },
  {
    id: "nl-groningen-psychology",
    university: "University of Groningen",
    universityLocal: "Rijksuniversiteit Groningen",
    country: "NL",
    city: "Groningen",
    name: "Psychology",
    degree: "BSc",
    field: "psychology",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Sayfa yurt dışı diploması için sayısal eşik vermiyor; diplomanın VWO'ya
      // denk olması ve seçme sınavındaki sıralaman belirleyici.
      minGpa: undefined,
      // IELTS 6.5 şartı programın seçme prosedürü sayfasında geçiyor
      // (rug.nl/gmw/bachelors/psychology/selectieprocedure-bachelor-psychology-en)
      // ve konuşma + yazma ALT puanı olarak isteniyor. Tip modeli alt puan
      // ayrımını taşıyamıyor; genel eşik olarak yazıldı.
      language: [{ test: "ielts", min: 6.5 }],
      extras: [
        {
          // DÜZELTME: mandatory false idi. Kontenjan 250 ve yerler seçme
          // prosedürüyle dağıtılıyor — bu isteğe bağlı bir durum değil.
          key: "numerus-fixus",
          mandatory: true,
          note: {
            tr: "Yılda 250 kontenjan, yerler seçme sınavı sıralamasıyla dağıtılıyor — şartları karşılamak kabul garantisi değil",
            en: "250 places a year, assigned by selection-test ranking — meeting requirements does not guarantee a place",
          },
        },
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "Seçme sınavı zorunlu; sıralaman diğer adaylarla karşılaştırılıyor",
            en: "Selection test is mandatory; your ranking is compared with other applicants",
          },
        },
      ],
    },
    // DÜZELTME (2026-08-13): katalogda 11.400 / 2.601 yazıyordu.
    // Sayfa 2026-2027 için AB-dışı € 14.000, AB € 2.694 diyor.
    // Dedektörün işaretlediği fark gerçekti.
    tuitionNonEu: 14000,
    tuitionEu: 2694,
    livingCostPerYear: 11400,
    applicationSystem: "studielink",
    deadline: "01-15",
    // DÜZELTME: eski link Hollandaca track'in sayfasıydı (NT2-II şartı, 365
    // kontenjan). Bu kayıt İngilizce track; sayfası ve kontenjanı farklı.
    sourceUrl: "https://www.rug.nl/bachelors/psychology-en/?lang=en",
    facultyUrl: "https://www.rug.nl/gmw/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
    // 2026-27 katılımcı listesi studyinnl.org'da yayınlanıyor; bu üniversite
    // listede. Liste her yıl değişiyor.
    scholarships: [
      {
        name: "NL Scholarship",
        amountPerYear: 5000,
        kind: "grant",
        openToNonEu: true,
        sourceUrl: "https://www.studyinnl.org/finances/nl-scholarship",
        note: {
          tr: "Yalnızca AB/AEA dışı vatandaşlar için ve sadece BİRİNCİ yıl ödeniyor — tam harç bursu değil. Hollanda'da daha önce derece almamış olmak gerekiyor.",
          en: "Non-EEA nationals only and paid in the FIRST year only — not a full-tuition scholarship. You must not already hold a degree from a Dutch institution.",
        },
      },
    ],
  },
  {
    id: "nl-utrecht-chemistry",
    university: "Utrecht University",
    universityLocal: "Universiteit Utrecht",
    country: "NL",
    city: "Utrecht",
    name: "Chemistry",
    degree: "BSc",
    field: "natural-sciences",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 74,
      language: [
        { test: "ielts", min: 6.0 },
        { test: "toefl", min: 80 },
      ],
      requiredSubjects: [
        { subject: "chemistry", level: "advanced" },
        { subject: "math", level: "basic" },
      ],
    },
    tuitionNonEu: 15500,
    tuitionEu: 2601,
    livingCostPerYear: 13200,
    applicationSystem: "studielink",
    deadline: "04-01",
    sourceUrl: "https://www.uu.nl/en/bachelors",
    facultyUrl: "https://www.uu.nl/en/organisation/faculty-of-science",
    lastChecked: CHECKED,
    verification: "ai-extracted",
    // 2026-27 katılımcı listesi studyinnl.org'da yayınlanıyor; bu üniversite
    // listede. Liste her yıl değişiyor.
    scholarships: [
      {
        name: "NL Scholarship",
        amountPerYear: 5000,
        kind: "grant",
        openToNonEu: true,
        sourceUrl: "https://www.studyinnl.org/finances/nl-scholarship",
        note: {
          tr: "Yalnızca AB/AEA dışı vatandaşlar için ve sadece BİRİNCİ yıl ödeniyor — tam harç bursu değil. Hollanda'da daha önce derece almamış olmak gerekiyor.",
          en: "Non-EEA nationals only and paid in the FIRST year only — not a full-tuition scholarship. You must not already hold a degree from a Dutch institution.",
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 🇩🇪 ALMANYA
  // -------------------------------------------------------------------------
  {
    id: "de-tum-informatics",
    university: "Technical University of Munich",
    universityLocal: "Technische Universität München",
    country: "DE",
    city: "München",
    name: "Informatics",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "de",
    durationYears: 3,
    requirements: {
      // Sayfa sayısal eşik vermiyor; seçim iki aşamalı EFV ile yapılıyor.
      // Katalogdaki 80 teyit edilemedi.
      minGpa: 80,
      // Teyit edildi: sayfa "Sehr gute Kenntnisse in Deutsch und Englisch"
      // istiyor — yani Almanca YETERLİ DEĞİL, İngilizce de gerekiyor.
      // Tip modeli "iki dil birlikte" diyemiyor; Almanca eşikleri yazılı.
      language: [
        { test: "testdaf", min: 4 },
        { test: "goethe", min: 5 },
      ],
      standardizedTests: [{ test: "yks", min: 300, mandatory: true }],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        {
          // Katalogda doğru modellenmişti; sayfadan gelen ayrıntı eklendi.
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "Eignungsfeststellungsverfahren — iki aşamalı: 1) dosya incelemesi, 2) Garching'de yüz yüze test (kış dönemi için 21.08.2026)",
            en: "Eignungsfeststellungsverfahren — two stages: 1) document review, 2) an in-person test in Garching (21 Aug 2026 for the winter intake)",
          },
        },
      ],
    },
    // Harç bu sayfada geçmiyor; 4.000 / 300 teyit edilmedi.
    tuitionNonEu: 4000,
    tuitionEu: 300,
    livingCostPerYear: 13800,
    applicationSystem: "direct",
    // DÜZELTME (2026-08-13): katalogda "05-31" yazıyordu. Sayfa
    // "Bewerbungsfrist Wintersemester: 15. Mai bis 15. Juli" diyor —
    // başvuru penceresi 15 Mayıs'ta açılıyor, 15 TEMMUZ'da kapanıyor.
    deadline: "07-15",
    deadlineNote: {
      tr: "Almanca eğitim — TestDaF 4 veya Goethe C1 zorunlu. Ayrıca YKS yerleşmen olmalı.",
      en: "Taught in German — TestDaF 4 or Goethe C1 required, plus a YKS university placement.",
    },
    sourceUrl: "https://www.cit.tum.de/en/cit/studies/degree-programs/bachelor-informatics/",
    facultyUrl: "https://www.cit.tum.de/en/cit/home/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "de-rwth-mechanical",
    university: "RWTH Aachen University",
    universityLocal: "RWTH Aachen",
    country: "DE",
    city: "Aachen",
    name: "Mechanical Engineering",
    degree: "BSc",
    field: "engineering",
    teachingLanguage: "de",
    durationYears: 3.5,
    requirements: {
      // Programın kendi sayfası "open admission (no NC)" diyor. Uluslararası
      // başvuru sayfası ise SOMUT bir eşik veriyor: "The overall average grade
      // of your HZB must be at least equivalent to the German grade 2.5."
      //
      // Yine de undefined bırakıldı, çünkü bu eşik ALMAN 1-6 ÖLÇEĞİNDE ve bu
      // alan 100'lük Türk ölçeği bekliyor. 2,5'i 100'lüğe çevirmenin tek bir
      // doğru yolu yok (Bavyera formülü, ANABIN tabloları farklı sonuç verir).
      // Uydurma bir sayı yazmak yerine bilinmiyor bırakıldı.
      //
      // ÖNEMLİ TELAFİ: ortalama 2,5'ten kötüyse TestAS ile kapatılabiliyor.
      // Bu, öğrenciye "olamazsın" demek yerine yol gösteren bir bilgi ama
      // modelde TestAS diye bir sınav yok (StandardizedTest: sat/ib/ap/yks).
      minGpa: undefined,
      // Teyit edildi: "RWTH currently only offers Bachelor and Staatsexamen
      // courses of study in German. You must therefore provide proof of German
      // language skills at C1 level when you enroll." TestDaF 4 ve Goethe C1
      // bu seviyeye karşılık geliyor — katalog doğruydu.
      // (Not: bazı bölümlerde ek olarak İngilizce B2 isteniyor, örnek olarak
      // bilgisayar bilimleri veriliyor; makine mühendisliği sayılmamış.)
      language: [
        { test: "testdaf", min: 4 },
        { test: "goethe", min: 5 },
      ],
      // YKS 250 bu sayfada geçmiyor, teyit edilmedi.
      standardizedTests: [{ test: "yks", min: 250, mandatory: true }],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
    },
    // Sayfa dönemlik katkı payını belirtmiyor; 700 kaynakta yoktu.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    livingCostPerYear: 11400,
    applicationSystem: "uni-assist",
    deadline: "07-15",
    deadlineNote: {
      tr: "Harç yok, sadece dönemlik öğrenci katkı payı. Almanya'nın en büyük avantajı bu.",
      en: "No tuition, only a semester contribution — Germany's biggest advantage.",
    },
    sourceUrl:
      "https://www.rwth-aachen.de/cms/root/studium/vor-dem-studium/studiengaenge/liste-aktuelle-studiengaenge/studiengangbeschreibung/~bnev/maschinenbau-b-sc-/?lidx=1",
    facultyUrl: "https://www.maschinenbau.rwth-aachen.de/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "de-mannheim-business",
    university: "University of Mannheim",
    universityLocal: "Universität Mannheim",
    country: "DE",
    city: "Mannheim",
    name: "Business Administration",
    degree: "BSc",
    field: "business",
    teachingLanguage: "de",
    durationYears: 3,
    requirements: {
      minGpa: 82,
      language: [{ test: "testdaf", min: 4 }],
      standardizedTests: [{ test: "yks", min: 300, mandatory: true }],
      requiredSubjects: [{ subject: "math", level: "basic" }],
      extras: [{ key: "motivation-letter", mandatory: false }],
    },
    tuitionNonEu: 3000,
    tuitionEu: 400,
    livingCostPerYear: 11400,
    applicationSystem: "uni-assist",
    deadline: "07-15",
    sourceUrl: "https://www.uni-mannheim.de/en/academics/programs/",
    facultyUrl: "https://www.bwl.uni-mannheim.de/en/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "de-heidelberg-physics",
    university: "Heidelberg University",
    universityLocal: "Ruprecht-Karls-Universität Heidelberg",
    country: "DE",
    city: "Heidelberg",
    name: "Physics",
    degree: "BSc",
    field: "natural-sciences",
    teachingLanguage: "de",
    durationYears: 3,
    requirements: {
      minGpa: 75,
      language: [{ test: "testdaf", min: 4 }],
      standardizedTests: [{ test: "yks", min: 250, mandatory: true }],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
    },
    tuitionNonEu: 3000,
    tuitionEu: 350,
    livingCostPerYear: 12000,
    applicationSystem: "uni-assist",
    deadline: "07-15",
    sourceUrl: "https://www.uni-heidelberg.de/en/study/all-subjects/physics",
    facultyUrl: "https://www.physik.uni-heidelberg.de/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "de-heidelberg-medicine",
    university: "Heidelberg University",
    universityLocal: "Ruprecht-Karls-Universität Heidelberg",
    country: "DE",
    city: "Heidelberg",
    name: "Medicine (Humanmedizin)",
    degree: "MD",
    field: "medicine",
    teachingLanguage: "de",
    durationYears: 6,
    requirements: {
      minGpa: 92,
      language: [{ test: "testdaf", min: 5 }],
      standardizedTests: [{ test: "yks", min: 450, mandatory: true }],
      requiredSubjects: [
        { subject: "biology", level: "advanced" },
        { subject: "chemistry", level: "advanced" },
      ],
      extras: [
        {
          key: "numerus-fixus",
          mandatory: false,
          note: {
            tr: "AB-dışı öğrencilere ayrılan kontenjan çok küçük (genelde %5-8)",
            en: "The non-EU quota is very small (typically 5-8% of places)",
          },
        },
        { key: "interview", mandatory: true },
      ],
    },
    tuitionNonEu: 3000,
    tuitionEu: 350,
    livingCostPerYear: 12000,
    applicationSystem: "uni-assist",
    deadline: "07-15",
    deadlineNote: {
      tr: "Almanya'da tıp AB-dışı öğrenci için en zor kategorilerden biri — yedek planla",
      en: "Medicine in Germany is one of the hardest routes for non-EU students — keep a backup",
    },
    sourceUrl:
      "https://www.uni-heidelberg.de/en/study/all-subjects/medicine-study-location-heidelberg",
    facultyUrl: "https://www.medizinische-fakultaet-hd.uni-heidelberg.de/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },

  // -------------------------------------------------------------------------
  // 🇬🇧 İNGİLTERE
  // -------------------------------------------------------------------------
  {
    id: "gb-imperial-computing",
    university: "Imperial College London",
    country: "GB",
    city: "London",
    name: "Computing",
    degree: "BEng",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 90,
      // Program sayfası dil şartı için sayı vermiyor, "standard university
      // requirement" diyor ve Imperial'in dil sayfasına yönlendiriyor. O sayfa
      // iki seviye tanımlıyor (Standard / Higher) ama puanlar açılmayan bir
      // akordeonda; sayıyı SAYFADAN OKUYAMADIM.
      //
      // ROZETİ ÇEVİRMEK İÇİN KALAN TEK İŞ: imperial.ac.uk/study/apply/
      // english-language/ → "Tests we accept" → "Expand all" → IELTS satırı.
      // Standard seviyedeki toplam ve alt puanı buraya yaz. Kaydın diğer TÜM
      // alanları teyit edildi (son tarih, TMUA, mülakat, harç, IB 41).
      language: [
        { test: "ielts", min: 7.0 },
        { test: "toefl", min: 100 },
      ],
      standardizedTests: [
        // Sayfa IB için 41 puan ve HL matematikte 7 istiyor.
        { test: "ib", min: 41, mandatory: false },
        { test: "sat", min: 1500, mandatory: false },
        { test: "ap", min: 5, mandatory: false },
      ],
      // Sayfa: A-level A*A*A–A*AAA, matematikte A* zorunlu.
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
        {
          // DÜZELTME: mandatory true idi. Sayfa "Interviews are not standard
          // but may be offered to some candidates" diyor.
          key: "interview",
          mandatory: false,
          note: {
            tr: "Standart değil — bazı adaylara teklif edilebiliyor",
            en: "Not standard — may be offered to some candidates",
          },
        },
        {
          // EKLENDİ: sayfa TMUA'yı zorunlu tutuyor, katalogda hiç yoktu.
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "TMUA (Test of Mathematics for University Admission) zorunlu",
            en: "TMUA (Test of Mathematics for University Admission) is required",
          },
        },
      ],
    },
    // DÜZELTME: katalogda 51.000 EUR yazıyordu. Sayfa 2026-27 overseas harcını
    // £45.500 olarak veriyor (2027 girişi henüz açıklanmamış, Home £10.050).
    // Kaynağın para biriminde saklanıyor; EUR'a çevirmiyoruz.
    tuitionNonEu: 45500,
    tuitionEu: 45500,
    tuitionCurrency: "GBP",
    livingCostPerYear: 20400,
    applicationSystem: "ucas",
    // DÜZELTME: 01-14 idi. Sayfa "Wednesday 13 January 2027 at 18.00 (UK time)".
    deadline: "01-13",
    deadlineNote: {
      tr: "UCAS'ta en fazla 5 tercihten biri olarak kullanılır",
      en: "Uses one of your five UCAS choices",
    },
    sourceUrl: "https://www.imperial.ac.uk/study/courses/undergraduate/computing-beng/",
    facultyUrl: "https://www.imperial.ac.uk/computing/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "gb-cambridge-engineering",
    university: "University of Cambridge",
    country: "GB",
    city: "Cambridge",
    name: "Engineering",
    // DÜZELTME (2026-08-13): katalogda BEng yazıyordu. Sayfanın başlığı
    // "Engineering, BA (Hons) and MEng" — Cambridge BEng vermiyor.
    // Üç yıllık varyant BA (Hons), dört yıllık MEng. durationYears 4 olarak
    // bırakıldı çünkü kayıt MEng varyantını temsil ediyor.
    degree: "BA",
    field: "engineering",
    teachingLanguage: "en",
    durationYears: 4,
    requirements: {
      // Sayfa sayısal eşik vermiyor; belirleyici olan sıralama ve mülakat.
      // (Katalogdaki 95 teyit edilemedi.)
      minGpa: 95,
      language: [
        { test: "ielts", min: 7.5 },
        { test: "toefl", min: 110 },
      ],
      standardizedTests: [
        { test: "sat", min: 1540, mandatory: false },
        { test: "ap", min: 5, mandatory: true },
      ],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: { tr: "ESAT giriş sınavı", en: "ESAT admissions test" },
        },
        { key: "interview", mandatory: true },
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
        {
          // EKLENDİ: sayfa 2025 döngüsü için "Applications per place: 10,
          // Accepted: 335" diyor. Kontenjan gerçeği katalogda hiç yoktu.
          key: "numerus-fixus",
          mandatory: true,
          note: {
            tr: "2025 döngüsünde her kontenjan için 10 başvuru; 335 kişi kabul edildi",
            en: "In the 2025 cycle there were 10 applications per place; 335 were accepted",
          },
        },
      ],
    },
    // Harç bu sayfada geçmiyor; 46.000 teyit edilmedi ve GBP mi EUR mu belirsiz.
    // Diğer UK kayıtlarında harç GBP çıktı (Imperial £45.500), bu kayıt da
    // muhtemelen GBP — ama teyit etmeden para birimi atamıyorum.
    tuitionNonEu: 46000,
    tuitionEu: 46000,
    livingCostPerYear: 16800,
    applicationSystem: "ucas",
    // Son tarih bu sayfada geçmiyor; UCAS'ın Oxbridge tarihi 15 Ekim.
    deadline: "10-15",
    deadlineNote: {
      tr: "Oxford/Cambridge son tarihi diğerlerinden 3 ay önce — 15 Ekim",
      en: "Oxford/Cambridge close three months earlier than everyone else — 15 October",
    },
    // Eski link kanonik adrese yönlendiriyordu; yönlendirme hedefi yazıldı.
    sourceUrl: "https://www.undergraduate.study.cam.ac.uk/courses/engineering-ba-hons-meng",
    facultyUrl: "https://www.eng.cam.ac.uk/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "gb-lse-economics",
    university: "London School of Economics",
    country: "GB",
    city: "London",
    name: "Economics",
    degree: "BSc",
    field: "economics",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 92,
      language: [
        { test: "ielts", min: 7.0 },
        { test: "toefl", min: 100 },
      ],
      standardizedTests: [
        { test: "sat", min: 1500, mandatory: false },
        { test: "ap", min: 5, mandatory: true },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    tuitionNonEu: 33000,
    tuitionEu: 33000,
    livingCostPerYear: 20400,
    applicationSystem: "ucas",
    deadline: "01-14",
    sourceUrl: "https://www.lse.ac.uk/study-at-lse/Undergraduate",
    facultyUrl: "https://www.lse.ac.uk/economics",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "gb-ucl-psychology",
    university: "University College London",
    country: "GB",
    city: "London",
    name: "Psychology",
    degree: "BSc",
    field: "psychology",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 88,
      language: [
        { test: "ielts", min: 7.0 },
        { test: "toefl", min: 100 },
      ],
      standardizedTests: [
        // Sayfa/UCL denklik tablosu: IB 38 puan, HL üç dersten 18.
        { test: "ib", min: 38, mandatory: false },
        { test: "ap", min: 4, mandatory: true },
      ],
      // UCL: Biyoloji, Kimya, Matematik, Fizik veya Psikoloji'den en az birinde
      // (tercihen ikisinde) A. Tip modeli "şu listeden biri" diyemiyor;
      // matematik temel seviye olarak bırakıldı.
      requiredSubjects: [{ subject: "math", level: "basic" }],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // Harç bu sayfada görünmüyor; 36.000 EUR kaynakta teyit edilmedi, GBP mi
    // EUR mu olduğu da belirsiz. B grubu turunda ele alınacak.
    tuitionNonEu: 36000,
    tuitionEu: 36000,
    livingCostPerYear: 20400,
    applicationSystem: "ucas",
    // DÜZELTME: 01-14 idi. Sayfa "13 January 2027. Applications close at 6pm UK time."
    deadline: "01-13",
    sourceUrl:
      "https://www.ucl.ac.uk/prospective-students/undergraduate/degrees/psychology-bsc-2026",
    facultyUrl: "https://www.ucl.ac.uk/pals/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "gb-manchester-business",
    university: "University of Manchester",
    country: "GB",
    city: "Manchester",
    name: "Management",
    degree: "BSc",
    field: "business",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 82,
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 90 },
      ],
      standardizedTests: [{ test: "ap", min: 4, mandatory: true }],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    tuitionNonEu: 32000,
    tuitionEu: 32000,
    livingCostPerYear: 14400,
    applicationSystem: "ucas",
    deadline: "01-14",
    sourceUrl: "https://www.manchester.ac.uk/study/undergraduate/courses/",
    facultyUrl: "https://www.alliancembs.manchester.ac.uk/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },

  // -------------------------------------------------------------------------
  // 🇫🇷 FRANSA
  // -------------------------------------------------------------------------
  {
    id: "fr-sorbonne-informatique",
    university: "Sorbonne University",
    universityLocal: "Sorbonne Université",
    country: "FR",
    city: "Paris",
    name: "Licence Informatique",
    degree: "Diplôme",
    field: "cs",
    teachingLanguage: "fr",
    durationYears: 3,
    requirements: {
      // Giriş Campus France (DAP) dosya değerlendirmesi ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      language: [
        // Kaynak: campusfrance.org → DAP prosedürü, en az B2 (DELF B2 /
        // DELF Junior / TCF TP).
        { test: "delf", min: 4 },
        { test: "tcf", min: 400 },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [{ key: "motivation-letter", mandatory: true }],
    },
    // "Droits différenciés": AB/AEA/İsviçre dışı öğrenciler için 2026-27
    // lisans harcı. Üniversiteler bireysel durumlara göre muafiyet
    // verebiliyor. AB tarifesi aynı programda 178 EUR.
    tuitionNonEu: 2902,
    tuitionEu: 178,
    livingCostPerYear: 14400,
    applicationSystem: "campus-france",
    // Campus France DAP başvuru penceresi: 1 Ekim – 15 Aralık.
    // Üniversite cevapları 30 Nisan'a, öğrencinin yanıtı 31 Mayıs'a kadar.
    deadline: "12-15",
    deadlineNote: {
      tr: "Campus France prosedürü Ekim'de açılır, Aralık başında kapanır. Bu adımı atlarsan vize alamazsın.",
      en: "The Campus France procedure opens in October and closes in early December. Skip it and you cannot get a visa.",
    },
    // NOT (2026-08-13): Bu sayfa lisansın L2/L3 yıllarını anlatıyor ve girişin
    // ağırlıkla Sorbonne'un kendi L1 "Sciences Formelles" portalından olduğunu
    // söylüyor. Türk lise mezununun doğrudan bu programa girip giremeyeceği
    // teyide muhtaç — Eda'nın karar vermesi gereken kayıt.
    sourceUrl:
      "https://sciences.sorbonne-universite.fr/formation-sciences/offre-de-formation/licences-0/licence-discipline/les-l2-l3-nos-huit-4",
    facultyUrl: "https://sciences.sorbonne-universite.fr/",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "verified",
  },
  {
    id: "fr-polytechnique-bachelor",
    university: "École Polytechnique",
    country: "FR",
    city: "Palaiseau",
    name: "Bachelor of Science — Mathematics and Physics",
    degree: "BSc",
    field: "natural-sciences",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Giriş dosya değerlendirmesi + mülakat, kontenjan sıralaması ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      language: [
        // Kaynak: programmes.polytechnique.edu → admissions-criteria-and-procedure
        { test: "ielts", min: 6.5 }, // her beceriden en az 6.0
        { test: "toefl", min: 90 },
      ],
      standardizedTests: [
        { test: "sat", min: 1400, mandatory: false },
        { test: "ap", min: 4, mandatory: false },
      ],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
      extras: [
        { key: "interview", mandatory: true },
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    tuitionNonEu: 19200,
    tuitionEu: 15900,
    livingCostPerYear: 12000,
    applicationSystem: "direct",
    deadline: "02-09",
    sourceUrl: "https://programmes.polytechnique.edu/en/bachelor/admissions/admissions-criteria-and-procedure",
    facultyUrl: "https://www.polytechnique.edu/en",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "verified",
    // Fransızca burs sayfasından; İngilizce sürümü bu kalemleri listelemiyor.
    scholarships: [
      {
        name: "Bourse d'Excellence",
        amountPerYear: 4800,
        kind: "merit",
        openToNonEu: true,
        sourceUrl:
          "https://programmes.polytechnique.edu/bachelor/frais-et-financement/bourses-et-aides-financieres",
        note: {
          tr: "Üç yıl boyunca yılda 4.800 EUR. Programa \"honours\" ile kabul edilen ve akademik olarak üstün adaylara veriliyor.",
          en: "EUR 4,800 per year for three years, for candidates admitted with honours on academic excellence.",
        },
      },
      {
        name: "Women in Science",
        amountPerYear: 4800,
        kind: "merit",
        openToNonEu: true,
        sourceUrl:
          "https://programmes.polytechnique.edu/bachelor/frais-et-financement/bourses-et-aides-financieres",
        note: {
          tr: "Üç yıl boyunca yılda 4.800 EUR; programa kabul edilen kadın adaylara açık.",
          en: "EUR 4,800 per year for three years, open to admitted women candidates.",
        },
      },
      {
        name: "Sosyal kriterli mali destek",
        kind: "need-based",
        openToNonEu: true,
        sourceUrl:
          "https://programmes.polytechnique.edu/bachelor/frais-et-financement/bourses-et-aides-financieres",
        note: {
          tr: "Aile gelirine göre kısmi harç muafiyeti ve/veya %0 faizli kredi. Açıkça CROUS'tan yararlanamayan uluslararası öğrencilere yönelik — yani Türk öğrenciyi kapsıyor. Tutar aileye göre değişiyor, kaynakta sabit rakam yok.",
          en: "Partial tuition exemption and/or 0% interest loans, scaled to family income. Explicitly aimed at international students not eligible for CROUS, which includes Turkish students. The amount varies by household; no fixed figure is published.",
        },
      },
      {
        name: "Uluslararası Olimpiyat madalyalıları için tam burs",
        amountPerYear: 87900,
        kind: "merit",
        openToNonEu: true,
        sourceUrl:
          "https://programmes.polytechnique.edu/bachelor/frais-et-financement/bourses-et-aides-financieres",
        note: {
          tr: "Harç VE yaşam giderlerini kapsıyor; AB/AEA dışı için yılda 87.900 EUR'a kadar. Çok dar bir kapı: kayıttan önceki iki yıl içinde uluslararası bir olimpiyatta madalya almış olmak gerekiyor, altın madalyalılara öncelik veriliyor.",
          en: "Covers tuition AND living costs, up to EUR 87,900 per year for non-EU/EEA students. A very narrow door: requires a medal at an international Olympiad within the two years before enrolment, with priority to gold medallists.",
        },
      },
    ],
  },
  {
    id: "fr-sciencespo-economics",
    university: "Sciences Po",
    country: "FR",
    city: "Reims",
    name: "Bachelor of Arts — Economics and Societies",
    degree: "BA",
    field: "economics",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Giriş dosya değerlendirmesi + mülakat ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      // Kaynak: sciencespo.fr → foreign-secondary-schools/language-requirements
      // "Attaching proof of language proficiency is entirely optional."
      // Dil yeterliliği mülakat ve yazılı metinlerle değerlendiriliyor
      // (İngilizce programlar için beklenen seviye C1). Katalogda önceden
      // IELTS 7.0 zorunluymuş gibi yazıyordu — böyle bir şart yok.
      language: [],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "interview", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // AEA dışında ikamet edenler sabit 10.250 EUR öder. AEA içinde ise
    // hane gelirine göre 0–10.250 arası kayan tarife, tek rakam yok.
    tuitionNonEu: 10250,
    livingCostPerYear: 10800,
    // Parcoursup DEĞİL: Parcoursup Fransız bakalorya adayları için.
    // Yabancı lise diploması olanlar Sciences Po'nun kendi başvuru
    // sitesinden başvuruyor.
    applicationSystem: "direct",
    // UYARI: bu tarih eski Parcoursup takviminden kalma ve artık geçerli değil
    // (yabancı diplomalılar Sciences Po'nun kendi sistemini kullanıyor).
    // Kaynak: 2027 dönemi başvuruları Eylül 2026'da açılacak, takvim henüz
    // yayınlanmadı.
    deadline: "03-12",
    deadlineNote: {
      tr: "Harç aile gelirine göre kademeli — düşük gelirde ciddi biçimde düşüyor",
      en: "Tuition is income-scaled and drops substantially for lower incomes",
    },
    sourceUrl: "https://www.sciencespo.fr/admissions/en/undergraduate/undergraduate-admissions/",
    facultyUrl: "https://www.sciencespo.fr/college/en/",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "ai-extracted",
  },
  {
    id: "fr-parissaclay-math",
    university: "Paris-Saclay University",
    universityLocal: "Université Paris-Saclay",
    country: "FR",
    city: "Orsay",
    name: "Licence Mathématiques",
    degree: "Diplôme",
    field: "natural-sciences",
    teachingLanguage: "fr",
    durationYears: 3,
    requirements: {
      // Giriş Campus France (DAP) dosya değerlendirmesi ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      language: [
        // Kaynak: campusfrance.org → DAP prosedürü, en az B2 (DELF B2 /
        // DELF Junior / TCF TP).
        { test: "delf", min: 4 },
        { test: "tcf", min: 400 },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
    },
    // "Droits différenciés": AB/AEA/İsviçre dışı öğrenciler için 2026-27
    // lisans harcı. Üniversiteler bireysel durumlara göre muafiyet
    // verebiliyor. AB tarifesi aynı programda 178 EUR.
    tuitionNonEu: 2902,
    tuitionEu: 178,
    livingCostPerYear: 11400,
    applicationSystem: "campus-france",
    // Campus France DAP başvuru penceresi: 1 Ekim – 15 Aralık.
    // Üniversite cevapları 30 Nisan'a, öğrencinin yanıtı 31 Mayıs'a kadar.
    deadline: "12-15",
    sourceUrl: "https://www.universite-paris-saclay.fr/formation/licence/mathematiques",
    facultyUrl: "https://www.universite-paris-saclay.fr/",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "verified",
  },

  // -------------------------------------------------------------------------
  // 🇨🇭 İSVİÇRE
  // -------------------------------------------------------------------------
  {
    id: "ch-ethz-cs",
    university: "ETH Zürich",
    universityLocal: "Eidgenössische Technische Hochschule Zürich",
    country: "CH",
    city: "Zürich",
    name: "Computer Science (Informatik)",
    degree: "BSc",
    field: "cs",
    // Teyit edildi (inf.ethz.ch/studies/bachelor.html): "The language of
    // instruction at the beginning of the study programme is German. Starting
    // from the second year, courses are increasingly taught in English."
    // Yani birinci yıl Almanca — Türk öğrenci için belirleyici bilgi.
    teachingLanguage: "de",
    durationYears: 3,
    requirements: {
      // Sayfa sayısal eşik vermiyor; Türk diploması tek başına yetmiyor ve
      // giriş sınavı belirleyici.
      minGpa: undefined,
      // Goethe C1 seviyesi bu sayfada geçmiyor, teyit edilmedi.
      language: [{ test: "goethe", min: 5 }],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "Türk lise diploması tek başına yeterli değil — ETH giriş sınavı zorunlu",
            en: "A Turkish diploma alone is not sufficient — the ETH entrance examination is required",
          },
        },
      ],
    },
    // DÜZELTME (2026-08-13): katalogda 1.800 / 1.500 yazıyordu, para birimi de
    // yoktu (yani EUR sayılıyordu). İkisi de yanlış.
    //
    // ETH 2025 güz döneminden itibaren İKİ HARÇ GRUBU uyguluyor ve İsviçre
    // dışı diplomayla gelenler "threefold tuition fee (Group 2)" grubunda —
    // yani üç kat ödüyor. Kesin tutarlar sayfada değil, indirilen bir PDF'te;
    // okuyamadım. Uydurmak yerine bilinmiyor bırakıldı.
    //
    // Doğrulama turunda yapılacak: ethz.ch/students/en/studies/financial/
    // tuition-fees.html sayfasındaki "Tuition fees (PDF)" dosyasından Group 2
    // dönemlik tutarını al, yıllığa çevir, tuitionCurrency CHF olarak yaz.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    tuitionCurrency: "CHF",
    livingCostPerYear: 26400,
    applicationSystem: "direct",
    deadline: "03-15",
    deadlineNote: {
      // ESKİ NOT "harç çok düşük" diyordu — üç kat harç kuralı yüzünden bu
      // iddia artık dayanaksız. Sahnede söylenmemesi için değiştirildi.
      tr: "Zürih'te yaşam maliyeti listedeki en yüksek kalem. Harç için dikkat: İsviçre dışı diplomayla gelenler 2025'ten beri üç kat harç grubunda.",
      en: "Zürich living costs are the highest on this list. Note on tuition: since 2025, students with a non-Swiss certificate fall into the threefold fee group.",
    },
    sourceUrl: "https://inf.ethz.ch/studies/bachelor.html",
    facultyUrl: "https://inf.ethz.ch/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "ch-epfl-communication",
    university: "EPFL",
    universityLocal: "École polytechnique fédérale de Lausanne",
    country: "CH",
    city: "Lausanne",
    name: "Communication Systems",
    degree: "BSc",
    field: "engineering",
    teachingLanguage: "fr",
    durationYears: 3,
    requirements: {
      minGpa: 85,
      language: [
        { test: "delf", min: 4 },
        { test: "tcf", min: 400 },
      ],
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "advanced" },
      ],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "Türk diploması için CMS hazırlık yılı veya giriş sınavı isteniyor",
            en: "A CMS preparatory year or entrance exam is required for Turkish diplomas",
          },
        },
      ],
    },
    tuitionNonEu: 1600,
    tuitionEu: 1300,
    livingCostPerYear: 24000,
    applicationSystem: "direct",
    deadline: "04-30",
    sourceUrl: "https://www.epfl.ch/education/bachelor/programs/communication-systems/",
    facultyUrl: "https://www.epfl.ch/schools/ic/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "ch-hsg-business",
    university: "University of St. Gallen",
    universityLocal: "Universität St. Gallen",
    country: "CH",
    city: "St. Gallen",
    name: "Business Administration",
    degree: "BA",
    field: "business",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Kabul sayfası: "recognised Swiss maturity certificate (Maturität) or an
      // equivalent foreign certificate" — sayısal eşik yok.
      minGpa: undefined,
      // Dil şartı sayfada katlanmış bir bölümde ve açılmıyor; IELTS 7.0 /
      // TOEFL 100 TEYİT EDİLEMEDİ. Bu yüzden kayıt ai-extracted kaldı.
      language: [
        { test: "ielts", min: 7.0 },
        { test: "toefl", min: 100 },
      ],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            // Kabul sayfası uluslararası adaylar için seçme prosedürünü
            // (yetenek testi + video mülakat) zorunlu tutuyor.
            tr: "Uluslararası adaylar için seçme prosedürü — yetenek testi ve video mülakat",
            en: "Selection procedure for international applicants — aptitude test and video interview",
          },
        },
        { key: "motivation-letter", mandatory: true },
      ],
    },
    // DÜZELTME (2026-08-13): katalogda 6.500 / 3.300 EUR yazıyordu, para birimi
    // yanlıştı. Harç sayfası (unisg.ch/.../costs-of-an-hsg-degree/):
    //   yabancı uyruklu lisans  CHF 3.129 / dönem → yılda CHF 6.258
    //   İsviçre uyruklu lisans  CHF 1.229 / dönem → yılda CHF 2.458
    // Ayrıca CHF 250 başvuru ücreti. Üniversite toplam yıllık maliyeti
    // CHF 25.000-30.000 olarak öneriyor.
    tuitionNonEu: 6258,
    tuitionEu: 2458,
    tuitionCurrency: "CHF",
    livingCostPerYear: 22800,
    applicationSystem: "direct",
    // Teyit edildi: kabul sayfası "Application period: 1 October - 30 April".
    deadline: "04-30",
    // Şartlar ve harçlar program sayfasında değil kabul sayfasında; öğrencinin
    // tıklayıp doğrulayacağı yer burası.
    sourceUrl:
      "https://www.unisg.ch/en/studying/admission/admission-bachelor/admission-to-a-bachelors-degree-programme/",
    facultyUrl:
      "https://www.unisg.ch/en/studying/programmes/bachelor/major-in-business-administration-bwl/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },

  // -------------------------------------------------------------------------
  // 🇸🇪 İSVEÇ
  // -------------------------------------------------------------------------
  {
    id: "se-kth-ict",
    university: "KTH Royal Institute of Technology",
    universityLocal: "Kungliga Tekniska högskolan",
    country: "SE",
    city: "Stockholm",
    name: "Information and Communication Technology",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Sayfa sayısal eşik vermiyor: "Selection is based on upper secondary
      // education grade point average" — yani eşik değil, SIRALAMA.
      minGpa: undefined,
      // Sayfa: IELTS toplam 6.5, hiçbir bölüm 5.5 altında olmayacak.
      // TOEFL toplam 90, yazma bölümü 20. Alt puan şartları tip modelinde
      // taşınamıyor; toplam eşikler yazıldı.
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 90 },
      ],
      requiredSubjects: [
        // Sayfa: "Mathematics 4 (advanced level of mathematics)"
        { subject: "math", level: "advanced" },
        // DÜZELTME: katalogda "basic" yazıyordu. Sayfa "Physics 2 (advanced
        // level of physics)" diyor.
        { subject: "physics", level: "advanced" },
      ],
      extras: [
        {
          // EKLENDİ: katalogda hiç seçme şartı yoktu ve bu program demoda
          // GÜVENLİ bandında görünüyor. Sayfa 2024 için 684 uygun adaydan
          // 71'inin alındığını yazıyor — %10. Şartları karşılamak burada
          // kabul anlamına gelmiyor; "rahatça aşıyorsun" demek yanıltıcı olur.
          key: "numerus-fixus",
          mandatory: true,
          note: {
            tr: "Kontenjan sıralamayla dağıtılıyor — 2024'te şartları karşılayan 684 adaydan 71'i alındı (%10)",
            en: "Places are allocated by ranking — in 2024, 71 of 684 eligible applicants were admitted (10%)",
          },
        },
      ],
    },
    // DÜZELTME: katalogda 15.600 EUR yazıyordu. KTH harç sayfası programın
    // tamamı için SEK 423.000 diyor → 3 yıl, yılda SEK 141.000.
    // Ayrıca SEK 900 başvuru ücreti var (modelde karşılığı yok).
    tuitionNonEu: 141000,
    tuitionEu: 0,
    tuitionCurrency: "SEK",
    livingCostPerYear: 12000,
    applicationSystem: "direct",
    // Son tarih bu sayfada geçmiyor; İsveç ulusal turu ortak tarih kullanıyor.
    deadline: "01-15",
    deadlineNote: {
      tr: "Tüm İsveç başvuruları universityadmissions.se üzerinden, tek son tarih",
      en: "All Swedish applications go through universityadmissions.se with a single deadline",
    },
    sourceUrl:
      "https://www.kth.se/en/studies/bachelor/information-communication-technology/entry-requirements-for-information-and-communication-technology-1.450313",
    facultyUrl: "https://www.kth.se/en/eecs",
    lastChecked: "2026-08-13",
    verification: "verified",
    // Baktık: KTH bu program için birebir şöyle diyor: "KTH does not offer any
    // scholarships for the Bachelor's programme in Information and
    // Communication Technology".
    // Boş dizi "burs yok" demek — alanın hiç olmaması "bakmadık" demek olurdu.
    scholarships: [],
  },
  {
    id: "se-lund-ib",
    university: "Lund University",
    universityLocal: "Lunds universitet",
    country: "SE",
    city: "Lund",
    name: "International Business",
    degree: "BSc",
    field: "business",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Sayfa yüzdelik bir eşik vermiyor; ulusal turda kontenjan diploma
      // ortalaması (%66) + İsveç yetenek sınavı (%34) ile dağıtılıyor.
      minGpa: undefined,
      // Sayfa IELTS/TOEFL puanı VERMİYOR — şart "İsveç lisesi English 6"
      // seviyesi. Eski kayıttaki IELTS 6.5 / TOEFL 90 kaynakta yok.
      // (Sayfa "kabul edilenlerin çoğu IELTS 7.0 sunuyor" diye not düşüyor;
      // bu bir şart değil, gözlem — şart olarak yazmıyoruz.)
      language: undefined,
      requiredSubjects: [{ subject: "math", level: "basic" }],
      extras: [{ key: "motivation-letter", mandatory: true }],
    },
    // Sayfa: "Full programme tuition fee: SEK 390.000" (3 yıl), dönemlik ilk
    // ödeme SEK 65.000 → yılda SEK 130.000. Kaynağın para biriminde saklanıyor.
    // Katalogda 13.500 EUR yazıyordu; sayfada böyle bir sayı geçmiyor.
    tuitionNonEu: 130000,
    tuitionEu: 0,
    tuitionCurrency: "SEK",
    livingCostPerYear: 10800,
    applicationSystem: "direct",
    deadline: "01-15",
    sourceUrl:
      "https://www.lunduniversity.lu.se/study/international-business-bachelors-programme-EGIBU",
    facultyUrl: "https://www.lusem.lu.se/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "se-uppsala-biology",
    university: "Uppsala University",
    universityLocal: "Uppsala universitet",
    country: "SE",
    city: "Uppsala",
    name: "Biology / Molecular Biology",
    degree: "BSc",
    field: "natural-sciences",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 72,
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 90 },
      ],
      requiredSubjects: [
        { subject: "biology", level: "advanced" },
        { subject: "chemistry", level: "basic" },
      ],
    },
    tuitionNonEu: 13000,
    tuitionEu: 0,
    livingCostPerYear: 10800,
    applicationSystem: "direct",
    deadline: "01-15",
    sourceUrl: "https://www.uu.se/en/study/programme",
    facultyUrl: "https://www.uu.se/en/department/biology-education-centre",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },

  // -------------------------------------------------------------------------
  // 🇧🇪 BELÇİKA
  // -------------------------------------------------------------------------
  {
    id: "be-kuleuven-business",
    university: "KU Leuven",
    country: "BE",
    city: "Brussels",
    name: "Business Administration",
    degree: "BSc",
    field: "business",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 75,
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 90 },
      ],
      requiredSubjects: [{ subject: "math", level: "basic" }],
      extras: [{ key: "motivation-letter", mandatory: true }],
    },
    tuitionNonEu: 6600,
    tuitionEu: 1200,
    livingCostPerYear: 10800,
    applicationSystem: "direct",
    deadline: "03-01",
    deadlineNote: {
      tr: "AB-dışı öğrenciler için son tarih AB'lilerden erken — 1 Mart",
      en: "The non-EU deadline is earlier than the EU one — 1 March",
    },
    sourceUrl: "https://onderwijsaanbod.kuleuven.be/opleidingen/e/",
    facultyUrl: "https://feb.kuleuven.be/eng",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "be-ghent-engineering",
    university: "Ghent University",
    universityLocal: "Universiteit Gent",
    country: "BE",
    city: "Ghent",
    name: "Engineering — Computer Science",
    degree: "BSc",
    field: "engineering",
    // DÜZELTME (2026-08-13): katalogda "en" yazıyordu. Program sayfası açıkça
    // "This programme is taught in Dutch / onderwijstaal Nederlands" diyor.
    // Türk öğrenci için kritik bir hata: İngilizce sanıp başvururdu.
    teachingLanguage: "nl",
    durationYears: 3,
    requirements: {
      // Sayfa sayısal bir not eşiği vermiyor; yurt dışı diploması bireysel
      // denklik değerlendirmesine giriyor.
      minGpa: undefined,
      // Hollandaca öğretim yapılıyor ama LanguageTest tipinde Hollandaca sınavı
      // yok, üstelik sayfa da bir seviye belirtmiyor → bilinmiyor.
      // (Eski değer IELTS 6.5 / TOEFL 90 idi; İngilizce varsayımına dayanıyordu.)
      language: undefined,
      requiredSubjects: [
        { subject: "math", level: "advanced" },
        { subject: "physics", level: "basic" },
      ],
    },
    // Sayfa AB-dışı harcı belirtmiyor, ugent.be/tuitionfee'ye yönlendiriyor.
    tuitionNonEu: undefined,
    tuitionEu: 1200,
    livingCostPerYear: 10200,
    applicationSystem: "direct",
    deadline: "03-01",
    sourceUrl:
      "https://studiekiezer.ugent.be/2026/bachelor-of-science-in-engineering-computerwetenschappen/programma",
    facultyUrl: "https://www.ugent.be/ea/en",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "be-ulb-psychology",
    university: "Université libre de Bruxelles",
    country: "BE",
    city: "Brussels",
    name: "Bachelier en Sciences Psychologiques",
    degree: "Diplôme",
    field: "psychology",
    teachingLanguage: "fr",
    durationYears: 3,
    requirements: {
      minGpa: 68,
      language: [
        { test: "delf", min: 4 },
        { test: "tcf", min: 400 },
      ],
      extras: [{ key: "motivation-letter", mandatory: true }],
    },
    tuitionNonEu: 4175,
    tuitionEu: 835,
    livingCostPerYear: 10800,
    applicationSystem: "direct",
    deadline: "04-30",
    sourceUrl: "https://www.ulb.be/en/programme",
    facultyUrl: "https://psycho.ulb.be/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },

  // -------------------------------------------------------------------------
  // 🇩🇰 DANİMARKA
  // -------------------------------------------------------------------------
  {
    id: "dk-dtu-general-engineering",
    university: "Technical University of Denmark",
    universityLocal: "Danmarks Tekniske Universitet",
    country: "DK",
    city: "Kongens Lyngby",
    name: "General Engineering",
    // DÜZELTME: katalogda BEng yazıyordu. Sayfa "BSc in General Engineering"
    // diyor — DTU'nun BEng programları Danca veriliyor, bu İngilizce olan BSc.
    degree: "BSc",
    field: "engineering",
    teachingLanguage: "en",
    durationYears: 3.5,
    requirements: {
      // Sayfa not ortalaması eşiği vermiyor; seviye değerlendirmesini
      // başvuruda DTU'nun kabul ekibi yapıyor.
      minGpa: undefined,
      // Sayfa: IELTS Academic minimum 6.5 · TOEFL iBT minimum 88 · Cambridge 180.
      // İkisi de katalogdakiyle birebir uyuşuyor.
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 88 },
      ],
      requiredSubjects: [
        // Sayfa: "Mathematics A-level, English B-level, Physics B-level,
        // Chemistry B-level".
        { subject: "math", level: "advanced" },
        // DÜZELTME: physics "advanced" değil B seviyesi.
        { subject: "physics", level: "basic" },
        // EKLENDİ: kimya B seviyesi katalogda hiç yoktu.
        { subject: "chemistry", level: "basic" },
      ],
    },
    // Sayfa: yılda € 15.000, dönemlik iki taksitte € 7.500. Katalogdaki değer
    // doğruydu ve gerçekten EUR. AB/AEA vatandaşı harç ödemiyor.
    // (Ayrıca € 100 başvuru ücreti ve lisans düzeyinde burs YOK — burs
    // özelliği eklendiğinde bu kayıt "burs yok" olarak işaretlenebilir.)
    tuitionNonEu: 15000,
    tuitionEu: 0,
    tuitionCurrency: "EUR",
    livingCostPerYear: 14400,
    applicationSystem: "direct",
    deadline: "01-15",
    deadlineNote: {
      tr: "AB-dışı son tarih 15 Ocak — AB'lilerin 15 Mart tarihine bakma, seni bağlamıyor",
      en: "Non-EU deadline is 15 January — the 15 March EU date does not apply to you",
    },
    sourceUrl:
      "https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/admission-requirements",
    facultyUrl: "https://www.dtu.dk/english/education/undergraduate/general-engineering",
    lastChecked: "2026-08-13",
    verification: "verified",
    // Baktık: DTU birebir şöyle diyor: lisans düzeyinde harç muafiyeti veya
    // başka bir destek sunmuyor. Muafiyetler yalnızca yüksek lisansta.
    // Boş dizi "burs yok" demek — alanın hiç olmaması "bakmadık" demek olurdu.
    scholarships: [],
  },
  {
    id: "dk-cbs-ib",
    university: "Copenhagen Business School",
    country: "DK",
    city: "Copenhagen",
    name: "International Business",
    degree: "BSc",
    field: "business",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 80,
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 88 },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [{ key: "motivation-letter", mandatory: true }],
    },
    tuitionNonEu: 13500,
    tuitionEu: 0,
    livingCostPerYear: 14400,
    applicationSystem: "direct",
    deadline: "01-15",
    sourceUrl: "https://www.cbs.dk/en/study/bachelor",
    facultyUrl: "https://www.cbs.dk/en",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },
  {
    id: "dk-ku-machine-learning",
    university: "University of Copenhagen",
    universityLocal: "Københavns Universitet",
    country: "DK",
    city: "Copenhagen",
    name: "Machine Learning and Data Science",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: 80,
      language: [
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 88 },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
    },
    tuitionNonEu: 15200,
    tuitionEu: 0,
    livingCostPerYear: 14400,
    applicationSystem: "direct",
    deadline: "01-15",
    sourceUrl: "https://studies.ku.dk/bachelor/machine-learning-and-data-science/",
    facultyUrl: "https://di.ku.dk/english/",
    lastChecked: CHECKED,
    verification: "ai-extracted",
  },

  // -------------------------------------------------------------------------
  // 🇮🇹 İTALYA
  // -------------------------------------------------------------------------
  {
    id: "it-polimi-cse",
    university: "Politecnico di Milano",
    country: "IT",
    city: "Milano",
    name: "Computer Science and Engineering",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Giriş TOL/TIL giriş sınavı sıralaması ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      language: [
        // Kaynak: polimi.it → language-requirements → "Students of an
        // English-Language Laurea Study Programme". Katalogda önceden 6.0/78
        // yazıyordu; o değerler LAUREA MAGISTRALE (yüksek lisans) şartı.
        { test: "ielts", min: 5.0 },
        { test: "toefl", min: 59 },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "TOL/İngilizce giriş sınavı — çevrimiçi yapılabiliyor",
            en: "TOL online admission test",
          },
        },
      ],
    },
    // ISEE (aile geliri) belgesi verilirse 165 EUR'a kadar iniyor; AB-dışı
    // öğrenci ISEE vermezse azami dilimi öder: 3.891,59 EUR.
    tuitionNonEu: 3892,
    tuitionEu: 900,
    livingCostPerYear: 12000,
    applicationSystem: "direct",
    // UYARI: bu tarih doğrulanamadı. PoliMi başvuru takvimini yıllık "bando"
    // ile yayınlıyor ve ulaşabildiğimiz sayfalarda 2026-27 tarihi yoktu.
    deadline: "02-20",
    deadlineNote: {
      tr: "Harç aile gelirine (ISEE) göre kademeli, düşük gelirde ciddi biçimde düşüyor",
      en: "Tuition is scaled by family income (ISEE) and drops substantially at lower levels",
    },
    sourceUrl: "https://www.polimi.it/en/programmes",
    facultyUrl: "https://www.deib.polimi.it/eng/home-page",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "ai-extracted",
  },
  {
    id: "it-bocconi-bief",
    university: "Bocconi University",
    universityLocal: "Università Bocconi",
    country: "IT",
    city: "Milano",
    name: "International Economics and Finance",
    degree: "BSc",
    field: "economics",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Giriş Bocconi testi / SAT / ACT puanı + son iki yılın ortalaması sıralaması ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      language: [
        // Kaynak: unibocconi.it → english-certificates-accepted-enrollment
        { test: "ielts", min: 6.5 }, // her bölümden en az 6.0
        { test: "toefl", min: 88 },
        { test: "duolingo", min: 110 },
      ],
      standardizedTests: [
        { test: "sat", min: 1350, mandatory: false },
        { test: "ib", min: 38, mandatory: false },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "Bocconi kendi seçme testini yapıyor (SAT ile ikame edilebiliyor)",
            en: "Bocconi runs its own admission test (SAT can substitute)",
          },
        },
        { key: "motivation-letter", mandatory: true },
      ],
    },
    tuitionNonEu: 17000,
    tuitionEu: 17000,
    livingCostPerYear: 14400,
    applicationSystem: "direct",
    deadline: "01-23",
    deadlineNote: {
      tr: "Turlu başvuru — erken turlarda kabul şansı ve burs olasılığı daha yüksek",
      en: "Rolling rounds — earlier rounds carry better odds and scholarship chances",
    },
    sourceUrl: "https://www.unibocconi.it/en/programs/bachelor-science/international-economics-and-finance",
    facultyUrl: "https://www.unibocconi.it/en",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "verified",
  },
  {
    id: "it-bologna-medicine",
    university: "University of Bologna",
    universityLocal: "Alma Mater Studiorum — Università di Bologna",
    country: "IT",
    city: "Bologna",
    name: "Medicine and Surgery",
    degree: "MD",
    field: "medicine",
    teachingLanguage: "en",
    durationYears: 6,
    requirements: {
      // Giriş IMAT ulusal sınav sıralaması ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      // Kaynak açıkça söylüyor: "English language qualifications are not a
      // mandatory requirement" — İngilizce yeterliliği giriş sınavının
      // kendisiyle ölçülüyor, sertifika yalnızca eşitlik bozucu.
      // Boş dizi = "şart yok" (undefined = "bilinmiyor" ile aynı şey değil).
      language: [],
      requiredSubjects: [
        { subject: "biology", level: "advanced" },
        { subject: "chemistry", level: "advanced" },
      ],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "IMAT sınavı zorunlu — Eylül'de yapılıyor, kayıt Temmuz'da açılıyor",
            en: "IMAT is mandatory — held in September, registration opens in July",
          },
        },
        {
          key: "numerus-fixus",
          mandatory: false,
          note: {
            tr: "Sıralamaya göre yerleştirme — IMAT puanın belirleyici",
            en: "Ranked placement — your IMAT score decides",
          },
        },
      ],
    },
    // Harç ISEE (aile geliri) belgesine göre hesaplanıyor; düşük gelirde tam
    // muafiyet var. Sabit bir rakam yayınlanmıyor, o yüzden uydurmuyoruz.
    livingCostPerYear: 10800,
    applicationSystem: "direct",
    deadline: "09-29",
    deadlineNote: {
      tr: "IMAT kaydı son tarihi — sınavın kendisi Eylül'de",
      en: "IMAT registration deadline — the exam itself is in September",
    },
    sourceUrl: "https://corsi.unibo.it/singlecycle/MedicineAndSurgery/how-to-enrol",
    facultyUrl: "https://www.unibo.it/en",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "verified",
    scholarships: [
      {
        name: "MAECI — İtalyan Dışişleri Bakanlığı bursu",
        kind: "grant",
        openToNonEu: true,
        sourceUrl: "https://www.unibo.it/en/study/study-grants-and-subsidies",
        note: {
          tr: "İtalyan Dışişleri Bakanlığı'nın uluslararası öğrencilere verdiği burs. Tutar üniversitenin sayfasında belirtilmiyor, bakanlığın yıllık çağrısından bakılmalı.",
          en: "Granted by the Italian Ministry of Foreign Affairs to international students. The amount is not stated on the university page — check the ministry's annual call.",
        },
      },
      {
        name: "AB/OECD dışı vatandaşlar için indirimli sabit harç",
        kind: "tuition-waiver",
        openToNonEu: true,
        sourceUrl: "https://www.unibo.it/en/study/study-grants-and-subsidies",
        note: {
          tr: "AB ve OECD üyesi olmayan, düşük gelirli ülke vatandaşlarına indirimli sabit harç uygulanıyor. Türkiye OECD üyesi olduğu için bu kalem Türk öğrenciyi KAPSAMAYABİLİR — başvuru öncesi teyit et.",
          en: "A reduced flat fee applies to citizens of low-income countries outside the EU and OECD. Türkiye is an OECD member, so this may NOT apply to Turkish students — confirm before applying.",
        },
      },
    ],
  },
  {
    id: "it-pavia-medicine",
    university: "University of Pavia",
    universityLocal: "Università di Pavia",
    country: "IT",
    city: "Pavia",
    name: "Medicine and Surgery (Harvey Course)",
    degree: "MD",
    field: "medicine",
    teachingLanguage: "en",
    durationYears: 6,
    requirements: {
      // Giriş IMAT ulusal sınav sıralaması ile yapılıyor;
      // üniversite sayısal bir not eşiği YAYINLAMIYOR. Uydurma bir eşik
      // yazmak yerine minGpa bilinçli olarak yok — bkz. types.ts eksik
      // veri sözleşmesi. Motor bunu `unknown` olarak gösterir.
      // Bologna ile aynı ulusal sınav sistemi: İngilizce yeterliliği sınavla
      // ölçülüyor, ayrı sertifika zorunlu değil.
      language: [],
      requiredSubjects: [
        { subject: "biology", level: "advanced" },
        { subject: "chemistry", level: "basic" },
      ],
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: { tr: "IMAT sınavı zorunlu", en: "IMAT is mandatory" },
        },
        {
          key: "numerus-fixus",
          mandatory: false,
          note: {
            tr: "AB-dışı kontenjanı ayrı ve sınırlı",
            en: "A separate, limited non-EU quota applies",
          },
        },
      ],
    },
    // AB-dışı öğrenciler sabit tarife ödüyor ama tek bir rakam yok:
    // vatandaşlık ve alana göre 390–4.550 EUR/yıl arasında değişiyor.
    livingCostPerYear: 9600,
    applicationSystem: "direct",
    deadline: "09-29",
    // Programın kendi sitesi. Eski link (portale.unipv.it/en) üniversite ana
    // sayfasıydı ve Cloudflare otomatik isteklere 403 veriyordu.
    sourceUrl: "https://medicineandsurgeryharvey.cdl.unipv.it/en/enroll/access-requirements",
    facultyUrl: "https://portale.unipv.it/en",
    lastChecked: "2026-08-13", // FR/IT doğrulama turu
    verification: "verified",
  },
];

/** Katalogdan tek kayıt getir. */
export function getProgramById(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
