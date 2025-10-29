import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//
//
interface User {
  id: string;
  name: string;
  username: string;
  role: 'OPERATOR' | 'SUPERVISOR' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const API_URL = 'http://localhost:3000';

export const useAuthStore = create<AuthState>()(
  // O middleware 'persist' salva automaticamente o estado no localStorage
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /**
       * Tenta autenticar o usuário na API.
       * (POST /auth/login)
       */
      login: async (username, password) => {
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            throw new Error('Usuário ou senha inválidos.');
          }

          const data: { user: User; access_token: string } = await response.json();

          // Salva o estado
          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          console.error(error);
          throw error; // Propaga o erro para o formulário de login
        }
      },

      /**
       * Desloga o usuário, limpando o estado e o localStorage
       */
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // O 'persist' middleware limpará o localStorage
      },
    }),
    {
      name: 'sgo-auth-storage', // Nome da chave no localStorage
      // Define quais partes do estado devem ser persistidas
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);