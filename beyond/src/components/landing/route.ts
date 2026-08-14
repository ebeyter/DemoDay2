import { PROGRAMS } from "@/data/programs";
import type { CountryCode } from "@/lib/types";

/**
 * Landing rota haritası — geometri ve durak verisi.
 *
 * NEDEN KÜRE DEĞİL: ürün "Türkiye'den Avrupa'ya" diyor. Dönen bir dünya küresi
 * genel bir "global" mesajı verir; rota, öğrencinin gerçekten yapacağı
 * yolculuğu anlatır ve her durağı bir ürün iddiasına bağlayabiliyoruz.
 *
 * NEDEN TAMAMEN SVG: demo sırasında internet gitse bile çalışmalı. Dış görsel,
 * CDN, harita servisi yok — burada sadece sayı var, çizimi tarayıcı yapıyor.
 *
 * HARİTA ŞEMATİK AMA KOORDİNATLAR GERÇEK. Kıta sınırı çizmiyoruz: elle
 * çizilmiş yaklaşık bir kıyı şeridi, verisinin doğruluğuyla övünen bir üründe
 * yanlış yerde bir "yaklaşık". Bunun yerine gerçek enlem/boylam ızgarası ve
 * gerçek şehir koordinatları kullanılıyor.
 */

// ---------------------------------------------------------------------------
// Duraklar
// ---------------------------------------------------------------------------

export interface RouteStop {
  /**
   * `src/data/programs.ts`'teki `city` alanıyla BİREBİR aynı yazılmalı —
   * program sayısı bu eşleşmeden türetiliyor. Tek istisna İstanbul: başlangıç
   * noktası, katalogda yok.
   */
  city: string;
  /** null → başlangıç noktası; katalogda karşılığı aranmaz. */
  country: CountryCode | null;
  lon: number;
  lat: number;
  /** Etiketin düğüme göre yerleşimi — çakışmalar elle ayarlandı. */
  label: { align: "start" | "end"; dy: number };
}

/**
 * İstanbul + katalogdaki dört gerçek şehir. Dört durak dört ürün iddiasına
 * karşılık geliyor (bkz. sözlükteki `landingJourney.stops`), o yüzden sayı
 * ikisinde de aynı olmak zorunda — `LEG_COUNT` bunu tek yerden veriyor.
 */
export const STOPS: RouteStop[] = [
  { city: "İstanbul", country: null, lon: 28.98, lat: 41.01, label: { align: "end", dy: 0 } },
  { city: "Delft", country: "NL", lon: 4.36, lat: 52.01, label: { align: "start", dy: -26 } },
  { city: "Oxford", country: "GB", lon: -1.26, lat: 51.75, label: { align: "end", dy: 0 } },
  { city: "Paris", country: "FR", lon: 2.35, lat: 48.86, label: { align: "end", dy: 16 } },
  { city: "Milano", country: "IT", lon: 9.19, lat: 45.46, label: { align: "start", dy: 12 } },
];

/** Çizilecek bacak sayısı — duraklar arası. */
export const LEG_COUNT = STOPS.length - 1;

/**
 * Bir durağın ülkesinde katalogda kaç program var.
 * Sayıyı elle yazmıyoruz: katalog büyüdükçe harita da büyüsün.
 */
export function programCountFor(stop: RouteStop): number {
  if (!stop.country) return 0;
  return PROGRAMS.filter((program) => program.country === stop.country).length;
}

/**
 * Durak şehri katalogdan düşerse haritada sessizce yanlış bir durak kalır.
 * Geliştirme sırasında yüksek sesle söyle; üretimde kontrolü hiç çalıştırma.
 */
if (process.env.NODE_ENV !== "production") {
  const missing = STOPS.filter(
    (stop) => stop.country && !PROGRAMS.some((program) => program.city === stop.city)
  );
  if (missing.length > 0) {
    console.warn(
      `[landing] Rota durağı katalogda yok: ${missing.map((s) => s.city).join(", ")} — ` +
        "src/components/landing/route.ts içindeki STOPS listesini güncelle."
    );
  }
}

// ---------------------------------------------------------------------------
// İzdüşüm
// ---------------------------------------------------------------------------

/**
 * Çerçeve bilerek geniş ve alçak (≈2:1). Ölçek yükseklikten kısıtlanıyor,
 * o yüzden fazladan genişlik doğrudan şehirlerin iki yanındaki boşluğa
 * gidiyor — Oxford ve Paris'in etiketleri sola sığsın diye. Alçak çerçeve
 * ayrıca dar ekranda yapışkan haritanın ekranı yutmasını engelliyor.
 */
export const VIEW_W = 900;
export const VIEW_H = 440;

/** Şehir etiketleri çerçeveden taşmasın diye içeriden pay. */
const PAD_X = 78;
const PAD_Y = 56;

/** Çerçevenin kapsadığı alan — Britanya'dan İstanbul'a, Akdeniz'den Baltık'a. */
const LON_MIN = -6;
const LON_MAX = 32;
const LAT_MIN = 40;
const LAT_MAX = 56;

/**
 * Eş dikdörtgen (equirectangular) izdüşüm, standart paralel 48°N.
 * Boylamlar cos(48°) ile daraltılıyor — yoksa Avrupa yatay olarak gerilmiş
 * görünür. Ölçek iki eksende de aynı, o yüzden mesafe oranları korunuyor.
 */
const STANDARD_PARALLEL = (48 * Math.PI) / 180;
const LON_SCALE = Math.cos(STANDARD_PARALLEL);

const spanX = (LON_MAX - LON_MIN) * LON_SCALE;
const spanY = LAT_MAX - LAT_MIN;
const scale = Math.min((VIEW_W - 2 * PAD_X) / spanX, (VIEW_H - 2 * PAD_Y) / spanY);
const offsetX = (VIEW_W - spanX * scale) / 2;
const offsetY = (VIEW_H - spanY * scale) / 2;

export interface Point {
  x: number;
  y: number;
}

export function project(lon: number, lat: number): Point {
  return {
    x: offsetX + (lon - LON_MIN) * LON_SCALE * scale,
    y: offsetY + (LAT_MAX - lat) * scale,
  };
}

/** Duraklar viewBox koordinatında — modül yüklenirken bir kez hesaplanıyor. */
export const STOP_POINTS: Point[] = STOPS.map((stop) => project(stop.lon, stop.lat));

/** Izgara çizgileri: gerçek meridyen ve paraleller, dekoratif değil. */
export const MERIDIANS = [-10, 0, 10, 20, 30].map((lon) => project(lon, LAT_MAX).x);
export const PARALLELS = [40, 45, 50, 55].map((lat) => project(0, lat).y);

// ---------------------------------------------------------------------------
// Bacaklar
// ---------------------------------------------------------------------------

export interface RouteLeg {
  /** SVG `d` — tek bir karesel Bézier. */
  d: string;
  from: Point;
  to: Point;
  control: Point;
  /**
   * Yayın gerçek uzunluğu (viewBox birimi).
   *
   * `pathLength={1}` + `strokeDasharray={1}` ile normalleştirmeyi denedik;
   * Chrome bu kurulumda ölçeklemeyi uygulamadı ve rota kesik kesik çizildi.
   * Uzunluğu burada sayısal olarak hesaplıyoruz: `getTotalLength()` gibi DOM
   * ölçümü gerektirmiyor, sunucuda da aynı sonucu veriyor.
   */
  length: number;
}

/**
 * İki durak arasını düz çizgi yerine hafifçe kuzeye bombelendirilmiş bir yay
 * olarak çiziyoruz — uçuş rotası hissi, ve üst üste binen düz çizgilerin
 * okunmasını kolaylaştırıyor.
 */
function buildLeg(from: Point, to: Point): RouteLeg {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;

  // Doğrultuya dik birim vektör; y'si negatif olan tarafı seçiyoruz ki
  // yay her zaman yukarı (kuzeye) bombelensin — yön ne olursa olsun.
  let nx = dy / length;
  let ny = -dx / length;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }

  const bow = length * 0.16;
  const control = {
    x: (from.x + to.x) / 2 + nx * bow,
    y: (from.y + to.y) / 2 + ny * bow,
  };

  return {
    d: `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} Q ${control.x.toFixed(2)} ${control.y.toFixed(
      2
    )} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`,
    from,
    to,
    control,
    length: arcLength(from, control, to),
  };
}

/**
 * Karesel Bézier'in uzunluğu — eğriyi örnekleyip kirişleri topluyoruz.
 * 64 parça bu ölçekte piksel altı hata bırakıyor; kapalı formül şart değil.
 */
function arcLength(from: Point, control: Point, to: Point): number {
  const steps = 64;
  let total = 0;
  let previous = from;

  for (let step = 1; step <= steps; step++) {
    const t = step / steps;
    const inv = 1 - t;
    const point = {
      x: inv * inv * from.x + 2 * inv * t * control.x + t * t * to.x,
      y: inv * inv * from.y + 2 * inv * t * control.y + t * t * to.y,
    };
    total += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }

  return total;
}

export const LEGS: RouteLeg[] = STOP_POINTS.slice(0, -1).map((point, index) =>
  buildLeg(point, STOP_POINTS[index + 1])
);

/**
 * Dar ekran için kırpılmış çerçeve.
 *
 * Etiketler `sm` altında gizleniyor, dolayısıyla onlar için ayrılan geniş pay
 * da gereksiz kalıyor: tam çerçeve 375px'e sığdırıldığında düğümler 2-3
 * piksele iniyor ve rota okunmuyor. Rotanın kendi sınırlarına kırpınca aynı
 * genişlikte ~1.8 kat büyük çiziliyor.
 *
 * Sınırlar veriden hesaplanıyor: bir Bézier, uç noktaları ile kontrol
 * noktasının oluşturduğu üçgenin dışına çıkamaz, o yüzden bu üç nokta
 * kümesinin kutusu yayların tamamını kapsıyor.
 */
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Etiketler yüzdeyle konumlanıyor; hangi çerçeve çiziliyorsa ona göre. */
export function viewBoxAttr(box: ViewBox): string {
  return `${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.width.toFixed(1)} ${box.height.toFixed(1)}`;
}

export const FULL_BOX: ViewBox = { x: 0, y: 0, width: VIEW_W, height: VIEW_H };

export const COMPACT_BOX: ViewBox = (() => {
  const margin = 34;
  const points = [...STOP_POINTS, ...LEGS.map((leg) => leg.control)];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  const x = Math.min(...xs) - margin;
  const y = Math.min(...ys) - margin;

  return { x, y, width: Math.max(...xs) + margin - x, height: Math.max(...ys) + margin - y };
})();

/** Karesel Bézier üzerindeki nokta — ilerleme işaretçisi buraya konuyor. */
export function bezierPoint(leg: RouteLeg, t: number): Point {
  const inv = 1 - t;
  return {
    x: inv * inv * leg.from.x + 2 * inv * t * leg.control.x + t * t * leg.to.x,
    y: inv * inv * leg.from.y + 2 * inv * t * leg.control.y + t * t * leg.to.y,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
