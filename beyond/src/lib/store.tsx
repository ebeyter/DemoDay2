"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";
import {
  EMPTY_STRING_ARRAY,
  readPersistent,
  usePersistent,
  writePersistent,
} from "./persistent-state";
import type { StudentProfile } from "./types";

/**
 * Beyond — tek veri katmanı.
 *
 * Uygulamanın geri kalanı Supabase'i doğrudan görmez; her şey buradan geçer.
 * Kalıcılık iki katmanlı: localStorage her zaman yazılır (anında ve çevrimdışı
 * çalışır), Supabase yapılandırılmışsa üstüne hesap senkronizasyonu biner.
 * Bu sayede kalıcılık stratejisini değiştirmek tek dosyayı etkiliyor.
 */

const PROFILE_KEY = "beyond.profile";
const SHORTLIST_KEY = "beyond.shortlist";
const COMPARE_KEY = "beyond.compare";

export const MAX_COMPARE = 4;

export type AuthStatus = "loading" | "signed-in" | "signed-out" | "local";

interface StoreValue {
  status: AuthStatus;
  user: User | null;
  /** Supabase yoksa true — arayüz "yerel mod" rozetini bunun için gösterir. */
  localMode: boolean;

  profile: StudentProfile | null;
  saveProfile: (profile: StudentProfile) => Promise<void>;
  clearProfile: () => Promise<void>;

  /** Takvime giren programlar. */
  shortlist: string[];
  toggleShortlist: (programId: string) => void;
  isShortlisted: (programId: string) => boolean;

  /** Karşılaştırma tahtasındaki programlar (en fazla 4). */
  compare: string[];
  toggleCompare: (programId: string) => void;
  isComparing: (programId: string) => boolean;

  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient();
  const localMode = !isSupabaseConfigured;

  // Kalıcı durum doğrudan localStorage'dan okunuyor (bkz. persistent-state.ts).
  const profile = usePersistent<StudentProfile | null>(PROFILE_KEY, null);
  const shortlist = usePersistent<string[]>(SHORTLIST_KEY, EMPTY_STRING_ARRAY);
  const compare = usePersistent<string[]>(COMPARE_KEY, EMPTY_STRING_ARRAY);

  const [status, setStatus] = useState<AuthStatus>(localMode ? "local" : "loading");
  const [user, setUser] = useState<User | null>(null);

  // --- Supabase oturumu --------------------------------------------------
  useEffect(() => {
    if (!supabase) return;

    let active = true;

    // setState burada eşzamanlı değil — söz (promise) ve abonelik geri
    // çağrılarının içinde çalışıyor, yani dış sistemden gelen bildirimler.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setStatus(data.session?.user ? "signed-in" : "signed-out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? "signed-in" : "signed-out");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // --- Giriş yapılınca sunucudaki profili çek ----------------------------
  useEffect(() => {
    if (!supabase || !user) return;

    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("beyond_profiles")
        .select("profile, shortlist, compare_list")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active || error || !data) return;

      // Dış kaynağa yazıyoruz; abone bileşenler kendiliğinden güncellenir.
      if (data.profile) writePersistent(PROFILE_KEY, data.profile as StudentProfile);
      if (Array.isArray(data.shortlist)) writePersistent(SHORTLIST_KEY, data.shortlist);
      if (Array.isArray(data.compare_list)) writePersistent(COMPARE_KEY, data.compare_list);
    })();

    return () => {
      active = false;
    };
  }, [supabase, user]);

  // --- Sunucuya yazma ----------------------------------------------------
  const syncLists = useCallback(
    async (nextShortlist: string[], nextCompare: string[]) => {
      if (!supabase || !user) return;
      await supabase.from("beyond_profiles").upsert(
        {
          user_id: user.id,
          shortlist: nextShortlist,
          compare_list: nextCompare,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    },
    [supabase, user]
  );

  const saveProfile = useCallback(
    async (next: StudentProfile) => {
      const stamped: StudentProfile = {
        ...next,
        userId: user?.id,
        updatedAt: new Date().toISOString(),
      };
      writePersistent(PROFILE_KEY, stamped);

      if (supabase && user) {
        await supabase.from("beyond_profiles").upsert(
          {
            user_id: user.id,
            profile: stamped,
            updated_at: stamped.updatedAt,
          },
          { onConflict: "user_id" }
        );
      }
    },
    [supabase, user]
  );

  const clearProfile = useCallback(async () => {
    writePersistent<StudentProfile | null>(PROFILE_KEY, null);
    writePersistent(SHORTLIST_KEY, []);
    writePersistent(COMPARE_KEY, []);
    if (supabase && user) {
      await supabase.from("beyond_profiles").delete().eq("user_id", user.id);
    }
  }, [supabase, user]);

  const toggleShortlist = useCallback(
    (programId: string) => {
      // Güncel değeri kaynaktan oku — kapanışta eskimiş bir kopya kullanmamak için.
      const current = readPersistent<string[]>(SHORTLIST_KEY, EMPTY_STRING_ARRAY);
      const next = current.includes(programId)
        ? current.filter((id) => id !== programId)
        : [...current, programId];

      writePersistent(SHORTLIST_KEY, next);
      void syncLists(next, readPersistent<string[]>(COMPARE_KEY, EMPTY_STRING_ARRAY));
    },
    [syncLists]
  );

  const toggleCompare = useCallback(
    (programId: string) => {
      const current = readPersistent<string[]>(COMPARE_KEY, EMPTY_STRING_ARRAY);

      let next: string[];
      if (current.includes(programId)) {
        next = current.filter((id) => id !== programId);
      } else if (current.length >= MAX_COMPARE) {
        return; // Dolu — arayüz uyarıyı kendisi gösteriyor.
      } else {
        next = [...current, programId];
      }

      writePersistent(COMPARE_KEY, next);
      void syncLists(readPersistent<string[]>(SHORTLIST_KEY, EMPTY_STRING_ARRAY), next);
    },
    [syncLists]
  );

  // --- Kimlik doğrulama --------------------------------------------------
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "not-configured" };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: error.message } : {};
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "not-configured" };
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };

      // E-posta doğrulaması kapalıysa kayıt anında oturum açılır.
      return {};
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setStatus("signed-out");
  }, [supabase]);

  const value = useMemo<StoreValue>(
    () => ({
      status,
      user,
      localMode,
      profile,
      saveProfile,
      clearProfile,
      shortlist,
      toggleShortlist,
      isShortlisted: (id) => shortlist.includes(id),
      compare,
      toggleCompare,
      isComparing: (id) => compare.includes(id),
      signIn,
      signUp,
      signOut,
    }),
    [
      status,
      user,
      localMode,
      profile,
      saveProfile,
      clearProfile,
      shortlist,
      toggleShortlist,
      compare,
      toggleCompare,
      signIn,
      signUp,
      signOut,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
