# Plan Testów dla Projektu

## 1. Wprowadzenie i cele testowania
Celem niniejszego planu testów jest zapewnienie wysokiej jakości oprogramowania poprzez systematyczną weryfikację wszystkich komponentów projektu. Testy mają na celu identyfikację defektów we wczesnych etapach, co pozwoli na szybką reakcję i usprawnienie procesu developerskiego.

## 2. Zakres testów
Testy będą obejmowały:
- Testy jednostkowe komponentów i funkcji (np. widoki, helpery, logika biznesowa).
- Testy integracyjne sprawdzające współdziałanie komponentów frontendowych (Astro, React) z backendem (API, Supabase).
- Testy end-to-end symulujące pełne scenariusze użytkownika.
- Testy wydajnościowe i obciążeniowe, szczególnie w kontekście interfejsu użytkownika i operacji na bazie danych.
- Testy bezpieczeństwa, w tym autoryzację i uwierzytelnianie.
- Testy integracji z usługami zewnętrznymi, w szczególności z API modeli AI poprzez Openrouter.ai.

## 3. Typy testów do przeprowadzenia
- **Testy jednostkowe:** Walidacja najmniejszych jednostek kodu (komponenty, funkcje pomocnicze), szczególnie w katalogach `src/lib` oraz `src/components`.
- **Testy integracyjne:** Sprawdzenie współpracy pomiędzy warstwami aplikacji, np. interakcja między komponentami React, Astro oraz API w `src/pages/api`.
- **Testy end-to-end:** Scenariusze użytkownika obejmujące cały przepływ aplikacji, od logowania po finalne operacje CRUD w Supabase.
- **Testy wydajnościowe:** Ocena szybkości i responsywności aplikacji, zwłaszcza przy wysokim obciążeniu.
- **Testy bezpieczeństwa:** Weryfikacja mechanizmów autoryzacji, autentykacji oraz ochrony danych.
- **Testy AI:** Weryfikacja poprawnej integracji z modelami AI poprzez Openrouter.ai, w tym testowanie limitów finansowych na klucze API.

## 4. Scenariusze testowe dla kluczowych funkcjonalności
- **Autoryzacja i rejestracja:** Testy poprawności rejestracji użytkowników, procesu logowania oraz resetowania hasła, w tym weryfikacja poprawności działania autentykacji Supabase.
- **Nawigacja i routing:** Walidacja działania stron i dynamicznych ścieżek, w tym middleware oraz integracji z Astro.
- **Interakcje użytkownika:** Testowanie formularzy, przycisków i interaktywnych komponentów React (np. dynamiczne aktualizacje, walidacja danych wejściowych).
- **Integracja z Supabase:** Sprawdzenie poprawności operacji CRUD, autoryzacji oraz synchronizacji danych z bazą PostgreSQL.
- **Responsywność i UI:** Testy wizualne i funkcjonalne interfejsu przy wykorzystaniu Tailwind oraz komponentów z Shadcn/ui.
- **Integracja z AI:** Testowanie komunikacji z modelami AI przez Openrouter.ai, weryfikacja poprawnych odpowiedzi, obsługa błędów i limitów.

## 5. Środowisko testowe
- **Lokalne środowisko developerskie:** Używane do szybkiego feedbacku podczas developmentu.
- **Środowisko staging:** Reprezentacja środowiska produkcyjnego, umożliwiająca testy integracyjne i end-to-end.
- **Baza danych Supabase:** Konfiguracja z danymi testowymi, umożliwiająca symulację operacji na bazie.
- **Środowisko kontenerowe Docker:** 
  - Testy w izolowanym środowisku przed wdrożeniem na DigitalOcean
  - Konfiguracja poprzez docker-compose.yml dla lokalnego rozwoju
  - Multi-stage builds oddzielające środowisko developerskie od produkcyjnego
  - Konteneryzacja Astro z Node.js oraz serwera Supabase dla testów lokalnych
  - CI pipeline z GitHub Actions do budowania i testowania obrazów Docker

## 6. Narzędzia do testowania
- **Frameworki testowe:** 
  - **Vitest:** Szybki framework testowy zoptymalizowany pod Vite/Astro, kompatybilny z Jest API
  - **React Testing Library:** Biblioteka do testowania komponentów React z naciskiem na interakcje użytkownika
  - **@testing-library/dom:** Narzędzie do testowania interakcji z DOM, niezależne od frameworka
  - **Playwright:** Kompleksowe narzędzie do testów end-to-end, wspierające wszystkie nowoczesne przeglądarki
- **Narzędzia do testów wydajnościowych:** 
  - **Lighthouse:** Audyt wydajności, dostępności i SEO stron
  - **WebPageTest:** Testy wydajnościowe z różnych lokalizacji i urządzeń
  - **Web Vitals:** Monitorowanie Core Web Vitals (LCP, FID, CLS)
  - **Performance API:** Pomiary wydajności w środowisku przeglądarki
- **Narzędzia CI/CD:** 
  - **GitHub Actions:** Automatyzacja testów przy każdym commitcie i pull requeście
  - **Docker Hub:** Przechowywanie i dystrybucja obrazów kontenerów
  - **DigitalOcean App Platform:** Wdrażanie i skalowanie aplikacji
- **Narzędzia statycznej analizy:** 
  - **ESLint:** Wykrywanie problemów w kodzie JavaScript/TypeScript
  - **Prettier:** Formatowanie kodu
  - **TypeScript Compiler:** Statyczna analiza typów
  - **astro check:** Sprawdzanie typów w plikach Astro
- **Narzędzia do mockowania API:** 
  - **MSW (Mock Service Worker):** Przechwytywanie żądań sieciowych na poziomie przeglądarki/Node.js
  - **Supabase Local Development:** Lokalny serwer Supabase do testowania
  - **Mirage JS:** Mockowanie API REST w testach klienta

## 7. Harmonogram testów
- **Faza przygotowawcza:** Konfiguracja środowisk testowych, przygotowanie danych testowych i pisanie przypadków testowych.
- **Testy jednostkowe i integracyjne:** Uruchamiane cyklicznie podczas developmentu i przy każdym commitcie.
- **Testy end-to-end:** Przeprowadzane w środowisku staging przed wdrożeniem do produkcji.
- **Testy wydajnościowe:** Regularne testy w celu monitorowania wpływu zmian na responsywność aplikacji.
- **Testy penetracyjne:** Okresowe testy bezpieczeństwa w celu identyfikacji potencjalnych luk.

## 8. Kryteria akceptacji testów
- Osiągnięcie minimalnego pokrycia kodu testami (np. 80%).
- Brak krytycznych błędów blokujących funkcjonalność aplikacji.
- Wyniki testów muszą być zgodne z dokumentacją i wymaganiami funkcjonalnymi.
- Sukces testów integracyjnych i end-to-end przed wdrożeniem nowych funkcjonalności.
- Czas ładowania stron poniżej 3 sekund na standardowym połączeniu internetowym.
- Poprawna obsługa różnych rozdzielczości ekranu i urządzeń mobilnych.

## 9. Role i odpowiedzialności w procesie testowania
- **Testerzy:** Odpowiedzialni za tworzenie, wykonywanie przypadków testowych oraz raportowanie błędów.
- **Developerzy:** Współpraca w poprawie błędów, aktualizacja przypadków testowych w oparciu o zmiany w kodzie.
- **QA Manager:** Nadzór nad procesem testowania oraz koordynacja działań zespołu.
- **DevOps:** Utrzymanie i monitorowanie środowiska testowego oraz integracja testów w pipeline CI/CD.
- **Product Owner:** Weryfikacja zgodności testów z wymaganiami biznesowymi.

## 10. Procedury raportowania błędów
- Błędy będą zgłaszane poprzez system zarządzania zadaniami (np. Jira, GitHub Issues).
- Każdy raport powinien zawierać dokładny opis problemu, kroki do reprodukcji, oczekiwany rezultat oraz rzeczywisty rezultat.
- Krytyczne błędy będą eskalowane bezpośrednio do QA Managera i zespołu developerskiego.
- Regularne przeglądy zgłoszeń oraz retrospektywy w celu ulepszania procesu testowania.
- Kategoryzacja błędów według priorytetów: krytyczny, wysoki, średni, niski. 