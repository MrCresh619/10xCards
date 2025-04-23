# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

- Endpoint POST /generations umożliwia uruchomienie procesu generacji propozycji flashcardów przy użyciu AI.
- Walidacja odbywa się poprzez sprawdzenie, czy długość przekazanego `source_text` mieści się w przedziale od 1000 do 10000 znaków.
- Po poprawnej walidacji wywoływany jest zewnętrzny LLM API, który generuje propozycje flashcardów.
- Wynik operacji zapisywany jest w tabeli `generations`, a flashcardy mogą być powiązane z rekordem generacji.
- Endpoint wymaga, aby użytkownik był uwierzytelniony.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** /generations
- **Parametry:**
  - **Wymagane:**
    - `source_text` (string) – tekst źródłowy zawierający treść do analizy, o długości 1000-10000 znaków.
  - **Opcjonalne:** Brak
- **Body żądania (JSON):**
  ```json
  {
    "source_text": "Długi tekst między 1000 a 10000 znaków..."
  }
  ```

## 3. Wykorzystywane typy

- **DTO i Command Modele (z pliku src/types.ts):**
  - `CreateGenerationCommand` – komenda do inicjowania generacji (pole: source_text).
  - `GenerationCreatedDTO` – DTO odpowiadający odpowiedzi zawierającej:
    - `generation_id` (number)
    - `generated_count` (number)
    - `flashcards_proposals` – lista obiektów typu `FlashcardProposalDTO` (z polami: front, back, source)
  - `FlashcardProposalDTO` – DTO dla pojedynczej propozycji flashcarda.

## 4. Szczegóły odpowiedzi

- **Status przy pomyślnym wykonaniu:** 201 Created
- **Struktura odpowiedzi (JSON):**
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      {
        "front": "Question 1?",
        "back": "Answer 1",
        "source": "ai-full"
      },
      {
        "front": "Question 2?",
        "back": "Answer 2",
        "source": "ai-full"
      }
      // ... więcej flashcardów
    ],
    "generated_count": 5
  }
  ```
- **Kody błędów:**
  - 400 – Błąd walidacji (np. niewłaściwa długość `source_text`).
  - 401 – Brak autoryzacji (użytkownik nie jest zalogowany).
  - 500 – Błąd serwera lub problem z zewnętrznym API.

## 5. Przepływ danych

1. **Walidacja danych wejściowych:**
   - Sprawdzenie obecności i długości `source_text`.
2. **Autoryzacja:**
   - Weryfikacja tożsamości użytkownika (integracja z Supabase Auth).
3. **Wywołanie zewnętrznego API:**
   - Przekazanie `source_text` do zewnętrznego LLM API.
   - Odebranie propozycji flashcardów oraz informacji o liczbie wygenerowanych elementów.
4. **Przetwarzanie odpowiedzi:**
   - Obliczenie `generated_count` oraz przetworzenie listy `flashcardsProposals`.
5. **Zapis do bazy danych:**
   - Utworzenie rekordu w tabeli `generations` z danymi generacji (w tym hash tekstu źródłowego, długość tekstu, model, czas wykonania, itp.).
   - Opcjonalnie, zapis powiązanych rekordów flashcardów w tabeli `flashcards` (referencja poprzez `generated_id`).
6. **Odpowiedź:**
   - Wysłanie poprawnej odpowiedzi w formacie JSON zgodnie z `GenerationCreatedDTO`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Endpoint wymaga, aby użytkownik był poprawnie zalogowany (np. poprzez Supabase Auth).
- **Walidacja danych:** Zapewnienie, że `source_text` mieści się w określonym zakresie, co zapobiega nadużyciom (np. atakom DoS).
- **Bezpieczeństwo komunikacji:** Wszystkie połączenia z zewnętrznym LLM API powinny być szyfrowane (HTTPS).
- **Ograniczenia zapytań:** Implementacja rate limiting, aby zapobiec nadużyciom.

## 7. Obsługa błędów

- **400 Bad Request:**
  - Błąd walidacji danych wejściowych (m.in. brak `source_text` lub nieprawidłowa długość).
- **401 Unauthorized:**
  - Użytkownik nie jest uwierzytelniony.
- **500 Internal Server Error:**
  - Problem z wywołaniem zewnętrznego API lub zapisem danych do bazy.
- **Rejestracja błędów:**
  - W przypadku wystąpienia błędów, szczegóły są zapisywane w tabeli `generations_error_logs` (z polami: error_code, error_message, timestamp, itp.).

## 8. Rozważania dotyczące wydajności

- **Optymalizacja zapytań do bazy danych:** Upewnienie się, że zapytania są indeksowane, szczególnie po polu `user_id`.
- **Asynchroniczny proces wywołania zewnętrznego API:** Aby nie blokować głównego wątku, wywołanie LLM API powinno być asynchroniczne.
- **Limity i timeouty:** 60s poźniej timeout.

## 9. Etapy wdrożenia

1. **Walidacja danych wejściowych:**
   - Implementacja sprawdzania obecności i długości `source_text`.
2. **Integracja uwierzytelniania:**
   - Weryfikacja tożsamości użytkownika przy użyciu Supabase Auth.
3. **Implementacja komunikacji z LLM API:**
   - Stworzenie modułu/serwisu `genertion.service` do wywołania zewnętrznego API odpowiedzialnego za generację flashcardów.
4. **Logika biznesowa:**
   - Przetwarzanie odpowiedzi z LLM API i formatowanie danych zgodnie z `GenerationCreatedDTO`.
5. **Zapis do bazy danych:**
   - Implementacja logiki tworzenia rekordu w tabeli `generations` i ewentualnego powiązania z tabelą `flashcards`.
6. **Obsługa błędów i logowanie:**
   - Implementacja mechanizmu zapisu błędów do tabeli `generations_error_logs` oraz odpowiedniego zwracania kodów błędów.
7. **Testowanie:**
   - Przeprowadzenie testów jednostkowych oraz integracyjnych dla całego przepływu.
8. **Optymalizacja:**
   - Monitorowanie wydajności i ewentualna optymalizacja zapytań lub konfiguracji połączenia z LLM API.
