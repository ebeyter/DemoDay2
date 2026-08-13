# student1 · Adım 2-3-4 iş listesi

[plan-student1.md](plan-student1.md)'in devamı. Buradaki her şey **13 Ağustos 2026,
`e61283b`** commit'indeki gerçek veriden çıkarıldı — `source-checks.json` ve
`programs.ts` okunarak. Tahmin yok, isim isim liste var.

---

## ⚠️ Başlamadan önce: doğrulama turunu bloke eden bir şey var

Adım 2'yi planladığım gibi başlatamazsın. Sebep:

**36 `sourceUrl`'ün 21'i programa özel değil.** 7'si doğrudan üniversite/fakülte
ana sayfası, 14'ü "tüm lisans programları" liste sayfası. Bunlardan bir programın
not eşiğini, dil barajını veya harcını **doğrulamak mümkün değil** — sayfada o
bilgi yok.

Bu üç şeyi aynı anda bozuyor:

1. **Demo 4. adımı çöker.** README'de *"bir programa gir: şart şart ✅/❌, her
   satırda kaynak linki"* yazıyor. Jüri RWTH'nin kaynak linkine tıklarsa
   `rwth-aachen.de/` ana sayfasına düşer. Tek tıkla görünen bir zafiyet ve
   ürünün tek iddiası tam olarak bu linkin arkasında.
2. **Demo 7. adımı gürültü üretiyor.** Dedektör liste sayfasını tarayınca
   sayfadaki *başka* programların sayılarını yakalıyor. Imperial için bulduğu
   `5000, 10050, 15000, 45500, 70000` beş ayrı ücret kalemi — gerçek bir fark
   değil, liste sayfası artefaktı.
3. **Doğrulama fiziken imkânsız.** Ana sayfada `minGpa` yazmıyor.

Muhtemelen bağlantı doğrulama turunda ölü derin linkler, 200 dönen genel
sayfalarla değiştirildi. Yeşil onay geldi ama doğrulanabilirlik gitti — klasik
yalancı yeşil. Bu yüzden Adım 2, **2a** ile başlıyor.

---

## Adım 2a · Derin linkleri geri getir — ~1,5-2 saat

Her kayıt için o programın **kendi** sayfasını bul: şartların, harcın ve son
tarihin yazdığı sayfa. Genelde `.../bachelor/<program-adı>` biçiminde.

`programs.ts`'te `sourceUrl`'ü güncelle. `facultyUrl` fakülte ana sayfası olarak
kalabilir — ikisinin işi farklı.

### A grubu · Üniversite/fakülte kökü — 7 kayıt, kesin yetersiz

| id | şu anki link |
|---|---|
| `de-rwth-mechanical` | `rwth-aachen.de/` |
| `de-heidelberg-medicine` | `medizinische-fakultaet-hd.uni-heidelberg.de/` |
| `fr-sorbonne-informatique` | `sciences.sorbonne-universite.fr/` |
| `ch-hsg-business` | `unisg.ch/en/` |
| `se-lund-ib` | `lusem.lu.se/study` |
| `be-ghent-engineering` | `studiekiezer.ugent.be/en` |
| `it-pavia-medicine` | `portale.unipv.it/en` |

### B grubu · Liste sayfası — 14 kayıt

| id | şu anki link |
|---|---|
| `nl-tudelft-cse` | `tudelft.nl/en/education/programmes/bachelors` |
| `nl-erasmus-iba` | `eur.nl/en/education` |
| `nl-utrecht-chemistry` | `uu.nl/en/bachelors` |
| `de-mannheim-business` | `uni-mannheim.de/en/academics/programs/` |
| `gb-lse-economics` | `lse.ac.uk/study-at-lse/Undergraduate` |
| `gb-manchester-business` | `manchester.ac.uk/study/undergraduate/courses/` |
| `ch-ethz-cs` | `inf.ethz.ch/studies/bachelor.html` |
| `se-kth-ict` | `kth.se/en/studies/bachelor` |
| `se-uppsala-biology` | `uu.se/en/study/programme` |
| `be-kuleuven-business` | `onderwijsaanbod.kuleuven.be/opleidingen/e/` |
| `be-ulb-psychology` | `ulb.be/en/programme` |
| `dk-dtu-general-engineering` | `dtu.dk/english/education` |
| `dk-cbs-ib` | `cbs.dk/en/study/bachelor` |
| `it-polimi-cse` | `polimi.it/en/programmes` |

### C grubu · Programa özel görünüyor — 15 kayıt, nokta kontrolü yeter

`nl-tue-mechanical` · `nl-groningen-psychology` · `de-tum-informatics` ·
`de-heidelberg-physics` · `gb-imperial-computing` · `gb-cambridge-engineering` ·
`gb-ucl-psychology` · `fr-polytechnique-bachelor` · `fr-sciencespo-economics` ·
`fr-parissaclay-math` · `ch-epfl-communication` · `dk-ku-machine-learning` ·
`it-bocconi-bief` · `it-bologna-medicine` · `nl-uva-economics`

> Bu grubu URL şekline bakarak ayırdım, sayfaları açmadım. En az bir tanesi
> yanlış sınıflanmış: **`nl-uva-economics`** → `bachelor-s-programmes.html`,
> yani aslında liste sayfası. Diğerlerini de bir tıklayıp gör.

### 2a bitti mi?

- [ ] A grubunun 7'si programa özel linke çevrildi
- [ ] B grubunun 14'ü çevrildi (bulunamayan varsa aşağıya bak)
- [ ] `nl-uva-economics` düzeltildi
- [ ] `npm run check-sources` yeniden çalıştırıldı
- [ ] Fark sayısı **düştü** — düşmediyse link hâlâ yanlış sayfada
- [ ] Commit: `veri: kaynak linkleri programa özel sayfalara çevrildi`

**Program sayfası gerçekten bulunamıyorsa** (bazı Belçika/İtalya siteleri
İngilizce derin link vermiyor): kaydı katalogdan çıkarmayı düşün. 30 kaynağı
doğrulanabilir program, 36 kaynağı şüpheli programdan iyidir — ve demoda
"kataloğa aldığımız her programın şartları sayfasından okunabiliyor" diyebilmek
güçlü bir cümle.

---

## Adım 2b · Şart doğrulama — dedektörün listesiyle

`check-sources` şu an **7 kayıtta fark**, **1 kayıtta erişim sorunu** buldu.
2a'dan sonra bu liste değişecek; aşağıdaki tablo mevcut durumun fotoğrafı.

| id | alan | katalog | sayfada bulunan | benim okumam |
|---|---|---|---|---|
| `nl-groningen-psychology` | tuition | 11.400 | 2.694 · **14.000** | ⚠️ **Muhtemelen gerçek.** Link programa özel; 2.694 AB harcı (katalogda 2.601), 14.000 AB-dışı olabilir |
| `gb-ucl-psychology` | deadline | 01-14 | **01-13** | ⚠️ **Muhtemelen gerçek.** UCAS son tarihi yıla göre kayıyor, tek günlük fark tipik |
| `dk-ku-machine-learning` | deadline | 01-15 | 03-15 · 07-05 | ⚠️ **Kontrol et.** DK'da AB-dışı ve AB son tarihleri ayrı; 15 Mart AB tarihi olabilir |
| `gb-imperial-computing` | tuition | 51.000 | 5.000 · 10.050 · 15.000 · 45.500 · 70.000 | ❓ Beş kalem = sayfa birden fazla ücret listeliyor. 45.500 gerçek olabilir |
| `nl-erasmus-iba` | deadline | 01-15 | 10-03 · 11-21 | 🔇 Link `eur.nl/en/education` — **gürültü**, 2a'dan sonra tekrar bak |
| `de-mannheim-business` | tuition | 3.000 | 8.500 · 32.000 | 🔇 Link liste sayfası — **gürültü** |
| `dk-cbs-ib` | deadline | 01-15 | 01-29 · 02-24 | 🔇 Link liste sayfası — **gürültü** |
| `it-pavia-medicine` | — | — | 403 | Cloudflare bota kapalı. Tarayıcıda elle doğrula, `unreachable` kalması normal |

**"Benim okumam" bir tahmin, kanıt değil** — sayfaları açmadım, sadece linkin
programa özel olup olmadığına bakarak sıraladım. Kararı sayfayı görerek sen ver.

### Doğrulama sırası

1. Yukarıdaki ⚠️ üç kayıt — muhtemelen gerçekten yanlış
2. Demoda gezeceğin programlar — **Groningen ve Imperial** README'nin 7. adımında
   isim isim geçiyor, ikisi de listede. Onları mutlaka bitir.
3. ❓ ve 🔇 olanlar, 2a sonrası yeniden taramayla
4. Kalanlar, vakit varsa

### Her kayıt için yedi alan

`sourceUrl`'ü aç, şunları **sayfada gör**:

| Alan | Tuzak |
|---|---|
| `requirements.minGpa` | 100'lük sisteme çevrilmiş mi |
| `requirements.language` | IELTS 6.5 mi 7.0 mı — alt puan (band) şartı var mı |
| `requirements.requiredSubjects` | ders + `basic`/`advanced` |
| `requirements.extras` | numerus fixus · portfolyo · mülakat · giriş sınavı |
| `tuitionNonEu` | **AB-dışı** harç. En sık hata AB harcını yazmak — Groningen'de tam bu risk var |
| `deadline` + `applicationSystem` | AB ve AB-dışı için ayrı tarih olabilir |
| `sourceUrl` | sayfa hâlâ yaşıyor mu |

Sonra:

```ts
lastChecked: "2026-08-13",     // gerçekten baktığın gün
verification: "verified",
```

**Altın kural — düzeltildi.** Bu dosyanın ilk halinde *"yedi alandan birini
bulamadıysan `ai-extracted` bırak"* yazıyordu. **Yanlıştı**, çünkü üniversite
sayfalarının çoğu yedi alanın hepsini yazmıyor; o kuralla neredeyse hiçbir kayıt
`verified` olamazdı. Doğrusu:

> `verification: "verified"` demek **"bu alanların hepsini biliyorum"** değil,
> **"kaynak sayfayı açtım ve buradaki her değer sayfada yazanla birebir"**
> demektir. Sayfanın sessiz kaldığı alan `undefined` bırakılır — ve bu da
> doğrulanmış bir sonuçtur.

Yani:

| Durum | `verification` |
|---|---|
| Sayfayı açtım, yazan her şeyi işledim, yazmayanı `undefined` bıraktım | ✅ `verified` |
| Sayfayı açtım ama sayfanın desteklemediği bir değeri katalogda tuttum | ❌ `ai-extracted` |
| Sayfayı açmadım | ❌ `ai-extracted` |
| Sayfada olmayan bir değeri uydurdum / makul tahmin yazdım | ❌ **hiçbir zaman** |

Bunun çalışması için tip modelinin "bilinmiyor" diyebilmesi gerekiyor — aşağıya bak.

---

## Eksik veri nasıl temsil edilir — **önce bu konuşulmalı** ⚠️

Her üniversite için her alanı bulamayacağız; bu normal ve ürünün buna dürüst bir
cevabı olmalı. Ama **şu an tip modeli bunu ifade edemiyor:**

```ts
// src/lib/types.ts — mevcut hal
minGpa: number;                    // zorunlu → bilmiyorsan sayı UYDURMAK zorundasın
language: LanguageRequirement[];   // boş dizi = "dil belgesi istenmiyor" İDDİASI
```

`matching.ts:127` `minGpa`'yı her zaman bilinen sayı kabul ediyor; `unknown`
durumu yalnızca *öğrencinin* verisi eksikken üretiliyor (satır 195, 257).
Program tarafındaki boşluk için bir yol yok.

Sonuç: not eşiğini bulamadığın bir programı kataloğa eklemek için sayı uydurman
gerekiyor — ürünün *asla yapmayacağını* söylediği şey. Ve `language: []`
yazdığında sessizce "bu program dil belgesi istemiyor" iddiasında bulunuyorsun,
ki yanlış olabilir.

### Önerilen çözüm

**1. Tip — "yok" ile "bilinmiyor"u ayır** (`types.ts`, ortak dosya):

```ts
export interface ProgramRequirements {
  /** undefined = kaynak sayfada belirtilmemiş. 0 yazma, tahmin yazma. */
  minGpa?: number;
  /** undefined = bilinmiyor · [] = sayfa açıkça "dil belgesi istenmiyor" diyor */
  language?: LanguageRequirement[];
  // ...
}
```

Aynı ayrım harç için de gerekli: `tuitionNonEu?: number`.

**2. Motor — `unknown` üret** (`matching.ts` → **Alp'in dosyası**, brief'ine
`S2-5` olarak eklendi):

- `minGpa === undefined` → `checkGpa` `status: "unknown"` döndürür, `unmet`
  değil. Öğrenci cezalandırılmaz.
- `language === undefined` → `unknown` · `language: []` → şart üretilmez (bugünkü
  davranış)
- **Kritik bant kuralı:** zorunlu bir şart program tarafından `unknown` ise o
  program **`safety` olamaz.** "Rahatça aşıyorsun" demek, eşiği bilmediğin
  yerde yanlış olur. En fazla `match` ya da ayrı bir "veri eksik" işareti.

**3. Arayüz:** o satırda *"Kaynak sayfa bu şartı belirtmiyor — üniversiteye
sormalısın"*. Bu bir kusur değil, **ürünün en dürüst cümlesi**; öğrenciyi
uydurma bir eşiğe göre "olamazsın" demekten kurtarıyor.

**4. `check-data`:** `minGpa`'yı zorunlu tutma. Bunun yerine *"eksik alan
`undefined` olmalı, `0` veya uydurma değer olmamalı"* kuralını koy.

### Neden bu, ürünü zayıflatmıyor — güçlendiriyor

Demo'da şu cümleyi söyleyebilir hale geliyorsun:

> *"Bu programın not eşiğini üniversite yayınlamıyor. Biz de uydurmuyoruz —
> bilmediğimizi söylüyoruz. Rakip araçlar burada bir yüzde gösterir."*

Bu, README'nin *"kabul olasılığı vermiyoruz"* ilkesinin aynısının veri
tarafındaki karşılığı. Aynı duruş.

**Karar Alp'le birlikte verilmeli** — `types.ts` ortak, `matching.ts` onun.
Adım 2b'ye başlamadan konuşun, çünkü doğrulama sırasında bulacağın ilk eksik
alanda bu soruyla karşılaşacaksın.

### 2b bitti mi?

- [ ] ⚠️ üç kayıt sayfasından teyit edildi
- [ ] Groningen ve Imperial `verified`
- [ ] En az 10 kayıt `verified`, `lastChecked` bugünün tarihi
- [ ] Düzeltilen her değer commit mesajında yazılı
- [ ] `npm run check-sources` sonrası fark listesi kısaldı
- [ ] Arayüzde rozet doğru: `/results` + bir program detayı elle açıldı

Ülke başına commit, düzeltmeleri mesaja yaz:

```
veri: NL programları şartlarından doğrulandı

- Groningen tuitionNonEu 11.400 -> 14.000 (dedektörün bulduğu fark teyit edildi)
- TU Delft IELTS 6.0 -> 6.5
```

---

## Adım 3 · Burs verisi — 2-3 saat

### 3a. Tip — `src/lib/types.ts` **sonuna**, ayrı commit

```ts
export interface Scholarship {
  name: string;
  /** Yıllık tutar (EUR). Harç muafiyetiyse tuitionNonEu kadar yaz. */
  amountPerYear?: number;
  kind: "tuition-waiver" | "grant" | "merit" | "need-based";
  /** AB-dışı öğrenciye açık mı — hedef kitlemiz için kritik alan. */
  openToNonEu: boolean;
  sourceUrl: string;
  note?: Bilingual;
}
```

`Program` arayüzüne, `tuitionNonEu` satırlarının yanına:

```ts
scholarships?: Scholarship[];
```

### 3b. Veri

Adım 2'de **doğruladığın** programlara ekle — doğrulanmamış kayda burs eklemek
şüpheli verinin üstüne şüpheli veri koymak olur. Her bursun `sourceUrl`'ü olacak.

Bulamadığın programda alanı **boş bırak**: "burs yok" ile "bilmiyoruz" farklı
şeyler, ve biz uydurmuyoruz.

Hedef kitle AB-dışı Türk öğrenci olduğu için `openToNonEu: false` olan bursu
eklemek de değerli — öğrenci "bu bana kapalı" bilgisini de arıyor.

### 3c. Arayüz — tam yerleri

**Program detayı** — `src/app/program/[id]/page.tsx`:
- `229` → maliyet kartı başlığı (`t.program.costs`)
- `232-243` → harç ve yaşam maliyeti satırları
- `249` → toplam maliyet
- `257` → `t.program.tuitionEuNote`

Burs bloğunu **`257`'den sonra**, maliyet kartının içine ekle. Mantığı şu:
öğrenci toplam maliyeti görür, hemen altında onu düşüren şeyi görür.

**Karşılaştırma** — `src/app/compare/page.tsx`:
- `66-72` → satır tipi: `{ label, render, raw }`
- `85-93` → `tuitionNonEu` ve `livingCost` satırları
- `96-102` → `totalCost` satırı

Burs satırını **`totalCost`'tan sonra** ekle, aynı `{label, render, raw}`
desenini kullan. `raw` sıralama/dışa aktarma için düz metin döndürüyor.

**Sözlük** — `src/lib/i18n/dictionary.ts`, `program` bloğunun **sonuna**:
`scholarships`, `scholarshipNonEuOpen`, `scholarshipNonEuClosed`,
`scholarshipNone`. Ayrı commit (ortak dosya).

### 3 bitti mi?

- [ ] Tip `types.ts` sonunda, ayrı commit'te
- [ ] ≥6 doğrulanmış programda kaynaklı burs kaydı
- [ ] Detay ekranında maliyet kartının içinde görünüyor
- [ ] Karşılaştırma tablosunda satır var, `raw` dolu
- [ ] Bursu olmayan program ekranı bozulmuyor (alan opsiyonel)
- [ ] TR/EN dolu · `npm run build` + `npm run lint` temiz

---

## Adım 4 · `check-data` bekçi betiği — ~1 saat

`check-sources` **sayfayı** katalogla karşılaştırıyor. Bu betik **katalogun
kendi içini** kontrol eder. İkisi farklı iş, biri diğerini kapsamıyor.

`scripts/check-data.mts` — mevcut `check-sources.mts` desenini birebir izle:

```ts
import { PROGRAMS } from "../src/data/programs.js";   // .js uzantısı şart (.mts içinde)
import { COUNTRY_CODES, FIELD_IDS } from "../src/lib/types.js";

const problems: string[] = [];
// ... kontroller
if (problems.length) { problems.forEach(p => console.error("✗ " + p)); process.exit(1); }
console.log(`✓ ${PROGRAMS.length} kayıt, ihlal yok`);
```

`package.json`: `"check-data": "tsx scripts/check-data.mts"`

### Kontrol listesi

| Değişmez | Neden |
|---|---|
| `id` tekrarı yok | Aynı id iki kayıtta olursa `program/[id]` yanlış kaydı açar |
| `verified` ise `lastChecked` dolu | Rozetin arkasında tarih olmadan doğrulama iddiası boş |
| `lastChecked` gelecekte değil | Kopyala-yapıştır hatasını yakalar |
| `sourceUrl` `http(s)://` ile başlıyor | Bozuk link demoda tıklanınca patlar |
| **`sourceUrl` en az 2 yol segmenti içeriyor** | 2a'da düzelttiğin genel-sayfa sorununun tekrarını engeller ⭐ |
| `minGpa` **varsa** 0-100 arası | Ölçek karışmasını yakalar. Yokluğu ihlal değil — bkz. "Eksik veri" bölümü |
| Eksik alan `undefined`, `0` değil | ⭐ `0` yazmak "eşik yok" demek olur; eksik veriyi sıfır gibi göstermek sessiz yalan |
| `tuitionNonEu` **varsa** `>= 0`, `livingCostPerYear >= 0` | — |
| `deadline` `AA-GG` formatında | `matching`/`timeline` bu formatı varsayıyor |
| `country`/`field`/`applicationSystem` taksonomide var | Tanımsız değer arayüzde boş hücre bırakır |
| Dil puanı o sınavın ölçeğinde (`options.ts`) | IELTS'e 90 yazmayı yakalar |
| Burs varsa `sourceUrl` dolu | Kaynaksız burs iddiası = uydurma veri |

⭐ satırı özellikle ekle — bugün yaşadığın sorunun tekrar etmesini o engelleyecek.

### 4 bitti mi?

- [ ] `npm run check-data` geçiyor
- [ ] Bir kaydı kasten bozdun, betik yakaladı, geri aldın
- [ ] İhlalde çıkış kodu ≠ 0
- [ ] `package.json`'a betik eklendi

---

## Toplam ve öncelik

```
2a  linkleri düzelt      ████████        1,5-2 sa   ⛔ 2b'yi bloke ediyor
2b  şartları doğrula     ██████████████  2-4 sa     ⭐ demonun güvenilirliği
3   burs verisi          ████████        2-3 sa
4   check-data           ███             ~1 sa      vakit yoksa atla
```

Vaktin daralırsa: **2a'yı asla atlama** — demo 4. adımında jüri o linke
tıklayacak. 2b'yi kısaltabilirsin: 10 kayıt yerine demoda gezdiğin 6 kaydı
doğrula, gerisi dürüstçe `ai-extracted` kalsın.
