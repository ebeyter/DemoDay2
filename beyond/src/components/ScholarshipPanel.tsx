"use client";

import type { Program } from "@/lib/types";
import { useLocale } from "@/lib/i18n/context";
import { formatMoney } from "@/lib/format";
import { Card, cx } from "./ui";

/**
 * Beyond — burs bloğu.
 *
 * Üç ayrı durumu ayırıyor, çünkü öğrenci için üçü farklı şey:
 *
 *   undefined  → "bakmadık". Hiçbir iddia yok; sessiz kalıyoruz.
 *   []         → "baktık, yok". Bu bir BULGU: üniversitenin kendi sayfası
 *                lisans düzeyinde burs sunmadığını söylüyor. Öğrencinin
 *                maliyet planını burssuz yapması gerektiğini gösteriyor.
 *   [<kayıt>]  → tutar, tür, AB-dışına açık mı ve kaynak linki.
 *
 * Boş listeyi hiç göstermemek en kolay yol olurdu ama en yanıltıcısı da o:
 * öğrenci "belki vardır, sonra bakarım" diye bırakır. 18 bin EUR'luk bir
 * karar için "yok" bilgisi "var" bilgisi kadar değerli.
 */
export function ScholarshipPanel({ program }: { program: Program }) {
  const { t, locale, pick } = useLocale();
  const list = program.scholarships;

  // Bakılmamış — hiçbir şey iddia etmiyoruz.
  if (list === undefined) return null;

  if (list.length === 0) {
    return (
      <Card className="p-6 bg-surface-soft">
        <h2 className="text-[16px] text-ink mb-2">{t.scholarships.title}</h2>
        <p className="text-[13px] text-ink-soft leading-relaxed">
          {t.scholarships.noneFound}
        </p>
        <p className="text-[12px] text-ink-faint leading-relaxed mt-2">
          {t.scholarships.noneFoundNote}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-[16px] text-ink mb-4">{t.scholarships.title}</h2>

      <ul className="space-y-4">
        {list.map((scholarship) => (
          <li key={scholarship.name}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-sm font-medium text-ink">{scholarship.name}</span>
              <span className="text-sm font-semibold text-ink tabular-nums">
                {scholarship.amountPerYear === undefined ? (
                  <span className="text-[12px] font-normal text-ink-faint">
                    {t.scholarships.amountUnknown}
                  </span>
                ) : (
                  <>
                    {formatMoney(scholarship.amountPerYear, locale)}
                    <span className="text-[12px] font-normal text-ink-faint">
                      {t.scholarships.perYear}
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-pill bg-surface-soft text-ink-soft">
                {t.scholarships.kinds[scholarship.kind]}
              </span>
              <span
                className={cx(
                  "text-[11px] px-2 py-0.5 rounded-pill",
                  scholarship.openToNonEu
                    ? "bg-band-match-soft text-band-match"
                    : "bg-band-far-soft text-band-far"
                )}
              >
                {scholarship.openToNonEu
                  ? t.scholarships.openToNonEu
                  : t.scholarships.euOnly}
              </span>
            </div>

            {scholarship.note && (
              <p className="text-[12px] text-ink-soft leading-relaxed mt-2">
                {pick(scholarship.note)}
              </p>
            )}

            <a
              href={scholarship.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1.5 text-[12px] text-accent hover:underline"
            >
              {t.scholarships.sourceLink} ↗
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
