import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/context";
import { StoreProvider } from "@/lib/store";
import { AssistantPanel } from "@/components/AssistantPanel";

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
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <LocaleProvider>
          <StoreProvider>
            {children}
            <AssistantPanel />
          </StoreProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
