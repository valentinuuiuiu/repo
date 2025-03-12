import { ReactNode } from "react";
import {
  AuthProvider as SupabaseAuthProvider,
  useAuth,
} from "@/lib/auth/supabase-auth";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderContent({ children }: AuthProviderProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SupabaseAuthProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SupabaseAuthProvider>
  );
}
