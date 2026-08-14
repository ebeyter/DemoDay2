"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";

/**
 * Beyond — hesap kapısı.
 *
 * Hesap artık zorunlu: profil doldurmadan önce kayıt/giriş gerekiyor. Kapı tek
 * bir yerde (kök layout) duruyor; böylece korunan her sayfaya ayrı ayrı kontrol
 * eklemek gerekmiyor ve yeni bir sayfa eklendiğinde kimse kontrolü unutamıyor.
 *
 * BU GÖRSEL BİR KAPI, GÜVENLİK SINIRI DEĞİL. Verinin asıl koruması Supabase
 * satır düzeyi güvenliğinde (RLS): oturumu olmayan bir istemci, bu bileşeni
 * atlasa bile veritabanından kimsenin satırını okuyamaz. Buradaki yönlendirme
 * kullanıcıyı boş ekranlarda dolaştırmamak için var.
 *
 * YEREL MOD İSTİSNASI. Supabase yapılandırılmamışsa hesap açmak mümkün değil;
 * kapıyı orada uygulamak uygulamayı tamamen kullanılamaz hale getirirdi.
 * O yüzden `status === "local"` iken her sayfa açık kalıyor (bkz. README).
 */

/** Oturum gerektirmeyen yollar. Alt yolları da kapsıyor (/reset-password/confirm). */
const PUBLIC_PATHS = ["/", "/sign-in", "/reset-password"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const open = isPublicPath(pathname);

  useEffect(() => {
    if (!open && status === "signed-out") router.replace("/sign-in");
  }, [open, status, pathname, router]);

  if (open || status === "signed-in" || status === "local") {
    return <>{children}</>;
  }

  // "loading" (oturum henüz okunuyor) ya da yönlendirme daha uygulanmadı.
  // Korumalı içeriği bir an bile göstermemek için yer tutucu basıyoruz.
  return <GatePlaceholder />;
}

function GatePlaceholder() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="text-center animate-fade">
        <p className="text-[17px] font-semibold tracking-[-0.03em] text-ink">
          {t.brand.name}
          <span className="text-accent">.</span>
        </p>
        <p className="text-[13px] text-ink-faint mt-2">{t.common.loading}</p>
      </div>
    </div>
  );
}
