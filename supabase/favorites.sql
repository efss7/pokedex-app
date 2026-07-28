-- Tabela de favoritos por usuário (sincronização na nuvem).
-- Rode este script no Supabase: SQL Editor → New query → cole → Run.

create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pokemon_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, pokemon_id)
);

-- Row Level Security: cada usuário só acessa os próprios favoritos.
alter table public.favorites enable row level security;

create policy "Usuário lê os próprios favoritos"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Usuário insere os próprios favoritos"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Usuário remove os próprios favoritos"
  on public.favorites for delete
  using (auth.uid() = user_id);
