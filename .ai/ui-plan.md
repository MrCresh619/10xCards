# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Interfejs użytkownika został zaprojektowany w oparciu o kluczowe wymagania produktu. Główny podział obejmuje widoki autentykacji, widok generacji fiszek, widok listy wszystkich fiszek, profil użytkownika oraz opcjonalny modal edycji. Struktura uwzględnia responsywność, dostępność (WCAG AA) oraz bezpieczeństwo operacji (autoryzacja JWT, walidacja danych).

## 2. Lista widoków

- **Ekran logowania (Login)**

  - Ścieżka: `/login`
  - Główny cel: Umożliwienie użytkownikowi logowania.
  - Kluczowe informacje: Pola na e-mail i hasło, przycisk logowania, link do rejestracji przenoszący do widoku rejestracji.
  - Kluczowe komponenty: Formularz logowania z walidacją, komunikaty błędów, przyciski akcji.
  - Uwagi: Zgodność z WCAG AA oraz zabezpieczenie danych użytkownika.

- **Ekran rejestracji (Register)**

  - Ścieżka: `/register`
  - Główny cel: Umożliwienie użytkownikowi rejestracji konta.
  - Kluczowe informacje: Pola na e-mail, hasło, potwierdzenie hasła, przycisk rejestracji.
  - Kluczowe komponenty: Formularz rejestracji z walidacją, komunikaty błędów, przyciski akcji.
  - Uwagi: Użytkownik powinien mieć możliwość powrotu do ekranu logowania.

- **Dashboard generacji fiszek**

  - Ścieżka: `/generate`
  - Główny cel: Centralne miejsce do generacji fiszek AI, wyświetlania propozycji fiszek oraz umożliwienie akceptowania, edycji lub usuwania fiszek.
  - Kluczowe informacje: Pole tekstowe do wprowadzania długiego tekstu (source_text), przycisk "Generuj", spinner "GENERATING", lista propozycji fiszek z opcjami akcji.
  - Kluczowe komponenty: Formularz generacji fiszek, lista/tabela fiszek, dwa tryby bulkowego zapisu ("Zapisz wszystkie" oraz "Zapisz zaakceptowane"), komponent spinnera.
  - Uwagi: Blokada inputu i przycisku podczas generacji, wyświetlanie błędów inline.

- **Lista wszystkich fiszek**

  - Ścieżka: `/flashcards`
  - Główny cel: Wyświetlenie pełnej listy fiszek (zarówno generowanych, jak i ręcznie utworzonych).
  - Kluczowe informacje: Przegląd wszystkich fiszek, możliwość filtrowania, sortowania i paginacji.
  - Kluczowe komponenty: Tabela lub lista fiszek, filtry wyszukiwania, przyciski paginacji.
  - Uwagi: Ułatwienie zarządzania wszystkimi fiszkami w jednym widoku.

- **Profil użytkownika**

  - Ścieżka: `/profile`
  - Główny cel: Zarządzanie danymi użytkownika i ustawieniami konta.
  - Kluczowe informacje: Dane użytkownika (adres e-mail, itd.), konfiguracja widoczności modalu edycji.
  - Kluczowe komponenty: Komponent danych użytkownika, przełącznik ustawień.
  - Uwagi: Zapewnienie bezpieczeństwa danych oraz łatwość zarządzania ustawieniami konta.

- **Widok szczegółów fiszki**
  - Ścieżka: `/flashcard/:id`
  - Główny cel: Wyświetlenie pełnych informacji o fiszce, z możliwością jej edycji lub usunięcia.
  - Kluczowe informacje: Szczegółowa treść fiszki, historia edycji, opcje akcji (edycja, usuwanie).
  - Kluczowe komponenty: Szczegółowy widok fiszki, przyciski akcji.
  - Uwagi: Ułatwienie przeglądu szczegółowej informacji i zarządzania pojedynczą fiszką.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na ekran logowania (`/login`) lub rejestracji (`/register`) w celu uwierzytelnienia.
2. Po pomyślnym logowaniu następuje przekierowanie na widok generacji fiszek (`/generate`).
3. Na widoku generacji fiszek użytkownik wprowadza długi tekst (source_text) w formularzu i klika przycisk "Generuj":
   - Input oraz przycisk zostają zablokowane.
   - Wyświetlany jest spinner z napisem "GENERATING", informujący o trwającym procesie generacji fiszek.
4. Po zakończeniu generacji pojawia się lista propozycji fiszek, którą użytkownik może przeglądać, akceptować, edytować lub usuwać.
5. Użytkownik może zapisać zmiany za pomocą opcji bulkowego zapisu: "Zapisz wszystkie" lub "Zapisz zaakceptowane". Dane są przesyłane do API.
6. Użytkownik ma możliwość przejścia do widoku listy wszystkich fiszek (`/flashcards`) w celu pełnego zarządzania fiszkami.
7. Użytkownik może przejść do swojego profilu (`/profile`) w celu zarządzania danymi konta i ustawieniami.
8. W przypadku wystąpienia błędów podczas operacji (np. walidacji formularza lub problemów z API) system wyświetla komunikaty błędów inline lub w formie powiadomień, informując użytkownika o przyczynach oraz sugerując możliwe rozwiązania.

## 4. Układ i struktura nawigacji

- Główna nawigacja składa się z paska z odnośnikami do kluczowych widoków: Dashboard generacji fiszek, Lista wszystkich fiszek, Profil użytkownika oraz opcja wylogowania.
- Nawigacja jest responsywna i dostosowana do różnych rozmiarów ekranów (sm, md, lg) dzięki zastosowaniu klas Tailwind CSS.
- Menu boczne lub rozwijane umożliwia szybkie przełączanie między widokami bez konieczności przeładowania strony.
- System komunikatów (powiadomienia) informuje użytkownika o stanie operacji, błędach walidacji oraz sukcesach działań (np. zapis danych, błąd generacji).

## 5. Kluczowe komponenty

- **Formularz logowania**: Odpowiedzialny za obsługę uwierzytelnienia użytkownika, zawiera pola e-mail, hasło, walidację oraz komunikaty błędów.
- **Formularz rejestracji**: Umożliwia rejestrację nowego konta, zawiera pola e-mail, hasło, potwierdzenie hasła oraz komunikaty błędów.
- **Formularz generacji fiszek**: Zawiera pole tekstowe dla source_text, przycisk "Generuj" i komponent spinnera "GENERATING" wyświetlany podczas przetwarzania.
- **Lista fiszek**: Prezentuje wygenerowane lub ręcznie utworzone fiszki wraz z opcjami edycji, zatwierdzenia i usunięcia.
- **Modal edycji**: Opcjonalny komponent umożliwiający szczegółową edycję wybranej fiszki w formie okna modal, aktywowany na podstawie ustawień użytkownika.
- **Profil użytkownika**: Prezentuje dane użytkownika oraz umożliwia zarządzanie ustawieniami konta.
- **Komponent powiadomień**: Umożliwia wyświetlanie komunikatów informacyjnych, błędów oraz statusów operacji w interfejsie.
