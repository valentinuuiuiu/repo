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
  const [state, setState] = useState<Omit<AuthState, 'signIn' | 'signUp' | 'signOut' | 'resetPassword' | 'updatePassword'>>(
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setState({ ...state, user: data.user, session: data.session, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setState({ ...state, user: data.user, session: data.session, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState({ ...state, loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setState({ ...state, user: null, session: null, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setState({ ...state, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      setState({ ...state, loading: false });
    } catch (error) {
      setState({ ...state, error: error as Error, loading: false });
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setState({ ...state, error, loading: false });
        return;
      }

      if (data.session) {
        setState({
          ...state,
          user: data.session.user,
          session: data.session,
          loading: false,
        });
      } else {
        setState({ ...state, loading: false });
      }

      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setState({
          ...state,
          user: session?.user || null,
          session,
        });
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    initAuth();
  }, []);

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// For backward compatibility
export const initAuth = async () => {
  // This function is kept for compatibility but doesn't need to do anything
  // as initialization happens in the AuthProvider
};
