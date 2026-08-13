# student1 (Eda) — adım adım plan

Branch: `student1` · Brief: [brief-student1.md](brief-student1.md) · Kurallar: [README.md](README.md)

Bu plan **13 Ağustos 2026 akşamı** çekilmiş gerçek depo durumuna göre yazıldı.
Sırayla git; her adımın sonunda "bitti mi?" kutusu var, onu geçmeden sonraki
adıma başlama.

## Şu an neredeyiz

| | Durum |
|---|---|
| Uygulama çalışıyor mu | ✅ Evet — `beyond/` içinde `npm run dev`, `npm run build` temiz |
| Kaynak takibi (freshness) | ✅ Yazılmış, çalışıyor — **ama commit'lenmemiş** |
| Bedrock sohbeti | ✅ Yazılmış — **ama commit'lenmemiş** |
| 36 kaydın şart doğrulaması | ❌ Hiç başlanmadı — hepsi `ai-extracted` |
| Burs verisi | ❌ Yok |
| Veri bekçisi betiği | ❌ Yok |
| Alp'in görebildiği kod | ⚠️ Sadece `base` commit'i — son 6 saatlik işin hiçbiri |

---

## Adım 0 · Çalışmayı kurtar ve paylaş — **ilk iş, ~20 dk**

Neden ilk: şu anda kaynak takibi özelliğinin tamamı tek bir kopyada, diskte
duruyor. Yanlış bir `git checkout`, dolu disk ya da kapanan bir editör bunu
götürür. Ayrıca Alp `base` commit'ini görüyor; senin yaptığın hiçbir şeyi
göremediği için üstüne çalışamıyor.

Tek dev commit atma — beş mantıklı parçaya böl. Böylece bir şey ters giderse
sadece o parçayı geri alırsın.

```bash
cd beyond

# 1) ortam dosyası düzeni
git add .gitignore .env.example
git commit -m "kurulum: .env.example depoya girsin, gerçek anahtarlar girmesin"

# 2) ORTAK DOSYA — kendi commit'inde (docs/README.md kuralı)
git add src/lib/i18n/dictionary.ts
git commit -m "i18n: kaynak takibi metinleri (TR/EN)"

# 3) kaynak takibi çekirdeği
git add src/lib/freshness.ts src/lib/freshness-data.ts src/lib/fetch-page.ts \
        src/data/source-checks.json scripts/check-sources.mts \
        package.json package-lock.json
git commit -m "veri: kaynak takibi — parmak izi + sayısal fark dedektörü, AI yok"

# 4) kaynak takibinin arayüzü
git add src/components/FreshnessBadge.tsx src/components/ProgramCard.tsx \
        'src/app/program/[id]/page.tsx'
git commit -m "ui: kaynak değişti rozeti ve fark paneli"

# 5) Bedrock sohbeti
git add src/lib/bedrock-chat.ts src/lib/claude.ts src/app/api/chat/route.ts \
        src/app/api/extract/route.ts
git commit -m "ai: sohbet Bedrock Converse'e taşındı"

# 6) README
git add README.md
git commit -m "doküman: kaynak takibi, Bedrock kurulumu ve demo akışı"
```

Sonra `main`'e taşı — bu iş ikinizin ortak temeli, senin branch'inde beklememeli:

```bash
git push origin student1
gh pr create --base main --head student1 \
  --title "Kaynak takibi + Bedrock sohbeti" \
  --body "Kaynak sayfa dedektörü (AI yok), Bedrock Converse sohbeti, rozet arayüzü."
```

PR birleşince Alp kendi branch'ini güncelleyebilir. Ona haber ver: **`fetch-page.ts`
ve `dictionary.ts` değişti.**

**Bitti mi?**
- [ ] `git status` temiz (takip edilmeyen dosya kalmadı)
- [ ] `.env.local` commit'lenmedi (`git log --stat | grep env.local` boş dönüyor)
- [ ] `npm run build` hâlâ temiz
- [ ] PR açıldı, Alp haberdar

---

## Adım 1 · `/api/extract` kararı — ✅ **KARAR VERİLDİ: B (kaldır)**

> **Sonuç:** `3f8105b temizlik: "Üniversite ekle" sekmesi ve Anthropic
> bağımlılıkları kaldırıldı` — `/api/extract` rotası (231 satır),
> `src/lib/claude.ts` (107 satır), `AssistantPanel`'deki sekme çubuğu ve
> `@anthropic-ai/sdk` · `@anthropic-ai/bedrock-sdk` ·
> `@aws-sdk/client-bedrock-runtime` bağımlılıkları silindi. Bağımlılıklar beşe
> indi: Supabase (2), Next, React, React-DOM.
>
> Aşağıdaki tabloda tahmin edilenden daha güçlü bir gerekçe çıktı: sorun sadece
> "iki sağlayıcı" değildi — hesapta hiçbir Anthropic modeline erişim yok (hepsi
> 403). Yani sekme jüriye demoda değil, **deploy edilen üründe her zaman** demo
> modu gösterecekti.
>
> **Zinciri:** bu karar `brief-student1.md` S1-3'ü ve `brief-student2.md`
> S2-4'ü düşürdü. İkisi de düşmüş olarak işaretlendi.

Neden şimdi: burada tutarsız bir durum var ve büyümesine izin vermek istemezsin.

Ne buldum:
- `README.md` artık **"AI tek bir yerde çalışıyor: soru-cevap paneli"** diyor ve
  proje yapısı listesinde `api/extract/` yok.
- Ama `src/app/api/extract/route.ts` **duruyor** ve `AssistantPanel.tsx:199`
  onu gerçekten çağırıyor — yani kullanıcının erişebildiği canlı bir yol.
- Dahası: sohbet **Bedrock**'a taşındı, extract ise hâlâ `src/lib/claude.ts`
  üzerinden **Anthropic API**'ye gidiyor. Yani projede iki ayrı AI sağlayıcısı,
  iki ayrı anahtar seti, iki ayrı kırılma noktası var.

Demo Day'de bu şöyle patlar: jüri panelde "listede olmayan program" düğmesine
basar, `ANTHROPIC_API_KEY` tanımlı değildir, hata döner.

İki seçenek — **ben ikincisini öneriyorum**:

| Seçenek | Ne gerektirir | Ne zaman doğru |
|---|---|---|
| **A. Bedrock'a taşı** | `extract`'i `bedrock-chat.ts` üzerinden çalıştır, `claude.ts`'i sil, README'ye geri ekle | Canlı çıkarım demoda **gösterilecekse** |
| **B. Kaldır** ⭐ | `api/extract/`, `claude.ts`, `AssistantPanel`'deki çağrı ve `@anthropic-ai/*` bağımlılıkları silinir | Demo akışının 8 adımında yoksa |

B'yi öneriyorum çünkü README'de yazdığın demo akışının 8 adımında canlı çıkarım
artık geçmiyor; yerini kaynak takibi almış. Sahnede kullanılmayacak bir AI yolu
sadece risk ve bakım yükü. Sildiğinde `.env.local` da tek sağlayıcıya iner,
kurulum anlatımı sadeleşir.

Karar senin — ama **kararsız bırakma.** Hangisini seçersen README ile kod aynı
şeyi söylemeli.

**Bitti mi?**
- [x] Karar verildi ve uygulandı — `3f8105b`
- [x] `grep -rn "api/extract" src/` sonucu koddaki gerçeği yansıtıyor — boş dönüyor
- [x] README'nin "AI nerede çalışıyor" cümlesi doğru — `beyond/README.md:21`
      "AI tek bir yerde çalışıyor: sonuçları yorumlayan soru-cevap paneli"
- [ ] `npm run build` temiz, panel elle denendi — **panel elle denenmedi**,
      kaldırma commit'i sonrası sekmesiz panel tarayıcıda açılıp görülmeli

---

## Adım 2 · Şart doğrulama turu — **en büyük iş, 2-4 saat · ⭐ en yüksek değer**

Bu, ürünün tek gerçek iddiasının arkasını doldurduğun yer. 36 kaydın
**bağlantıları** doğrulanmış, **şartları** doğrulanmamış. Demo Day'de biri
"bu IELTS 6.5 gerçekten doğru mu?" diye sorarsa cevabın olması gerekiyor.

### 2a. Dedektörü çalıştır ve listeyi ondan al (~15 dk)

Elle 36 kayda bakma — dedektör sana hangi kayıtların şüpheli olduğunu
söylüyor. Bu, kaynak takibini yazmanın **asıl karşılığı**:

```bash
npm run check-sources
```

`src/data/source-checks.json` içinde katalogla sayfa arasında sayısal fark
bulunan kayıtlara bak. Doğrulama sıranı bu belirler:

1. **Dedektörün fark bulduğu kayıtlar** — muhtemelen gerçekten yanlış
2. **Demoda göstereceğin 6-8 program** — Groningen, Imperial ve akışta
   gezdiğin diğerleri
3. Kalanlar (vakit kalırsa)

### 2b. Her kayıt için tek tek teyit et (~15-20 dk/kayıt)

`sourceUrl`'ü aç ve şu yedi alanı sayfadan gör:

| Alan | Dikkat |
|---|---|
| `requirements.minGpa` | 100'lük sisteme çevrilmiş hali mi? |
| `requirements.language` | IELTS 6.5 mi 7.0 mı — alt puan şartı var mı? |
| `requirements.requiredSubjects` | ders + seviye (`basic`/`advanced`) |
| `requirements.extras` | numerus fixus / portfolyo / mülakat |
| `tuitionNonEu` | **AB dışı** harç — en sık yapılan hata AB harcını yazmak |
| `deadline` + `applicationSystem` | hangi sistem, hangi tarih |
| `sourceUrl` | sayfa hâlâ yaşıyor mu |

Sonra kaydı güncelle:

```ts
lastChecked: "2026-08-13",        // gerçekten baktığın tarih
verification: "verified",
```

**Altın kural:** yedi alandan birini bile sayfada bulamadıysan
`verification: "ai-extracted"` olarak **bırak**. Yarım doğrulanmış kaydı
`verified` yapmak, hiç doğrulamamaktan daha kötü — çünkü rozet artık yalan
söylüyor ve ürünün tek değeri o rozetin dürüstlüğü.

### 2c. Commit'le (~10 dk)

Her ülke grubunu ayrı commit'le, düzelttiğin şeyi mesaja yaz:

```bash
git commit -m "veri: NL programları şartlarından doğrulandı

- TU Delft IELTS 6.0 -> 6.5 (sayfa güncellenmiş)
- Groningen tuitionNonEu 11.400 -> 14.000 (dedektörün bulduğu fark teyit edildi)
- Amsterdam UvA: numerus fixus eklendi"
```

**Bitti mi?**
- [ ] Dedektörün fark bulduğu **her** kayda bakıldı
- [ ] Demo akışındaki programların hepsi `verified`
- [ ] En az 10 kayıt `verified`, hepsinin `lastChecked`'i bugünün tarihi
- [ ] Bulduğun her düzeltme commit mesajında yazılı
- [ ] Arayüzde rozet doğru görünüyor (`/results` ve bir program detayı)
- [ ] Hiçbir kaydı "bakmış sayılırım" diye geçmedin

---

## Adım 3 · Burs verisi — **2-3 saat**

Türk öğrenci için harç + yaşam maliyeti yılda 15-25k EUR. Burs bilgisi olmadan
liste, öğrencinin gerçekten cevaplamak istediği soruyu cevaplamıyor.

1. **Tip** — `src/lib/types.ts`'in **sonuna** ekle, **ayrı commit** (ortak dosya):

```ts
export interface Scholarship {
  name: string;
  /** Yıllık tutar (EUR). Harç muafiyetiyse tuitionNonEu kadar yaz. */
  amountPerYear?: number;
  kind: "tuition-waiver" | "grant" | "merit" | "need-based";
  /** AB dışı öğrenciye açık mı — hedef kitlemiz için kritik olan alan. */
  openToNonEu: boolean;
  sourceUrl: string;
  note?: Bilingual;
}
```

`Program`'a: `scholarships?: Scholarship[];`

2. **Veri** — Adım 2'de doğruladığın programlara gerçek burs kaydı ekle. Her
   birinin `sourceUrl`'ü olacak. **Bulamadığın programda alanı boş bırak** —
   "burs yok" demekle "bilmiyoruz" demek farklı şeyler, ve biz uydurmuyoruz.

3. **Arayüz** — program detayında maliyet bloğunun altına, karşılaştırma
   tahtasına bir satır. TR/EN dolu.

**Bitti mi?**
- [ ] Tip `types.ts` sonunda, ayrı commit'te
- [ ] ≥6 programda kaynaklı burs kaydı
- [ ] Detay + karşılaştırma ekranlarında görünüyor
- [ ] Bursu olmayan program ekranı bozulmuyor (alan opsiyonel)
- [ ] TR/EN dolu, `npm run build` temiz

---

## Adım 4 · Veri bekçisi betiği — **~1 saat**

`check-sources` sayfa ile katalogu karşılaştırıyor. Bu betik **katalogun kendi
iç tutarlılığını** kontrol eder — farklı iş, ikisi birbirini tamamlıyor.

`scripts/check-data.mts` (mevcut `check-sources.mts` ile aynı desen):

- `id` tekrarı yok
- `verified` olan her kaydın `lastChecked`'i var ve **gelecek tarih değil**
- `sourceUrl` `http(s)://` ile başlıyor
- `minGpa` 0-100, `tuitionNonEu >= 0`
- `deadline` `AA-GG` formatında
- `country` / `field` / `applicationSystem` `taxonomy.ts`'te tanımlı
- dil puanı o sınavın ölçeğinde (`options.ts`)
- burs varsa `sourceUrl` dolu

`package.json`: `"check-data": "tsx scripts/check-data.mts"`

**Bitti mi?**
- [ ] `npm run check-data` geçiyor
- [ ] Bir kaydı kasten bozdun, betik yakaladı, geri aldın
- [ ] İhlal varsa çıkış kodu sıfırdan farklı

---

## Adım 5 · Demo provası — **son gün, ~1 saat**

Kod yazma günü değil. README'deki 8 adımlı akışı **baştan sona, yüksek sesle**
prova et.

- Boş `.env.local` ile bir tur at — Bedrock'suz her şey çalışıyor mu, demo modu
  etiketi görünüyor mu?
- 7. adım (kaynak takibi) çalışıyor mu — rozet gerçekten çıkıyor mu, fark
  paneli gerçek bir sayı gösteriyor mu?
- IELTS 6.0 → 7.0 senaryosu README'deki sayıları veriyor mu (Güvenli 0→4,
  Zorlayıcı 10→5)? Vermiyorsa **README'yi düzelt**, sahnede yanlış sayı söyleme.
- `localhost:3000` boş mu? Smart Receipt sunucusu açıksa Beyond 3001'e kayar ve
  yanlış uygulamayı açarsın.

---

## Sıra ve öncelik

```
Adım 0  ██████  şimdi, ertelenmez
Adım 1  ██      karar 5 dk, uygulama 30 dk
Adım 2  ██████████████████  ⭐ demonun güvenilirliği burada
Adım 3  ████████
Adım 4  ███     vakit kalmazsa atla
Adım 5  ███     son gün, atlanmaz
```

Vaktin daralırsa **Adım 4'ü at, Adım 2'yi kısalt ama atlama** — 10 kayıt yerine
6 kayıt doğrula, demoda gezdiklerinin hepsi `verified` olsun. Rozeti dürüst
tutan bir katalog, doğrulanmamış 36 kayıttan iyidir.

## Her adımda geçerli

- Commit mesajı Türkçe, önekli: `veri:` `ui:` `ai:` `doküman:` `kurulum:`
- `git add -A` **kullanma** — dosyaları tek tek ekle
- `types.ts` ve `dictionary.ts` → sadece sona ekle, ayrı commit, Alp'e haber ver
- Bitirmeden önce: `npm run build` + `npm run lint` temiz
- `beyond/` içinde çalış; komutları depo kökünde çalıştırırsan `ENOENT` alırsın
