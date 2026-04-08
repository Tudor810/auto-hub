import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { IAuthUser } from '@auto-hub/shared/types/userTypes';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/utils/api';
import { router } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,  
  }),
});


async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return undefined;
    }
    
    // IMPORTANT: Make sure you have your projectId in app.json for this to work in production
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

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
  const [token, setTokenState] = useState<string | null>(null);

  const handlePushTokenRegistration = async (authToken: string | null) => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        console.log("Got Push Token:", pushToken);
        // Send this token to your backend to save it on the User model
        await fetch(`${API_BASE_URL}/api/auth/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          credentials: 'include',
          body: JSON.stringify({ pushToken })
        });
      }
    } catch (error) {
      console.error("Failed to register push token:", error);
    }
  };

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

          handlePushTokenRegistration(storedToken);

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

    handlePushTokenRegistration(newToken);
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