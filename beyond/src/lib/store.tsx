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
import { reconcileLocalProfile } from "./profile-reconcile";
import { normalizeProfile } from "./profile-migrate";

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
  const storedProfile = usePersistent<StudentProfile | null>(PROFILE_KEY, null);

  /**
   * ESKİ ŞEMAYLA KAYDEDİLMİŞ PROFİL BURADA ONARILIYOR.
   *
   * Depodaki JSON tipe uymak zorunda değil: şema `schoolType`'tan
   * `diplomas`'a geçtiğinde eski kayıtlarda o alan hiç yoktu ve ayarlar
   * ekranı `draft.diplomas.includes(...)` satırında çöküyordu. Onarımın
   * yeri burası — profil uygulamaya TEK BU NOKTADAN giriyor, dolayısıyla
   * hiçbir ekran eksik alanla karşılaşmıyor. Her ekranda ayrı `?? []`
   * yazmak, biri unutulduğunda yine çökmek demekti.
   *
   * `useMemo`: her render'da yeni nesne üretmek, referansa bakan
   * `useMemo`/`useEffect` bağımlılıklarını boşuna tetiklerdi.
   */
  const profile = useMemo(() => normalizeProfile(storedProfile), [storedProfile]);
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
    // GİRİŞ VARSA "signed-in" DEĞİL "loading" KALIYOR.
    //
    // Sebep gizlilik: effect'ler boyamadan sonra çalışıyor, yani kullanıcı
    // ayarlandığı anda "signed-in" desek, aşağıdaki uzlaştırma effect'i
    // çalışana kadar bir kare boyunca ekranda ÖNCEKİ kullanıcının profili
    // durur. Sayfaların hepsi `status === "loading"` iken hiçbir şey render
    // etmiyor; durumu uzlaştırma bitene kadar orada tutarak tek noktadan
    // kapatıyoruz.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      if (!data.session?.user) setStatus("signed-out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setStatus("signed-out");
      else setStatus("loading");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // --- Giriş yapılınca yerel durumu HESAPLA UZLAŞTIR ----------------------
  //
  // GİZLİLİK HATASI BURADAYDI (2026-08-14). Eski hâli şöyleydi:
  //
  //     if (!active || error || !data) return;
  //
  // Yeni açılan bir hesabın `beyond_profiles`'ta satırı olmadığı için `data`
  // null geliyor ve effect ERKEN DÖNÜYORDU — localStorage'daki profile hiç
  // dokunmadan. O profil de aynı tarayıcıda daha önce giriş yapmış BAŞKA
  // kullanıcıya aitti. Sonuç: Alp yeni hesap açıyor, sihirbaz hiç sorulmuyor
  // ve karşısında Eda'nın profili, eşleşmeleri ve listesi çıkıyor.
  //
  // Doğru davranış: giriş yapıldığında yerel durum sunucudaki hesapla
  // UZLAŞTIRILIR. Sunucuda profil yoksa, yereldeki profil bu hesaba ait
  // değildir ve temizlenir; kullanıcı sihirbaza gider.
  useEffect(() => {
    if (!supabase || !user) return;

    let active = true;

    const clearLocal = () => {
      writePersistent<StudentProfile | null>(PROFILE_KEY, null);
      writePersistent(SHORTLIST_KEY, []);
      writePersistent(COMPARE_KEY, []);
    };

    const local = readPersistent<StudentProfile | null>(PROFILE_KEY, null);

    // Ağ turunu BEKLEMEDEN yapılan kontrol: profil başka bir kullanıcının
    // damgasını taşıyorsa hemen temizle. Beklersek fetch sürerken ekranda bir
    // an başkasının verisi görünür.
    if (
      reconcileLocalProfile({
        currentUserId: user.id,
        hasLocalProfile: Boolean(local),
        localProfileUserId: local?.userId,
        serverHasProfile: false,
        fetchFailed: true, // "henüz bilmiyoruz" — yalnızca damga kontrolü çalışsın
      }) === "clear"
    ) {
      clearLocal();
    }

    (async () => {
      const { data, error } = await supabase
        .from("beyond_profiles")
        .select("profile, shortlist, compare_list")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      // İKİ AKIŞ BİRLEŞTİRİLDİ (merge, 2026-08-14):
      //   - uzlaştırma kuralı: başkasının verisi asla sızmasın
      //   - taşıma teklifi: cihazdaki hesapsız profil sessizce silinmesin
      // İkisi çelişmiyor; sıra önemli. Önce güvenlik kararı veriliyor, sonra
      // silinen şeyin YERİNE açık onaylı taşıma teklif ediliyor. Teklifin
      // verisi `localSnapshot` — sağlayıcı kurulurken alınmış anlık görüntü,
      // yani temizlemeden etkilenmiyor.
      const action = reconcileLocalProfile({
        currentUserId: user.id,
        hasLocalProfile: Boolean(readPersistent<StudentProfile | null>(PROFILE_KEY, null)),
        localProfileUserId:
          readPersistent<StudentProfile | null>(PROFILE_KEY, null)?.userId,
        serverHasProfile: Boolean(data?.profile),
        fetchFailed: Boolean(error),
      });

      if (action === "adopt-server" && data?.profile) {
        // Hesapta profil VAR — kaynak odur. Dış kaynağa yazıyoruz; abone
        // bileşenler kendiliğinden güncellenir.
        writePersistent(PROFILE_KEY, data.profile as StudentProfile);
        writePersistent(SHORTLIST_KEY, Array.isArray(data.shortlist) ? data.shortlist : []);
        writePersistent(
          COMPARE_KEY,
          Array.isArray(data.compare_list) ? data.compare_list : []
        );
      } else if (action === "clear") {
        // Bu hesaba ait olduğu kanıtlanmayan veri ekranda kalmıyor.
        clearLocal();

        /**
         * TEMİZLENEN PROFİL DAMGASIZSA TAŞIMAYI TEKLİF ET.
         *
         * `reconcileLocalProfile` iki farklı sebeple "clear" diyor:
         *   a) profil BAŞKASININ damgasını taşıyor → teklif YOK, o veri bu
         *      kullanıcıya ait değil ve gösterilmemeli;
         *   b) profil damgasız (hesap zorunlu olmadan önce doldurulmuş) →
         *      bu kişinin kendi verisi OLABİLİR.
         *
         * `localSnapshot` yalnızca (b) durumunda dolu — sağlayıcı kurulurken
         * `stored.userId` yoksa alınıyor. Yani başkasının profili buraya asla
         * giremiyor ve gizlilik kuralı bozulmuyor.
         *
         * Yerel kopya yine de SİLİNDİ: ekranda bir an bile durmuyor. Veri
         * bellekteki fotoğrafta duruyor ve hesaba yalnızca kullanıcı
         * diyalogda "taşı" derse yazılıyor — `profile-reconcile.ts`'in
         * "taşıma açık onayla yapılmalı" notunun istediği tam olarak bu.
         */
        if (localSnapshot) setHandoff(localSnapshot);
      } else if (!error && !data?.profile) {
        // KORUNAN AMA SUNUCUDA OLMAYAN PROFİL = SENKRON KAYBI, VERİ KAYBI DEĞİL.
        //
        // Buraya yalnızca profil bu hesabın damgasını taşırken düşülüyor
        // (bkz. reconcileLocalProfile). Sebep genelde şu: sihirbaz
        // doldurulurken `saveProfile` yerele yazdı ama sunucuya upsert
        // tutmadı. Sessizce beklemek profili tek cihaza mahkûm eder ve bir
        // sonraki tarayıcıda yok olur; o yüzden burada yeniden yüklüyoruz.
        const own = readPersistent<StudentProfile | null>(PROFILE_KEY, null);
        if (own && own.userId === user.id) {
          await supabase.from("beyond_profiles").upsert(
            {
              user_id: user.id,
              profile: own,
              shortlist: readPersistent<string[]>(SHORTLIST_KEY, EMPTY_STRING_ARRAY),
              compare_list: readPersistent<string[]>(COMPARE_KEY, EMPTY_STRING_ARRAY),
              updated_at: own.updatedAt ?? new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }
      }

      // Hesapta profil yoksa ve cihazda HESAPSIZ (damgasız) bir profil
      // duruyorsa taşımayı teklif ediyoruz. `localSnapshot` yalnızca damgasız
      // profil için doluyor (bkz. yukarıdaki useState guard'ı), yani başka bir
      // hesabın verisi buraya hiç girmiyor — teklif ile gizlilik kuralı
      // birbirine karışmıyor.
      if (!error && !data?.profile && localSnapshot) setHandoff(localSnapshot);

      // Uzlaştırma bitti; sayfalar artık render edebilir. Bu satır olmadan
      // durum "loading"de kalır ve uygulama hiç açılmaz.
      setStatus("signed-in");
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
