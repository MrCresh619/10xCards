import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { FlashcardInput, FlashcardQueryParams, FlashcardUpdateInput } from "../schemas/flashcard.schema";
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
        total: count ?? 0
      }
    };
  }

  async getFlashcardById(userId: string, id: string): Promise<FlashcardDTO | null> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID format");
    }

    const { data, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .eq("id", numericId)
      .single();

    if (error) throw error;
    return data as FlashcardDTO;
  }

  async createFlashcard(userId: string, flashcard: FlashcardInput): Promise<FlashcardDTO> {
    // Dla fiszek manualnych, generated_id powinno być null
    const generated_id = flashcard.source === "manual" ? null : flashcard.generated_id;

    const { data, error } = await this.supabase
      .from("flashcards")
      .insert([{ 
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        generated_id,
        user_id: userId 
      }])
      .select()
      .single();

    if (error) throw error;
    return data as FlashcardDTO;
  }

  async updateFlashcard(userId: string, id: string, flashcard: FlashcardUpdateInput): Promise<FlashcardDTO> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID format");
    }

    // Sprawdzamy czy aktualizacja zawiera zmianę source na ai-edited
    if (flashcard.source === "ai-edited" && !flashcard.generated_id) {
      throw new Error("generated_id is required when source is ai-edited");
    }

    const { data, error } = await this.supabase
      .from("flashcards")
      .update(flashcard)
      .eq("user_id", userId)
      .eq("id", numericId)
      .select()
      .single();

    if (error) throw error;
    return data as FlashcardDTO;
  }

  async deleteFlashcard(userId: string, id: string): Promise<true> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID format");
    }

    const { error } = await this.supabase
      .from("flashcards")
      .delete()
      .eq("user_id", userId)
      .eq("id", numericId);

    if (error) throw error;
    return true;
  }
}
