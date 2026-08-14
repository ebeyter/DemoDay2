import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Beyond — hesap silme.
 *
 * NEDEN SUNUCU ROTASI GEREKİYOR
 * Tarayıcı, RLS sayesinde kendi veri satırlarını (profil, kısa liste,
 * karşılaştırma, senaryolar) güvenle silebiliyor — bunu istemci zaten yapıyor.
 * Ama `auth.users` tablosundaki hesap kaydını silmek `service_role` yetkisi
 * istiyor ve o anahtar tarayıcıya asla verilmez. Bu rota o son adımı atıyor.
 *
 * GÜVENLİK — üç katman:
 *  1. `service_role` yoksa rota hiçbir şey yapmaz (503). Anahtarsız bir
 *     ortamda hesap silmiş gibi davranmak yalan olurdu.
 *  2. `Authorization: Bearer <access_token>` zorunlu (401).
 *  3. Silinecek kullanıcı GÖVDEDEN ALINMAZ — jetonun kime ait olduğu
 *     Supabase'e sorulur ve yalnızca O kullanıcı silinir. Aksi halde geçerli
 *     jetonu olan herkes başkasının hesabını silebilirdi.
 *
 * Kullanıcının şifresi buraya hiç uğramıyor ve hiçbir şey log'lanmıyor.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    // İstemci bu durumu "veriler silindi, hesap kaydı kaldı" diye gösteriyor.
    return NextResponse.json({ error: "service-role-missing" }, { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Jetonun sahibini Supabase'e doğrulatıyoruz — silinecek kimlik buradan geliyor.
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // beyond_profiles ve beyond_scenarios `on delete cascade` ile auth.users'a
  // bağlı; bu çağrı geride satır bırakmıyor. İstemci yine de kendi satırlarını
  // önceden siliyor, böylece service_role tanımlı olmayan kurulumlarda bile
  // öğrencinin verisi gerçekten gidiyor.
  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    return NextResponse.json({ error: "delete-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
