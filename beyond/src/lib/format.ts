import type { Locale } from "./i18n/dictionary";
import type { Currency } from "./types";

/**
 * Para birimi — sayı okunabilirliği için binlik ayraç, kuruş yok.
 *
 * `currency` verilmezse EUR varsayılır. Kaynak sayfa harcı £ veya SEK olarak
 * yayınlıyorsa o birimde gösteriyoruz; çevirmiyoruz (bkz. Program.tuitionCurrency).
 */
export function formatMoney(
  amount: number,
  locale: Locale,
  currency: Currency = "EUR"
): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const MONTHS: Record<Locale, string[]> = {
  tr: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

/** "01-15" → "15 Ocak" / "15 January". Yıl bilinçli olarak yok: takvim döngüsel. */
export function formatDeadline(deadline: string, locale: Locale): string {
  const [monthStr, dayStr] = deadline.split("-");
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);
  const month = MONTHS[locale][monthIndex] ?? monthStr;
  return locale === "tr" ? `${day} ${month}` : `${day} ${month}`;
}

/**
 * Son tarihe kaç gün kaldığını hesaplar.
 * Tarih yıl içermediği için bu yılın tarihi geçtiyse gelecek yıla taşır —
 * başvuru takvimi doğal olarak döngüsel.
 */
export function daysUntilDeadline(deadline: string, now: Date = new Date()): number {
  const [monthStr, dayStr] = deadline.split("-");
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);

  let target = new Date(now.getFullYear(), month, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (target < today) {
    target = new Date(now.getFullYear() + 1, month, day);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}
