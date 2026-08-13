# Brief — student1 (Eda) · Veri & Güven katmanı

Branch: `student1` · Ortak kurallar: [README.md](README.md)

## Senin sorumluluğun

Beyond'un tek gerçek değeri **güven**. Ürün "%78 kabul edilirsin" demiyor,
"9 zorunlu şartın 7'sini karşılıyorsun" diyor — ve bu cümlenin bir anlamı olması
için arkasındaki verinin doğru olması lazım. Şu an katalogdaki **36 kaydın
hiçbiri kaynağından doğrulanmadı.** Demo Day'de birisi "bu şart gerçekten böyle
mi?" diye sorarsa cevabın olması gerekiyor.

Sen verinin sahibisin: katalog, doğrulama, maliyet/burs bilgisi ve AI'ın
sayfadan veri çıkarma kalitesi.

### Sahip olduğun dosyalar

```
src/data/programs.ts          ⭐ ana iş alanı — 36 kayıt
src/data/taxonomy.ts          ülke, alan, başvuru sistemi tanımları
src/data/options.ts           sınav ölçekleri
src/app/api/extract/route.ts  canlı program çıkarımı (Claude + web_fetch)
src/app/program/[id]/page.tsx program detay ekranı
src/app/compare/page.tsx      karşılaştırma tahtası
scripts/                      (yeni) veri doğrulama betikleri
```

### Dokunmadığın dosyalar

`matching.ts`, `store.tsx`, `results/page.tsx`, `timeline/page.tsx`,
`AssistantPanel.tsx`, `supabase/schema.sql`, `tests/` → **Alp'in.**
İhtiyacın olursa kendin değiştirme, söyle.

`types.ts` ve `dictionary.ts` ortak → **sadece sona ekleme yap**, ayrı commit.

---

## Görevler

### S1-1 · Demo yolundaki programları kaynağından doğrula ⭐ en yüksek değer

`verification: "ai-extracted"` → `"verified"`, ama **sadece gerçekten
doğruladıklarında.** Bu görevde dürüstlük özelliğin kendisi.

Kapsam: demo akışında görünecek **en az 10 program** — ülke çeşitliliği olsun
(NL, DE, GB, FR + 1-2 başka). Demoda gösterilecek programlar mutlaka içinde.

Her kayıt için `sourceUrl`'deki sayfayı aç ve şunları tek tek teyit et:

- `requirements.minGpa` — sayfadaki eşik, 100'lük sisteme çevrilmiş hali
- `requirements.language` — hangi sınav, kaç puan (IELTS 6.5 mi 7.0 mı?)
- `requirements.requiredSubjects` — zorunlu ders ve seviyesi
- `requirements.extras` — numerus fixus / portfolyo / mülakat var mı?
- `tuitionNonEu` — **AB dışı** harç (AB harcıyla karıştırmak en sık hata)
- `deadline` + `applicationSystem` — hangi sistem, hangi tarih
- `sourceUrl` hâlâ yaşıyor mu (404 olan bağlantı rozetten kötü)

Sonra: `verification: "verified"`, `lastChecked: "2026-08-13"` (gerçek tarih).

Kural: **bir alanı teyit edemiyorsan kaydı `ai-extracted` bırak.** Yarım
doğrulanmış kaydı `verified` yapmak, hiç doğrulamamaktan daha kötü.

Bitti ölçütü:
- [ ] ≥10 kayıt `verified`, her birinin `lastChecked`'i güncel
- [ ] Doğrulama sırasında bulunan **her düzeltme** commit mesajında yazılı
      (örn. "TU Delft IELTS 6.0→6.5, kaynak sayfada güncellenmiş")
- [ ] Rozet arayüzde doğru görünüyor (program detay + kart)
- [ ] Bir kaydı bile "kontrol ettim sayılır" diye geçmedin

### S1-2 · Burs verisi

README'nin "sonraki adımlar"ındaki en somut eksik. Türk öğrenci için harç +
yaşam maliyeti yılda 15-25k EUR; burs bilgisi olmadan liste yarım.

1. `types.ts`'e **sona ekle** (ortak dosya, ayrı commit):
   ```ts
   export interface Scholarship {
     name: string;
     /** Yıllık tutar (EUR). Harç muafiyeti ise tuitionNonEu kadar yaz. */
     amountPerYear?: number;
     kind: "tuition-waiver" | "grant" | "merit" | "need-based";
     /** AB dışı öğrenciye açık mı — hedef kitlemiz için kritik. */
     openToNonEu: boolean;
     sourceUrl: string;
     note?: Bilingual;
   }
   ```
   ve `Program`'a `scholarships?: Scholarship[];`

2. Doğruladığın programlara gerçek burs kaydı ekle (uydurma — her birinin
   `sourceUrl`'ü olacak). Bulamadığın programda alanı boş bırak; "burs yok"
   demek ile "bilmiyoruz" demek farklı şeyler.

3. Program detay ekranında maliyet bloğunun altında göster: tutar, AB dışına
   açık mı, kaynak linki. Karşılaştırma tahtasına da bir satır ekle.

Bitti ölçütü:
- [ ] Tip `types.ts` sonuna eklendi, ayrı commit
- [ ] ≥6 programda kaynaklı burs kaydı var
- [ ] Detay + karşılaştırma ekranlarında görünüyor, TR/EN dolu
- [ ] Bursu olmayan program ekranı bozulmuyor (alan opsiyonel)

### S1-3 · Çıkarım çıktısını Program şekline oturt (Alp'e arayüz)

Şu an `/api/extract` sonucu sadece gösteriliyor, kataloğa girmiyor. Kalıcı
kaydetme **Alp'in** işi (`store.tsx`), ama kaydedilecek nesnenin şekli **senin**
sorumluluğun.

1. `/api/extract` tam bir `Program` taslağı döndürsün — zorunlu alanlar dolu,
   `verification: "ai-extracted"`, `lastChecked` bugünün tarihi, `id` çakışmayan
   bir slug.
2. Çıkarılamayan alanı **uydurma**; hangi alanların eksik kaldığını yanıtta
   ayrı bir listede bildir (Alp bunu arayüzde "şu bilgiler eksik" diye gösterecek).
3. Yanıt şeklini `types.ts`'e tip olarak yaz ve **Alp'e haber ver** — bu iki
   kişinin arasındaki sözleşme, tek taraflı değiştirilmez.
4. `ANTHROPIC_API_KEY` yokken demo modu etiketi aynen kalır.

Bitti ölçütü:
- [ ] Yanıt tipi `types.ts`'te tanımlı, Alp'e iletildi
- [ ] 3 farklı gerçek program sayfasında denendi, sonuç `Program` şekline uyuyor
- [ ] Eksik alanlar uydurulmuyor, listeleniyor
- [ ] Anahtar yokken demo modu etiketi görünür

### S1-4 · Veri bekçisi betiği

36 kayıt elle sürdürülüyor; sessiz bozulmayı yakalayan küçük bir betik.
`scripts/check-data.ts` — çalıştır, ihlalleri yaz, ihlal varsa sıfırdan farklı
çık:

- `id` tekrarı yok
- `verified` olan her kaydın `lastChecked`'i var ve gelecekte değil
- `sourceUrl` http(s) ile başlıyor
- `minGpa` 0-100 aralığında, `tuitionNonEu >= 0`
- `deadline` `AA-GG` formatına uyuyor
- `country` / `field` / `applicationSystem` taksonomide tanımlı
- dil şartındaki puan o sınavın ölçeğinde (`options.ts`)

`package.json`'a `"check:data"` betiği ekle. Bir de `beyond/README.md`'deki
"34 program" ifadesini düzelt — gerçek sayı **36**.

Bitti ölçütü:
- [ ] `npm run check:data` geçiyor
- [ ] Kasten bozulan bir kayıtla denendi, betik yakalıyor
- [ ] README'deki program sayısı ve ülke dağılımı doğru

---

## Sıra

`S1-1` → `S1-2` → `S1-3` → `S1-4`. Vaktin biterse S1-4'ü bırak; **S1-1'i asla
bırakma**, demonun güvenilirliği ona bağlı.

---

## Claude Code'a verilecek prompt

```
Beyond projesinde student1 (Eda) olarak çalışıyorum — Veri & Güven katmanı.
Branch: student1. Çalışma dizini: beyond/

Önce oku: docs/README.md, docs/brief-student1.md, beyond/README.md,
beyond/src/lib/types.ts. Next.js 16 / React 19 kullanıyoruz; kod yazmadan önce
node_modules/next/dist/docs/ altındaki ilgili rehbere bak (AGENTS.md'nin dediği
gibi) — eğitim verindeki Next.js API'leri güncel olmayabilir.

SAHİP OLDUĞUM DOSYALAR — sadece bunları değiştir:
  src/data/programs.ts, src/data/taxonomy.ts, src/data/options.ts,
  src/app/api/extract/route.ts, src/app/program/[id]/page.tsx,
  src/app/compare/page.tsx, scripts/

DOKUNMA (Alp'in): matching.ts, store.tsx, persistent-state.ts,
  results/page.tsx, timeline/page.tsx, AssistantPanel.tsx,
  supabase/schema.sql, tests/
ORTAK (src/lib/types.ts, src/lib/i18n/dictionary.ts): sadece ilgili bloğun
  SONUNA ekleme yap, hiçbir satırı taşıma/yeniden biçimlendirme, ve bu
  değişikliği ayrı commit'e koy.

GÖREV: docs/brief-student1.md içindeki S1-1'i yap (demo yolundaki en az 10
programı kaynağından doğrula). Sonraki göreve kendi başına geçme, bana sor.

DEĞİŞTİRİLEMEZ İLKELER:
- Eşleştirme motoruna AI sokma; matching.ts deterministik kalır.
- Kabul olasılığı/yüzde üretme.
- Bir alanı sourceUrl'deki sayfadan teyit edemediysen kaydı ai-extracted
  bırak. Doğrulamadığın kaydı verified yapma — bu en ciddi hata olur.
- Veri uydurma. Emin olamadığın alanı bana sor.
- Kullanıcıya görünen her metin TR ve EN dolu olacak.

ÇALIŞMA BİÇİMİ:
- Her programı sourceUrl'inden gerçekten kontrol et; kontrol ettiğin şeyi ve
  bulduğun farkı bana kısa kısa raporla.
- Değişiklikten önce ilgili dosyayı oku, körlemesine yazma.
- Görev başına bir commit, Türkçe mesaj, "veri:" öneki. git add -A kullanma,
  dosyaları tek tek ekle.
- Bitirince: npm run build ve npm run lint çalıştır, ikisi de temiz olmalı.
- Emin olmadığın yerde tahmin etme, sor.
```
