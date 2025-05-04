import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export function LogoutButton() {
  const [isClient, setIsClient] = useState(false);
  // Zawsze używamy useAuth, niezależnie od tego, czy zadziała
  const auth = { logout: async () => {} }; // Domyślna wartość
  
  let hasAuthError = false;
  let authContextValue = null;
  
  try {
    // Próbujemy pobrać kontekst, ale nie przypisujemy go bezpośrednio do zmiennej z hooka
    authContextValue = useAuth();
  } catch (error) {
    hasAuthError = true;
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Obsługa bez hooka useAuth, na wypadek problemów z kontekstem
  const handleLogoutFallback = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    } finally {
      // Czyścimy sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_user");
        sessionStorage.setItem("auth_status", "false");
      }
      window.location.href = "/login";
    }
  };

  // Jeśli nie jesteśmy po stronie klienta, renderujemy przycisk bez logiki
  if (!isClient) {
    return (
      <Button variant="ghost" size="sm" className="flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        <span>Wyloguj</span>
      </Button>
    );
  }

  const handleLogout = async () => {
    if (hasAuthError || !authContextValue) {
      // Używamy fallbacka, jeśli kontekst nie jest dostępny
      await handleLogoutFallback();
    } else {
      // Używamy kontekstu, jeśli jest dostępny
      await authContextValue.logout();
      window.location.href = "/login";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Wyloguj</span>
    </Button>
  );
} 