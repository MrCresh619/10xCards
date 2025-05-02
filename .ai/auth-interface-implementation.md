# Plan implementacji interfejsu autoryzacji

## 1. Ogólny opis widoków

W projekcie wyróżniamy dwa główne rodzaje widoków:

- **Widoki publiczne (PublicLayout):**
  - Strona logowania – umożliwia użytkownikowi zalogowanie się poprzez formularz logowania.
  - Strona rejestracji – formularz rejestracyjny dla nowych użytkowników, zawierający pola takie jak e-mail, hasło oraz potwierdzenie hasła.
  - Strona odzyskiwania hasła – umożliwia użytkownikowi odzyskanie dostępu poprzez wprowadzenie adresu e-mail.
- **Widoki chronione (AuthLayout):**
  - Główna aplikacja `/generate`, `/flashcards` – dostępna tylko dla uwierzytelnionych użytkowników (np. widok generacji fiszek, sesja nauki).
  - Inne widoki wymagające autoryzacji, jak ustawienia konta, profil użytkownika itp.

## 2. Lista komponentów

- **Formularze:**
  - `LoginForm` – komponent zawierający pola: e-mail, hasło oraz przycisk logowania. Wykorzystuje komponenty takie jak `Input`, `Button` i `Alert` z @shadcn/ui.
  - `RegisterForm` – formularz rejestracyjny z polami: e-mail, hasło, potwierdzenie hasła. Używa komponentów `Input`, `Button`, `Alert` oraz `Card`.
  - `PasswordRecoveryForm` – formularz do odzyskiwania hasła, zawierający pole e-mail i przycisk wysłania linku resetującego.
- **Layouty:**
  - `PublicLayout` – layout dla widoków publicznych, zapewniający spójny wygląd i nawigację zgodnie ze stylami Shadcn UI i Tailwind CSS.
  - `AuthLayout` – layout dla widoków chronionych, zawierający elementy nawigacyjne i mechanizmy zabezpieczeń.
- **Komponenty pomocnicze:**
  - `AuthProvider` – kontekst oraz provider zarządzający stanem autoryzacji w całej aplikacji.
  - `useAuth` – hook zawierający logikę zarządzania sesją, przechowywania tokena JWT oraz mechanizm odświeżania.
  - `ProtectedRoute` (lub HOC) – komponent opakowujący widoki, który zabezpiecza dostęp tylko dla uwierzytelnionych użytkowników.

## 3. Zarządzanie Tokenem JWT wraz z planem odświeżania

- **Przechowywanie tokena:**

  - Token JWT będzie przechowywany w ciasteczkach z atrybutem HttpOnly, aby zwiększyć bezpieczeństwo przed atakami XSS.
  - Dodatkowo, w warstwie klienta użyjemy `AuthProvider` do utrzymywania bieżącej sesji i udostępniania stanu autoryzacji aplikacji.

- **Plan odświeżania:**
  - Po zalogowaniu użytkownika, otrzymany token zostanie zapisany, a mechanizm automatycznego odświeżania zostanie uruchomiony przy użyciu hooka `useEffect`.
  - Użyjemy interwału (`setInterval`) do monitorowania czasu ważności tokena i wywołania endpointu odświeżania (np. `/api/auth/refresh`) tuż przed wygaśnięciem tokena.
  - Po uzyskaniu nowego tokena stan sesji zostanie zaktualizowany w `AuthProvider` i przekazany do odpowiednich żądań API.

## 4. Plan zabezpieczenia widoków

- **Backendowe zabezpieczenie:**

  - Middleware znajdujący się w `src/middleware/index.ts` będzie weryfikował obecność i ważność tokena sesji dla żądań do zasobów chronionych.
  - W przypadku braku ważnego tokena użytkownik zostanie przekierowany do strony logowania.

- **Frontendowe zabezpieczenie:**
  - Komponent `ProtectedRoute` (lub HOC) w połączeniu z `AuthProvider` sprawdzi, czy użytkownik jest uwierzytelniony przed renderowaniem widoków chronionych.
  - W razie wykrycia braku autoryzacji nastąpi przekierowanie do odpowiedniej strony (np. `/login`).

## 5. Plan wdrażania krok po kroku

1. **Modyfikacja istniejących layoutów:**

   - Przekształcenie `Layout.astro` w `PublicLayout.astro` poprzez dodanie komponentów nawigacyjnych i stylów z @shadcn/ui dla widoków publicznych.
   - Rozszerzenie `MainLayout.astro` o mechanizmy ochrony i przekształcenie go w `AuthLayout.astro`, zachowując istniejącą strukturę i dodając obsługę autoryzacji.

2. **Integracja mechanizmów autoryzacji:**

   - Dodanie komponentu `AuthProvider` do obu layoutów w celu zarządzania stanem autoryzacji.
   - Implementacja logiki sprawdzania sesji i przekierowań w `AuthLayout.astro`.

3. **Stworzenie formularzy:**

   - `LoginForm`: Implementacja formularza logowania z walidacją pól (e-mail, hasło) i integracją z API logowania.
   - `RegisterForm`: Implementacja formularza rejestracyjnego z walidacją pól i sprawdzaniem zgodności haseł.
   - `PasswordRecoveryForm`: Utworzenie formularza do odzyskiwania hasła z polem e-mail.

4. **Implementacja kontekstu autoryzacji:**

   - Utworzyć `AuthProvider` oraz hook `useAuth` do zarządzania stanem autoryzacji, przechowywania tokena JWT i wywoływania mechanizmu odświeżania.

5. **Integracja z backendem:**

   - Połączyć formularze z odpowiednimi endpointami API (`/api/auth/login`, `/api/auth/register`, `/api/auth/password-recovery`) zgodnie z dokumentacją implementacji.

6. **Zarządzanie przechowywaniem tokena:**

   - Skonfigurować przechowywanie tokena JWT w ciasteczkach (HttpOnly) oraz zapewnić jego synchronizację z kontekstem klienta.

7. **Implementacja mechanizmu odświeżania tokena:**

   - Wykorzystać hook `useEffect` oraz `setInterval` do automatycznego odświeżania tokena przed jego wygaśnięciem, wywołując dedykowany endpoint odświeżania.

8. **Zabezpieczenie widoków:**

   - Utworzyć komponent `ProtectedRoute` lub HOC, który będzie sprawdzał stan autoryzacji i przekierowywał nieważnych użytkowników do strony logowania.
   - Skonfigurować middleware w `src/middleware/index.ts` do blokowania dostępu do API przez niezalogowanych użytkowników.

9. **Testowanie i walidacja:**

   - Przeprowadzić testy przepływu logiki autoryzacji, weryfikując poprawność rejestracji, logowania, odświeżania tokena oraz zabezpieczenia widoków.

10. **Refaktoryzacja i optymalizacja:**
    - Dokonać przeglądu kodu w celu poprawy wydajności, spójności stylów i zgodności z najlepszymi praktykami stosowanymi w projekcie (Astro, React, Tailwind, Shadcn UI).
