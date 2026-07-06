import { create } from 'zustand';
import type { UserProfile } from '../types';

interface AuthState {
  readonly user: UserProfile | null;
  readonly token: string | null;
  readonly isAuthenticated: boolean;
}

interface AuthActions {
  readonly setAuth: (user: UserProfile, token: string) => void;
  readonly updateUserProfile: (user: UserProfile) => void;
  readonly logout: () => void;
  readonly hydrate: () => Promise<void>;
}

const TOKEN_KEY = 'kickoff_club_jwt_token';
const USER_KEY = 'kickoff_club_user_profile';

const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    
    if (token && userJson) {
      const user = JSON.parse(userJson) as UserProfile;
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.error('Error al obtener la sesión inicial:', error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...getInitialState(),

  setAuth: (user, token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error al persistir la sesión:', error);
    }
  },

  updateUserProfile: (user) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error al persistir el perfil actualizado:', error);
    }
    set({ user });
  },

  logout: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error al limpiar la sesión:', error);
    }
  },

  hydrate: async (): Promise<void> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (!token || !userJson) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    try {
      const { apiClient } = await import('./api/apiClient');
      const { API_ROUTES } = await import('./api/routes');

      const user = await apiClient<UserProfile>(API_ROUTES.users.me, {
        method: 'GET',
      });

      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    } catch (error: unknown) {
      console.error('Error durante la hidratación de sesión:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
