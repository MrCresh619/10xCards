import type { MiddlewareHandler } from "astro";

// Lista ścieżek publicznych, które nie wymagają autoryzacji
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/password-recovery",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/password-recovery",
  "/api/auth/check",
  "/api/auth/refresh-token",
  "/assets",
  "/favicon.ico"
];

export const authMiddleware: MiddlewareHandler = async ({ locals, url, redirect }, next) => {
  const isPublicPath = PUBLIC_PATHS.some(path => url.pathname.startsWith(path));

  // Pomijamy weryfikację dla ścieżek publicznych
  if (isPublicPath) {
    if (url.pathname === "/api/auth/check") {
      // Dla endpointu /api/auth/check nie ustawiamy user w locals
      return next();
    }
    // Inicjalizacja kontekstu dla innych publicznych ścieżek
    locals.user = null;
    return next();
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await locals.supabase.auth.getUser();

    if (userError || !user) {
      console.error("Błąd autoryzacji:", userError?.message);
      
      if (url.pathname.startsWith("/api/")) {
        return new Response(
          JSON.stringify({ error: "Nieautoryzowany dostęp" }), 
          { 
            status: 401,
            headers: { 
              "Content-Type": "application/json",
              "Cache-Control": "no-store"
            }
          }
        );
      }

      return redirect("/login");
    }

    // Ustawiamy pełny obiekt użytkownika w kontekście
    locals.user = user;

    // Kontynuujemy przetwarzanie żądania
    return next();

  } catch (error) {
    console.error("Krytyczny błąd w middleware auth:", error);
    
    if (url.pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({ error: "Błąd serwera" }), 
        { 
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    return redirect("/login");
  }
};
