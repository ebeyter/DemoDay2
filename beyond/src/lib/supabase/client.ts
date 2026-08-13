import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Tarayıcı Supabase istemcisi.
 *
 * Anahtarlar yoksa `null` döner ve uygulama yerel moda düşer
 * (profil localStorage'da tutulur). Böylece geliştirme ve demo,
 * Supabase bağlanmadan da tam çalışır; .env.local dolduğu anda
 * hiçbir kod değişmeden gerçek hesaplara geçer.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createBrowserClient(url as string, anonKey as string);
  }
  return cached;
}
