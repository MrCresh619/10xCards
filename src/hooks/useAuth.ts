import { useContext, useCallback } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";

// Typ dla danych z sessionStorage
interface SessionStorageAuth {
  isAuthenticated: boolean;
  user: {
    userId: string;
    email: string;
  } | null;
}

// Funkcja pomocnicza do odczytywania danych z sessionStorage
const getAuthFromStorage = (): SessionStorageAuth | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const isAuthenticated = sessionStorage.getItem("auth_status") === "true";
  const userJson = sessionStorage.getItem("auth_user");
  const user = userJson ? JSON.parse(userJson) : null;

  return { isAuthenticated, user };
};

// Funkcja pomocnicza do czyszczenia danych w sessionStorage
const clearAuthStorage = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_user");
    sessionStorage.setItem("auth_status", "false");
  }
};

// Funkcja do przekierowania użytkownika
const redirectToLogin = (): void => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export function useAuth() {
  const context = useContext(AuthContext);

  // Hook musi być wywołany na najwyższym poziomie
  const fallbackLogout = useCallback(async () => {
    console.warn("useAuth: logout wywołany w trybie fallback");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Błąd podczas wylogowywania (fallback):", error);
    }

    // Czyścimy sessionStorage
    clearAuthStorage();
    redirectToLogin();
  }, []);

  // Jeśli kontekst istnieje, użyj go
  if (context) {
    return context;
  }

  // Jeśli nie ma kontekstu, spróbuj odczytać dane z sessionStorage
  const storageAuth = getAuthFromStorage();

  if (storageAuth) {
    // Tworzymy podstawowy fallback dla kontekstu
    return {
      isAuthenticated: storageAuth.isAuthenticated,
      user: storageAuth.user,
      login: async () => {
        console.warn("useAuth: login wywołany w trybie fallback");
        window.location.reload(); // Odświeżamy stronę, aby załadować kontekst
      },
      logout: fallbackLogout,
    };
  }

  // Jeśli nie ma danych w sessionStorage, rzucamy wyjątek
  throw new Error("useAuth must be used within an AuthProvider");
}
