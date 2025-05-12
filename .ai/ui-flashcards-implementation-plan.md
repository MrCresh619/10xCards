# Plan implementacji interfejsu użytkownika "Moje Fiszki"

## 1. Opis widoków i modali

- **Widok główny "Moje Fiszki"**:

  - Lokalizacja: `/flashcards`
  - Główny cel: Wyświetlenie pełnej listy fiszek użytkownika (zarówno generowanych, jak i ręcznie utworzonych).
  - Elementy: Lista fiszek, pasek wyszukiwania, filtry, paginacja.

- **Modal edycji fiszki**:

  - Służy do modyfikacji wybranej fiszki.
  - Zawiera formularz z polami: "Przód" oraz "Tył".
  - Walidacja pól

- **Modal dodawania nowej fiszki**:

  - Umożliwia ręczne utworzenie nowej fiszki.
  - Formularz zawiera pola "Przód" i "Tył" oraz przycisk zatwierdzający.
  - Walidacja pól

- **Modal usuwania fiszki**:
  - Wyświetla potwierdzenie przed usunięciem wybranej fiszki.

## 2. Opis komponentów

- **Lista Fiszek**:

  - Komponent do prezentacji fiszek w formie listy lub tabeli.
  - Pobiera dane przy użyciu endpointu `GET /flashcards`.
  - Wykorzystuje komponenty Shadcn/ui (np. `Card`, `Table`, `Button`) oraz Tailwind CSS dla spójności stylów.

- **Komponent filtru i paginacji**:

  - Umożliwia filtrowanie, sortowanie i nawigację po stronach listy fiszek.

- **Komponent Modal**:

  - Uniwersalny komponent modalny wykorzystywany w edycji, dodawaniu i usuwaniu fiszek.
  - Powinien być zgodny z wytycznymi UI-shadcn helper.

- **Formularz Fiszki**:
  - Formularz używany w modalach edycji i dodawania.
  - Integracja walidacji danych przy użyciu biblioteki Zod.

## 3. Powiązanie z backendem

- **API Endpoints**:

  - `GET /flashcards` – pobieranie listy fiszek.
  - `PUT /flashcards/{id}` – aktualizacja istniejącej fiszki.
  - `DELETE /flashcards/{id}` – usuwanie fizycznie wybranej fiszki.

- **Integracja**:
  - Wykorzystanie klienta Supabase (z `src/db/supabase.client.ts`) do zapewnienia autoryzacji i operacji na danych.
  - Obsługa błędów oraz komunikatów z API, zgodnie z dokumentacją backendu w flashcards-endpoints-implementation-plan.md.
  - Implementacja logiki API w serwisie (np. `src/lib/services/flashcards.ts`).

## 4. Opis walidacji w Zod

- **Schemat walidacji**:

  - Utworzenie schematu walidacji dla formularza używanego w modalach edycji i dodawania fiszek:
    - Pole "Przód": wymagane, długość od 3 do 200 znaków.
    - Pole "Tył": wymagane, długość od 3 do 500 znaków.
    - Dodatkowe pole (jeśli dotyczy) do określenia źródła fiszki: "manual", "ai-full", "ai-edited".

- **Implementacja**:
  - Użycie biblioteki Zod do walidacji danych zarówno na poziomie komponentu, jak i serwisu komunikującego się z API.
  - Natychmiastowa walidacja pól formularza i wyświetlanie komunikatów o błędach użytkownikowi.

## 5. Inne istotne kroki

- **Spójność stylów**:

  - Używanie Tailwind CSS oraz komponentów Shadcn/ui z zachowaniem obowiązujących wytycznych projektu.

- **Hooki i zarządzanie stanem**:

  - Utworzenie dedykowanego hooka (np. `useFlashcards`) do pobierania, aktualizacji i zarządzania stanem fiszek.

- **Obsługa błędów**:
  - Wyświetlanie błędów z walidacji oraz komunikatów z odpowiedzi API.
  - Implementacja feedbacku dla użytkownika przy operacjach edycji, dodawaniu lub usuwaniu fiszek.

## 6. Szczegółowy plan implementacji krok po kroku

1. **Utworzenie nowej strony**:

   - Dodanie pliku widoku `/flashcards` w folderze `src/pages` (np. `flashcards.astro`).

2. **Implementacja głównego komponentu widoku "Moje Fiszki"**:

   - Utworzenie komponentu React lub Astro odpowiedzialnego za wyświetlanie listy fiszek.

3. **Integracja z backendem**:

   - Implementacja funkcji wywołującej endpoint `GET /flashcards` w serwisie (np. `src/lib/services/flashcards.ts`).
   - Zapewnienie obsługi autoryzacji i przekazywanie błędów.

4. **Implementacja komponentu listy fiszek**:

   - Wyświetlanie fiszek w formie listy (CARD).
   - Dodanie funkcjonalności filtrowania, sortowania oraz paginacji.

5. **Implementacja modalów**:

   - Stworzenie uniwersalnego komponentu modalnego wykorzystującego Shadcn/ui.
   - Dodanie modalów do edycji, dodawania i usuwania fiszek.

6. **Implementacja formularza fiszki i walidacji**:

   - Utworzenie formularza z polami "Przód" i "Tył".
   - Zdefiniowanie schematu walidacyjnego w Zod (sprawdzenie długości, wymagane pola) i integracja z formularzem.

7. **Integracja akcji edycji i usuwania**:

   - Implementacja wywołań endpointów `PUT /flashcards/{id}` i `DELETE /flashcards/{id}` w odpowiedzi na działania użytkownika.

8. **Testowanie widoku i komponentów**:

   - Przeprowadzenie testów manualnych i jednostkowych w celu sprawdzenia poprawności działania widoku oraz walidacji formularzy.

9. **Finalne poprawki i optymalizacja**:
   - Dopracowanie stylów, upewnienie się o spójności interfejsu z resztą aplikacji.
   - Weryfikacja obsługi błędów i wydajności.
