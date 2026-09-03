-- Estrutura inicial do CineFy.
-- Execute este arquivo no SQL Editor de um projeto Supabase novo.

create extension if not exists pgcrypto;

create table if not exists public.filmes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    titulo text not null check (char_length(trim(titulo)) > 0),
    genero text not null check (char_length(trim(genero)) > 0),
    sinopse text not null default '',
    datalancamento text not null,
    urlfoto text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.resenhas (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    id_filme uuid not null references public.filmes(id) on delete cascade,
    titulo text not null check (char_length(trim(titulo)) > 0),
    texto text not null check (char_length(trim(texto)) > 0),
    estrelas smallint not null default 0 check (estrelas between 0 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.cenas (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    id_filme uuid not null references public.filmes(id) on delete cascade,
    titulo text not null check (char_length(trim(titulo)) > 0),
    descricao text not null check (char_length(trim(descricao)) > 0),
    observacao text not null default '',
    estrelas smallint not null default 0 check (estrelas between 0 and 5),
    urlfoto text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists filmes_user_id_idx on public.filmes(user_id);
create index if not exists resenhas_user_id_idx on public.resenhas(user_id);
create index if not exists resenhas_id_filme_idx on public.resenhas(id_filme);
create index if not exists cenas_user_id_idx on public.cenas(user_id);
create index if not exists cenas_id_filme_idx on public.cenas(id_filme);

alter table public.filmes enable row level security;
alter table public.resenhas enable row level security;
alter table public.cenas enable row level security;

drop policy if exists "filmes_select_own" on public.filmes;
create policy "filmes_select_own" on public.filmes
    for select using (auth.uid() = user_id);
drop policy if exists "filmes_insert_own" on public.filmes;
create policy "filmes_insert_own" on public.filmes
    for insert with check (auth.uid() = user_id);
drop policy if exists "filmes_update_own" on public.filmes;
create policy "filmes_update_own" on public.filmes
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "filmes_delete_own" on public.filmes;
create policy "filmes_delete_own" on public.filmes
    for delete using (auth.uid() = user_id);

drop policy if exists "resenhas_select_own" on public.resenhas;
create policy "resenhas_select_own" on public.resenhas
    for select using (auth.uid() = user_id);
drop policy if exists "resenhas_insert_own" on public.resenhas;
create policy "resenhas_insert_own" on public.resenhas
    for insert with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.filmes
            where filmes.id = id_filme and filmes.user_id = auth.uid()
        )
    );
drop policy if exists "resenhas_update_own" on public.resenhas;
create policy "resenhas_update_own" on public.resenhas
    for update using (auth.uid() = user_id) with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.filmes
            where filmes.id = id_filme and filmes.user_id = auth.uid()
        )
    );
drop policy if exists "resenhas_delete_own" on public.resenhas;
create policy "resenhas_delete_own" on public.resenhas
    for delete using (auth.uid() = user_id);

drop policy if exists "cenas_select_own" on public.cenas;
create policy "cenas_select_own" on public.cenas
    for select using (auth.uid() = user_id);
drop policy if exists "cenas_insert_own" on public.cenas;
create policy "cenas_insert_own" on public.cenas
    for insert with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.filmes
            where filmes.id = id_filme and filmes.user_id = auth.uid()
        )
    );
drop policy if exists "cenas_update_own" on public.cenas;
create policy "cenas_update_own" on public.cenas
    for update using (auth.uid() = user_id) with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.filmes
            where filmes.id = id_filme and filmes.user_id = auth.uid()
        )
    );
drop policy if exists "cenas_delete_own" on public.cenas;
create policy "cenas_delete_own" on public.cenas
    for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'imagens',
    'imagens',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "images_insert_own_folder" on storage.objects;
create policy "images_insert_own_folder" on storage.objects
    for insert to authenticated
    with check (
        bucket_id = 'imagens'
        and (storage.foldername(name))[1] = auth.uid()::text
    );
drop policy if exists "images_update_own_folder" on storage.objects;
create policy "images_update_own_folder" on storage.objects
    for update to authenticated
    using (
        bucket_id = 'imagens'
        and (storage.foldername(name))[1] = auth.uid()::text
    )
    with check (
        bucket_id = 'imagens'
        and (storage.foldername(name))[1] = auth.uid()::text
    );
drop policy if exists "images_delete_own_folder" on storage.objects;
create policy "images_delete_own_folder" on storage.objects
    for delete to authenticated
    using (
        bucket_id = 'imagens'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'filmes'
    ) then
        alter publication supabase_realtime add table public.filmes;
    end if;
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'resenhas'
    ) then
        alter publication supabase_realtime add table public.resenhas;
    end if;
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cenas'
    ) then
        alter publication supabase_realtime add table public.cenas;
    end if;
end $$;
