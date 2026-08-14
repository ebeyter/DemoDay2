import { ImageResponse } from "next/og";

/**
 * Bağlantı önizleme görseli — WhatsApp, Instagram, X, LinkedIn.
 *
 * NEDEN ÜRETİLİYOR, DOSYA DEĞİL: statik bir PNG koysaydık marka metni her
 * değiştiğinde birinin görseli yeniden çizmesi gerekirdi ve o adım her
 * seferinde atlanırdı. Burada metin kodun içinde; başlık değişince kart da
 * değişiyor.
 *
 * Görselsiz bir kart WhatsApp'ta tek satır gri metin olarak düşüyordu —
 * paylaşan kişi için "bu ne ki" izlenimi. Kart artık ürünün ne yaptığını
 * açmadan önce söylüyor.
 *
 * Satori (ImageResponse motoru) CSS'in tamamını desteklemiyor: flex zorunlu,
 * `gap` yok, gradient sınırlı. Bu yüzden yerleşim bilinçli olarak sade.
 */
export const runtime = "edge";
export const alt = "Beyond — Kendine en uygun üniversiteyi bul";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// globals.css'teki koyu tema tokenlarıyla aynı — kart siteyle aynı dili konuşsun.
const CANVAS = "#0d0d14";
const INK = "#ececf4";
const INK_SOFT = "#adadc1";
const ACCENT = "#a5b4fc";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CANVAS,
          padding: "72px 80px",
        }}
      >
        {/* Marka */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: CANVAS,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div
            style={{
              marginLeft: 16,
              color: INK,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Beyond
          </div>
        </div>

        {/* Vaat — sitedeki hero'nun aynısı, iki ekran aynı cümleyi kursun. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: ACCENT,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.12em",
            }}
          >
            TÜRKİYE&apos;DEN AVRUPA&apos;YA
          </div>
          <div
            style={{
              marginTop: 20,
              color: INK,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Kendine en uygun</span>
            <span>üniversiteyi bul.</span>
          </div>
          <div
            style={{
              marginTop: 24,
              color: INK_SOFT,
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 880,
            }}
          >
            Tahmin etmiyoruz — hangi şartı karşıladığını şart şart, kaynağıyla
            gösteriyoruz.
          </div>
        </div>

        {/* Somut ölçü: katalog büyüdükçe elle güncellenmesi gereken tek yer.
            Sayı yazmamak da olurdu ama "9 ülke" ürünün kapsamını tek bakışta
            veriyor ve kartın altını boş bırakmıyor. */}
        <div style={{ display: "flex", color: INK_SOFT, fontSize: 24 }}>
          <span style={{ color: INK, fontWeight: 600 }}>9 ülke</span>
          <span style={{ margin: "0 12px" }}>·</span>
          <span>UCAS, Studielink, uni-assist, Parcoursup tek takvimde</span>
        </div>
      </div>
    ),
    size
  );
}
