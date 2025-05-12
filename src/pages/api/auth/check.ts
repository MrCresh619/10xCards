import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Inicjalizacja Supabase
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Sprawdzenie sesji użytkownika
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Błąd sprawdzania sesji Supabase:", error);
      return new Response(JSON.stringify({ message: "Brak autoryzacji" }), { status: 401 });
    }

    // Użytkownik jest zalogowany
    return new Response(
      JSON.stringify({
        message: "Użytkownik zalogowany",
        user: {
          userId: user.id,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Błąd sprawdzania sesji:", error);
    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas sprawdzania sesji" }), {
      status: 500,
    });
  }
};
