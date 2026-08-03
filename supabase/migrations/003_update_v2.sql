-- Albatros Intranet — Update v2
-- In Supabase SQL Editor ausführen.

-- News-Kommentare
create table if not exists news_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references news_posts(id) on delete cascade not null,
  body text not null,
  author_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);
alter table news_comments enable row level security;
create policy "nc_select" on news_comments for select using (auth.uid() is not null);
create policy "nc_insert" on news_comments for insert with check (auth.uid() = author_id);
create policy "nc_delete" on news_comments for delete using (auth.uid() = author_id);

-- Bereits in 002_update_v1.sql enthalten, hier zur Sicherheit erneut (idempotent):
alter table news_posts add column if not exists attachment_url text;
alter table news_posts add column if not exists attachment_name text;
