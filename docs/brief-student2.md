# Brief — student2 (Alp) · Motor & Akış katmanı

Branch: `student2` · Ortak kurallar: [README.md](README.md)

## Senin sorumluluğun

`matching.ts` bu ürünün kalbi: 634 satır deterministik TypeScript, hiç AI yok,
çünkü "neden Zorlayıcı?" sorusuna satır satır cevap verebilmesi gerekiyor.
Bütün iddia bu dosyanın doğruluğuna dayanıyor — ve **şu an tek bir testi yok.**

Sen motorun, veri katmanının (kaydetme/senaryo) ve akış ekranlarının sahibisin.

### Sahip olduğun dosyalar

```
src/lib/matching.ts            ⭐ eşleştirme motoru
src/lib/store.tsx              tek veri katmanı (Supabase ↔ localStorage)
src/lib/persistent-state.ts
src/app/results/page.tsx       Reach/Match/Safety + senaryo modu
src/app/timeline/page.tsx      başvuru takvimi
src/components/AssistantPanel.tsx
src/app/api/chat/route.ts      profil-bilir asistan (streaming)
supabase/schema.sql
tests/                         (yeni) test altyapısı
```

`src/lib/claude.ts` ve `src/lib/fetch-page.ts` **ortak AI altyapısı** — Eda'nın
`extract`'i de kullanıyor. İmzasını değiştirirsen Eda'ya haber ver.

### Dokunmadığın dosyalar

`src/data/*`, `api/extract/route.ts`, `program/[id]/page.tsx`,
`compare/page.tsx`, `scripts/` → **Eda'nın.**
Veride hata bulursan kendin düzeltme, Eda'ya söyle.

`types.ts` ve `dictionary.ts` ortak → **sadece sona ekleme yap**, ayrı commit.

---

## Görevler

### S2-1 · Motor testleri ⭐ en yüksek değer

Demo Day'de tek bir yanlış bant ("Güvenli" derken aslında zorunlu şart eksik)
ürünün güvenilirliğini bitirir. Bu görev aynı zamanda çatışma riski sıfır —
hepsi yeni dosya.

Altyapı: `vitest` (Next.js/TS ile en az sürtünme). `npm run test`.

Kapsanacak davranışlar — satır kapsamı değil, **karar noktaları**:

- **Bant sınırları:** tüm zorunlu şartlar ✓ → `match`; rahatça aşıyor →
  `safety`; 1-2 kapatılabilir eksik → `reach`; ötesi → `out-of-reach`.
  Her bandın tam sınırında birer vaka yaz (eşiğin 1 altı / tam üstü).
- **`close` vs `unknown` ayrımı:** IELTS 6.0 varken 6.5 isteniyorsa `close`;
  öğrenci hiç dil sınavı girmemişse `unknown`. Bu ikisinin karışması ürünün
  en önemli nüansını bozar — öğrenciyi motive etmekle veri eksiği uyarmak
  arasındaki fark.
- **`unknown` cezalandırılmıyor:** eksik veri, karşılanmamış şart gibi
  davranmıyor.
- **Not çevrimi:** 4'lük, 5'lik ve IB45 → 100'lük dönüşümü; her ölçeğin alt ve
  üst sınırı.
- **Dil şartı `anyOf`:** listedeki sınavlardan biri yeterli; boş dizi = dil
  belgesi istenmiyor (şart üretilmemeli).
- **Bütçe:** `overBudget`, harç + yaşam maliyeti toplamına göre; `maxTuition`
  tanımsızken sınır yok.
- **Zorunlu ders / numerus fixus / YKS** gibi kapı şartlarının bandı düşürmesi.
- **README'deki doğrulanmış senaryo (regresyon testi):** IELTS 6.0 → 7.0 tek
  değişikliği Güvenli bandı **0'dan 4 programa** çıkarıyor, Zorlayıcı 10'dan
  5'e iniyor. Bunu gerçek katalogla test et — demoda söylediğimiz cümle bu,
  kırılırsa haber vermeli.

Bitti ölçütü:
- [ ] `npm run test` geçiyor, ≥25 anlamlı vaka
- [ ] Her bant ve her `CheckStatus` değeri en az bir testte üretiliyor
- [ ] IELTS 6.0→7.0 regresyon testi gerçek katalog verisiyle çalışıyor
- [ ] Test isimleri davranışı anlatıyor ("IELTS 6.0 iken 6.5 isteniyorsa
      close döner"), `test1` gibi değil
- [ ] Bir testi kasten kırdın, gerçekten kırmızı oluyor

### S2-2 · Kaydedilen senaryo

Senaryo modu şu an oturum içinde çalışıyor, kaydedilmiyor. Demoda "ya Almanya
deseydim?" karşılaştırmasını geri çağırabilmek güçlü bir an.

1. `supabase/schema.sql`'e `scenarios` tablosu ekle — RLS ile, kullanıcı sadece
   kendi kayıtlarını görür (mevcut profil tablosundaki deseni izle).
2. `store.tsx`: senaryo kaydet / listele / uygula / sil. **Anahtarsız modda
   `localStorage`'a düşmek zorunlu** — Supabase yoksa da çalışacak.
3. `results/page.tsx`: senaryoyu isimlendirip kaydet, kayıtlıları listeden geri
   yükle. Kaydedilen senaryo **profili bozmuyor** — mevcut davranış korunur.

Bitti ölçütü:
- [ ] Supabase'li ve Supabase'siz modda ikisinde de çalışıyor
- [ ] RLS var; başka kullanıcının senaryosu okunamıyor
- [ ] Senaryo geri yüklenince asıl profil bozulmamış
- [ ] Şema değişikliği `schema.sql`'de, sıfırdan kurulumda çalışıyor
- [ ] TR/EN dolu

### S2-3 · Takvime vize ve oturum izni adımları

Başvuru tarihini kaçırmamak yeterli değil; Türk öğrenci için asıl darboğaz
vize/oturum izni ve çoğu öğrenci bunu geç öğreniyor.

1. Ülke bazlı adımları veri olarak tanımla — **`taxonomy.ts` Eda'nın**, o yüzden
   kendi dosyanda tut (örn. `src/lib/visa-steps.ts`) veya alan gerekiyorsa
   Eda'dan iste.
2. Her adım: başvuru sonrasına göre göreli zamanlama (örn. "kabul mektubundan
   sonra 4-8 hafta"), ülke, kısa açıklama, kaynak linki.
3. `timeline/page.tsx`: başvuru sistemine göre gruplu mevcut görünümü koru,
   vize adımlarını **ayrı ve görsel olarak ayrışan** bir grup olarak ekle.
4. Vize süreleri değişken — kesin tarih verme, aralık ver ve bunu kullanıcıya
   söyle. Ürünün "olasılık uydurmama" ilkesinin aynısı burada da geçerli.

Bitti ölçütü:
- [ ] Kullanıcının sonuç listesindeki ülkeler için vize adımları görünüyor
- [ ] Her adımda kaynak linki var, tarihler aralık olarak sunuluyor
- [ ] Mevcut başvuru takvimi görünümü bozulmamış
- [ ] TR/EN dolu

### S2-4 · Çıkarılan programı kaydetme

> ⚠️ **Bu görev tamamen düşebilir.** Eda `plan-student1.md` Adım 1'de
> `/api/extract`'i kaldırmaya karar verirse kaydedilecek bir çıkarım da kalmaz.
> Ona sormadan başlama.

`/api/extract` listede olmayan bir programın şartlarını canlı çıkarıyor ama
sonuç sadece gösteriliyor, kayboluyor.

**Bağımlılık:** Yanıtın şekli Eda'nın işi (S1-3). Sözleşme tipi `types.ts`'e
yazılmadan başlama — Eda'ya sor. Şekil tek taraflı değiştirilmez.

1. `store.tsx`: çıkarılan programı kullanıcının oturumuna/hesabına kaydet;
   sonuç listesinde katalog programlarıyla birlikte değerlendirilsin.
2. Kaydedilen program **`ai-extracted` rozetini taşımaya devam eder** —
   hatta katalogdan daha az güvenilir olduğu belli olmalı.
3. Eda'nın bildirdiği eksik alanları arayüzde göster: "şu bilgiler
   çıkarılamadı, sonuç bu yüzden eksik olabilir".
4. Eksik zorunlu alanı olan program motoru çökertmemeli — `unknown` üretmeli.

Bitti ölçütü:
- [ ] Çıkarılan program kaydediliyor, sonuçlarda görünüyor
- [ ] Rozet ve eksik alan uyarısı görünür
- [ ] Anahtarsız/demo modunda çökme yok
- [ ] Eksik alanlı programla motor `unknown` üretiyor, hata vermiyor

---

## Sıra

`S2-1` → `S2-2` → `S2-3` → `S2-4`. S2-4 Eda'nın S1-3'üne bağlı, o hazır olmadan
başlama. Vaktin biterse S2-3'ü bırak; **S2-1'i asla bırakma** — test edilmemiş
motor demonun en büyük riski.

---

## Claude Code'a verilecek prompt

```
Beyond projesinde student2 (Alp) olarak çalışıyorum — Motor & Akış katmanı.
Branch: student2. Çalışma dizini: beyond/

Önce oku: docs/README.md, docs/brief-student2.md, beyond/README.md,
beyond/src/lib/types.ts, beyond/src/lib/matching.ts. Next.js 16 / React 19
kullanıyoruz; kod yazmadan önce node_modules/next/dist/docs/ altındaki ilgili
rehbere bak (AGENTS.md'nin dediği gibi) — eğitim verindeki Next.js API'leri
güncel olmayabilir.

SAHİP OLDUĞUM DOSYALAR — sadece bunları değiştir:
  src/lib/matching.ts, src/lib/store.tsx, src/lib/persistent-state.ts,
  src/app/results/page.tsx, src/app/timeline/page.tsx,
  src/components/AssistantPanel.tsx, supabase/schema.sql, tests/

DOKUNMA (Eda'nın): src/data/*, api/extract/route.ts,
  app/program/[id]/page.tsx, app/compare/page.tsx, scripts/
ORTAK (src/lib/types.ts, src/lib/i18n/dictionary.ts): sadece ilgili bloğun
  SONUNA ekleme yap, hiçbir satırı taşıma/yeniden biçimlendirme, ve bu
  değişikliği ayrı commit'e koy.

GÖREV: docs/brief-student2.md içindeki S2-1'i yap (vitest kur + eşleştirme
motoru testleri). Sonraki göreve kendi başına geçme, bana sor.

DEĞİŞTİRİLEMEZ İLKELER:
- matching.ts deterministik kalır; AI çağrısı, rastgelelik, tarih bağımlılığı
  sokma.
- Kabul olasılığı/yüzde üretme; fitScore sıralama içindir.
- Test motorun mevcut davranışını DOĞRULAMAK için. Test geçsin diye motorun
  mantığını değiştirme — bir uyuşmazlık bulursan bunu bana bildir, önce
  davranışın hangisi doğru olduğuna karar verelim.
- Kullanıcıya görünen her metin TR ve EN dolu olacak.
- Anahtarsız mod çalışmaya devam edecek (Supabase/ANTHROPIC_API_KEY yokken).

ÇALIŞMA BİÇİMİ:
- Önce matching.ts'i baştan sona oku, sonra test yaz. Ne yaptığını varsayma.
- Testler davranış adıyla isimlendirilecek, test1/test2 değil.
- Görev başına bir commit, Türkçe mesaj, "test:" / "motor:" öneki.
  git add -A kullanma, dosyaları tek tek ekle.
- Bitirince: npm run test, npm run build, npm run lint — üçü de temiz olmalı.
- Testlerin gerçekten bir şey yakaladığını göster: bir testi kasten kır,
  kırmızı olduğunu doğrula, geri al.
- Emin olmadığın yerde tahmin etme, sor.
```
