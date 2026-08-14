"use client";

import { cx } from "@/components/ui";

/**
 * Sağ kenardaki bölüm göstergesi.
 *
 * Tarayıcının kendi kaydırma çubuğu, `main` kendi kaydırma bağlamını kurduğu
 * için sayfanın kenarında değil kutunun içinde çıkıyor ve tam sayfa bölümlerde
 * nerede olduğunu söylemiyor. Bu gösterge onun yerini alıyor: kaç bölüm var,
 * hangisindesin ve tıklayarak atlayabiliyorsun.
 *
 * Dar ekranda gizli: parmakla kaydırılan bir ekranda hem yer kaplıyor hem de
 * dokunma hedefleri metnin üstüne biniyor.
 */
export function LandingNav({
  labels,
  active,
  onSelect,
}: {
  labels: string[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="landing-nav" aria-label={labels[0]}>
      {labels.map((label, index) => {
        const isActive = index === active;

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isActive ? "true" : undefined}
            className="landing-nav-item"
          >
            <span className="landing-nav-label">{label}</span>
            <span
              aria-hidden
              className={cx("landing-nav-dot", isActive && "landing-nav-dot-active")}
            />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
