import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { IAuthUser } from '@auto-hub/shared/types/userTypes';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/utils/api';
import { router } from 'expo-router';

// 1. Funcțiile de Storage (FĂRĂ setToken aici, ele doar manipulează memoria telefonului/browserului)
const setStorageItemAsync = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch (e) { console.error('Local storage unavailable', e); }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(key); } catch (e) { console.error('Local storage unavailable', e); }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// 2. Interfața Contextului
interface AuthContextType {
  user: IAuthUser | null;
  isLoading: boolean;
  token: string | null; // <-- Tokenul expus
  login: (userData: IAuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<IAuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider-ul
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Am adăugat tipul corect pentru token
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log("Checking login status...");
        
        // Luăm tokenul salvat
        const storedToken = await getStorageItemAsync('userToken');

        // Dacă nu avem token deloc (pe mobil), nu are rost să facem fetch
        if (!storedToken && Platform.OS !== 'web') {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          console.log(userData);
          
          setUser(userData.user); 
          setTokenState(storedToken); // <-- Actualizăm state-ul token-ului aici!
          setStorageItemAsync('userData', JSON.stringify(userData.user)); 

        } else {
          // Token expirat/invalid
          await deleteStorageItemAsync('userToken');
          setUser(null);
          setTokenState(null);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Funcția de Login
  const login = async (userData: IAuthUser, newToken: string) => {
    await setStorageItemAsync('userToken', newToken);
    await setStorageItemAsync('userData', JSON.stringify(userData));
    setUser(userData);
    setTokenState(newToken); // <-- Actualizăm token-ul în state
  };

  // Funcția de Logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error("Eroare la logout pe server", e);
    }

    await deleteStorageItemAsync('userToken');
    await deleteStorageItemAsync('userData');
    setUser(null);
    setTokenState(null); // <-- Curățăm token-ul din state
    router.replace('/');
  };

  const updateUser = async (newDetails: Partial<IAuthUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...newDetails };
    setUser(updatedUser);
    await setStorageItemAsync('userData', JSON.stringify(updatedUser));
  };

  return (
    // <-- Am adăugat `token` în value pentru a putea fi accesat din hook-ul useAuth
    <AuthContext.Provider value={{ user, isLoading, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};