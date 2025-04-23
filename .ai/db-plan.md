/_ Schemat bazy danych dla projektu 10x-cards _/

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### Tabela `users`

This table is managed by Supabase Auth.

- **id**: UUID, PRIMARY KEY
- **email**: VARCHAR(255), NOT NULL, UNIQUE
- **encrpyted_password**: VARCHAR, NOT_NULL
- **created_at**: TIMESTAMPTZ, NOT_NULL, DEFAULT now()
- **confirmed_at**: TIMESTAMPTZ

### Tabela `flashcards`

- **id**: BIGSERIAL PRIMARY_KEY
- **user_id**: UUID, NOT NULL, FOREIGN KEY odnosi się do users(id)
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **source**: VARCHAR NOT NULL, CHECK (source_type IN ('ai-full', 'ai-edited', 'manual'))
- **created_at**: TIMESTAMPTZ, NOT_NULL, DEFAULT now()
- **updated_at**: TIMESTAMPTZ, NOT_NULL, DEFAULT now()
- **generated_id**: BIGINT REFERENCES generations(id) ON DEFAULT SET NULL

_Trigger: Automatically update the 'update_at' column on record updates._

### Tabela `generations`

- **id**: BIGSERIAL PRIMARY_KEY
- **user_id**: UUID, NOT NULL, FOREIGN KEY odnosi się do users(id)
- **model**: VARCHAR, NOT_NULL
- **generated_count**: INTEGER, NOT_NULL
- **accepted_unedited_count**: INTEGER NULLABLE
- **accepted_edited_count**: INTEGER NULLABLE
- **source_text_hash**: VARCHAR, NOT_NULL
- **source_text_length**: INTEGER NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)
- **generation_duration**: INTEGER, NOT_NULL
- **created_at**: TIMESTAMPTZ, NOT_NULL, DEFAULT now()
- **updated_at**: TIMESTAMPTZ, NOT_NULL, DEFAULT now()

### Tabela `generations_error_logs`

- **id**: BIGSERIAL PRIMARY_KEY
- **user_id**: UUID, NOT NULL, FOREIGN KEY odnosi się do users(id) z ON DELETE CASCADE
- **source_text_hash**: VARCHAR, NOT_NULL
- **source_text_length**: INTEGER NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)
- **error_code**: VARCHAR, NOT_NULL
- **error_message**: TEXT, NOT_NULL
- **created_at**: TIMESTAMPTZ, NOT_NULL, DEFAULT now()

## 2. Relacje między tabelami

- W tabelach `flashcards`, `generations` oraz `generations_error_logs` kolumna **user_id** jest kluczem obcym odnoszącym się do **users.id**. Relacja ta jest typu jeden-do-wielu, co oznacza, że jeden użytkownik może mieć wiele powiązanych rekordów w tych tabelach.

- W tabeli `flashcards` może występować relacja jeden-do-jednego co oznacza że jeden wiersz może być połączony dokładnie z jednym wierszem z tabeli generations poprzez **generated_id**

## 3. Indeksy

- Domyślne indeksy:

  - Klucze główne (`id`) są automatycznie indeksowane.

- Dodatkowe indeksy dla poprawy wydajności:
  - Tabela `flashcards`: indeks na kolumnie **user_id** oraz indeks na kolumnie **generated_id**.
  - Tabela `generations`: indeks na kolumnie **user_id**.
  - Tabela `generations_error_logs`: indeks na kolumnie **user_id**.

## 4. Zasady PostgreSQL (Row-Level Security - RLS)

- Wdrożenie polityk RLS dla tabel:
  - **flashcards**:
  - **generations**:
  - **generations_error_logs**:

## 5. Dodatkowe uwagi

- Trigger na tabeli 'flashcards' automatycznie aktualizje wartość w kolumnie **update_at**
