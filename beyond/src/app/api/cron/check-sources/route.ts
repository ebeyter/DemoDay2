import { NextResponse } from "next/server";
import { PROGRAMS } from "@/data/programs";
import { PageFetchError, fetchPageText } from "@/lib/fetch-page";
import { extractSignals, findDiscrepancies, fingerprint } from "@/lib/freshness";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Program } from "@/lib/types";

/**
 * Beyond — otomatik kaynak taraması.
 *
 * Her programın kaynak sayfasını indirir, parmak izi ve sayısal sinyalleri
 * çıkarır, önceki taramayla karşılaştırır ve sonucu Supabase'e yazar.
 * Arayüz /api/freshness üzerinden bu sonuçları okuyor.
 *
 * Yerel geliştirmede aynı işi `npm run check-sources` yapıyor ve sonucu
 * JSON dosyasına yazıyor — Vercel'de dosya sistemi salt-okunur olduğu için
 * orada veritabanı gerekiyor.
 *
 * GÜVENLİK: CRON_SECRET tanımlıysa Authorization başlığı zorunlu.
 * Vercel Cron bu başlığı kendiliğinden gönderiyor. Tanımlı değilse rota
 * çalışmayı reddeder — açık bir uç nokta bırakmak, herkesin 36 üniversite
 * sitesine bizim adımıza istek yağdırabilmesi demek olurdu.
 */

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Sayfaları gruplar halinde indiriyoruz; 36 eşzamanlı istek hem bize hem karşı tarafa ağır gelir. */
const CONCURRENCY = 6;

interface PreviousCheck {
  fingerprint: string;
  changed_at: string | null;
  status: string;
}

async function checkOne(
  program: Program,
  previous: PreviousCheck | undefined,
  now: string
) {
  try {
    const page = await fetchPageText(program.sourceUrl);
    const fp = fingerprint(page.text);
    const discrepancies = findDiscrepancies(program, extractSignals(page.text));

    // İlk taramada "değişti" demek yanlış olur — referans noktası oluşuyor.
    const isFirstScan = !previous || previous.status === "unreachable";
    const changed = !isFirstScan && previous.fingerprint !== fp;

    return {
      program_id: program.id,
      status: changed ? "changed" : "ok",
      fingerprint: fp,
      discrepancies,
      error: null,
      changed_at: changed ? now : (previous?.changed_at ?? null),
      checked_at: now,
    };
  } catch (error) {
    return {
      program_id: program.id,
      status: "unreachable",
      fingerprint: previous?.fingerprint ?? "",
      discrepancies: [],
      error: error instanceof PageFetchError ? error.message : "Bilinmeyen hata",
      changed_at: previous?.changed_at ?? null,
      checked_at: now,
    };
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET tanımlı değil — tarama uç noktası kapalı." },
      { status: 503 }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." },
      { status: 503 }
    );
  }

  // Önceki durumu al — "değişti mi" kararı buna dayanıyor.
  const { data: previousRows, error: readError } = await supabase
    .from("beyond_source_checks")
    .select("program_id, fingerprint, changed_at, status");

  if (readError) {
    return NextResponse.json(
      { error: `Önceki tarama okunamadı: ${readError.message}` },
      { status: 500 }
    );
  }

  const previous = new Map<string, PreviousCheck>(
    (previousRows ?? []).map((row) => [
      row.program_id as string,
      {
        fingerprint: row.fingerprint as string,
        changed_at: row.changed_at as string | null,
        status: row.status as string,
      },
    ])
  );

  const now = new Date().toISOString();
  const rows: Awaited<ReturnType<typeof checkOne>>[] = [];

  for (let i = 0; i < PROGRAMS.length; i += CONCURRENCY) {
    const batch = PROGRAMS.slice(i, i + CONCURRENCY);
    rows.push(
      ...(await Promise.all(batch.map((p) => checkOne(p, previous.get(p.id), now))))
    );
  }

  const { error: writeError } = await supabase
    .from("beyond_source_checks")
    .upsert(rows, { onConflict: "program_id" });

  if (writeError) {
    return NextResponse.json(
      { error: `Sonuçlar yazılamadı: ${writeError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    scannedAt: now,
    total: rows.length,
    changed: rows.filter((r) => r.status === "changed").length,
    withDiscrepancies: rows.filter((r) => r.discrepancies.length > 0).length,
    unreachable: rows.filter((r) => r.status === "unreachable").length,
  });
}
