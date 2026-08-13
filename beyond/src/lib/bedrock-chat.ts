/**
 * Beyond — "Sor AI'a" sohbet katmanı.
 *
 * Bedrock Mantle'ın OpenAI-uyumlu uç noktasına konuşuyor:
 *   https://bedrock-mantle.<bölge>.api.aws/openai/v1/chat/completions
 *
 * Neden AWS SDK'sı değil de düz fetch: bu yol zaten OpenAI sözleşmesini
 * konuşuyor, araya SDK koymak sadece bağımlılık ekler. Ayrıca uç nokta
 * adresi ortam değişkeninden geldiği için farklı bölge veya vekil sunucu
 * kullanmak tek satır değişiklik.
 *
 * Ölçülen davranışlar (canlı uç noktada doğrulandı):
 *  - `max_tokens` REDDEDİLİYOR; doğru alan `max_completion_tokens`
 *  - system mesajı messages dizisinde `role: "system"` olarak gidiyor
 *  - stream:true SSE döndürüyor, parçalar `choices[0].delta.content` içinde
 */

export interface BedrockChatConfig {
  url: string;
  apiKey: string;
  modelId: string;
}

/** Hesapta erişimi doğrulanmış model. BEDROCK_MODEL_ID ile değiştirilebilir. */
const DEFAULT_MODEL_ID = "google.gemma-4-31b";

export function getBedrockChatConfig(): BedrockChatConfig | null {
  const apiKey = process.env.BEDROCK_API_KEY?.trim();
  const url = process.env.BEDROCK_URL?.trim();
  if (!apiKey || !url) return null;

  return {
    apiKey,
    url,
    modelId: process.env.BEDROCK_MODEL_ID?.trim() || DEFAULT_MODEL_ID,
  };
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export class BedrockChatError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "BedrockChatError";
  }
}

/**
 * Sohbeti akış olarak çalıştırır ve metin parçalarını yield eder.
 */
export async function* streamBedrockChat(
  config: BedrockChatConfig,
  system: string,
  turns: ChatTurn[]
): AsyncGenerator<string> {
  // Bazı modeller ardışık aynı rolü reddediyor; sıralamayı normalleştir.
  const normalized: ChatTurn[] = [];
  for (const turn of turns) {
    const last = normalized[normalized.length - 1];
    if (last && last.role === turn.role) {
      last.content = `${last.content}\n\n${turn.content}`.trim();
      continue;
    }
    normalized.push({ ...turn });
  }
  while (normalized.length > 0 && normalized[0].role !== "user") normalized.shift();
  if (normalized.length === 0) return;

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(90_000),
    body: JSON.stringify({
      model: config.modelId,
      messages: [{ role: "system", content: system }, ...normalized],
      // DİKKAT: `max_tokens` bu uç noktada hata veriyor.
      max_completion_tokens: 1200,
      temperature: 0.4,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new BedrockChatError(describeHttpError(response.status, body), response.status);
  }

  // SSE ayrıştırma: satırlar `data: {...}`, sonunda `data: [DONE]`.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // Son parça yarım kalmış olabilir; tampona geri koy.
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;

      try {
        const parsed = JSON.parse(payload);
        const text = parsed?.choices?.[0]?.delta?.content;
        if (typeof text === "string" && text.length > 0) yield text;
      } catch {
        // Yarım JSON — bir sonraki turda tamamlanacak, sessizce geç.
      }
    }
  }
}

function describeHttpError(status: number, body: string): string {
  const message = extractMessage(body);

  if (status === 401 || status === 403) {
    return "BEDROCK_API_KEY geçersiz ya da bu modele erişim izni yok. .env.local dosyasını kontrol et.";
  }
  if (status === 404) {
    return `Model bulunamadı. BEDROCK_MODEL_ID doğru mu?${message ? ` (${message})` : ""}`;
  }
  if (status === 400) {
    return `İstek kabul edilmedi.${message ? ` ${message}` : ""}`;
  }
  if (status === 429) {
    return "İstek sınırına takıldık, birkaç saniye sonra tekrar dene.";
  }
  return "Asistan şu an cevap veremiyor.";
}

function extractMessage(body: string): string {
  try {
    return String(JSON.parse(body)?.error?.message ?? "").slice(0, 160);
  } catch {
    return "";
  }
}

/** Akış başladıktan sonra oluşan hataları okunur metne çevirir. */
export function describeBedrockError(error: unknown): string {
  if (error instanceof BedrockChatError) return error.message;
  if (error instanceof Error && error.name === "TimeoutError") {
    return "Cevap zaman aşımına uğradı. Tekrar dener misin?";
  }
  return "Asistan şu an cevap veremiyor.";
}
