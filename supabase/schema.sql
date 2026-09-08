-- Esquema de Banco de Dados para Urna Eletrônica / Sistema de Votação (ACE)
-- Executar no SQL Editor do Supabase Dashboard

-- 1. Criação das Tabelas Principais

-- Tabela de Eleições
create table if not exists elections (
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

-- Tabela de Chapas Concorrentes
create table if not exists slates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  number text not null,
  name text not null,
  slogan text,
  members jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Tabela de Votos Eletrônicos (Cédulas Anônimas)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  choice jsonb not null,
  created_at timestamptz not null default now()
);

-- Tabela de Eleitores / Livro de Presença (Desacoplado das Cédulas)
create table if not exists voters (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  name text not null,
  document text,
  has_voted boolean not null default false,
  registered_at timestamptz not null default now(),
  presence_confirmed_at timestamptz
);

-- 2. Índices de Performance e Chaves Estrangeiras (Boas Práticas Supabase)
create index if not exists slates_election_id_idx on slates (election_id);
create index if not exists votes_election_id_idx on votes (election_id);
create index if not exists votes_created_at_idx on votes (created_at desc);
create index if not exists voters_election_id_idx on voters (election_id);

-- 3. Habilitação de Row Level Security (RLS)
alter table elections enable row level security;
alter table slates enable row level security;
alter table votes enable row level security;
alter table voters enable row level security;

-- 4. Políticas de Acesso (RLS)
-- Eleições: Leitura e escrita públicas para operações de mesário e cabine
create policy "elections_select_policy" on elections for select using (true);
create policy "elections_insert_policy" on elections for insert with check (true);
create policy "elections_update_policy" on elections for update using (true) with check (true);
create policy "elections_delete_policy" on elections for delete using (true);

-- Chapas: Leitura e gerenciamento da eleição
create policy "slates_select_policy" on slates for select using (true);
create policy "slates_insert_policy" on slates for insert with check (true);
create policy "slates_update_policy" on slates for update using (true) with check (true);
create policy "slates_delete_policy" on slates for delete using (true);

-- Votos: Leitura permitida para apuração e telão; Inserção permitida APENAS se a eleição estiver ABERTA ('OPEN')
create policy "votes_select_policy" on votes for select using (true);
create policy "votes_insert_open_election_only" on votes for insert with check (
  exists (
    select 1 from elections e
    where e.id = election_id and e.status = 'OPEN'
  )
);
-- Nota de Segurança: Não criamos políticas de update ou delete em votes para garantir a inviolabilidade da urna

-- Votantes / Livro de Presença
create policy "voters_select_policy" on voters for select using (true);
create policy "voters_insert_policy" on voters for insert with check (true);
create policy "voters_update_policy" on voters for update using (true) with check (true);
create policy "voters_delete_policy" on voters for delete using (true);

-- 5. Habilitação do Supabase Realtime para Telão e Dispositivos Móveis
-- Permite que mudanças em elections (abrir/fechar) e votes (novo voto) sejam transmitidas via WebSocket
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'elections'
  ) then
    alter publication supabase_realtime add table elections;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'votes'
  ) then
    alter publication supabase_realtime add table votes;
  end if;
end $$;
