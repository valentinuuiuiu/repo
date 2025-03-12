import { supabase } from "../supabase";
import { User, Session } from "@supabase/supabase-js";
import { create } from "zustand";

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

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user, session: data.session, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
      throw error;
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user, session: data.session, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
      throw error;
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
      throw error;
    }
  },
  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      set({ loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
      throw error;
    }
  },
  updatePassword: async (password: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      set({ loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
      throw error;
    }
  },
}));

// Initialize auth state
export const initAuth = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    useAuth.setState({ error, loading: false });
    return;
  }

  if (data.session) {
    useAuth.setState({
      user: data.session.user,
      session: data.session,
      loading: false,
    });
  } else {
    useAuth.setState({ loading: false });
  }

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    useAuth.setState({
      user: session?.user || null,
      session,
    });
  });
};
