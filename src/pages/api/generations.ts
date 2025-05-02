import type { APIRoute } from "astro";
import { ZodError, z } from "zod";
import type { CreateGenerationCommand, GenerationCreatedDTO } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";
import { createSupabaseServerInstance } from "../../db/supabase.client";

export const prerender = false;

// Schemat walidacji dla żądania
const createGenerationSchema = z.object({
  source_text: z
    .string()
    .min(1000, {
      message: "Tekst źródłowy musi zawierać co najmniej 1000 znaków",
    })
    .max(10000, {
      message: "Tekst źródłowy nie może przekraczać 10000 znaków",
    }),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Inicjalizacja Supabase i pobranie aktualnego użytkownika
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Nieautoryzowany dostęp" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobranie i walidacja danych wejściowych
    const requestData: CreateGenerationCommand = await request.json();
    const validatedData = createGenerationSchema.parse(requestData);

    // Inicjalizacja serwisu generacji
    const generationService = new GenerationService();

    // Wywołanie generacji flashcardów z ID zalogowanego użytkownika
    const result = await generationService.generateFlashcards(validatedData.source_text, user.id);

    // Utworzenie odpowiedzi
    const response: GenerationCreatedDTO = {
      generation_id: result.generation_id,
      flashcards_proposals: result.flashcards_proposals,
      generated_count: result.generated_count,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas przetwarzania żądania:", error);

    // Obsługa błędów walidacji
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "Błąd walidacji", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ogólna obsługa błędów
    return new Response(
      JSON.stringify({ error: "Wystąpił nieoczekiwany błąd podczas generowania flashcardów." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
