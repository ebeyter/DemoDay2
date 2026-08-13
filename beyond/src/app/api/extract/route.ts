import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * Beyond — canlı program çıkarımı.
 *
 * Öğrenci bir üniversite programının sayfasını yapıştırır; Claude sayfayı
 * okur ve şartları yapılandırılmış veriye çevirir. Aynı pipeline hem
 * katalogdaki seed veriyi üretti hem de burada canlı çalışıyor.
 *
 * ÇİFT MOD: ANTHROPIC_API_KEY yoksa hazırlanmış bir örnek sonuç döner ve
 * yanıtta demoMode=true olarak işaretlenir. Arayüz bunu açıkça gösterir —
 * demo modunu canlı AI gibi sunmak yanıltıcı olur.
 */

export const maxDuration = 120;

const MODEL = "claude-opus-5";

/**
 * Çıkarımın hedef şeması. `strict: true` ile Claude'un tam olarak bu
 * yapıyı üretmesi garanti altına alınıyor — serbest metni sonradan
 * ayrıştırmaya çalışmaktan çok daha güvenilir.
 */
const PROGRAM_SCHEMA = {
  type: "object" as const,
  properties: {
    found: {
      type: "boolean",
      description:
        "Sayfada bir lisans programı ve şartları bulunabildi mi. Bulunamadıysa false ve notes doldurulur.",
    },
    university: { type: "string" },
    country: {
      type: "string",
      enum: ["NL", "DE", "GB", "FR", "CH", "SE", "BE", "DK", "IT", "OTHER"],
    },
    city: { type: "string" },
    programName: { type: "string" },
    degree: { type: "string", description: "BSc, BA, BEng, MD gibi" },
    field: {
      type: "string",
      enum: [
        "cs",
        "engineering",
        "business",
        "economics",
        "medicine",
        "psychology",
        "natural-sciences",
        "other",
      ],
    },
    teachingLanguage: {
      type: "string",
      enum: ["en", "nl", "de", "fr", "it", "sv", "da", "other"],
    },
    durationYears: { type: "number" },
    minGpaNote: {
      type: "string",
      description:
        "Not şartının sayfada nasıl yazıldığı, aynen. Bilinmiyorsa boş bırak, uydurma.",
    },
    languageRequirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          test: { type: "string", description: "IELTS, TOEFL, TestDaF, DELF, TCF gibi" },
          min: { type: "string", description: "Sayfada yazan eşik değeri" },
        },
        required: ["test", "min"],
        additionalProperties: false,
      },
    },
    otherRequirements: {
      type: "array",
      items: { type: "string" },
      description:
        "Portfolyo, mülakat, giriş sınavı, ders şartı, sınırlı kontenjan gibi diğer şartlar",
    },
    tuitionNonEuNote: {
      type: "string",
      description: "AB-dışı öğrenci harcı, sayfada yazdığı gibi. Bilinmiyorsa boş bırak.",
    },
    deadlineNote: {
      type: "string",
      description: "Son başvuru tarihi, sayfada yazdığı gibi. Bilinmiyorsa boş bırak.",
    },
    applicationSystem: {
      type: "string",
      description: "UCAS, Studielink, uni-assist, Parcoursup, Campus France veya doğrudan",
    },
    notes: {
      type: "string",
      description:
        "Sayfada bulunamayan veya belirsiz kalan bilgiler. Öğrenciye dürüstçe ne eksik kaldığını söyle.",
    },
  },
  required: ["found", "university", "programName", "notes"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `Sen bir üniversite başvuru şartları çıkarım aracısın. Verilen sayfayı web_fetch ile oku ve lisans programının başvuru şartlarını yapılandırılmış veriye çevir.

Kurallar:
- SADECE sayfada açıkça yazan bilgiyi aktar. Bulamadığın alanı boş bırak; asla tahmin etme veya genel bilgiden doldurma.
- Harç bilgisinde AB-dışı (non-EU / international) tarifeyi ara. Sayfada sadece AB tarifesi varsa bunu notes'ta belirt.
- Sayfa bir program sayfası değilse (ana sayfa, haber, liste sayfası) found=false döndür ve notes'ta ne bulduğunu açıkla.
- notes alanını her zaman doldur: hangi bilgiyi bulamadığını ve öğrencinin nereye bakması gerektiğini yaz.
- Türkçe yaz (program ve üniversite adları hariç, onlar kaynak dilinde kalsın).`;

/** Anahtar yokken dönen örnek sonuç. Arayüz bunu "demo modu" olarak etiketler. */
const DEMO_RESULT = {
  found: true,
  university: "Aalto University",
  country: "OTHER",
  city: "Espoo",
  programName: "Bachelor's Programme in Science and Technology — Computer Science",
  degree: "BSc",
  field: "cs",
  teachingLanguage: "en",
  durationYears: 3,
  minGpaNote:
    "Lise diploması ve matematik ağırlıklı ders geçmişi isteniyor; sayısal bir eşik verilmemiş.",
  languageRequirements: [
    { test: "IELTS", min: "6.5 (her bölümden en az 5.5)" },
    { test: "TOEFL iBT", min: "92" },
  ],
  otherRequirements: [
    "Aalto giriş sınavı (matematik) zorunlu",
    "Kontenjan sınırlı, sıralamaya göre yerleştirme",
  ],
  tuitionNonEuNote: "AB-dışı öğrenciler için 15.000 EUR/yıl (burslar mevcut)",
  deadlineNote: "Ocak başvuru dönemi — genelde Ocak ortasında kapanıyor",
  applicationSystem: "Doğrudan (Studyinfo.fi)",
  notes:
    "Bu bir DEMO MODU sonucudur — gerçek bir sayfa okunmadı. ANTHROPIC_API_KEY tanımlandığında bu akış girilen bağlantıyı canlı olarak okur.",
};

export async function POST(request: Request) {
  let url: string;
  try {
    const body = await request.json();
    url = String(body.url ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "Bir bağlantı gerekiyor." }, { status: 400 });
  }

  // Basit doğrulama — kullanıcı bir sayfa adresi yapıştırmalı.
  let parsed: URL;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return NextResponse.json(
      { error: "Bu bir geçerli web adresi gibi görünmüyor." },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // --- Demo modu -----------------------------------------------------------
  if (!apiKey) {
    // Küçük bir gecikme: arayüzün yükleniyor durumunu göstermesi için.
    await new Promise((resolve) => setTimeout(resolve, 900));
    return NextResponse.json({ demoMode: true, program: DEMO_RESULT, sourceUrl: parsed.href });
  }

  // --- Canlı çıkarım -------------------------------------------------------
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: PROGRAM_SCHEMA,
        },
      },
      tools: [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 4 }],
      messages: [
        {
          role: "user",
          content: `Bu sayfadaki lisans programının başvuru şartlarını çıkar: ${parsed.href}`,
        },
      ],
    });

    // Güvenlik sınıflandırıcısı reddettiyse içeriği okumaya çalışma.
    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Bu istek işlenemedi. Farklı bir bağlantı dener misin?" },
        { status: 422 }
      );
    }

    const textBlock = response.content.find(
      (block): block is Anthropic.Beta.BetaTextBlock => block.type === "text"
    );

    if (!textBlock) {
      return NextResponse.json(
        { error: "Sayfa okunabildi ama yapılandırılmış sonuç üretilemedi." },
        { status: 502 }
      );
    }

    const program = JSON.parse(textBlock.text);
    return NextResponse.json({ demoMode: false, program, sourceUrl: parsed.href });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Şu an çok yoğunuz, birkaç saniye sonra tekrar dene." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "API anahtarı geçersiz. .env.local dosyasını kontrol et." },
        { status: 401 }
      );
    }
    console.error("[extract] beklenmeyen hata:", error);
    return NextResponse.json(
      { error: "Sayfa okunamadı. Bağlantı erişilebilir mi, kontrol eder misin?" },
      { status: 502 }
    );
  }
}
