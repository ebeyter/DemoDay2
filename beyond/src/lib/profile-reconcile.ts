/**
 * Giriş yapıldığında yerel profil ile hesabı uzlaştırma kararı.
 *
 * NEDEN AYRI BİR MODÜL: bu karar bir GİZLİLİK kuralı ve sessizce bozulmaması
 * gerekiyor. `store.tsx` içindeki effect'in içinde kalsa test etmek React ve
 * Supabase taklidi gerektirirdi; saf fonksiyon olarak testi üç satır.
 *
 * ---
 *
 * ÇÖZDÜĞÜ GERÇEK HATA (2026-08-14): aynı tarayıcıda Alp yeni hesap açtı ve
 * profil sihirbazı hiç sorulmadan karşısına Eda'nın profili, eşleşmeleri ve
 * listesi çıktı. Sebep: yeni hesabın sunucuda satırı olmadığı için profil
 * çekme effect'i erken dönüyor ve localStorage'daki BAŞKASININ profiline hiç
 * dokunmuyordu.
 *
 * KURAL: yerel durum, giriş yapan hesabın verisi kanıtlanana kadar
 * güvenilmez. Kanıt iki yerden gelebilir — profilin üzerindeki `userId`
 * damgası ya da sunucudaki satır. İkisi de yoksa temizlenir.
 */

export type ReconcileAction =
  /** Sunucudaki profil yerele yazılsın. */
  | "adopt-server"
  /** Yerel profil, kısa liste ve karşılaştırma temizlensin. */
  | "clear"
  /** Yerelde dokunulacak bir şey yok ya da dokunmak zararlı. */
  | "keep";

export interface ReconcileInput {
  /** Giriş yapan hesabın kimliği. */
  currentUserId: string;
  /** Yerelde profil var mı. */
  hasLocalProfile: boolean;
  /**
   * Yerel profilin taşıdığı sahip kimliği. `saveProfile` giriş yapılmışken
   * damgalıyor; yerel modda doldurulan profil damgasız olur.
   */
  localProfileUserId?: string;
  /** Sunucuda bu hesabın profili var mı. */
  serverHasProfile: boolean;
  /** Sunucu sorgusu başarısız oldu mu (ağ/izin). */
  fetchFailed: boolean;
}

export function reconcileLocalProfile(input: ReconcileInput): ReconcileAction {
  const belongsToSomeoneElse =
    input.localProfileUserId !== undefined &&
    input.localProfileUserId !== input.currentUserId;

  // Başka bir kullanıcının damgalı profili HER KOŞULDA temizlenir — sunucu
  // sorgusu başarısız olsa bile. Ağ hatası, başkasının verisini göstermek
  // için gerekçe değil.
  if (belongsToSomeoneElse) return "clear";

  // Sorgu başarısızsa kullanıcının kendi verisini silmiyoruz: geçici bir ağ
  // hatası yüzünden profil kaybettirmek, çözdüğümüz sorundan daha kötü olur.
  if (input.fetchFailed) return "keep";

  if (input.serverHasProfile) return "adopt-server";

  // --- Sunucuda bu hesabın profili YOK ------------------------------------

  // KENDİ damgasını taşıyan profil ASLA silinmez.
  //
  // BU KURAL BİR REGRESYONU DÜZELTİYOR (2026-08-14): ilk sürümde burada
  // "clear" dönüyordu, gerekçe "kullanıcı hesabından profilini silmiş
  // olabilir" idi. Pratikte olan şu oldu: kullanıcı sihirbazı doldurdu,
  // `saveProfile` yerele yazdı ama sunucuya upsert TUTMADI (tablo/RLS/ağ).
  // Sonraki oturum olayında bu kural profili sildi ve eşleşme ekranı boş
  // kaldı — "formu doldurdum, eşleşme göstermedi".
  //
  // Doğru okuma: damga zaten "bu veri bu hesaba ait" kanıtıdır; sunucuda
  // olmaması veri kaybını değil, SENKRON KAYBINI gösterir. Çözüm silmek
  // değil, yeniden yüklemek (store bunu `keep` görünce yapıyor).
  //
  // Gizlilik tarafı bozulmuyor: başkasının damgalı profili yukarıda
  // temizlendi, damgasız profil aşağıda temizleniyor.
  if (input.localProfileUserId === input.currentUserId) return "keep";

  // Damgasız profil bu kişiye ait OLABİLİR (yerel modda doldurulmuş) ama aynı
  // tarayıcıyı başkası da kullanmış olabilir; ayırt etmenin yolu yok.
  // Gizlilik tarafında hata yapmayı seçiyoruz.
  //
  // Yerel modda doldurulan profili hesaba taşımak isteyen akış bunu KAYIT
  // ANINDA açık onayla yapmalı; giriş sonrası sessizce benimsemek gizlilik
  // hatasına geri döner.
  if (input.hasLocalProfile) return "clear";

  return "keep";
}
