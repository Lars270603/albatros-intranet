-- Albatros Intranet — Update v4: Gelesen-Funktion, Post-Bearbeiten, Foto-Umfragen,
-- Leitfaden-Anhänge, Archiv wird "Alte News", Termine im Kalender, Mitarbeiterfotos
-- In Supabase SQL Editor ausführen, bevor die neuen Features genutzt werden.
-- Idempotent — kann gefahrlos mehrfach ausgeführt werden.

alter table news_posts alter column body drop not null;
alter table news_posts add column if not exists archived boolean not null default false;
alter table news_posts add column if not exists event_date date;
alter table news_posts add column if not exists event_end_date date;

create table if not exists post_reads (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references news_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  read_at timestamptz default now(),
  unique(post_id, user_id)
);
alter table post_reads enable row level security;
create policy "post_reads_select" on post_reads for select using (auth.uid() is not null);
create policy "post_reads_insert" on post_reads for insert with check (auth.uid() = user_id);

-- Admins müssen andere Profile bearbeiten können (Foto setzen) —
-- gleiches offenes RLS-Muster wie im Rest des Projekts, Durchsetzung in der UI
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_authenticated" on profiles for update using (auth.uid() is not null);

alter table leitfaden_articles add column if not exists attachments jsonb not null default '[]'::jsonb;

drop policy if exists "poll_votes_update_own" on poll_votes;
create policy "poll_votes_update_own" on poll_votes for update using (auth.uid() = user_id);

-- polls.options (jsonb) bekommt optional ein "image_url"-Feld pro Option,
-- keine Schema-Änderung nötig, nur Konvention im Code:
-- {"id": "opt1", "label": "T-Shirt Form A", "image_url": "https://..."}

-- ============================================================
-- Storage-Bucket für Umfrage-Options-Bilder (in der Vorgabe fehlend,
-- ohne diesen Bucket schlägt der Bild-Upload bei Umfragen fehl)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('poll-images', 'poll-images', true)
on conflict (id) do nothing;

create policy "poll_images_read" on storage.objects for select using (bucket_id = 'poll-images');
create policy "poll_images_write" on storage.objects for insert with check (bucket_id = 'poll-images' and auth.uid() is not null);
create policy "poll_images_delete" on storage.objects for delete using (bucket_id = 'poll-images' and auth.uid() is not null);
