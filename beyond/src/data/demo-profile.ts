import type { StudentProfile } from "@/lib/types";

/**
 * Demo Day sunumunda kullanılan SABİT profil.
 *
 * NEDEN DOSYADA DURUYOR: README'de "IELTS 6.0 → 7.0 tek değişikliği Güvenli
 * bandı 0'dan 4'e çıkarıyor" gibi sayılar var ve bunlar sahnede yüksek sesle
 * söyleniyor. O sayılar hangi profille ölçüldüğü kayıtlı olmadığı sürece
 * doğrulanamaz — katalog her değiştiğinde sessizce eskir ve bir gün sahnede
 * yanlış sayı söylersin.
 *
 * Bu profil sabitlenerek üç şey çözülüyor:
 *   1. README'deki sayılar yeniden ölçülebilir hale geliyor
 *   2. Demoda hangi programların ekrana geleceği belirli oluyor (doğrulama
 *      turunun hangi kayıtlara odaklanacağını bu belirliyor)
 *   3. Eşleştirme motorunun regresyon testine gerçek katalogla çalışan bir
 *      fixture çıkıyor
 *
 * PROFİL SEÇİMİ: not 86 ve CS + mühendislik + ekonomi alanları, IELTS
 * 6.0 → 7.0 sıçramasını en net gösteren kombinasyon olduğu için seçildi
 * (profil uzayı taranarak bulundu, tahminle değil). Notu yükseltmek sonucu
 * değiştirmiyor: 88 ve üstünde bantlar sabitleniyor, çünkü kalan engeller
 * not değil dil barajı ve kontenjan şartları.
 *
 * DEĞİŞTİRİRSEN: `npm run check-demo` çalıştır ve README'deki sayıları
 * güncelle. Sayı ile profil birbirinden ayrı düşerse ikisi de değersizleşir.
 */
export const DEMO_PROFILE: StudentProfile = {
  fullName: "Demo Öğrenci",
  highSchoolName: "Demo Anadolu Lisesi",
  diplomas: ["turkish-high-school"],
  graduationYear: 2027,

  // Sınıf sınıf girilmiş ortalama; genel ortalama bunlardan türetiliyor
  // (9+10+11 → 86). `gpa` alanı motorun kullandığı değer olarak duruyor.
  gradeYears: [
    { year: 9, average: 84 },
    { year: 10, average: 86 },
    { year: 11, average: 88 },
  ],
  gpa: 86,
  gpaScale: "100",

  fields: ["cs", "engineering", "economics"],

  // Demonun kritik anı bu satır: 6.0 → 7.0 değişikliği sonuçları görünür
  // biçimde kaydırıyor. Sahnede değiştirilen değer.
  languageTests: [{ test: "ielts", score: 6.0 }],
  standardizedTests: [],
  advancedSubjects: ["math", "physics"],

  // Boş = ülke kısıtı yok. Senaryo modu bunun üstüne geçici kısıt bindiriyor.
  targetCountries: [],
  extrasReady: [],
};

/** Senaryo modunda gösterilen alternatif: "ya sadece Almanya deseydim?" */
export const DEMO_SCENARIO_COUNTRY = "DE" as const;

/** Demoda değiştirilen IELTS puanı — önce/sonra. */
export const DEMO_IELTS_BEFORE = 6.0;
export const DEMO_IELTS_AFTER = 7.0;
