# Beyond

Lise öğrencilerinin Avrupa ve İngiltere'deki üniversite programlarını kendi profillerine göre **açıklanabilir** biçimde değerlendirmesini sağlayan iki dilli web uygulaması.

Exposure AI Academy — Demo Day 2 · Alp & Eda

---

## Ne yapıyor

Öğrenci profilini bir dakikada doldurur; uygulama 34 programı satır satır değerlendirir ve üç şey verir:

1. **Dürüst bir eşleşme** — "%78 kabul edilirsin" değil, *"9 zorunlu şartın 7'sini karşılıyorsun, eksiklerin şunlar"*
2. **Eksikleri kapatma planı** — hangi sınav, kaç puan, ne zamana kadar
3. **Tek bir başvuru takvimi** — UCAS, Studielink, uni-assist, Parcoursup, Campus France ayrı ayrı değil, bir arada

Ek olarak: senaryo modu (profili bozmadan "ya Almanya deseydim?"), 4 programa kadar karşılaştırma tahtası, ve listede olmayan bir programın şartlarını sayfasından canlı çıkaran AI paneli.

## Neden bu şekilde tasarlandı

**Eşleştirme motorunda AI yok.** `src/lib/matching.ts` tamamen deterministik TypeScript. Sebep: "neden Zorlayıcı?" sorusuna satır satır cevap verebilmek. AI sadece iki yerde çalışıyor — sayfadan veri çıkarımı ve sonuçları yorumlayan asistan.

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
| `ANTHROPIC_API_KEY` | AI paneli **"demo modu"** etiketiyle hazır bir örnek sonuç gösterir. Etiket bilinçli olarak görünür — demo modunu canlı AI gibi sunma. |

Anahtarları `.env.local`'a ekleyip sunucuyu yeniden başlatmak yeterli; kod değişikliği gerekmiyor.

### Supabase kurulumu

1. supabase.com'da proje aç
2. **SQL Editor** → `supabase/schema.sql` içeriğini yapıştır → Run
3. **Authentication → Providers → Email** → *Confirm email* seçeneğini **kapat**
   (açık kalırsa kayıt sırasında e-posta doğrulama linki beklenir — demoda felaket)
4. **Settings → API** → `Project URL` ve `anon public` anahtarını `.env.local`'a koy

`service_role` anahtarına ihtiyaç yok; gizli kalmalı.

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
    api/extract/          Canlı program çıkarımı (Claude + web_fetch)
    api/chat/             Profil-bilir asistan (streaming)
  lib/
    matching.ts           ⭐ Eşleştirme motoru — AI yok, tamamen açıklanabilir
    types.ts              Çekirdek tip modeli
    store.tsx             Tek veri katmanı (Supabase ↔ localStorage)
    i18n/                 TR/EN sözlük
  data/
    programs.ts           34 program · 9 ülke × 7 alan
    taxonomy.ts           Ülke, alan, başvuru sistemi tanımları
    options.ts            Sınav ölçekleri (IELTS, TestDaF, CEFR…)
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
7. **Karşılaştırma + takvim** — 3 programı yan yana, sonra kişisel deadline listesi

**Vurgu anı:** 5. adım. Öğrenciyi "olamazsın"dan "şunu yaparsan olursun"a taşıyan yer orası.

Test edilmiş örnek: **IELTS 6.0 → 7.0** tek değişikliği Güvenli bandı **0'dan 4 programa** çıkarıyor, Zorlayıcı 10'dan 5'e iniyor.

---

## Bilinen sınırlar

- **Veri doğrulanmamış.** 34 kaydın hiçbiri kaynağından teyit edilmedi. Demo öncesi kullanacağın 5-6 programı elle doğrulayıp `verification: "verified"` yapmak ürünü ciddi biçimde güçlendirir.
- **Not çevrimi yaklaşıktır.** 4'lük ve IB dönüşümleri genel kabul gören tablolara dayanıyor; üniversiteler kendi tablolarını kullanabilir. Arayüz bunu kullanıcıya söylüyor.
- **Kaydedilen senaryo yok.** Senaryo modu oturum içinde çalışıyor, kaydedilmiyor.
- **Katalog statik.** Yeni program eklemek `src/data/programs.ts` düzenlemeyi gerektiriyor; AI çıkarımı sonucu şu an oturuma kaydedilmiyor, sadece gösteriliyor.

## Sonraki adımlar

- Katalogdaki kayıtları kaynağından doğrulama turu
- AI ile çıkarılan programın kataloğa kalıcı eklenmesi
- Burs verisi (özellikle AB-dışı öğrencilere açık olanlar)
- Vize ve oturum izni adımlarının takvime eklenmesi
