import { create } from 'zustand';
import { supabase } from '../lib/supabase.js';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  session: null,
  credits: null,
  plan: null,
  role: 'user',
  loading: true,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setCredits: (credits) => set({ credits }),
  setPlan: (plan) => set({ plan }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Refresh credits from API
  refreshCredits: async () => {
    try {
      const { session } = useAuthStore.getState();
      if (!session?.access_token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/credits`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const { data } = await response.json();
        set({
          credits: data.balance,
          role: data.role || 'user',
          plan: {
            id: data.plan,
            name: data.planName,
            monthlyAllowance: data.monthlyAllowance,
          },
        });
      }
    } catch (error) {
      console.error('Failed to refresh credits:', error);
    }
  },

  // Initialize auth state
  initializeAuth: async () => {
    set({ loading: true });
    
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        set({ session, user: session.user });
        // Also fetch credits
        const { refreshCredits } = useAuthStore.getState();
        await refreshCredits();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Login with email/password
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ 
        user: data.user, 
        session: data.session,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Register with email/password
  register: async (email, password, fullName) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      set({ 
        user: data.user, 
        session: data.session,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Login with Google OAuth
  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/app',
      },
    });

    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }

    return { success: true, url: data.url };
  },

  // Logout
  logout: async () => {
    set({ loading: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      set({ 
        user: null, 
        session: null, 
        loading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;

      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },
}));
