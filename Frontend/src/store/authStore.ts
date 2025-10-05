import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../types';
import { authAPI } from '../services/api';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          if (response.success) {
            set({
              user: response.data!.user,
              token: response.data!.token,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.signup(name, email, password);
          if (response.success) {
            set({
              user: response.data?.user,
              token: response.data?.token,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Signup failed',
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = get();
          const response = await authAPI.updateProfile(data, token!);
          if (response.success) {
            set({
              user: response.data?.user,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Profile update failed',
          });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const { token } = get();
          if (!token) return;

          const response = await authAPI.refreshToken(token);
          if (response.success) {
            set({ token: response.data?.token });
          }
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);