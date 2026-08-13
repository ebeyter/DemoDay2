# Beyond

Lise öğrencilerinin Avrupa ve İngiltere'deki üniversite programlarını kendi profillerine göre **açıklanabilir** biçimde değerlendirmesini sağlayan iki dilli web uygulaması.

Exposure AI Academy — Demo Day 2 · Alp & Eda

---

## Ne yapıyor

Öğrenci profilini bir dakikada doldurur; uygulama 36 programı satır satır değerlendirir ve üç şey verir:

1. **Dürüst bir eşleşme** — "%78 kabul edilirsin" değil, *"9 zorunlu şartın 7'sini karşılıyorsun, eksiklerin şunlar"*
2. **Eksikleri kapatma planı** — hangi sınav, kaç puan, ne zamana kadar
3. **Tek bir başvuru takvimi** — UCAS, Studielink, uni-assist, Parcoursup, Campus France ayrı ayrı değil, bir arada

Ek olarak: **kaynak takibi** (üniversite sayfası değişince kartta rozet çıkar), senaryo modu (profili bozmadan "ya Almanya deseydim?"), 4 programa kadar karşılaştırma tahtası ve profilini bilen bir soru-cevap paneli.

## Neden bu şekilde tasarlandı

**Kritik yollarda AI yok.** Eşleştirme motoru (`src/lib/matching.ts`) ve kaynak takibi (`src/lib/freshness.ts`) tamamen deterministik TypeScript. Sebep: "neden Zorlayıcı?" ve "bu veri güncel mi?" sorularına satır satır cevap verebilmek. AI tek bir yerde çalışıyor: sonuçları yorumlayan soru-cevap paneli — ve o çalışmasa da ürün ayakta kalıyor.

**Kabul olasılığı verilmiyor.** Avrupa'da kabul çoğunlukla eşik bazlı ve kabul istatistikleri kamuya açık değil. Olasılık uydurmak öğrenciye yardımcı olmaz, ürünün güvenilirliğini de bitirir.

**Her kayıt doğrulama rozeti taşıyor.** Katalogdaki kayıtların tamamı şu an `ai-extracted` (derlenmiş ama kaynağından tek tek doğrulanmamış) ve arayüzde bu açıkça görünüyor. Bir kaydı `verified` yapmadan önce `sourceUrl`'deki sayfadan elle teyit et ve `lastChecked` tarihini güncelle.

---

## Kurulum

```bash
npm install
cp .env.example .env.local   # değerleri doldur (ikisi de isteğe bağlı, aşağıya bak)
npm run dev
```

`http://localhost:3000`

### Anahtarlar olmadan da çalışır

| Anahtar yok | Ne olur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_*` | **Yerel mod** — hesap açılamaz, profil tarayıcıda `localStorage`'da saklanır. Diğer her şey tam çalışır. |
| Bedrock ayarları yok | Sadece **"Sor AI'a"** paneli "demo modu" etiketiyle hazır bir cevap gösterir. Etiket bilinçli olarak görünür — demo modunu canlı AI gibi sunma. Eşleştirme, kaynak takibi, takvim ve karşılaştırma etkilenmez. |

Anahtarları `.env.local`'a ekleyip sunucuyu yeniden başlatmak yeterli; kod değişikliği gerekmiyor.

### Kaynak takibi — katalog üniversite sayfalarıyla senkron kalır

Bu, ürünün "güncel kalma" cevabı ve **AI kullanmıyor.**

```bash
npm run check-sources
```

Her programın kaynak sayfasını indirir, iki şey çıkarır ve `src/data/source-checks.json` dosyasına yazar:

1. **Parmak izi** — sayfanın şartlarla ilgili metninin kararlı hash'i. Bir sonraki taramada değişmişse kartta *"Kaynak sayfa değişti"* rozeti çıkar. Tarih damgaları, çerez metinleri ve gezinme gürültüsü hash'ten önce temizleniyor, yoksa her taramada yalancı alarm üretirdi.
2. **Sayısal sinyaller** — IELTS/TOEFL puanları, para tutarları ve tarihler düzenli ifadeyle çekilir, katalogla karşılaştırılır. Fark varsa detay sayfasında panel açılır: *"Katalogda 11.400 → Sayfada geçen 14.000"*.

**Dedektör katalogu asla kendiliğinden değiştirmez.** Sadece "burada bir fark var, kontrol et" der. Otomatik güncelleme, yanlış okunan bir sayfanın sessizce yanlış veri yazması demek olurdu.

İddia bilinçli olarak zayıf tutuluyor: *"katalogdaki değer sayfada geçmiyor"* diyoruz, *"şart değişti"* demiyoruz — bir sayfada birden fazla program veya sınav türü olabilir. Zayıf ama doğrulanabilir bir iddia, güçlü ama yanlış olabilecek bir iddiadan iyidir.

`src/lib/fetch-page.ts` sayfa indirmeyi yapıyor ve **SSRF koruması** içeriyor: iç ağ ve bulut metadata adresleri (`localhost`, `169.254.169.254`, özel IP blokları) reddediliyor.

### "Sor AI'a" paneli — Amazon Bedrock

Sohbet paneli Bedrock Mantle'ın **OpenAI-uyumlu** uç noktasına düz `fetch` ile konuşuyor (`src/lib/bedrock-chat.ts`). Araya SDK koymadık: yol zaten OpenAI sözleşmesini konuşuyor, SDK sadece bağımlılık eklerdi. Hesabında erişimin olan **herhangi bir** model iş görür — Claude olması gerekmiyor.

| Gereken değişken | Not |
|---|---|
| `BEDROCK_URL` | Tam uç nokta adresi, ör. `https://bedrock-mantle.us-east-1.api.aws/openai/v1/chat/completions` |
| `BEDROCK_API_KEY` | Bedrock API anahtarın |
| `BEDROCK_MODEL_ID` | İsteğe bağlı. Varsayılan `google.gemma-4-31b`. |

**Uç noktanın iki tuzağı var, ikisi de canlı testte yakalandı ve koda işlendi:**
- `max_tokens` reddediliyor — doğru alan `max_completion_tokens`
- `temperature` yalnızca varsayılan değeri kabul ediyor — hiç göndermiyoruz

Boş bırakılırsa panel "demo modu" rozetiyle hazır bir cevap gösterir; uygulamanın geri kalanı etkilenmez.

**Neden sohbet AI gerektiriyor ama katalog senkronu gerektirmiyor:** sohbet serbest metin yorumu yapıyor, senkron ise kalıplı sayı karşılaştırması. İkincisi düzenli ifadeyle daha güvenilir *ve* ücretsiz.

Bu yüzden AI'sız çalışan bir ürün elde ettik: Bedrock ayarları hiç girilmese bile eşleştirme, eksik planı, kaynak takibi, senaryo modu, karşılaştırma ve takvim tam çalışıyor — sadece soru-cevap paneli demo moduna düşüyor.

### Supabase kurulumu

1. supabase.com'da proje aç
2. **SQL Editor** → `supabase/schema.sql` içeriğini yapıştır → Run
3. **Authentication → Providers → Email** → *Confirm email* seçeneğini **kapat**
   (açık kalırsa kayıt sırasında e-posta doğrulama linki beklenir — demoda felaket)
4. **Settings → API** → `Project URL` ve `anon public` anahtarını `.env.local`'a koy

`service_role` anahtarına ihtiyaç yok; gizli kalmalı.

---

## Deploy (Vercel)

1. **Supabase şemasını çalıştır** — `supabase/schema.sql` içeriğini SQL Editor'e yapıştır. Betiğin 6. bölümü `beyond_source_checks` tablosunu ekler; sadece ekleme yapar, mevcut hiçbir şeye dokunmaz.

2. **Ortam değişkenlerini Vercel'e gir** (Settings → Environment Variables). `.env.local` deploy edilmez.

   | Değişken | Zorunlu mu |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | evet |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | evet |
   | `SUPABASE_SERVICE_ROLE_KEY` | otomatik tarama için |
   | `CRON_SECRET` | otomatik tarama için — `openssl rand -hex 32` |
   | `BEDROCK_URL` · `BEDROCK_API_KEY` | "Sor AI'a" paneli için |

3. **Deploy et.** `vercel.json` cron'u tanımlıyor: her gün 04:00 UTC'de `/api/cron/check-sources` çalışır.

İlk tarama referans noktası oluşturur (hiçbir şey "değişti" görünmez). İkinci taramadan itibaren gerçek değişiklikler yakalanmaya başlar.

### Tarama nasıl korunuyor

`/api/cron/check-sources` üç katmanlı: `CRON_SECRET` tanımlı değilse uç nokta tamamen kapalı (503), tanımlıysa `Authorization: Bearer` başlığı zorunlu (401), geçtikten sonra `SUPABASE_SERVICE_ROLE_KEY` aranıyor. Vercel Cron bu başlığı kendiliğinden gönderiyor.

Açık bırakılsaydı herkes 36 üniversite sitesine bizim adımıza istek yağdırabilirdi.

### Tazelik verisi nereden geliyor

İki katman, bu sırayla:

1. **Pakete gömülü JSON** (`npm run check-sources` üretir) — ilk render'da anında hazır, ağ gerektirmiyor
2. **`/api/freshness`** (Supabase) — cron'un yazdığı güncel sonuçlar, yüklenince gömülü veriyi eziyor

Bu sıra bilinçli: Supabase erişilemese, cron hiç kurulmasa veya tablo boş olsa bile rozetler kaybolmuyor — sadece tazeliğini yitiriyor. Tazelik göstergesinin kendisi tek bir servise bağımlı olmamalı.

Yerelde çalışırken cron'a gerek yok; `npm run check-sources` çalıştırıp sonucu commit etmen yeterli.

---

## Proje yapısı

```
src/
  app/
    page.tsx              Landing
    profile/              6 adımlı profil sihirbazı
    results/              Reach/Match/Safety + senaryo modu
    program/[id]/         Şart checklist'i + eksik planı
    gap-plan/             Tüm eksiklerin öncelikli listesi
    compare/              Yan yana karşılaştırma
    timeline/             Başvuru sistemine göre gruplu takvim
    sign-in/              E-posta + şifre
    api/chat/             "Sor AI'a" — Bedrock, akışlı
    api/freshness/        Tarama sonuçlarını arayüze verir
    api/cron/             Günlük otomatik tarama (CRON_SECRET korumalı)
  lib/
    matching.ts           ⭐ Eşleştirme motoru — AI yok, tamamen açıklanabilir
    freshness.ts          ⭐ Kaynak takibi — parmak izi + sayısal fark, AI yok
    freshness-data.ts     Gömülü tarama sonuçlarına erişim
    freshness-context.tsx İki katmanlı tazelik kaynağı (Supabase → JSON yedek)
    fetch-page.ts         Sayfa indirme + metne çevirme (SSRF korumalı)
    bedrock-chat.ts       Bedrock Converse sohbeti (model bağımsız)
    types.ts              Çekirdek tip modeli
    store.tsx             Tek veri katmanı (Supabase ↔ localStorage)
    i18n/                 TR/EN sözlük
  data/
    programs.ts           36 program · 9 ülke × 7 alan
    source-checks.json    Son tarama sonuçları (npm run check-sources üretir)
    taxonomy.ts           Ülke, alan, başvuru sistemi tanımları
    options.ts            Sınav ölçekleri (IELTS, TestDaF, CEFR…)
scripts/
  check-sources.mts       Kaynak sayfa tarayıcısı
```

### Eşleştirme motoru nasıl çalışıyor

İki aşamalı, her adımı arayüzde gösterilebilir:

1. **Kapı** — karşılanmayan zorunlu şartlar işaretlenir (not eşiği, dil barajı, zorunlu ders, YKS)
2. **Bant** — `MATCH` (tüm zorunlu şartlar ✓) · `REACH` (1-2 kapatılabilir eksik) · `SAFETY` (rahatça aşıyor) · `OUT-OF-REACH`

Her şart dört durumdan birini alır: `met` / `close` (az kaldı) / `unmet` / `unknown` (öğrenci bilgiyi girmemiş). `close` ve `unknown` ayrımı önemli — biri motive eder, diğeri eksik veri uyarısıdır.

---

## Demo akışı (~3 dk)

1. **Problem** — landing'deki üç kart: her ülkenin sistemi başka, şartlar programa göre değişiyor, danışmanlık pahalı
2. **Profil** — 60 saniyede doldur. Not ortalamasının 100'lük sisteme anında çevrildiğini göster.
3. **Sonuçlar** — Reach/Match/Safety kartları sırayla belirir
4. **Detay** — bir programa gir: şart şart ✅/❌, her satırda kaynak linki
5. **Eksik planı** — *"IELTS 6.0'ın var, 6.5 lazım — tek sınav tekrarıyla kapanır"*
6. **Senaryo modu** — ülkeyi değiştir, sonuçlar anında güncellenir
7. **Kaynak takibi** — Groningen veya Imperial detayına gir: *"Katalogda 11.400 → Sayfada geçen 14.000"*. Kaynak bağlantısına tıklayıp jüriye canlı doğrula.
8. **Karşılaştırma + takvim** — 3 programı yan yana, sonra kişisel deadline listesi

**İki vurgu anı:**
- **5. adım** — öğrenciyi "olamazsın"dan "şunu yaparsan olursun"a taşıyan yer.
- **7. adım** — kaynak takibi. Jüriye "verimiz güncel kalıyor" demek yerine gösteriyorsun, üstelik tıklayıp doğrulanabiliyor.

Test edilmiş örnek: **IELTS 6.0 → 7.0** tek değişikliği **Uygun bandı 2'den 5 programa** çıkarıyor, Zorlayıcı 10'dan 7'ye iniyor.

Bu sayılar `npm run check-demo` ile ölçülüyor; profil `src/data/demo-profile.ts`
içinde sabit. Katalog değişince sayılar da değişir — **sahnede söylemeden önce
betiği çalıştır.**

### Güvenli bandı boş — ve bu bir hata değil, bulgumuz

İlk sürümde bu cümle *"Güvenli bandı 0'dan 4'e çıkarıyor"* diyordu. Doğrulama
turunda o dört programın **dördünde de** seçme kapısı olduğu ortaya çıktı:

| Program | Katalogda | Kaynak sayfada |
|---|---|---|
| KTH ICT | seçme şartı yok | 2024'te şartları karşılayan 684 adaydan 71'i alınmış (%10) |
| TU/e Makine | seçme şartı yok | *"Admission requires passing a selection procedure"* |
| UvA Ekonomi | seçme şartı yok | numerus fixus, **850 kontenjan**, zorunlu seçme sınavı |
| Groningen Psikoloji | `mandatory: false` | 250 kontenjan, seçme sınavı sıralaması |

Dördü de "Güvenli" olarak gösteriliyordu. **%10 kabul oranı olan bir programa
"rahatça aşıyorsun" demek**, bu ürünün vermemeye söz verdiği yanlış güvenin ta
kendisi. Kapıları ekleyince Güvenli bandı sıfırlandı.

Bunun ürün açısından anlamı şu: **Reach/Match/Safety üçlemesi ABD kabul
sistemine ait ve Avrupa'ya birebir oturmuyor.** Avrupa'da rekabetçi
İngilizce-öğretimli programların çoğu kontenjan sınırlı; eşiği geçmek sıraya
girmek demek, kabul demek değil.

Sahnede kullanılacak cümle bu — rakip araçlar burada bir yüzde gösterir, biz
kontenjan gerçeğini gösteriyoruz.

---

## Bilinen sınırlar

- **Bağlantılar doğrulandı, şartlar doğrulanmadı.** 36 kaydın kaynak bağlantıları tek tek kontrol edildi (35'i 200 dönüyor; Pavia bota 403 veriyor ama tarayıcıda açılıyor). Ancak not eşikleri, dil barajları, harçlar ve son tarihler kaynağından teyit edilmedi — hepsi `ai-extracted` rozetiyle görünüyor. Demo öncesi kullanacağın 5-6 programın **şartlarını** elle doğrulayıp `verification: "verified"` yapmak ürünü ciddi biçimde güçlendirir.
- **Not çevrimi yaklaşıktır.** 4'lük ve IB dönüşümleri genel kabul gören tablolara dayanıyor; üniversiteler kendi tablolarını kullanabilir. Arayüz bunu kullanıcıya söylüyor.
- **Kaydedilen senaryo yok.** Senaryo modu oturum içinde çalışıyor, kaydedilmiyor.
- **Katalog statik.** Yeni program eklemek `src/data/programs.ts` düzenlemeyi gerektiriyor; AI çıkarımı sonucu şu an oturuma kaydedilmiyor, sadece gösteriliyor.

## Sonraki adımlar

- Dedektörün fark bulduğu kayıtları kaynağından doğrulama turu (`verification: "verified"`)
- Burs verisi (özellikle AB-dışı öğrencilere açık olanlar)
- Vize ve oturum izni adımlarının takvime eklenmesi
