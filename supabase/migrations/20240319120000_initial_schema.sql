-- Opis: Początkowy schemat bazy danych dla projektu 10x-cards
-- Tabele: flashcards, generations, generations_error_logs
-- Data: 2024-03-19

-- Tabela generations
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla tabeli generations
alter table generations enable row level security;

-- Polityki RLS dla generations
comment on table generations is 'Przechowuje informacje o generowaniu fiszek przez AI';

create policy "Użytkownicy mogą wyświetlać tylko swoje generacje"
    on generations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć swoje generacje"
    on generations for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje generacje"
    on generations for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje generacje"
    on generations for delete
    to authenticated
    using (auth.uid() = user_id);

-- Tabela flashcards
create table flashcards (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generated_id bigint references generations(id) on delete set null
);

-- Włączenie RLS dla tabeli flashcards
alter table flashcards enable row level security;

-- Polityki RLS dla flashcards
comment on table flashcards is 'Przechowuje fiszki użytkowników';

create policy "Użytkownicy mogą wyświetlać tylko swoje fiszki"
    on flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć swoje fiszki"
    on flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje fiszki"
    on flashcards for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje fiszki"
    on flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Trigger dla automatycznej aktualizacji updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Tabela generations_error_logs
create table generations_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Włączenie RLS dla tabeli generations_error_logs
alter table generations_error_logs enable row level security;

-- Polityki RLS dla generations_error_logs
comment on table generations_error_logs is 'Przechowuje logi błędów generowania fiszek';

create policy "Użytkownicy mogą wyświetlać tylko swoje logi błędów"
    on generations_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć swoje logi błędów"
    on generations_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Indeksy
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generated_id_idx on flashcards(generated_id);
create index generations_user_id_idx on generations(user_id);
create index generations_error_logs_user_id_idx on generations_error_logs(user_id); 