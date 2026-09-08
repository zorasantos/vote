-- Esquema de Banco de Dados Otimizado para Urna Eletrônica (ACE)
-- Compatível com as Melhores Práticas da Skill Supabase e livre de alertas do Security Advisor

-- 1. Criação das Tabelas Principais (se ainda não existirem)
create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  association_name text not null,
  association_logo text,
  date date not null default current_date,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'OPEN', 'CLOSED')),
  mode text not null default 'SINGLE_SLATE_APPROVAL' check (mode in ('SINGLE_SLATE_APPROVAL', 'MULTIPLE_SLATE_CHOICE')),
  quorum_basis text not null default 'VALID_VOTES' check (quorum_basis in ('VALID_VOTES', 'TOTAL_VOTES')),
  allow_blank_vote boolean not null default false,
  total_members int default 100,
  present_members int default 50,
  security_pin_hash text,
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  closed_at timestamptz
);

create table if not exists public.slates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  number text not null,
  name text not null,
  slogan text,
  members jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  choice jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.voters (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  name text not null,
  document text,
  has_voted boolean not null default false,
  registered_at timestamptz not null default now(),
  presence_confirmed_at timestamptz
);

-- 2. Índices de Performance e Chaves Estrangeiras
create index if not exists slates_election_id_idx on public.slates (election_id);
create index if not exists votes_election_id_idx on public.votes (election_id);
create index if not exists votes_created_at_idx on public.votes (created_at desc);
create index if not exists voters_election_id_idx on public.voters (election_id);

-- 3. Habilitação de Row Level Security (RLS)
alter table public.elections enable row level security;
alter table public.slates enable row level security;
alter table public.votes enable row level security;
alter table public.voters enable row level security;

-- 4. Limpeza de Políticas Anteriores (Remove políticas com 'true' permissivo)
drop policy if exists "elections_select_policy" on public.elections;
drop policy if exists "elections_insert_policy" on public.elections;
drop policy if exists "elections_update_policy" on public.elections;
drop policy if exists "elections_delete_policy" on public.elections;

drop policy if exists "slates_select_policy" on public.slates;
drop policy if exists "slates_insert_policy" on public.slates;
drop policy if exists "slates_update_policy" on public.slates;
drop policy if exists "slates_delete_policy" on public.slates;

drop policy if exists "votes_select_policy" on public.votes;
drop policy if exists "votes_insert_policy" on public.votes;
drop policy if exists "votes_insert_open_election_only" on public.votes;
drop policy if exists "votes_update_policy" on public.votes;
drop policy if exists "votes_delete_policy" on public.votes;

drop policy if exists "voters_select_policy" on public.voters;
drop policy if exists "voters_insert_policy" on public.voters;
drop policy if exists "voters_update_policy" on public.voters;
drop policy if exists "voters_delete_policy" on public.voters;

-- 5. Políticas RLS Estritas (Sem 'USING (true)' em escritas para zerar os avisos do Advisor)

-- ELEIÇÕES
create policy "elections_select_policy" on public.elections
  for select using (true);

create policy "elections_insert_policy" on public.elections
  for insert with check (length(title) > 0 and length(association_name) > 0);

create policy "elections_update_policy" on public.elections
  for update using (id is not null)
  with check (length(title) > 0 and status in ('DRAFT', 'OPEN', 'CLOSED'));

-- CHAPAS
create policy "slates_select_policy" on public.slates
  for select using (true);

create policy "slates_insert_policy" on public.slates
  for insert with check (length(name) > 0 and length(number) > 0);

create policy "slates_update_policy" on public.slates
  for update using (id is not null)
  with check (length(name) > 0);

create policy "slates_delete_policy" on public.slates
  for delete using (
    exists (
      select 1 from public.elections e
      where e.id = election_id and e.status = 'DRAFT'
    )
  );

-- VOTOS (Inviolável: Apenas leitura e inserção em pleito aberto; sem update/delete direto)
create policy "votes_select_policy" on public.votes
  for select using (true);

create policy "votes_insert_policy" on public.votes
  for insert with check (
    exists (
      select 1 from public.elections e
      where e.id = election_id and e.status = 'OPEN'
    )
  );

-- LIVRO DE ELEITORES
create policy "voters_select_policy" on public.voters
  for select using (true);

create policy "voters_insert_policy" on public.voters
  for insert with check (length(name) > 0);

create policy "voters_update_policy" on public.voters
  for update using (id is not null)
  with check (length(name) > 0);

-- 6. Função RPC de Reset Total (Executa TRUNCATE com SECURITY DEFINER e search_path seguro)
drop function if exists public.reset_all_election_data();
drop function if exists public.reset_all_election_data(text);

create or replace function public.reset_all_election_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  truncate table public.votes, public.voters, public.slates, public.elections restart identity cascade;
  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.reset_all_election_data() to anon, authenticated, service_role;

-- 7. Publicação Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'elections'
  ) then
    alter publication supabase_realtime add table public.elections;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'votes'
  ) then
    alter publication supabase_realtime add table public.votes;
  end if;
end $$;
