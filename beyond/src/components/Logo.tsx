/**
 * Beyond — logo işareti.
 *
 * KONSEPT: bir çember (sınır/ufuk) ve onu delip dışarı çıkan bir ok.
 * Markanın adı ne vaat ediyorsa onu çiziyor: sınırın ötesine geçmek.
 * Çemberdeki boşluk ok'un çıktığı yer — sınır kapalı değil, aşılabilir.
 *
 * Renkler Tailwind üzerinden geliyor: çember `currentColor` (bulunduğu yerin
 * metin rengi), ok her zaman accent. Böylece koyu başlıkta da açık zeminde de
 * ayrı bir varyant gerektirmiyor.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden
      className={className}
    >
      {/* Sınır: sağ üstte ok için açık bırakılmış çember */}
      <path
        d="M16 9.3 A9.5 9.5 0 1 0 22.7 16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Ok: çemberin içinden başlayıp sınırın ötesine */}
      <path
        d="M10.5 21.5 L26.5 5.5 M20.5 5.5 H26.5 V11.5"
        className="text-accent"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
