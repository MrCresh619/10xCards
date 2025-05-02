import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    // Wylogowanie z Supabase
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }

    // Usunięcie ciasteczka z tokenem
    const response = new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), {
      status: 200,
    });

    response.headers.append(
      "Set-Cookie",
      "auth-token=; HttpOnly; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );

    return response;
  } catch (error) {
    console.error("Błąd wylogowania:", error);
    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas wylogowania" }), {
      status: 500,
    });
  }
};
