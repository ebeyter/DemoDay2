import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * Beyond — profil-bilir asistan.
 *
 * Öğrencinin profilini ve eşleşme sonuçlarını bağlam olarak alır, sonuçları
 * yorumlar. Eşleştirme kararlarını ASLA yeniden hesaplamaz — o iş deterministik
 * motorda; asistanın işi motorun çıktısını açıklamak.
 *
 * ÇİFT MOD: ANTHROPIC_API_KEY yoksa hazır bir cevap döner ve demoMode=true
 * başlığıyla işaretlenir.
 */

export const maxDuration = 120;

const MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `Sen Beyond'un asistanısın. Beyond, lise öğrencilerinin Avrupa ve İngiltere'deki üniversite programlarını kendi profillerine göre değerlendirmesine yardım eden bir araç.

Sana öğrencinin profili ve uygulamanın hesapladığı eşleşme sonuçları veriliyor. Görevin bu sonuçları yorumlamak ve öğrencinin sorularını cevaplamak.

Kesin kurallar:
- Eşleşme skorlarını veya bantları (Güvenli/Uyumlu/Zorlayıcı) yeniden hesaplama. Onlar sana verilen veride; sen sadece açıklıyorsun.
- Kabul olasılığı verme. "%70 şansın var" gibi bir şey ASLA söyleme. Avrupa'da kabul eşik bazlı ve istatistikler kamuya açık değil.
- Sana verilmeyen bir program, harç, tarih veya şart uydurma. Bilmiyorsan "bu bilgi elimde yok, programın sayfasından kontrol et" de.
- Verinin doğrulanmamış olabileceğini hatırlat: kritik bir karar öncesi kaynak bağlantısından teyit edilmesi gerekir.
- Öğrenci 17-18 yaşında. Sıcak ve net konuş, ama çocuk muamelesi yapma. Kısa tut — 2-4 paragraf yeter.
- Motive edici ol ama gerçekçi kal. Eksik varsa nasıl kapatılacağını söyle, "olamazsın" deme.
- Türkçe soruya Türkçe, İngilizce soruya İngilizce cevap ver.`;

const DEMO_REPLY = `**Demo modu** — bu cevap önceden hazırlandı, canlı AI değil.

Profiline baktığımda en güçlü tarafın not ortalaman: listedeki programların çoğunun eşiğini rahatça geçiyorsun. Zorlayıcı bantta görünenlerin neredeyse hepsi tek bir sebepten orada — dil belgesi.

En pratik hamle şu: IELTS puanını yarım basamak yükseltmek. Bu tek adım Zorlayıcı bantındaki birkaç programı doğrudan Uyumlu'ya taşıyor, çünkü not şartını zaten karşılıyorsun.

Bütçe tarafında dikkat etmen gereken şey harçtan çok yaşam maliyeti: İsviçre'de harç çok düşük ama Zürih'in yaşam maliyeti listenin en yükseği. Hollanda ve Almanya bu ikisinin toplamında daha dengeli duruyor.

_ANTHROPIC_API_KEY tanımlandığında bu panel gerçek zamanlı cevap verir._`;

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  /** Uygulamanın hesapladığı bağlam — asistan bunu yorumlar, üretmez. */
  context: string;
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "Bir mesaj gerekiyor." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // --- Demo modu -----------------------------------------------------------
  if (!apiKey) {
    const encoder = new TextEncoder();
    const words = DEMO_REPLY.split(" ");
    const stream = new ReadableStream({
      async start(controller) {
        // Kelime kelime akıtmak demo modunda da canlı bir his veriyor.
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((resolve) => setTimeout(resolve, 18));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Beyond-Demo-Mode": "true",
      },
    });
  }

  // --- Canlı asistan -------------------------------------------------------
  const client = new Anthropic({ apiKey });

  const contextBlock = body.context
    ? `<ogrenci_verisi>\n${body.context}\n</ogrenci_verisi>\n\nYukarıdaki veri uygulamanın hesapladığı sonuçlardır. Cevaplarını buna dayandır.`
    : "Öğrenci henüz profilini doldurmamış. Önce profilini oluşturmasını öner.";

  try {
    const anthropicStream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: contextBlock },
      ],
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          const finalMessage = await anthropicStream.finalMessage();
          if (finalMessage.stop_reason === "refusal") {
            controller.enqueue(
              encoder.encode(
                "\n\nBu soruyu cevaplayamıyorum. Başka bir şekilde sorar mısın?"
              )
            );
          }
        } catch (error) {
          console.error("[chat] akış hatası:", error);
          controller.enqueue(
            encoder.encode("\n\n_Bağlantı kesildi. Tekrar dener misin?_")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Beyond-Demo-Mode": "false",
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "API anahtarı geçersiz. .env.local dosyasını kontrol et." },
        { status: 401 }
      );
    }
    console.error("[chat] beklenmeyen hata:", error);
    return NextResponse.json({ error: "Asistan şu an cevap veremiyor." }, { status: 502 });
  }
}
