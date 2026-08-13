"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Card, EmptyState, SectionTitle, cx } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { buildGapPlan, matchAll } from "@/lib/matching";
import { PROGRAMS } from "@/data/programs";

const SEVERITY_STYLES: Record<string, string> = {
  close: "bg-band-reach-soft text-band-reach",
  unknown: "bg-band-far-soft text-band-far",
  unmet: "bg-danger-soft text-danger",
};

export default function GapPlanPage() {
  const { t, locale, pick } = useLocale();
  const { profile, status } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || profile) return;
    // localStorage'dan hidrasyon bir-iki render sürebiliyor (bkz. persistent-state.ts,
    // useSyncExternalStore sunucu snapshot'ıyla eşleşmek için önce fallback döner).
    // Hemen yönlendirmek, profil aslında var olsa bile hard refresh'te kullanıcıyı
    // /profile'a fırlatıyordu. setTimeout(0) mevcut render dizisinin bitmesini
    // bekliyor; profil bu sırada gelirse effect yeniden çalışıp temizler.
    const timer = setTimeout(() => router.replace("/profile"), 0);
    return () => clearTimeout(timer);
  }, [profile, status, router]);

  const plan = useMemo(() => {
    if (!profile) return [];
    // Erişilmez programları da dahil ediyoruz: "şu an uzak" olanların
    // neden uzak olduğunu görmek planın en değerli kısmı.
    const results = matchAll(PROGRAMS, profile, { includeOutOfReach: true });
    return buildGapPlan(results);
  }, [profile]);

  if (!profile) return null;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-3xl px-5 py-10">
        <SectionTitle title={t.gapPlan.title} subtitle={t.gapPlan.subtitle} />

        {plan.length === 0 ? (
          <EmptyState title={t.gapPlan.empty} />
        ) : (
          <ol className="space-y-4">
            {plan.map((action, index) => (
              <li key={`${action.checkId}-${index}`}>
                <Card
                  className="p-6 animate-rise"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-white grid place-items-center text-sm font-semibold">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-[15px] font-semibold text-ink">
                          {pick(action.label)}
                        </h3>
                        <span
                          className={cx(
                            "text-[11px] px-2 py-0.5 rounded-pill font-medium",
                            SEVERITY_STYLES[action.severity]
                          )}
                        >
                          {t.gapPlan.severity[action.severity]}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-ink-soft">
                        {pick(action.action)}
                      </p>

                      <p className="text-[12px] text-ink-faint mt-3">
                        {fill(t.gapPlan.affects, { count: action.affectedPrograms })}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        )}

        <p className="text-[13px] text-ink-faint mt-8 leading-relaxed">
          {locale === "tr"
            ? "Bu liste en kolay kapanacak adımdan başlar. Üstteki bir iki maddeyi halletmek genelde en çok programı açan hamledir."
            : "This list starts with the easiest gap to close. Handling the top one or two usually unlocks the most programs."}
        </p>
      </main>
    </>
  );
}
