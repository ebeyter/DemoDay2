import Anthropic from "@anthropic-ai/sdk";
import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";

/**
 * Beyond — Claude sağlayıcı soyutlaması.
 *
 * İki yoldan biriyle çalışır:
 *   1. Amazon Bedrock  — AWS_BEARER_TOKEN_BEDROCK veya AWS anahtar çifti
 *   2. Anthropic API   — ANTHROPIC_API_KEY
 *
 * İkisi de yoksa `null` döner ve API rotaları "demo modu"na düşer.
 *
 * Sağlayıcı farkı tek yerde toplanıyor ki rotalar bunu bilmek zorunda kalmasın.
 * Model kimliği de burada çözülüyor: Bedrock'ta model adları `anthropic.`
 * önekiyle geliyor VE her model hesapta ayrıca etkinleştirilmiş olmalı — bu
 * yüzden ortam değişkeniyle değiştirilebilir bıraktık.
 */

export type ClaudeProvider = "bedrock" | "anthropic" | "none";

/** Bedrock'ta erişimi en yaygın açılan model. Hesabında farklıysa env ile değiştir. */
const DEFAULT_BEDROCK_MODEL = "anthropic.claude-sonnet-5";
const DEFAULT_ANTHROPIC_MODEL = "claude-opus-5";

function hasBedrockCredentials(): boolean {
  return Boolean(
    process.env.AWS_BEARER_TOKEN_BEDROCK ||
      (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  );
}

export function getClaudeProvider(): ClaudeProvider {
  if (hasBedrockCredentials()) return "bedrock";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "none";
}

export interface ClaudeSetup {
  /** İki istemci de aynı messages yüzeyini sunuyor, bu yüzden ortak tip yeterli. */
  client: Anthropic | AnthropicBedrockMantle;
  model: string;
  provider: Exclude<ClaudeProvider, "none">;
}

let cached: ClaudeSetup | null = null;

export function getClaude(): ClaudeSetup | null {
  if (cached) return cached;

  const provider = getClaudeProvider();

  if (provider === "bedrock") {
    // awsRegion / kimlik bilgileri ortamdan otomatik çözülüyor:
    // apiKey → AWS_BEARER_TOKEN_BEDROCK → varsayılan AWS kimlik zinciri.
    cached = {
      client: new AnthropicBedrockMantle({
        awsRegion: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION,
      }),
      model: process.env.BEDROCK_MODEL_ID ?? DEFAULT_BEDROCK_MODEL,
      provider: "bedrock",
    };
    return cached;
  }

  if (provider === "anthropic") {
    cached = {
      client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      model: process.env.ANTHROPIC_MODEL_ID ?? DEFAULT_ANTHROPIC_MODEL,
      provider: "anthropic",
    };
    return cached;
  }

  return null;
}

/**
 * SDK hatalarını öğrencinin anlayacağı Türkçe mesaja çevirir.
 * Ham "AccessDeniedException" gibi metinler kullanıcıya hiçbir şey anlatmıyor.
 */
export function describeClaudeError(error: unknown): { message: string; status: number } {
  if (error instanceof Anthropic.AuthenticationError) {
    return {
      message:
        "Kimlik doğrulama başarısız. .env.local dosyasındaki anahtarları kontrol et.",
      status: 401,
    };
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return {
      message:
        "Bu modele erişim izni yok. Bedrock kullanıyorsan AWS konsolundan model erişimini etkinleştirmen ve BEDROCK_MODEL_ID'yi erişimin olan modele ayarlaman gerekiyor.",
      status: 403,
    };
  }
  if (error instanceof Anthropic.NotFoundError) {
    return {
      message:
        "Model bulunamadı. BEDROCK_MODEL_ID veya bölge (AWS_REGION) doğru mu kontrol et.",
      status: 404,
    };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return { message: "Şu an çok yoğun, birkaç saniye sonra tekrar dene.", status: 429 };
  }
  return { message: "Model şu an cevap veremiyor.", status: 502 };
}
