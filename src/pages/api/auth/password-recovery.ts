import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const origin = new URL(request.url).origin;
  const response = await AuthService.passwordRecovery(data, origin);

  return new Response(
    JSON.stringify(response.data || { error: response.error, details: response.details }),
    { status: response.status }
  );
};
