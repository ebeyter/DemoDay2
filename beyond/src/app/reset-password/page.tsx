"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button, Card, Field, Input } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";

/**
 * Şifre sıfırlama — 1. adım: bağlantıyı iste.
 *
 * BİLGİ SIZDIRMIYORUZ. İstek başarılı da olsa başarısız da olsa aynı ekranı
 * gösteriyoruz ("böyle bir hesap varsa gönderildi"). Aksi halde bu sayfa, bir
 * e-postanın Beyond'a kayıtlı olup olmadığını herkese söyleyen bir sorgulama
 * aracına dönerdi. Supabase de aynı sebeple hata döndürmüyor.
 */
export default function ResetPasswordPage() {
  const { t } = useLocale();
  const { requestPasswordReset, localMode } = useStore();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const result = await requestPasswordReset(email);
    setBusy(false);

    if (result.error === "not-configured") {
      setError(t.auth.notConfigured);
      return;
    }

    // Diğer hataları yutuyoruz — bkz. dosya başındaki not.
    setSent(true);
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-md px-5 py-16">
        <Card className="p-8">
          {sent ? (
            <div className="animate-rise">
              <h1 className="text-[24px] text-ink mb-2">{t.authReset.sentTitle}</h1>
              <p className="text-sm text-ink-soft leading-relaxed mb-6">
                {fill(t.authReset.sentBody, { email })}
              </p>
              <Link href="/sign-in">
                <Button variant="secondary" className="w-full">
                  {t.authReset.backToSignIn}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[24px] text-ink mb-2">{t.authReset.requestTitle}</h1>
              <p className="text-sm text-ink-soft mb-6">{t.authReset.requestBody}</p>

              {localMode && (
                <div className="mb-6 p-4 rounded-xl bg-band-reach-soft border border-band-reach/20">
                  <p className="text-[13px] text-band-reach leading-relaxed">
                    {t.auth.notConfigured}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label={t.auth.email}>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="ornek@lise.edu.tr"
                    disabled={localMode}
                    autoFocus
                  />
                </Field>

                {error && (
                  <p className="text-[13px] text-danger bg-danger-soft rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={busy || localMode}>
                  {busy ? t.common.loading : t.authReset.requestButton}
                </Button>
              </form>

              <p className="text-[13px] text-ink-soft mt-6 text-center">
                <Link href="/sign-in" className="font-medium text-accent hover:underline">
                  {t.authReset.backToSignIn}
                </Link>
              </p>
            </>
          )}
        </Card>
      </main>
    </>
  );
}
