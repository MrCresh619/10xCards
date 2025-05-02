import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ message: "Email jest wymagany" }), { status: 400 });
    }

    // Wysłanie linku do resetowania hasła
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        message: "Link do resetowania hasła został wysłany na podany adres email",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd resetowania hasła:", error);
    return new Response(
      JSON.stringify({ message: "Wystąpił błąd podczas wysyłania linku resetującego" }),
      { status: 500 }
    );
  }
};
