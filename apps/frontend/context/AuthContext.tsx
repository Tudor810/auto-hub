import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { IAuthUser } from '@auto-hub/shared/types/user'; 
import { Platform } from 'react-native';


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

// 1. Define the shape of your Context
interface AuthContextType {
  user: IAuthUser | null;
  isLoading: boolean;
  login: (userData: IAuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<IAuthUser>) => Promise<void>;
}

// 2. Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is already logged in when the app boots up
  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const token = await getStorageItemAsync('userToken');
        const storedUser = await getStorageItemAsync('userData');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        setIsLoading(false); // Tell the app we finished checking
      }
    };

    checkLoginState();
  }, []);

  // The Login function: Saves to state AND SecureStore
  const login = async (userData: IAuthUser, token: string) => {
    await setStorageItemAsync('userToken', token);
    await setStorageItemAsync('userData', JSON.stringify(userData));
    setUser(userData);
  };

  // The Logout function: Clears state AND SecureStore
  const logout = async () => {
    await deleteStorageItemAsync('userToken');
    await deleteStorageItemAsync('userData');
    setUser(null);
  };

  const updateUser = async (newDetails: Partial<IAuthUser>) => {
    if (!user) return;

    const updatedUser = { ...user, ...newDetails };
    
    setUser(updatedUser);
    await setStorageItemAsync('userData', JSON.stringify(updatedUser));
  };
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Create a custom hook to make consuming the context super easy
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};