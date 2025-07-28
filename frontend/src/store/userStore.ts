import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const createPersistConfig = () => ({
  name: 'user-storage',
  storage: {
    getItem: (name: string) => {
      try {
        const item = localStorage.getItem(name);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        const now = Date.now();
        
        // Verificar si ha expirado (1 día = 24 * 60 * 60 * 1000 ms)
        if (parsed.expiry && now > parsed.expiry) {
          localStorage.removeItem(name);
          return null;
        }
        
        return parsed.value;
      } catch (error) {
        console.error('Error al leer del storage:', error);
        return null;
      }
    },
    setItem: (name: string, value: any) => {
      try {
        const now = Date.now();
        const expiry = now + (24 * 60 * 60 * 1000); // 1 día en milliseconds
        
        const item = {
          value,
          expiry
        };
        
        localStorage.setItem(name, JSON.stringify(item));
      } catch (error) {
        console.error('Error al guardar en storage:', error);
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error('Error al eliminar del storage:', error);
      }
    }
  }
});

export const userStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    createPersistConfig()
  )
);