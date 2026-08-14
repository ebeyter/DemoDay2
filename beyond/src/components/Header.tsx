"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { Button, cx } from "./ui";

export function Header() {
  const { t, locale, toggleLocale } = useLocale();
  const { profile, status, user, signOut, compare, shortlist, localMode } = useStore();
  const pathname = usePathname();

  const hasProfile = Boolean(profile);

  /**
   * SIRA KARARI: Keşfet, Eşleşmelerim'den SONRA geliyor. Eşleşmelerim
   * öğrencinin kendi sonucu — varsayılan varış noktası o. Keşfet gezinme
   * ekranı; ilk sıraya koymak öğrenciyi kendi sonucundan uzaklaştırırdı.
   *
   * Listem ve Takvim aynı listeyi (`shortlist`) gösteriyor. İkisi de her zaman
   * görünmüyor: Listem liste doluysa çıkıyor, Takvim de öyle. Boş listeyle iki
   * ayrı boş ekran sunmak navigasyonu şişiriyordu.
   */
  const links = [
    { href: "/results", label: t.nav.results, show: hasProfile },
    { href: "/discover", label: t.nav.discover, show: hasProfile },
    { href: "/gap-plan", label: t.nav.gapPlan, show: hasProfile },
    { href: "/compare", label: t.nav.compare, show: compare.length > 0, count: compare.length },
    {
      href: "/my-list",
      label: t.nav.myList,
      show: shortlist.length > 0,
      count: shortlist.length,
    },
    {
      href: "/timeline",
      label: t.nav.timeline,
      show: shortlist.length > 0,
    },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center gap-6">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-[-0.03em] text-ink shrink-0"
        >
          {t.brand.name}
          <span className="text-accent">.</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 flex-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  active
                    ? "text-accent bg-accent-soft font-medium"
                    : "text-ink-soft hover:text-ink hover:bg-surface-soft"
                )}
              >
                {link.label}
                {link.count ? (
                  <span className="ml-1.5 text-[11px] text-ink-faint">{link.count}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {localMode && (
            <span
              title="Supabase bağlanmadı — profilin sadece bu tarayıcıda saklanıyor."
              className="hidden md:inline-flex text-[11px] px-2 py-0.5 rounded-pill border border-line bg-surface-soft text-ink-faint"
            >
              {locale === "tr" ? "yerel mod" : "local mode"}
            </span>
          )}

          <button
            onClick={toggleLocale}
            className="text-[13px] font-medium text-ink-soft hover:text-accent px-2 py-1 rounded-lg transition-colors"
            aria-label={locale === "tr" ? "Switch to English" : "Türkçeye geç"}
          >
            {locale === "tr" ? "EN" : "TR"}
          </button>

          {status === "signed-in" ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-[13px] text-ink-faint max-w-[160px] truncate">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                {t.common.signOut}
              </Button>
            </div>
          ) : status === "signed-out" ? (
            <Link href="/sign-in">
              <Button variant="secondary" size="sm">
                {t.common.signIn}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
