"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button, Card, Chip, Eyebrow, Field, Input, SectionTitle, cx } from "@/components/ui";
import {
  BasicsFields,
  GradeFields,
  InterestFields,
  LanguageFields,
  SubjectFields,
  TargetFields,
  TestFields,
  emptyProfile,
} from "@/components/ProfileFields";
import { useLocale } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/dictionary";
import { useStore } from "@/lib/store";
import { ACCENTS, THEME_MODES, useTheme, type AccentId, type ThemeMode } from "@/lib/theme";
import { overallAverage, type StudentProfile } from "@/lib/types";

/**
 * Beyond — ayarlar.
 *
 * Dört sekme: profil, görünüm, hesap, gizlilik. Sekme seçimi URL'e yazılmıyor;
 * `useSearchParams` bu sayfayı bir Suspense sınırına mahkûm ederdi ve derin
 * bağlantının buradaki karşılığı yok — ayarlara Header'dan geliniyor.
 *
 * Profil soruları `src/components/ProfileFields.tsx`'ten geliyor; sihirbazla
 * BİREBİR aynı bileşenler. Sorular kopyalanmadı, tek kaynaktan çağrılıyor.
 */

const TABS = ["profile", "appearance", "account", "privacy"] as const;
type TabId = (typeof TABS)[number];

export default function SettingsPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>("profile");
  const { localMode } = useStore();

  return (
    <>
      <Header />

      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        {/* Başlık ölçeği SectionTitle'da tanımlı; burada elle yazılmış bir
            kopyası vardı ve diğer sayfalarla ayrı düşme riski taşıyordu. */}
        <SectionTitle title={t.settings.title} subtitle={t.settings.subtitle} />

        {localMode && (
          <Card className="p-5 mb-6 border-band-reach/30 bg-band-reach-soft">
            <p className="text-sm font-medium text-band-reach">{t.settings.localMode.title}</p>
            <p className="text-[13px] text-band-reach/90 mt-1 leading-relaxed">
              {t.settings.localMode.body}
            </p>
          </Card>
        )}

        {/* Sekmeler */}
        <div
          role="tablist"
          aria-label={t.settings.title}
          className="flex flex-wrap gap-1 mb-6 border-b border-line"
        >
          {TABS.map((id) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cx(
                "px-4 py-2.5 text-sm rounded-t-lg -mb-px border-b-2 transition-colors",
                tab === id
                  ? "border-accent text-accent font-medium"
                  : "border-transparent text-ink-soft hover:text-ink"
              )}
            >
              {t.settings.tabs[id]}
            </button>
          ))}
        </div>

        <div key={tab} className="animate-rise">
          {tab === "profile" && <ProfileTab />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "account" && <AccountTab />}
          {tab === "privacy" && <PrivacyTab />}
        </div>
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Profilim
// ---------------------------------------------------------------------------

function ProfileTab() {
  const { t } = useLocale();
  const { profile, saveProfile } = useStore();

  /**
   * Taslak, kullanıcı bir şeye dokunana kadar `null` kalıyor ve gösterilen
   * değer doğrudan kayıtlı profilden geliyor.
   *
   * NEDEN `useState(() => profile)` DEĞİL: profil localStorage'dan geliyor ve
   * ilk (hidrasyon) render'ında henüz `null`. Başlangıç değeri o anda
   * dondurulsaydı form boş açılır, üstelik "kaydedilmemiş değişiklik var" ve
   * "adını yazman gerekiyor" uyarıları hiç düzenleme yapılmadan görünürdü.
   */
  const [edited, setEdited] = useState<StudentProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const draft = edited ?? profile ?? emptyProfile();

  const update = (patch: Partial<StudentProfile>) => {
    setSaved(false);
    setEdited({ ...draft, ...patch });
  };

  // Kaydedilmemiş değişiklik uyarısı: taslakla kayıtlı profili karşılaştırıyoruz.
  // Alan sayısı azken JSON karşılaştırması yeterince ucuz ve her yeni alanı
  // kendiliğinden kapsıyor — elle yazılmış bir karşılaştırma unutulurdu.
  const dirty = useMemo(
    () =>
      edited !== null &&
      JSON.stringify(stripVolatile(edited)) !== JSON.stringify(stripVolatile(profile)),
    [edited, profile]
  );

  const nameMissing = draft.fullName.trim().length === 0;
  const fieldMissing = draft.fields.length === 0;

  async function handleSave() {
    if (nameMissing || fieldMissing) return;
    setSaving(true);
    // Sihirbazdaki kuralın AYNISI: sınıf ortalamaları girilmişse genel
    // ortalama onlardan türetiliyor. İki ekranda farklı davransa, ayarlardan
    // kaydeden öğrencinin notu sessizce eski değerde kalırdı.
    const derived = overallAverage(draft.gradeYears);
    await saveProfile(derived !== undefined ? { ...draft, gpa: derived } : draft);
    setSaving(false);
    // Kayıtlı profil artık tek kaynak — taslağı bırakıyoruz.
    setEdited(null);
    setSaved(true);
  }

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium text-ink">{t.settings.profile.noProfile}</p>
        <Link href="/profile" className="inline-block mt-4">
          <Button>{t.settings.profile.noProfileCta}</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-soft">{t.settings.profile.body}</p>

      {/* Kaydet çubuğu ÜSTTE yapışıyor: altta olsaydı sağ alttaki asistan
          düğmesiyle üst üste binerdi. `top-16` başlıktaki sticky header'ın
          hemen altı. */}
      <div className="sticky top-16 z-20 pt-1 pb-1">
        <Card className="p-4 flex flex-wrap items-center justify-between gap-3 shadow-[0_4px_24px_var(--color-scrim)]">
          <p className="text-[13px] text-ink-soft">
            {nameMissing
              ? t.settings.profile.needFullName
              : fieldMissing
                ? t.settings.profile.needField
                : saved && !dirty
                  ? t.settings.profile.saved
                  : dirty
                    ? t.settings.profile.unsaved
                    : ""}
          </p>
          <div className="flex items-center gap-2">
            {dirty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEdited(null);
                  setSaved(false);
                }}
              >
                {t.settings.profile.revert}
              </Button>
            )}
            <Button
              onClick={() => void handleSave()}
              disabled={saving || !dirty || nameMissing || fieldMissing}
            >
              {saving ? t.settings.profile.saving : t.settings.profile.save}
            </Button>
          </div>
        </Card>
      </div>

      <Section label={t.wizard.steps.basics}>
        <BasicsFields draft={draft} update={update} />
      </Section>
      <Section label={t.wizard.steps.fields}>
        <InterestFields draft={draft} update={update} />
      </Section>
      <Section label={t.wizard.steps.grades}>
        <GradeFields draft={draft} update={update} />
      </Section>
      <Section label={t.wizard.steps.subjects}>
        <SubjectFields draft={draft} update={update} />
      </Section>
      <Section label={t.wizard.steps.language}>
        <LanguageFields draft={draft} update={update} />
      </Section>
      <Section label={t.wizard.steps.tests}>
        <TestFields draft={draft} update={update} />
      </Section>
      <Section label={t.wizard.steps.targets}>
        <TargetFields draft={draft} update={update} />
      </Section>
    </div>
  );
}

/**
 * `updatedAt` ve `userId` kaydetme sırasında damgalanıyor; karşılaştırmaya
 * girerlerse form açılır açılmaz "kaydedilmemiş değişiklik var" derdi.
 */
function stripVolatile(profile: StudentProfile | null) {
  if (!profile) return null;
  const copy: Partial<StudentProfile> = { ...profile };
  delete copy.updatedAt;
  delete copy.userId;
  return copy;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 sm:p-7">
      <Eyebrow className="mb-4">{label}</Eyebrow>
      {children}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Görünüm
// ---------------------------------------------------------------------------

function AppearanceTab() {
  const { t } = useLocale();
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div className="space-y-5">
      <Card className="p-6 sm:p-7">
        <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-ink mb-1.5">{t.settings.appearance.title}</h2>
        <p className="text-sm text-ink-soft mb-6">{t.settings.appearance.body}</p>

        <Field label={t.settings.appearance.mode} hint={t.settings.appearance.systemHint}>
          <div className="flex flex-wrap gap-2 mt-1">
            {THEME_MODES.map((id: ThemeMode) => (
              <Chip key={id} selected={mode === id} onClick={() => setMode(id)}>
                {t.settings.appearance.modes[id]}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="mt-6">
          <Field label={t.settings.appearance.accent} hint={t.settings.appearance.accentHint}>
            <div className="flex flex-wrap gap-2 mt-1">
              {ACCENTS.map((id: AccentId) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAccent(id)}
                  aria-pressed={accent === id}
                  className={cx(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-pill border transition-all duration-150",
                    "active:scale-[0.97]",
                    accent === id
                      ? "border-accent text-ink font-medium bg-accent-soft"
                      : "border-line-strong text-ink-soft hover:border-accent"
                  )}
                >
                  <span
                    aria-hidden
                    className="w-4 h-4 rounded-full border border-line"
                    // Renk CSS değişkeninden geliyor; bileşende sabit renk yok.
                    style={{ background: `var(--accent-${id})` }}
                  />
                  {t.settings.appearance.accents[id]}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      {/* Önizleme — seçimin gerçek bileşenlerde nasıl göründüğünü gösteriyor */}
      <Card className="p-6 sm:p-7">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-faint mb-4">
          {t.settings.appearance.preview}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t.settings.appearance.previewButton}</Button>
          <Button variant="secondary">{t.common.cancel}</Button>
          <span className="text-sm font-medium text-accent">{t.brand.name}</span>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-accent-soft border border-accent-line">
          <p className="text-[13px] text-ink-soft">{t.settings.appearance.previewBody}</p>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hesap
// ---------------------------------------------------------------------------

function AccountTab() {
  const { t } = useLocale();
  const { user, localMode, updatePassword, signOut } = useStore();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleChange(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setDone(false);

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

    // Şifreyi bellekte tutmuyoruz.
    setPassword("");
    setRepeat("");
    setDone(true);
  }

  return (
    <div className="space-y-5">
      <Card className="p-6 sm:p-7">
        <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-ink mb-4">{t.settings.account.title}</h2>
        <Field label={t.settings.account.email} hint={t.settings.account.emailNote}>
          <Input value={user?.email ?? "—"} readOnly disabled />
        </Field>
      </Card>

      <Card className="p-6 sm:p-7">
        <h3 className="text-[15px] font-semibold text-ink mb-1.5">
          {t.settings.account.changePasswordTitle}
        </h3>
        <p className="text-sm text-ink-soft mb-5">{t.settings.account.changePasswordBody}</p>

        <form onSubmit={handleChange} className="space-y-4 max-w-sm">
          <Field label={t.authReset.newPassword}>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={localMode}
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
              disabled={localMode}
            />
          </Field>

          {error && (
            <p className="text-[13px] text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
          )}
          {done && (
            <p className="text-[13px] text-band-match bg-band-match-soft rounded-lg px-3 py-2">
              {t.settings.account.changed}
            </p>
          )}

          <Button type="submit" disabled={busy || localMode}>
            {busy ? t.settings.account.changing : t.settings.account.changeButton}
          </Button>
        </form>
      </Card>

      <Card className="p-6 sm:p-7">
        <h3 className="text-[15px] font-semibold text-ink mb-1.5">
          {t.settings.account.signOutTitle}
        </h3>
        <p className="text-sm text-ink-soft mb-5 leading-relaxed">
          {t.settings.account.signOutBody}
        </p>
        <Button
          variant="secondary"
          disabled={localMode}
          onClick={() => {
            void signOut().then(() => router.push("/"));
          }}
        >
          {t.common.signOut}
        </Button>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gizlilik (KVKK)
// ---------------------------------------------------------------------------

function PrivacyTab() {
  const { t, locale } = useLocale();
  const { localMode, exportData, deleteAccount } = useStore();
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState(false);

  const confirmWord = t.settings.privacy.deleteConfirmWord;
  const confirmed =
    confirmText.trim().toLocaleUpperCase(locale === "tr" ? "tr-TR" : "en-GB") === confirmWord;

  function handleExport() {
    const payload = exportData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `beyond-verilerim-${payload.exportedAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);

    if (result.error) {
      setError(t.settings.privacy.deleteError);
      return;
    }
    if (result.partial) {
      // Hesap kaydı sunucuda kaldı — "silindi" demek yalan olurdu.
      setPartial(true);
      return;
    }
    router.push("/");
  }

  return (
    <div className="space-y-5">
      <Card className="p-6 sm:p-7">
        <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-ink mb-2">{t.settings.privacy.title}</h2>
        <p className="text-sm text-ink-soft leading-relaxed">{t.settings.privacy.intro}</p>
      </Card>

      <Card className="p-6 sm:p-7 space-y-6">
        <InfoBlock title={t.settings.privacy.whatTitle} items={t.settings.privacy.what} />
        <InfoBlock title={t.settings.privacy.whereTitle} body={t.settings.privacy.whereBody} />
        <InfoBlock title={t.settings.privacy.localTitle} body={t.settings.privacy.localBody} />
        <InfoBlock title={t.settings.privacy.notUsedTitle} items={t.settings.privacy.notUsed} />
        <InfoBlock title={t.settings.privacy.rightsTitle} body={t.settings.privacy.rightsBody} />
      </Card>

      <Card className="p-6 sm:p-7">
        <h3 className="text-[15px] font-semibold text-ink mb-1.5">
          {t.settings.privacy.exportTitle}
        </h3>
        <p className="text-sm text-ink-soft mb-5 leading-relaxed">
          {t.settings.privacy.exportBody}
        </p>
        <Button variant="secondary" onClick={handleExport}>
          {t.settings.privacy.exportButton}
        </Button>
      </Card>

      <Card className="p-6 sm:p-7 border-danger/25">
        <h3 className="text-[15px] font-semibold text-danger mb-1.5">
          {t.settings.privacy.deleteTitle}
        </h3>
        <p className="text-sm text-ink-soft leading-relaxed">{t.settings.privacy.deleteBody}</p>
        <p className="text-[13px] text-ink-faint mt-2">{t.settings.privacy.deleteAdvice}</p>

        {partial ? (
          <p className="text-[13px] text-band-reach bg-band-reach-soft rounded-lg px-3 py-2.5 mt-5 leading-relaxed">
            {t.settings.privacy.deletePartial}
          </p>
        ) : !confirmOpen ? (
          <Button
            variant="danger"
            className="mt-5"
            disabled={localMode}
            onClick={() => setConfirmOpen(true)}
          >
            {t.settings.privacy.deleteButton}
          </Button>
        ) : (
          <div className="mt-5 p-4 rounded-xl border border-danger/30 bg-danger-soft">
            <p className="text-sm font-medium text-danger mb-1">
              {t.settings.privacy.deleteConfirmTitle}
            </p>
            <p className="text-[13px] text-ink-soft mb-3">
              {fill(t.settings.privacy.deleteConfirmBody, { word: confirmWord })}
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirmWord}
              aria-label={fill(t.settings.privacy.deleteConfirmBody, { word: confirmWord })}
              className="max-w-[220px]"
            />

            {error && <p className="text-[13px] text-danger mt-3">{error}</p>}

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Button
                variant="danger"
                disabled={!confirmed || deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? t.settings.privacy.deleting : t.settings.privacy.deleteConfirmButton}
              </Button>
              <Button
                variant="ghost"
                disabled={deleting}
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText("");
                  setError(null);
                }}
              >
                {t.common.cancel}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function InfoBlock({
  title,
  body,
  items,
}: {
  title: string;
  body?: string;
  items?: string[];
}) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-ink mb-2">{title}</h3>
      {body && <p className="text-sm text-ink-soft leading-relaxed">{body}</p>}
      {items && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm text-ink-soft leading-relaxed flex gap-2.5">
              <span className="text-accent shrink-0" aria-hidden>
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
