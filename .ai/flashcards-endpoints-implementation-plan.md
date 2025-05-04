# Plan implementacji endpointów dla Fiszek

## 1. Cel i kontekst

Celem endpointów jest umożliwienie użytkownikom pobierania, edytowania oraz usuwania swoich fiszek. Dostęp do danych jest ograniczony tylko do autoryzowanych użytkowników, którzy mogą operować jedynie na swoich rekordach.

## 2. Przegląd endpointów

### GET /flashcards
- **Opis:** Pobiera listę fiszek zalogowanego użytkownika z obsługą paginacji (parametry: `page`, `limit`), sortowania (np. po `created_at`), oraz opcjonalnego filtrowania (np. wyszukiwanie po tekście w polach `front` lub `back`).
- **Walidacja:** Sprawdzenie autentykacji użytkownika oraz walidacja parametrów zapytania.
- **Integracja z Supabase:** Użycie zapytania SELECT z warunkiem 
  `WHERE user_id = <id zalogowanego użytkownika>`.

### GET /flashcards/{id}
- **Opis:** Pobiera szczegóły pojedynczej fiszki na podstawie identyfikatora `id`.
- **Walidacja:** Weryfikacja autentykacji oraz potwierdzenie, że fiszka należy do użytkownika.
- **Błędy:** Zwraca 404 gdy rekord nie istnieje lub 401 w przypadku braku autoryzacji.

### PUT /flashcards/{id}
- **Opis:** Aktualizuje fiszkę. Umożliwia zmianę pól: `front`, `back`, `source` (przy czym przy zmianie na `ai-full` lub `ai-edited` wymagana jest obecność `generated_id`).
- **Walidacja:** Walidacja danych wejściowych przy pomocy Zod. Sprawdzanie minimalnej i maksymalnej długości pól (`front`: 3-200 znaków, `back`: 3-500 znaków) oraz weryfikacja poprawności wartości `source`.
- **Integracja z Supabase:** Wykonanie operacji UPDATE z warunkiem, że rekord należy do użytkownika (`WHERE id = <id> AND user_id = <id użytkownika>`).
- **Błędy:** 400 przy błędach walidacji, 404 gdy rekord nie istnieje, 401 dla braku autoryzacji.

### DELETE /flashcards/{id}
- **Opis:** Usuwa wskazaną fiszkę.
- **Walidacja:** Autoryzacja użytkownika i potwierdzenie, że dana fiszka należy do niego.
- **Integracja z Supabase:** Operacja DELETE z warunkiem `WHERE id = <id> AND user_id = <id użytkownika>`.
- **Błędy:** 404 gdy rekord nie istnieje, 401 przy próbie usunięcia cudzych danych.

## 3. Integracja z Supabase i bezpieczeństwo

- **Supabase:** Wszystkie operacje są wykonywane przy użyciu klienta Supabase. Użytkownik powinien być uwierzytelniony. Klient Supabase powinien być pobierany z kontekstu (np. `context.locals`) i korzystać z typu `SupabaseClient` zdefiniowanego w `src/db/supabase.client.ts`.
- **Autoryzacja:** Każdy endpoint sprawdza, czy użytkownik jest zalogowany i czy jego `user_id` odpowiada rekordowi w bazie danych.
- **Bezpieczeństwo:** Dane wejściowe są walidowane przy użyciu Zod. Stosowane są wczesne wyjścia i guard clauses, aby zapobiegać wykonywaniu nieautoryzowanych lub niepoprawnych operacji.

## 4. Struktura projektu i organizacja kodu

- Endpointy zostaną umieszczone w katalogu `src/pages/api/flashcards` lub jako pojedyncze pliki (dla np. GET w `index.ts` oraz GET/PUT/DELETE w `[id].ts`).
- W każdej operacji należy upewnić się, że zapytania SQL zawierają warunek `user_id = <id użytkownika>`, aby uniemożliwić dostęp do danych innych użytkowników.
- Użycie middleware dla obsługi autoryzacji może uprościć weryfikację przychodzących żądań.

## 5. Walidacja i obsługa błędów

- **Walidacja:** Użycie Zod do sprawdzania poprawności danych wejściowych w operacjach PUT oraz zapytań GET (np. parametry paginacji).
- **Obsługa błędów:** W razie wykrycia błędu (błędna walidacja, brak autoryzacji, nieistniejący rekord) endpoint zwraca odpowiedni status HTTP (np. 400, 401, 404) oraz komunikat błędu.

## 6. Podsumowanie i wnioski

- Implementacja endpointów odbywa się zgodnie z zasadami czystego kodu, z naciskiem na weryfikację autoryzacji, walidację wejścia oraz obsługę wyjątków.
- Użytkownik ma dostęp tylko do swoich fiszek, co jest gwarantowane przez warunki w zapytaniach SQL.
- Projekt korzysta z najlepszych praktyk oraz narzędzi (Astro, TypeScript, Zod, Supabase), co zapewnia skalowalność oraz bezpieczeństwo aplikacji.

## 7. Plan implementacji krok po kroku

1. Przygotowanie środowiska:
   - Potwierdzenie poprawności konfiguracji projektu Astro oraz instalacja zależności (TypeScript, React, Tailwind, Shadcn/ui).
   - Weryfikacja konfiguracji Supabase i utworzenie klienta w `src/db/supabase.client.ts`.

2. Weryfikacja struktury endpointów:
   - Sprawdzenie, czy katalog `src/pages/api/flashcards` został utworzony.
   - Weryfikacja istniejących endpointów: GET /flashcards, GET /flashcards/{id}, PUT /flashcards/{id}, DELETE /flashcards/{id}.
   - Weryfikacja endpointu odpowiedzialnego za generowanie i zapisywanie fiszek (POST /flashcards, jeśli jest dostępny).

3. Autoryzacja i integracja z Supabase:
   - Potwierdzenie zaimplementowania autoryzacji przez middleware oraz poprawnego pobierania klienta Supabase z `context.locals`.
   - Sprawdzenie, że wszystkie zapytania SQL zawierają warunek `user_id = <id użytkownika>`.

4. Walidacja i obsługa błędów:
   - Weryfikacja, że dane wejściowe są walidowane przy użyciu Zod (dotyczy endpointów PUT, ewentualnie POST oraz parametrów zapytań dla GET).
   - Upewnienie się, że odpowiednie kody statusu (400, 401, 404) oraz komunikaty błędów są prawidłowo zwracane.

6. Testowanie i weryfikacja:
   - Przeprowadzenie testów jednostkowych i integracyjnych dla wszystkich zaimplementowanych endpointów.
   - Weryfikacja scenariuszy autoryzacji, generowania, zapisywania, aktualizacji i usuwania fiszek.