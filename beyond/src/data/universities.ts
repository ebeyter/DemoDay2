import type { Bilingual, CountryCode } from "@/lib/types";

/**
 * Beyond — üniversite katmanı.
 *
 * NEDEN VAR: katalog program bazlı (`programs.ts`). Keşfet ekranı ülke →
 * üniversite → program kırılımı istiyor ve üniversite düzeyinde iki şey
 * gerekiyordu: resmî site adresi ve kısa bir tanıtım. İkisi de programlarda
 * yoktu; `facultyUrl` fakülte sayfası, kurumun kendisi değil.
 *
 * ANAHTAR: `programs.ts`'teki `university` alanının BİREBİR aynısı. Böylece
 * arama gerekmiyor, doğrudan sözlük erişimi oluyor. Bir programın üniversite
 * adını değiştirirsen buradaki anahtarı da değiştir — `npm run check:data`
 * eşleşmeyen kaydı yakalıyor.
 *
 * ---
 *
 * DÜRÜSTLÜK NOTU — iki alan, iki farklı güvenilirlik:
 *
 * 1. `officialUrl` DOĞRULANDI (2026-08-14). Her adrese tek tek istek atıldı.
 *    41 adresin 38'i 200 döndü. Üçü otomatik isteğe kapalı ama tarayıcıda
 *    normal açılıyor ve `urlNote` alanında bu yazılı:
 *      Oxford (403) · UCL (403) · Pavia (405)
 *    Bunlar bot engeli; adres yanlış değil. Aynı durumu katalogda
 *    it-pavia-medicine kaydında da yaşadık.
 *
 * 2. `description` DOĞRULANMADI. Bu metinleri model yazdı; üniversitenin
 *    kendi tanıtımından alınmadı. O yüzden bilinçli olarak SAYI İÇERMİYOR —
 *    öğrenci sayısı, kuruluş yılı, sıralama yok. Sebebi katalogla aynı ilke:
 *    doğrulanmamış sayı, doğrulanmış gibi durur ve ürünün tek gerçek değerini
 *    bitirir. Metinler yalnızca şehir, ülke ve BAŞVURU AÇISINDAN ÖNEMLİ,
 *    bugün kaynak sayfasından teyit ettiğimiz olguları söylüyor
 *    (örn. "lisans dersleri Almanca").
 *
 *    Arayüzde bu metnin yanında kaynak linki duruyor; öğrenci tek tıkla
 *    kurumun kendi anlatımına gidebiliyor. Tanıtımı biz yazdık, iddiayı
 *    üniversite yapıyor.
 */

export interface University {
  /** programs.ts'teki `university` ile birebir aynı olmalı. */
  name: string;
  nameLocal?: string;
  country: CountryCode;
  city: string;
  /** Doğrulanmış resmî site adresi (İngilizce sayfa varsa o). */
  officialUrl: string;
  /** Adres otomatik isteğe kapalıysa sebebi — tarayıcıda açılıyor. */
  urlNote?: Bilingual;
  /** Model tarafından yazıldı, kaynağından doğrulanmadı. Sayı içermez. */
  description: Bilingual;
}

export const UNIVERSITIES: University[] = [
  // -------------------------------------------------------------------------
  // 🇳🇱 HOLLANDA
  // -------------------------------------------------------------------------
  {
    name: "Delft University of Technology",
    nameLocal: "Technische Universiteit Delft",
    country: "NL",
    city: "Delft",
    officialUrl: "https://www.tudelft.nl/en/",
    description: {
      tr: "Hollanda'nın teknik üniversitelerinin en bilinenlerinden; mühendislik ve bilgisayar bilimleri ağırlıklı. Lisans programlarının çoğu İngilizce ve popüler bölümlerde kontenjan sınırı (numerus fixus) uygulanıyor — şartları karşılamak tek başına yeterli olmuyor.",
      en: "One of the best-known technical universities in the Netherlands, focused on engineering and computer science. Most bachelor programmes are in English and the popular ones are capped (numerus fixus) — meeting the requirements alone is not enough.",
    },
  },
  {
    name: "Eindhoven University of Technology",
    nameLocal: "Technische Universiteit Eindhoven",
    country: "NL",
    city: "Eindhoven",
    officialUrl: "https://www.tue.nl/en/",
    description: {
      tr: "Teknoloji odaklı, sanayiyle yakın çalışan bir üniversite. Programlarında seçme prosedürü var: başvuru şartlarını karşılamanın yanında bir de seçmeyi geçmen gerekiyor.",
      en: "A technology-focused university with close industry ties. Its programmes run a selection procedure: besides meeting the entry requirements you must also pass the selection.",
    },
  },
  {
    name: "Erasmus University Rotterdam",
    country: "NL",
    city: "Rotterdam",
    officialUrl: "https://www.eur.nl/en",
    description: {
      tr: "İşletme ve ekonomi tarafı güçlü; Rotterdam School of Management bu üniversitenin bünyesinde. İngilizce işletme programları kontenjan sınırlı ve erken son tarihlerle çalışıyor.",
      en: "Strong in business and economics; Rotterdam School of Management sits within this university. Its English-taught business programmes are capped and work with early deadlines.",
    },
  },
  {
    name: "University of Amsterdam",
    nameLocal: "Universiteit van Amsterdam",
    country: "NL",
    city: "Amsterdam",
    officialUrl: "https://www.uva.nl/en",
    description: {
      tr: "Şehrin içine yayılmış geniş bir araştırma üniversitesi. İngilizce track'lerde numerus fixus ve zorunlu seçme sınavı var; son tarih ocak ortası ve kaçırılırsa telafisi yok.",
      en: "A broad research university spread across the city. English-taught tracks are numerus fixus with a mandatory selection test; the deadline is mid-January with no second chance.",
    },
  },
  {
    name: "University of Groningen",
    nameLocal: "Rijksuniversiteit Groningen",
    country: "NL",
    city: "Groningen",
    officialUrl: "https://www.rug.nl/?lang=en",
    description: {
      tr: "Öğrenci nüfusunun şehre oranı yüksek, yaşam maliyeti Amsterdam'a göre düşük. Dikkat: aynı bölümün Hollandaca ve İngilizce track'leri ayrı programlar — kontenjanları ve dil şartları farklı.",
      en: "A student-heavy city with lower living costs than Amsterdam. Note: the Dutch and English tracks of the same subject are separate programmes with different caps and language requirements.",
    },
  },
  {
    name: "Utrecht University",
    nameLocal: "Universiteit Utrecht",
    country: "NL",
    city: "Utrecht",
    officialUrl: "https://www.uu.nl/en",
    description: {
      tr: "Geniş alanlı klasik bir araştırma üniversitesi. Doğa bilimleri tarafı güçlü; başvurular Studielink üzerinden yürüyor.",
      en: "A broad, classical research university with strong natural sciences. Applications go through Studielink.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇩🇪 ALMANYA
  // -------------------------------------------------------------------------
  {
    name: "Technical University of Munich",
    nameLocal: "Technische Universität München",
    country: "DE",
    city: "München",
    officialUrl: "https://www.tum.de/en/",
    description: {
      tr: "Almanya'nın teknik ağırlıklı üniversitelerinden. Bilgisayar bilimleri lisansında iki aşamalı yetenek tespiti (Eignungsfeststellungsverfahren) var: dosya incelemesi ve yüz yüze test. Sayfası hem iyi Almanca hem iyi İngilizce istiyor.",
      en: "One of Germany's technically focused universities. The informatics bachelor runs a two-stage aptitude assessment (Eignungsfeststellungsverfahren): document review plus an in-person test. The page asks for good German and good English.",
    },
  },
  {
    name: "RWTH Aachen University",
    nameLocal: "RWTH Aachen",
    country: "DE",
    city: "Aachen",
    officialUrl: "https://www.rwth-aachen.de/",
    description: {
      tr: "Mühendislik ağırlıklı, sanayiyle bağı güçlü. ÖNEMLİ: lisans programları yalnızca Almanca veriliyor ve kayıtta C1 seviyesi isteniyor. Diploma ortalaman Alman 2,5 notunun altındaysa TestAS ile telafi edilebiliyor.",
      en: "Engineering-focused with strong industry links. IMPORTANT: bachelor programmes are taught only in German and C1 is required at enrolment. If your diploma average is below German grade 2.5, the TestAS can compensate.",
    },
  },
  {
    name: "University of Mannheim",
    nameLocal: "Universität Mannheim",
    country: "DE",
    city: "Mannheim",
    officialUrl: "https://www.uni-mannheim.de/en/",
    description: {
      tr: "İşletme ve ekonomi tarafıyla tanınıyor. Başvurular AB-dışı diplomalar için uni-assist üzerinden yürüyor.",
      en: "Known for business and economics. Applications with non-EU diplomas go through uni-assist.",
    },
  },
  {
    name: "Heidelberg University",
    nameLocal: "Universität Heidelberg",
    country: "DE",
    city: "Heidelberg",
    officialUrl: "https://www.uni-heidelberg.de/en",
    description: {
      tr: "Almanya'nın en eski üniversitesi; tıp ve doğa bilimleri güçlü. Tıp başvuruları ülke çapında kontenjan kısıtlamasına tabi ve hochschulstart.de üzerinden yürüyor — genel başvuru yollarından ayrı.",
      en: "Germany's oldest university, strong in medicine and natural sciences. Medicine applications fall under nationwide admission restrictions and go through hochschulstart.de — separate from the usual routes.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇬🇧 İNGİLTERE
  // -------------------------------------------------------------------------
  {
    name: "Imperial College London",
    country: "GB",
    city: "London",
    officialUrl: "https://www.imperial.ac.uk/",
    description: {
      tr: "Yalnızca bilim, mühendislik, tıp ve işletme alanlarında eğitim veriyor. Bilgisayar bilimlerinde TMUA matematik sınavı zorunlu; mülakat standart değil, bazı adaylara teklif ediliyor.",
      en: "Teaches only science, engineering, medicine and business. Computing requires the TMUA mathematics test; interviews are not standard but are offered to some candidates.",
    },
  },
  {
    name: "University of Cambridge",
    country: "GB",
    city: "Cambridge",
    officialUrl: "https://www.cam.ac.uk/",
    description: {
      tr: "Kolej sistemiyle çalışıyor: başvuru üniversiteye ama eğitim ve kabul süreci kolejler üzerinden. Mühendislikte ESAT sınavı ve mülakat var. Son tarih diğer UK üniversitelerinden üç ay önce, ekim ortasında.",
      en: "Runs on a college system: you apply to the university but teaching and admissions run through colleges. Engineering requires the ESAT test and an interview. The deadline is three months before other UK universities, in mid-October.",
    },
  },
  {
    name: "University of Oxford",
    country: "GB",
    city: "Oxford",
    officialUrl: "https://www.ox.ac.uk/",
    urlNote: {
      tr: "Site otomatik isteklere 403 veriyor ama tarayıcıda normal açılıyor.",
      en: "The site returns 403 to automated requests but opens normally in a browser.",
    },
    description: {
      tr: "Cambridge gibi kolej sistemiyle çalışıyor ve ikisine aynı yıl birden başvurulamıyor. Mühendislik bilimlerinde ESAT sınavı istisnasız zorunlu, kısa listeye girenler mülakata çağrılıyor. Son tarih ekim ortası.",
      en: "Like Cambridge it runs a college system, and you cannot apply to both in the same year. Engineering Science requires the ESAT without exception, and shortlisted candidates are interviewed. The deadline is mid-October.",
    },
  },
  {
    name: "London School of Economics",
    country: "GB",
    city: "London",
    officialUrl: "https://www.lse.ac.uk/",
    description: {
      tr: "Yalnızca sosyal bilimler alanında eğitim veriyor: ekonomi, siyaset, hukuk, işletme. Londra'nın merkezinde, kampüs birkaç sokağa yayılmış.",
      en: "Teaches social sciences only: economics, politics, law, management. Located in central London with a campus spread over a few streets.",
    },
  },
  {
    name: "University College London",
    country: "GB",
    city: "London",
    officialUrl: "https://www.ucl.ac.uk/",
    urlNote: {
      tr: "Site otomatik isteklere 403 veriyor ama tarayıcıda normal açılıyor.",
      en: "The site returns 403 to automated requests but opens normally in a browser.",
    },
    description: {
      tr: "Çok geniş alanlı, Londra merkezli bir araştırma üniversitesi. Psikoloji gibi bölümlerde ders şartı esnek tanımlı: belirli bir ders zorunlu değil, listeden birinde yüksek not isteniyor.",
      en: "A very broad research university in central London. In subjects like psychology the subject requirement is defined flexibly: no single subject is mandatory, but a high grade in one from a list is expected.",
    },
  },
  {
    name: "University of Manchester",
    country: "GB",
    city: "Manchester",
    officialUrl: "https://www.manchester.ac.uk/",
    description: {
      tr: "Büyük ve çok alanlı bir kampüs üniversitesi; Londra'ya göre yaşam maliyeti belirgin biçimde düşük.",
      en: "A large, broad campus university with living costs noticeably lower than London.",
    },
  },
  {
    name: "University of Edinburgh",
    country: "GB",
    city: "Edinburgh",
    officialUrl: "https://www.ed.ac.uk/",
    description: {
      tr: "İskoçya'da; bilgisayar bilimleri ve yapay zekâ tarafı güçlü. Dikkat: IB ile başvuruda matematikte yalnızca Analysis & Approaches kabul ediliyor, Applications & Interpretation kabul edilmiyor.",
      en: "Located in Scotland with strong computer science and AI. Note: for IB applicants only Mathematics Analysis & Approaches is accepted, not Applications & Interpretation.",
    },
  },
  {
    name: "King's College London",
    country: "GB",
    city: "London",
    officialUrl: "https://www.kcl.ac.uk/",
    description: {
      tr: "Londra merkezli, sağlık bilimleri ve beşeri bilimler tarafı geniş. Dil şartını puan yerine seviye grubuyla ifade ediyor; hangi grubun hangi puana karşılık geldiği ayrı bir tabloda.",
      en: "Central London, broad in health sciences and humanities. It expresses the language requirement as a band rather than a score; which band maps to which score is in a separate table.",
    },
  },
  {
    name: "University of Bristol",
    country: "GB",
    city: "Bristol",
    officialUrl: "https://www.bristol.ac.uk/",
    description: {
      tr: "İngiltere'nin güneybatısında, şehir merkezli bir araştırma üniversitesi. Mühendislik programlarında standart adaylara mülakat uygulanmıyor; kararlar çoğunlukla akademik notlara dayanıyor.",
      en: "A city-centre research university in south-west England. Engineering courses don't routinely interview standard applicants; decisions are mostly based on academic grades.",
    },
  },
  {
    name: "University of Warwick",
    country: "GB",
    city: "Coventry",
    officialUrl: "https://warwick.ac.uk/",
    description: {
      tr: "Coventry yakınında bir kampüs üniversitesi. Ekonomi bölümü İngiltere'nin en rekabetçilerinden; TMUA sınavı isteğe bağlı ama yüksek puan alanlara indirimli teklif sunulabiliyor.",
      en: "A campus university near Coventry. Its Economics department is one of the UK's most competitive; the TMUA test is optional but a high score can lead to a reduced offer.",
    },
  },
  {
    name: "Durham University",
    country: "GB",
    city: "Durham",
    officialUrl: "https://www.durham.ac.uk/",
    description: {
      tr: "Kolej sistemiyle çalışan, kuzey İngiltere'de küçük bir şehirde kurulu bir araştırma üniversitesi. Fen Bilimleri programı esnek: öğrenci hangi bilim dallarını çalışacağını kendisi seçiyor, her dalın kendi ders şartı var.",
      en: "A collegiate research university in a small city in the north of England. Its Natural Sciences programme is flexible: students choose which science subjects to study, each with its own subject requirement.",
    },
  },
  {
    name: "University of St Andrews",
    country: "GB",
    city: "St Andrews",
    officialUrl: "https://www.st-andrews.ac.uk/",
    description: {
      tr: "İskoçya'da küçük bir sahil kasabasında, İskoç sistemine özgü 4 yıllık onur derecesi (Honours) veriyor. Psikoloji hem BSc hem MA olarak sunuluyor, ikisinin şartları eşit.",
      en: "A small coastal-town university in Scotland offering a 4-year Honours degree per the Scottish system. Psychology is offered as both BSc and MA, with equal entry requirements.",
    },
  },
  {
    name: "University of Bath",
    country: "GB",
    city: "Bath",
    officialUrl: "https://www.bath.ac.uk/",
    description: {
      tr: "İngiltere'nin güneybatısında, işletme ve yönetim alanında ülke çapında en üst sıralarda yer alan bir üniversite. Türk öğrenciler için ayrı bir denklik tablosu ve matematik notu şartı yayınlıyor.",
      en: "A university in south-west England consistently ranked among the UK's top for business and management. It publishes a separate equivalency table and a mathematics-grade requirement specifically for Turkish applicants.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇫🇷 FRANSA
  // -------------------------------------------------------------------------
  {
    name: "Sorbonne University",
    nameLocal: "Sorbonne Université",
    country: "FR",
    city: "Paris",
    officialUrl: "https://www.sorbonne-universite.fr/en",
    description: {
      tr: "Paris'te köklü bir devlet üniversitesi. Lisans eğitimi Fransızca ve girişin büyük kısmı kendi birinci sınıf portalından ilerliyor — Türk lise mezununun doğrudan üst sınıfa girmesi teyit gerektiriyor.",
      en: "A long-established public university in Paris. Bachelor teaching is in French and most entry runs through its own first-year portal — direct entry to later years needs confirming for Turkish school leavers.",
    },
  },
  {
    name: "École Polytechnique",
    country: "FR",
    city: "Palaiseau",
    officialUrl: "https://www.polytechnique.edu/en",
    description: {
      tr: "Paris yakınında, mühendislik ağırlıklı bir grande école. İngilizce verilen Bachelor of Science programı var — Fransa'da Fransızca bilmeden girilebilecek az sayıdaki devlet yolundan biri.",
      en: "A grande école near Paris focused on engineering. It runs an English-taught Bachelor of Science — one of the few public routes in France open without French.",
    },
  },
  {
    name: "Sciences Po",
    country: "FR",
    city: "Reims",
    officialUrl: "https://www.sciencespo.fr/en/",
    description: {
      tr: "Siyaset bilimi, uluslararası ilişkiler ve ekonomi odaklı. Birden fazla kampüsü var ve bazı programları İngilizce veriliyor.",
      en: "Focused on political science, international relations and economics. It has several campuses and some programmes are taught in English.",
    },
  },
  {
    name: "Paris-Saclay University",
    nameLocal: "Université Paris-Saclay",
    country: "FR",
    city: "Orsay",
    officialUrl: "https://www.universite-paris-saclay.fr/en",
    description: {
      tr: "Paris'in güneyinde, araştırma kurumlarının birleşmesiyle kurulmuş geniş bir üniversite. Lisans tarafı ağırlıkla Fransızca; başvuru Campus France üzerinden yürüyor.",
      en: "A large university south of Paris formed by merging research institutions. Bachelor teaching is mostly in French and applications go through Campus France.",
    },
  },
  {
    name: "EDHEC Business School",
    country: "FR",
    city: "Lille",
    officialUrl: "https://www.edhec.edu/en",
    description: {
      tr: "Özel bir işletme okulu; Lille ve Nice kampüslerinde İngilizce BBA veriyor. Fransa'da Fransızca bilmeden girilebilecek yollardan biri ama harç devlet üniversitelerinin çok üzerinde ve iki track'in fiyatı farklı.",
      en: "A private business school offering an English-taught BBA on its Lille and Nice campuses. One of the routes into France without French, but tuition is far above public universities and the two tracks are priced differently.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇨🇭 İSVİÇRE
  // -------------------------------------------------------------------------
  {
    name: "ETH Zürich",
    nameLocal: "Eidgenössische Technische Hochschule Zürich",
    country: "CH",
    city: "Zürich",
    officialUrl: "https://ethz.ch/en.html",
    description: {
      tr: "İsviçre'nin teknik üniversitesi. İKİ ÖNEMLİ NOKTA: bilgisayar bilimleri lisansının ilk yılı Almanca veriliyor (ikinci yıldan itibaren dersler artan oranda İngilizce) ve 2025 güzünden beri İsviçre dışı diplomayla gelenler üç kat harç grubunda. Zürih'te yaşam maliyeti listedeki en yüksek kalem.",
      en: "Switzerland's federal technical university. TWO IMPORTANT POINTS: the first year of the computer science bachelor is taught in German (courses shift increasingly to English from year two), and since autumn 2025 students with a non-Swiss certificate fall into the threefold tuition group. Living costs in Zürich are the highest on this list.",
    },
  },
  {
    name: "EPFL",
    nameLocal: "École polytechnique fédérale de Lausanne",
    country: "CH",
    city: "Lausanne",
    officialUrl: "https://www.epfl.ch/en/",
    description: {
      tr: "Lausanne'da, ETH'nin Fransızca konuşulan bölgedeki kardeş kurumu. Lisans eğitimi Fransızca.",
      en: "In Lausanne, ETH's sister institution in the French-speaking region. Bachelor teaching is in French.",
    },
  },
  {
    name: "University of St. Gallen",
    nameLocal: "Universität St. Gallen",
    country: "CH",
    city: "St. Gallen",
    officialUrl: "https://www.unisg.ch/en/",
    description: {
      tr: "İşletme ve ekonomi odaklı. Uluslararası adaylar için kontenjan yasayla sınırlı ve seçme prosedürü uygulanıyor: yetenek testi ve video mülakat. Harç İsviçre Frangı cinsinden ve yabancı uyruklular için iki katından fazla.",
      en: "Focused on business and economics. Places for international applicants are limited by law and a selection procedure applies: an aptitude test and a video interview. Tuition is in Swiss francs and more than double for foreign nationals.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇸🇪 İSVEÇ
  // -------------------------------------------------------------------------
  {
    name: "KTH Royal Institute of Technology",
    nameLocal: "Kungliga Tekniska högskolan",
    country: "SE",
    city: "Stockholm",
    officialUrl: "https://www.kth.se/en",
    description: {
      tr: "İsveç'in teknik üniversitesi, Stockholm'de. Seçim not ortalaması SIRALAMASIYLA yapılıyor, sabit bir eşikle değil — 2024'te şartları karşılayan adayların yaklaşık onda biri yerleşti. Harç İsveç Kronu cinsinden ve AB-dışı öğrenciler ödüyor.",
      en: "Sweden's technical university, in Stockholm. Selection is by grade-average RANKING rather than a fixed threshold — in 2024 roughly one in ten eligible applicants was admitted. Tuition is in Swedish kronor and payable by non-EU students.",
    },
  },
  {
    name: "Lund University",
    nameLocal: "Lunds universitet",
    country: "SE",
    city: "Lund",
    officialUrl: "https://www.lunduniversity.lu.se/",
    description: {
      tr: "İsveç'in güneyinde, Kopenhag'a yakın bir üniversite şehri. İngilizce lisans programları var; harç İsveç Kronu cinsinden ve program toplamı olarak yayınlanıyor.",
      en: "A university town in southern Sweden, close to Copenhagen. It offers English-taught bachelor programmes; tuition is in Swedish kronor and published as a total for the programme.",
    },
  },
  {
    name: "Uppsala University",
    nameLocal: "Uppsala universitet",
    country: "SE",
    city: "Uppsala",
    officialUrl: "https://www.uu.se/en",
    description: {
      tr: "İskandinavya'nın en eski üniversitelerinden; Stockholm'e yakın. Doğa bilimleri tarafı geniş.",
      en: "One of the oldest universities in Scandinavia, close to Stockholm, with broad natural sciences.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇧🇪 BELÇİKA
  // -------------------------------------------------------------------------
  {
    name: "KU Leuven",
    country: "BE",
    city: "Brussels",
    officialUrl: "https://www.kuleuven.be/english/",
    description: {
      tr: "Belçika'nın Flaman bölgesinde köklü bir üniversite; birden fazla şehirde kampüsü var. Lisans programlarının çoğu Hollandaca, bir kısmı İngilizce — hangisi olduğunu program bazında kontrol etmek gerekiyor.",
      en: "A long-established university in Flemish Belgium with campuses in several cities. Most bachelor programmes are in Dutch and some in English — this must be checked per programme.",
    },
  },
  {
    name: "Ghent University",
    nameLocal: "Universiteit Gent",
    country: "BE",
    city: "Ghent",
    officialUrl: "https://www.ugent.be/en",
    description: {
      tr: "DİKKAT: sosyal bilimler dışındaki lisans programları Hollandaca veriliyor — mühendislik ve bilgisayar bilimleri dahil. Yurt dışı diploması otomatik denklik almıyor, bireysel değerlendirmeye giriyor.",
      en: "NOTE: apart from social sciences, bachelor programmes are taught in Dutch — including engineering and computer science. Foreign diplomas are not automatically recognised and go through individual assessment.",
    },
  },
  {
    name: "Université libre de Bruxelles",
    country: "BE",
    city: "Brussels",
    officialUrl: "https://www.ulb.be/en",
    description: {
      tr: "Brüksel'de, Belçika'nın Fransızca konuşulan topluluğuna bağlı. Lisans eğitimi ağırlıkla Fransızca.",
      en: "In Brussels, part of Belgium's French-speaking community. Bachelor teaching is mostly in French.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇩🇰 DANİMARKA
  // -------------------------------------------------------------------------
  {
    name: "Technical University of Denmark",
    nameLocal: "Danmarks Tekniske Universitet",
    country: "DK",
    city: "Kongens Lyngby",
    officialUrl: "https://www.dtu.dk/english/",
    description: {
      tr: "Kopenhag'ın hemen kuzeyinde, mühendislik odaklı. İngilizce verilen tek lisans programı General Engineering (BSc); Danca verilen BEng programlarıyla karıştırmamak gerekiyor. Lisans düzeyinde burs vermiyor.",
      en: "Just north of Copenhagen, engineering-focused. Its only English-taught bachelor is General Engineering (BSc) — not to be confused with the Danish-taught BEng programmes. It offers no scholarships at bachelor level.",
    },
  },
  {
    name: "Copenhagen Business School",
    country: "DK",
    city: "Copenhagen",
    officialUrl: "https://www.cbs.dk/en",
    description: {
      tr: "Yalnızca işletme, ekonomi ve ilgili alanlarda eğitim veriyor. İngilizce lisans programları var.",
      en: "Teaches business, economics and related fields only, with English-taught bachelor programmes.",
    },
  },
  {
    name: "University of Copenhagen",
    nameLocal: "Københavns Universitet",
    country: "DK",
    city: "Copenhagen",
    officialUrl: "https://www.ku.dk/en",
    description: {
      tr: "Danimarka'nın en büyük ve çok alanlı üniversitesi. Dikkat: AB-dışı ve AB adayları için son tarihler ayrı — erken olanı kaçırmamak gerekiyor.",
      en: "Denmark's largest and broadest university. Note: deadlines differ for non-EU and EU applicants — the earlier one is the binding date.",
    },
  },

  // -------------------------------------------------------------------------
  // 🇮🇹 İTALYA
  // -------------------------------------------------------------------------
  {
    name: "Politecnico di Milano",
    country: "IT",
    city: "Milano",
    officialUrl: "https://www.polimi.it/en",
    description: {
      tr: "İtalya'nın mühendislik, mimarlık ve tasarım odaklı teknik üniversitesi. Harç aile gelirine (ISEE) göre kademeli, düşük gelirde belirgin biçimde düşüyor.",
      en: "Italy's technical university for engineering, architecture and design. Tuition is scaled by family income (ISEE) and drops substantially at lower levels.",
    },
  },
  {
    name: "Sapienza University of Rome",
    nameLocal: "Sapienza Università di Roma",
    country: "IT",
    city: "Roma",
    officialUrl: "https://www.uniroma1.it/en",
    description: {
      tr: "Roma'da çok büyük ve çok alanlı bir devlet üniversitesi. Tamamen İngilizce verilen lisans programları var; bunlara başvuru MoveIN ön seçimiyle yapılıyor ve harç ikamet ülkesine göre değişiyor.",
      en: "A very large, broad public university in Rome. It has fully English-taught bachelor programmes; applications to those go through a MoveIN pre-selection and tuition varies by country of residence.",
    },
  },
  {
    name: "Politecnico di Torino",
    country: "IT",
    city: "Torino",
    officialUrl: "https://www.polito.it/en",
    description: {
      tr: "Torino'da mühendislik ve mimarlık odaklı teknik üniversite. Programların bir kısmı hem İtalyanca hem tamamen İngilizce veriliyor; İngilizce track için B2 belgesi şart. Harç, öğrencinin vatandaşı olduğu ülkenin satın alma gücüne göre hesaplanıyor.",
      en: "A technical university in Turin focused on engineering and architecture. Some programmes run in both Italian and fully in English; the English track requires a B2 certificate. Tuition is calculated from the purchasing power of the student's country of citizenship.",
    },
  },
  {
    name: "Bocconi University",
    nameLocal: "Università Bocconi",
    country: "IT",
    city: "Milano",
    officialUrl: "https://www.unibocconi.it/en",
    description: {
      tr: "Milano'da özel bir üniversite; ekonomi, işletme ve finans odaklı. İngilizce lisans programları var.",
      en: "A private university in Milan focused on economics, business and finance, with English-taught bachelor programmes.",
    },
  },
  {
    name: "University of Bologna",
    nameLocal: "Università di Bologna",
    country: "IT",
    city: "Bologna",
    officialUrl: "https://www.unibo.it/en",
    description: {
      tr: "Avrupa'nın en eski üniversitesi kabul edilir; çok alanlı ve çok kampüslü. Bazı programları İngilizce veriliyor.",
      en: "Regarded as Europe's oldest university; broad and multi-campus, with some English-taught programmes.",
    },
  },
  {
    name: "University of Pavia",
    nameLocal: "Università di Pavia",
    country: "IT",
    city: "Pavia",
    officialUrl: "https://en.unipv.it/",
    urlNote: {
      tr: "Site otomatik isteklere 405 veriyor ama tarayıcıda normal açılıyor.",
      en: "The site returns 405 to automated requests but opens normally in a browser.",
    },
    description: {
      tr: "Milano'ya yakın küçük bir üniversite şehri. İngilizce verilen tıp programı (Harvey) ulusal IMAT sınavıyla ve sınırlı kontenjanla alıyor.",
      en: "A small university town near Milan. Its English-taught medicine programme (Harvey) admits through the national IMAT exam with a limited number of places.",
    },
  },
];

/** Ada göre hızlı erişim — `programs.ts`'teki `university` alanıyla eşleşir. */
export const UNIVERSITY_BY_NAME: Record<string, University> = Object.fromEntries(
  UNIVERSITIES.map((u) => [u.name, u])
);

export function getUniversity(name: string): University | undefined {
  return UNIVERSITY_BY_NAME[name];
}
