-- Albatros Intranet — Update v6: Produkte archivieren/löschen, Archiv-Einträge löschen
-- In Supabase SQL Editor ausführen, bevor die neuen Features genutzt werden.
-- Idempotent — kann gefahrlos mehrfach ausgeführt werden.

alter table products add column if not exists archived boolean not null default false;

-- Produkte: JEDER Admin darf JEDES Produkt archivieren/bearbeiten, nicht nur der Ersteller
-- (bisherige Policy erlaubte nur update durch created_by selbst — gleicher Bug wie bei News/Umfragen)
drop policy if exists "products_update" on products;
create policy "products_update" on products for update using (auth.uid() is not null);

-- Produkte: JEDER Admin darf JEDES Produkt löschen, nicht nur der Ersteller
drop policy if exists "products_delete_own" on products;
drop policy if exists "products_delete" on products;
create policy "products_delete" on products for delete using (auth.uid() is not null);

-- Archiv (alte News): JEDER Admin darf JEDEN archivierten Post endgültig löschen
drop policy if exists "news_delete_own" on news_posts;
drop policy if exists "news_posts_delete_authenticated" on news_posts;
create policy "news_posts_delete_authenticated" on news_posts for delete using (auth.uid() is not null);
