import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { API_BASE_URL } from '../constants/config';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  verify: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          const text = await response.text();
          console.log('Login Response:', text); 

          let data;
          try {
            data = JSON.parse(text);
          } catch(e) {
            throw new Error(`Server Error: ${text.substring(0, 50)}`);
          }
          
          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          const { accessToken } = data; 
          set({ token: accessToken });
          
          const userResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          const userText = await userResponse.text();
          let userData;
          try {
              userData = JSON.parse(userText);
          } catch(e) {
              throw new Error('Failed to parse user data');
          }
          
          if (!userResponse.ok) {
            throw new Error(userData.message || 'Failed to fetch user details');
          }
          
          set({ user: userData, isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Login failed' 
          });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          const text = await response.text();
          console.log('Register Response:', text);

          let data;
          try {
            data = JSON.parse(text);
          } catch(e) {
            throw new Error(`Server Error: ${text.substring(0, 50)}`);
          }

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          
          set({ isLoading: false });
          return data;
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed' 
          });
          throw error;
        }
      },

      verify: async (otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/users/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: otp }),
          });
          
          const text = await response.text();
          console.log('Verify Response:', text);

          let data;
          try {
            data = JSON.parse(text);
          } catch(e) {
             throw new Error(`Server Error: ${text.substring(0, 50)}`);
          }

          if (!response.ok) {
            throw new Error(data.message || 'Verification failed');
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Verification failed' 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token;
          if (token) {
            await fetch(`${API_BASE_URL}/users/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
          set({ user: null, token: null, isLoading: false });
        } catch (error: any) {
          set({ user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
