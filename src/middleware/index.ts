import { sequence } from "astro:middleware";
import type { MiddlewareHandler } from "astro";
import { authMiddleware } from "./auth.middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Middleware do konfiguracji Supabase w kontekście
const supabaseMiddleware: MiddlewareHandler = async ({ locals, cookies, request }, next) => {
  locals.supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  return next();
};

// Sekwencja middleware - supabaseMiddleware będzie wykonywany przed authMiddleware
export const onRequest = sequence(supabaseMiddleware, authMiddleware);
