import { create } from 'zustand';
import { User } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isOwner: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, token: accessToken, refreshToken });
  },

  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, refreshToken: null });
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
const storedRefreshToken = localStorage.getItem('refreshToken');
if (storedUser && storedToken && storedRefreshToken) {
  useAuthStore.getState().setAuth(JSON.parse(storedUser), storedToken, storedRefreshToken);
}

