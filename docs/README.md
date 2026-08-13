# Beyond — iki kişilik geliştirme düzeni

Exposure AI Academy · Demo Day 2 · **Eda (student1)** & **Alp (student2)**

Bu klasör kod içermez; kimin neyi yaptığını ve iki kişinin aynı dosyada
çarpışmadan nasıl çalışacağını tanımlar.

| Doküman | Kim için |
|---|---|
| [brief-student1.md](brief-student1.md) | Eda — Veri & Güven katmanı |
| [brief-student2.md](brief-student2.md) | Alp — Motor & Akış katmanı |

---

## Başlangıç durumu (`776971e base`)

Uygulama çalışıyor. Eksik olan şey özellik değil, **güven**: katalogdaki 36
kaydın hiçbiri kaynağından doğrulanmadı ve eşleştirme motorunun tek bir testi
yok. Demo Day'de ürünün iddiası "dürüst değerlendirme" olduğu için bu iki
boşluk en kritik iş kalemleri.

```
main ─── student1   (Eda)
     └── student2   (Alp)
```

Üç branch de şu an aynı commit'te. `main` her zaman **çalışan, demo verilebilir**
sürüm; kimse doğrudan `main`'e push etmez.

---

## İş bölümü

Bölme mantığı: *dosya sahipliği*. Aynı dosyada iki kişi çalışmazsa merge
çatışması da olmaz. Ortak dosyalar özellikle azaltıldı.

| Dosya / klasör | Sahip |
|---|---|
| `src/data/programs.ts` | **S1** |
| `src/data/taxonomy.ts` · `src/data/options.ts` | **S1** |
| `src/app/api/extract/route.ts` | **S1** |
| `src/app/program/[id]/page.tsx` | **S1** |
| `src/app/compare/page.tsx` | **S1** |
| `src/lib/matching.ts` | **S2** |
| `src/lib/store.tsx` · `src/lib/persistent-state.ts` | **S2** |
| `src/app/results/page.tsx` | **S2** |
| `src/app/timeline/page.tsx` | **S2** |
| `src/components/AssistantPanel.tsx` | **S2** |
| `src/app/api/chat/route.ts` | **S2** |
| `supabase/schema.sql` | **S2** |
| `tests/**` | **S2** |
| `src/lib/types.ts` | ortak — **sadece ekleme** |
| `src/lib/i18n/dictionary.ts` | ortak — **sadece ekleme** |
| `src/lib/claude.ts` · `src/lib/fetch-page.ts` | ortak — AI altyapısı, önce haber ver |
| `beyond/README.md` | ortak — sadece kendi bölümün |
| `src/components/ui.tsx` · `Header.tsx` · `globals.css` | ortak — önce haber ver |

`claude.ts` / `fetch-page.ts` ikisinin de kullandığı AI altyapısı: `extract`
(S1) ve `chat` (S2) üstünde duruyor. İmzasını değiştiren taraf **karşıya haber
verir** — sessiz imza değişikliği diğerinin dalını derlenmez hale getirir.

### Ortak dosya kuralı

`types.ts` ve `dictionary.ts` ikisinin de eklemek zorunda olduğu dosyalar.
Çatışmayı sıfıra indiren üç kural:

1. **Sadece ekle, taşıma.** Yeni alanı/anahtarı ilgili bloğun **sonuna** yaz.
2. **Yeniden biçimlendirme yapma.** Prettier'ı tüm dosyaya çalıştırma; alakasız
   satırların diff'e girmesi çatışmanın bir numaralı sebebi.
3. **Ayrı commit.** Ortak dosya değişikliğini kendi işinden ayrı commit'le ve
   aynı gün `main`'e taşı; ne kadar beklerse o kadar çatışır.

---

## Git akışı

```bash
# İşe başlarken — main'deki yenilikleri al
git checkout student1          # kendi branch'in
git fetch origin
git merge origin/main

# Çalış, küçük commit'ler at (görev başına bir commit)
git add <sadece kendi dosyaların>
git commit -m "veri: NL programları kaynağından doğrulandı"
git push

# Görev bitince main'e PR aç
gh pr create --base main --head student1 --title "..." --body "..."
```

Kurallar:

- **`main`'e doğrudan push yok.** Her şey PR ile girer, diğer kişi bakar.
- **`git add -A` kullanma.** Dosyaları tek tek ekle; başkasının yarım işini
  veya `.env.local`'ı yanlışlıkla commit'lemenin en kolay yolu `-A`.
- **Asla commit'lenmeyecekler:** `.env.local`, `node_modules/`, `.next/`,
  `tsconfig.tsbuildinfo`. (`.gitignore` bunları tutuyor — zayıflatma.)
- `AGENTS.md` içindeki `nextjs-agent-rules` bloğu `next dev` tarafından
  yeniden yazılıyor. Diff'te görürsen sil**me**, işinle birlikte commit'le.
- Commit mesajları Türkçe, önek olarak alan adı: `veri:`, `motor:`, `ui:`,
  `test:`, `doküman:`.

## Bitti sayılma ölçütü (ikisi için de geçerli)

Bir görev, şunların hepsi sağlanmadan "bitti" değil:

- [ ] `npm run build` hatasız
- [ ] `npm run lint` uyarısız
- [ ] Kullanıcıya görünen her yeni metin **TR ve EN** dolu (`dictionary.ts`)
- [ ] Anahtarsız çalışıyor — `.env.local` olmadan `npm run dev` çökmüyor
- [ ] Yeni veri/kayıt varsa `verification` ve `lastChecked` dürüst
- [ ] Tarayıcıda elle denendi, sadece derlendi diye geçilmedi

## Değiştirilmeyecek ilkeler

Bunlar ürünün kimliği; "iyileştirme" adına bozulmaz:

1. **Eşleştirme motorunda AI yok.** `matching.ts` deterministik kalır.
2. **Kabul olasılığı verilmez.** `fitScore` sıralama içindir, yüzde olarak
   kullanıcıya sunulmaz.
3. **Doğrulanmamış veri doğrulanmış gibi gösterilmez.** `ai-extracted` rozeti
   arayüzde görünür kalır.
4. **Demo modu canlı AI gibi sunulmaz.** Etiket kalır.
