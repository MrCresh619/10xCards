import { AuthProvider } from "@/components/providers/AuthProvider";
import { RegisterForm } from "./RegisterForm";

export function AuthenticatedRegisterForm() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
