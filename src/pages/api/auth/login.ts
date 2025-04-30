import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const response = await AuthService.loginUser(data);

  return new Response(
    JSON.stringify(response.data || { error: response.error, details: response.details }),
    { status: response.status }
  );
};
