-- Albatros Intranet — Update v5: Admin kann News/Umfragen bearbeiten,
-- Leitfaden-Artikel-Bilder
-- In Supabase SQL Editor ausführen, bevor die neuen Features genutzt werden.
-- Idempotent — kann gefahrlos mehrfach ausgeführt werden.

-- News: JEDER Admin darf JEDEN Post bearbeiten, nicht nur der Autor
-- (bisherige Policy erlaubte nur update durch author_id selbst — das war der Bug)
drop policy if exists "news_update" on news_posts;
drop policy if exists "news_posts_update_authenticated" on news_posts;
create policy "news_posts_update_authenticated" on news_posts for update using (auth.uid() is not null);

-- Umfragen: es gab bisher GAR KEINE update-Policy — Bearbeiten war technisch unmöglich
drop policy if exists "polls_update_authenticated" on polls;
create policy "polls_update_authenticated" on polls for update using (auth.uid() is not null);

-- Leitfaden-Artikel: Bilder-Feld
alter table leitfaden_articles add column if not exists images jsonb not null default '[]'::jsonb;

-- ============================================================
-- Storage-Bucket für Leitfaden-Artikelbilder
-- ============================================================
insert into storage.buckets (id, name, public)
values ('leitfaden-images', 'leitfaden-images', true)
on conflict (id) do nothing;

create policy "leitfaden_images_read" on storage.objects for select using (bucket_id = 'leitfaden-images');
create policy "leitfaden_images_write" on storage.objects for insert with check (bucket_id = 'leitfaden-images' and auth.uid() is not null);
create policy "leitfaden_images_delete" on storage.objects for delete using (bucket_id = 'leitfaden-images' and auth.uid() is not null);
