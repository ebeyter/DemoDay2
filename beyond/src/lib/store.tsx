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

/**
 * Bu tarayıcıdaki öğrenciye ait her şeyi siler.
 *
 * Çıkışta ve hesap silmede çağrılıyor. Dil, tema ve aksan tercihleri BİLİNÇLİ
 * olarak dışarıda: onlar kişiye değil cihaza ait ayarlar ve çıkış yapınca
 * arayüzün diline/temasına dönmek kimseye faydası olmayan bir sürpriz olurdu.
 */
function clearLocalData(): void {
  writePersistent<StudentProfile | null>(PROFILE_KEY, null);
  writePersistent<string[]>(SHORTLIST_KEY, []);
  writePersistent<string[]>(COMPARE_KEY, []);
  writePersistent<SavedScenario[]>(SCENARIOS_KEY, []);
}

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

/**
 * Cihazda duran, henüz hiçbir hesaba bağlanmamış veri.
 *
 * Hesap zorunlu olmadan önce profil yalnızca localStorage'da tutuluyordu.
 * Zorunluluk gelince o kullanıcıların verisini yok saymak, uygulamayı bir
 * gecede "her şeyini kaybettin" ekranına çevirirdi; ilk girişte taşımayı
 * teklif ediyoruz.
 */
export interface HandoffCandidate {
  profile: StudentProfile;
  shortlist: string[];
  compare: string[];
  scenarios: SavedScenario[];
}

/** "Verilerimi indir" çıktısı — gizlilik ekranındaki JSON dosyasının şeması. */
export interface AccountExport {
  exportedAt: string;
  account: { id: string | null; email: string | null };
  profile: StudentProfile | null;
  shortlist: string[];
  compare: string[];
  scenarios: SavedScenario[];
}

/**
 * Hesap silme sonucu.
 * `partial` = veriler silindi ama auth kaydı sunucuda kaldı (service_role yok).
 * Bunu "silindi" diye göstermek yalan olurdu; arayüz ayrı bir mesaj basıyor.
 */
export interface DeleteAccountResult {
  error?: string;
  partial?: boolean;
}

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

  /** Sıfırlama bağlantısını e-postayla gönderir (bkz. /reset-password). */
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  /**
   * Yeni şifre belirler. Hem sıfırlama bağlantısıyla açılan oturumda hem de
   * ayarlardaki "şifre değiştir" akışında aynı çağrı kullanılıyor.
   */
  updatePassword: (password: string) => Promise<{ error?: string }>;

  /** Cihazda hesapsız veri varsa ilk girişte doldurulur; yoksa null. */
  handoff: HandoffCandidate | null;
  /** Cihazdaki veriyi hesaba taşır. */
  adoptHandoff: () => Promise<{ error?: string }>;
  /** Cihazdaki veriyi siler — kullanıcı "yeni profille başla" dedi. */
  discardHandoff: () => void;
  /** Teklifi bu oturum için erteler; veriye dokunmaz. */
  postponeHandoff: () => void;

  exportData: () => AccountExport;
  deleteAccount: () => Promise<DeleteAccountResult>;
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

  /**
   * Sağlayıcı ilk kurulduğu andaki YEREL verinin fotoğrafı.
   *
   * Neden anlık görüntü: aşağıdaki iki efekt, giriş yapılır yapılmaz sunucudaki
   * veriyi localStorage'ın üzerine yazıyor. Taşıma teklifini o yazımdan sonra
   * hazırlamaya kalksaydık taşınacak veri çoktan silinmiş olurdu.
   *
   * `profile.userId` doluysa profil zaten bir hesaba ait; taşınacak bir şey yok.
   */
  const [localSnapshot] = useState<HandoffCandidate | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = readPersistent<StudentProfile | null>(PROFILE_KEY, null);
    if (!stored || stored.userId) return null;
    return {
      profile: stored,
      shortlist: readPersistent<string[]>(SHORTLIST_KEY, EMPTY_STRING_ARRAY),
      compare: readPersistent<string[]>(COMPARE_KEY, EMPTY_STRING_ARRAY),
      scenarios: readPersistent<SavedScenario[]>(SCENARIOS_KEY, EMPTY_SCENARIOS),
    };
  });

  const [handoff, setHandoff] = useState<HandoffCandidate | null>(null);

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

      if (!active || error) return;

      if (data?.profile) {
        // Hesapta profil VAR — kaynak odur. Dış kaynağa yazıyoruz; abone
        // bileşenler kendiliğinden güncellenir.
        writePersistent(PROFILE_KEY, data.profile as StudentProfile);
        if (Array.isArray(data.shortlist)) writePersistent(SHORTLIST_KEY, data.shortlist);
        if (Array.isArray(data.compare_list)) writePersistent(COMPARE_KEY, data.compare_list);
        return;
      }

      // Hesapta profil YOK. Cihazda hesapsız bir profil duruyorsa taşımayı
      // teklif et — sessizce ne üzerine yazıyoruz ne de siliyoruz, kararı
      // kullanıcı veriyor.
      if (localSnapshot) setHandoff(localSnapshot);
    })();

    return () => {
      active = false;
    };
  }, [supabase, user, localSnapshot]);

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

      // Sunucu boş ve cihazda taşınmayı bekleyen senaryolar varsa üzerine
      // yazma: kullanıcı henüz "taşı" mı "sil" mi demedi.
      if (data.length === 0 && localSnapshot?.scenarios.length) return;

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
  }, [supabase, user, localSnapshot]);

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
    // Yerel kopyayı da temizle: aynı tarayıcıyı paylaşan bir sonraki kişinin
    // önceki kullanıcının profilini, kısa listesini ve senaryolarını görmesi
    // kabul edilebilir değil. Veriler hesapta durmaya devam ediyor.
    clearLocalData();
    setHandoff(null);
    setUser(null);
    setStatus("signed-out");
  }, [supabase]);

  // --- Şifre ---------------------------------------------------------------
  // Şifre hiçbir yerde log'lanmıyor ve hiçbir URL'e yazılmıyor; yalnızca
  // Supabase istemcisine gövde içinde geçiyor.

  const requestPasswordReset = useCallback(
    async (email: string) => {
      if (!supabase) return { error: "not-configured" };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      });
      return error ? { error: error.message } : {};
    },
    [supabase]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) return { error: "not-configured" };
      const { error } = await supabase.auth.updateUser({ password });
      return error ? { error: error.message } : {};
    },
    [supabase]
  );

  // --- Cihazdaki hesapsız verinin hesaba taşınması -------------------------

  const adoptHandoff = useCallback(async () => {
    if (!supabase || !user) return { error: "not-configured" };
    if (!handoff) return {};

    const stamped: StudentProfile = {
      ...handoff.profile,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase.from("beyond_profiles").upsert(
      {
        user_id: user.id,
        profile: stamped,
        shortlist: handoff.shortlist,
        compare_list: handoff.compare,
        updated_at: stamped.updatedAt,
      },
      { onConflict: "user_id" }
    );
    if (error) return { error: error.message };

    if (handoff.scenarios.length > 0) {
      const { error: scenarioError } = await supabase.from("beyond_scenarios").insert(
        handoff.scenarios.map((scenario) => ({
          id: scenario.id,
          user_id: user.id,
          name: scenario.name,
          fields: scenario.fields,
          countries: scenario.countries,
          max_tuition: scenario.maxTuition,
          created_at: scenario.createdAt,
        }))
      );
      // Profil taşındı ama senaryolar takıldı: profili geri almıyoruz, çünkü
      // asıl veri o. Hatayı yutmuyoruz da — arayüz uyarı gösteriyor.
      if (scenarioError) {
        writePersistent(PROFILE_KEY, stamped);
        setHandoff(null);
        return { error: scenarioError.message };
      }
    }

    writePersistent(PROFILE_KEY, stamped);
    writePersistent(SHORTLIST_KEY, handoff.shortlist);
    writePersistent(COMPARE_KEY, handoff.compare);
    writePersistent(SCENARIOS_KEY, handoff.scenarios);
    setHandoff(null);
    return {};
  }, [supabase, user, handoff]);

  const discardHandoff = useCallback(() => {
    clearLocalData();
    setHandoff(null);
  }, []);

  const postponeHandoff = useCallback(() => {
    setHandoff(null);
  }, []);

  // --- Verilerimi indir / hesabımı sil -------------------------------------

  const exportData = useCallback(
    (): AccountExport => ({
      exportedAt: new Date().toISOString(),
      account: { id: user?.id ?? null, email: user?.email ?? null },
      profile: readPersistent<StudentProfile | null>(PROFILE_KEY, null),
      shortlist: readPersistent<string[]>(SHORTLIST_KEY, EMPTY_STRING_ARRAY),
      compare: readPersistent<string[]>(COMPARE_KEY, EMPTY_STRING_ARRAY),
      scenarios: readPersistent<SavedScenario[]>(SCENARIOS_KEY, EMPTY_SCENARIOS),
    }),
    [user]
  );

  /**
   * Hesabı ve ona bağlı her şeyi siler.
   *
   * İki aşama, bu sırayla:
   *  1. Kullanıcının kendi satırları — RLS sayesinde tarayıcıdan güvenle
   *     silinebiliyor (yalnızca kendi kaydına erişebiliyor).
   *  2. auth.users kaydı — bunu tarayıcı silemez, `service_role` gerekiyor.
   *     Sunucudaki /api/account/delete rotası yapıyor.
   *
   * Sunucuda service_role tanımlı değilse ikinci aşama başarısız olur; o
   * durumda `partial: true` dönüyoruz ve arayüz "veriler silindi ama hesap
   * kaydı kaldı" diyor. "Silindi" demek yalan olurdu.
   */
  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    if (!supabase || !user) return { error: "not-configured" };

    const { error: scenarioError } = await supabase
      .from("beyond_scenarios")
      .delete()
      .eq("user_id", user.id);
    if (scenarioError) return { error: scenarioError.message };

    const { error: profileError } = await supabase
      .from("beyond_profiles")
      .delete()
      .eq("user_id", user.id);
    if (profileError) return { error: profileError.message };

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    let partial = false;
    if (!token) {
      partial = true;
    } else {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        // 503 = sunucuda service_role yok. Diğer her şey gerçek bir hata.
        if (response.status !== 503) return { error: "delete-failed" };
        partial = true;
      }
    }

    clearLocalData();
    setHandoff(null);
    await supabase.auth.signOut();
    setUser(null);
    setStatus("signed-out");

    return { partial };
  }, [supabase, user]);

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
      requestPasswordReset,
      updatePassword,
      handoff,
      adoptHandoff,
      discardHandoff,
      postponeHandoff,
      exportData,
      deleteAccount,
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
      requestPasswordReset,
      updatePassword,
      handoff,
      adoptHandoff,
      discardHandoff,
      postponeHandoff,
      exportData,
      deleteAccount,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
