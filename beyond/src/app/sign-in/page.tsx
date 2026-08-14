"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button, Card, Field, Input } from "@/components/ui";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";

export default function SignInPage() {
  const { t, locale } = useLocale();
  const { signIn, signUp, localMode, profile } = useStore();
  const router = useRouter();

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const result = mode === "sign-in" ? await signIn(email, password) : await signUp(email, password);

    setBusy(false);

    if (result.error) {
      // Supabase mesajlarını kullanıcı diline çeviriyoruz — ham İngilizce
      // hata metni öğrenciye hiçbir şey anlatmıyor.
      if (result.error === "not-configured") setError(t.auth.notConfigured);
      else if (/invalid login/i.test(result.error)) setError(t.auth.errorInvalid);
      else if (/already registered|already exists/i.test(result.error))
        setError(t.auth.errorEmailTaken);
      else setError(t.auth.errorGeneric);
      return;
    }

    router.push(profile ? "/results" : "/profile");
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-md px-5 py-16">
        <Card className="p-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink mb-2">
            {mode === "sign-in" ? t.auth.signInTitle : t.auth.signUpTitle}
          </h1>
          <p className="text-sm text-ink-soft mb-6">
            {mode === "sign-in" ? t.auth.signInBody : t.auth.signUpBody}
          </p>

          {localMode && (
            <div className="mb-6 p-4 rounded-xl bg-band-reach-soft border border-band-reach/20">
              <p className="text-[13px] text-band-reach leading-relaxed">
                {t.auth.notConfigured}
              </p>
              <Link
                href="/profile"
                className="inline-block mt-3 text-[13px] font-medium text-accent hover:underline"
              >
                {locale === "tr"
                  ? "Hesapsız devam et (bu tarayıcıda saklanır) →"
                  : "Continue without an account (stored in this browser) →"}
              </Link>
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
              />
            </Field>

            <Field label={t.auth.password} hint={mode === "sign-up" ? t.auth.passwordHint : undefined}>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                disabled={localMode}
              />
            </Field>

            {/* Yalnızca girişte anlamlı — kayıt olurken şifre zaten yeni belirleniyor. */}
            {mode === "sign-in" && !localMode && (
              <p className="text-right -mt-1">
                <Link
                  href="/reset-password"
                  className="text-[13px] font-medium text-accent hover:underline"
                >
                  {t.authReset.forgotLink}
                </Link>
              </p>
            )}

            {error && (
              <p className="text-[13px] text-danger bg-danger-soft rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={busy || localMode}>
              {busy
                ? t.common.loading
                : mode === "sign-in"
                  ? t.common.signIn
                  : t.common.signUp}
            </Button>
          </form>

          <p className="text-[13px] text-ink-soft mt-6 text-center">
            {mode === "sign-in" ? t.auth.noAccount : t.auth.hasAccount}{" "}
            <button
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                setError(null);
              }}
              className="font-medium text-accent hover:underline"
            >
              {mode === "sign-in" ? t.common.signUp : t.common.signIn}
            </button>
          </p>
        </Card>
      </main>
    </>
  );
}
