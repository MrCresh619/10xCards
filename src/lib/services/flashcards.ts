import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type {
  CreateFlashcardCommand,
  FlashcardsListDTO,
  UpdateFlashcardCommand,
  CreateFlashcardsCommand,
  CreateFlashcardsResponseDTO,
  FlashcardDTO,
} from "@/types";

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getFlashcards(userId: string, page = 1, limit = 10): Promise<FlashcardsListDTO> {
    const start = (page - 1) * limit;

    // Pobierz total count
    const { count } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Pobierz dane z paginacją
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .range(start, start + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Błąd podczas pobierania fiszek: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  private async createSingleFlashcard(
    flashcard: CreateFlashcardCommand,
    userId: string
  ): Promise<FlashcardDTO> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .insert({
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        generated_id: flashcard.generated_id,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Błąd podczas tworzenia fiszki: ${error.message}`);
    }

    return data;
  }

  async createFlashcard(userId: string, command: CreateFlashcardCommand): Promise<FlashcardDTO> {
    return this.createSingleFlashcard(command, userId);
  }

  async createFlashcards(
    command: CreateFlashcardsCommand,
    userId: string
  ): Promise<CreateFlashcardsResponseDTO> {
    const results: CreateFlashcardsResponseDTO = {
      data: [],
      failed: [],
    };

    for (const flashcard of command.flashcards) {
      try {
        const data = await this.createSingleFlashcard(flashcard, userId);
        results.data.push(data);
      } catch (error) {
        results.failed.push({
          flashcard,
          error: error instanceof Error ? error.message : "Nieznany błąd",
        });
      }
    }

    return results;
  }

  async updateFlashcard(id: number, userId: string, command: UpdateFlashcardCommand) {
    // Sprawdź czy fiszka należy do użytkownika
    const { data: existingFlashcard } = await this.supabase
      .from("flashcards")
      .select()
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingFlashcard) {
      throw new Error("Nie znaleziono fiszki lub brak uprawnień do jej edycji");
    }

    const { data, error } = await this.supabase
      .from("flashcards")
      .update({
        front: command.front,
        back: command.back,
        source: command.source,
        generated_id: command.generated_id,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Błąd podczas aktualizacji fiszki: ${error.message}`);
    }

    return data;
  }

  async deleteFlashcard(id: number, userId: string) {
    const { error } = await this.supabase
      .from("flashcards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Błąd podczas usuwania fiszki: ${error.message}`);
    }
  }
}
