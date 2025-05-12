import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const cookieOptions: CookieOptions = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookieOptions,
      cookies: {
        get(name) {
          const cookie = context.cookies.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          context.cookies.set(name, value, options);
        },
        remove(name, options) {
          context.cookies.delete(name, options);
        },
      },
    }
  );

  return supabase;
};

// Eksportuj funkcję do tworzenia klienta dla komponentów React
export const createSupabaseClient = () => {
  return createClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);
};
