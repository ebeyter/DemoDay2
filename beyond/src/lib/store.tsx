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
import type { CountryCode, FieldId, StudentProfile } from "./types";

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
const SCENARIOS_KEY = "beyond.scenarios";

export const MAX_COMPARE = 4;

export type AuthStatus = "loading" | "signed-in" | "signed-out" | "local";

/** Senaryo modunun (bkz. results/page.tsx) geçici olarak ezdiği profil alanları. */
export interface SavedScenario {
  id: string;
  name: string;
  fields: FieldId[];
  countries: CountryCode[];
  /** null = üst sınır yok. */
  maxTuition: number | null;
  createdAt: string;
}

const EMPTY_SCENARIOS: SavedScenario[] = [];

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

  /** Kaydedilen senaryolar — en yeni önce. Anahtarsız modda localStorage'da kalır. */
  scenarios: SavedScenario[];
  saveScenario: (input: {
    name: string;
    fields: FieldId[];
    countries: CountryCode[];
    maxTuition: number | null;
  }) => Promise<void>;
  deleteScenario: (id: string) => Promise<void>;

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
  const scenarios = usePersistent<SavedScenario[]>(SCENARIOS_KEY, EMPTY_SCENARIOS);

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

  // --- Giriş yapılınca kayıtlı senaryoları çek ----------------------------
  useEffect(() => {
    if (!supabase || !user) return;

    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("beyond_scenarios")
        .select("id, name, fields, countries, max_tuition, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active || error || !data) return;

      writePersistent<SavedScenario[]>(
        SCENARIOS_KEY,
        data.map((row) => ({
          id: row.id,
          name: row.name,
          fields: row.fields as FieldId[],
          countries: row.countries as CountryCode[],
          maxTuition: row.max_tuition,
          createdAt: row.created_at,
        }))
      );
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

  const saveScenario = useCallback(
    async (input: {
      name: string;
      fields: FieldId[];
      countries: CountryCode[];
      maxTuition: number | null;
    }) => {
      const scenario: SavedScenario = {
        id: crypto.randomUUID(),
        name: input.name,
        fields: input.fields,
        countries: input.countries,
        maxTuition: input.maxTuition,
        createdAt: new Date().toISOString(),
      };

      // Anahtarsız modda burada durur — localStorage tek kaynak.
      const current = readPersistent<SavedScenario[]>(SCENARIOS_KEY, EMPTY_SCENARIOS);
      writePersistent(SCENARIOS_KEY, [scenario, ...current]);

      if (supabase && user) {
        await supabase.from("beyond_scenarios").insert({
          id: scenario.id,
          user_id: user.id,
          name: scenario.name,
          fields: scenario.fields,
          countries: scenario.countries,
          max_tuition: scenario.maxTuition,
          created_at: scenario.createdAt,
        });
      }
    },
    [supabase, user]
  );

  const deleteScenario = useCallback(
    async (id: string) => {
      const current = readPersistent<SavedScenario[]>(SCENARIOS_KEY, EMPTY_SCENARIOS);
      writePersistent(
        SCENARIOS_KEY,
        current.filter((s) => s.id !== id)
      );

      if (supabase && user) {
        await supabase.from("beyond_scenarios").delete().eq("id", id).eq("user_id", user.id);
      }
    },
    [supabase, user]
  );

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
      scenarios,
      saveScenario,
      deleteScenario,
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
      scenarios,
      saveScenario,
      deleteScenario,
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
