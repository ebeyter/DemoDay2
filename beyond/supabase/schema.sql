-- Beyond — Supabase şeması
--
-- Çalıştırmak için: supabase.com → projen → SQL Editor → bu dosyayı yapıştır → Run
--
-- GÜVENLİK NOTU: Bu betik sadece ekleme yapar. Hiçbir DROP, DELETE veya
-- TRUNCATE içermez; var olan hiçbir tabloyu, politikayı veya veriyi silmez.
-- Birden fazla kez çalıştırmak güvenlidir.
--
-- Tablo adı bilinçli olarak `beyond_profiles` — düz `profiles` adı Supabase
-- şablonlarında çok yaygın ve projede zaten öyle bir tablo varsa
-- `create table if not exists` onu sessizce atlayıp anlaşılmaz hatalara yol
-- açıyor. Kendi adımızı kullanarak senin mevcut tablolarına hiç dokunmuyoruz.
--
-- Tek tablo yeterli: program kataloğu statik JSON olarak uygulamada duruyor,
-- veritabanına sadece öğrenciye ait olan şeyler giriyor.

-- ---------------------------------------------------------------------------
-- 1. Tablo
-- ---------------------------------------------------------------------------
create table if not exists public.beyond_profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,

  -- Öğrenci profilinin tamamı. JSONB çünkü profil şeması ürünle birlikte
  -- gelişiyor; her yeni alan için migration yazmak bu aşamada gereksiz yavaşlık.
  profile      jsonb,

  -- Takvime giren programların id listesi.
  shortlist    text[] default '{}',

  -- Karşılaştırma tahtasındaki programlar (en fazla 4).
  compare_list text[] default '{}',

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Güvenlik ağı
--
-- `create table if not exists` var olan bir tabloyu sessizce atlar. Beklenen
-- yapıda değilse politikalar anlaşılmaz hata verirdi; burada erken ve açık
-- uyarı veriyoruz. Hiçbir şey silinmez.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'beyond_profiles'
      and column_name = 'user_id'
  ) then
    raise exception
      'public.beyond_profiles tablosu beklenen yapıda değil (user_id kolonu yok). Bu adda başka bir tablon varsa yeniden adlandır, sonra bu betiği tekrar çalıştır.';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3. Satır düzeyinde güvenlik (RLS)
--
-- Bunu açmadan bırakmak, anon anahtarı olan herkesin tüm öğrenci profillerini
-- okuyabilmesi demek olurdu. Aşağıdaki dört politika her öğrencinin yalnızca
-- kendi satırına erişmesini sağlıyor.
--
-- Not: RLS'i açmanın tek yolu ALTER TABLE'dır; bu ifade hiçbir veriyi
-- değiştirmez, sadece tablonun güvenlik bayrağını açar.
-- ---------------------------------------------------------------------------
alter table public.beyond_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'beyond_profiles'
      and policyname = 'beyond_profiles_select_own'
  ) then
    create policy beyond_profiles_select_own on public.beyond_profiles
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'beyond_profiles'
      and policyname = 'beyond_profiles_insert_own'
  ) then
    create policy beyond_profiles_insert_own on public.beyond_profiles
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'beyond_profiles'
      and policyname = 'beyond_profiles_update_own'
  ) then
    create policy beyond_profiles_update_own on public.beyond_profiles
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'beyond_profiles'
      and policyname = 'beyond_profiles_delete_own'
  ) then
    create policy beyond_profiles_delete_own on public.beyond_profiles
      for delete using (auth.uid() = user_id);
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 4. updated_at'i her yazımda otomatik tazele
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'beyond_touch_updated_at'
  ) then
    execute $fn$
      create function public.beyond_touch_updated_at()
      returns trigger language plpgsql as $body$
      begin
        new.updated_at = now();
        return new;
      end;
      $body$
    $fn$;
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'beyond_profiles_touch_updated_at'
      and tgrelid = 'public.beyond_profiles'::regclass
  ) then
    create trigger beyond_profiles_touch_updated_at
      before update on public.beyond_profiles
      for each row execute function public.beyond_touch_updated_at();
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 5. Doğrulama — 4 satır dönmeli (SELECT, INSERT, UPDATE, DELETE)
-- ---------------------------------------------------------------------------
select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'beyond_profiles'
order by policyname;
