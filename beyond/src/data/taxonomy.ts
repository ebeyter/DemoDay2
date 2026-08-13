import type {
  ApplicationSystem,
  Bilingual,
  CountryCode,
  FieldId,
  TeachingLanguage,
} from "@/lib/types";

export interface CountryMeta {
  code: CountryCode;
  name: Bilingual;
  flag: string;
  /** Bu ülkedeki başvurunun hangi sistemden yürüdüğü — takvim ekranını besler. */
  systems: ApplicationSystem[];
  /** AB-dışı öğrencinin bilmesi gereken tek cümlelik kritik not. */
  nonEuNote: Bilingual;
}

export const COUNTRIES: Record<CountryCode, CountryMeta> = {
  NL: {
    code: "NL",
    name: { tr: "Hollanda", en: "Netherlands" },
    flag: "🇳🇱",
    systems: ["studielink"],
    nonEuNote: {
      tr: "Tüm başvurular Studielink üzerinden. Kontenjanı sınırlı (numerus fixus) programlarda son tarih 15 Ocak ve kaçırılırsa telafisi yok.",
      en: "Everything goes through Studielink. Capped (numerus fixus) programs close on 15 January with no second chance.",
    },
  },
  DE: {
    code: "DE",
    name: { tr: "Almanya", en: "Germany" },
    flag: "🇩🇪",
    systems: ["uni-assist", "direct"],
    nonEuNote: {
      tr: "Türk lise diploması tek başına yetmiyor: YKS ile bir üniversiteye yerleşmiş olman ya da Studienkolleg bitirmen isteniyor. Bu, Almanya'yı planlamanın en kritik detayı.",
      en: "A Turkish high-school diploma alone is not enough: you need a YKS university placement or a completed Studienkolleg year.",
    },
  },
  GB: {
    code: "GB",
    name: { tr: "İngiltere", en: "United Kingdom" },
    flag: "🇬🇧",
    systems: ["ucas"],
    nonEuNote: {
      tr: "Tek merkezden (UCAS) en fazla 5 tercih yapabilirsin. Oxford, Cambridge ve tıp için son tarih Ekim ortası, diğerleri Ocak ortası.",
      en: "UCAS allows at most five choices. Oxford, Cambridge and medicine close in mid-October; everything else mid-January.",
    },
  },
  FR: {
    code: "FR",
    name: { tr: "Fransa", en: "France" },
    flag: "🇫🇷",
    systems: ["campus-france", "parcoursup"],
    nonEuNote: {
      tr: "İki hat var ve ikisi de gerekli: Campus France (Études en France) prosedürü Ekim'de açılır ve vize için zorunludur, Parcoursup ise Mart'ta kapanır. Campus France'ı kaçırırsan Parcoursup işe yaramaz.",
      en: "Two parallel tracks, both mandatory: the Campus France (Études en France) procedure opens in October and gates your visa; Parcoursup closes in March.",
    },
  },
  CH: {
    code: "CH",
    name: { tr: "İsviçre", en: "Switzerland" },
    flag: "🇨🇭",
    systems: ["direct"],
    nonEuNote: {
      tr: "Harçlar Avrupa'nın en düşüklerinden ama Türk lise diploması çoğu üniversitede tek başına kabul edilmiyor — giriş sınavı isteniyor. Yaşam maliyeti çok yüksek.",
      en: "Tuition is among the lowest in Europe, but a Turkish diploma alone is usually not accepted — an entrance exam is required. Living costs are high.",
    },
  },
  SE: {
    code: "SE",
    name: { tr: "İsveç", en: "Sweden" },
    flag: "🇸🇪",
    systems: ["direct"],
    nonEuNote: {
      tr: "Lisans düzeyinde İngilizce program sayısı sınırlı — çoğu program İsveççe. Başvurular tek merkezden (universityadmissions.se) ve 15 Ocak'ta kapanıyor.",
      en: "English-taught bachelor programs are limited — most are in Swedish. Applications run through universityadmissions.se and close 15 January.",
    },
  },
  BE: {
    code: "BE",
    name: { tr: "Belçika", en: "Belgium" },
    flag: "🇧🇪",
    systems: ["direct"],
    nonEuNote: {
      tr: "Flaman (Felemenkçe) ve Valon (Fransızca) olmak üzere iki ayrı sistem var; şartlar ve harçlar bölgeye göre değişiyor. AB-dışı öğrenci için harç birkaç katına çıkıyor.",
      en: "Two separate systems — Flemish (Dutch) and Walloon (French) — with different rules. Non-EU tuition is several times the EU rate.",
    },
  },
  DK: {
    code: "DK",
    name: { tr: "Danimarka", en: "Denmark" },
    flag: "🇩🇰",
    systems: ["direct"],
    nonEuNote: {
      tr: "AB-dışı öğrenciler için son tarih 15 Ocak, AB'lilerden iki ay erken. Eğitim ücretli ama sınırlı sayıda burs var.",
      en: "The non-EU deadline is 15 January, two months earlier than the EU one. Tuition applies, with a limited number of scholarships.",
    },
  },
  IT: {
    code: "IT",
    name: { tr: "İtalya", en: "Italy" },
    flag: "🇮🇹",
    systems: ["direct"],
    nonEuNote: {
      tr: "Devlet üniversitelerinde harç aile gelirine (ISEE) göre belirleniyor, düşük gelirde neredeyse sıfıra inebiliyor. Tıp için IMAT giriş sınavı zorunlu.",
      en: "Public universities set tuition by family income (ISEE), which can drop close to zero. Medicine requires the IMAT entrance exam.",
    },
  },
};

export interface FieldMeta {
  id: FieldId;
  name: Bilingual;
  icon: string;
}

export const FIELDS: Record<FieldId, FieldMeta> = {
  cs: {
    id: "cs",
    name: { tr: "Bilgisayar Bilimleri", en: "Computer Science" },
    icon: "◆",
  },
  engineering: {
    id: "engineering",
    name: { tr: "Mühendislik", en: "Engineering" },
    icon: "▲",
  },
  business: {
    id: "business",
    name: { tr: "İşletme", en: "Business" },
    icon: "■",
  },
  economics: {
    id: "economics",
    name: { tr: "Ekonomi", en: "Economics" },
    icon: "◇",
  },
  medicine: {
    id: "medicine",
    name: { tr: "Tıp", en: "Medicine" },
    icon: "✚",
  },
  psychology: {
    id: "psychology",
    name: { tr: "Psikoloji", en: "Psychology" },
    icon: "●",
  },
  "natural-sciences": {
    id: "natural-sciences",
    name: { tr: "Fen Bilimleri", en: "Natural Sciences" },
    icon: "✦",
  },
};

export const APPLICATION_SYSTEMS: Record<
  ApplicationSystem,
  { name: string; description: Bilingual; url: string }
> = {
  ucas: {
    name: "UCAS",
    description: {
      tr: "İngiltere'nin tek merkezi başvuru sistemi. En fazla 5 tercih, tek niyet mektubu.",
      en: "The UK's single centralised system. Up to five choices, one personal statement.",
    },
    url: "https://www.ucas.com",
  },
  studielink: {
    name: "Studielink",
    description: {
      tr: "Hollanda'daki tüm üniversite başvuruları buradan yapılır, sonra üniversitenin kendi portalı devreye girer.",
      en: "All Dutch university applications start here, then continue in each university's own portal.",
    },
    url: "https://www.studielink.nl",
  },
  "uni-assist": {
    name: "uni-assist",
    description: {
      tr: "Almanya'daki birçok üniversitenin uluslararası başvuru değerlendirme merkezi. Belge ön kontrolü yapar, ücretlidir.",
      en: "Pre-screens international applications for many German universities. Charges a per-application fee.",
    },
    url: "https://www.uni-assist.de",
  },
  parcoursup: {
    name: "Parcoursup",
    description: {
      tr: "Fransa'nın lisans başvuru platformu. Ocak'ta açılır, Mart ortasında tercihler kapanır.",
      en: "France's undergraduate platform. Opens in January, choices close in mid-March.",
    },
    url: "https://www.parcoursup.fr",
  },
  "campus-france": {
    name: "Campus France (Études en France)",
    description: {
      tr: "AB-dışı öğrenciler için zorunlu ön prosedür. Vize başvurusunun önkoşulu — Parcoursup'tan önce başlar ve daha erken kapanır.",
      en: "Mandatory pre-procedure for non-EU students and a prerequisite for the visa. Starts before Parcoursup and closes earlier.",
    },
    url: "https://www.campusfrance.org",
  },
  direct: {
    name: "Doğrudan başvuru",
    description: {
      tr: "Üniversitenin kendi portalından başvuru. Her okulun takvimi ve belge listesi ayrı — tek tek takip etmen gerekir.",
      en: "Apply through the university's own portal. Each school has its own timeline and document list.",
    },
    url: "",
  },
};

export const TEACHING_LANGUAGE_LABEL: Record<TeachingLanguage, Bilingual> = {
  en: { tr: "İngilizce", en: "English" },
  nl: { tr: "Felemenkçe", en: "Dutch" },
  de: { tr: "Almanca", en: "German" },
  fr: { tr: "Fransızca", en: "French" },
  it: { tr: "İtalyanca", en: "Italian" },
  sv: { tr: "İsveççe", en: "Swedish" },
  da: { tr: "Danca", en: "Danish" },
};
