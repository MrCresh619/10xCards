-- Opis: Wyłączenie wszystkich polityk RLS dla tabel flashcards, generations i generations_error_logs
-- Data: 2024-03-19

-- Usunięcie polityk dla tabeli generations
drop policy if exists "Użytkownicy mogą wyświetlać tylko swoje generacje" on generations;
drop policy if exists "Użytkownicy mogą tworzyć swoje generacje" on generations;
drop policy if exists "Użytkownicy mogą aktualizować tylko swoje generacje" on generations;
drop policy if exists "Użytkownicy mogą usuwać tylko swoje generacje" on generations;

-- Usunięcie polityk dla tabeli flashcards
drop policy if exists "Użytkownicy mogą wyświetlać tylko swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą tworzyć swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą aktualizować tylko swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą usuwać tylko swoje fiszki" on flashcards;

-- Usunięcie polityk dla tabeli generations_error_logs
drop policy if exists "Użytkownicy mogą wyświetlać tylko swoje logi błędów" on generations_error_logs;
drop policy if exists "Użytkownicy mogą tworzyć swoje logi błędów" on generations_error_logs;

-- Wyłączenie RLS dla wszystkich tabel
alter table generations disable row level security;
alter table flashcards disable row level security;
alter table generations_error_logs disable row level security; 