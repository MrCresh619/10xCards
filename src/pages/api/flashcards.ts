import type { APIRoute } from "astro";
import { ZodError, z } from "zod";
import type { CreateFlashcardsCommand } from "../../types";
import { FlashcardService } from "../../lib/services/flashcard.service";
import { createSupabaseServerInstance } from "../../db/supabase.client";

export const prerender = false;

// Schemat walidacji dla pojedynczego flashcarda
const createFlashcardSchema = z.discriminatedUnion("source", [
  // Dla ręcznie tworzonych flashcardów (source: "manual")
  z.object({
    front: z
      .string()
      .min(3, { message: "Pytanie musi zawierać co najmniej 3 znaki" })
      .max(200, { message: "Pytanie nie może przekraczać 200 znaków" }),
    back: z
      .string()
      .min(3, { message: "Odpowiedź musi zawierać co najmniej 3 znaki" })
      .max(500, { message: "Odpowiedź nie może przekraczać 500 znaków" }),
    source: z.literal("manual"),
    generated_id: z.undefined().optional(),
  }),
  // Dla flashcardów pochodzących z AI (source: "ai-full")
  z.object({
    front: z
      .string()
      .min(3, { message: "Pytanie musi zawierać co najmniej 3 znaki" })
      .max(200, { message: "Pytanie nie może przekraczać 200 znaków" }),
    back: z
      .string()
      .min(3, { message: "Odpowiedź musi zawierać co najmniej 3 znaki" })
      .max(500, { message: "Odpowiedź nie może przekraczać 500 znaków" }),
    source: z.literal("ai-full"),
    generated_id: z.number({ required_error: "ID generacji jest wymagane dla źródła AI" }),
  }),
  // Dla flashcardów pochodzących z AI (source: "ai-edited")
  z.object({
    front: z
      .string()
      .min(3, { message: "Pytanie musi zawierać co najmniej 3 znaki" })
      .max(200, { message: "Pytanie nie może przekraczać 200 znaków" }),
    back: z
      .string()
      .min(3, { message: "Odpowiedź musi zawierać co najmniej 3 znaki" })
      .max(500, { message: "Odpowiedź nie może przekraczać 500 znaków" }),
    source: z.literal("ai-edited"),
    generated_id: z.number({ required_error: "ID generacji jest wymagane dla źródła AI" }),
  }),
]);

// Schemat walidacji dla całego żądania
const createFlashcardsSchema = z.object({
  flashcards: z
    .array(createFlashcardSchema)
    .min(1, { message: "Wymagany jest co najmniej jeden flashcard" })
    .max(100, { message: "Przekroczono maksymalną liczbę flashcardów (limit: 100)" }),
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
    const requestData: CreateFlashcardsCommand = await request.json();
    const validatedData = createFlashcardsSchema.parse(requestData);

    // Inicjalizacja serwisu flashcardów z supabaseClient
    const flashcardService = new FlashcardService(supabase);

    // Wywołanie metody tworzącej flashcardy z użyciem ID zalogowanego użytkownika
    const result = await flashcardService.createFlashcards(validatedData, user.id);

    if (result.data.length > 0) {
      console.log("[SUCCESS] Utworzono flashcards:", result.data);
    }
    if (result.failed.length > 0) {
      console.error("[ERROR] Flashcards nie zostały utworzone:", result.failed);
    }

    // Ustalenie statusu odpowiedzi (201 jeśli utworzono przynajmniej jeden flashcard, 400 jeśli wszystkie się nie powiodły)
    const status = result.data.length > 0 ? 201 : 400;

    return new Response(JSON.stringify(result), {
      status: status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas przetwarzania żądania:", error);

    // Obsługa błędów walidacji
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Błąd walidacji",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ogólna obsługa błędów
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas tworzenia flashcardów.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
