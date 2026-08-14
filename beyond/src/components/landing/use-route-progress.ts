"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { clamp } from "./route";

/**
 * Rotanın ne kadarının çizildiği: 0 … legCount.
 * Tam sayı kısmı biten bacak sayısı, ondalık kısmı o an çizilmekte olan
 * bacağın oranı. Ölçüm bölüm bölüm yapılıyor, tek bir toplam yükseklik
 * üzerinden değil — bölümlerin yüksekliği eşit olmak zorunda değil ve
 * metin uzunluğu değişince hizalama kaymıyor.
 *
 * Scroll dinleyicisi requestAnimationFrame ile kısılıyor: tarayıcı saniyede
 * onlarca `scroll` olayı yollasa da ölçüm kare başına en fazla bir kez
 * yapılıyor. Ölçüm `getBoundingClientRect` okuyor, yazma yok — layout
 * thrashing riski yok.
 */
export function useRouteProgress(
  sections: RefObject<Array<HTMLElement | null>>,
  legCount: number
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // `frame` effect kapanışında duruyor: useRef<number>() ile taşımaya gerek
    // yok ve "number | undefined" tip gürültüsü de çıkmıyor.
    let frame = 0;

    const measure = () => {
      frame = 0;

      // Referans çizgisi ekranın biraz altında: bir bölüm bu çizgiyi geçmeye
      // başladığında bacağı çizilmeye başlar, tamamen geçtiğinde tamamlanır.
      const line = window.innerHeight * 0.58;
      let next = 0;

      for (let index = 0; index < legCount; index++) {
        const element = sections.current[index];
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.height === 0) continue;

        const passed = (line - rect.top) / rect.height;
        next = index + clamp(passed, 0, 1);
        if (passed < 1) break;
      }

      // Aynı değeri döndürünce React yeniden render etmiyor; kaydırma
      // dururken boşa render olmaz.
      setProgress((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections, legCount]);

  return progress;
}

/**
 * Kullanıcı hareketi azaltmayı seçmiş mi.
 *
 * `useSyncExternalStore` ile okunuyor, effect + setState ile değil: medya
 * sorgusu React'in dışında yaşayan bir durum ve bunun için doğru araç bu.
 * Sunucuda medya sorgusu yok, oradan `false` dönüyoruz; tercih açıksa
 * istemci ilk okumada düzeltiyor.
 *
 * Tercih açıkken rota TAMAMEN ÇİZİLİ geliyor — bilgi kaybolmuyor, sadece
 * hareket gidiyor.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Dar ekran mı — Tailwind'in `sm` eşiğinin altı.
 *
 * Harita bu eşikte sadece küçülmüyor, DEĞİŞİYOR: şehir etiketleri gidiyor ve
 * çerçeve rotanın sınırlarına kırpılıyor. Bunu CSS ile yapamıyoruz, `viewBox`
 * bir öznitelik. Sunucuda `false` dönüyor, yani ilk render geniş çerçeve —
 * dar ekranda istemci ilk okumada düzeltiyor.
 */
export function useCompactMap(): boolean {
  return useMediaQuery("(max-width: 639px)");
}
