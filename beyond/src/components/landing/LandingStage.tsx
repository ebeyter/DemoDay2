"use client";

import { RouteMap } from "./RouteMap";

/**
 * Landing'in kalıcı görseli: harita sayfayla birlikte akmıyor, sabit duruyor
 * ve bölümden bölüme YER DEĞİŞTİRİYOR.
 *
 * NEDEN BÖYLE
 * Her bölümde ayrı bir görsel koymak sayfayı slayt gösterisine çevirir.
 * Tek bir nesnenin taşınması, ölçeklenmesi ve soluklaşması anlatıyı sürekli
 * kılıyor: açılışta tüm ekranı kaplayan bir arka plan, rota bölümünde
 * öne çıkan bir harita, sonra metne yer bırakan bir doku.
 *
 * HAREKET CSS'TE, KARAR JS'TE. Buradaki tek iş aktif bölüme karşılık gelen
 * duruşu seçmek; yumuşatmayı `transition` yapıyor. Kaydırma konumuna her
 * karede bağlanan bir animasyon `scroll-snap` ile birlikte titriyordu.
 *
 * TON AYRI BİR BİLGİ. Sahne bölümlerin İÇİNDE değil, kardeşi; `.landing-dark`
 * içindeki değişkenleri miras alamıyor. Açık temada koyu açılışın üstünde
 * açık renkli bir harita çıkıyordu. `data-tone` bunu düzeltiyor: hangi
 * bölümün üstündeyse o tonun paletini kullanıyor (bkz. landing.css).
 */

export interface StagePose {
  /** Ekran genişliğinin yüzdesi olarak merkez. */
  left: number;
  /** Ekran yüksekliğinin yüzdesi olarak merkez. */
  top: number;
  /** Taban genişliğe göre ölçek. Genişlik yerine `transform` — düzen tetiklemiyor. */
  scale: number;
  opacity: number;
  /** Altındaki bölüm koyu mu? Harita paleti buna göre seçiliyor. */
  tone: "dark" | "light";
}

/**
 * Bölüm başına duruş. Sıra `page.tsx`teki bölüm sırasıyla AYNI olmak zorunda.
 *
 * Açılışta harita tüm ekranı kaplayan bir arka plan; kaydırdıkça toparlanıp
 * rota bölümünde metnin yanında tam görünür hale geliyor, sonra geri çekilip
 * dokuya dönüşüyor.
 */
export const STAGE_POSES: StagePose[] = [
  // Açılış — tam ekran arka plan. Ölçek taban genişliğin iki katı; ekranı
  // taşırıyor ki kenarlarda boşluk kalmasın.
  { left: 50, top: 50, scale: 2, opacity: 0.4, tone: "dark" },
  // Rota — solda, tam görünür, sayfanın kalbi.
  { left: 29, top: 50, scale: 0.78, opacity: 1, tone: "dark" },
  // Neden zor — köşeye çekiliyor, kartlara yer bırakıyor.
  { left: 87, top: 22, scale: 0.42, opacity: 0.35, tone: "light" },
  // Sözümüz — dev ve çok soluk, arkada bir doku.
  { left: 50, top: 50, scale: 1.6, opacity: 0.1, tone: "light" },
  // Kapanış — ortada, açılışa göz kırpıyor.
  { left: 50, top: 54, scale: 1.9, opacity: 0.26, tone: "dark" },
];

export function LandingStage({
  active,
  progress,
  reduced,
}: {
  active: number;
  progress: number;
  reduced: boolean;
}) {
  const pose = STAGE_POSES[Math.min(Math.max(active, 0), STAGE_POSES.length - 1)];

  return (
    <div
      className="landing-stage"
      data-tone={pose.tone}
      // Harita yalnızca rota bölümünde bilgi taşıyor; diğer bölümlerde
      // dekoratif bir arka plan, ekran okuyucuya tekrar okutmaya gerek yok.
      aria-hidden={active !== 1 || undefined}
      style={
        {
          transform:
            `translate3d(${pose.left}vw, ${pose.top}vh, 0) ` +
            `translate3d(-50%, -50%, 0) scale(${pose.scale})`,
          opacity: pose.opacity,
          /**
           * Ölçeğin TERSİ. Şehir etiketlerinin punto'su bununla çarpılıyor,
           * böylece harita büyüyüp küçülürken yazılar ekranda hep aynı
           * boyutta kalıyor. Aksi halde açılışta (ölçek 2) etiketler
           * devleşip başlığın üstüne biniyordu.
           */
          "--stage-label-inv": 1 / pose.scale,
        } as React.CSSProperties
      }
    >
      <RouteMap progress={progress} reduced={reduced} className="landing-stage-map" />
    </div>
  );
}
