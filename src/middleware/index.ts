import { sequence } from "astro:middleware";
import type { MiddlewareHandler } from "astro";
import { authMiddleware } from "./auth.middleware";
import { supabaseClient } from "../db/supabase.client";

// Middleware do konfiguracji Supabase w kontekście
const supabaseMiddleware: MiddlewareHandler = async ({ locals }, next) => {
  locals.supabase = supabaseClient;
  return next();
};

// Sekwencja middleware - supabaseMiddleware będzie wykonywany przed authMiddleware
export const onRequest = sequence(supabaseMiddleware, authMiddleware);
