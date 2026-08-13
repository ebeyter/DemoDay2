import type { Bilingual, CountryCode } from "./types";

/**
 * Beyond — vize / oturum izni adımları.
 *
 * Kabul mektubu son adım değil. Türk öğrenci için asıl darboğaz genelde vize
 * ya da oturum izni süreci, ve çoğu öğrenci bunu geç öğreniyor. Bu veri, her
 * ülkenin resmi göç makamının kendi sayfasından araştırılmış — tahmin değil.
 *
 * Süreler BİLEREK aralık (veya sadece üst sınır) olarak tutuluyor, tek sayı
 * değil: resmi kaynaklar bile genelde tek bir kesin rakam vermiyor. Bir adım
 * için resmi bir süre bulunamadıysa `timing` alanı hiç yok — o adımda sadece
 * açıklama ve kaynak linki gösterilir. Ürünün "olasılık uydurmama" ilkesinin
 * aynısı burada da geçerli: bilmediğimiz bir süreyi uydurmak, sahte bir kabul
 * yüzdesi göstermekten farksız olurdu.
 */

export interface VisaStepTiming {
  /** Resmi kaynak bir alt sınır veriyorsa. Yoksa "en fazla X hafta" gösterilir. */
  minWeeks?: number;
  /** Üst sınır — kabul/başvuru adımından SONRA, adımın kendi süresi. */
  maxWeeks: number;
}

export interface VisaStep {
  id: string;
  label: Bilingual;
  description: Bilingual;
  /** undefined = resmi kaynakta savunulabilir bir süre bulunamadı. */
  timing?: VisaStepTiming;
  sourceUrl: string;
  /** Süre neden değişken/belirsiz — kullanıcıya olduğu gibi gösterilir. */
  caveat?: Bilingual;
}

export const VISA_STEPS: Partial<Record<CountryCode, VisaStep[]>> = {
  NL: [
    {
      id: "nl-visa-1",
      label: {
        tr: "MVV + oturum izni başvurusu (üniversite senin adına yapar)",
        en: "MVV + residence permit application (submitted by the university)",
      },
      description: {
        tr: "Kabulden sonra, tanınmış sponsor statüsündeki üniversite MVV (giriş vizesi) ve oturum iznini birlikte IND'e başvurur — sen ayrıca başvuru yapmazsın.",
        en: "After acceptance, the recognized-sponsor university applies to IND on your behalf for the entry visa (MVV) and residence permit together — you don't file separately.",
      },
      timing: { minWeeks: 2, maxWeeks: 9 },
      sourceUrl:
        "https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education",
      caveat: {
        tr: "IND'in kendi sayfaları arasında bile fark var: rutin durumda ~2 hafta, yasal üst sınır 60 gün (~9 hafta). Mayıs-Ağustos yoğun dönemde üst sınıra yaklaşır.",
        en: "Even IND's own pages disagree — routine cases take ~2 weeks, the legal ceiling is 60 days (~9 weeks); May–August is busy season, closer to the ceiling.",
      },
    },
  ],

  DE: [
    {
      id: "de-visa-1",
      label: {
        tr: "Ulusal (D) öğrenci vizesi — Türkiye'deki Alman temsilciliğinde",
        en: "National (D) student visa — at the German mission in Turkey",
      },
      description: {
        tr: "Dosya tamamlandıktan sonra Almanya'nın Ankara/İstanbul/İzmir'deki temsilciliğine ulusal vize için başvurulur.",
        en: "Once your file is complete, you apply for the national visa at Germany's mission in Ankara, Istanbul or Izmir.",
      },
      timing: { minWeeks: 5, maxWeeks: 12 },
      sourceUrl: "https://tuerkei.diplo.de/tr-de/service/05-visaeinreise/2170670-2170670",
      caveat: {
        tr: "5 hafta, dosya tamamlandıktan SONRAKİ resmi asgari süre — randevu bekleme dahil gerçek süre daha uzun olabilir, İstanbul konsolosluğunda bekleme genelde daha uzun.",
        en: "5 weeks is the stated minimum once the file is complete — actual wait including appointment scheduling is often longer, especially at the Istanbul consulate.",
      },
    },
    {
      id: "de-visa-2",
      label: {
        tr: "Varıştan sonra ikamet kaydı ve oturum izninin teslimi",
        en: "Address registration and residence-permit pickup after arrival",
      },
      description: {
        tr: "Almanya'ya varınca adres kaydı (Anmeldung) yapılır; nihai oturum izni yaşadığın şehrin Yabancılar Dairesi'nden (Ausländerbehörde) alınır.",
        en: "After arriving in Germany you register your address (Anmeldung); the final residence permit is issued by your city's Foreigners' Authority (Ausländerbehörde).",
      },
      sourceUrl: "https://www.germany.info/us-en/service/visa/study-visa-916776",
      caveat: {
        tr: "Almanya çapında tek bir resmi süre yok — yaklaşık 500 yerel Yabancılar Dairesi bunu bağımsız yürütüyor, bu yüzden bir aralık vermiyoruz.",
        en: "There's no single federal figure — roughly 500 local Foreigners' Authorities handle this independently, so we don't show a range here.",
      },
    },
  ],

  GB: [
    {
      id: "gb-visa-1",
      label: {
        tr: "CAS alındıktan sonra çevrimiçi Student vize başvurusu",
        en: "Online Student visa application after receiving your CAS",
      },
      description: {
        tr: "Üniversiteden CAS aldıktan sonra çevrimiçi başvuru yapılır, vize ücreti ve sağlık harcı (IHS) ödenir, kimlik doğrulaması tamamlanır — ders başlangıcından en fazla 6 ay önce yapılabilir.",
        en: "Once your university issues the CAS, you apply online, pay the visa fee and health surcharge, and complete identity verification — up to 6 months before your course starts.",
      },
      timing: { minWeeks: 3, maxWeeks: 8 },
      sourceUrl: "https://www.gov.uk/student-visa",
      caveat: {
        tr: "gov.uk dışarıdan (Türkiye'den) başvuranlar için 3 hafta, İngiltere içinden başvuranlar için 8 hafta diyor. Haziran-Eylül yoğun dönemde ve ücretli hızlandırılmış hizmet olmadan süre uzayabilir.",
        en: "gov.uk states 3 weeks for applications made from outside the UK vs. 8 weeks from inside; June–September is busier and slower without a paid priority service.",
      },
    },
  ],

  FR: [
    {
      id: "fr-visa-1",
      label: {
        tr: 'Campus France Türkiye "Études en France" prosedürü',
        en: 'Campus France Turkey "Études en France" procedure',
      },
      description: {
        tr: "Türk öğrenciler uzun süreli öğrenci vizesi talep edebilmek için önce Campus France Türkiye (Ankara/İstanbul/İzmir) üzerinden kayıt olup onaylanmalı.",
        en: "Turkish applicants must register and be cleared through Campus France Turkey (Ankara, Istanbul or Izmir) before they can request the long-stay student visa.",
      },
      sourceUrl: "https://www.campusfrance.org/en/application-etudes-en-france-procedure",
      caveat: {
        tr: "Bu adım için resmi bir hafta rakamı yayınlanmıyor; gayriresmi kaynaklar EEF+vize toplamı için 4-6 ay söylüyor ama bu resmi bir rakam değil, o yüzden burada göstermiyoruz.",
        en: "No official weeks-based figure is published for this step; unofficial sources cite 4-6 months for the combined procedure, but that isn't an official number.",
      },
    },
    {
      id: "fr-visa-2",
      label: {
        tr: "VLS-TS uzun süreli öğrenci vizesi başvurusu",
        en: "VLS-TS long-stay student visa application",
      },
      description: {
        tr: "Campus France onayından sonra konsoloslukta randevu alınır, başvuru France-Visas üzerinden yapılır.",
        en: "After Campus France clearance, you book a consulate appointment and apply through France-Visas.",
      },
      timing: { minWeeks: 2, maxWeeks: 7 },
      sourceUrl: "https://france-visas.gouv.fr/en/faq",
      caveat: {
        tr: "France-Visas normal karar süresini 15 gün olarak belirtiyor, özel durumlarda 45 güne kadar uzayabiliyor.",
        en: "France-Visas states a normal 15-day decision period, extendable to 45 days in special cases.",
      },
    },
    {
      id: "fr-visa-3",
      label: {
        tr: "Varıştan sonra OFII/ANEF üzerinden vize onaylatma",
        en: "Online visa validation via OFII/ANEF after arrival",
      },
      description: {
        tr: "Fransa'ya varıştan sonraki 3 ay içinde vize çevrimiçi onaylanır (bu andan itibaren oturum izni yerine geçer) ve ikamet vergisi ödenir.",
        en: "Within 3 months of arriving in France, you validate the visa online — it then functions as your residence permit — and pay the stay tax.",
      },
      sourceUrl:
        "https://www.campusfrance.org/en/how-to-validate-your-long-stay-visa-visa-long-sejour-upon-your-arrival-in-france",
      caveat: {
        tr: "Formun kendisi 20-40 dakika sürüyor ama arka plandaki onay süresi için resmi bir rakam yok.",
        en: "The form itself takes 20-40 minutes, but there's no official figure for the backend processing time.",
      },
    },
  ],

  CH: [
    {
      id: "ch-visa-1",
      label: {
        tr: "Ulusal (D) öğrenci vizesi — Türkiye'deki İsviçre Başkonsolosluğu",
        en: "National (D) student visa — Swiss Consulate General in Turkey",
      },
      description: {
        tr: "Konsolosluk dosyayı hem sorumlu kantona hem de SEM'e (Göç Sekreterliği) onay için iletir.",
        en: "The consulate forwards your file to both the responsible canton and SEM (State Secretariat for Migration) for approval.",
      },
      timing: { minWeeks: 8, maxWeeks: 12 },
      sourceUrl:
        "https://www.eda.admin.ch/countries/turkey/en/home/visa/entry-ch/more-90-days/documents-national.html",
      caveat: {
        tr: "Bu sayfaya otomatik erişim engellendi (bot koruması); rakam arama sonuçlarında doğrulandı ama yayınlamadan önce elle bir kez kontrol etmekte fayda var.",
        en: "Automated access to this page was blocked (bot protection); the figure was confirmed via indexed search results, but a manual spot-check before relying on it is worthwhile.",
      },
    },
  ],

  SE: [
    {
      id: "se-visa-1",
      label: {
        tr: "Yükseköğrenim için oturum izni başvurusu",
        en: "Residence permit application for higher education studies",
      },
      description: {
        tr: "Kabul ve harç ödemesinden sonra çevrimiçi başvuru yapılır; biyometri için konsoloslukta randevuya gidilir, Migrationsverket başvuruyu inceler.",
        en: "After admission and tuition payment, you apply online, attend an embassy/consulate appointment for biometrics, and Migrationsverket reviews the application.",
      },
      timing: { minWeeks: 4, maxWeeks: 13 },
      sourceUrl: "https://www.migrationsverket.se/en/you-want-to-apply/study/higher-education.html",
      caveat: {
        tr: "Migrationsverket kesin bir süre garanti etmiyor; yasal üst sınır 90 gün (~13 hafta), 2023'te bu izin türü için ortalama 64 gün (~9 hafta) rapor edilmiş.",
        en: "Migrationsverket explicitly won't guarantee a processing time; the legal ceiling is 90 days (~13 weeks), with a reported 2023 average of 64 days (~9 weeks) for this permit type.",
      },
    },
  ],

  BE: [
    {
      id: "be-visa-1",
      label: {
        tr: "Uzun süreli (D tipi) öğrenci vizesi başvurusu",
        en: "Long-stay (type D) student visa application",
      },
      description: {
        tr: "Tanınmış bir yükseköğretim kurumuna kabul edilen öğrenci için Göçmenlik Dairesi, dosya eksiksiz sayıldıktan sonra 90 gün içinde karar vermek zorunda.",
        en: "For a student admitted to a recognized higher-education institution, the Immigration Office must decide within 90 days of the file being considered complete.",
      },
      timing: { maxWeeks: 13 },
      sourceUrl:
        "https://dofi.ibz.be/en/themes/third-country-nationals/study/higher-education/recognised-higher-education-institution-1",
      caveat: {
        tr: "DOFI sadece 90 günlük yasal tavanı yayınlıyor, tipik ya da asgari bir süre vermiyor — gerçek kararlar daha hızlı olabilir ama resmi bir alt sınır yok.",
        en: "DOFI only publishes the 90-day legal ceiling, not a typical or minimum time — real decisions can be faster, but no official floor is given.",
      },
    },
    {
      id: "be-visa-2",
      label: {
        tr: "Varıştan sonra belediyeye kayıt ve biyometrik A kart süreci",
        en: "Commune registration and biometric A-card process after arrival",
      },
      description: {
        tr: "Öğrenci varıştan itibaren 8 iş günü içinde belediyeye (commune) başvurmak zorunda; bu, biyometrik A kartına giden sürecin başlangıcı.",
        en: "Within 8 working days of arrival, the student must report to the commune's municipal administration — the start of the process leading to the biometric A card.",
      },
      sourceUrl: "https://dofi.ibz.be/en/themes/faq/long-stay/national-entries-visa-d",
      caveat: {
        tr: "8 iş günü, sürece BAŞLAMAK için son tarih — kartın kendisinin ne zaman teslim edileceğine dair resmi bir süre yayınlanmıyor.",
        en: "The 8 working days is the deadline to START the process, not a processing time — no official figure is published for when the card itself is issued.",
      },
    },
  ],

  DK: [
    {
      id: "dk-visa-1",
      label: {
        tr: "Yükseköğrenim için oturum izni başvurusu (SIRI)",
        en: "Residence permit application for higher education (SIRI)",
      },
      description: {
        tr: "Çevrimiçi başvuru yapılır, ücret ödenir, 14 gün içinde biyometri verilir; SIRI başvuruyu inceleyip karar verir.",
        en: "You submit the online application, pay the fee, and give biometrics within 14 days; SIRI then reviews and decides.",
      },
      timing: { minWeeks: 8, maxWeeks: 13 },
      sourceUrl: "https://www.nyidanmark.dk/en-GB/Words-and-concepts/SIRI/Case-processing-times-in-SIRI",
      caveat: {
        tr: "SIRI'nin kendi tablosu '2 ay / ek bilgi gerekirse 3 ay' diyor — 13 haftayı istisna değil, gerçekçi bir üst sınır olarak düşün.",
        en: "SIRI's own table states 2 months (or 3 if more information is needed) — treat ~13 weeks as a realistic upper bound, not a rare exception.",
      },
    },
    {
      id: "dk-visa-2",
      label: {
        tr: "Danimarka adresine kayıt (CPR) ve ikamet kartı",
        en: "Danish address registration (CPR) and residence card",
      },
      description: {
        tr: "İzin onaylandıktan sonra CPR sistemine adres kaydı yapılır; fiziksel ikamet kartı otomatik olarak postalanır.",
        en: "After the permit is granted, you register your address in the CPR system; the physical residence card is then mailed automatically.",
      },
      timing: { minWeeks: 2, maxWeeks: 3 },
      sourceUrl: "https://www.nyidanmark.dk/en-GB/Your-situation-is-changing/Work/Residence-card",
      caveat: {
        tr: "SIRI, CPR veri aktarımındaki bir hata yüzünden kart teslim gecikmeleri yaşandığını kabul etti; 8 haftadan fazla geçerse doğrudan SIRI ile iletişime geçilmesi öneriliyor.",
        en: "SIRI has publicly acknowledged card-delivery delays from a CPR data-transfer error; if more than 8 weeks pass with no card, SIRI advises contacting them directly.",
      },
    },
  ],

  IT: [
    {
      id: "it-visa-1",
      label: {
        tr: "Ulusal (D tipi) öğrenci vizesi — İtalyan konsolosluğunda",
        en: "National (type D) study visa — at the Italian consulate",
      },
      description: {
        tr: "Universitaly üzerinden ön kayıt onaylandıktan sonra İtalyan konsolosluğunda ulusal vize için başvurulur.",
        en: "Once your pre-enrollment on the Universitaly portal is validated, you apply for the national visa at the Italian consulate.",
      },
      timing: { maxWeeks: 13 },
      sourceUrl: "https://vistoperitalia.esteri.it/home/en",
      caveat: {
        tr: "İtalyan konsoloslukları genelinde tekrarlanan resmi ifade 'İtalyan kanununa göre en fazla 90 gün' — Türkiye'deki konsolosluğa özel bir sayfa bulunamadı, bu yüzden genel MFA rakamını kullanıyoruz.",
        en: "The standardized official wording repeated across Italian consulates is 'up to 90 days under Italian law' — a Turkey-specific consular page wasn't found, so this uses the general MFA figure.",
      },
    },
    {
      id: "it-visa-2",
      label: {
        tr: "Varıştan sonra Questura'da oturum izni (permesso di soggiorno)",
        en: "Residence permit (permesso di soggiorno) at the Questura after arrival",
      },
      description: {
        tr: "Varıştan sonraki 8 iş günü içinde, yaşanılan ile bağlı Questura'nın (Yabancılar Bürosu) göçmenlik biriminden oturum izni talep edilir.",
        en: "Within 8 working days of arrival, you request the residence permit from the Questura (Immigration Office) of your province of residence.",
      },
      timing: { minWeeks: 9, maxWeeks: 13 },
      sourceUrl: "https://www.poliziadistato.it/articolo/225",
      caveat: {
        tr: "Polizia di Stato tüm izin türleri için ortalama '60 gün' (~9 hafta) veriyor — çalışma izne özel değil ve yoğun dönemde birkaç aya çıkabilir. Bu sırada başvuru makbuzu (ricevuta) geçerli kimlik yerine geçer.",
        en: "Polizia di Stato states an average of 60 days (~9 weeks) across all permit types — not study-specific — and it can run to several months in busy periods. The application receipt (ricevuta) is valid proof of status in the meantime.",
      },
    },
  ],
};
