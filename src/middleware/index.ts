import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "@/db/supabase.client";

// Lista publicznych ścieżek
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/check",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });
  context.locals.supabase = supabase;

  // Pobierz dane użytkownika
  const {
    data: { user },
  } = await supabase.auth.getUser();
  context.locals.user = user;

  // Obsługa przekierowania ze strony głównej
  // if (context.url.pathname === "/") {
  //   return context.redirect(user ? "/generate" : "/login");
  // }

  // Sprawdź czy ścieżka jest publiczna
  const isPublicPath = PUBLIC_PATHS.some(path => context.url.pathname.startsWith(path));

  // Przekieruj na login tylko jeśli ścieżka nie jest publiczna i użytkownik nie jest zalogowany
  if (!isPublicPath && !user) {
    return context.redirect("/login");
  }

  return next();
});
