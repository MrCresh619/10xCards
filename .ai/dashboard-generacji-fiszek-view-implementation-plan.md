# Plan implementacji widoku Dashboard generacji fiszek

## 1. Przegląd

Widok "Dashboard generacji fiszek" to centralne miejsce, w którym użytkownik może wprowadzić długi tekst w celu wygenerowania fiszek AI. Po wygenerowaniu propozycji, użytkownik może zaakceptować, edytować lub odrzucić poszczególne fiszki, a następnie zapisać wybrane fiszki do bazy danych.

## 2. Routing widoku

Widok dostępny będzie pod ścieżką: `/generate`.

## 3. Struktura komponentów

- Formularz generacji:
  - Pole tekstowe do wprowadzania długiego tekstu (source_text).
  - Przycisk "Generuj".
- Komponent spinnera:
  - Wyświetlany podczas oczekiwania na odpowiedź API (napis "GENERATING").
- Lista fiszek:
  - Wyświetlanie propozycji fiszek.
  - Elementy listy zawierające informacje o treści fiszki oraz przyciski akcji (zatwierdź, edytuj, odrzuć).
- Kontrolki bulk zapisu:
  - Przycisk "Zapisz wszystkie".
  - Przycisk "Zapisz zaakceptowane".
- Komponenty modalu lub edytora:
  - Umożliwiające edycję wybranej fiszki.

## 4. Szczegóły komponentów

### Formularz generacji

- Opis: Umożliwia wpisanie długiego tekstu oraz inicjuje generowanie fiszek.
- Główne elementy: Pole tekstowe, przycisk "Generuj".
- Obsługiwane interakcje: Wpisywanie tekstu, kliknięcie przycisku.
- Walidacja: Tekst musi mieć od 1000 do 10000 znaków; w trakcie wysyłania zapytania, pole oraz przycisk są zablokowane.
- Typy: Wykorzystuje typ `CreateGenerationCommand`.
- Propsy: Funkcja wywołująca żądanie generacji.

### Komponent spinnera

- Opis: Informuje użytkownika, że trwa przetwarzanie żądania.
- Główne elementy: Spinner graficzny z napisem "GENERATING".
- Obsługiwane interakcje: Brak interakcji użytkownika.
- Propsy: Status ładowania.

### Lista fiszek

- Opis: Wyświetla propozycje wygenerowanych fiszek.
- Główne elementy: Lista elementów z polami `front` i `back` oraz przyciskami akcji.
- Obsługiwane interakcje:
  - Akceptacja fiszki (przełącznik stanu).
  - Edycja fiszki (otwarcie modalu lub inline edycji).
  - Odrzucenie fiszki (usunięcie z listy).
- Walidacja: Każda fiszka musi spełniać ograniczenia: `front` (3-200 znaków), `back` (3-500 znaków). Jeśli użytkownik zmodyfikuje treść, należy zrobić walidację edycji.
- Typy: Oparte na typie `FlashcardProposalDTO` z ewentualnym rozszerzeniem o flagi `isAccepted` i `isEditing`.
- Propsy: Lista fiszek, funkcje obsługi akcji (edytuj, zatwierdź, usuń).

### Kontrolki bulk zapisu

- Opis: Umożliwiają zapisanie fiszek do bazy – można zapisać wszystkie lub tylko zaakceptowane.
- Główne elementy: Przyciski "Zapisz wszystkie" oraz "Zapisz zaakceptowane".
- Obsługiwane interakcje: Kliknięcie przycisku wywołuje odpowiednie żądanie API POST /flashcards.
- Walidacja: Dane muszą spełniać kryteria walidacyjne API (np. minimalna i maksymalna długość pól).
- Propsy: Lista fiszek do zapisu oraz funkcja zapisania.

## 5. Typy

- `CreateGenerationCommand`: { source_text: string } – do wysyłki zapytania do POST /generations.
- `GenerationCreatedDTO`: { generation_id: number, flashcards_proposals: FlashcardProposalDTO[], generated_count: number } – odpowiedź z API POST /generations.
- `FlashcardProposalDTO`: { front: string, back: string, source: "ai-full" } – reprezentacja wygenerowanej fiszki.
- Rozszerzony typ ViewModel dla fiszki:
  - `id` (opcjonalne, unikalne dla listy),
  - `front: string`,
  - `back: string`,
  - `source: "ai-full" | "ai-edited"`,
  - `isAccepted: boolean`,
  - `isEditing: boolean`.

## 6. Zarządzanie stanem

- Użycie hooków React (`useState`, `useEffect`) do przechowywania:
  - Stanu formularza (wartość pola tekstowego).
  - Stanu ładowania (czy trwa zapytanie do API).
  - Listy wygenerowanych fiszek (z flagami akceptacji i edycji).
  - Komunikatów błędów.
- Możliwość wdrożenia custom hooka, np. `useFlashcardGeneration`, który zarządza logiką komunikacji z API oraz aktualizacją stanu.

## 7. Integracja API

- Żądanie POST /generations:
  - Wysyłane po kliknięciu przycisku "Generuj".
  - Żądanie zawiera pole `source_text`.
  - Odpowiedź zawiera `generation_id`, `flashcards_proposals` oraz `generated_count`.
- Żądanie POST /flashcards:
  - Wywoływane przy bulk zapisie (przycisk "Zapisz wszystkie" lub "Zapisz zaakceptowane").
  - Payload zawiera tablicę fiszek, gdzie każda fiszka zawiera pola `front`, `back`, `source` oraz `generated_id` gdy dotyczy.
- Walidacja odpowiedzi: Sprawdzenie statusu odpowiedzi i obsługa błędów (400, 401, 500).

## 8. Interakcje użytkownika

- Użytkownik wpisuje długi tekst i klika "Generuj".
- Input i przycisk są blokowane, pokazuje się spinner.
- Po otrzymaniu wyników, spinner znika i wyświetlana jest lista propozycji.
- Użytkownik może:
  - Akceptować fiszki (przez zaznaczenie) – zmiana flagi `isAccepted`.
  - Edytować treść fiszki – przełączenie na tryb edycji, walidacja pól.
  - Odrzucać fiszki – usunięcie z listy.
- Użytkownik wybiera tryb bulk zapisu i klika odpowiedni przycisk, wymuszając wysłanie danych do API.
- W przypadku błędów (np. walidacja tekstu czy odpowiedzi API), wyświetlany jest stosowny komunikat inline.

## 9. Warunki i walidacja

- Formularz:
  - Tekst źródłowy musi mieć od 1000 do 10000 znaków.
- Fiszki:
  - `front`: 3-200 znaków.
  - `back`: 3-500 znaków.
- Blokada interfejsu podczas trwania zapytania.
- Dodatkowa walidacja przy edycji każdej fiszki.
- Weryfikacja odpowiedzi API (sprawdzenie statusu HTTP).

## 10. Obsługa błędów

- Błędy walidacji formularza są wyświetlane pod polem tekstowym.
- W przypadku błędów API (np. 400, 500), wyświetlenie krótkiego komunikatu informującego użytkownika o problemie.
- Mechanizm retry lub informowanie o niemożności generowania fiszek.

## 11. Kroki implementacji

1. Stworzenie layoutu widoku `/generate` oraz dodanie routingu.
2. Implementacja komponentu formularza generacji:
   - Utworzenie pola tekstowego z walidacją.
   - Dodanie przycisku "Generuj" z blokadą podczas żądania.
3. Implementacja logiki API:
   - Utworzenie custom hooka np. `useFlashcardGeneration` do obsługi POST /generations.
   - Obsługa odpowiedzi i ustawienie stanu listy fiszek.
4. Dodanie komponentu spinnera widocznego podczas ładowania.
5. Implementacja komponentu listy fiszek:
   - Wyświetlanie fiszek z opcjami akcji (akceptacja, edycja, odrzucenie).
   - Aktualizacja stanu `isAccepted` i `isEditing` dla każdej fiszki.
6. Implementacja edycji pojedynczej fiszki:
   - Udostępnienie modalu lub inline edytora.
   - Walidacja edytowanych wartości.
7. Implementacja bulk zapisu:
   - Dodanie przycisków "Zapisz wszystkie" oraz "Zapisz zaakceptowane".
   - Utworzenie funkcji przekształcającej dane fiszek do formatu akceptowanego przez API i wysłanie zapytania POST /flashcards.
8. Obsługa błędów:
   - Wyświetlanie komunikatów błędów dla problemów walidacyjnych oraz API.
9. Testowanie interfejsu oraz integracji z backendem.
