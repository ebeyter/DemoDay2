"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./use-route-progress";

/**
 * Sıfırdan hedefe sayan rakam.
 *
 * NEDEN STATE DEĞİL, DOM'A YAZIYOR
 * Sunucu son değeri basıyor (`{value}`), yani JavaScript hiç gelmese bile
 * ekranda doğru sayı var ve arama motoru da onu görüyor. Sayma işini React
 * state'iyle yapsaydık ilk render'da 0 basmamız gerekirdi; o da sunucuyla
 * uyuşmazlık demek. Bunun yerine animasyon süresince metni doğrudan DOM
 * düğümüne yazıyoruz — React'ın haberdar olması gerekmeyen, dışa dönük bir
 * yan etki.
 *
 * Hareket azaltma açıksa hiç saymıyor: sayı olduğu gibi duruyor.
 */

const DURATION_MS = 1100;

export function CountUp({
  value,
  className,
  /** Kaçıncı sırada olduğu — sayaçlar arka arkaya başlasın diye. */
  delayMs = 0,
}: {
  value: number;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    let frame = 0;
    let startedAt: number | null = null;

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now;
      const progressed = Math.min((now - startedAt) / DURATION_MS, 1);
      // easeOutCubic — hızlı çıkıp hedefe yumuşak oturuyor.
      const eased = 1 - Math.pow(1 - progressed, 3);
      node.textContent = String(Math.round(value * eased));
      if (progressed < 1) frame = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      node.textContent = "0";
      frame = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      // Yarıda kalırsa (tema değişimi, yeniden bağlanma) sayı doğru kalsın.
      node.textContent = String(value);
    };
  }, [value, delayMs, reduced]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
