import { describe, expect, it } from "vitest";
import { reconcileLocalProfile } from "../src/lib/profile-reconcile";

/**
 * GERÇEK HATANIN TESTİ (2026-08-14):
 * Aynı tarayıcıda Alp yeni hesap açtı, profil sihirbazı sorulmadı ve karşısına
 * Eda'nın profili çıktı. Sebep: yeni hesabın sunucuda satırı olmadığı için
 * profil çekme effect'i erken dönüyor, localStorage'daki başkasının profiline
 * dokunmuyordu.
 *
 * Bu dosya o davranışın geri gelmesini engelliyor. Kural: yerel durum, giriş
 * yapan hesabın verisi olduğu kanıtlanana kadar güvenilmez.
 */

const EDA = "user-eda";
const ALP = "user-alp";

describe("Profil uzlaştırma — başkasının verisi sızmasın", () => {
  it("YENİ HESAP, tarayıcıda başkasının damgalı profili varsa: temizler", () => {
    // Bildirilen hatanın birebir senaryosu.
    expect(
      reconcileLocalProfile({
        currentUserId: ALP,
        hasLocalProfile: true,
        localProfileUserId: EDA,
        serverHasProfile: false,
        fetchFailed: false,
      })
    ).toBe("clear");
  });

  it("başkasının profili, SUNUCU SORGUSU BAŞARISIZ olsa bile temizlenir", () => {
    // Ağ hatası, başkasının verisini göstermek için gerekçe değil.
    expect(
      reconcileLocalProfile({
        currentUserId: ALP,
        hasLocalProfile: true,
        localProfileUserId: EDA,
        serverHasProfile: false,
        fetchFailed: true,
      })
    ).toBe("clear");
  });

  it("YENİ HESAP, yerelde DAMGASIZ profil varsa: temizler", () => {
    // Yerel modda doldurulmuş profil bu kişiye ait OLABİLİR ama aynı tarayıcıyı
    // başkası da kullanmış olabilir; ayırt etmenin yolu yok, gizlilik tarafında
    // hata yapıyoruz. Taşıma işi kayıt anında açık onayla yapılmalı.
    expect(
      reconcileLocalProfile({
        currentUserId: ALP,
        hasLocalProfile: true,
        localProfileUserId: undefined,
        serverHasProfile: false,
        fetchFailed: false,
      })
    ).toBe("clear");
  });

  it("yerelde profil yoksa dokunulacak bir şey yok", () => {
    expect(
      reconcileLocalProfile({
        currentUserId: ALP,
        hasLocalProfile: false,
        serverHasProfile: false,
        fetchFailed: false,
      })
    ).toBe("keep");
  });
});

describe("Profil uzlaştırma — kullanıcının kendi verisi korunur", () => {
  it("sunucuda profil varsa onu benimser", () => {
    expect(
      reconcileLocalProfile({
        currentUserId: EDA,
        hasLocalProfile: true,
        localProfileUserId: EDA,
        serverHasProfile: true,
        fetchFailed: false,
      })
    ).toBe("adopt-server");
  });

  it("kendi damgalı profili varken sorgu başarısızsa SİLMEZ", () => {
    // Geçici ağ hatası yüzünden kullanıcıya profilini kaybettirmek, çözdüğümüz
    // sorundan daha kötü olurdu.
    expect(
      reconcileLocalProfile({
        currentUserId: EDA,
        hasLocalProfile: true,
        localProfileUserId: EDA,
        serverHasProfile: false,
        fetchFailed: true,
      })
    ).toBe("keep");
  });

  it("aynı kullanıcı yeniden giriyor ve sunucuda profili varsa sunucu kazanır", () => {
    // Başka cihazda güncellenmiş olabilir; sunucu tek doğru kaynak.
    expect(
      reconcileLocalProfile({
        currentUserId: EDA,
        hasLocalProfile: true,
        localProfileUserId: EDA,
        serverHasProfile: true,
        fetchFailed: false,
      })
    ).toBe("adopt-server");
  });

  it("kendi damgalı profili var ama sunucuda YOK: temizler", () => {
    // Hesabından profilini silmiş olabilir; yerelde hayalet kopya kalmasın.
    expect(
      reconcileLocalProfile({
        currentUserId: EDA,
        hasLocalProfile: true,
        localProfileUserId: EDA,
        serverHasProfile: false,
        fetchFailed: false,
      })
    ).toBe("clear");
  });
});
