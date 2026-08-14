"use client";

import { useId } from "react";
import { cx } from "./ui";

/**
 * Beyond — marka işareti.
 *
 * FİKİR: markanın kendi cümlesi "Sınırların ötesinde bir üniversite var."
 * İşaret de bunu çiziyor — bir sınır çizgisi, ondan kalkıp üstünden aşan bir
 * yay ve varış noktası. Landing'deki rota haritasıyla aynı dil: aynı bombeli
 * yay, aynı dolu varış düğümü.
 *
 * NEDEN BURADA SABİT RENK VAR: uygulamanın geri kalanında sabit hex yasak,
 * renkler tema tokenlarından geliyor. Logo istisna ve bilinçli — marka rengi
 * temayla değişmemeli, koyu temada da açık temada da aynı mavi olmalı, yoksa
 * "logo" olmaktan çıkar. Kelime kısmı yine tokendan (`text-ink`) geliyor ki
 * iki temada da okunsun.
 *
 * TAMAMEN SVG: dış dosya, CDN, raster yok — demoda internet gitse de durur ve
 * her ölçekte keskin.
 */

/** İşaretin tek başına hali — favicon, dar başlık, yükleme ekranı. */
export function LogoMark({ className }: { className?: string }) {
  // Aynı sayfada birden fazla logo olabilir; gradyan id'leri çakışmasın.
  const id = useId();
  const stroke = `${id}-stroke`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={cx("block", className)}
      role="img"
      aria-label="Beyond"
    >
      <defs>
        {/* İki uç da açık mavi. Daha soluk bir uç denendi, varış noktası
            beyaz zeminde kayboluyordu. */}
        <linearGradient id={stroke} x1="6" y1="25" x2="24" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Sınır — aşılan şey. Yaydan silik ama görünür: daha soluk olduğunda
          işaret "sınırı aşmak" gibi değil, tek başına bir kanca gibi
          okunuyordu. */}
      <path
        d="M 4.5 25 H 19"
        stroke="#38BDF8"
        strokeOpacity="0.4"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Sınırdan kalkıp ötesine giden yol. Tepesi yatık: dik bir yay
          "kanca", yatık yay "yolculuk" okunuyor. */}
      <path
        d="M 5.8 25 Q 11 9.6 23 8.6"
        stroke={`url(#${stroke})`}
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Varış — sınırın bittiği yerin ötesinde. */}
      <circle cx="23.3" cy="8.6" r="3.9" fill="#38BDF8" />
    </svg>
  );
}

/** İşaret + kelime — başlıkta kullanılan hali. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink">Beyond</span>
    </span>
  );
}
