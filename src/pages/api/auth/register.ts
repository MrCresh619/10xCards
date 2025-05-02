import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import { generateJWT } from "@/lib/jwt";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    // Walidacja danych
    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email i hasło są wymagane" }), {
        status: 400,
      });
    }

    // Rejestracja użytkownika w Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return new Response(JSON.stringify({ message: authError.message }), { status: 400 });
    }

    // Generowanie tokena JWT
    const token = generateJWT({
      userId: authData.user?.id,
      email: authData.user?.email,
    });

    // Ustawienie ciasteczka z tokenem
    const response = new Response(
      JSON.stringify({
        message: "Rejestracja zakończona pomyślnie",
        token,
      }),
      { status: 200 }
    );

    response.headers.append("Set-Cookie", `auth-token=${token}; HttpOnly; Path=/; SameSite=Strict`);

    return response;
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas rejestracji" }), {
      status: 500,
    });
  }
};
