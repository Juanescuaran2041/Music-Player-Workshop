-- Saved playlists, one row per playlist. Run it once in the Supabase
-- dashboard: SQL Editor -> New query -> paste -> Run.

create table public.playlists (
  id uuid primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  -- Songs in order, as a JSON array. The linked lists are rebuilt from it.
  songs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index playlists_user_id_idx on public.playlists (user_id);

-- Every user can only see and change their own playlists
alter table public.playlists enable row level security;

create policy "Users manage their own playlists"
  on public.playlists
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
