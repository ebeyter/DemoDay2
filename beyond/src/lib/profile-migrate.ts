import type { DiplomaId, SchoolType, StudentProfile } from "./types";

/**
 * DEPODAN GELEN PROFİLİ GÜNCEL ŞEMAYA UYARLAR.
 *
 * Neden var: `StudentProfile` tipi kodun içindeki bir sözleşme, ama
 * localStorage'daki ve Supabase'deki kayıtlar DAHA ESKİ bir şemayla yazılmış
 * olabiliyor. TypeScript orada bize yardım edemiyor — `readPersistent` JSON'u
 * okuyup "bu bir StudentProfile" diyor, gerçekten öyle mi diye bakmıyor.
 *
 * Bunu somut bir çökmeyle öğrendik: şema `schoolType`/`birthYear`'dan
 * `highSchoolName`/`diplomas`'a geçtikten sonra, eski profille ayarları açan
 * kullanıcı "Cannot read properties of undefined (reading 'includes')" hatası
 * aldı — `draft.diplomas` yoktu. Aynı çökme sihirbazda da oluyordu.
 *
 * Çözüm tek bir yerde: profil uygulamaya GİRDİĞİ noktada (store.tsx'teki
 * okuma) buradan geçiyor, dolayısıyla hiçbir ekran eksik alanla karşılaşmıyor.
 * Her ekranda ayrı ayrı `?? []` yazmak, biri unutulduğunda yine çökmek
 * demekti.
 */

/**
 * Eski `schoolType` → yeni `diplomas` eşlemesi.
 *
 * SADECE KESİN OLANI ÇEVİRİYOR. Anadolu/Fen/Özel Türk lisesi zaten Türk lise
 * diploması veriyor; bu bir varsayım değil, tanım. Ama "IB Programı" seçmiş
 * bir öğrencinin tam IB Diploması mı aldığı yoksa sadece IB dersleri mi
 * gördüğü bilinmiyor — ikisi üniversite şartlarında farklı sonuç veriyor.
 * Orada tahmin etmek yerine boş bırakıyoruz; öğrenci sihirbazda ya da
 * ayarlarda kendisi işaretliyor.
 *
 * Boş bırakmak eşleştirmeyi bozmuyor: motor `diplomas` alanına hiç bakmıyor
 * (not, sınav ve ders şartlarına bakıyor), yani bu alan eksikken öğrencinin
 * sonuçları sessizce değişmiyor.
 */
const SCHOOL_TYPE_TO_DIPLOMA: Partial<Record<SchoolType, DiplomaId>> = {
  anatolian: "turkish-high-school",
  "science-high-school": "turkish-high-school",
  "private-turkish": "turkish-high-school",
};

/** Dizi olmayan (eksik ya da bozuk) değeri boş diziye çevirir. */
function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function normalizeProfile(stored: StudentProfile | null): StudentProfile | null {
  if (!stored) return null;

  // Eski kayıtlarda olmayan alanlar burada; tipte zorunlu oldukları için
  // `as` ile okumak zorundayız — depodaki JSON tipe uymak zorunda değil.
  const legacy = stored as StudentProfile & { schoolType?: SchoolType };

  const diplomas = asArray<DiplomaId>(legacy.diplomas);
  const inferred = legacy.schoolType ? SCHOOL_TYPE_TO_DIPLOMA[legacy.schoolType] : undefined;

  return {
    ...legacy,
    fullName: typeof legacy.fullName === "string" ? legacy.fullName : "",
    highSchoolName: typeof legacy.highSchoolName === "string" ? legacy.highSchoolName : "",
    diplomas: diplomas.length > 0 ? diplomas : inferred ? [inferred] : [],
    fields: asArray(legacy.fields),
    languageTests: asArray(legacy.languageTests),
    standardizedTests: asArray(legacy.standardizedTests),
    advancedSubjects: asArray(legacy.advancedSubjects),
    targetCountries: asArray(legacy.targetCountries),
    extrasReady: asArray(legacy.extrasReady),
    // `gradeYears` ve `apCourses` tipte İSTEĞE BAĞLI: `undefined` "hiç
    // girmedim" demek ve ekranlar bunu zaten karşılıyor. Boş diziye
    // çevirmiyoruz ki "girdim ama boş" ile karışmasın.
    gradeYears: legacy.gradeYears === undefined ? undefined : asArray(legacy.gradeYears),
    apCourses: legacy.apCourses === undefined ? undefined : asArray(legacy.apCourses),
  };
}
