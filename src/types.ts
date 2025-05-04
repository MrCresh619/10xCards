/*
 DTO oraz Command Models dla API, bezpośrednio powiązane z definicjami modeli bazy danych z pliku src/db/database.types.ts
*/

import type { Database } from "./db/database.types";
import type { createSupabaseServerInstance } from "./db/supabase.client";

// Typ dla źródła flashcarda
export type FlashcardSource = "manual" | "ai-full" | "ai-edited";

// DTO dla propozycji flashcarda
export interface FlashcardProposalDTO {
  front: string;
  back: string;
  source: Extract<FlashcardSource, "ai-full" | "ai-edited">;
  generated_id: number;
}

// DTO dla flashcard, odpowiadający wierszom tabeli flashcards
export type FlashcardDTO = Database["public"]["Tables"]["flashcards"]["Row"];

// Command Model do tworzenia pojedynczego flashcarda
export type CreateFlashcardCommand =
  // Dla ręcznie tworzonego flashcarda (źródło: manual), generated_id nie jest wymagane
  | {
      front: string;
      back: string;
      source: "manual";
      generated_id?: never;
    }
  // Dla flashcarda generowanego przez AI (źródła: ai-full lub ai-edited), generated_id jest wymagane
  | {
      front: string;
      back: string;
      source: Extract<FlashcardSource, "ai-full" | "ai-edited">;
      generated_id: number;
    };

// Command Model do zbiorczego tworzenia flashcards
export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardCommand[];
}

// Command Model do aktualizacji flashcarda
// Uwaga: Jeśli zmieniamy źródło na 'ai-full' lub 'ai-edited', generated_id musi być dostarczone
export interface UpdateFlashcardCommand {
  front?: string;
  back?: string;
  source?: Extract<FlashcardSource, "manual" | "ai-edited">;
  generated_id?: number;
}

// Interfejs dla paginacji
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// DTO dla listy flashcards
export interface FlashcardsListDTO {
  data: FlashcardDTO[];
  pagination: Pagination;
}

// DTO dla generacji, odpowiadający wierszom tabeli generations
export type GenerationDTO = Database["public"]["Tables"]["generations"]["Row"];

// Command Model do tworzenia generacji
export interface CreateGenerationCommand {
  source_text: string;
}

// DTO dla odpowiedzi z tworzenia generacji
export interface GenerationCreatedDTO {
  generation_id: number;
  generated_count: number;
  flashcards_proposals: FlashcardProposalDTO[];
}

// DTO dla listy generacji
export interface GenerationsListDTO {
  data: GenerationDTO[];
  pagination: Pagination;
}

// DTO dla logów błędów generacji, odpowiadający wierszom tabeli generations_error_logs
export type GenerationErrorLogDTO = Database["public"]["Tables"]["generations_error_logs"]["Row"];

// DTO dla odpowiedzi z tworzenia flashcards, zawierający zarówno pomyślne wyniki jak i błędy
export interface CreateFlashcardsResponseDTO {
  data: FlashcardDTO[];
  failed: { error: string; flashcard: CreateFlashcardCommand }[];
}

// Deklaracja interfejsu Locals dla Astro
export interface AstroLocals {
  supabase: ReturnType<typeof createSupabaseServerInstance>;
  user?: {
    id: string;
    email: string | null;
  };
  responseWasSent?: boolean;
}

declare global {
  namespace App {
    interface Locals extends AstroLocals {}
  }
}
