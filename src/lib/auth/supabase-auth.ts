import { supabase } from "../supabase";
import { User, Session } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {}
};

const AuthContext = createContext<AuthState>(initialState);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<Omit<AuthState, keyof Pick<AuthState, 'signIn' | 'signUp' | 'signOut' | 'resetPassword' | 'updatePassword'>>>(
    {
      user: null,
      session: null,
      loading: true,
      error: null
    }
  );

  const signIn = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      
      const mockUser = {
        id: "mock-user-id",
        email: email,
        user_metadata: {
          name: "Demo User",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString()
      } as User;
      
      const mockSession = {
        access_token: "mock-token",
        refresh_token: "mock-refresh-token",
        user: mockUser,
        expires_at: Date.now() + 3600
      } as Session;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState({ ...state, user: mockUser, session: mockSession, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      
      const mockUser = {
        id: "mock-user-id",
        email: email,
        user_metadata: {
          name: "New User",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=new"
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString()
      } as User;
      
      const mockSession = {
        access_token: "mock-token",
        refresh_token: "mock-refresh-token",
        user: mockUser,
        expires_at: Date.now() + 3600
      } as Session;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState({ ...state, user: mockUser, session: mockSession, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState({ ...state, loading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 500));
      setState({ ...state, user: null, session: null, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 500));
      setState({ ...state, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 500));
      setState({ ...state, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setState({ ...state, loading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        setState({ ...state, loading: false });
      } catch (error) {
        setState({ ...state, error: error as Error, loading: false });
      }
    };
    
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};