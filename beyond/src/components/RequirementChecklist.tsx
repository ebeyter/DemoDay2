"use client";

import type { MatchResult } from "@/lib/types";
import { useLocale } from "@/lib/i18n/context";
import { CheckIcon, cx } from "./ui";

/**
 * Şart kontrol listesinin KOMPAKT hali.
 *
 * Program detay sayfasındaki liste bir okuma ekranı: her şartın altında
 * aksiyon metni, ilerleme çubuğu, gruplama başlıkları var. Keşfet'te
 * bir üniversitenin altında yan yana 1-5 program duruyor; o listeyi
 * olduğu gibi tekrarlamak ekranı okunamaz hale getirirdi.
 *
 * Buradaki sürüm tek satırlık: durum ikonu + şart adı + karşılaştırma.
 * Öğrencinin bu ekrandaki sorusu "neyi karşılıyorum, neyi karşılamıyorum"
 * — cevabı bu; "ne yapmalıyım" sorusunun cevabı bir tık ötede, program
 * detayında duruyor.
 *
 * ZORUNLU/İSTEĞE BAĞLI AYRIMI KORUNUYOR: isteğe bağlı şartlar soluk
 * gösteriliyor, çünkü karşılanmamış bir isteğe bağlı şart öğrencinin
 * önünde engel değil. İkisini aynı görsel ağırlıkta göstermek, bandı
 * düşürmeyen bir eksiği düşürüyormuş gibi okutur.
 */
export function RequirementChecklist({
  result,
  className,
}: {
  result: MatchResult;
  className?: string;
}) {
  const { pick } = useLocale();

  if (result.checks.length === 0) return null;

  return (
    <ul className={cx("space-y-1.5", className)}>
      {result.checks.map((check) => (
        <li key={check.id} className="flex items-start gap-2">
          <span className="scale-[0.8] origin-top-left -mr-1">
            <CheckIcon status={check.status} />
          </span>
          <div className="min-w-0 flex-1 text-[12px] leading-snug">
            {/* "(isteğe bağlı)" ETİKETİ BURADA EKLENMİYOR: bazı şartların
                etiketi (standart sınavlar) bunu matching.ts'te zaten
                taşıyor ve iki kez yazılıyordu. Ayrım rengin kendisiyle
                veriliyor — zorunlular koyu, isteğe bağlılar soluk. */}
            <span
              className={cx(
                "font-medium",
                check.mandatory ? "text-ink" : "text-ink-faint"
              )}
            >
              {pick(check.label)}
            </span>
            <span className="text-ink-soft"> — {pick(check.detail)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
