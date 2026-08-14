"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ProgramCard } from "@/components/ProgramCard";
import { BAND_TEXT, Button, EmptyState, SectionTitle, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { matchAll } from "@/lib/matching";
import { PROGRAMS } from "@/data/programs";
import type { Band } from "@/lib/types";

const BAND_ORDER: Band[] = ["match", "reach", "safety", "out-of-reach"];

export default function ResultsPage() {
  const { t, locale } = useLocale();
  const { profile, status } = useStore();
  const router = useRouter();

  /**
   * SENARYO PANELİ BU EKRANDAN KALDIRILDI.
   *
   * Ekranın en üstünde, sonuçlardan önce duran "Senaryo modu" kartıydı: alan,
   * ülke ve bütçeyi geçici olarak ezip sonucu yeniden hesaplıyordu. İki sebeple
   * gitti: (1) öğrencinin bu ekrandaki tek işi kendi eşleşmelerini okumak,
   * başlıktan önce bir kontrol paneli okumak değil; (2) "başka ülkelere/alanlara
   * bakmak" işini artık Keşfet ekranı, kalıcı olarak ve daha iyi yapıyor.
   * Hedefleri değiştirmek isteyen "Hedefimi düzenle" ile sihirbaza gidiyor.
   *
   * Kayıtlı senaryo verisi silinmedi (`beyond_scenarios` ve store'daki API
   * yerinde): hesabında senaryo kaydetmiş bir kullanıcının verisini bir arayüz
   * kararı yüzünden yok etmek doğru olmazdı.
   */
  const [showOutOfReach, setShowOutOfReach] = useState(false);

  useEffect(() => {
    if (status === "loading" || profile) return;
    // localStorage'dan hidrasyon bir-iki render sürebiliyor (bkz. persistent-state.ts,
    // useSyncExternalStore sunucu snapshot'ıyla eşleşmek için önce fallback döner).
    // Hemen yönlendirmek, profil aslında var olsa bile hard refresh'te kullanıcıyı
    // /profile'a fırlatıyordu. setTimeout(0) mevcut render dizisinin bitmesini
    // bekliyor; profil bu sırada gelirse effect yeniden çalışıp temizler.
    const timer = setTimeout(() => router.replace("/profile"), 0);
    return () => clearTimeout(timer);
  }, [profile, status, router]);

  const results = useMemo(() => {
    if (!profile) return [];
    return matchAll(PROGRAMS, profile, { includeOutOfReach: showOutOfReach });
  }, [profile, showOutOfReach]);

  /**
   * Gizlenen "ulaşılamaz" program sayısı.
   *
   * Sayıyı söylemek gizlemekten daha dürüst: "3 program ulaşılamaz sayıldı"
   * yazınca öğrenci neyin saklandığını biliyor ve isterse açıyor. Sayı
   * verilmeden konan bir kutu, listenin tam olduğu izlenimi bırakıyordu.
   * 42 kayıtlık katalogda ikinci bir hesap ölçülemeyecek kadar ucuz.
   */
  const hiddenCount = useMemo(() => {
    if (!profile || showOutOfReach) return 0;
    return matchAll(PROGRAMS, profile, { includeOutOfReach: true }).filter(
      (result) => result.band === "out-of-reach"
    ).length;
  }, [profile, showOutOfReach]);

  const grouped = useMemo(() => {
    const map = new Map<Band, typeof results>();
    for (const band of BAND_ORDER) map.set(band, []);
    for (const result of results) map.get(result.band)?.push(result);
    return map;
  }, [results]);

  if (!profile) return null;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <SectionTitle
          title={t.results.title}
          subtitle={fill(t.results.subtitle, { count: results.length })}
          action={
            // TEK DÜĞME. Önce burada "Eksik planım" da vardı; o bağlantı
            // başlıktaki gezinme çubuğunda zaten duruyor ve iki düğme yan
            // yanayken hangisinin ana eylem olduğu belirsizleşiyordu. Bu
            // ekranın tek eylemi hedefleri değiştirmek.
            <Link href="/profile">
              <Button variant="secondary" size="sm">
                {t.results.editTargets}
              </Button>
            </Link>
          }
        />


        {/* -----------------------------------------------------------------
            Sonuçlar — bantlara ayrılmış
            ----------------------------------------------------------------- */}
        {results.length === 0 ? (
          <EmptyState title={t.results.empty} hint={t.results.emptyHint} />
        ) : (
          <div className="space-y-10">
            {BAND_ORDER.map((band) => {
              const items = grouped.get(band) ?? [];
              if (items.length === 0) return null;

              return (
                <section key={band}>
                  <div className="flex items-baseline gap-3 mb-4">
                    {/* Bant adı, rozetlerdeki RENGİ alıyor. Renk dili zaten
                        kartların üstünde var (yeşil UYUMLU rozeti); başlığın
                        beyaz kalması aynı bilgiyi iki farklı dille anlatmak
                        oluyordu. Aynı token, dolayısıyla tema değişince ikisi
                        birlikte değişiyor. */}
                    <h2
                      className={cx(
                        "text-[19px] font-semibold tracking-[-0.01em]",
                        BAND_TEXT[band]
                      )}
                    >
                      {t.bands[band]}
                    </h2>
                    <span className="text-[13px] text-ink-faint">
                      {items.length} {locale === "tr" ? "program" : "programs"}
                    </span>
                    <span className="text-[13px] text-ink-faint ml-auto hidden sm:block">
                      {t.bands[`${band}Desc` as keyof typeof t.bands]}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((result, index) => (
                      <ProgramCard key={result.program.id} result={result} index={index} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* -----------------------------------------------------------------
            Ulaşılamaz programlar — LİSTENİN ALTINDA, sayısıyla birlikte.
            Senaryo paneli kalkarken buradaki anahtar kaybolmasın diye taşındı;
            zaten doğru yer burası: öğrenci kendi eşleşmelerini okuduktan sonra
            "daha zoruna da bakayım" diyor, okumaya başlamadan önce değil.
            ----------------------------------------------------------------- */}
        {(hiddenCount > 0 || showOutOfReach) && (
          <div className="mt-10 pt-6 border-t border-line">
            <label className="inline-flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
              <input
                type="checkbox"
                checked={showOutOfReach}
                onChange={(e) => setShowOutOfReach(e.target.checked)}
                className="w-4 h-4 accent-[#3730a3]"
              />
              {showOutOfReach
                ? t.results.showOutOfReach
                : fill(t.results.hiddenOutOfReach, { count: hiddenCount })}
            </label>
          </div>
        )}
      </main>
    </>
  );
}
