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
    discover: "Keşfet",
    myList: "Listem",
    settings: "Ayarlar",
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

  /**
   * Rota haritalı landing — üstteki `landing` bloğundan ayrı duruyor.
   * Sebep: eski sayfanın metinleri hâlâ derleniyor ve başka bir dalda
   * kullanılıyor olabilir; yeni sayfa kurulurken oraya dokunmak gerekmesin.
   * Buradaki her cümlenin karşılığı README'de var — sahnede söylenmeyen
   * bir iddiayı landing'e yazmıyoruz.
   */
  landingJourney: {
    eyebrow: "İstanbul'dan Avrupa'ya",
    title: "Yolun İstanbul'da başlıyor. Nerede biteceğine veriyle karar ver.",
    body: "Beyond profilini alır, katalogdaki her programı şart şart değerlendirir ve üç şey verir: karşıladığın şartların dürüst dökümü, eksikler için somut bir plan ve hepsi tek takvimde toplanmış başvuru tarihleri.",
    ctaPrimary: "Profilimi oluştur",
    ctaSecondary: "Rotayı gör",

    /** Haritanın erişilebilir adı ve açıklaması (SVG title/desc). */
    mapTitle: "İstanbul'dan Avrupa üniversite şehirlerine uzanan rota",
    mapDesc:
      "Şematik bir rota haritası: İstanbul'dan başlayıp Delft, Oxford, Paris ve Milano'ya uzanan dört durak. Sayfayı kaydırdıkça rotalar sırayla çiziliyor. Haritanın taşıdığı bilgilerin tamamı yanındaki metinde de yazıyor.",
    originLabel: "İstanbul",
    originNote: "Başlangıç noktan",
    /**
     * Durak etiketindeki alt satır — {count} katalogdan geliyor.
     * Kısa tutuluyor: harita üzerinde sola dayalı etiketlerin sığacağı yer dar,
     * uzun metin çerçeveden taşıp kırpılıyordu. Ülke adı haritanın altındaki
     * şeritte zaten yazıyor.
     */
    stopPrograms: "{count} program",

    stopsTitle: "Rotada ne oluyor?",
    stops: [
      {
        tag: "Şart şart",
        title: "Dürüst bir eşleşme",
        body: "“%78 kabul edilirsin” yok. Bunun yerine: 9 zorunlu şartın 7'sini karşılıyorsun — kalan ikisi de kaynak bağlantısıyla birlikte satır satır yazıyor.",
      },
      {
        tag: "Eksik planı",
        title: "Eksikleri kapatma planı",
        body: "Hangi sınav, kaç puan, ne zamana kadar. “IELTS 6.0'ın var, 6.5 lazım — tek sınav tekrarıyla kapanır.”",
      },
      {
        tag: "Takvim",
        title: "Tek başvuru takvimi",
        body: "UCAS, Studielink, uni-assist, Parcoursup, Campus France ayrı ayrı değil; kendi programlarından çıkan tek bir liste.",
      },
      {
        tag: "Tazelik",
        title: "Kaynak takibi",
        body: "Üniversitenin şart sayfası değişince kartta rozet çıkıyor: “Katalogda 11.400 → Sayfada geçen 14.000”. AI yok, parmak izi karşılaştırması var.",
      },
    ],

    statPrograms: "program",
    statCountries: "ülke",
    statSystems: "başvuru sistemi",

    closingTitle: "Bir dakikanı ayır, tercihini veriyle yap.",
    closingBody:
      "Profil sihirbazı yaklaşık altmış saniye sürüyor. Hesap açman gerekmiyor — anahtar yoksa profilin bu tarayıcıda kalır.",
    footerNote: "Veriler bilgilendirme amaçlıdır; başvurmadan önce kaynağından teyit et.",
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
      subjects: "Dersler ve sınavlar",
      language: "Dil belgen",
      tests: "Sınavların",
      targets: "Hedeflerin",
    },
    basics: {
      fullName: "Adın soyadın",
      fullNamePlaceholder: "Örn. Eda Beyter",
      gender: "Cinsiyet",
      genderNote: "Eşleştirmede kullanılmaz, sadece profilinde saklanır.",
      graduationYear: "Mezuniyet yılın",
      highSchoolName: "Lisenin adı",
      highSchoolPlaceholder: "Örn. Kadıköy Anadolu Lisesi",
      diplomas: "Aldığın diploma ve programlar",
      diplomasHint:
        "Birden fazla seçebilirsin — Türk lise diploman varken AP dersi de almış olabilirsin. Üniversiteler lise türüne değil, aldığın diplomaya göre şart koyuyor.",
      diplomaOther: "Diğer — hangisi?",
      diplomaOtherPlaceholder: "Örn. İtalyan Maturità",
    },
    fields: {
      question: "Hangi alanlarda okumayı düşünüyorsun?",
      hint: "Birden fazla seçebilirsin. Yanındaki sayı, katalogda o alanda kaç program olduğunu gösteriyor.",
      empty: "Devam etmek için en az bir alan seç.",
      noPrograms: "program yok",
      emptyFieldWarning:
        "Seçtiğin alanlardan bazılarında katalogda henüz program yok. İlgini işaretli tutabilirsin ama o alanlar için sonuç listesi boş gelecek.",
    },
    subjects: {
      question: "Hangi dersleri ileri düzey aldın?",
      hint: "İleri düzey / sayısal ağırlıklı olarak aldığın dersleri işaretle.",
      whyItMatters:
        "Bu bilgi boş kalırsa, belirli ders şartı koyan programlarda o şart “bilgi eksik” olarak kalıyor ve uyum oranın olduğundan düşük görünüyor. Katalogda 20'den fazla program ders şartı koyuyor.",
      apCourses: "AP dersleri",
      apCoursesHint:
        "Ders ders ekle ve notunu yaz (1-5). Tek bir “en yüksek AP notun” bilgisi profilini temsil etmiyor — Calculus'tan 5, Biology'den 3 almış olabilirsin.",
      apCoursePlaceholder: "Örn. AP Calculus BC",
      addApCourse: "AP dersi ekle",
      yks: "YKS yerleştirme puanın (isteğe bağlı)",
      yksHint:
        "Yalnızca Almanya için gerekiyor: Türk lise diploması tek başına yetmiyor, bir üniversiteye yerleşmiş olman ya da Studienkolleg bitirmen isteniyor. Almanya'yı düşünmüyorsan boş bırak.",
    },
    grades: {
      question: "Not ortalaman kaç?",
      scale: "Hangi sistemde?",
      converted: "100'lük sisteme çevrilmiş hali",
      convertedNote:
        "Karşılaştırmalar bu çevrilmiş not üzerinden yapılır. Çevrim yaklaşıktır; üniversiteler kendi tablolarını kullanabilir.",
      overall: "Genel ortalaman",
      overallDerived: "Girdiğin sınıf ortalamalarından hesaplandı",
      overallManual: "Sınıf sınıf girmek istemiyorsan doğrudan buraya yazabilirsin",
      byYear: "Sınıf sınıf ortalaman",
      byYearHint:
        "Kaç yıl okuduysan o kadarını gir — boş bıraktığın yıl hesaba katılmıyor. Ondalıklı yazabilirsin (örn. 90,095).",
      yearLabel: "{year}. sınıf",
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
    scenarioSaveLabel: "Bu senaryoyu kaydet",
    scenarioNamePlaceholder: "Senaryo adı — örn. \"Almanya + düşük bütçe\"",
    scenarioSaveButton: "Kaydet",
    savedScenariosTitle: "Kayıtlı senaryolar",
    scenarioApply: "Uygula",
    scenarioDelete: "Sil",
    scenarioNone: "Henüz kayıtlı senaryo yok.",
  },

  program: {
    requirements: "Şartlar",
    /**
     * Şart listesi zorunlu/zorunlu olmayan diye ikiye ayrılıyor (sıralamayı
     * matching.ts yapıyor). Başlıklar ayrımı görünür kılıyor: sırf sıralamak,
     * "bu satır neden aşağıda?" sorusunu cevapsız bırakıyordu.
     */
    mandatoryGroup: "Zorunlu şartlar",
    optionalGroup: "Zorunlu olmayanlar",
    optionalGroupNote: "Karşılamazsan elenmezsin; karşılarsan başvurunu güçlendirir.",
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
    notStated: "Kaynakta belirtilmemiş",
    notStatedNote:
      "Üniversite bu bilgiyi kaynak sayfasında yayınlamıyor. Tahmin üretmiyoruz — başvuru ofisine sorman gerekiyor.",
    currencyNote:
      "Harç, üniversitenin yayınladığı para biriminde gösteriliyor. Kur her gün değiştiği için EUR'a çevirmiyoruz; bu yüzden toplam yıllık maliyet ve bütçe karşılaştırması bu programda hesaplanmıyor.",
  },

  verification: {
    verified: "Kaynağından doğrulandı",
    "ai-extracted": "AI ile çıkarıldı, doğrulanmadı",
    verifiedTip:
      "Bu kaydın her alanı üniversitenin resmi program sayfasıyla tek tek karşılaştırıldı. Sayfanın belirtmediği alanlar tahminle doldurulmadı, boş bırakıldı.",
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
    visaTitle: "Vize ve oturum izni adımları",
    visaSubtitle:
      "Kabul mektubu son adım değil. Süreler resmi göç makamlarının kendi sayfalarından — kesin tarih değil, aralık: gerçek süre başvuru yoğunluğuna ve konsolosluğa göre değişir.",
    visaWeeksRange: "{min}-{max} hafta",
    visaWeeksMax: "en fazla {max} hafta",
    visaWeeksUnknown: "süre bilinmiyor",
    visaDisclaimer:
      "Bu adımlar ve süreler kaynak sayfalarından araştırıldı ama resmi makamlar bile kesin bir süre garanti etmiyor. Başvurmadan önce güncel bilgiyi mutlaka kaynak linkinden teyit et.",
  },

  countries: {
    noteTitle: "AB-dışı öğrenci olarak dikkat",
  },

  scholarships: {
    title: "Burslar",
    openToNonEu: "AB-dışına açık",
    euOnly: "Yalnızca AB vatandaşları",
    perYear: "/yıl",
    amountUnknown: "Tutar kaynakta belirtilmemiş",
    noneFound: "Bu programda AB-dışı lisans öğrencisine açık burs bulunamadı.",
    noneFoundNote:
      "Bu bir tahmin değil: üniversitenin kendi sayfası lisans düzeyinde burs sunmadığını söylüyor. Maliyet planını burssuz yap.",
    notChecked: "Burs bilgisi henüz araştırılmadı.",
    kinds: {
      "tuition-waiver": "Harç muafiyeti",
      grant: "Nakit burs",
      merit: "Başarı bursu",
      "need-based": "İhtiyaç bursu",
    },
    sourceLink: "Burs sayfası",
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
    needProfile: "Önce profilini oluştur, sonra buradan sorularını sorabilirsin.",
  },

  // ---------------------------------------------------------------------------
  // Şifre sıfırlama.
  //
  // Var olan `auth` bloğu bilinçli olarak DEĞİŞTİRİLMEDİ — ortak dosya kuralı
  // gereği yalnızca yeni üst blok ekleniyor, mevcut satırlar taşınmıyor.
  // ---------------------------------------------------------------------------
  authReset: {
    forgotLink: "Şifremi unuttum",

    requestTitle: "Şifreni sıfırlayalım",
    requestBody: "Hesabının e-posta adresini yaz; sıfırlama bağlantısını oraya gönderelim.",
    requestButton: "Sıfırlama bağlantısı gönder",
    sentTitle: "Bağlantı yolda",
    // Bilinçli olarak "böyle bir hesap varsa" diyor: aksi halde bu ekran, bir
    // e-postanın sisteme kayıtlı olup olmadığını herkese söyleyen bir araca dönerdi.
    sentBody:
      "{email} adresine kayıtlı bir hesap varsa sıfırlama bağlantısı gönderildi. Gelen kutunda yoksa spam klasörüne de bak; bağlantı bir saat içinde geçersiz olur.",
    backToSignIn: "Girişe dön",

    confirmTitle: "Yeni şifreni belirle",
    confirmBody: "En az 6 karakter olmalı.",
    newPassword: "Yeni şifre",
    newPasswordAgain: "Yeni şifre (tekrar)",
    confirmButton: "Şifremi güncelle",
    mismatch: "İki şifre birbirini tutmuyor.",
    tooShort: "Şifre en az 6 karakter olmalı.",
    doneTitle: "Şifren güncellendi",
    doneBody: "Artık yeni şifrenle giriş yapabilirsin.",
    goToApp: "Uygulamaya dön",
    checking: "Bağlantı kontrol ediliyor…",
    linkInvalidTitle: "Bağlantı geçersiz",
    linkInvalidBody:
      "Bu sıfırlama bağlantısı geçersiz ya da süresi dolmuş. Yeni bir bağlantı iste.",
    requestAgain: "Yeni bağlantı iste",
  },

  // ---------------------------------------------------------------------------
  // Cihazdaki hesapsız profilin hesaba taşınması.
  //
  // Hesap zorunlu olmadan önce profil yalnızca localStorage'da tutuluyordu.
  // O kullanıcıların verisi hesap zorunluluğuyla birlikte yok sayılamaz.
  // ---------------------------------------------------------------------------
  handoff: {
    title: "Cihazında kayıtlı bir profil bulduk",
    body: "Bu tarayıcıda, henüz hiçbir hesaba bağlı olmayan bir profil duruyor. Hesabına taşıyalım mı?",
    forName: "Profil sahibi: {name}",
    summaryTitle: "Taşınacaklar",
    summaryShortlist: "Kısa liste: {count} program",
    summaryCompare: "Karşılaştırma: {count} program",
    summaryScenarios: "Kayıtlı senaryo: {count}",
    migrate: "Hesabıma taşı",
    migrating: "Taşınıyor…",
    discard: "Yeni profille başla",
    discardWarning:
      "\"Yeni profille başla\" dersen bu cihazdaki eski profil silinir ve geri getirilemez.",
    error: "Taşıma sırasında bir şey ters gitti. Tekrar dener misin?",
  },

  // ---------------------------------------------------------------------------
  // Ayarlar — sekmeli ekran.
  // ---------------------------------------------------------------------------
  settings: {
    title: "Ayarlar",
    subtitle: "Profilini, görünümünü, hesabını ve verilerini buradan yönetirsin.",
    tabs: {
      profile: "Profilim",
      appearance: "Görünüm",
      account: "Hesap",
      privacy: "Gizlilik",
    },

    profile: {
      title: "Profilim",
      body: "Kayıt sihirbazındaki bütün sorular burada. Kaydettiğin an eşleşmelerin yeniden hesaplanır.",
      save: "Değişiklikleri kaydet",
      saving: "Kaydediliyor…",
      saved: "Kaydedildi.",
      unsaved: "Kaydedilmemiş değişikliklerin var.",
      revert: "Değişiklikleri geri al",
      needFullName: "Kaydetmek için adını yazman gerekiyor.",
      needField: "Kaydetmek için en az bir ilgi alanı seçmen gerekiyor.",
      noProfile: "Henüz bir profilin yok.",
      noProfileCta: "Profil sihirbazını aç",
    },

    appearance: {
      title: "Görünüm",
      body: "Seçimin yalnızca bu tarayıcıda saklanır, hesabına yazılmaz.",
      mode: "Tema",
      modes: {
        light: "Açık",
        dark: "Koyu",
        system: "Sistem",
      },
      systemHint: "Sistem seçiliyken cihazının tercihini takip eder ve o değişince kendiliğinden değişir.",
      accent: "Aksan rengi",
      accentHint: "Butonlar, bağlantılar ve vurgular bu rengi kullanır.",
      accents: {
        indigo: "İndigo",
        teal: "Deniz yeşili",
        violet: "Mor",
        rose: "Gül",
      },
      preview: "Önizleme",
      previewBody: "Renkler tüm sayfalarda anında değişir.",
      previewButton: "Örnek buton",
    },

    account: {
      title: "Hesap",
      email: "E-posta",
      emailNote: "E-posta adresi bu ekrandan değiştirilemiyor.",
      changePasswordTitle: "Şifre değiştir",
      changePasswordBody:
        "Yeni şifreni iki kere yaz. Eski şifreni sormuyoruz çünkü oturumun zaten açık.",
      changeButton: "Şifremi değiştir",
      changing: "Değiştiriliyor…",
      changed: "Şifren değiştirildi.",
      signOutTitle: "Çıkış yap",
      signOutBody:
        "Bu cihazdaki oturumun kapanır ve profilinin yerel kopyası bu tarayıcıdan silinir. Verilerin hesabında durmaya devam eder.",
    },

    privacy: {
      title: "Gizlilik ve verilerin",
      intro:
        "Aşağıdakiler senin verilerin. Ne tuttuğumuzu, nerede tuttuğumuzu ve nasıl geri alacağını gizlemiyoruz.",

      whatTitle: "Ne tutuyoruz",
      what: [
        "E-posta adresin — hesabını tanımlamak için. Şifren bize düz metin olarak hiç ulaşmıyor; Supabase onu özetleyerek (hash) saklıyor.",
        "Profilin — adın, doğum yılın, cinsiyetin, lise türün, mezuniyet yılın, not ortalaman, sınav puanların, ilgi alanların, hedef ülkelerin ve bütçe üst sınırın.",
        "Kısa listen ve karşılaştırma listen — hangi programları takip ettiğin.",
        "Kayıtlı senaryoların — \"ya Almanya deseydim?\" denemelerin.",
      ],

      whereTitle: "Nerede duruyor",
      whereBody:
        "Hepsi Supabase üzerinde barındırılan bir PostgreSQL veritabanında. Satır düzeyinde güvenlik (RLS) açık: veritabanı kuralları gereği yalnızca kendi satırlarına erişebilirsin, başka bir kullanıcı senin kaydını okuyamaz.",

      localTitle: "Sadece bu tarayıcıda kalanlar",
      localBody:
        "Dil tercihin, tema ve aksan rengi seçimin sunucuya hiç gitmiyor — yalnızca bu tarayıcının localStorage'ında duruyor. Profilinin bir kopyası da uygulama hızlı açılsın diye burada tutuluyor; çıkış yaptığında siliniyor.",

      notUsedTitle: "Ne yapmıyoruz",
      notUsed: [
        "Verilerini kimseye satmıyor, üçüncü taraf reklam veya analitik izleyicisi çalıştırmıyoruz.",
        "Cinsiyet bilgin eşleştirmede kullanılmıyor; yalnızca profilinde duruyor ve boş bırakabilirsin.",
        "\"Sor AI'a\" paneline soru sormadıkça profilin hiçbir yapay zekâ servisine gönderilmiyor.",
      ],

      rightsTitle: "KVKK kapsamındaki hakların",
      rightsBody:
        "6698 sayılı KVKK, kişisel verilerine erişme, yanlış olanı düzeltme, silinmesini isteme ve verilerini taşınabilir bir biçimde alma hakkı veriyor. Bu ekran dördünü de kendi başına yapmanı sağlıyor: profil sekmesinden düzeltirsin, aşağıdan indirir ya da silersin.",

      exportTitle: "Verilerimi indir",
      exportBody:
        "Sende duran her şeyi tek bir JSON dosyası olarak indir. Dosya profilini, listelerini ve senaryolarını içerir.",
      exportButton: "JSON olarak indir",
      exportPreparing: "Hazırlanıyor…",

      deleteTitle: "Hesabımı sil",
      deleteBody:
        "Hesabın, profilin, kısa listen, karşılaştırma listen ve kayıtlı senaryoların kalıcı olarak silinir. Bu işlem geri alınamaz.",
      deleteAdvice: "Silmeden önce verilerini indirmek isteyebilirsin.",
      deleteButton: "Hesabımı sil",
      deleteConfirmTitle: "Emin misin?",
      deleteConfirmBody: "Silmek için kutuya {word} yaz.",
      deleteConfirmWord: "SİL",
      deleteConfirmButton: "Kalıcı olarak sil",
      deleting: "Siliniyor…",
      deleteError: "Hesap silinemedi. Tekrar dener misin?",
      // Sunucuda service_role anahtarı yoksa satırlar silinir ama auth kaydı kalır.
      // Bunu "silindi" diye göstermek yalan olurdu.
      deletePartial:
        "Verilerin silindi, ama hesap kaydı sunucuda kaldı: sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı değil. Kaydın tamamen kaldırılması için yöneticine haber ver.",
    },

    localMode: {
      title: "Yerel mod",
      body: "Supabase yapılandırılmamış, bu yüzden hesap açılamıyor ve bu sayfadaki hesap işlemleri kapalı. Profilin yalnızca bu tarayıcıda saklanıyor.",
    },
  },

  discover: {
    title: "Keşfet",
    subtitle: "{count} program, {countries} ülke — profiline göre sıralandı",
    countryHint: "Bir ülkeye gir, üniversiteleri ve bölümlerini uyum oranıyla gör.",
    bestFit: "En iyi uyum",
    averageFit: "Ortalama",
    programCount: "{count} program",
    universityCount: "{count} üniversite",
    verifiedCount: "{count} doğrulanmış",
    officialSite: "Resmî site",
    facultyPage: "Bölüm sayfası",
    backToCountries: "← Tüm ülkeler",
    programsAtUniversity: "Bu üniversitedeki programlar",
    // Yüzdenin ne OLMADIĞINI söylemek, ne olduğunu söylemekten daha önemli.
    fitLabel: "şart uyumu",
    fitExplain:
      "Şart uyumu = karşıladığın zorunlu şart / bildiğimiz zorunlu şart. Kabul olasılığı DEĞİL — Avrupa'da kabul eşik bazlı ve kabul istatistikleri kamuya açık değil, o yüzden olasılık uydurmuyoruz.",
    fitCounter: "{met}/{total} zorunlu şart",
    unknownFromSource: "{count} şart bilinmiyor",
    unknownFromSourceHint:
      "Üniversite bu şartları kaynak sayfasında yayınlamıyor. Bizim veri boşluğumuz olduğu için uyum hesabına katılmıyor — senin aleyhine yazılmıyor.",
    unknownFromStudent: "{count} bilgi senden eksik",
    unknownFromStudentHint: "Profilini tamamlayınca bu şartlar hesaplanabilir hale geliyor.",
    fitUncomputable: "Uyum hesaplanamıyor",
    fitUncomputableHint:
      "Bu programın zorunlu şartlarını kaynak sayfasından okuyamadık. Yüzde uydurmuyoruz.",
    descriptionNote: "Bu tanıtımı biz yazdık, üniversitenin kendi metni değil — kaynak için resmî siteye bak.",
    urlBlocked: "Bu site otomatik kontrollere kapalı, tarayıcıda açılıyor",
    addToList: "Listeme ekle",
    inList: "Listemde",
    empty: "Bu filtrelerle gösterilecek program yok.",
    emptyHint: "Profilindeki alan veya ülke kısıtını gevşetmeyi dene.",
  },

  myList: {
    title: "Listem",
    subtitle: "{count} program kaydettin",
    empty: "Listen henüz boş.",
    emptyHint: "Keşfet'ten ya da eşleşmelerinden programları listene ekleyebilirsin.",
    goDiscover: "Keşfet'e git",
    remove: "Listeden çıkar",
    groupedByCountry: "Ülkeye göre",
    deadlineSoon: "Son tarih yaklaşıyor",
    // Listem ve takvim aynı listeyi gösteriyor; kullanıcı bunu bilmezse
    // iki ayrı liste tuttuğunu sanıp kafası karışır.
    sharedWithTimeline: "Bu liste takvimindekiyle aynı — buraya eklediğin program takvimde de görünür.",
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
    discover: "Discover",
    myList: "My list",
    settings: "Settings",
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

  landingJourney: {
    eyebrow: "From Istanbul to Europe",
    title: "Your route starts in Istanbul. Let the evidence decide where it ends.",
    body: "Beyond takes your profile, walks every program in the catalogue requirement by requirement, and gives you three things: an honest account of what you meet, a concrete plan for what you do not, and every application date in one calendar.",
    ctaPrimary: "Build my profile",
    ctaSecondary: "See the route",

    mapTitle: "A route from Istanbul to university cities across Europe",
    mapDesc:
      "A schematic route map: four stops starting in Istanbul and running through Delft, Oxford, Paris and Milan. The routes are drawn one by one as you scroll. Everything the map shows is also written out in the text beside it.",
    originLabel: "Istanbul",
    originNote: "Your starting point",
    stopPrograms: "{count} programs",

    stopsTitle: "What happens along the route?",
    stops: [
      {
        tag: "Requirement by requirement",
        title: "An honest match",
        body: "No “78% chance of admission.” Instead: you meet 7 of 9 required conditions — and the two you miss are spelled out line by line, each with a link to its source.",
      },
      {
        tag: "Gap plan",
        title: "A plan to close the gaps",
        body: "Which test, what score, by when. “You have IELTS 6.0 and need 6.5 — one retake closes it.”",
      },
      {
        tag: "Timeline",
        title: "One application calendar",
        body: "Not UCAS, Studielink, uni-assist, Parcoursup and Campus France separately — one list built from your own programs.",
      },
      {
        tag: "Freshness",
        title: "Source tracking",
        body: "When a university's requirements page changes, a badge appears on the card: “Catalogue says 11,400 → the page shows 14,000”. No AI — a fingerprint comparison.",
      },
    ],

    statPrograms: "programs",
    statCountries: "countries",
    statSystems: "application systems",

    closingTitle: "Give it a minute, then decide on evidence.",
    closingBody:
      "The profile wizard takes about sixty seconds. No account needed — without keys your profile simply stays in this browser.",
    footerNote: "Data is informational — always confirm at the source before applying.",
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
      subjects: "Subjects & exams",
      language: "Language certificate",
      tests: "Your tests",
      targets: "Your targets",
    },
    basics: {
      fullName: "Full name",
      fullNamePlaceholder: "e.g. Eda Beyter",
      gender: "Gender",
      genderNote: "Never used in matching, only stored on your profile.",
      graduationYear: "Graduation year",
      highSchoolName: "Name of your high school",
      highSchoolPlaceholder: "e.g. Kadıköy Anatolian High School",
      diplomas: "Diplomas and programmes you took",
      diplomasHint:
        "Pick more than one — you may hold a Turkish diploma and have taken AP courses. Universities set requirements by the diploma you hold, not by school type.",
      diplomaOther: "Other — which one?",
      diplomaOtherPlaceholder: "e.g. Italian Maturità",
    },
    fields: {
      question: "What would you like to study?",
      hint: "Pick more than one. The number next to each field is how many programmes the catalogue has in it.",
      empty: "Select at least one field to continue.",
      noPrograms: "no programmes",
      emptyFieldWarning:
        "Some fields you picked have no programmes in the catalogue yet. You can keep them selected, but results will be empty for those.",
    },
    subjects: {
      question: "Which subjects did you take at advanced level?",
      hint: "Tick the subjects you took at advanced or science-track level.",
      whyItMatters:
        "If this is left empty, programmes that require specific subjects show that requirement as “missing information” and your fit looks lower than it is. More than 20 programmes in the catalogue set subject requirements.",
      apCourses: "AP courses",
      apCoursesHint:
        "Add each course with its score (1-5). A single “highest AP score” does not represent your profile — you may have a 5 in Calculus and a 3 in Biology.",
      apCoursePlaceholder: "e.g. AP Calculus BC",
      addApCourse: "Add AP course",
      yks: "Your YKS placement score (optional)",
      yksHint:
        "Only needed for Germany: a Turkish high school diploma alone is not enough — you need an actual university placement or a completed Studienkolleg. Leave empty if Germany is not on your list.",
    },
    grades: {
      question: "What is your grade average?",
      scale: "On which scale?",
      converted: "Converted to the 100-point scale",
      convertedNote:
        "Comparisons use this converted grade. The conversion is approximate; universities may apply their own tables.",
      overall: "Your overall average",
      overallDerived: "Calculated from the year averages you entered",
      overallManual: "If you would rather not enter each year, type it here directly",
      byYear: "Year-by-year average",
      byYearHint:
        "Enter as many years as you have studied — a year left blank is not counted. Decimals are fine (e.g. 90.095).",
      yearLabel: "Year {year}",
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
    scenarioSaveLabel: "Save this scenario",
    scenarioNamePlaceholder: "Scenario name — e.g. \"Germany + lower budget\"",
    scenarioSaveButton: "Save",
    savedScenariosTitle: "Saved scenarios",
    scenarioApply: "Apply",
    scenarioDelete: "Delete",
    scenarioNone: "No saved scenarios yet.",
  },

  program: {
    requirements: "Requirements",
    mandatoryGroup: "Required",
    optionalGroup: "Not required",
    optionalGroupNote: "Missing these will not rule you out; meeting them strengthens your application.",
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
    notStated: "Not stated at source",
    notStatedNote:
      "The university does not publish this on its source page. We do not generate an estimate — you need to ask the admissions office.",
    currencyNote:
      "Tuition is shown in the currency the university publishes. We do not convert to EUR because rates change daily, so the annual total and budget comparison are not calculated for this program.",
  },

  verification: {
    verified: "Verified at source",
    "ai-extracted": "AI-extracted, not verified",
    verifiedTip:
      "Every field in this record was compared against the university's official programme page. Fields the page does not state were left empty rather than estimated.",
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
    visaTitle: "Visa & residence permit steps",
    visaSubtitle:
      "The acceptance letter isn't the last step. Timings come from each country's official immigration site — not exact dates, ranges: the real time depends on how busy the consulate is.",
    visaWeeksRange: "{min}-{max} weeks",
    visaWeeksMax: "up to {max} weeks",
    visaWeeksUnknown: "timing unknown",
    visaDisclaimer:
      "These steps and timings were researched from official sources, but even the authorities don't guarantee an exact time. Always confirm current details via the source link before applying.",
  },

  countries: {
    noteTitle: "As a non-EU student, note",
  },

  scholarships: {
    title: "Scholarships",
    openToNonEu: "Open to non-EU",
    euOnly: "EU citizens only",
    perYear: "/year",
    amountUnknown: "Amount not stated at source",
    noneFound: "No scholarship open to non-EU bachelor students was found for this program.",
    noneFoundNote:
      "This is not a guess: the university's own page states it offers no scholarships at bachelor level. Plan your budget without one.",
    notChecked: "Scholarship information has not been researched yet.",
    kinds: {
      "tuition-waiver": "Tuition waiver",
      grant: "Cash grant",
      merit: "Merit award",
      "need-based": "Need-based aid",
    },
    sourceLink: "Scholarship page",
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
    needProfile: "Create your profile first, then you can ask questions here.",
  },

  authReset: {
    forgotLink: "Forgot your password?",

    requestTitle: "Let's reset your password",
    requestBody: "Enter your account's email address and we'll send the reset link there.",
    requestButton: "Send reset link",
    sentTitle: "Link on its way",
    sentBody:
      "If an account exists for {email}, a reset link has been sent. Check your spam folder if it isn't in your inbox; the link expires within an hour.",
    backToSignIn: "Back to sign in",

    confirmTitle: "Set your new password",
    confirmBody: "At least 6 characters.",
    newPassword: "New password",
    newPasswordAgain: "New password (again)",
    confirmButton: "Update my password",
    mismatch: "The two passwords do not match.",
    tooShort: "Password must be at least 6 characters.",
    doneTitle: "Password updated",
    doneBody: "You can sign in with your new password now.",
    goToApp: "Back to the app",
    checking: "Checking the link…",
    linkInvalidTitle: "Invalid link",
    linkInvalidBody: "This reset link is invalid or has expired. Request a new one.",
    requestAgain: "Request a new link",
  },

  handoff: {
    title: "We found a profile saved on this device",
    body: "This browser holds a profile that isn't linked to any account yet. Move it into your account?",
    forName: "Profile owner: {name}",
    summaryTitle: "What moves across",
    summaryShortlist: "Shortlist: {count} programs",
    summaryCompare: "Comparison: {count} programs",
    summaryScenarios: "Saved scenarios: {count}",
    migrate: "Move to my account",
    migrating: "Moving…",
    discard: "Start with a new profile",
    discardWarning:
      "Choosing \"Start with a new profile\" deletes the old profile on this device for good.",
    error: "Something went wrong while moving it. Want to try again?",
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your profile, appearance, account and data here.",
    tabs: {
      profile: "My profile",
      appearance: "Appearance",
      account: "Account",
      privacy: "Privacy",
    },

    profile: {
      title: "My profile",
      body: "Every question from the sign-up wizard lives here. Your matches recalculate the moment you save.",
      save: "Save changes",
      saving: "Saving…",
      saved: "Saved.",
      unsaved: "You have unsaved changes.",
      revert: "Discard changes",
      needFullName: "Add your name before saving.",
      needField: "Select at least one field of interest before saving.",
      noProfile: "You don't have a profile yet.",
      noProfileCta: "Open the profile wizard",
    },

    appearance: {
      title: "Appearance",
      body: "Your choice is stored in this browser only; it is never written to your account.",
      mode: "Theme",
      modes: {
        light: "Light",
        dark: "Dark",
        system: "System",
      },
      systemHint: "With System selected it follows your device and changes along with it.",
      accent: "Accent colour",
      accentHint: "Buttons, links and highlights use this colour.",
      accents: {
        indigo: "Indigo",
        teal: "Teal",
        violet: "Violet",
        rose: "Rose",
      },
      preview: "Preview",
      previewBody: "Colours change across every page instantly.",
      previewButton: "Sample button",
    },

    account: {
      title: "Account",
      email: "Email",
      emailNote: "Your email address cannot be changed from this screen.",
      changePasswordTitle: "Change password",
      changePasswordBody:
        "Type your new password twice. We don't ask for the old one because you're already signed in.",
      changeButton: "Change my password",
      changing: "Changing…",
      changed: "Your password has been changed.",
      signOutTitle: "Sign out",
      signOutBody:
        "This ends your session on this device and clears the local copy of your profile from this browser. Your data stays in your account.",
    },

    privacy: {
      title: "Privacy and your data",
      intro:
        "What follows is your data. We don't hide what we keep, where we keep it, or how to get it back.",

      whatTitle: "What we keep",
      what: [
        "Your email address — to identify your account. Your password never reaches us in plain text; Supabase stores it hashed.",
        "Your profile — name, year of birth, gender, school type, graduation year, grade average, test scores, fields of interest, target countries and tuition ceiling.",
        "Your shortlist and comparison list — which programs you're tracking.",
        "Your saved scenarios — your \"what if I said Germany?\" experiments.",
      ],

      whereTitle: "Where it lives",
      whereBody:
        "All of it sits in a PostgreSQL database hosted on Supabase. Row level security (RLS) is on: database rules mean you can only reach your own rows, and no other user can read your record.",

      localTitle: "What stays in this browser only",
      localBody:
        "Your language, theme and accent colour choices never reach the server — they live in this browser's localStorage. A copy of your profile is kept here too so the app opens fast; it is cleared when you sign out.",

      notUsedTitle: "What we don't do",
      notUsed: [
        "We don't sell your data to anyone and we run no third-party advertising or analytics trackers.",
        "Your gender is never used in matching; it only sits on your profile and you can leave it blank.",
        "Your profile is sent to no AI service unless you ask the \"Ask AI\" panel a question.",
      ],

      rightsTitle: "Your rights under KVKK",
      rightsBody:
        "Turkey's data protection law (KVKK, no. 6698) gives you the right to access your personal data, correct what's wrong, ask for it to be deleted, and receive it in a portable form. This screen lets you do all four yourself: fix things on the profile tab, download or delete below.",

      exportTitle: "Download my data",
      exportBody:
        "Download everything we hold as a single JSON file. It contains your profile, your lists and your scenarios.",
      exportButton: "Download as JSON",
      exportPreparing: "Preparing…",

      deleteTitle: "Delete my account",
      deleteBody:
        "Your account, profile, shortlist, comparison list and saved scenarios are permanently deleted. This cannot be undone.",
      deleteAdvice: "You may want to download your data before deleting.",
      deleteButton: "Delete my account",
      deleteConfirmTitle: "Are you sure?",
      deleteConfirmBody: "Type {word} in the box to delete.",
      deleteConfirmWord: "DELETE",
      deleteConfirmButton: "Delete permanently",
      deleting: "Deleting…",
      deleteError: "The account could not be deleted. Want to try again?",
      deletePartial:
        "Your data was deleted, but the account record remains on the server: SUPABASE_SERVICE_ROLE_KEY is not configured there. Ask your administrator to remove the record completely.",
    },

    localMode: {
      title: "Local mode",
      body: "Supabase isn't configured, so accounts are unavailable and the account actions on this page are disabled. Your profile is stored in this browser only.",
    },
  },

  discover: {
    title: "Discover",
    subtitle: "{count} programmes across {countries} countries — ranked for your profile",
    countryHint: "Open a country to see its universities and their programmes with fit scores.",
    bestFit: "Best fit",
    averageFit: "Average",
    programCount: "{count} programmes",
    universityCount: "{count} universities",
    verifiedCount: "{count} verified",
    officialSite: "Official site",
    facultyPage: "Department page",
    backToCountries: "← All countries",
    programsAtUniversity: "Programmes at this university",
    fitLabel: "requirement fit",
    fitExplain:
      "Requirement fit = mandatory requirements you meet / mandatory requirements we know. This is NOT an admission probability — admission in Europe is threshold-based and acceptance statistics are not public, so we do not invent odds.",
    fitCounter: "{met}/{total} mandatory requirements",
    unknownFromSource: "{count} requirements unknown",
    unknownFromSourceHint:
      "The university does not publish these on its source page. Because that is our data gap, it is left out of the fit calculation — it is not counted against you.",
    unknownFromStudent: "{count} details missing from you",
    unknownFromStudentHint: "Completing your profile makes these requirements checkable.",
    fitUncomputable: "Fit cannot be calculated",
    fitUncomputableHint:
      "We could not read this programme's mandatory requirements from its source page. We do not invent a percentage.",
    descriptionNote: "We wrote this summary — it is not the university's own text. Follow the official site for their wording.",
    urlBlocked: "This site blocks automated checks but opens in a browser",
    addToList: "Add to my list",
    inList: "In my list",
    empty: "No programmes to show with these filters.",
    emptyHint: "Try relaxing the field or country limits in your profile.",
  },

  myList: {
    title: "My list",
    subtitle: "You saved {count} programmes",
    empty: "Your list is empty.",
    emptyHint: "You can add programmes from Discover or from your matches.",
    goDiscover: "Go to Discover",
    remove: "Remove from list",
    groupedByCountry: "By country",
    deadlineSoon: "Deadline approaching",
    sharedWithTimeline: "This is the same list as your timeline — anything you add here also shows up there.",
  },
};

export const DICTIONARY: Record<Locale, Dictionary> = { tr, en };

/** "{count} program" gibi yer tutucuları doldurur. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}
