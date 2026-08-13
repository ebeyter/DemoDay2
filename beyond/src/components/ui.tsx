"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import type { Band, CheckStatus, VerificationStatus } from "@/lib/types";
import { useLocale } from "@/lib/i18n/context";

/**
 * Beyond — ortak arayüz parçaları.
 * Renkler globals.css'teki @theme tokenlarından geliyor (bg-accent, text-ink…),
 * böylece paleti tek yerden değiştirmek mümkün.
 */

/** Sınıf birleştirici — koşullu sınıfları temiz tutmak için. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Buton
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover disabled:bg-line-strong",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-accent hover:text-accent",
  ghost: "text-ink-soft hover:text-accent hover:bg-accent-soft",
  danger: "bg-danger-soft text-danger hover:brightness-97",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "text-[13px] px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-[15px] px-6 py-3.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.985]",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Kart
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
  interactive = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  /** Kartların sırayla belirmesi için animationDelay geçilir. */
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cx(
        "bg-surface border border-line rounded-card",
        interactive &&
          "transition-all duration-200 hover:border-line-strong hover:shadow-[0_2px_16px_rgba(20,20,43,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form alanları
// ---------------------------------------------------------------------------

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-faint mt-1.5">{hint}</span>}
    </label>
  );
}

const CONTROL_BASE =
  "w-full px-3.5 py-2.5 text-sm bg-surface rounded-xl border border-line-strong transition-colors " +
  "placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(CONTROL_BASE, className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(CONTROL_BASE, "appearance-none pr-9", className)} {...rest}>
      {children}
    </select>
  );
}

/** Çoklu seçim için basılabilir etiket — sihirbazın her yerinde kullanılıyor. */
export function Chip({
  selected,
  onClick,
  children,
  className,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cx(
        "px-3.5 py-2 text-sm rounded-pill border transition-all duration-150",
        "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
        selected
          ? "bg-accent border-accent text-white font-medium"
          : "bg-surface border-line-strong text-ink-soft hover:border-accent hover:text-accent",
        className
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Bant rozeti — ürünün en görünür sinyali
// ---------------------------------------------------------------------------

const BAND_STYLES: Record<Band, string> = {
  safety: "bg-band-safety-soft text-band-safety",
  match: "bg-band-match-soft text-band-match",
  reach: "bg-band-reach-soft text-band-reach",
  "out-of-reach": "bg-band-far-soft text-band-far",
};

export function BandPill({ band, className }: { band: Band; className?: string }) {
  const { t } = useLocale();
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill",
        "text-[11px] font-semibold uppercase tracking-[0.06em]",
        BAND_STYLES[band],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
      {t.bands[band]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Şart durumu ikonu
// ---------------------------------------------------------------------------

const CHECK_STYLES: Record<CheckStatus, { icon: string; className: string }> = {
  met: { icon: "✓", className: "bg-band-match-soft text-band-match" },
  close: { icon: "→", className: "bg-band-reach-soft text-band-reach" },
  unmet: { icon: "✕", className: "bg-danger-soft text-danger" },
  unknown: { icon: "?", className: "bg-band-far-soft text-band-far" },
};

export function CheckIcon({ status }: { status: CheckStatus }) {
  const { t } = useLocale();
  const style = CHECK_STYLES[status];
  return (
    <span
      role="img"
      aria-label={t.checks[status]}
      className={cx(
        "shrink-0 w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold",
        style.className
      )}
    >
      {style.icon}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Doğrulama rozeti — ürünün güven vaadi bu küçük etikette duruyor
// ---------------------------------------------------------------------------

export function VerificationBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const { t } = useLocale();
  const verified = status === "verified";
  return (
    <span
      title={verified ? t.verification.verifiedTip : t.verification["ai-extractedTip"]}
      className={cx(
        "inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-pill border",
        verified
          ? "border-band-match-soft bg-band-match-soft text-band-match"
          : "border-line bg-surface-soft text-ink-faint",
        className
      )}
    >
      <span aria-hidden>{verified ? "✓" : "~"}</span>
      {t.verification[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// İlerleme çubuğu
// ---------------------------------------------------------------------------

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = "accent",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "accent" | "match" | "reach";
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const toneClass =
    tone === "match" ? "bg-band-match" : tone === "reach" ? "bg-band-reach" : "bg-accent";

  return (
    <div
      className={cx("h-1.5 rounded-full bg-surface-soft overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cx("h-full rounded-full transition-[width] duration-500", toneClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bölüm başlığı ve boş durum
// ---------------------------------------------------------------------------

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="text-[22px] text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-ink-soft mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border border-dashed border-line-strong rounded-card py-14 px-6 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="text-sm text-ink-faint mt-1.5">{hint}</p>}
    </div>
  );
}
