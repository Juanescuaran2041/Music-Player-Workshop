create table public.plays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  title text not null,
  artist text not null,
  genre text not null,
  source text not null check (source in ('youtube', 'spotify', 'file', 'manual')),
  seconds integer not null check (seconds >= 0),
  played_at timestamptz not null default now()
);

create index plays_user_id_played_at_idx on public.plays (user_id, played_at desc);

alter table public.plays enable row level security;

create policy "Users manage their own plays"
  on public.plays
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
