"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button, Card, Field, Input } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";

/**
 * Şifre sıfırlama — 2. adım: yeni şifreyi belirle.
 *
 * BAĞLANTI NASIL OTURUMA DÖNÜŞÜYOR
 * E-postadaki bağlantı Supabase'e gidiyor, Supabase de bizi buraya `?code=…`
 * ile geri gönderiyor. Tarayıcı istemcisi (`@supabase/ssr`) bu kodu açılışta
 * kendisi oturuma çeviriyor; bizim yapmamız gereken tek şey oturumun oluşup
 * oluşmadığına bakmak. Bu yüzden burada elle jeton işlemiyoruz.
 *
 * ŞİFRE URL'E YAZILMIYOR, LOG'LANMIYOR. Yalnızca `updateUser` çağrısının
 * gövdesinde geçiyor; hata mesajları bile şifreyi taşımıyor.
 */

type Phase = "checking" | "ready" | "invalid" | "done";

/**
 * Supabase bağlantıyı reddederse (süresi dolmuş, daha önce kullanılmış) bizi
 * hata parametreleriyle geri gönderiyor ve oturum hiç oluşmuyor.
 *
 * URL bir dış kaynak, o yüzden `useSyncExternalStore` ile okunuyor: sunucuda
 * `false`, istemcide gerçek değer. Efekt içinde setState yapmaya göre hem daha
 * doğru hem de basamaklı render üretmiyor. Abonelik yok — bu sayfada URL
 * değişmiyor.
 */
const noopSubscribe = () => () => {};

function readUrlRejected(): boolean {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.has("error") || hash.has("error");
}

export default function ResetPasswordConfirmPage() {
  const { t } = useLocale();
  const { status, updatePassword, localMode } = useStore();

  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const urlRejected = useSyncExternalStore(noopSubscribe, readUrlRejected, () => false);

  const phase: Phase = done
    ? "done"
    : urlRejected || localMode
      ? "invalid"
      : status === "signed-in"
        ? "ready"
        : status === "signed-out"
          ? "invalid"
          : "checking";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t.authReset.tooShort);
      return;
    }
    if (password !== repeat) {
      setError(t.authReset.mismatch);
      return;
    }

    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);

    if (result.error) {
      setError(result.error === "not-configured" ? t.auth.notConfigured : t.auth.errorGeneric);
      return;
    }

    // Alanları hemen boşalt — şifre gereğinden uzun süre bellekte durmasın.
    setPassword("");
    setRepeat("");
    setDone(true);
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-md px-5 py-16">
        <Card className="p-8">
          {phase === "checking" && (
            <p className="text-sm text-ink-soft text-center py-6">{t.authReset.checking}</p>
          )}

          {phase === "invalid" && (
            <div className="animate-rise">
              <h1 className="text-[24px] text-ink mb-2">{t.authReset.linkInvalidTitle}</h1>
              <p className="text-sm text-ink-soft leading-relaxed mb-6">
                {localMode ? t.auth.notConfigured : t.authReset.linkInvalidBody}
              </p>
              <Link href="/reset-password">
                <Button className="w-full">{t.authReset.requestAgain}</Button>
              </Link>
            </div>
          )}

          {phase === "done" && (
            <div className="animate-rise">
              <h1 className="text-[24px] text-ink mb-2">{t.authReset.doneTitle}</h1>
              <p className="text-sm text-ink-soft leading-relaxed mb-6">{t.authReset.doneBody}</p>
              <Link href="/results">
                <Button className="w-full">{t.authReset.goToApp}</Button>
              </Link>
            </div>
          )}

          {phase === "ready" && (
            <>
              <h1 className="text-[24px] text-ink mb-2">{t.authReset.confirmTitle}</h1>
              <p className="text-sm text-ink-soft mb-6">{t.authReset.confirmBody}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label={t.authReset.newPassword}>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    autoFocus
                  />
                </Field>

                <Field label={t.authReset.newPasswordAgain}>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>

                {error && (
                  <p className="text-[13px] text-danger bg-danger-soft rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={busy}>
                  {busy ? t.common.loading : t.authReset.confirmButton}
                </Button>
              </form>
            </>
          )}
        </Card>
      </main>
    </>
  );
}
