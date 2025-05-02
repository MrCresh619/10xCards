# Specyfikacja modułu autentykacji

## 1. Architektura interfejsu użytkownika

### Strony i layouty

- Strony rejestracji i logowania zostaną umieszczone w katalogu `src/pages`, przykładowo: `login.astro`, `register.astro` oraz `password-recovery.astro` dla odzyskiwania hasła.
- Utworzymy dwa główne layouty:
  - `PublicLayout.astro` – dla stron dostępnych publicznie (logowanie, rejestracja, odzyskiwanie hasła).
  - `AuthLayout.astro` – dla stron chronionych, dostępnych tylko dla zalogowanych użytkowników.
- Layouty będą integrowane z komponentami z biblioteki Shadcn UI (np. `Card`, `Button`, `Alert`) oraz stylowane przy użyciu Tailwind CSS.

### Komponenty UI i ich odpowiedzialności

- Komponenty client-side napisane w React będą obsługiwać interaktywne formularze:
  - **LoginForm**: zawiera pola na email oraz hasło. Odpowiada za przekazywanie danych logowania do endpointu API.
  - **RegisterForm**: zawiera pola na email, hasło oraz potwierdzenie hasła. Zapewnia walidację (np. unikalność email, zgodność haseł, minimalna długość hasła).
  - **PasswordRecoveryForm**: umożliwia wprowadzenie adresu email, na który zostanie wysłany link resetujący hasło.
- Formularze będą posiadały walidację już po stronie klienta, wyświetlając odpowiednie komunikaty błędów (przy użyciu komponentu `Alert` z Shadcn UI), a następnie wysyłały dane do odpowiednich endpointów API.
- Interfejs użytkownika będzie podzielony na warstwę prezentacyjną (Astro) oraz interakcyjną (React), co zapewni lepszą separację odpowiedzialności i integrację z backendem.

### Walidacja i komunikaty błędów

- Walidacja po stronie client-side: sprawdzanie poprawności formatu email, długości hasła, zgodności pól rejestracyjnych.
- Po wysłaniu formularza, backend dodatkowo weryfikuje dane, a wszelkie błędy (np. email już istnieje, błędne hasło) są przekazywane z powrotem w formie czytelnych komunikatów.
- Komponenty będą wykorzystywały odpowiednie alerty i modale (np. `Alert`) z Shadcn UI do wyświetlania informacji o błędach lub powodzeniu operacji.

### Integracja i scenariusze

- Po udanym logowaniu, użytkownik zostanie przekierowany do `/generate`, korzystając z systemu nawigacji Astro.
- Użytkownik w trybie niezalogowanym ma dostęp do stron publicznych (logowanie, rejestracja, odzyskiwanie hasła), natomiast strony w warstwie `AuthLayout` są chronione przez middleware sprawdzający sesję.
- Scenariusze obejmują:
  - Rejestrację: formularz waliduje dane, po czym dane są wysyłane do API; w przypadku konfliktu (np. istniejący email) zwracany jest błąd.
  - Logowanie: weryfikowane są dane logowania, a w przypadku niepowodzenia wyświetlany jest komunikat o błędzie.
  - Odzyskiwanie hasła: użytkownik wprowadza email, a system wysyła link do resetu hasła przy użyciu odpowiedniego endpointu.

## 2. Logika backendowa

### Struktura endpointów API

- Utworzymy dedykowane endpointy w katalogu `src/pages/api/auth`:
  - `POST /api/auth/register` – obsługa rejestracji nowego użytkownika.
  - `POST /api/auth/login` – obsługa logowania.
  - `POST /api/auth/logout` – obsługa wylogowania.
  - `POST /api/auth/password-recovery` – obsługa żądania odzyskiwania hasła.

### Modele danych i walidacja

- Zdefiniujemy modele danych (np. `RegisterRequest`, `LoginRequest`) zawierające wymagane pola.
- Wykorzystamy bibliotekę typu Zod lub inną bibliotekę walidacyjną w TypeScript do walidacji danych wejściowych.
- Wszystkie endpointy będą sprawdzały integralność danych, a w przypadku niepoprawnych wartości zwracały statusy HTTP 400 lub 422 z opisem błędu.

### Obsługa wyjątków

- Każdy endpoint będzie zabezpieczony blokiem try-catch, który przechwyci możliwe wyjątki i zwróci stosowne komunikaty błędów.
- Logika błędów będzie centralizowana, co umożliwi jednolite traktowanie błędów w całej aplikacji, np. poprzez custom error handler.

### Renderowanie stron server-side w Astro

- Strony będą renderowane zgodnie z konfiguracją określoną w `astro.config.mjs`, co zapewni właściwe zarządzanie routingiem i środowiskiem serwerowym.
- Middleware (w `src/middleware/index.ts`) będzie dbał o ochronę stron wymagających autentykacji, sprawdzając poprawność sesji użytkownika.

### Integracja z Supabase SSR

- W celu obsługi autentykacji w środowisku SSR, wykorzystamy pakiet `@supabase/ssr`.
- Klient Supabase będzie tworzony w pliku `src/db/supabase.client.ts` przy użyciu funkcji `createServerClient`, która konfiguruje zarządzanie ciasteczkami wyłącznie przy użyciu metod `getAll` oraz `setAll`.
- Integracja ta umożliwia pobieranie sesji użytkownika poprzez wywołanie `auth.getUser()`, bazującego na JWT, co umożliwi middleware poprawną walidację autoryzacji dla stron chronionych.

## 3. System autentykacji

### Wykorzystanie Supabase Auth

- Autentykacja zostanie oparta na Supabase Auth, z wykorzystaniem biblioteki `@supabase/supabase-js` oraz integracją z SSR za pomocą `@supabase/ssr`.
- Podczas rejestracji, endpoint `POST /api/auth/register` wywołuje metodę `signUp` Supabase, która tworzy nowego użytkownika w bazie.
- Logowanie odbywa się za pomocą metody `signIn` Supabase w endpointcie `POST /api/auth/login`.
- Wylogowanie realizowane jest przez metodę `signOut` w endpointcie `POST /api/auth/logout`.
- Odzyskiwanie hasła jest obsługiwane poprzez metodę wysyłającą email z linkiem resetującym hasło w endpointcie `POST /api/auth/password-recovery`.

- Middleware (np. w `src/middleware/index.ts`) wykorzysta metodę `auth.getUser()` do pobierania sesji opartej na JWT, a zarządzanie ciasteczkami zostanie zrealizowane przy użyciu wyłącznie metod `getAll` i `setAll`, zgodnie z wytycznymi dla Supabase SSR.

### Integracja z front-endem

- Formularze (LoginForm, RegisterForm, PasswordRecoveryForm) komunikują się z backendowymi endpointami za pomocą zapytań HTTP (fetch lub dedykowane hooki w React), umożliwiając dynamiczną aktualizację stanu aplikacji.
- Odpowiedzi z API determinują dalszą nawigację – np. przekierowanie do strefy chronionej po udanym logowaniu oraz wyświetlenie komunikatów błędów przy nieudanych operacjach.

### Middleware i ochrona stron

- Middleware zlokalizowany w `src/middleware/index.ts` będzie sprawdzał obecność i ważność sesji użytkownika dla chronionych stron.
- W przypadku braku autentykacji, użytkownik zostanie przekierowany na stronę logowania.

## Podsumowanie

Moduł autentykacji został zaprojektowany zgodnie z wymaganiami produktu oraz wykorzystuje nowoczesny stack technologiczny: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn UI oraz Supabase Auth. Rozwiązanie zapewnia przejrzysty podział warstw interfejsu użytkownika, logiczną obsługę operacji backendowych oraz bezpieczny system autentykacji, dbając jednocześnie o walidację, obsługę wyjątków i spójność komunikatów błędów w całej aplikacji.
