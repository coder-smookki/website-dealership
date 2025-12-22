import { create } from 'zustand';
import { User } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isOwner: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    return !!get().token && !!get().user;
  },

  isAdmin: () => {
    return get().user?.role === 'admin';
  },

  isOwner: () => {
    return get().user?.role === 'owner';
  },
}));

// Инициализация из localStorage
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');
if (storedUser && storedToken) {
  useAuthStore.getState().setAuth(JSON.parse(storedUser), storedToken);
}

