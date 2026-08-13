"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage'ı bir "dış kaynak" (external store) olarak modelleyen küçük katman.
 *
 * Neden useEffect + setState değil: sunucuda localStorage yok, o yüzden ilk
 * render'da okunamaz. Effect içinde setState ile doldurmak hem basamaklı
 * render'a yol açıyor hem de React'ın önerdiği yol değil. useSyncExternalStore
 * tam olarak bu iş için var — getServerSnapshot sunucu render'ını, getSnapshot
 * istemciyi besliyor ve hydration uyuşmazlığı oluşmuyor.
 *
 * Bonus: aynı hesabı iki sekmede açan kullanıcıda sekmeler senkron kalıyor.
 */

const listeners = new Set<() => void>();

/**
 * Anlık görüntü önbelleği. getSnapshot her çağrıda AYNI referansı döndürmek
 * zorunda — her seferinde yeni bir nesne dönerse React sonsuz döngüye girer.
 */
const cache = new Map<string, unknown>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Başka bir sekmede yapılan değişikliği de yakala.
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith("beyond.")) {
      cache.delete(event.key);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

/** Önbellekli okuma. Yalnızca istemcide çağrılır. */
export function readPersistent<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;

  let value = fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    // Bozuk JSON veya gizli sekme — varsayılana düş, uygulama çalışmaya devam etsin.
  }

  cache.set(key, value);
  return value;
}

/** Yaz, önbelleği tazele ve tüm aboneleri uyar. */
export function writePersistent<T>(key: string, value: T): void {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Kota dolu — bellekteki değer yine de güncel, oturum boyunca çalışır.
  }
  emit();
}

/**
 * `fallback` referans olarak SABİT olmalı (modül düzeyinde bir sabit).
 * Her render'da yeni bir `[]` geçmek sonsuz döngüye yol açar.
 */
export function usePersistent<T>(key: string, fallback: T): T {
  const getSnapshot = useCallback(() => readPersistent(key, fallback), [key, fallback]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Boş dizi sabiti — fallback olarak paylaşmak için. */
export const EMPTY_STRING_ARRAY: string[] = [];
