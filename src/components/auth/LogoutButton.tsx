import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";

// Ten komponent nie wymaga useAuth, więc może być bezpiecznie renderowany na serwerze i kliencie
export function LogoutButton() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Wywołujemy bezpośrednio API wylogowania
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

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={isClient ? handleLogout : undefined}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Wyloguj</span>
    </Button>
  );
}
