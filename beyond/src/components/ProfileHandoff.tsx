"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";

/**
 * Beyond — "cihazındaki profili hesabına taşıyalım mı?"
 *
 * NEDEN VAR
 * Hesap zorunlu olmadan önce profil yalnızca tarayıcıda (localStorage)
 * duruyordu. Zorunluluk gelince o kullanıcıların tarayıcısında duran profil,
 * kısa liste ve senaryolar bir anda "erişilemez" hale gelirdi. Bu ekran,
 * ilk girişte veriyi taşımayı teklif ediyor.
 *
 * SESSİZCE TAŞIMIYORUZ. Otomatik taşımak, ortak kullanılan bir bilgisayarda
 * başkasının profilini bir yabancının hesabına yapıştırmak demek olurdu.
 * SESSİZCE SİLMİYORUZ da: "yeni profille başla" seçeneği ne yapacağını
 * açıkça söylüyor.
 *
 * Yalnızca hesapta HİÇ profil yokken görünüyor (bkz. store.tsx). Hesabında
 * zaten profil olan kullanıcıya sorulmuyor — orada kaynak hesaptır.
 */
export function ProfileHandoff() {
  const { t, pick } = useLocale();
  const { handoff, adoptHandoff, discardHandoff, postponeHandoff } = useStore();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handoff) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) postponeHandoff();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handoff, busy, postponeHandoff]);

  if (!handoff) return null;

  const name = handoff.profile.fullName.trim();

  async function handleAdopt() {
    setError(null);
    setBusy(true);
    const result = await adoptHandoff();
    setBusy(false);
    if (result.error) setError(t.handoff.error);
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-5 py-10 bg-scrim backdrop-blur-sm animate-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="handoff-title"
    >
      <Card className="w-full max-w-lg p-7 animate-rise overflow-y-auto max-h-full">
        <h2 id="handoff-title" className="text-[20px] text-ink mb-2">
          {t.handoff.title}
        </h2>
        <p className="text-sm text-ink-soft leading-relaxed">{t.handoff.body}</p>

        {name.length > 0 && (
          <p className="text-[13px] text-ink-faint mt-2">
            {fill(t.handoff.forName, { name })}
          </p>
        )}

        <div className="mt-5 p-4 rounded-xl bg-surface-soft border border-line">
          <p className="text-[12px] font-medium uppercase tracking-wider text-ink-faint mb-2">
            {t.handoff.summaryTitle}
          </p>
          <ul className="space-y-1 text-[13px] text-ink-soft">
            <li>{pick({ tr: "Profil", en: "Profile" })}</li>
            <li>{fill(t.handoff.summaryShortlist, { count: handoff.shortlist.length })}</li>
            <li>{fill(t.handoff.summaryCompare, { count: handoff.compare.length })}</li>
            <li>{fill(t.handoff.summaryScenarios, { count: handoff.scenarios.length })}</li>
          </ul>
        </div>

        {error && (
          <p className="text-[13px] text-danger bg-danger-soft rounded-lg px-3 py-2 mt-4">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            autoFocus
            onClick={() => void handleAdopt()}
            disabled={busy}
            className="flex-1"
            size="lg"
          >
            {busy ? t.handoff.migrating : t.handoff.migrate}
          </Button>
          <Button
            variant="secondary"
            onClick={discardHandoff}
            disabled={busy}
            className="flex-1"
            size="lg"
          >
            {t.handoff.discard}
          </Button>
        </div>

        <p className="text-[12px] text-ink-faint mt-4 leading-relaxed">
          {t.handoff.discardWarning}
        </p>
      </Card>
    </div>
  );
}
