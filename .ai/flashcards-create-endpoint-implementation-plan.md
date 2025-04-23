# Plan Wdrożenia Endpointu API: Tworzenie Flashcardów (POST /flashcards)

## 1. Przegląd punktu końcowego

Endpoint umożliwia tworzenie jednego lub wielu flashcardów jednocześnie. Flashcardy mogą być tworzone ręcznie przez użytkownika (source: "manual") lub pochodzić z wcześniej wygenerowanych propozycji AI (source: "ai-full" lub "ai-edited"). Endpoint obsługuje scenariusz częściowego sukcesu, gdzie niektóre flashcardy mogą zostać utworzone pomyślnie, a inne mogą nie przejść walidacji.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/flashcards`
- **Parametry**:
  - Wymagane: brak (parametry są przekazywane w ciele żądania)
  - Opcjonalne: brak
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front": "Pytanie 1?",
        "back": "Odpowiedź 1.",
        "source": "manual"
      },
      {
        "front": "Pytanie 2?",
        "back": "Odpowiedź 2.",
        "source": "ai-full",
        "generated_id": 123
      }
    ]
  }
  ```

## 3. Wykorzystywane typy

- **CreateFlashcardsCommand** - model polecenia dla całego żądania
- **CreateFlashcardCommand** - model polecenia dla pojedynczego flashcarda
- **FlashcardDTO** - DTO dla pojedynczego flashcarda (odpowiedź)
- **CreateFlashcardsResponseDTO** - DTO dla odpowiedzi zawierającej utworzone flashcardy i informacje o błędach

## 4. Szczegóły odpowiedzi

- **Kod statusu**: 201 Created (pomyślne utworzenie co najmniej jednego flashcarda)
- **Format odpowiedzi**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Pytanie 1?",
        "back": "Odpowiedź 1.",
        "source": "manual",
        "user_id": "user-uuid",
        "generated_id": null,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "failed": [
      {
        "error": "Błąd walidacji: front musi zawierać co najmniej 3 znaki",
        "flashcard": {
          "front": "A?",
          "back": "Odpowiedź 2.",
          "source": "manual"
        }
      }
    ]
  }
  ```

## 5. Przepływ danych

1. Walidacja danych wejściowych przy użyciu Zod
2. Autoryzacja użytkownika (pobranie user_id z middleware)
3. Dla każdego flashcarda w żądaniu:
   - Walidacja pojedynczego flashcarda
   - Jeśli source to "ai-full" lub "ai-edited", sprawdzenie czy generation_id istnieje i należy do użytkownika
   - Próba zapisania flashcarda w bazie danych
   - Przechwycenie ewentualnych błędów i dodanie ich do listy failed
4. Zwrócenie odpowiedzi zawierającej pomyślnie utworzone flashcardy oraz listę niepowodzeń

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Wymaga zalogowanego użytkownika (obsługiwane przez middleware Astro)
- **Autoryzacja**:
  - Sprawdzenie, czy user_id z kontekstu odpowiada użytkownikowi, który stworzył generację (dla flashcardów z generated_id)
  - Zabezpieczenie przed atakami CSRF
- **Walidacja danych**:
  - Sprawdzenie poprawności danych wejściowych przy użyciu Zod
  - Sprawdzenie maksymalnej liczby flashcardów w jednym żądaniu (limit 100)
  - Sanityzacja danych tekstowych

## 7. Obsługa błędów

- **400 Bad Request**:
  - Nieprawidłowy format danych wejściowych (np. brak wymaganego pola, nieprawidłowy typ)
  - Przekroczony limit długości pól front (max 200 znaków) lub back (max 500 znaków)
  - Nieprawidłowe wartości dla pola source (dozwolone tylko: "manual", "ai-full", "ai-edited")
  - Brak pola generated_id dla source="ai-full" lub source="ai-edited"
- **401 Unauthorized**: Brak autoryzacji (niezalogowany użytkownik)
- **403 Forbidden**: Próba użycia generated_id należącego do innego użytkownika
- **404 Not Found**: Podany generated_id nie istnieje
- **500 Internal Server Error**: Błąd po stronie serwera podczas zapisu do bazy danych

## 8. Rozważania dotyczące wydajności

- Grupowe zapisywanie flashcardów do bazy danych (batch insert)
- Obsługa dużej liczby flashcardów przy użyciu paginacji
- Obsługa częściowego sukcesu/niepowodzenia dla zbioru flashcardów

## 9. Etapy wdrożenia

1. **Utworzenie pliku endpointu**:

   - Utwórz plik `src/pages/api/flashcards.ts`
   - Zdefiniuj POST jako metodę API Route

2. **Implementacja schematu walidacji**:

   - Użyj Zod do zdefiniowania schematu walidacji dla CreateFlashcardsCommand
   - Dodaj ograniczenia długości dla pól front (3-200 znaków) i back (3-500 znaków)
   - Walidacja pola source (enum: 'manual', 'ai-full', 'ai-edited')
   - Walidacja warunkowa dla generated_id (wymagane tylko dla source='ai-full' lub 'ai-edited')

3. **Utworzenie serwisu flashcardów**:

   - Utwórz plik `src/lib/services/flashcard.service.ts`
   - Zaimplementuj metodę `createFlashcards` do obsługi grupowego tworzenia flashcardów
   - Dodaj obsługę błędów i walidację

4. **Implementacja endpointu**:
   - Obsługa walidacji danych wejściowych
   - Użycie serwisu flashcardów do przetwarzania żądania
   - Formatowanie odpowiedzi zgodnie z CreateFlashcardsResponseDTO
   - Obsługa błędów i odpowiednich kodów statusu
