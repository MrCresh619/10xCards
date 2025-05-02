/// <reference types="astro/client" />
/// <reference types="@astrojs/image/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

interface User {
  id: string;
  email: string | null;
}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: User;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly JWT_SECRET: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
