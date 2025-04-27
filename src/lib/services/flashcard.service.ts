import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateFlashcardsCommand,
  CreateFlashcardsResponseDTO,
  FlashcardDTO,
} from "../../types";

export class FlashcardService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Tworzy wiele flashcardów jednocześnie, obsługując również częściowe powodzenie/niepowodzenie
   * @param command Obiekt z tablicą flashcardów do utworzenia
   * @param userId ID użytkownika tworzącego flashcardy
   * @returns Obiekt zawierający pomyślnie utworzone flashcardy i informacje o błędach
   */
  async createFlashcards(
    command: CreateFlashcardsCommand,
    userId: string
  ): Promise<CreateFlashcardsResponseDTO> {
    const result: CreateFlashcardsResponseDTO = {
      data: [],
      failed: [],
    };

    // Iterujemy po każdym flashcardzie do utworzenia
    for (const flashcardCommand of command.flashcards) {
      try {
        // Sprawdzamy czy flashcard korzysta z generacji AI i czy należy do użytkownika
        if (flashcardCommand.source !== "manual" && flashcardCommand.generated_id) {
          const { data: generation, error: generationError } = await this.supabase
            .from("generations")
            .select("id")
            .eq("id", flashcardCommand.generated_id)
            .eq("user_id", userId)
            .single();

          // Jeśli nie znaleziono generacji lub wystąpił błąd, dodajemy ten flashcard do niepowodzeń
          if (generationError || !generation) {
            result.failed.push({
              error: "Podana generacja nie istnieje lub nie należy do użytkownika",
              flashcard: flashcardCommand,
            });
            continue;
          }
        }

        // Przygotowanie danych do wstawienia do bazy danych
        const flashcardData = {
          ...flashcardCommand,
          user_id: userId,
        };

        // Wstawiamy flashcard do bazy danych
        const { data: newFlashcard, error } = await this.supabase
          .from("flashcards")
          .insert(flashcardData)
          .select("*")
          .single();

        // Jeśli wystąpił błąd, dodajemy ten flashcard do niepowodzeń i logujemy błąd
        if (error) {
          console.error("[FLASHCARD SERVICE ERROR] Podczas zapisywania flashcarda:", error);
          result.failed.push({
            error: `Błąd podczas zapisywania do bazy danych: ${error.message}`,
            flashcard: flashcardCommand,
          });
        } else if (newFlashcard) {
          console.log("[FLASHCARD SERVICE SUCCESS] Flashcard utworzony:", newFlashcard);
          // Dodajemy utworzony flashcard do listy pomyślnie utworzonych
          result.data.push(newFlashcard as FlashcardDTO);
        }
      } catch (err) {
        // Obsługa nieoczekiwanych błędów
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";
        result.failed.push({
          error: `Nieoczekiwany błąd: ${errorMessage}`,
          flashcard: flashcardCommand,
        });
      }
    }

    return result;
  }
}
