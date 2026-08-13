import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Beyond — sunucu tarafı Supabase istemcisi.
 *
 * service_role anahtarı RLS'i baypas eder, yani bu istemci her satırı
 * okuyup yazabilir. BU YÜZDEN SADECE SUNUCUDA KULLANILIR:
 *
 *  - Anahtarın adında `NEXT_PUBLIC_` öneki YOK, dolayısıyla Next.js onu
 *    tarayıcı paketine dahil etmiyor.
 *  - Bu dosya yalnızca API rotalarından import ediliyor.
 *
 * Bir istemci bileşeninden import edilirse derleme sırasında değişken
 * `undefined` olur ve istemci `null` döner — sessizce sızmaz.
 */

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
