-- Run in Supabase SQL editor or via CLI: `supabase db push`
-- Public posts from Google Docs submissions (no auth yet).

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content_html text not null,
  author text not null default 'Contributor',
  source_url text not null,
  read_time_minutes integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "posts_select_public"
  on public.posts
  for select
  to anon, authenticated
  using (true);

create policy "posts_insert_public"
  on public.posts
  for insert
  to anon, authenticated
  with check (true);
