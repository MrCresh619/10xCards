import type { APIRoute } from "astro";
import { verifyJWT, generateJWT } from "@/lib/jwt";

export const post: APIRoute = async ({ request, locals }) => {
  try {
    const currentToken = request.headers.get("Authorization")?.split(" ")[1];
    
    if (!currentToken) {
      return new Response(
        JSON.stringify({ error: "Brak tokenu odświeżania" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const decoded = await verifyJWT(currentToken);
    
    if (!decoded) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowy token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generujemy nowy token
    const newToken = generateJWT({
      userId: decoded.userId,
      email: decoded.email
    });

    return new Response(
      JSON.stringify({ token: newToken }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Błąd odświeżania tokenu:", error);
    return new Response(
      JSON.stringify({ error: "Błąd serwera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 