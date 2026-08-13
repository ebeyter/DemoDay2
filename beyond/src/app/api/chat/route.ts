import { NextResponse } from "next/server";
import {
  describeBedrockError,
  getBedrockChatConfig,
  streamBedrockChat,
  type ChatTurn,
} from "@/lib/bedrock-chat";

/**
 * Beyond — profil-bilir asistan.
 *
 * Öğrencinin profilini ve eşleşme sonuçlarını bağlam olarak alır, sonuçları
 * yorumlar. Eşleştirme kararlarını ASLA yeniden hesaplamaz — o iş deterministik
 * motorda; asistanın işi motorun çıktısını açıklamak.
 *
 * Amazon Bedrock'un Converse API'si üzerinden çalışıyor: model bağımsız, yani
 * hesapta erişimin olan herhangi bir model (Gemma, Llama, Claude…) iş görür.
 * Sohbet sadece metin girip metin aldığı için yapılandırılmış çıktıya ihtiyaç
 * duymuyor — katalog senkronu ise AI kullanmıyor (değişiklik dedektörü).
 *
 * ÇİFT MOD: Bedrock yapılandırılmamışsa hazır bir cevap döner ve
 * demoMode başlığıyla işaretlenir.
 */

export const maxDuration = 120;

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

_Bedrock ayarları .env.local'a girilince bu panel gerçek zamanlı cevap verir._`;

interface ChatRequest {
  messages: ChatTurn[];
  /** Uygulamanın hesapladığı bağlam — asistan bunu yorumlar, üretmez. */
  context: string;
}

function streamText(text: string, demoMode: boolean, delayMs = 18): Response {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word + " "));
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Beyond-Demo-Mode": String(demoMode),
    },
  });
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

  const config = getBedrockChatConfig();

  // --- Demo modu -----------------------------------------------------------
  if (!config) {
    return streamText(DEMO_REPLY, true);
  }

  // --- Canlı asistan -------------------------------------------------------
  const system = body.context
    ? `${SYSTEM_PROMPT}\n\n<ogrenci_verisi>\n${body.context}\n</ogrenci_verisi>\n\nYukarıdaki veri uygulamanın hesapladığı sonuçlardır. Cevaplarını buna dayandır.`
    : `${SYSTEM_PROMPT}\n\nÖğrenci henüz profilini doldurmamış. Önce profilini oluşturmasını öner.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamBedrockChat(config, system, messages)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error("[chat] Bedrock hatası:", error);
        // Akış başlamış olabileceği için HTTP durumu değiştiremeyiz;
        // hatayı okunur bir not olarak akışa yazıyoruz.
        controller.enqueue(encoder.encode(`\n\n_${describeBedrockError(error)}_`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Beyond-Demo-Mode": "false",
      "X-Beyond-Model": config.modelId,
    },
  });
}
