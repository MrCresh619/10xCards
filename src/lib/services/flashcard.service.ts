import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type {
  FlashcardInput,
  FlashcardQueryParams,
  FlashcardUpdateInput,
} from "../schemas/flashcard.schema";
import type { FlashcardDTO, FlashcardsListDTO } from "../../types";

export class FlashcardService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getFlashcards(userId: string, params: FlashcardQueryParams): Promise<FlashcardsListDTO> {
    const { page, limit, search, sort } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sort.replace("-", ""), { ascending: !sort.startsWith("-") })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`front.ilike.%${search}%,back.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return {
      data: data as FlashcardDTO[],
      pagination: {
        page,
        limit,
        total: count ?? 0,
      },
    };
  }

  async getFlashcardById(userId: string, id: number): Promise<FlashcardDTO | null> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as FlashcardDTO;
  }

  async createFlashcard(userId: string, flashcard: FlashcardInput): Promise<FlashcardDTO> {
    // Dla fiszek manualnych, generated_id powinno być null
    const generated_id = flashcard.source === "manual" ? null : flashcard.generated_id;

    const { data, error } = await this.supabase
      .from("flashcards")
      .insert([
        {
          front: flashcard.front,
          back: flashcard.back,
          source: flashcard.source,
          generated_id,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as FlashcardDTO;
  }

  async updateFlashcard(
    id: number,
    userId: string,
    flashcard: FlashcardUpdateInput
  ): Promise<FlashcardDTO> {
    // Sprawdzamy czy aktualizacja zawiera zmianę source na ai-edited
    if (flashcard.source === "ai-edited" && !flashcard.generated_id) {
      throw new Error("generated_id is required when source is ai-edited");
    }

    const { data, error } = await this.supabase
      .from("flashcards")
      .update(flashcard)
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as FlashcardDTO;
  }

  async deleteFlashcard(id: number, userId: string): Promise<true> {
    const { error } = await this.supabase
      .from("flashcards")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    if (error) throw error;
    return true;
  }
}
