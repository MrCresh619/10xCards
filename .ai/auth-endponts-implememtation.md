# Plan wdrożenia endpointów Auth - Backend

## 1. Opis endpointów

- **POST /api/auth/register**

  - Rejestracja nowego użytkownika
  - Walidacja danych rejestracyjnych przy użyciu Zod
  - Wywołanie metody `signUp` z klienta Supabase

- **POST /api/auth/login**

  - Logowanie użytkownika
  - Weryfikacja danych logowania
  - Wywołanie metody `signIn` z klienta Supabase
  - Ustawianie ciasteczek sesyjnych

- **POST /api/auth/logout**

  - Wylogowanie użytkownika
  - Wywołanie metody `signOut` z klienta Supabase
  - Usunięcie ciasteczek sesyjnych

- **POST /api/auth/password-recovery**
  - Inicjacja procesu odzyskiwania hasła
  - Weryfikacja istnienia użytkownika
  - Wysłanie linku resetującego hasło

## 2. Obsługa błędów

- Użycie walidacji wejścia przy pomocy Zod
- Zastosowanie bloków try/catch wokół operacji biznesowych
- Zwracanie odpowiednich statusów HTTP (400, 422) wraz z komunikatami błędów
- Centralizacja logiki obsługi błędów (np. custom error handler)

## 3. Logika biznesowa

- Weryfikacja poprawności danych wejściowych (format email, długość hasła, zgodność haseł)
- Interakcja z Supabase przez funkcję `createSupabaseServerInstance`
- W przypadku powodzenia, ustawienie sesji użytkownika i ciasteczek
- Obsługa wyjątków i scenariuszy brzegowych

## 4. Plan wdrażania krok po kroku

1. Sprawdzanie bibliotek i instalacja brakujących.
2. Utworzenie katalogu: `src/pages/api/auth` zgodnie z strukturą projektu
3. Utworzenie pliku `register.ts` i implementacja endpointu POST /api/auth/register
4. Utworzenie pliku `login.ts` i implementacja endpointu POST /api/auth/login
5. Utworzenie pliku `logout.ts` i implementacja endpointu POST /api/auth/logout
6. Utworzenie pliku `password-recovery.ts` i implementacja endpointu POST /api/auth/password-recovery
7. Implementacja walidacji wejścia danych przy pomocy Zod
8. Integracja z Supabase SSR przy użyciu `createSupabaseServerInstance`
9. Dodanie bloków try/catch we wszystkich endpointach
10. Utworzenie serwisu autentykacji w katalogu `src/lib/services` (plik `auth.service.ts`) oraz implementacja metod:

- `registerUser` – logika rejestracji nowego użytkownika
- `loginUser` – logika logowania i ustawiania sesji
- `logoutUser` – logika wylogowywania
- `passwordRecovery` – logika odzyskiwania hasła

## 5. Uwagi i wskazówki

- Przestrzeganie najlepszych praktyk kodowania: early returns, guard clauses
- Używanie klienta Supabase zdefiniowanego w `src/db/supabase.client.ts`
- Dbanie o bezpieczeństwo i integralność danych dzięki obsłudze wyjątków
- Regularne aktualizowanie dokumentacji i specyfikacji w projekcie

## 6. Podsumowanie

Plan wdrożenia endpointów autentykacji gwarantuje:

- Spójną integrację z Supabase i środowiskiem SSR
- Solidną obsługę błędów i walidację danych
- Łatwą konserwację oraz możliwość skalowania systemu autentykacji
- Bezpieczną i przejrzystą implementację procesów rejestracji, logowania, wylogowania oraz odzyskiwania hasła

## 7. Implementacja serwisu

- Utworzenie serwisu w katalogu `src/lib/services`, np. plik `auth.service.ts`.
- W serwisie zaimplementować wspólne metody:
  - `registerUser` – logika rejestracji nowego użytkownika z walidacją danych oraz wywołaniem metody `signUp` z Supabase.
  - `loginUser` – logika logowania, weryfikacja danych i ustawianie sesji poprzez metodę `signIn`.
  - `logoutUser` – logika wylogowywania, obsługa ciasteczek oraz wywołaniem metody `signOut`.
  - `passwordRecovery` – logika inicjacji procesu odzyskiwania hasła, weryfikacja istnienia użytkownika i wysyłka linku resetującego.
- Serwis będzie korzystał z funkcji `createSupabaseServerInstance` do komunikacji z bazą danych i sesjami autentykacyjnymi.
- Centralizacja logiki autentykacji w serwisie ułatwi testowanie, konserwację i rozwój systemu oraz umożliwi ponowne użycie kodu w różnych endpointach.
