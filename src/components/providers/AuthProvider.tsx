import { createContext, useEffect, useState } from "react";

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// Eksportujemy AuthContext, aby był dostępny dla hooka useAuth
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Inicjalizujemy stan z sessionStorage, jeśli jest dostępny
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("auth_user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("auth_status") === "true";
    }
    return false;
  });

  // Funkcja do sprawdzania stanu autoryzacji
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);

        // Zapisujemy stan w sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("auth_user", JSON.stringify(data.user));
          sessionStorage.setItem("auth_status", "true");
        }

        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);

        // Czyścimy sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("auth_user");
          sessionStorage.setItem("auth_status", "false");
        }

        return false;
      }
    } catch (error) {
      console.error("Błąd sprawdzania autoryzacji:", error);
      setUser(null);
      setIsAuthenticated(false);

      // Czyścimy sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_user");
        sessionStorage.setItem("auth_status", "false");
      }

      return false;
    }
  };

  // Sprawdzenie stanu autoryzacji przy montowaniu komponentu
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async () => {
    // Sprawdzamy stan autoryzacji po zalogowaniu
    await checkAuthStatus();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);

      // Czyścimy sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_user");
        sessionStorage.setItem("auth_status", "false");
      }
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
