import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SourceCheck } from "@/lib/freshness";

/**
 * Beyond — arayüz için tarama sonuçları.
 *
 * Okuma anon anahtarla yapılıyor: tablo herkese açık okunabilir (kişisel
 * veri yok), yani ziyaretçinin giriş yapmış olması gerekmiyor.
 *
 * Supabase yapılandırılmamışsa veya tablo boşsa boş liste döner; arayüz o
 * durumda pakete gömülü JSON'a düşüyor. Yani tarama altyapısı çökse bile
 * rozetler kaybolmuyor, sadece tazeliğini yitiriyor.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ checks: {} });

  const { data, error } = await supabase
    .from("beyond_source_checks")
    .select("program_id, status, fingerprint, discrepancies, error, changed_at, checked_at");

  if (error || !data) {
    // Sessizce boş dön — arayüz gömülü JSON'a düşer.
    return NextResponse.json({ checks: {} });
  }

  const checks: Record<string, SourceCheck> = {};
  for (const row of data) {
    checks[row.program_id as string] = {
      programId: row.program_id as string,
      status: row.status as SourceCheck["status"],
      fingerprint: (row.fingerprint as string) ?? "",
      discrepancies: (row.discrepancies as SourceCheck["discrepancies"]) ?? [],
      changedAt: (row.changed_at as string | null) ?? null,
      checkedAt: row.checked_at as string,
      ...(row.error ? { error: row.error as string } : {}),
    };
  }

  return NextResponse.json({ checks });
}
