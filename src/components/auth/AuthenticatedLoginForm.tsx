import { AuthProvider } from "@/components/providers/AuthProvider";
import { LoginForm } from "./LoginForm";

export function AuthenticatedLoginForm() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
