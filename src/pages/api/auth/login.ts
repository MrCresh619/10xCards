import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { generateJWT } from "@/lib/jwt";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    // Walidacja danych
    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email i hasło są wymagane" }), {
        status: 400,
      });
    }

    // Inicjalizacja Supabase i logowanie użytkownika
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return new Response(JSON.stringify({ message: "Nieprawidłowy email lub hasło" }), {
        status: 401,
      });
    }

    // Generujemy token JWT dla AuthProvider
    const token = generateJWT({
      userId: authData.user.id,
      email: authData.user.email,
    });

    return new Response(
      JSON.stringify({
        message: "Logowanie zakończone pomyślnie",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        token: token,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd logowania:", error);
    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas logowania" }), {
      status: 500,
    });
  }
};
