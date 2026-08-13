/**
 * Beyond — iki dilli metin sözlüğü.
 *
 * Anahtar yerine doğrudan nesne erişimi kullanıyoruz (t.results.title) —
 * böylece yazım hatası derleme zamanında yakalanıyor, çalışma anında değil.
 * `tr` sözlüğü şemayı belirler; `en` ondan türetilen tipi karşılamak zorunda.
 */

export type Locale = "tr" | "en";

export const LOCALES: Locale[] = ["tr", "en"];

const tr = {
  brand: {
    name: "Beyond",
    tagline: "Sınırların ötesinde bir üniversite var. Hangisi olduğunu birlikte bulalım.",
  },

  common: {
    continue: "Devam et",
    back: "Geri",
    save: "Kaydet",
    cancel: "Vazgeç",
    close: "Kapat",
    edit: "Düzenle",
    remove: "Çıkar",
    loading: "Yükleniyor…",
    optional: "isteğe bağlı",
    required: "zorunlu",
    yes: "Evet",
    no: "Hayır",
    perYear: "/yıl",
    source: "Kaynak",
    lastChecked: "Son kontrol",
    signIn: "Giriş yap",
    signOut: "Çıkış yap",
    signUp: "Hesap oluştur",
    startNow: "Hemen başla",
  },

  nav: {
    results: "Eşleşmelerim",
    compare: "Karşılaştır",
    timeline: "Takvim",
    profile: "Profilim",
    gapPlan: "Eksik planım",
  },

  landing: {
    heroTitle: "Üniversite tercihini tahminle değil, veriyle yap.",
    heroBody:
      "Avrupa ve İngiltere'deki programların şartları tek tek farklı, tek yerde toplanmış değil ve çoğu bilgi kulaktan dolma. Beyond profilini alır, hangi şartı karşıladığını satır satır gösterir ve eksiklerin için somut bir plan çıkarır.",
    ctaPrimary: "Profilimi oluştur",
    ctaSecondary: "Nasıl çalışıyor?",
    problemTitle: "Neden zor?",
    problems: [
      {
        title: "Her ülkenin sistemi başka",
        body: "UCAS, Studielink, uni-assist, Parcoursup, Campus France… Aynı öğrenci için beş ayrı takvim, beş ayrı belge listesi.",
      },
      {
        title: "Şartlar programa göre değişiyor",
        body: "Aynı üniversitenin iki bölümü farklı dil barajı, farklı ders şartı isteyebiliyor. Genel bilgi işe yaramıyor.",
      },
      {
        title: "Danışmanlık pahalı",
        body: "Yüz binlerce liralık paketler çoğu zaman kamuya açık bilgiyi derliyor. Üniversite seçmek bu kadar pahalı olmamalı.",
      },
    ],
    howTitle: "Nasıl çalışıyor?",
    steps: [
      {
        title: "Profilini gir",
        body: "Notların, dil belgen, sınavların ve hedeflerin. Yaklaşık bir dakika.",
      },
      {
        title: "Eşleşmeni gör",
        body: "Her program Güvenli, Uyumlu veya Zorlayıcı olarak bantlanır — hangi şartı karşıladığın açıkça yazar.",
      },
      {
        title: "Eksiğini kapat",
        body: "Karşılamadığın şartlar için somut aksiyon listesi: hangi sınav, kaç puan, ne zamana kadar.",
      },
    ],
    honestyTitle: "Sana söz veremeyeceğimiz şey",
    honestyBody:
      "Beyond \"%78 ihtimalle kabul edilirsin\" demez. Avrupa'da kabul çoğunlukla eşik bazlıdır ve kabul istatistikleri kamuya açık değildir; olasılık uydurmak sana yardımcı olmaz. Bunun yerine karşıladığın ve karşılamadığın şartları tek tek, kaynağıyla birlikte gösteririz.",
  },

  auth: {
    signInTitle: "Tekrar hoş geldin",
    signInBody: "Profilin ve kısa listen hesabına kayıtlı.",
    signUpTitle: "Hesabını oluştur",
    signUpBody: "Profilini bir kere doldur, her girişte kaldığın yerden devam et.",
    email: "E-posta",
    password: "Şifre",
    passwordHint: "En az 6 karakter",
    noAccount: "Hesabın yok mu?",
    hasAccount: "Zaten hesabın var mı?",
    errorGeneric: "Bir şeyler ters gitti. Tekrar dener misin?",
    errorInvalid: "E-posta veya şifre hatalı.",
    errorEmailTaken: "Bu e-posta ile zaten bir hesap var.",
    notConfigured:
      "Supabase bağlantısı henüz yapılandırılmamış. .env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekle.",
  },

  wizard: {
    title: "Profilini oluşturalım",
    stepOf: "Adım {current} / {total}",
    steps: {
      basics: "Temel bilgiler",
      fields: "İlgi alanların",
      grades: "Not ortalaman",
      language: "Dil belgen",
      tests: "Sınavların",
      targets: "Hedeflerin",
    },
    basics: {
      fullName: "Adın soyadın",
      fullNamePlaceholder: "Örn. Eda Beyter",
      birthYear: "Doğum yılın",
      gender: "Cinsiyet",
      genderNote: "Eşleştirmede kullanılmaz, sadece profilinde saklanır.",
      schoolType: "Lise türün",
      graduationYear: "Mezuniyet yılın",
    },
    fields: {
      question: "Hangi alanlarda okumayı düşünüyorsun?",
      hint: "Birden fazla seçebilirsin. Emin değilsen geniş tut — sonradan senaryo modunda değiştirebilirsin.",
      empty: "Devam etmek için en az bir alan seç.",
    },
    grades: {
      question: "Not ortalaman kaç?",
      scale: "Hangi sistemde?",
      converted: "100'lük sisteme çevrilmiş hali",
      convertedNote:
        "Karşılaştırmalar bu çevrilmiş not üzerinden yapılır. Çevrim yaklaşıktır; üniversiteler kendi tablolarını kullanabilir.",
      advancedSubjects: "İleri düzey aldığın dersler",
      advancedSubjectsHint:
        "Bazı programlar belirli derslerde ileri düzey şartı koyuyor. Aldıklarını işaretle.",
    },
    language: {
      question: "Dil belgen var mı?",
      hint: "Henüz yoksa boş bırak — hangi sınavın gerektiğini sana biz söyleriz.",
      addTest: "Sınav ekle",
      selectTest: "Sınav seç",
      score: "Puan",
    },
    tests: {
      question: "SAT, IB, AP veya YKS puanın var mı?",
      hint: "Bazı ülkeler bunları zorunlu tutuyor. Almanya için YKS yerleşmen özellikle önemli.",
      addTest: "Sınav ekle",
    },
    targets: {
      countries: "Hangi ülkeleri düşünüyorsun?",
      countriesHint: "Hiçbirini seçmezsen hepsine bakarız.",
      budget: "Yıllık harç üst sınırın",
      budgetHint:
        "Yaşam maliyeti buna dahil değil, ayrıca gösteriyoruz. Sınır koymak istemiyorsan boş bırak.",
      budgetNoLimit: "Sınır yok",
      extras: "Hazır olduğun ek şartlar",
      extrasHint:
        "Bazı programlar portfolyo, mülakat veya niyet mektubu istiyor. Hazır olduklarını işaretle.",
    },
    finish: "Eşleşmelerimi göster",
  },

  bands: {
    safety: "Güvenli",
    match: "Uyumlu",
    reach: "Zorlayıcı",
    "out-of-reach": "Şu an uzak",
    safetyDesc: "Tüm şartları rahatlıkla karşılıyorsun.",
    matchDesc: "Tüm zorunlu şartları karşılıyorsun.",
    reachDesc: "Bir iki eksiğin var ama kapatılabilir.",
    "out-of-reachDesc": "Şu anki profilinle birden fazla zorunlu şart açık.",
  },

  checks: {
    met: "Karşılıyorsun",
    close: "Az kaldı",
    unmet: "Karşılamıyorsun",
    unknown: "Bilgi eksik",
    metCount: "{met}/{total} zorunlu şart",
  },

  results: {
    title: "Eşleşmelerin",
    subtitle: "{count} program profiline göre değerlendirildi",
    empty: "Bu filtrelerle eşleşen program bulunamadı.",
    emptyHint: "Ülke veya bütçe kısıtını gevşetmeyi dene.",
    scenarioTitle: "Senaryo modu",
    scenarioHint:
      "Profilini bozmadan dene: ülkeyi, alanı veya bütçeyi değiştir, sonuçlar anında güncellensin.",
    scenarioReset: "Senaryoyu sıfırla",
    scenarioActive: "Senaryo aktif — bunlar kayıtlı profilin sonuçları değil",
    showOutOfReach: "Uzak olanları da göster",
    addToCompare: "Karşılaştırmaya ekle",
    inCompare: "Karşılaştırmada",
    overBudget: "Bütçeni aşıyor",
  },

  program: {
    requirements: "Şartlar",
    costs: "Maliyet",
    application: "Başvuru",
    tuitionNonEu: "Harç (AB-dışı)",
    tuitionEu: "Harç (AB vatandaşı)",
    tuitionEuNote: "Karşılaştırma için — Türk öğrenci olarak AB-dışı tarifeye tabisin.",
    livingCost: "Tahmini yaşam maliyeti",
    totalCost: "Toplam yıllık",
    system: "Başvuru sistemi",
    deadline: "Son başvuru",
    teachingLanguage: "Eğitim dili",
    duration: "Süre",
    durationYears: "yıl",
    facultyLink: "Fakülte sayfası",
    sourceLink: "Şartların kaynağı",
    gapTitle: "Eksiklerini kapatmak için",
    gapEmpty: "Bu program için kapatman gereken bir eksik yok.",
    countryNote: "Bu ülke hakkında bilmen gereken",
  },

  verification: {
    verified: "Kaynağından doğrulandı",
    "ai-extracted": "AI ile çıkarıldı, doğrulanmadı",
    verifiedTip: "Bu kayıt üniversitenin resmi sayfasından elle teyit edildi.",
    "ai-extractedTip":
      "Bu kayıt otomatik derlendi ama tek tek doğrulanmadı. Başvurmadan önce kaynak bağlantısından kontrol et.",
  },

  gapPlan: {
    title: "Eksik planın",
    subtitle: "En kolay kapanacak adımdan başlayarak sıralandı",
    empty: "Şu an kapatman gereken bir eksik görünmüyor.",
    affects: "{count} programı etkiliyor",
    severity: {
      close: "Az kaldı",
      unknown: "Bilgi eksik",
      unmet: "Açık",
    },
  },

  compare: {
    title: "Karşılaştırma",
    subtitle: "En fazla 4 program yan yana",
    empty: "Henüz karşılaştırmaya program eklemedin.",
    emptyHint: "Eşleşmeler ekranından programları karşılaştırmaya ekleyebilirsin.",
    full: "Karşılaştırma dolu — yeni eklemek için birini çıkar.",
  },

  timeline: {
    title: "Başvuru takvimin",
    subtitle: "Sadece kısa listendeki programlar, başvuru sistemine göre gruplandı",
    empty: "Kısa listene program eklediğinde takvimin burada oluşur.",
    daysLeft: "{days} gün kaldı",
    passed: "Tarih geçti",
    today: "Bugün",
  },

  countries: {
    noteTitle: "AB-dışı öğrenci olarak dikkat",
  },

  freshness: {
    changedBadge: "Kaynak sayfa değişti",
    diffBadge: "Katalogla fark var",
    unreachableBadge: "Kaynak sayfaya ulaşılamadı",
    panelTitle: "Kaynak takibi",
    catalogLabel: "Katalogda",
    pageLabel: "Sayfada geçen",
    lastScan: "Son tarama",
    daysAgo: "{days} gün önce",
    today: "bugün",
    scanNote:
      "Bu kontrol kaynak sayfayı otomatik tarar ve katalogla karşılaştırır. Katalogu kendiliğinden DEĞİŞTİRMEZ — sadece \"burada bir fark var\" der. Kararı kaynak sayfadan teyit ederek sen ver.",
    fields: {
      ielts: "IELTS eşiği",
      toefl: "TOEFL eşiği",
      tuition: "Harç",
      deadline: "Son başvuru",
    },
    summaryTitle: "Katalog tazeliği",
    summaryLine: "{total} programın {changed} tanesinde kaynak sayfa değişti, {diff} tanesinde sayısal fark var.",
    allClear: "Son taramada hiçbir kaynak sayfada değişiklik bulunmadı.",
  },

  assistant: {
    open: "Asistan",
    title: "Beyond Asistan",
    tabChat: "Sor",
    tabExtract: "Üniversite ekle",
    demoBadge: "demo modu",
    demoNote:
      "API anahtarı tanımlı değil — bu panel hazır bir örnek gösteriyor, canlı AI değil.",
    chatPlaceholder: "Sonuçlarım hakkında bir şey sor…",
    chatEmpty: "Eşleşmelerini ve profilini biliyorum. Ne merak ediyorsun?",
    chatSuggestions: [
      "Zorlayıcı bantındakiler neden orada?",
      "Bütçeme en uygun üç program hangisi?",
      "Önce hangi eksiğimi kapatmalıyım?",
    ],
    send: "Gönder",
    thinking: "Düşünüyor…",
    extractTitle: "Listede olmayan bir program mı var?",
    extractBody:
      "Programın kendi sayfasının bağlantısını yapıştır; şartları okuyup yapılandırılmış hale getirelim.",
    extractPlaceholder: "https://universite.edu/program-sayfasi",
    extractButton: "Şartları çıkar",
    extractLoading: "Sayfa okunuyor…",
    extractEmptyResult: "Bu sayfada bir program bulunamadı.",
    extractSourceLabel: "Okunan sayfa",
    extractNotesLabel: "Dikkat edilmesi gerekenler",
    extractDisclaimer:
      "Bu çıkarım otomatiktir ve doğrulanmamıştır. Başvurmadan önce kaynak sayfadan teyit et.",
    needProfile: "Önce profilini oluştur, sonra buradan sorularını sorabilirsin.",
  },
};

/**
 * Şemayı Türkçe sözlük belirler. `as const` bilerek kullanılmadı:
 * literal tipler İngilizce çevirinin şemaya uymasını imkânsız kılardı.
 */
type Dictionary = typeof tr;

const en: Dictionary = {
  brand: {
    name: "Beyond",
    tagline: "Beyond the border there is a university for you. Let's find which one.",
  },

  common: {
    continue: "Continue",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    remove: "Remove",
    loading: "Loading…",
    optional: "optional",
    required: "required",
    yes: "Yes",
    no: "No",
    perYear: "/year",
    source: "Source",
    lastChecked: "Last checked",
    signIn: "Sign in",
    signOut: "Sign out",
    signUp: "Create account",
    startNow: "Start now",
  },

  nav: {
    results: "My matches",
    compare: "Compare",
    timeline: "Timeline",
    profile: "My profile",
    gapPlan: "My gap plan",
  },

  landing: {
    heroTitle: "Choose your university on evidence, not guesswork.",
    heroBody:
      "Requirements across Europe and the UK differ program by program, live in no single place, and mostly reach students as hearsay. Beyond takes your profile, shows line by line which requirements you meet, and turns the rest into a concrete plan.",
    ctaPrimary: "Build my profile",
    ctaSecondary: "How it works",
    problemTitle: "Why is this hard?",
    problems: [
      {
        title: "Every country runs its own system",
        body: "UCAS, Studielink, uni-assist, Parcoursup, Campus France… five timelines and five document lists for one student.",
      },
      {
        title: "Requirements change per program",
        body: "Two departments at the same university can demand different language scores and different coursework. General advice does not help.",
      },
      {
        title: "Advisers are expensive",
        body: "Packages costing a small fortune often just repackage public information. Choosing a university should not cost this much.",
      },
    ],
    howTitle: "How it works",
    steps: [
      {
        title: "Enter your profile",
        body: "Grades, language certificate, tests and goals. About a minute.",
      },
      {
        title: "See your matches",
        body: "Every program is banded Safe, Match or Stretch — with each requirement spelled out.",
      },
      {
        title: "Close your gaps",
        body: "A concrete action list for what you are missing: which test, what score, by when.",
      },
    ],
    honestyTitle: "What we will not promise you",
    honestyBody:
      "Beyond will never say \"you have a 78% chance of admission.\" European admissions are mostly threshold-based and acceptance statistics are not public; inventing a probability would not help you. Instead we show exactly which requirements you meet and which you do not, each with its source.",
  },

  auth: {
    signInTitle: "Welcome back",
    signInBody: "Your profile and shortlist are saved to your account.",
    signUpTitle: "Create your account",
    signUpBody: "Fill in your profile once and pick up where you left off every time.",
    email: "Email",
    password: "Password",
    passwordHint: "At least 6 characters",
    noAccount: "No account yet?",
    hasAccount: "Already have an account?",
    errorGeneric: "Something went wrong. Want to try again?",
    errorInvalid: "Wrong email or password.",
    errorEmailTaken: "An account with this email already exists.",
    notConfigured:
      "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
  },

  wizard: {
    title: "Let's build your profile",
    stepOf: "Step {current} of {total}",
    steps: {
      basics: "Basics",
      fields: "Your interests",
      grades: "Your grades",
      language: "Language certificate",
      tests: "Your tests",
      targets: "Your targets",
    },
    basics: {
      fullName: "Full name",
      fullNamePlaceholder: "e.g. Eda Beyter",
      birthYear: "Year of birth",
      gender: "Gender",
      genderNote: "Never used in matching, only stored on your profile.",
      schoolType: "School type",
      graduationYear: "Graduation year",
    },
    fields: {
      question: "What would you like to study?",
      hint: "Pick more than one. If you are unsure, stay broad — you can change it later in scenario mode.",
      empty: "Select at least one field to continue.",
    },
    grades: {
      question: "What is your grade average?",
      scale: "On which scale?",
      converted: "Converted to the 100-point scale",
      convertedNote:
        "Comparisons use this converted grade. The conversion is approximate; universities may apply their own tables.",
      advancedSubjects: "Subjects you took at advanced level",
      advancedSubjectsHint:
        "Some programs require advanced coursework in specific subjects. Tick the ones you took.",
    },
    language: {
      question: "Do you have a language certificate?",
      hint: "Leave it empty if you do not — we will tell you which test you need.",
      addTest: "Add a test",
      selectTest: "Select test",
      score: "Score",
    },
    tests: {
      question: "Do you have SAT, IB, AP or YKS scores?",
      hint: "Some countries require these. A YKS placement matters especially for Germany.",
      addTest: "Add a test",
    },
    targets: {
      countries: "Which countries are you considering?",
      countriesHint: "Select none and we will look at all of them.",
      budget: "Maximum yearly tuition",
      budgetHint:
        "Living costs are shown separately and not included here. Leave empty for no limit.",
      budgetNoLimit: "No limit",
      extras: "Extra requirements you are ready for",
      extrasHint:
        "Some programs ask for a portfolio, an interview or a motivation letter. Tick what you have ready.",
    },
    finish: "Show my matches",
  },

  bands: {
    safety: "Safe",
    match: "Match",
    reach: "Stretch",
    "out-of-reach": "Out of reach",
    safetyDesc: "You clear every requirement comfortably.",
    matchDesc: "You meet every mandatory requirement.",
    reachDesc: "One or two gaps, but they can be closed.",
    "out-of-reachDesc": "More than one mandatory requirement is open on your current profile.",
  },

  checks: {
    met: "You meet this",
    close: "Almost there",
    unmet: "Not met",
    unknown: "Missing information",
    metCount: "{met}/{total} mandatory requirements",
  },

  results: {
    title: "Your matches",
    subtitle: "{count} programs evaluated against your profile",
    empty: "No programs match these filters.",
    emptyHint: "Try relaxing the country or budget constraint.",
    scenarioTitle: "Scenario mode",
    scenarioHint:
      "Try things without touching your profile: change country, field or budget and watch the results update.",
    scenarioReset: "Reset scenario",
    scenarioActive: "Scenario active — these are not your saved profile's results",
    showOutOfReach: "Also show out-of-reach",
    addToCompare: "Add to compare",
    inCompare: "In comparison",
    overBudget: "Over your budget",
  },

  program: {
    requirements: "Requirements",
    costs: "Costs",
    application: "Application",
    tuitionNonEu: "Tuition (non-EU)",
    tuitionEu: "Tuition (EU citizen)",
    tuitionEuNote: "For comparison — as a Turkish student you pay the non-EU rate.",
    livingCost: "Estimated living costs",
    totalCost: "Total per year",
    system: "Application system",
    deadline: "Deadline",
    teachingLanguage: "Teaching language",
    duration: "Duration",
    durationYears: "years",
    facultyLink: "Faculty page",
    sourceLink: "Source of these requirements",
    gapTitle: "To close your gaps",
    gapEmpty: "Nothing to close for this program.",
    countryNote: "What to know about this country",
  },

  verification: {
    verified: "Verified at source",
    "ai-extracted": "AI-extracted, not verified",
    verifiedTip: "This record was manually confirmed against the university's official page.",
    "ai-extractedTip":
      "This record was compiled automatically and not individually verified. Check the source link before applying.",
  },

  gapPlan: {
    title: "Your gap plan",
    subtitle: "Sorted starting with the easiest gap to close",
    empty: "Nothing to close right now.",
    affects: "affects {count} programs",
    severity: {
      close: "Almost there",
      unknown: "Missing info",
      unmet: "Open gap",
    },
  },

  compare: {
    title: "Comparison",
    subtitle: "Up to four programs side by side",
    empty: "You have not added any programs to compare yet.",
    emptyHint: "Add programs from the matches screen.",
    full: "Comparison is full — remove one to add another.",
  },

  timeline: {
    title: "Your application timeline",
    subtitle: "Only your shortlisted programs, grouped by application system",
    empty: "Add programs to your shortlist and your timeline appears here.",
    daysLeft: "{days} days left",
    passed: "Deadline passed",
    today: "Today",
  },

  countries: {
    noteTitle: "As a non-EU student, note",
  },

  freshness: {
    changedBadge: "Source page changed",
    diffBadge: "Differs from catalogue",
    unreachableBadge: "Source page unreachable",
    panelTitle: "Source tracking",
    catalogLabel: "In our catalogue",
    pageLabel: "Found on the page",
    lastScan: "Last scan",
    daysAgo: "{days} days ago",
    today: "today",
    scanNote:
      "This check scans the source page automatically and compares it with our catalogue. It never CHANGES the catalogue — it only says \"something differs here.\" Confirm at the source and decide yourself.",
    fields: {
      ielts: "IELTS threshold",
      toefl: "TOEFL threshold",
      tuition: "Tuition",
      deadline: "Deadline",
    },
    summaryTitle: "Catalogue freshness",
    summaryLine: "Of {total} programs, {changed} source pages changed and {diff} show a numeric difference.",
    allClear: "The last scan found no changes on any source page.",
  },

  assistant: {
    open: "Assistant",
    title: "Beyond Assistant",
    tabChat: "Ask",
    tabExtract: "Add a university",
    demoBadge: "demo mode",
    demoNote:
      "No API key configured — this panel shows a prepared example, not live AI.",
    chatPlaceholder: "Ask something about your matches…",
    chatEmpty: "I know your profile and your matches. What would you like to know?",
    chatSuggestions: [
      "Why are these in the Stretch band?",
      "Which three programs fit my budget best?",
      "Which gap should I close first?",
    ],
    send: "Send",
    thinking: "Thinking…",
    extractTitle: "A program that is not on the list?",
    extractBody:
      "Paste the link to the program's own page and we will read its requirements into structured data.",
    extractPlaceholder: "https://university.edu/program-page",
    extractButton: "Extract requirements",
    extractLoading: "Reading the page…",
    extractEmptyResult: "No program was found on that page.",
    extractSourceLabel: "Page read",
    extractNotesLabel: "Things to watch",
    extractDisclaimer:
      "This extraction is automatic and unverified. Confirm at the source before applying.",
    needProfile: "Create your profile first, then you can ask questions here.",
  },
};

export const DICTIONARY: Record<Locale, Dictionary> = { tr, en };

/** "{count} program" gibi yer tutucuları doldurur. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}
