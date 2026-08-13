/**
 * Beyond — sunucu tarafı sayfa okuyucu.
 *
 * Claude'un `web_fetch` aracı Amazon Bedrock'ta mevcut değil, o yüzden
 * üniversite sayfasını kendimiz indirip metne çeviriyoruz. Yan faydası:
 * bu yol her sağlayıcıda aynı şekilde çalışıyor, sağlayıcıya bağımlı
 * davranış farkı kalmıyor.
 */

/** Modele gönderilecek metnin üst sınırı — bağlam ve maliyeti kontrol altında tutar. */
const MAX_TEXT_LENGTH = 60_000;
const FETCH_TIMEOUT_MS = 20_000;

export interface FetchedPage {
  url: string;
  title: string;
  text: string;
  truncated: boolean;
}

export class PageFetchError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "PageFetchError";
  }
}

/**
 * Kullanıcıdan gelen adresi doğrular.
 *
 * Bu bir SSRF savunması: kullanıcı bir bağlantı veriyor ve sunucumuz onu
 * çekiyor. Kontrolsüz bırakılırsa iç ağdaki servisler (localhost, metadata
 * uç noktaları, özel IP blokları) hedef gösterilebilir.
 */
function assertSafeUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    throw new PageFetchError("Bu bir geçerli web adresi gibi görünmüyor.", 400);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new PageFetchError("Sadece http ve https adresleri okunabilir.", 400);
  }

  const host = parsed.hostname.toLowerCase();

  const isLoopback =
    host === "localhost" || host === "::1" || host.endsWith(".localhost");

  // Özel IPv4 blokları ve bulut metadata uç noktası.
  const isPrivateIpv4 =
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || // link-local + AWS metadata (169.254.169.254)
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "0.0.0.0";

  // İç ağ isimleri.
  const isInternalName = host.endsWith(".internal") || host.endsWith(".local");

  if (isLoopback || isPrivateIpv4 || isInternalName) {
    throw new PageFetchError("İç ağ adresleri okunamaz.", 400);
  }

  return parsed;
}

/** Yaygın HTML varlıklarını çöz. Tam bir çözücüye gerek yok; bunlar %99'unu kapsıyor. */
function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&euro;/g, "€")
    .replace(/&pound;/g, "£")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

/**
 * HTML'i modele verilecek düz metne çevirir.
 *
 * Kütüphane eklemiyoruz: şart sayfalarında ihtiyacımız olan şey gövde metni
 * ve tablo içerikleri. Blok elemanlarını satır sonuna çevirmek, listeleri ve
 * tabloları okunur tutmak için yeterli — şartlar genelde tablolarda yazıyor.
 */
function htmlToText(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : "";

  const text = html
    // Görünmeyen ve gereksiz bölümleri tamamen at.
    .replace(/<(script|style|noscript|svg|iframe|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    // Tablo hücrelerini ayır ki "IELTS | 6.5" gibi satırlar birbirine yapışmasın.
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<\/(tr|li|p|div|h[1-6]|section|article|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // Kalan etiketleri sil.
    .replace(/<[^>]+>/g, " ");

  const cleaned = decodeEntities(text)
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title, text: cleaned };
}

export async function fetchPageText(rawUrl: string): Promise<FetchedPage> {
  const url = assertSafeUrl(rawUrl);

  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        // Üniversite siteleri "bot gibi" görünen isteklere sık sık kapalı.
        // Test ederken RWTH ve birkaç site sade başlıklarla bağlantıyı
        // düşürdü, tarayıcı başlıklarıyla 200 döndü — bu set deneyle bulundu.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new PageFetchError("Sayfa zaman aşımına uğradı (20 sn).", 504);
    }
    throw new PageFetchError("Sayfaya ulaşılamadı. Adres doğru mu?", 502);
  }

  if (!response.ok) {
    throw new PageFetchError(
      `Sayfa ${response.status} döndürdü. Bağlantı herkese açık mı?`,
      502
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!/text\/html|application\/xhtml|text\/plain/i.test(contentType)) {
    throw new PageFetchError(
      "Bu bir web sayfası değil (muhtemelen PDF veya dosya). Programın HTML sayfasını dene.",
      415
    );
  }

  const html = await response.text();
  const { title, text } = htmlToText(html);

  if (text.length < 200) {
    throw new PageFetchError(
      "Sayfadan okunabilir metin çıkmadı — içerik JavaScript ile yükleniyor olabilir.",
      422
    );
  }

  const truncated = text.length > MAX_TEXT_LENGTH;

  return {
    // Yönlendirme sonrası gerçek adres.
    url: response.url || url.href,
    title,
    text: truncated ? text.slice(0, MAX_TEXT_LENGTH) : text,
    truncated,
  };
}
