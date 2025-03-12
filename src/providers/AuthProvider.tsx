import { ReactNode, useEffect } from "react";
import { initAuth, useAuth } from "@/lib/auth/supabase-auth";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { loading } = useAuth();

  useEffect(() => {
    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
