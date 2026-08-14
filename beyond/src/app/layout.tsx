import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/context";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";
import { AssistantPanel } from "@/components/AssistantPanel";
import { AuthGate } from "@/components/AuthGate";
import { ProfileHandoff } from "@/components/ProfileHandoff";
import { FreshnessProvider } from "@/lib/freshness-context";

/**
 * Tema niteliklerini ilk boyamadan ÖNCE koyan satır içi script.
 *
 * Tarayıcı bunu HTML'i ayrıştırırken, React yüklenmeden çalıştırıyor; bu
 * yüzden koyu tema seçmiş bir kullanıcı bir kare bile beyaz ekran görmüyor.
 * `useEffect` ile yapmak hidrasyondan sonra çalışacağı için gözle görülür bir
 * flash bırakırdı (bkz. node_modules/next/dist/docs/01-app/02-guides/
 * preventing-flash-before-hydration.md).
 *
 * Değerler localStorage'da JSON olarak duruyor (bkz. persistent-state.ts), o
 * yüzden `JSON.parse` gerekiyor. Bilinmeyen bir aksan değeri niteliğe hiç
 * yazılmıyor — kurcalanmış bir localStorage CSS'i bozamasın.
 *
 * Aksan listesi `src/lib/theme.tsx` ve `globals.css` ile birlikte güncellenmeli.
 */
const THEME_SCRIPT = `(function(){try{var d=document.documentElement;var read=function(k,f){try{var v=JSON.parse(localStorage.getItem(k)||"null");return typeof v==="string"?v:f}catch(e){return f}};var m=read("beyond.theme","system");var a=read("beyond.accent","indigo");if(["indigo","teal","violet","rose"].indexOf(a)<0)a="indigo";var t=(m==="light"||m==="dark")?m:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.setAttribute("data-theme",t);d.setAttribute("data-accent",a)}catch(e){}})()`;

const inter = Inter({
  subsets: ["latin", "latin-ext"], // latin-ext: Türkçe ğ, ş, ı, İ karakterleri
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beyond — Yurtdışı üniversite tercihi",
  description:
    "Avrupa ve İngiltere'deki üniversite programlarını profiline göre eşleştir, eksiklerini kapat, başvuru takvimini tek yerden gör.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: yukarıdaki script <html> niteliklerini React
    // hidrasyondan önce değiştiriyor; DOM'daki değer doğru olan.
    <html
      lang="tr"
      data-theme="light"
      data-accent="indigo"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        <LocaleProvider>
          <ThemeProvider>
            <StoreProvider>
              <AuthGate>
                <FreshnessProvider>
                  {children}
                  <AssistantPanel />
                  <ProfileHandoff />
                </FreshnessProvider>
              </AuthGate>
            </StoreProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
