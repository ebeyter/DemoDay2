/**
 * Landing haritasının kara parçalarını üretir.
 *
 *   npx tsx scripts/build-landing-map.mts
 *
 * NEDEN BETİK, NEDEN ELLE ÇİZİM DEĞİL
 * Landing'in ilk hâlinde kıta sınırı bilinçli olarak çizilmemişti: "elle
 * çizilmiş yaklaşık bir kıyı şeridi, verisinin doğruluğuyla övünen bir üründe
 * yanlış yerde bir yaklaşım" deniyordu. Gerekçe doğru, sonuç yanlıştı — kıyı
 * çizgisi olmayınca harita haritaya benzemiyor, sadece etiket serpilmiş bir
 * ızgara gibi duruyordu.
 *
 * Bu betik ortayı buluyor: kıyı şeridi ÇİZİLMİYOR, kamuya açık bir veri
 * kümesinden TÜRETİLİYOR. Kaynak Natural Earth (public domain, CC0) — kartografi
 * dünyasının standart temel katmanı. Elle konan tek bir nokta yok.
 *
 * ÇIKTI PROJEKSİYONSUZ. Betik enlem/boylam yazıyor; ekrana düşürme işini
 * route.ts'teki `project()` yapıyor. Böylece harita çerçevesi değiştiğinde
 * veriyi yeniden üretmek gerekmiyor ve izdüşüm tek yerde kalıyor.
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson";

/**
 * Başlangıç noktası ülkesi. Rota tek bir şehirden değil ÜLKEDEN başlıyor:
 * öğrenci Ankara'da da olabilir Trabzon'da da, yolculuğu İstanbul'a bağlamak
 * gereksiz ve yanlış bir varsayım. Haritada ülkenin tamamı vurgulanıyor.
 */
const ORIGIN_SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";

/** Natural Earth'ün ISO A3 kodu — ad alanları sürümden sürüme değişebiliyor. */
const ORIGIN_ISO = "TUR";

/** Çerçeve — route.ts'teki görünüm alanından biraz geniş, kırpma payı için. */
const BBOX = { lonMin: -18, lonMax: 52, latMin: 28, latMax: 66 };

/**
 * Douglas–Peucker toleransı (derece). 0.06 ≈ 5 km; bu ölçekte (tüm Avrupa bir
 * ekranda) gözle ayırt edilemiyor ama nokta sayısını ~20 kat düşürüyor.
 */
const TOLERANCE = 0.06;

/** Kırpıldıktan sonra bundan az noktası kalan halka atılıyor (ada gürültüsü). */
const MIN_POINTS = 4;

type Ring = [number, number][];

// ---------------------------------------------------------------------------
// Sutherland–Hodgman: çokgeni dikdörtgene kırp
// ---------------------------------------------------------------------------

type Edge = "left" | "right" | "bottom" | "top";

function inside(point: [number, number], edge: Edge): boolean {
  const [lon, lat] = point;
  if (edge === "left") return lon >= BBOX.lonMin;
  if (edge === "right") return lon <= BBOX.lonMax;
  if (edge === "bottom") return lat >= BBOX.latMin;
  return lat <= BBOX.latMax;
}

function intersect(a: [number, number], b: [number, number], edge: Edge): [number, number] {
  const [ax, ay] = a;
  const [bx, by] = b;

  if (edge === "left" || edge === "right") {
    const x = edge === "left" ? BBOX.lonMin : BBOX.lonMax;
    const t = (x - ax) / (bx - ax);
    return [x, ay + t * (by - ay)];
  }

  const y = edge === "bottom" ? BBOX.latMin : BBOX.latMax;
  const t = (y - ay) / (by - ay);
  return [ax + t * (bx - ax), y];
}

function clipToBox(ring: Ring): Ring {
  let output = ring;

  for (const edge of ["left", "right", "bottom", "top"] as Edge[]) {
    const input = output;
    output = [];
    if (input.length === 0) break;

    for (let i = 0; i < input.length; i++) {
      const current = input[i];
      const previous = input[(i + input.length - 1) % input.length];
      const currentIn = inside(current, edge);
      const previousIn = inside(previous, edge);

      if (currentIn) {
        if (!previousIn) output.push(intersect(previous, current, edge));
        output.push(current);
      } else if (previousIn) {
        output.push(intersect(previous, current, edge));
      }
    }
  }

  return output;
}

// ---------------------------------------------------------------------------
// Douglas–Peucker sadeleştirme
// ---------------------------------------------------------------------------

function perpendicularDistance(
  point: [number, number],
  start: [number, number],
  end: [number, number]
): number {
  const [px, py] = point;
  const [sx, sy] = start;
  const [ex, ey] = end;

  const dx = ex - sx;
  const dy = ey - sy;
  if (dx === 0 && dy === 0) return Math.hypot(px - sx, py - sy);

  const t = ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy);
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (sx + clamped * dx), py - (sy + clamped * dy));
}

function simplify(points: Ring, tolerance: number): Ring {
  if (points.length < 3) return points;

  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance <= tolerance) return [points[0], points[points.length - 1]];

  const left = simplify(points.slice(0, index + 1), tolerance);
  const right = simplify(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

// ---------------------------------------------------------------------------

interface Feature {
  properties?: Record<string, unknown>;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJson {
  features: Feature[];
}

function ringsOf(geojson: GeoJson): Ring[] {
  const rings: Ring[] = [];

  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;
    // Yalnızca dış halkalar: iç halkalar (göller) bu ölçekte görünmüyor,
    // eklemek dosyayı büyütüp çizimi karmaşıklaştırırdı.
    const polygons =
      type === "Polygon" ? [coordinates as number[][][]] : (coordinates as number[][][][]);

    for (const polygon of polygons) {
      rings.push(polygon[0].map((position) => [position[0], position[1]] as [number, number]));
    }
  }

  return rings;
}

/** Halkaları kırp + sadeleştir; boşalanları at. */
function prepare(raw: Ring[]): { rings: Ring[]; before: number; after: number } {
  let before = 0;
  let after = 0;
  const rings: Ring[] = [];

  for (const ring of raw) {
    before += ring.length;
    const clipped = clipToBox(ring);
    if (clipped.length < MIN_POINTS) continue;

    const simplified = simplify(clipped, TOLERANCE);
    if (simplified.length < MIN_POINTS) continue;

    after += simplified.length;
    rings.push(simplified);
  }

  // Büyük kara parçaları önce çizilsin; küçük adalar üstte kalsın.
  rings.sort((a, b) => b.length - a.length);
  return { rings, before, after };
}

function serialise(rings: Ring[]): string {
  return rings
    .map(
      (ring) =>
        `  [${ring.map(([lon, lat]) => `[${lon.toFixed(2)},${lat.toFixed(2)}]`).join(",")}],`
    )
    .join("\n");
}

/**
 * Alan ağırlıklı ağırlık merkezi (poligonun kendi formülü).
 *
 * Basit nokta ortalaması kullanılsaydı, kıyıda çok nokta olan bölgeler
 * merkezi kendine çekerdi. Rota yayları bu noktadan başladığı için merkezin
 * ülkenin gerçek ortasında olması gerekiyor.
 */
function centroidOf(rings: Ring[]): [number, number] {
  const ring = rings[0];
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }

  area *= 0.5;
  if (area === 0) return ring[0];
  return [cx / (6 * area), cy / (6 * area)];
}

async function fetchGeoJson(url: string): Promise<GeoJson> {
  process.stdout.write(`Kaynak indiriliyor: ${url}\n`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Kaynak indirilemedi: HTTP ${response.status}`);
  return (await response.json()) as GeoJson;
}

async function main() {
  const land = prepare(ringsOf(await fetchGeoJson(SOURCE)));

  // Başlangıç ülkesi ayrı bir katman: haritada vurgulanıyor ve rota yayları
  // onun ağırlık merkezinden çıkıyor.
  const countries = await fetchGeoJson(ORIGIN_SOURCE);
  const originFeature = countries.features.find(
    (feature) =>
      feature.properties?.ISO_A3 === ORIGIN_ISO || feature.properties?.ADM0_A3 === ORIGIN_ISO
  );
  if (!originFeature) throw new Error(`Başlangıç ülkesi bulunamadı: ${ORIGIN_ISO}`);

  const origin = prepare(ringsOf({ features: [originFeature] }));
  const [originLon, originLat] = centroidOf(origin.rings);

  const output = `/**
 * ÜRETİLMİŞ DOSYA — elle düzenleme.
 * Yeniden üretmek için: npx tsx scripts/build-landing-map.mts
 *
 * Kaynak : Natural Earth 1:50m (public domain / CC0)
 *          kara  → ${SOURCE}
 *          ülke  → ${ORIGIN_SOURCE}
 * Çerçeve: boylam ${BBOX.lonMin}…${BBOX.lonMax}, enlem ${BBOX.latMin}…${BBOX.latMax}
 * Sadeleştirme: Douglas–Peucker, tolerans ${TOLERANCE}°
 *
 * Değerler [boylam, enlem] — ekrana düşürmeyi route.ts'teki project() yapıyor.
 */

export const LAND_RINGS: [number, number][][] = [
${serialise(land.rings)}
];

/** Başlangıç ülkesinin (${ORIGIN_ISO}) sınırı — haritada vurgulanıyor. */
export const ORIGIN_RINGS: [number, number][][] = [
${serialise(origin.rings)}
];

/**
 * Başlangıç ülkesinin alan ağırlıklı merkezi. Rota yayları buradan çıkıyor:
 * yolculuk bir şehre değil ülkeye bağlı.
 */
export const ORIGIN_CENTROID: [number, number] = [${originLon.toFixed(2)}, ${originLat.toFixed(2)}];
`;

  const here = dirname(fileURLToPath(import.meta.url));
  const target = join(here, "..", "src", "components", "landing", "coastline.ts");
  await writeFile(target, output, "utf8");

  process.stdout.write(
    `✓ kara: ${land.rings.length} parça · ${land.before} → ${land.after} nokta\n` +
      `✓ ${ORIGIN_ISO}: ${origin.rings.length} parça · merkez ` +
      `${originLon.toFixed(2)}, ${originLat.toFixed(2)}\n` +
      `  yazıldı: src/components/landing/coastline.ts\n`
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
