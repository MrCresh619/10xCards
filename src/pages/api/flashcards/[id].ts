import type { APIRoute } from "astro";
import { FlashcardService } from "@/lib/services/flashcard.service";
import { flashcardUpdateSchema } from "@/lib/schemas/flashcard.schema";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const data = await flashcardService.getFlashcardById(userId, Number(id));

    if (!data) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/flashcards/[id]:", error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    const body = await request.json();
    const validatedData = flashcardUpdateSchema.parse(body);

    const flashcardService = new FlashcardService(locals.supabase);
    const data = await flashcardService.updateFlashcard(Number(id), userId, validatedData);

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in PUT /api/flashcards/[id]:", error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    const flashcardService = new FlashcardService(locals.supabase);
    await flashcardService.deleteFlashcard(Number(id), userId);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error in DELETE /api/flashcards/[id]:", error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
