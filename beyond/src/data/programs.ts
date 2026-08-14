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
      // SİLİNDİ: 76 yazıyordu, bu sayfada eşik geçmiyor.
      minGpa: undefined,
      // SİLİNDİ: IELTS 6.5 / TOEFL 92 yazıyordu, bu sayfada geçmiyor.
      language: undefined,
      // SİLİNDİ: matematik ileri düzey yazılıydı, bu sayfada geçmiyor.
      requiredSubjects: undefined,
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
    // SİLİNDİ: 12.000 / 2.601 yazıyordu, bu sayfada harç geçmiyor.
    // (Sayfa AB-dışı öğrencilere açık Amsterdam Merit Scholarship'ten söz
    // ediyor: yılda € 6.000, toplam € 18.000 — burs alanına girecek ilk veri.)
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    livingCostPerYear: 14400,
    applicationSystem: "studielink",
    // DÜZELTME (2026-08-13): katalogda "04-01" yazıyordu. Sayfa açıkça
    // "There is an early application deadline: 15 January" diyor.
    // 2,5 ay geç bir tarih — bu kayda güvenen öğrenci yılı kaçırırdı.
    deadline: "01-15",
    sourceUrl:
      "https://www.uva.nl/en/programmes/bachelors/economics--business-economics/application-and-admission/international-prior-education/international-prior-education-english-track.html",
    facultyUrl: "https://www.uva.nl/en/education",
    lastChecked: "2026-08-14",
    verification: "verified",
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
    lastChecked: "2026-08-14",
    verification: "verified",
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
      // SİLİNDİ: 80 yazıyordu. Sayfa eşik vermiyor; seçim iki aşamalı EFV ile.
      minGpa: undefined,
      // SİLİNDİ: TestDaF 4 / Goethe C1 yazıyordu. Sayfa "Sehr gute Kenntnisse
      // in Deutsch und Englisch" diyor — yani hem Almanca hem İngilizce
      // gerekiyor ama SEVİYE ya da sınav puanı vermiyor.
      language: undefined,
      // SİLİNDİ: YKS 300 "zorunlu" yazılıydı, sayfada geçmiyor.
      standardizedTests: undefined,
      // SİLİNDİ: matematik ileri düzey yazılıydı. Sayfa "hohe Affinität zu
      // Mathematik" diyor — bu resmî bir ders şartı değil, beklenti.
      requiredSubjects: undefined,
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
    // SİLİNDİ: 4.000 / 300 yazıyordu, bu sayfada harç geçmiyor.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
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
    lastChecked: "2026-08-14",
    verification: "verified",
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
      // SİLİNDİ: 90 yazıyordu, sayfada not eşiği yok. Sayfanın verdiği şart
      // A-level A*A*A–A*AAA ve IB 41 — ikisi de 100'lük ölçekte bir eşik değil.
      minGpa: undefined,
      // SİLİNDİ: IELTS 7.0 / TOEFL 100 yazıyordu. Program sayfası sayı vermiyor,
      // "standard university requirement" diyip dil sayfasına yönlendiriyor;
      // o sayfadaki puanlar açılmayan bir akordeonda, okuyamadım.
      // Doldurmak için: imperial.ac.uk/study/apply/english-language/ →
      // "Tests we accept" → "Expand all" → IELTS satırı.
      language: undefined,
      standardizedTests: [
        // Teyit edildi: sayfa IB için 41 puan, HL matematikte 7 istiyor.
        { test: "ib", min: 41, mandatory: false },
        // SİLİNDİ: SAT 1500 ve AP 5 sayfada geçmiyordu.
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
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    id: "gb-cambridge-engineering",
    university: "University of Cambridge",
    country: "GB",
    city: "Cambridge",
    name: "Engineering",
    // DOĞRULANDI (2026-08-14): sayfa iki varyant sunuyor — "MEng 4 years" ve
    // "BA (Hons) 3 years". Önceki kayıt BA etiketiyle MEng'in süresini (4 yıl)
    // taşıyordu, bu kendi içinde çelişkiliydi. Modelde MEng yok; BA etiketini
    // gerçek süresiyle (3 yıl) eşleştirdik — uydurma yok, tip uyuşmazlığı yok.
    degree: "BA",
    field: "engineering",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // DOĞRULANDI: sayfa 100'lük eşik vermiyor, "A level: A*A*A" / "IB: 41-42
      // (776 HL)" diyor. Türk diploması için resmî bir denklik tablosu yok —
      // uydurmuyoruz.
      minGpa: undefined,
      language: [
        // DOĞRULANDI: english-language-requirements sayfası "IELTS Academic —
        // normally a minimum overall grade of 7.5, usually with 7.0 or above
        // in each element."
        { test: "ielts", min: 7.5 },
        // DÜZELTME: TOEFL kaldırıldı. Cambridge lisans başvurularında TOEFL'ı
        // KABUL ETMİYOR (sadece IELTS Academic, Cambridge C1/C2) — 110 uydurma
        // bir rakamdı, sınavın kendisi geçersizdi.
      ],
      // DÜZELTME: SAT/AP kaldırıldı. Cambridge'in course/entry-requirements
      // sayfalarında bu sınavlara dair hiçbir sayı yok.
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
        {
          // DOĞRULANDI: "Not everyone interviewed will be offered a place,
          // but everyone who is made an offer will have been interviewed."
          key: "interview",
          mandatory: true,
        },
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
        {
          key: "numerus-fixus",
          mandatory: true,
          note: {
            tr: "2025 döngüsünde her kontenjan için 10 başvuru; 335 kişi kabul edildi",
            en: "In the 2025 cycle there were 10 applications per place; 335 were accepted",
          },
        },
      ],
    },
    // DÜZELTME: international-fees-and-costs sayfası Engineering'i "Group 4"
    // içinde £44.214/yıl olarak veriyor (2026-27 girişi, kur sabit). Bu rakama
    // dahil olmayan ayrı bir college harcı da var (£11.500-14.950/yıl).
    tuitionNonEu: 44214,
    tuitionEu: 44214,
    tuitionCurrency: "GBP",
    livingCostPerYear: 16800,
    applicationSystem: "ucas",
    // DOĞRULANDI: application-dates-deadlines sayfası "15 October 2026, 6pm
    // UK time" diyor (2027 girişi) — programa özel değil, UCAS/üniversite
    // çapında bir tarih.
    deadline: "10-15",
    deadlineNote: {
      tr: "Oxford/Cambridge son tarihi diğerlerinden 3 ay önce — 15 Ekim",
      en: "Oxford/Cambridge close three months earlier than everyone else — 15 October",
    },
    sourceUrl: "https://www.undergraduate.study.cam.ac.uk/courses/engineering-ba-hons-meng",
    facultyUrl: "https://www.eng.cam.ac.uk/",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). Oxford katalogda HİÇ YOKTU — QS'te dünyada ilk üçte
    // ve mühendislik arayan bir öğrencinin listesinde bulunmaması büyük boşluk.
    // Şartlar mühendislik fakültesinin kendi sayfasından okundu.
    id: "gb-oxford-engineering",
    university: "University of Oxford",
    country: "GB",
    city: "Oxford",
    name: "Engineering Science",
    // MODEL EKSİĞİ: Oxford bu programda MEng veriyor ama tipte MEng yok
    // (BSc/BA/BEng/LLB/MD/Diplôme). En yakını olarak BEng yazıldı.
    degree: "BEng",
    field: "engineering",
    teachingLanguage: "en",
    durationYears: 4,
    requirements: {
      // Sayfa 100'lük eşik vermiyor. Teklif A-level A*A*A şartına bağlı.
      minGpa: undefined,
      // Sayfa dil şartı için sayı vermiyor, ayrı bir sayfaya yönlendiriyor.
      language: undefined,
      // A-level ve IB bölümleri katlanmış; ders şartlarını (matematik, fizik)
      // sayfada GÖREMEDİM, o yüzden yazılmadı. Doldurmak için sayfadaki
      // "A-Level (or equivalent)" ve "International Baccalaureate" bölümlerini aç.
      requiredSubjects: undefined,
      extras: [
        {
          // Teyit edildi: "All candidates must also take the Engineering and
          // Science Admissions Test (ESAT) as part of their application."
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "ESAT (Engineering and Science Admissions Test) — istisnasız tüm adaylar için zorunlu",
            en: "ESAT (Engineering and Science Admissions Test) — mandatory for all candidates without exception",
          },
        },
        {
          // Teyit edildi: kısa listeye girenler mülakata çağrılıyor ve mülakat
          // performansı değerlendirmeye giriyor.
          key: "interview",
          mandatory: true,
          note: {
            tr: "Kısa listeye girersen mülakata çağrılıyorsun; performansın değerlendirmeye giriyor",
            en: "If shortlisted you are interviewed, and your performance counts towards the decision",
          },
        },
        // Teyit edildi: sayfa UCAS niyet mektubuna ve akademik referansa
        // açıkça atıf yapıyor.
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // Harç bu sayfada geçmiyor.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    tuitionCurrency: "GBP",
    livingCostPerYear: 18000,
    applicationSystem: "ucas",
    // UCAS'ın Oxbridge son tarihi — programa değil sisteme ait bir tarih,
    // bu sayfada geçmiyor. Oxford ve Cambridge diğer üniversitelerden üç ay
    // önce kapanıyor.
    deadline: "10-15",
    deadlineNote: {
      tr: "Oxford/Cambridge son tarihi diğerlerinden üç ay önce — 15 Ekim. Ayrıca ikisine birden başvuramazsın.",
      en: "Oxford/Cambridge close three months before everyone else — 15 October. You also cannot apply to both.",
    },
    sourceUrl: "https://eng.ox.ac.uk/study/undergraduate/applications/entry-requirements",
    facultyUrl: "https://eng.ox.ac.uk/",
    lastChecked: "2026-08-14",
    verification: "verified",
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
      // DÜZELTME (2026-08-14): 92 uydurmaydı. LSE 100'lük eşik vermiyor —
      // teklif A*AA (A* Matematikte) ya da IB 39 (HL Matematikte 7).
      minGpa: undefined,
      language: [
        // DOĞRULANDI: "7.0 overall and 7.0 in each component (in one exam
        // sitting only)".
        { test: "ielts", min: 7.0 },
        // DOĞRULANDI: "100 overall, with a minimum of: 27 Writing, 25
        // Reading, 24 Listening, 24 Speaking" (2026 Ocak sonrası ölçek).
        { test: "toefl", min: 100 },
      ],
      standardizedTests: [
        // DÜZELTME: 1500 değil 1450 — ABD başvuranlar sayfası "SAT score of
        // 1450+" diyor. Zorunlu değil, A*AA teklif bandına giden alternatif
        // yollardan biri (diğerleri: IB, ACT 32+, 5 AP dahil AP Calc BC 5).
        { test: "sat", min: 1450, mandatory: false },
        { test: "ap", min: 5, mandatory: false },
      ],
      // DOĞRULANDI: A-level'da Matematikte A* şart; IB'de HL Matematikte 7;
      // AP yolunda AP Calculus BC'de 5.
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
        {
          // EKLENDİ: "Applicants are required to take the Test of
          // Mathematics for University Admission (TMUA). The test is
          // mandatory." Puan eşiği yayınlanmıyor (1-9 bant, kesim yok).
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "TMUA (Test of Mathematics for University Admission) zorunlu — LSE puan eşiği yayınlamıyor",
            en: "TMUA (Test of Mathematics for University Admission) is mandatory — LSE does not publish a score cut-off",
          },
        },
      ],
    },
    // DÜZELTME: kurs sayfası "2026/27 guide price £39,900" diyor (2027/28
    // henüz belirlenmedi). 33.000 eskiydi/uydurmaydı.
    tuitionNonEu: 39900,
    tuitionEu: 39900,
    tuitionCurrency: "GBP",
    livingCostPerYear: 20400,
    applicationSystem: "ucas",
    // DÜZELTME: 01-14, geçen döngünün (2026 girişi) tarihiydi. Güncel kurs
    // sayfası 2027 girişi için "13 January 2027" diyor.
    deadline: "01-13",
    // DÜZELTME: eski link genel bir iniş sayfasıydı, kursun kendisi değildi.
    sourceUrl: "https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-economics",
    facultyUrl: "https://www.lse.ac.uk/economics",
    lastChecked: "2026-08-14",
    verification: "verified",
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
      // SİLİNDİ: 88 yazıyordu, sayfada 100'lük ölçekte eşik yok.
      minGpa: undefined,
      // SİLİNDİ: IELTS 7.0 / TOEFL 100 yazıyordu, sayfada geçmiyor.
      language: undefined,
      standardizedTests: [
        // Teyit edildi: UCL denklik tablosu IB 38 puan, HL üç dersten 18.
        { test: "ib", min: 38, mandatory: false },
        // SİLİNDİ: AP 4 "zorunlu" olarak yazılıydı, sayfada geçmiyor.
      ],
      // SİLİNDİ: "matematik zorunlu" diye yazılıydı ama bu YANLIŞ bir iddiaydı.
      // Sayfa "Biyoloji, Kimya, Matematik, Fizik veya Psikoloji'den en az
      // birinde A" diyor — matematik seçeneklerden biri, şart değil. Tip modeli
      // "şu listeden biri" diyemediği için alan boş bırakıldı.
      requiredSubjects: undefined,
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // SİLİNDİ: 36.000 yazıyordu, sayfada harç görünmüyor ve para birimi de
    // belirsizdi. Diğer UK kayıtlarında harç GBP çıktı.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    livingCostPerYear: 20400,
    applicationSystem: "ucas",
    // DÜZELTME: 01-14 idi. Sayfa "13 January 2027. Applications close at 6pm UK time."
    deadline: "01-13",
    sourceUrl:
      "https://www.ucl.ac.uk/prospective-students/undergraduate/degrees/psychology-bsc-2026",
    facultyUrl: "https://www.ucl.ac.uk/pals/",
    lastChecked: "2026-08-14",
    verification: "verified",
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
      // DÜZELTME (2026-08-14): standart teklif AAA. Manchester'ın Türkiye'ye
      // özel resmî denklik tablosu "AAA → %85" diyor (onaylı okullardan
      // doğrudan giriş) — 82 uydurmaydı, 85 kaynaklı.
      minGpa: 85,
      language: [
        // DOĞRULANDI: "IELTS 6.5 with no less than 6 in any individual
        // component."
        { test: "ielts", min: 6.5 },
        // DOĞRULANDI: "90 overall with no less than 22 in any individual
        // component."
        { test: "toefl", min: 90 },
      ],
      standardizedTests: [
        // DÜZELTME: AP zorunlu değil — A-level/IB/Türk diploması gibi
        // alternatif yollardan biri, sadece o yoldan başvurana uygulanıyor.
        // Skor da yanlıştı: ABD denklik tablosunda AAA teklifi 5,5,5'e denk
        // geliyor (4 sadece AAB/ABB gibi daha düşük bantlarda yeterli).
        { test: "ap", min: 5, mandatory: false },
      ],
      requiredSubjects: [
        {
          // EKLENDİ: "must demonstrate ... equivalent to at least Grade 6 or
          // B in GCSE/IGCSE ... Mathematics" (ya da IB SL Matematik 5).
          // A-level düzeyinde değil, temel düzeyde bir kapı — Türk lise
          // müfredatı zaten karşılıyor.
          subject: "math",
          level: "basic",
        },
      ],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // DÜZELTME: kurs sayfası "£33,100 for the 2026/27 academic year" diyor.
    tuitionNonEu: 33100,
    tuitionEu: 33100,
    tuitionCurrency: "GBP",
    livingCostPerYear: 14400,
    applicationSystem: "ucas",
    // DÜZELTME: UCAS'ın 2027 girişi için eşit değerlendirme tarihi 13 Ocak
    // 2027 — 14 değil.
    deadline: "01-13",
    // DÜZELTME: eski link genel kurs arama sayfasıydı.
    sourceUrl: "https://www.manchester.ac.uk/study/undergraduate/courses/2026/03519/bsc-management/",
    facultyUrl: "https://www.alliancembs.manchester.ac.uk/",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). Katalogda İskoçya hiç yoktu ve Edinburgh QS'te
    // İngiltere'nin ilk beşinde. Şartlar sayfasından okundu.
    id: "gb-edinburgh-cs",
    university: "University of Edinburgh",
    country: "GB",
    city: "Edinburgh",
    name: "Computer Science",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 4,
    requirements: {
      // Sayfa 100'lük ölçekte eşik vermiyor; teklifler A-level ve IB
      // aralıkları olarak veriliyor.
      minGpa: undefined,
      // Teyit edildi: IELTS Academic toplam 6.5, her bölümde en az 5.5.
      // TOEFL yeni ölçekte toplam 4.5 (her bölüm en az 4.0) — tip modeli
      // iki farklı TOEFL ölçeğini ayırt edemediği için TOEFL yazılmadı.
      language: [{ test: "ielts", min: 6.5 }],
      standardizedTests: [
        // Sayfa: "from 43 points with 777 at HL to 34 points with 665 at HL".
        // Alt sınır olan 34 yazıldı — teklif aralığının tabanı.
        { test: "ib", min: 34, mandatory: false },
      ],
      // Teyit edildi: matematik zorunlu (A-level'da A, IB'de HL 6 ve yalnızca
      // Analysis & Approaches kabul ediliyor).
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [{ key: "motivation-letter", mandatory: true }],
    },
    // Harç şartlar sayfasında geçmiyor; uydurulmadı.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    tuitionCurrency: "GBP",
    // Üniversitenin kendi tahmini: bekâr lisans öğrencisi için ayda £1.546,
    // tam yıl £18.552. Bu alan EUR beklediği için o rakam doğrudan yazılamaz;
    // aşağıdaki değer bizim EUR tahminimiz, üniversitenin beyanı değil.
    livingCostPerYear: 21000,
    applicationSystem: "ucas",
    // UCAS'ın 2027 girişi için ortak son tarihi. Bu tarih programa değil
    // SİSTEME ait ve Imperial ile UCL'in kendi sayfalarından teyit edildi
    // (ikisi de "13 January 2027" diyor).
    deadline: "01-13",
    sourceUrl: "https://study.ed.ac.uk/programmes/undergraduate/57-computer-science/entry-requirements",
    facultyUrl: "https://informatics.ed.ac.uk/",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). KCL katalogda yoktu; QS'te dünya ilk 40'ında ve
    // Londra'da Imperial/UCL dışında üçüncü bir seçenek sunuyor.
    id: "gb-kcl-cs",
    university: "King's College London",
    country: "GB",
    city: "London",
    name: "Computer Science",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    // Teyit edildi: sayfa "Three years" diyor.
    durationYears: 3,
    requirements: {
      // Sayfa 100'lük eşik vermiyor; şart A-level A*A*A ve IB 39.
      minGpa: undefined,
      language: [
        // EKLENDİ (2026-08-14): şart sayfası "English language band: D"
        // diyor, sayı vermiyor. Bandın karşılığı ayrı bir sayfada bulundu ve
        // teyit edildi: kcl.ac.uk/study/undergraduate/how-to-apply/
        // english-language-requirements — "6.5 overall with a minimum of 6.0
        // in each skill" (Band D, Bilgisayar Bilimleri'nin bulunduğu NMES
        // fakültesini kapsıyor — İngilizce/Genel Mühendislik hariç tüm NMES).
        { test: "ielts", min: 6.5 },
      ],
      standardizedTests: [
        // Teyit edildi: "39 points overall or an aggregate score of 20 from
        // three Higher Levels", HL matematikte 6.
        { test: "ib", min: 39, mandatory: false },
      ],
      // Teyit edildi: A-level'da matematik veya ileri matematikte A,
      // IB'de HL matematikte 6.
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      // Sayfa niyet mektubunu değerlendirmeye kattığını söylüyor; giriş sınavı
      // ya da mülakattan söz etmiyor.
      extras: [{ key: "motivation-letter", mandatory: true }],
    },
    // Harç sayfası (.../fees) fiyat göstermiyor, boş bırakıldı.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    tuitionCurrency: "GBP",
    livingCostPerYear: 20400,
    applicationSystem: "ucas",
    // ÇELİŞKİ (2026-08-14): bu programın sayfasında tarih yok. UCAS'ın kendi
    // resmi sayfası "13 Ocak 2027, 18:00" diyor (standart dersler, Tıp/
    // Diş/Oxbridge hariç) — ama KCL'nin "important-information-for-applying"
    // sayfası "29 Ocak" yazıyor (tarihi belirsiz, muhtemelen eski). İkisi
    // çelişiyor, hangisinin doğru olduğuna karar veremedim; UCAS'ın tarihini
    // kullanıp kullanıcıyı KCL'nin kendi sayfasını kontrol etmeye yönlendiriyorum.
    deadline: "01-13",
    deadlineNote: {
      tr: "KCL'nin kendi başvuru sayfası farklı bir tarih (29 Ocak) veriyor — UCAS'ın resmi tarihiyle çelişiyor. Başvurmadan önce KCL'nin güncel sayfasından teyit et.",
      en: "KCL's own application page states a different date (29 January) — this conflicts with UCAS's official date. Confirm on KCL's current page before applying.",
    },
    sourceUrl: "https://www.kcl.ac.uk/study/undergraduate/courses/computer-science-bsc/requirements",
    facultyUrl: "https://www.kcl.ac.uk/nmes/departments/informatics",
    lastChecked: "2026-08-14",
    // Şartların çoğu sayfasından teyit edildi (dil şartı ayrı bir KCL
    // sayfasından); son tarih UCAS ile KCL arasında çelişkili olduğu için
    // rozet çevrilmedi — yarım doğrulanmış kaydı verified yapmak, hiç
    // doğrulamamaktan kötü.
    verification: "ai-extracted",
  },
  {
    // EKLENDİ (2026-08-14). Oxford'un tek programı Engineering Science'tı;
    // CS eklenerek daha geniş bir profil aralığı kapsanıyor.
    id: "gb-oxford-cs",
    university: "University of Oxford",
    country: "GB",
    city: "Oxford",
    name: "Computer Science",
    // Sayfa "BA degree after three years, or a Masters degree (MCompSci)
    // after four years" diyor — modelde MEng/MCompSci yok. BA etiketini
    // gerçek 3 yıllık süresiyle eşleştirdik, Cambridge kaydındaki gibi.
    degree: "BA",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Sayfa 100'lük eşik vermiyor; teklif A*AA / IB 39 (766 HL, HL
      // Matematikte 7).
      minGpa: undefined,
      language: [
        // Oxford'un uluslararası öğrenci dil sayfası: "IELTS Academic 7.5
        // overall, minimum 7.0 in each component" ve "TOEFL iBT 110 overall"
        // (bileşen eşikleri: L22 R24 S25 W24). Cambridge'in aksine Oxford
        // TOEFL'ı kabul ediyor.
        { test: "ielts", min: 7.5 },
        { test: "toefl", min: 110 },
      ],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        {
          // DİKKAT: 2025 döngüsüne kadar MAT kullanılıyordu; 2026'dan
          // itibaren TMUA'ya geçildi ("From 2026, Oxford will use the TMUA").
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "TMUA (Test of Mathematics for University Admission) — 2026'dan itibaren MAT'ın yerini aldı, iki kağıt (Uygulama + Matematiksel Akıl Yürütme)",
            en: "TMUA (Test of Mathematics for University Admission) — replaced the MAT starting 2026, two papers (Applications + Mathematical Reasoning)",
          },
        },
        {
          // "All shortlisted applicants will be invited to online
          // interviews in December."
          key: "interview",
          mandatory: true,
        },
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
        {
          // 3 yıllık ortalama (2023-25): "Interviewed: 21%, Successful: 7%,
          // Intake: 55" — resmi bir kontenjan sayısı değil ama rekabet
          // gerçeğini gösteriyor.
          key: "numerus-fixus",
          mandatory: false,
          note: {
            tr: "2023-25 ortalaması: başvuranların %21'i mülakata çağrılıyor, %7'si kabul ediliyor (yıllık alım ~55 kişi)",
            en: "2023-25 average: 21% of applicants are interviewed, 7% are admitted (annual intake ~55)",
          },
        },
      ],
    },
    // Ders sayfası 2026-27 girişi için "Overseas fee: £62,820 per year"
    // veriyor (2027-28 henüz yayınlanmadı).
    tuitionNonEu: 62820,
    tuitionEu: 62820,
    tuitionCurrency: "GBP",
    livingCostPerYear: 18000,
    applicationSystem: "ucas",
    deadline: "10-15",
    deadlineNote: {
      tr: "Oxford/Cambridge son tarihi diğerlerinden 3 ay önce — 15 Ekim",
      en: "Oxford/Cambridge close three months earlier than everyone else — 15 October",
    },
    sourceUrl: "https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/computer-science",
    facultyUrl: "https://www.cs.ox.ac.uk/admissions/undergraduate/why_oxford/formal-admissions-criteria.html",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). UCL'nin tek programı Psychology'ydi; CS
    // Imperial/Oxford/Cambridge dışında Londra'da güçlü bir dördüncü seçenek.
    id: "gb-ucl-cs",
    university: "University College London",
    country: "GB",
    city: "London",
    name: "Computer Science",
    degree: "BSc",
    field: "cs",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Sayfa 100'lük eşik vermiyor; teklif A*A*A / bağlamsal A*AB, IB 40
      // (20 puan üç HL derste, HL Matematikte 7).
      minGpa: undefined,
      language: [
        // UCL kursları dil "seviyelerine" ayrılıyor; CS BSc "Level 1":
        // "Overall score of 6.5 and a minimum of 6.0 in each component"
        // (IELTS), "Overall score of 92" (TOEFL iBT, eski ölçek).
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 92 },
      ],
      standardizedTests: [{ test: "ib", min: 40, mandatory: false }],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        {
          // "UCL will use the TARA (Test of Academic Reasoning for
          // Admissions)... for all undergraduate programmes in the
          // Department of Computer Science." STAT'ın yerini aldı.
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "TARA (Test of Academic Reasoning for Admissions) — eski STAT sınavının yerini aldı, 3 bölüm (Eleştirel Düşünme, Problem Çözme, Yazma)",
            en: "TARA (Test of Academic Reasoning for Admissions) — replaced the old STAT test, 3 sections (Critical Thinking, Problem Solving, Writing)",
          },
        },
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // "International: £46,700 per year" (2026/27 girişi; 2027/28 henüz
    // yayınlanmadı — ağustos 2026'da yayınlanacağı belirtiliyor).
    tuitionNonEu: 46700,
    tuitionEu: 46700,
    tuitionCurrency: "GBP",
    livingCostPerYear: 20400,
    applicationSystem: "ucas",
    deadline: "01-13",
    sourceUrl: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/computer-science-bsc",
    facultyUrl:
      "https://www.ucl.ac.uk/engineering/computer-science/study/undergraduate/tara-admissions-test-computer-science-courses",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). Bristol katalogda yoktu; QS'te İngiltere'nin
    // ilk 15'inde ve mühendislikte iyi bilinen bir orta ölçekli seçenek.
    id: "gb-bristol-engineering",
    university: "University of Bristol",
    country: "GB",
    city: "Bristol",
    // Bristol'de tek başına "Engineering" diye genel bir program yok;
    // en genel/amiral mühendislik dalı Mechanical Engineering.
    name: "Mechanical Engineering",
    // BEng (3 yıl) ve MEng (4 yıl) ayrı UCAS kodlarıyla iki ayrı program —
    // model MEng içermediği için BEng seçildi, uydurma yok.
    degree: "BEng",
    field: "engineering",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Sayfa 100'lük eşik vermiyor. Bristol'ün Türkiye sayfası genel bir
      // "%74-90" bandı veriyor (kurs bazlı değil) — bu program için özel bir
      // sayı yok, uydurmuyoruz.
      minGpa: undefined,
      language: [
        // "Profile E": "IELTS 6.5 overall with 6.0 in all skills"; TOEFL
        // iBT "88 overall" (eski ölçek, 21 Ocak 2026'dan önceki sınavlar).
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 88 },
      ],
      standardizedTests: [{ test: "ib", min: 38, mandatory: false }],
      // Matematik kesin şart ("expected to hold... A-level in
      // Mathematics"); ikinci ders (Fizik/Kimya/İleri Mat/Bilgisayar/
      // Elektronik) bir listeden biri olduğu için tek bir zorunlu ders
      // olarak yazılmıyor.
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        // "For these courses, applicants are not routinely interviewed...
        // admissions decisions will be made on the basis of the
        // application information alone." — giriş sınavı/mülakat yok.
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // "International students, £31,300 for the first year" (2026 girişi;
    // 2027 rakamı henüz onaylanmadı).
    tuitionNonEu: 31300,
    tuitionEu: 31300,
    tuitionCurrency: "GBP",
    livingCostPerYear: 15000,
    applicationSystem: "ucas",
    // Bristol'ün kendi sayfası "Equal Consideration Deadline: 13 January
    // 2027" diyor; UCAS'ın kendi sayfasından bağımsız doğrulanamadı
    // (ucas.com otomatik erişimi engelledi) ama Bristol'ün ilk taraf
    // sayfası güvenilir kabul edildi.
    deadline: "01-13",
    sourceUrl: "https://www.bristol.ac.uk/study/undergraduate/2027/mechanical-engineering/beng-mechanical-engineering/",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). Warwick katalogda yoktu; ekonomi bölümü
    // İngiltere'nin LSE ile birlikte en rekabetçilerinden.
    id: "gb-warwick-economics",
    university: "University of Warwick",
    country: "GB",
    city: "Coventry",
    name: "Economics",
    degree: "BSc",
    field: "economics",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Warwick'in Türkiye'ye özel denklik tablosu: "A*AA = %88" — standart
      // teklif tam olarak A*AA, bu yüzden doğrudan uygulanabiliyor.
      minGpa: 88,
      language: [
        // "Band C": IELTS "7.0 including minimum 6.5 in each component";
        // TOEFL iBT "100 ... minimum L21 W21 R22 S23" (21 Ocak 2026 öncesi
        // sınavlar).
        { test: "ielts", min: 7.0 },
        { test: "toefl", min: 100 },
      ],
      standardizedTests: [{ test: "ib", min: 38, mandatory: false }],
      requiredSubjects: [{ subject: "math", level: "advanced" }],
      extras: [
        {
          // "Optionally, applicants are encouraged to sit the TMUA...
          // Applicants achieving the highest scores... considered for a
          // reduced offer of AAA. Applicants without TMUA will still be
          // considered." — isteğe bağlı, zorunlu değil.
          key: "entrance-exam",
          mandatory: false,
          note: {
            tr: "TMUA isteğe bağlı — yüksek puan alanlara AAA'ya düşürülmüş teklif sunulabiliyor, sınavsız başvuru da değerlendiriliyor",
            en: "TMUA is optional — a high score can lead to a reduced AAA offer, but applications without it are still considered",
          },
        },
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // "Band 2 – £35,530 per year" (2026-27 girişi; 2027-28 rakamı henüz
    // belirlenmedi).
    tuitionNonEu: 35530,
    tuitionEu: 35530,
    tuitionCurrency: "GBP",
    livingCostPerYear: 13500,
    applicationSystem: "ucas",
    // Warwick'in kendi sayfasında tarih yok; UCAS'ın 2027 girişi için genel
    // tarihi kullanıldı.
    deadline: "01-13",
    sourceUrl: "https://warwick.ac.uk/study/undergraduate/courses/bsc-economics",
    facultyUrl: "https://warwick.ac.uk/fac/soc/economics/prospective/ug/admissions-and-entry-requirements",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). Durham katalogda yoktu; kolej sistemiyle
    // çalışan, Oxbridge dışında İngiltere'nin en iyi genel araştırma
    // üniversitelerinden biri.
    id: "gb-durham-naturalsciences",
    university: "Durham University",
    country: "GB",
    city: "Durham",
    name: "Natural Sciences",
    degree: "BSc",
    field: "natural-sciences",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Durham'ın Türkiye'ye özel denklik tablosu: "A*AA ≥ %88" — standart
      // teklif tam olarak A*AA.
      minGpa: 88,
      language: [
        // "Band B": IELTS "6.5 with no component under 6.0"; TOEFL iBT
        // "80 with no component under 20" (21 Ocak 2026 öncesi sınavlar).
        { test: "ielts", min: 6.5 },
        { test: "toefl", min: 80 },
      ],
      standardizedTests: [{ test: "ib", min: 37, mandatory: false }],
      // Program esnek: öğrenci hangi bilim dallarını çalışacağını kendi
      // seçiyor, her dalın kendi ders şartı var (ör. Fizik için Fizik+Mat,
      // Kimya için Kimya+Mat). Tek bir zorunlu ders olarak yazılamıyor —
      // uydurmuyoruz.
      requiredSubjects: undefined,
      extras: [
        // Mülakat sadece Eğitim programında zorunlu, Fen Bilimleri'nde yok.
        // Zorunlu giriş sınavı da yok (TMUA sadece Matematik için, isteğe
        // bağlı ve bu kayıt Matematik değil).
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // "International / EU students: £34,500 per year" (2026/27 girişi
    // onaylı; 2027/28 sayfada "henüz onaylanmadı" diyor).
    tuitionNonEu: 34500,
    tuitionEu: 34500,
    tuitionCurrency: "GBP",
    livingCostPerYear: 12500,
    applicationSystem: "ucas",
    deadline: "01-13",
    sourceUrl: "https://www.durham.ac.uk/study/courses/natural-sciences-cfg0/",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). St Andrews katalogda yoktu; İskoçya'nın en
    // eski ve en çok tanınan üniversitesi (Prince William'ın da okulu).
    id: "gb-standrews-psychology",
    university: "University of St Andrews",
    country: "GB",
    city: "St Andrews",
    name: "Psychology",
    // İskoç sistemi 4 yıllık Honours derecesi veriyor. BSc ve MA aynı
    // içerikte, eşit şartlarla sunuluyor — BSc (fen ağırlıklı) seçildi.
    degree: "BSc",
    field: "psychology",
    teachingLanguage: "en",
    durationYears: 4,
    requirements: {
      // Sayfa 100'lük eşik vermiyor (A-level AAB standart/ABB asgari, IB
      // 36); Türkiye'ye özel bir denklik tablosu da yok.
      minGpa: undefined,
      // Dil sayfası Psikoloji'yi hangi "profile" (3-D Sanat mı 7-D Fen mi)
      // koyduğunu açıkça yazmıyor ve iki profilin rakamları da birbirinden
      // çok farklı — hangisinin geçerli olduğuna karar veremedim, uydurmuyorum.
      language: undefined,
      standardizedTests: [{ test: "ib", min: 36, mandatory: false }],
      // "No previous knowledge of psychology is required." Tek bir ders
      // zorunlu değil, bir listeden biri (Biyoloji/Kimya/Bilgisayar/
      // Coğrafya/Matematik/Fizik) yeterli — tek bir zorunlu ders olarak
      // yazılamıyor.
      requiredSubjects: undefined,
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // Kurs sayfası 2027 girişi için "ücretler henüz belirlenmedi" diyor;
    // genel AB-dışı harç sayfası 2026-27 girişi için "£33,250" veriyor
    // (Tıp hariç tüm fakülteler, Psikoloji dahil).
    tuitionNonEu: 33250,
    tuitionEu: 33250,
    tuitionCurrency: "GBP",
    livingCostPerYear: 16000,
    applicationSystem: "ucas",
    // St Andrews'ün kendi UCAS başvuru sayfası doğrudan "13 Ocak 2027,
    // 18:00" diyor (Tıp hariç).
    deadline: "01-13",
    sourceUrl: "https://www.st-andrews.ac.uk/subjects/psychology/psychology-bsc/",
    facultyUrl: "https://www.st-andrews.ac.uk/subjects/psychology/",
    lastChecked: "2026-08-14",
    verification: "verified",
  },
  {
    // EKLENDİ (2026-08-14). Bath katalogda yoktu; işletme/yönetimde yıllardır
    // İngiltere sıralamalarının tepesinde.
    id: "gb-bath-business",
    university: "University of Bath",
    country: "GB",
    city: "Bath",
    name: "Management",
    degree: "BSc",
    field: "business",
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      // Bath'ın Türkiye'ye özel denklik tablosu: "CGPA of 80% with 85% in
      // one subject from the final year" — burada sadece genel eşik (80)
      // yazılabiliyor, "bir dersten 85" koşulunu model ifade edemiyor.
      minGpa: 80,
      language: [
        // "Category A": IELTS "7.0 overall with no less than 6.5 in all
        // components"; TOEFL iBT "100 overall with a minimum 24 in all 4
        // components" (21 Ocak 2026 öncesi sınavlar).
        { test: "ielts", min: 7.0 },
        { test: "toefl", min: 100 },
      ],
      standardizedTests: [{ test: "ib", min: 36, mandatory: false }],
      requiredSubjects: [
        {
          // Genel şartta Matematik zorunlu değil (sayısal derslerden biri
          // yeterli) AMA Türkiye'ye özel bölüm ayrıca ekliyor: "You must
          // also achieve 70% in Mathematics from any year." Bu, ileri
          // düzey bir ders şartından çok bir asgari başarı eşiği — en
          // yakın karşılığı temel düzey olarak işaretlendi.
          subject: "math",
          level: "basic",
        },
      ],
      extras: [
        { key: "motivation-letter", mandatory: true },
        { key: "recommendation-letter", mandatory: true },
      ],
    },
    // "Overseas students — Tuition fee for the academic year 2026/27:
    // £28,650."
    tuitionNonEu: 28650,
    tuitionEu: 28650,
    tuitionCurrency: "GBP",
    livingCostPerYear: 15500,
    applicationSystem: "ucas",
    // Kurs sayfası doğrudan "Overseas application deadline: 14 January
    // 2026" diyor (2026 girişi sayfası; diğer İngiltere kayıtlarında
    // kullanılan 13 Ocak'tan bir gün farklı — UCAS tarihi yıldan yıla
    // kayıyor, ikisi de gerçek).
    deadline: "01-14",
    sourceUrl: "https://www.bath.ac.uk/courses/undergraduate-2026/business-and-management/bsc-management/",
    lastChecked: "2026-08-14",
    verification: "verified",
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
        name: "Aide financière sur critères sociaux",
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
        name: "Full Scholarship — International Olympiad medallists",
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
  {
    // EKLENDİ (2026-08-14). NEDEN BU KAYIT VAR: katalogdaki Fransız
    // programlarının çoğu Fransızca (Sorbonne, Paris-Saclay). Fransa'da
    // İngilizce öğretim yapan lisanslar ağırlıkla işletme okullarında —
    // Türk öğrenci için Fransızcasız girilebilecek gerçek yol bu.
    id: "fr-edhec-bba",
    university: "EDHEC Business School",
    country: "FR",
    city: "Lille",
    name: "International BBA — Business Management Track",
    degree: "BA",
    field: "business",
    // İki track de İngilizce veriliyor (Lille veya Nice kampüsü).
    teachingLanguage: "en",
    durationYears: 4,
    requirements: {
      minGpa: undefined,
      // Şart "bir dil testi sonucu" olarak geçiyor ama hangi sınav ve kaç puan
      // yazılı değil. Global Business track ek olarak akıcı İngilizce istiyor.
      language: undefined,
      extras: [
        { key: "motivation-letter", mandatory: true },
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "Kişilik testi ve dil testi zorunlu; lise transkriptiyle birlikte değerlendiriliyor",
            en: "A personality test and a language test are required, assessed together with your high school transcript",
          },
        },
      ],
    },
    // EDHEC harcı iki track için ayrı yayınlıyor: Business Management
    // 15.900 EUR/yıl, Global Business 23.900 EUR/yıl. Bu kayıt Business
    // Management track'i. Ayrıca kayıt öncesi 5.000 EUR depozito ve 100 EUR
    // başvuru ücreti var.
    //
    // DİKKAT: bu rakamı EDHEC'in yayınladığı bilgiden aldım ama harç sayfası
    // otomatik isteğe 403 döndüğü için SAYFAYI KENDİM GÖREMEDİM. Rozet bu
    // yüzden çevrilmedi — tarayıcıda açıp teyit edilmeli.
    tuitionNonEu: 15900,
    tuitionEu: 15900,
    tuitionCurrency: "EUR",
    livingCostPerYear: 11400,
    applicationSystem: "direct",
    // Dört başvuru dönemi var, ekimden marta kadar. Son dönemin kapanışı
    // mart; kesin gün yayınlanan takvimde.
    deadline: "03-31",
    deadlineNote: {
      tr: "Dört ayrı başvuru dönemi var (ekim-mart). Erken dönemde başvurmak burs şansını artırıyor — EDHEC uluslararası öğrencilere özel burslar veriyor.",
      en: "There are four application rounds (October to March). Applying early improves your scholarship chances — EDHEC offers scholarships reserved for international students.",
    },
    sourceUrl: "https://www.edhec.edu/en/programmes/bba/admissions-and-tuition-fees/international-admissions",
    facultyUrl: "https://www.edhec.edu/en/programmes/bba",
    lastChecked: "2026-08-14",
    verification: "ai-extracted",
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
      // SİLİNDİ: IELTS 7.0 / TOEFL 100 yazıyordu. Kabul sayfasındaki dil
      // bölümü katlanmış ve açılmıyor — teyit edemedim.
      language: undefined,
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
    lastChecked: "2026-08-14",
    verification: "verified",
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
    // EKLENDİ (2026-08-14). Roma katalogda hiç yoktu. Bu program tamamen
    // İngilizce veriliyor — İtalya'da Türk öğrenci için en erişilebilir yol,
    // çünkü diğer İtalyan programlarının çoğu İtalyanca.
    id: "it-sapienza-acsai",
    university: "Sapienza University of Rome",
    universityLocal: "Sapienza Università di Roma",
    country: "IT",
    city: "Roma",
    name: "Applied Computer Science and Artificial Intelligence",
    degree: "BSc",
    field: "cs",
    // Teyit edildi: program kataloğu sayfası eğitim dilini "English" ve süreyi
    // "3 years" olarak veriyor.
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: undefined,
      // Sayfa "adequate knowledge of English" diyor ama SINAV ya da PUAN
      // belirtmiyor. Uydurmak yerine boş bırakıldı.
      language: undefined,
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "TOLC-I (CISIA mühendislik sınavı) veya SAT General Test — ikisinden biri zorunlu",
            en: "TOLC-I (CISIA engineering test) or the SAT General Test — one of the two is required",
          },
        },
        {
          key: "numerus-fixus",
          mandatory: true,
          note: {
            tr: "Kontenjan sınırlı; İngilizce programlara başvuru MoveIN üzerinden ön seçimle yapılıyor",
            en: "Restricted access; applications to English-taught programmes go through a MoveIN pre-selection",
          },
        },
      ],
    },
    // İTALYA'DA HARÇ VATANDAŞLIĞA/İKAMETE GÖRE DEĞİŞİYOR. Sapienza lisans
    // harcını "yılda € 300-1.500, ikamet ülkesine göre" olarak veriyor —
    // yani tek bir sayı yok. Modelimiz "vatandaşlığa göre değişir" diyemiyor,
    // o yüzden aralığın ortasından bir sayı uydurmak yerine boş bırakıldı.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    livingCostPerYear: 10800,
    applicationSystem: "direct",
    // Bu tarih program sayfasında DEĞİL, üniversitenin uluslararası kabul
    // duyurusunda: vize gerektiren AB-dışı adaylar için ön seçim penceresi
    // 22 Aralık - 15 Mayıs, ardından 30 Haziran'a kadar Universitaly kaydı.
    deadline: "05-15",
    deadlineNote: {
      tr: "Vize gerektiren AB-dışı aday için ön seçim 15 Mayıs'ta kapanıyor; kabul edilirsen 30 Haziran'a kadar Universitaly'ye kaydolmalısın. Ayrıca başvuru başına € 30 ücret var ve muafiyeti yok.",
      en: "For non-EU applicants needing a visa the pre-selection closes on 15 May; if pre-accepted you must register on Universitaly by 30 June. There is also a € 30 fee per application with no waiver.",
    },
    sourceUrl: "https://corsidilaurea.uniroma1.it/en/corso/2024/30786/home",
    facultyUrl: "https://acsai.di.uniroma1.it/",
    lastChecked: "2026-08-14",
    // Program sayfası dili, süreyi ve sınav şartını teyit ediyor ama harcı ve
    // son tarihi vermiyor — o ikisi başka sayfalardan geldiği için rozet
    // çevrilmedi.
    verification: "ai-extracted",
  },
  {
    // EKLENDİ (2026-08-14). Torino katalogda yoktu. Program hem İtalyanca hem
    // TAMAMEN İNGİLİZCE veriliyor; İngilizce track için B2 belgesi şart.
    id: "it-polito-computer-engineering",
    university: "Politecnico di Torino",
    country: "IT",
    city: "Torino",
    name: "Computer Engineering",
    degree: "BSc",
    field: "cs",
    // İngilizce track kaydediliyor. Program aynı zamanda İtalyanca da veriliyor.
    teachingLanguage: "en",
    durationYears: 3,
    requirements: {
      minGpa: undefined,
      // MODEL EKSİĞİ: şart "İngilizce B2 veya üstü" — bir CEFR SEVİYESİ.
      // Tip modeli yalnızca sınav+puan taşıyabiliyor (ielts/toefl/...), seviye
      // taşıyamıyor. B2'yi IELTS 5.5'e çevirip yazmak kaynağın söylemediği bir
      // sayı üretmek olurdu, o yüzden boş bırakıldı.
      // Muafiyet: öğretim dilinin İngilizce olduğunu belgeleyen okul yazısı.
      language: undefined,
      extras: [
        {
          key: "entrance-exam",
          mandatory: true,
          note: {
            tr: "TIL online giriş sınavı zorunlu (Mimarlık dışında SAT puanı da kabul ediliyor). TIL-A temmuzun ikinci yarısında.",
            en: "The online TIL admission test is required (a SAT score is also accepted except for Architecture). TIL-A takes place in the second half of July.",
          },
        },
      ],
    },
    // İTALYA'DA HARÇ VATANDAŞLIĞA GÖRE DEĞİŞİYOR ve Torino bunu formülle
    // yapıyor: yıllık harç, öğrencinin vatandaşı olduğu ülkenin satın alma
    // gücü paritesine göre ölçekleniyor (IMF verisi), taban 600 EUR.
    // Yani Türk öğrenci ile Alman öğrenci aynı programa farklı harç ödüyor.
    // Modelimiz tek sayı tutuyor; formülü temsil edemediği için boş bırakıldı.
    tuitionNonEu: undefined,
    tuitionEu: undefined,
    livingCostPerYear: 10200,
    applicationSystem: "direct",
    // 2026/27 çağrısından: vize gerektiren AB-dışı aday için DİL ŞARTI
    // 22 Mayıs 2026'ya kadar karşılanmalı. Başvurunun kendisi 30 Haziran'a
    // kadar. Bağlayıcı olan erken tarih yazıldı — 22 Mayıs'ı kaçıran öğrenci
    // 30 Haziran'a yetişse bile başvuramaz.
    deadline: "05-22",
    deadlineNote: {
      tr: "İki tarih var: dil belgesi 22 Mayıs'a kadar hazır olmalı, başvuru 30 Haziran'a kadar yapılır. Sıralama listeleri 28 Mayıs'ta açıklanıyor.",
      en: "Two dates apply: your language certificate must be ready by 22 May, and the application itself is due by 30 June. Ranking lists are published on 28 May.",
    },
    sourceUrl: "https://www.polito.it/en/education/bachelor-s-degree-programmes/computer-engineering",
    facultyUrl: "https://www.polito.it/en/education/applying-studying-graduating/admissions-and-enrolment/bachelor-s-degree-programmes/applicants-with-a-non-italian-qualification",
    lastChecked: "2026-08-14",
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
        name: "MAECI scholarship (Italian Ministry of Foreign Affairs)",
        kind: "grant",
        openToNonEu: true,
        sourceUrl: "https://www.unibo.it/en/study/study-grants-and-subsidies",
        note: {
          tr: "İtalyan Dışişleri Bakanlığı'nın uluslararası öğrencilere verdiği burs. Tutar üniversitenin sayfasında belirtilmiyor, bakanlığın yıllık çağrısından bakılmalı.",
          en: "Granted by the Italian Ministry of Foreign Affairs to international students. The amount is not stated on the university page — check the ministry's annual call.",
        },
      },
      {
        name: "Reduced flat fee — non-EU/non-OECD citizens",
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
