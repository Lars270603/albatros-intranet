-- Albatros Intranet — Update v1
-- In Supabase SQL Editor ausführen, bevor die neuen Features genutzt werden.

-- News Posts Erweiterung
alter table news_posts add column if not exists attachment_url text;
alter table news_posts add column if not exists attachment_name text;

-- Polls Erweiterung
alter table polls add column if not exists is_anonymous boolean default false;

-- Onboarding
create table if not exists onboarding_sections (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  sort_order int default 0,
  created_by uuid references profiles(id) on delete set null,
  updated_at timestamptz default now()
);
alter table onboarding_sections enable row level security;
create policy "onboarding_select" on onboarding_sections for select using (auth.uid() is not null);
create policy "onboarding_insert" on onboarding_sections for insert with check (auth.uid() is not null);
create policy "onboarding_update" on onboarding_sections for update using (auth.uid() is not null);
create policy "onboarding_delete" on onboarding_sections for delete using (auth.uid() is not null);

-- Kontakte
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text not null,
  role text,
  email text,
  phone text,
  notes text,
  category text not null default 'sonstige'
    check (category in ('agentur','logistik','lieferant','dienstleister','sonstige')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table contacts enable row level security;
create policy "contacts_select" on contacts for select using (auth.uid() is not null);
create policy "contacts_insert" on contacts for insert with check (auth.uid() is not null);
create policy "contacts_update" on contacts for update using (auth.uid() is not null);
create policy "contacts_delete" on contacts for delete using (auth.uid() is not null);

-- Ideen
create table if not exists ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  submitted_by uuid references profiles(id) on delete cascade not null,
  status text not null default 'offen'
    check (status in ('offen','in_bearbeitung','umgesetzt','abgelehnt')),
  created_at timestamptz default now()
);
create table if not exists idea_votes (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references ideas(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(idea_id, user_id)
);
alter table ideas enable row level security;
alter table idea_votes enable row level security;
create policy "ideas_select" on ideas for select using (auth.uid() is not null);
create policy "ideas_insert" on ideas for insert with check (auth.uid() = submitted_by);
create policy "ideas_delete_own" on ideas for delete using (auth.uid() = submitted_by);
create policy "ideas_update" on ideas for update using (auth.uid() is not null);
create policy "idea_votes_select" on idea_votes for select using (auth.uid() is not null);
create policy "idea_votes_insert" on idea_votes for insert with check (auth.uid() = user_id);
create policy "idea_votes_delete" on idea_votes for delete using (auth.uid() = user_id);

-- Poll Details Route braucht kein neues Schema
