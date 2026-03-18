'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerProfileDto } from './types';

interface AuthState {
  token: string | null;
  customer: CustomerProfileDto | null;
  login: (token: string, customer: CustomerProfileDto) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      customer: null,

      login: (token, customer) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sphone_token', token);
        }
        set({ token, customer });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sphone_token');
        }
        set({ token: null, customer: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'sphone-auth',
      partialize: (state) => ({ token: state.token, customer: state.customer }),
    }
  )
);
