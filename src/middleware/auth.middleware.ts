import type { MiddlewareHandler } from "astro";
import { supabaseClient } from "@/db/supabase.client";

// Lista ścieżek publicznych, które nie wymagają autoryzacji
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/password-recovery",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/password-recovery",
];

export const authMiddleware: MiddlewareHandler = async ({ request, redirect }, next) => {
  const url = new URL(request.url);
  const isPublicPath = PUBLIC_PATHS.some(path => url.pathname.startsWith(path));

  // Pomijamy weryfikację dla ścieżek publicznych
  if (isPublicPath) {
    return next();
  }

  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    // Jeśli nie ma sesji lub wystąpił błąd, przekierowujemy na stronę logowania
    if (error || !session) {
      return redirect("/login");
    }

    // Dodajemy informacje o sesji do kontekstu
    const response = await next();
    return response;
  } catch (error) {
    console.error("Error in auth middleware:", error);
    // W przypadku błędu przekierowujemy na stronę logowania
    return redirect("/login");
  }
};
