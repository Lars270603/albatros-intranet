-- Albatros Intranet — Update v3: Leitfaden, Kalender, Durchwahl, Abteilung optional
-- In Supabase SQL Editor ausführen, bevor die neuen Features genutzt werden.
-- Idempotent — kann gefahrlos mehrfach ausgeführt werden.

-- ============================================================
-- Abteilung wird bei der Registrierung nicht mehr abgefragt.
-- Spalte bleibt bestehen (für spätere Nutzung), wird aber optional.
-- ============================================================
alter table profiles alter column department drop not null;
alter table profiles drop constraint if exists profiles_department_check;
alter table profiles add constraint profiles_department_check
  check (department is null or department in ('vertrieb','einkauf','kundenservice','geschaeftsfuehrung'));

-- Trigger bleibt inhaltlich gleich — liest department weiterhin aus den
-- Registrierungs-Metadaten aus, ist jetzt aber NULL wenn nicht mitgegeben (jetzt erlaubt).
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name, email, department)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    new.raw_user_meta_data->>'department'
  );
  return new;
end;
$$;

-- Durchwahl — eigenes Feld, getrennt von Telefon
alter table profiles add column if not exists extension text;

-- ============================================================
-- Firmenkalender
-- ============================================================
create table if not exists calendar_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  event_date date not null,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);
alter table calendar_events enable row level security;
create policy "calendar_events_select" on calendar_events for select using (auth.uid() is not null);
create policy "calendar_events_insert" on calendar_events for insert with check (auth.uid() = created_by);
create policy "calendar_events_delete_own" on calendar_events for delete using (auth.uid() = created_by);

-- ============================================================
-- Leitfaden (ersetzt Onboarding) — Kategorien + Artikel
-- Verwaltung ist admin-only, aber wie bei onboarding_sections bereits
-- etabliert wird das clientseitig in der UI durchgesetzt, RLS bleibt
-- offen für alle authentifizierten Nutzer (gleiches Muster wie im
-- restlichen Projekt).
-- ============================================================
create table if not exists leitfaden_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text not null default 'BookOpen',
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table leitfaden_categories enable row level security;
create policy "leitfaden_categories_select" on leitfaden_categories for select using (auth.uid() is not null);
create policy "leitfaden_categories_insert" on leitfaden_categories for insert with check (auth.uid() is not null);
create policy "leitfaden_categories_update" on leitfaden_categories for update using (auth.uid() is not null);
create policy "leitfaden_categories_delete" on leitfaden_categories for delete using (auth.uid() is not null);

create table if not exists leitfaden_articles (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references leitfaden_categories(id) on delete cascade not null,
  title text not null,
  short_description text,
  icon text not null default 'FileText',
  external_link_label text,
  external_link_url text,
  info_tiles jsonb not null default '[]'::jsonb,
  body text not null default '',
  sort_order int default 0,
  created_by uuid references profiles(id) on delete set null,
  updated_at timestamptz default now()
);
alter table leitfaden_articles enable row level security;
create policy "leitfaden_articles_select" on leitfaden_articles for select using (auth.uid() is not null);
create policy "leitfaden_articles_insert" on leitfaden_articles for insert with check (auth.uid() is not null);
create policy "leitfaden_articles_update" on leitfaden_articles for update using (auth.uid() is not null);
create policy "leitfaden_articles_delete" on leitfaden_articles for delete using (auth.uid() is not null);

-- Start-Kategorien (idempotent — nur einfügen wenn Name noch nicht existiert)
insert into leitfaden_categories (name, icon, sort_order)
select v.name, v.icon, v.sort_order
from (values
  ('Erste Schritte', 'Rocket', 0),
  ('Zeiterfassung', 'Clock', 1),
  ('Personalverkauf', 'ShoppingBag', 2),
  ('Verpflegung & Pausen', 'Utensils', 3),
  ('Urlaub & Abwesenheit', 'Palmtree', 4),
  ('IT & Zugänge', 'KeyRound', 5),
  ('Arbeitssicherheit', 'ShieldCheck', 6)
) as v(name, icon, sort_order)
where not exists (select 1 from leitfaden_categories c where c.name = v.name);

-- Beispiel-Artikel "Zeiterfassung" (idempotent)
insert into leitfaden_articles
  (category_id, title, short_description, icon, external_link_label, external_link_url, info_tiles, body, sort_order)
select
  cat.id,
  'Zeiterfassung mit Timetape',
  'So erfasst du deine Arbeitszeit korrekt und einfach über Timetape.',
  'Clock',
  'Zu Timetape',
  'https://timetape.de',
  '[
    {"icon":"LogIn","title":"Login","text":"Melde dich mit deiner Albatros-E-Mail-Adresse bei Timetape an."},
    {"icon":"Smartphone","title":"Mobil nutzbar","text":"Timetape funktioniert auch als App auf deinem Smartphone."},
    {"icon":"BookOpenCheck","title":"Anleitung","text":"Eine ausführliche Anleitung findest du in Timetape unter Hilfe."}
  ]'::jsonb,
  '1. Öffne Timetape über den Link oben oder die App.
2. Melde dich mit deiner Albatros-E-Mail-Adresse an.
3. Stemple ein, sobald du mit der Arbeit beginnst.
4. Stemple aus, sobald du Feierabend machst — Pausen bitte separat erfassen.',
  0
from leitfaden_categories cat
where cat.name = 'Zeiterfassung'
  and not exists (select 1 from leitfaden_articles a where a.title = 'Zeiterfassung mit Timetape');
