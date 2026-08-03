-- PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  department text not null
    check (department in ('vertrieb','einkauf','kundenservice','geschaeftsfuehrung')),
  role text not null default 'member'
    check (role in ('admin','member')),
  status text not null default 'pending'
    check (status in ('pending','active','rejected')),
  avatar_url text,
  phone text,
  bio text check (char_length(bio) <= 120),
  birthday date,
  created_at timestamptz default now()
);

-- Trigger: Profile automatisch bei Registrierung anlegen
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- NEWS POSTS
create table if not exists news_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  image_url text,
  scope text not null
    check (scope in ('general','vertrieb','einkauf','kundenservice','geschaeftsfuehrung')),
  author_id uuid references profiles(id) on delete cascade not null,
  pinned boolean default false,
  created_at timestamptz default now()
);

-- POST REACTIONS
create table if not exists post_reactions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references news_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  emoji text not null check (emoji in ('👍','🎉','👀')),
  created_at timestamptz default now(),
  unique(post_id, user_id, emoji)
);

-- DOCUMENTS
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  file_url text not null,
  file_type text not null,
  file_size_bytes bigint,
  category text not null
    check (category in ('arensberger','sommertal','albatros','ravino','burggraf','stahlmann','intern')),
  uploaded_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text not null
    check (brand in ('arensberger','sommertal','albatros','ravino','burggraf','stahlmann')),
  description text,
  specs text,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- PRODUCT IMAGES
create table if not exists product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  image_url text not null,
  sort_order int default 0
);

-- PRODUCT QUESTIONS
create table if not exists product_questions (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  body text not null,
  asked_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- PRODUCT ANSWERS
create table if not exists product_answers (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references product_questions(id) on delete cascade not null,
  body text not null,
  answered_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- POLLS
create table if not exists polls (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  options jsonb not null,
  scope text not null default 'general'
    check (scope in ('general','vertrieb','einkauf','kundenservice','geschaeftsfuehrung')),
  created_by uuid references profiles(id) on delete cascade not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- POLL VOTES
create table if not exists poll_votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references polls(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  option_id text not null,
  created_at timestamptz default now(),
  unique(poll_id, user_id)
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  ref_id uuid,
  read boolean default false,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY aktivieren
alter table profiles enable row level security;
alter table news_posts enable row level security;
alter table post_reactions enable row level security;
alter table documents enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_questions enable row level security;
alter table product_answers enable row level security;
alter table polls enable row level security;
alter table poll_votes enable row level security;
alter table notifications enable row level security;

-- PROFILES
create policy "profiles_select" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- NEWS POSTS
create policy "news_select" on news_posts for select using (auth.uid() is not null);
create policy "news_insert" on news_posts for insert with check (auth.uid() is not null);
create policy "news_delete_own" on news_posts for delete using (auth.uid() = author_id);
create policy "news_update" on news_posts for update using (auth.uid() = author_id);

-- POST REACTIONS
create policy "reactions_select" on post_reactions for select using (auth.uid() is not null);
create policy "reactions_insert" on post_reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete_own" on post_reactions for delete using (auth.uid() = user_id);

-- DOCUMENTS
create policy "docs_select" on documents for select using (auth.uid() is not null);
create policy "docs_insert" on documents for insert with check (auth.uid() is not null);
create policy "docs_delete_own" on documents for delete using (auth.uid() = uploaded_by);

-- PRODUCTS
create policy "products_select" on products for select using (auth.uid() is not null);
create policy "products_insert" on products for insert with check (auth.uid() is not null);
create policy "products_delete_own" on products for delete using (auth.uid() = created_by);
create policy "products_update" on products for update using (auth.uid() = created_by);

-- PRODUCT IMAGES
create policy "product_images_select" on product_images for select using (auth.uid() is not null);
create policy "product_images_insert" on product_images for insert with check (auth.uid() is not null);
create policy "product_images_delete" on product_images for delete using (auth.uid() is not null);

-- PRODUCT QUESTIONS
create policy "pq_select" on product_questions for select using (auth.uid() is not null);
create policy "pq_insert" on product_questions for insert with check (auth.uid() = asked_by);
create policy "pq_delete_own" on product_questions for delete using (auth.uid() = asked_by);

-- PRODUCT ANSWERS
create policy "pa_select" on product_answers for select using (auth.uid() is not null);
create policy "pa_insert" on product_answers for insert with check (auth.uid() = answered_by);
create policy "pa_delete_own" on product_answers for delete using (auth.uid() = answered_by);

-- POLLS
create policy "polls_select" on polls for select using (auth.uid() is not null);
create policy "polls_insert" on polls for insert with check (auth.uid() is not null);
create policy "polls_delete" on polls for delete using (auth.uid() = created_by);

-- POLL VOTES
create policy "votes_select" on poll_votes for select using (auth.uid() is not null);
create policy "votes_insert" on poll_votes for insert with check (auth.uid() = user_id);

-- NOTIFICATIONS
create policy "notif_select_own" on notifications for select using (auth.uid() = user_id);
create policy "notif_update_own" on notifications for update using (auth.uid() = user_id);
create policy "notif_insert" on notifications for insert with check (true);

-- ============================================================
-- STORAGE BUCKETS
-- Zusätzlich zum Schema notwendig, damit Datei-Uploads (News-Bilder,
-- Dokumente, Produktbilder, Avatare) tatsächlich funktionieren.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('news-images', 'news-images', true),
  ('documents', 'documents', true),
  ('product-images', 'product-images', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "news_images_read" on storage.objects for select using (bucket_id = 'news-images');
create policy "news_images_write" on storage.objects for insert with check (bucket_id = 'news-images' and auth.uid() is not null);
create policy "news_images_delete" on storage.objects for delete using (bucket_id = 'news-images' and auth.uid() is not null);

create policy "documents_read" on storage.objects for select using (bucket_id = 'documents');
create policy "documents_write" on storage.objects for insert with check (bucket_id = 'documents' and auth.uid() is not null);
create policy "documents_delete" on storage.objects for delete using (bucket_id = 'documents' and auth.uid() is not null);

create policy "product_images_bucket_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_bucket_write" on storage.objects for insert with check (bucket_id = 'product-images' and auth.uid() is not null);
create policy "product_images_bucket_delete" on storage.objects for delete using (bucket_id = 'product-images' and auth.uid() is not null);

create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_write" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "avatars_update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid() is not null);
create policy "avatars_delete" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid() is not null);
