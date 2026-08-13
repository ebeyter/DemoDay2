"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useStore } from "@/lib/store";
import { matchAll, toHundredScale } from "@/lib/matching";
import { PROGRAMS } from "@/data/programs";
import { COUNTRIES, FIELDS } from "@/data/taxonomy";
import { Button, Input, cx } from "./ui";

/**
 * Beyond — "Sor AI'a" paneli.
 *
 * Öğrencinin profilini ve motorun hesapladığı eşleşmeleri bağlam olarak
 * gönderir. Asistan bu sonuçları YORUMLAR, yeniden hesaplamaz — eşleştirme
 * kararları deterministik motorda kalıyor.
 *
 * Çift modlu: Bedrock ayarları yoksa "demo modu" rozetiyle hazır bir cevap
 * gösterilir. Rozet bilinçli olarak gizlenmiyor.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AssistantPanel() {
  const { t, locale } = useLocale();
  const { profile } = useStore();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [demoMode, setDemoMode] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Asistana verilen bağlam. Deterministik motorun çıktısını metne çeviriyoruz —
   * asistan bunları yeniden hesaplamıyor, sadece yorumluyor.
   */
  const context = useMemo(() => {
    if (!profile) return "";

    const results = matchAll(PROGRAMS, profile, { includeOutOfReach: true }).slice(0, 14);
    const gpa100 = toHundredScale(profile.gpa, profile.gpaScale).toFixed(0);

    const lines = [
      `Öğrenci: ${profile.fullName}`,
      `Not ortalaması: ${gpa100}/100 (girilen: ${profile.gpa}, ölçek: ${profile.gpaScale})`,
      `İlgi alanları: ${profile.fields.map((f) => FIELDS[f].name.tr).join(", ")}`,
      `Dil belgeleri: ${
        profile.languageTests.length > 0
          ? profile.languageTests.map((s) => `${s.test} ${s.score}`).join(", ")
          : "yok"
      }`,
      `Sınavlar: ${
        profile.standardizedTests.length > 0
          ? profile.standardizedTests.map((s) => `${s.test.toUpperCase()} ${s.score}`).join(", ")
          : "yok"
      }`,
      `İleri düzey dersler: ${
        profile.advancedSubjects.length > 0 ? profile.advancedSubjects.join(", ") : "belirtilmemiş"
      }`,
      `Hedef ülkeler: ${
        profile.targetCountries.length > 0
          ? profile.targetCountries.map((c) => COUNTRIES[c].name.tr).join(", ")
          : "kısıt yok"
      }`,
      `Yıllık harç üst sınırı: ${
        profile.maxTuition !== undefined ? `${profile.maxTuition} EUR` : "sınır yok"
      }`,
      "",
      "UYGULAMANIN HESAPLADIĞI EŞLEŞMELER:",
    ];

    for (const result of results) {
      const p = result.program;
      const unmet = result.checks
        .filter((c) => c.status !== "met")
        .map((c) => `${c.label.tr} (${c.status}): ${c.detail.tr}`)
        .join(" | ");

      lines.push(
        `- [${result.band}] ${p.university} — ${p.name} (${COUNTRIES[p.country].name.tr}, ${p.city}) · ` +
          `zorunlu şart ${result.metMandatory}/${result.totalMandatory} · ` +
          `harç ${p.tuitionNonEu} EUR + yaşam ${p.livingCostPerYear} EUR · ` +
          `son tarih ${p.deadline} · sistem ${p.applicationSystem}` +
          (unmet ? ` · AÇIK ŞARTLAR: ${unmet}` : "")
      );
    }

    lines.push(
      "",
      "NOT: Katalogdaki tüm kayıtlar 'ai-extracted' (doğrulanmamış) durumda. Kritik kararlarda kaynaktan teyit gerektiğini hatırlat."
    );

    return lines.join("\n");
  }, [profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Panel açıkken Escape ile kapansın.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    // Yanıtı biriktireceğimiz boş asistan mesajı.
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, context }),
      });

      setDemoMode(response.headers.get("X-Beyond-Demo-Mode") === "true");

      if (!response.ok || !response.body) throw new Error("stream unavailable");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: accumulated }]);
      }
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            locale === "tr"
              ? "Şu an cevap veremiyorum. Tekrar dener misin?"
              : "I can't answer right now. Want to try again?",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Açma düğmesi */}
      <button
        onClick={() => setOpen(true)}
        className={cx(
          "fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-pill",
          "bg-accent text-white text-sm font-medium shadow-[0_4px_20px_rgba(55,48,163,0.28)]",
          "hover:bg-accent-hover transition-all active:scale-[0.97]",
          open && "opacity-0 pointer-events-none"
        )}
      >
        <span aria-hidden>✦</span>
        {t.assistant.open}
      </button>

      {/* Arka plan */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 animate-fade"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Panel */}
      <aside
        className={cx(
          "fixed top-0 right-0 z-50 h-dvh w-full sm:w-[440px] bg-surface border-l border-line",
          "flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-line shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-[15px] font-semibold text-ink truncate">
              {t.assistant.title}
            </h2>
            {demoMode && (
              <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-pill bg-band-reach-soft text-band-reach font-medium">
                {t.assistant.demoBadge}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-ink-faint hover:text-ink p-1.5 rounded-lg transition-colors"
            aria-label={t.common.close}
          >
            ✕
          </button>
        </div>

        {demoMode && (
          <p className="mx-4 mt-3 text-[12px] leading-relaxed text-band-reach bg-band-reach-soft rounded-lg px-3 py-2 shrink-0">
            {t.assistant.demoNote}
          </p>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 thin-scroll">
          {!profile ? (
            <p className="text-sm text-ink-soft">{t.assistant.needProfile}</p>
          ) : messages.length === 0 ? (
            <div>
              <p className="text-sm text-ink-soft mb-4">{t.assistant.chatEmpty}</p>
              <div className="space-y-2">
                {t.assistant.chatSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => void sendMessage(suggestion)}
                    className="block w-full text-left text-[13px] px-3 py-2.5 rounded-xl border border-line text-ink-soft hover:border-accent hover:text-accent transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cx(
                  "text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-accent-soft text-ink rounded-xl px-3.5 py-2.5 ml-8"
                    : "text-ink"
                )}
              >
                {message.content === "" && streaming ? (
                  <span className="text-ink-faint">{t.assistant.thinking}</span>
                ) : (
                  <Markdownish text={message.content} />
                )}
              </div>
            ))
          )}
        </div>

        {profile && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="flex items-center gap-2 p-4 border-t border-line shrink-0"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.chatPlaceholder}
              disabled={streaming}
            />
            <Button type="submit" size="sm" disabled={streaming || !input.trim()}>
              →
            </Button>
          </form>
        )}
      </aside>
    </>
  );
}

/**
 * Minik markdown işleyici: **kalın**, _italik_ ve paragraflar.
 * Tam bir markdown kütüphanesi eklemek bu ölçekte gereksiz ağırlık —
 * asistanın kullandığı üç işaret bunlar.
 */
function Markdownish({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const parts = paragraph.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
        return (
          <p key={index} className={index > 0 ? "mt-3" : undefined}>
            {parts.map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={partIndex} className="font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith("_") && part.endsWith("_")) {
                return (
                  <em key={partIndex} className="text-ink-faint not-italic text-[13px]">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </>
  );
}
