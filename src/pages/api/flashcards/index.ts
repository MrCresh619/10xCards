import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { flashcardQuerySchema, flashcardSchema } from "../../../lib/schemas/flashcard.schema";

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
    const validatedParams = flashcardQuerySchema.parse(queryParams);

    const flashcardService = new FlashcardService(locals.supabase);
    const { data, count } = await flashcardService.getFlashcards(userId, validatedParams);

    return new Response(
      JSON.stringify({
        data,
        meta: {
          total: count,
          page: validatedParams.page,
          limit: validatedParams.limit,
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
    const validatedData = flashcardSchema.parse(body);

    const flashcardService = new FlashcardService(locals.supabase);
    const data = await flashcardService.createFlashcard(userId, validatedData);

    return new Response(JSON.stringify({ data }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
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