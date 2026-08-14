"use client";

import { useId } from "react";
import { cx } from "./ui";

/**
 * Beyond — marka işareti: kep takmış bir öğrenci.
 *
 * Rozet dikdörtgen (yuvarlatılmış kare), figür ince beyaz çizgi, kep dolu.
 * Kepi dolu bırakmak bilinçli: tamamen outline denendiğinde küçük boyutta
 * kep bir baklava dilimine dönüşüp okunmuyordu; dolu haliyle silueti
 * ilk bakışta tanınıyor.
 *
 * NEDEN SABİT HEX: uygulamanın geri kalanında renkler tema tokenlarından
 * geliyor. Logo bilinçli istisna — marka rengi temayla değişmemeli, yoksa
 * logo olmaktan çıkar.
 *
 * TAMAMEN SVG: dış dosya, CDN, raster yok. Demoda internet gitse de durur,
 * her ölçekte keskin.
 */

/** Marka mavisi — indigo ailesi, landing'in mücevher tonlarıyla uyumlu. */
const BADGE_FROM = "#6366F1";
const BADGE_TO = "#3730A3";

/** İşaretin tek başına hali — dar başlık, yükleme ekranı, boş durumlar. */
export function LogoMark({ className }: { className?: string }) {
  // Aynı sayfada birden fazla logo olabilir; gradyan id'leri çakışmasın.
  const id = useId();
  const bg = `${id}-bg`;

  return (
    <svg viewBox="0 0 32 32" className={cx("block", className)} role="img" aria-label="Beyond">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={BADGE_FROM} />
          <stop offset="1" stopColor={BADGE_TO} />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="7.5" fill={`url(#${bg})`} />

      <g
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Kep — dolu, işaretin tanınmasını sağlayan parça. */}
        <path d="M 16 7.6 L 23.6 11 L 16 14.4 L 8.4 11 Z" fill="#FFFFFF" />
        {/* Püskül. Kısa tutuldu: uzunken omuz çizgisine değip kol gibi
            okunuyordu. */}
        <path d="M 22.4 11.6 V 15.1" />
        <circle cx="16" cy="18.4" r="3.2" />
        <path d="M 9.8 28.4 a 6.2 6.2 0 0 1 12.4 0" />
      </g>

      <circle cx="22.4" cy="16.2" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * İşaret + kelime — başlıkta kullanılan hali.
 *
 * Kelime beyaz DEĞİL, mavi-mor arası. Tek bir açık ton yetmiyor: koyu temada
 * güzel duran açık lila (#A5B4FC) açık zeminde okunmuyor. O yüzden aynı
 * hue ailesinin iki ucu var ve `data-theme` ile değişiyor. Koyu tema
 * tanımlı olmayan bir dalda `data-theme` hiç yazılmıyor, orada da koyu ton
 * geçerli kalıyor — yani her iki durumda da okunur.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="text-[19px] font-semibold tracking-[-0.03em] text-[#4338CA] [[data-theme=dark]_&]:text-[#A5B4FC]">
        Beyond
      </span>
    </span>
  );
}
