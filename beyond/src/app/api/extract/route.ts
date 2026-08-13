import { NextResponse } from "next/server";
import { describeClaudeError, getClaude } from "@/lib/claude";
import { PageFetchError, fetchPageText } from "@/lib/fetch-page";

/**
 * Beyond — canlı program çıkarımı.
 *
 * Öğrenci bir üniversite programının sayfasını yapıştırır; sayfayı sunucudan
 * indirip metne çeviriyor, sonra Claude'a yapılandırılmış veriye dönüştürtüyoruz.
 *
 * Sayfayı Claude'un `web_fetch` aracıyla değil kendimiz indiriyoruz: o araç
 * Amazon Bedrock'ta mevcut değil. Böylece akış Bedrock'ta da Anthropic API'de
 * de birebir aynı çalışıyor.
 *
 * ÇİFT MOD: hiçbir sağlayıcı yapılandırılmamışsa hazırlanmış bir örnek sonuç
 * döner ve yanıtta demoMode=true olarak işaretlenir. Arayüz bunu açıkça
 * gösterir — demo modunu canlı AI gibi sunmak yanıltıcı olur.
 */

export const maxDuration = 120;

/**
 * Çıkarımın hedef şeması. Yapılandırılmış çıktı (output_config.format) ile
 * Claude'un tam olarak bu yapıyı üretmesi garanti altına alınıyor — serbest
 * metni sonradan ayrıştırmaya çalışmaktan çok daha güvenilir.
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

const SYSTEM_PROMPT = `Sen bir üniversite başvuru şartları çıkarım aracısın. Sana bir üniversite sayfasının düz metne çevrilmiş hali veriliyor. Bu metinden lisans programının başvuru şartlarını yapılandırılmış veriye çevir.

Kurallar:
- SADECE metinde açıkça yazan bilgiyi aktar. Bulamadığın alanı boş bırak; asla tahmin etme veya genel bilgiden doldurma.
- Harç bilgisinde AB-dışı (non-EU / international) tarifeyi ara. Metinde sadece AB tarifesi varsa bunu notes'ta belirt.
- Metin bir program sayfası değilse (ana sayfa, haber, liste sayfası) found=false döndür ve notes'ta ne bulduğunu açıkla.
- Sayfa kırpıldıysa ve şartlar görünmüyorsa bunu notes'ta söyle.
- notes alanını her zaman doldur: hangi bilgiyi bulamadığını ve öğrencinin nereye bakması gerektiğini yaz.
- Türkçe yaz (program ve üniversite adları hariç, onlar kaynak dilinde kalsın).`;

/** Sağlayıcı yokken dönen örnek sonuç. Arayüz bunu "demo modu" olarak etiketler. */
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
    "Bu bir DEMO MODU sonucudur — gerçek bir sayfa okunmadı. Bedrock veya Anthropic anahtarı tanımlandığında bu akış girilen bağlantıyı canlı olarak okur.",
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

  const claude = getClaude();

  // --- Demo modu -----------------------------------------------------------
  if (!claude) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return NextResponse.json({ demoMode: true, program: DEMO_RESULT, sourceUrl: url });
  }

  // --- 1. Sayfayı indir ----------------------------------------------------
  let page;
  try {
    page = await fetchPageText(url);
  } catch (error) {
    if (error instanceof PageFetchError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Sayfa okunamadı." }, { status: 502 });
  }

  // --- 2. Metni yapılandırılmış veriye çevir -------------------------------
  try {
    const response = await claude.client.messages.create({
      model: claude.model,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: PROGRAM_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Sayfa adresi: ${page.url}\n` +
                `Sayfa başlığı: ${page.title || "(yok)"}\n` +
                (page.truncated ? "NOT: Sayfa uzun olduğu için metin kırpıldı.\n" : "") +
                `\n--- SAYFA METNİ ---\n${page.text}`,
            },
          ],
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

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Sayfa okundu ama yapılandırılmış sonuç üretilemedi." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      demoMode: false,
      provider: claude.provider,
      program: JSON.parse(textBlock.text),
      sourceUrl: page.url,
    });
  } catch (error) {
    console.error("[extract] model hatası:", error);
    const { message, status } = describeClaudeError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
