import type { APIRoute } from "astro";
import { FlashcardService } from "@/lib/services/flashcard.service";
import { flashcardQuerySchema, flashcardSchema } from "@/lib/schemas/flashcard.schema";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedParams = flashcardQuerySchema.parse({
      ...queryParams,
      page: Number(queryParams.page) || 1,
      limit: Number(queryParams.limit) || 10
    });

    const flashcardService = new FlashcardService(locals.supabase);
    const data = await flashcardService.getFlashcards(userId, validatedParams);

    return new Response(
      JSON.stringify({
        data: data.data,
        meta: {
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/flashcards:", error);
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await request.json();
    
    // Sprawdzamy czy to jest pojedyncza fiszka czy tablica fiszek
    if (Array.isArray(body.flashcards)) {
      // Obsługa wielu fiszek
      const flashcardService = new FlashcardService(locals.supabase);
      const results = {
        data: [],
        failed: []
      };

      for (const flashcard of body.flashcards) {
        try {
          const data = await flashcardService.createFlashcard(userId, flashcard);
          results.data.push(data);
        } catch (error) {
          results.failed.push({
            flashcard,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      return new Response(JSON.stringify(results), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      // Obsługa pojedynczej fiszki
      const validatedData = flashcardSchema.parse(body);
      const flashcardService = new FlashcardService(locals.supabase);
      const data = await flashcardService.createFlashcard(userId, validatedData);

      return new Response(JSON.stringify({ data }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Error in POST /api/flashcards:", error);
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}; 