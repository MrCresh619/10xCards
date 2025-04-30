import { z } from "zod";
import { supabaseClient } from "@/db/supabase.client";
import type { User, Session } from "@supabase/supabase-js";

// Schematy walidacji
export const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format adresu email"),
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const passwordRecoverySchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

// Typy odpowiedzi
interface AuthResponseBase {
  error?: string;
  details?: unknown;
  status: number;
}

interface RegisterResponse extends AuthResponseBase {
  data?: {
    user: User | null;
  };
}

interface LoginResponse extends AuthResponseBase {
  data?: {
    user: User;
    session: Session;
  };
}

interface MessageResponse extends AuthResponseBase {
  data?: {
    message: string;
  };
}

// Serwis autentykacji
export const AuthService = {
  // Rejestracja nowego użytkownika
  async registerUser(data: z.infer<typeof registerSchema>): Promise<RegisterResponse> {
    try {
      const validatedData = registerSchema.parse(data);

      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (authError) {
        return {
          error: "Błąd podczas rejestracji",
          details: authError.message,
          status: 400,
        };
      }

      return {
        data: { user: authData.user },
        status: 201,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: "Błąd walidacji danych",
          details: error.errors,
          status: 422,
        };
      }

      return {
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  // Logowanie użytkownika
  async loginUser(data: z.infer<typeof loginSchema>): Promise<LoginResponse> {
    try {
      const validatedData = loginSchema.parse(data);

      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (authError) {
        return {
          error: "Błąd podczas logowania",
          details: authError.message,
          status: 400,
        };
      }

      return {
        data: { user: authData.user, session: authData.session },
        status: 200,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: "Błąd walidacji danych",
          details: error.errors,
          status: 422,
        };
      }

      return {
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  // Wylogowanie użytkownika
  async logoutUser(): Promise<MessageResponse> {
    try {
      const { error: signOutError } = await supabaseClient.auth.signOut();

      if (signOutError) {
        return {
          error: "Błąd podczas wylogowywania",
          details: signOutError.message,
          status: 400,
        };
      }

      return {
        data: { message: "Wylogowanie zakończone sukcesem" },
        status: 200,
      };
    } catch (error) {
      return {
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  // Odzyskiwanie hasła
  async passwordRecovery(
    data: z.infer<typeof passwordRecoverySchema>,
    origin: string
  ): Promise<MessageResponse> {
    try {
      const validatedData = passwordRecoverySchema.parse(data);

      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(
        validatedData.email,
        {
          redirectTo: `${origin}/reset-password`,
        }
      );

      if (resetError) {
        return {
          error: "Błąd podczas wysyłania linku resetującego hasło",
          details: resetError.message,
          status: 400,
        };
      }

      return {
        data: { message: "Link do resetowania hasła został wysłany na podany adres email" },
        status: 200,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: "Błąd walidacji danych",
          details: error.errors,
          status: 422,
        };
      }

      return {
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },
};
